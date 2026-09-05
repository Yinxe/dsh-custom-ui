/**
 * @dshp-inx/custom-ui host half —— 标准 DSH Bundle 插件包。
 * 挂载：~/.dsh/profiles/web/cordis.patch.yml（bundle patch 自动插入）
 *
 * DSH 定制 UI 套件的持久化 Host 半。模块：
 *   - 主题画廊（themeId）：官方 ui-theme schema 只认 light/dark/system，
 *     自定义主题配色经 client 半 overrideTokens 覆盖层生效——本命名空间
 *     只持久化「选了哪套」；
 *   - 背景管线（background.*）：图片/视频壁纸文件管理 + 静态服务 +
 *     模糊/压暗/毛玻璃参数。参考社区主题方案（BetterDiscord Translucence
 *     --app-bg、Obsidian workspace background snippet）：背景层垫 body 底，
 *     三列容器降透明度 + backdrop-filter 磨砂露出背景，设置面板等浮层
 *     保持不透明；
 *   - 全局圆角（radius.global）：-1 跟随主题 / 0 全锐角 / N 统一圆润。
 *
 * 路由（全部同源校验）：
 *   GET  /ext/dshp-inx-custom-ui/state   → { ok, themeId, photoPalette, radius, wallpaper, glass, background }
 *   GET  /ext/dshp-inx-custom-ui/themes  → { ok, count, themes }（主题目录全量 token，
 *     client 按需拉取 —— client 只存 meta，token 单源 lib/themes，不再内联）
 *   POST /ext/dshp-inx-custom-ui/theme  { themeId }  → { ok, ...snapshot }
 *   POST /ext/dshp-inx-custom-ui/config { radius?|photoPalette?|background?|glass? }  → { ok, ...snapshot }
 *   GET  /ext/dshp-inx-custom-ui/wallpapers  → { ok, files: [{name,size,type}] }
 *   POST /ext/dshp-inx-custom-ui/wallpaper   (multipart) 上传 → { ok, name, size, type }
 *   POST /ext/dshp-inx-custom-ui/wallpaper-delete { name } → { ok }
 *   prefix /ext/dshp-inx-custom-ui/file/     → 壁纸静态文件服务（含 ETag 缓存）
 *
 * 壁纸目录：~/.dsh/custom-ui/wallpapers/（递归创建）。
 * 上传白名单：image/(png|jpeg|gif|webp|avif|bmp) 与 video/(mp4|webm)，
 * 大小上限：图片 24MB / 视频 96MB。
 *
 * 持久化（对齐本地插件规范：settings.yaml 顶层 `dshp-inx-custom-ui` 命名空间）。
 */

import z from '@deepseek-ai/schemastery'
import { promises as fsp } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { settingsNamespace, json, sameOrigin, readBody } from './shared.js'
import { THEME_IDS, THEME_CATALOG } from './themes/index.js'

export const name = '@dshp-inx/custom-ui'
export const inject = ['webServer']

// NOTE：settings 接线与同源路由三件套见 ./shared.js（六插件逐字相同）。

/* ── 官方 settings 命名空间与 schema（settings.yaml: dshp-inx-custom-ui）── */
export const NS = settingsNamespace('dshp-inx-custom-ui')

/** 默认值（settings base 层）。 */
const DEFAULT_CONFIG = {
  themeId: '',
  photoPalette: null,
  radius: { global: -1 },
  /* 背景：type none=关闭 / image / video；file 指向 wallpapers 目录文件名。
   * 覆盖层：containerAlpha 侧栏/详情列不透明度（0.4–1）；centerAlpha 中列
   * （0.6–1）；blur 壁纸模糊 px；dim 壁纸压暗；glass 毛玻璃磨砂强度 0=off。
   * 旧 wallpaper./glass. 字段退役后仅做不透明透传，不再有 UI 写入。 */
  background: { type: 'none', file: '', blur: 0, dim: 0, glass: 0, containerAlpha: 84, centerAlpha: 92 },
  wallpaper: {},
  glass: {}
}

export const ConfigSchema = z.object({
  themeId: z.string().default(''),
  photoPalette: z.union([
    z.object({
      accent: z.string().pattern(/^#[0-9a-fA-F]{6}$/),
      companionA: z.string().pattern(/^#[0-9a-fA-F]{6}$/),
      companionB: z.string().pattern(/^#[0-9a-fA-F]{6}$/)
    }),
    z.const(null)
  ]).default(null),
  radius: z.object({
    global: z.number().step(1).min(-1).max(24).default(-1)
  }).default({ global: -1 }),
  background: z.object({
    type: z.union([z.const('none'), z.const('image'), z.const('video')]).default('none'),
    file: z.string().default(''),
    blur: z.number().step(1).min(0).max(40).default(0),
    dim: z.number().step(0.05).min(0).max(0.8).default(0),
    glass: z.number().step(1).min(0).max(24).default(0),
    containerAlpha: z.number().step(1).min(40).max(100).default(84),
    centerAlpha: z.number().step(1).min(60).max(100).default(92)
  }).default(DEFAULT_CONFIG.background),
  wallpaper: z.dict(z.any()).default({}),
  glass: z.dict(z.any()).default({})
})

/**
 * 本插件支持的全部主题 id：主题目录（lib/themes/index.js）+ 虚拟的
 * photo:custom（壁纸取色 MD3 运行时主题）。未知 id 视为空（回内置）。
 */
const KNOWN_THEME_IDS = new Set([...THEME_IDS, 'photo:custom'])

function sanitizeThemeId(value) {
  if (typeof value !== 'string') return ''
  const v = value.trim()
  return KNOWN_THEME_IDS.has(v) ? v : ''
}

const HEX6 = /^#[0-9a-fA-F]{6}$/
function sanitizePhotoPalette(value) {
  if (value === null) return null
  if (typeof value !== 'object' || Array.isArray(value)) return null
  const { accent, companionA, companionB } = value
  if (typeof accent !== 'string' || !HEX6.test(accent)) return null
  if (typeof companionA !== 'string' || !HEX6.test(companionA)) return null
  if (typeof companionB !== 'string' || !HEX6.test(companionB)) return null
  return { accent, companionA, companionB }
}

function sanitizeRadius(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null
  const out = {}
  if (Object.hasOwn(value, 'global')) {
    const n = Number(value.global)
    if (Number.isFinite(n)) out.global = Math.min(24, Math.max(-1, Math.round(n)))
  }
  return Object.keys(out).length > 0 ? out : null
}

function sanitizeOpaque(value) {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) return value
  return {}
}

/* ── 壁纸文件服务（目录、白名单、限量）── */

const WALLPAPER_DIR = path.join(os.homedir(), '.dsh', 'custom-ui', 'wallpapers')

/** 文件类型判定：内容无关，仅按扩展名归档（静态目录只由本插件写入）。 */
const EXT_KIND = new Map([
  ['.png', 'image'], ['.jpg', 'image'], ['.jpeg', 'image'], ['.gif', 'image'],
  ['.webp', 'image'], ['.avif', 'image'], ['.bmp', 'image'],
  ['.mp4', 'video'], ['.webm', 'video']
])
const MIME = new Map([
  ['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'], ['.webp', 'image/webp'], ['.avif', 'image/avif'],
  ['.bmp', 'image/bmp'], ['.mp4', 'video/mp4'], ['.webm', 'video/webm']
])
const MAX_BYTES = { image: 24 * 1024 * 1024, video: 96 * 1024 * 1024 }

/** 文件名白名单校验：仅允许本目录下的一级文件名，杜绝路径穿越。 */
function safeWallpaperName(value) {
  if (typeof value !== 'string') return null
  const name = path.basename(value.trim())
  if (name.length === 0 || name.startsWith('.')) return null
  const ext = path.extname(name).toLowerCase()
  if (!EXT_KIND.has(ext)) return null
  return name
}

/** 背景 settings 层收敛：已知键逐叶子压回合法域；返回 null 表示「对象存在但无一个合法键」。 */
function sanitizeBackground(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null
  const out = {}
  if (Object.hasOwn(value, 'type')) out.type = ['none', 'image', 'video'].includes(value.type) ? value.type : 'none'
  if (Object.hasOwn(value, 'file')) {
    const name = safeWallpaperName(value.file)
    out.file = name || ''
  }
  if (Object.hasOwn(value, 'blur')) {
    const n = Number(value.blur)
    if (Number.isFinite(n)) out.blur = Math.min(40, Math.max(0, Math.round(n)))
  }
  if (Object.hasOwn(value, 'dim')) {
    const n = Number(value.dim)
    if (Number.isFinite(n)) out.dim = Math.min(0.8, Math.max(0, Math.round(n * 20) / 20))
  }
  if (Object.hasOwn(value, 'glass')) {
    const n = Number(value.glass)
    if (Number.isFinite(n)) out.glass = Math.min(24, Math.max(0, Math.round(n)))
  }
  if (Object.hasOwn(value, 'containerAlpha')) {
    const n = Number(value.containerAlpha)
    if (Number.isFinite(n)) out.containerAlpha = Math.min(100, Math.max(40, Math.round(n)))
  }
  if (Object.hasOwn(value, 'centerAlpha')) {
    const n = Number(value.centerAlpha)
    if (Number.isFinite(n)) out.centerAlpha = Math.min(100, Math.max(60, Math.round(n)))
  }
  return Object.keys(out).length > 0 ? out : null
}

export function apply(ctx, rawConfig) {
  /* composition entry 默认值 ← patch 覆盖（settings 的 base 层；与其它五插件同模板） */
  const entry = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
  if (rawConfig !== null && typeof rawConfig === 'object' && !Array.isArray(rawConfig)) {
    if (typeof rawConfig.themeId === 'string') entry.themeId = sanitizeThemeId(rawConfig.themeId)
    if (Object.hasOwn(rawConfig, 'photoPalette')) {
      const pal = sanitizePhotoPalette(rawConfig.photoPalette)
      if (pal !== null || rawConfig.photoPalette === null) entry.photoPalette = pal
    }
    if (rawConfig.radius !== null && typeof rawConfig.radius === 'object') {
      const rd = sanitizeRadius(rawConfig.radius)
      if (rd && typeof rd.global === 'number') entry.radius = { ...entry.radius, ...rd }
    }
    if (rawConfig.background !== null && typeof rawConfig.background === 'object') {
      const bg = sanitizeBackground(rawConfig.background)
      if (bg) entry.background = { ...entry.background, ...bg }
    }
  }

  /* 官方 settings：当前生效配置源（DSH 0.1.2-rc.1+ 的官方接线方式） */
  let current = () => entry
  ctx.inject(['settings'], (sctx) => {
    sctx.settings.installSection(ctx, NS, ConfigSchema, entry, {
      setSource: (src) => { current = src },
      onChange: () => {}
    })
  })

  function readConfig() {
    try {
      const v = current()
      if (v && typeof v === 'object') {
        return {
          themeId: typeof v.themeId === 'string' ? sanitizeThemeId(v.themeId) : '',
          photoPalette: sanitizePhotoPalette(v.photoPalette),
          radius: v.radius && typeof v.radius === 'object' ? v.radius : entry.radius,
          background: sanitizeBackground(v.background) || entry.background,
          wallpaper: sanitizeOpaque(v.wallpaper),
          glass: sanitizeOpaque(v.glass)
        }
      }
    } catch { /* 读失败按默认 */ }
    return { ...entry }
  }

  function snapshot() {
    const cfg = readConfig()
    return {
      themeId: cfg.themeId,
      photoPalette: cfg.photoPalette,
      radius: cfg.radius,
      background: cfg.background,
      wallpaper: cfg.wallpaper,
      glass: cfg.glass
    }
  }

  async function writeConfig(patch) {
    const settings = ctx.get('settings')
    if (!settings) throw new Error('settings 服务不可用，无法持久化定制 UI 配置')
    await settings.update(NS, patch)
  }

  /* ── 壁纸目录工具 ── */

  async function ensureWallpaperDir() {
    await fsp.mkdir(WALLPAPER_DIR, { recursive: true })
  }

  /** 列目录里的壁纸文件（静默容忍个别文件 stat 失败）。 */
  async function listWallpapers() {
    await ensureWallpaperDir()
    const names = await fsp.readdir(WALLPAPER_DIR)
    const files = []
    for (const name of names) {
      const ext = path.extname(name).toLowerCase()
      const kind = EXT_KIND.get(ext)
      if (!kind) continue
      try {
        const stat = await fsp.stat(path.join(WALLPAPER_DIR, name))
        if (!stat.isFile()) continue
        files.push({ name, size: stat.size, type: kind })
      } catch { /* 跳过失效项 */ }
    }
    files.sort((a, b) => a.name.localeCompare(b.name))
    return files
  }

  /** 选中的背景文件若已不存在（被删/被外部清理），配置回 none。 */
  async function reconcileBackgroundFile() {
    const cfg = readConfig()
    const bg = cfg.background
    if (bg.type === 'none' || !bg.file) return
    try {
      const stat = await fsp.stat(path.join(WALLPAPER_DIR, bg.file))
      if (stat.isFile()) return
    } catch { /* 文件没了，清引用 */ }
    await writeConfig({ background: { ...bg, type: 'none', file: '' } })
  }

  /* ── 同源 JSON 路由（三件套见 ./shared.js）── */

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/state',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method not allowed' })
      try { await reconcileBackgroundFile() } catch { /* 对账失败按已存配置下发 */ }
      return json(res, 200, { ok: true, ...snapshot() })
    }
  }), 'dshp-inx-custom-ui: state route')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/themes',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method not allowed' })
      return json(res, 200, { ok: true, count: THEME_CATALOG.length, themes: THEME_CATALOG })
    }
  }), 'dshp-inx-custom-ui: themes route')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/theme',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' })
      let body = {}
      try { body = JSON.parse(await readBody(req) || '{}') } catch (error) {
        if (error && error.message === 'payload-too-large') return json(res, 200, { ok: false, error: '请求体过大' })
        return json(res, 200, { ok: false, error: '请求体不是合法 JSON' })
      }
      const raw = body && typeof body === 'object' && !Array.isArray(body) ? body.themeId : ''
      const themeId = sanitizeThemeId(raw)
      if (typeof raw !== 'string' || (raw.trim().length > 0 && themeId === '')) {
        return json(res, 200, { ok: false, error: '未知主题 id，请更新插件后重试' })
      }
      try {
        await writeConfig({ themeId })
        return json(res, 200, { ok: true, ...snapshot() })
      } catch (error) {
        return json(res, 200, { ok: false, error: String((error && error.message) || error) })
      }
    }
  }), 'dshp-inx-custom-ui: theme route')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/config',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' })
      let body = {}
      try { body = JSON.parse(await readBody(req) || '{}') } catch (error) {
        if (error && error.message === 'payload-too-large') return json(res, 200, { ok: false, error: '请求体过大' })
        return json(res, 200, { ok: false, error: '请求体不是合法 JSON' })
      }
      const a = body && typeof body === 'object' && !Array.isArray(body) ? body : {}
      const patch = {}
      const rd = sanitizeRadius(a.radius)
      if (rd) patch.radius = rd
      if (Object.hasOwn(a, 'photoPalette')) {
        const pal = sanitizePhotoPalette(a.photoPalette)
        if (pal === null && a.photoPalette !== null) {
          return json(res, 200, { ok: false, error: 'photoPalette 非法（需三个 #rrggbb 色值）' })
        }
        patch.photoPalette = pal
      }
      if (Object.hasOwn(a, 'background')) {
        const bg = sanitizeBackground(a.background)
        if (bg === null) {
          return json(res, 200, { ok: false, error: 'background 非法（type/file/blur/dim/glass/containerAlpha/centerAlpha）' })
        }
        /* image/video 需文件名在 wallpapers 目录真实存在，防配置指向幽灵文件 */
        if (bg.type === 'image' || bg.type === 'video') {
          const name = safeWallpaperName(bg.file)
          if (!name) return json(res, 200, { ok: false, error: '请先选择壁纸文件' })
          try {
            const stat = await fsp.stat(path.join(WALLPAPER_DIR, name))
            if (!stat.isFile()) throw new Error('not file')
          } catch {
            return json(res, 200, { ok: false, error: '壁纸文件不存在：' + name })
          }
        }
        const cfg = readConfig()
        patch.background = { ...cfg.background, ...bg }
      }
      try {
        if (Object.keys(patch).length > 0) await writeConfig(patch)
        return json(res, 200, { ok: true, ...snapshot() })
      } catch (error) {
        return json(res, 200, { ok: false, error: String((error && error.message) || error) })
      }
    }
  }), 'dshp-inx-custom-ui: config route')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/wallpapers',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method not allowed' })
      try {
        return json(res, 200, { ok: true, files: await listWallpapers() })
      } catch (error) {
        return json(res, 200, { ok: false, error: String((error && error.message) || error) })
      }
    }
  }), 'dshp-inx-custom-ui: wallpapers list route')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/wallpaper',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' })
      try {
        /* 视频上限 96MB + multipart 头尾余量，取 100MB 读限。 */
        const buf = await readBody(req, 100 * 1024 * 1024)
        /* 简易 multipart 解析：找第一个边界后取 headers 与内容；类型/大小按扩展名白名单校验。 */
        const contentType = req.headers['content-type'] || ''
        const m = /boundary=(.+)$/.exec(contentType)
        if (!m) return json(res, 200, { ok: false, error: '缺少 multipart boundary' })
        const boundary = '--' + m[1]
        const start = buf.indexOf(boundary)
        if (start === -1) return json(res, 200, { ok: false, error: 'multipart 格式错误' })
        const headerEnd = buf.indexOf('\r\n\r\n', start)
        if (headerEnd === -1) return json(res, 200, { ok: false, error: 'multipart 缺少文件头' })
        const headerText = buf.slice(start, headerEnd).toString('utf8')
        const nameMatch = /filename="([^"]+)"/.exec(headerText)
        if (!nameMatch) return json(res, 200, { ok: false, error: '未找到文件名' })
        const rawName = path.basename(nameMatch[1])
        const name = safeWallpaperName(rawName)
        if (!name) return json(res, 200, { ok: false, error: '不支持的文件类型（仅图片 png/jpg/gif/webp/avif/bmp 或视频 mp4/webm）' })
        const kind = EXT_KIND.get(path.extname(name).toLowerCase())
        let content = buf.slice(headerEnd + 4)
        const end = content.indexOf('\r\n--' + m[1])
        if (end !== -1) content = content.slice(0, end)
        if (content.length === 0) return json(res, 200, { ok: false, error: '文件内容为空' })
        if (content.length > MAX_BYTES[kind]) {
          return json(res, 200, { ok: false, error: `文件超过大小上限（${kind === 'video' ? 96 : 24}MB）` })
        }
        await ensureWallpaperDir()
        await fsp.writeFile(path.join(WALLPAPER_DIR, name), content)
        return json(res, 200, { ok: true, name, size: content.length, type: kind })
      } catch (error) {
        if (error && error.message === 'payload-too-large') {
          return json(res, 200, { ok: false, error: '文件超过大小上限（100MB）' })
        }
        return json(res, 200, { ok: false, error: String((error && error.message) || error) })
      }
    }
  }), 'dshp-inx-custom-ui: wallpaper upload route')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/wallpaper-delete',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' })
      let body = {}
      try { body = JSON.parse(await readBody(req) || '{}') } catch (error) {
        if (error && error.message === 'payload-too-large') return json(res, 200, { ok: false, error: '请求体过大' })
        return json(res, 200, { ok: false, error: '请求体不是合法 JSON' })
      }
      const name = safeWallpaperName(body && body.name)
      if (!name) return json(res, 200, { ok: false, error: '非法文件名' })
      try {
        await fsp.rm(path.join(WALLPAPER_DIR, name), { force: true })
        /* 被删文件若正是当前背景，同步清掉配置引用，client 半随之回 none。 */
        const cfg = readConfig()
        const bg = cfg.background
        if (bg && bg.file === name) {
          await writeConfig({ background: { ...bg, type: 'none', file: '' } })
        }
        return json(res, 200, { ok: true })
      } catch (error) {
        return json(res, 200, { ok: false, error: String((error && error.message) || error) })
      }
    }
  }), 'dshp-inx-custom-ui: wallpaper delete route')

  /* 壁纸静态文件服务：prefix 路由，ETag 弱缓存，读文件回给浏览器。
   * 同源校验放宽：无 Origin 头（<video>/<img> 标签请求可能不带 Origin）本就放行，
   * 带 Origin 的非同源拒绝 —— 与官方 /ext 静态策略一致。 */
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/ext/dshp-inx-custom-ui/file',
    handler: async (req, res) => {
      const url = new URL(req.url, 'http://localhost')
      const name = safeWallpaperName(decodeURIComponent(url.pathname.slice('/ext/dshp-inx-custom-ui/file/'.length)))
      if (!name) { res.writeHead(404); res.end(); return }
      const filePath = path.join(WALLPAPER_DIR, name)
      try {
        const stat = await fsp.stat(filePath)
        if (!stat.isFile()) { res.writeHead(404); res.end(); return }
        const etag = '"' + crypto.createHash('sha1').update(name + ':' + stat.size + ':' + stat.mtimeMs).digest('hex').slice(0, 16) + '"'
        if (req.headers['if-none-match'] === etag) {
          res.writeHead(304, { etag })
          res.end()
          return
        }
        res.writeHead(200, {
          'content-type': MIME.get(path.extname(name).toLowerCase()) || 'application/octet-stream',
          'content-length': String(stat.size),
          'cache-control': 'private, max-age=3600',
          etag
        })
        /* 视频走 206 Range 支持太重——全量读回；本地文件 + max-age 缓存已够顺滑。 */
        const data = await fsp.readFile(filePath)
        res.end(data)
      } catch {
        res.writeHead(404)
        res.end()
      }
    }
  }), 'dshp-inx-custom-ui: wallpaper file route')
}
