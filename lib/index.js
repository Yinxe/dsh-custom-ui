/**
 * @dshp-inx/custom-ui host half —— 标准 DSH Bundle 插件包。
 * 挂载：~/.dsh/profiles/web/cordis.patch.yml（bundle patch 自动插入）
 *
 * DSH 定制 UI 套件的持久化与文件服务 Host 半。模块：
 *   - 主题画廊（themeId）：官方 ui-theme schema 只认 light/dark/system，
 *     自定义主题 id 只写内存——本命名空间补上持久化；
 *   - 背景与外观（wallpaper / glass / radius）：壁纸文件管理 + 静态服务，
 *     毛玻璃与全局圆角配置。
 *
 * 路由（全部同源校验）：
 *   GET  /ext/dshp-inx-custom-ui/state        → { ok, themeId, wallpaper, glass, radius }
 *   POST /ext/dshp-inx-custom-ui/theme       { themeId }            → { ok, themeId }
 *   POST /ext/dshp-inx-custom-ui/config      { wallpaper?|glass?|radius? } → { ok, … }
 *   GET  /ext/dshp-inx-custom-ui/wallpapers  → { ok, files: [{name,size,type}] }
 *   POST /ext/dshp-inx-custom-ui/wallpaper   (multipart) 上传 → { ok, name }
 *   POST /ext/dshp-inx-custom-ui/wallpaper-delete { name } → { ok }
 *   prefix /ext/dshp-inx-custom-ui/file/     → 壁纸静态文件服务（含 ETag 缓存）
 *
 * 壁纸目录：~/.dsh/custom-ui/wallpapers/（createDirectory 递归）。
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

export const name = '@dshp-inx-custom-ui'
export const inject = ['webServer']

/* ── DSH 0.1.2-rc.1 适配：@deepseek-ai/dsh-settings 不再导出
 * settingsNamespace / installSettingsSection（0.1.1-rc.2 及以前有）。
 * settingsNamespace 只是 kebab-case 校验，本地内联；installSettingsSection
 * 改用 settings 服务的 installSection 方法（官方 dsh-bash-local 同款写法）。── */

const NAMESPACE_PATTERN = /^[a-z][a-z0-9-]*$/

function settingsNamespace(value) {
  if (!NAMESPACE_PATTERN.test(value)) throw new TypeError(`settings namespace "${value}" must match ${String(NAMESPACE_PATTERN)}`)
  return value
}

/* ── 官方 settings 命名空间与 schema（settings.yaml: dshp-inx-custom-ui）── */
export const NS = settingsNamespace('dshp-inx-custom-ui')

/** 默认值（settings base 层）。 */
const DEFAULT_CONFIG = {
  themeId: '',
  wallpaper: { type: 'none', file: '', blur: 0, dim: 0 },
  glass: { enabled: false, strength: 14 },
  radius: { global: -1 }
}

export const ConfigSchema = z.object({
  themeId: z.string().default(''),
  wallpaper: z.object({
    type: z.union([z.const('none'), z.const('image'), z.const('video')]).default('none'),
    file: z.string().default(''),
    blur: z.number().step(1).min(0).max(40).default(0),
    dim: z.number().step(0.05).min(0).max(0.8).default(0)
  }).default({ type: 'none', file: '', blur: 0, dim: 0 }),
  glass: z.object({
    enabled: z.boolean().default(false),
    strength: z.number().step(1).min(0).max(40).default(14)
  }).default({ enabled: false, strength: 14 }),
  radius: z.object({
    global: z.number().step(1).min(-1).max(24).default(-1)
  }).default({ global: -1 })
})

/** 本插件支持的全部主题 id（与 client.js 的 THEMES 同源；未知 id 视为空）。 */
const KNOWN_THEME_IDS = new Set([
  'opencode-terminal-dark',
  'opencode-terminal-light',
  'linear-dark',
  'notion-light',
  'claude-parchment-light',
  'nvidia-dark',
  'github-dark',
  'github-light'
])

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

function sanitizeThemeId(value) {
  if (typeof value !== 'string') return ''
  const v = value.trim()
  return KNOWN_THEME_IDS.has(v) ? v : ''
}

/** 文件名白名单校验：仅允许本目录下的一级文件名，杜绝路径穿越。 */
function safeWallpaperName(value) {
  if (typeof value !== 'string') return null
  const name = path.basename(value.trim())
  if (name.length === 0 || name.startsWith('.')) return null
  const ext = path.extname(name).toLowerCase()
  if (!EXT_KIND.has(ext)) return null
  return name
}

/** settings 层的对象字段深清洗：只保留已知键并逐叶子收敛到合法域。 */
function sanitizeWallpaper(value) {
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
  return Object.keys(out).length > 0 ? out : null
}

function sanitizeGlass(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null
  const out = {}
  if (Object.hasOwn(value, 'enabled')) out.enabled = value.enabled === true
  if (Object.hasOwn(value, 'strength')) {
    const n = Number(value.strength)
    if (Number.isFinite(n)) out.strength = Math.min(40, Math.max(0, Math.round(n)))
  }
  return Object.keys(out).length > 0 ? out : null
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

export function apply(ctx) {
  /* composition entry 默认值（无用户层覆盖时生效） */
  const entry = structuredCloneish(DEFAULT_CONFIG)

  /* 官方 settings：当前生效配置源（DSH 0.1.2-rc.1+ 的官方接线方式） */
  let current = () => entry
  ctx.inject(['settings'], (sctx) => {
    sctx.settings.installSection(ctx, NS, ConfigSchema, entry, {
      setSource: (src) => { current = src },
      onChange: () => {}
    })
  })

  function structuredCloneish(v) {
    return JSON.parse(JSON.stringify(v))
  }

  function readConfig() {
    try {
      const v = current()
      if (v && typeof v === 'object') return v
    } catch { /* 读失败按默认 */ }
    return entry
  }

  async function writeConfig(patch) {
    const settings = ctx.get('settings')
    if (!settings) throw new Error('settings 服务不可用，无法持久化定制 UI 配置')
    await settings.update(NS, patch)
  }

  /* ── 同源 JSON 路由工具 ── */
  const json = (res, status, value) => {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(value))
  }

  /** 拦截跨站调用：无 Origin 头（同源 GET）或 Origin 与 Host 一致才放行。 */
  const sameOrigin = (req) => {
    const origin = req.headers.origin
    if (origin === undefined) return true
    const host = req.headers.host
    return origin === `http://${host}` || origin === `https://${host}`
  }

  const readBody = (req, limit = 8 * 1024 * 1024) => new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error('payload-too-large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })

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

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/state',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method not allowed' })
      const cfg = readConfig()
      return json(res, 200, {
        ok: true,
        themeId: sanitizeThemeId(cfg.themeId),
        wallpaper: cfg.wallpaper || DEFAULT_CONFIG.wallpaper,
        glass: cfg.glass || DEFAULT_CONFIG.glass,
        radius: cfg.radius || DEFAULT_CONFIG.radius
      })
    }
  }), 'dshp-inx-custom-ui: state route')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/theme',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' })
      let body = {}
      try { body = JSON.parse((await readBody(req)).toString('utf8') || '{}') } catch (error) {
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
        const cfg = readConfig()
        return json(res, 200, { ok: true, themeId, wallpaper: cfg.wallpaper, glass: cfg.glass, radius: cfg.radius })
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
      try { body = JSON.parse((await readBody(req)).toString('utf8') || '{}') } catch (error) {
        if (error && error.message === 'payload-too-large') return json(res, 200, { ok: false, error: '请求体过大' })
        return json(res, 200, { ok: false, error: '请求体不是合法 JSON' })
      }
      const a = body && typeof body === 'object' && !Array.isArray(body) ? body : {}
      const patch = {}
      const wp = sanitizeWallpaper(a.wallpaper)
      if (wp) patch.wallpaper = wp
      const gl = sanitizeGlass(a.glass)
      if (gl) patch.glass = gl
      const rd = sanitizeRadius(a.radius)
      if (rd) patch.radius = rd
      try {
        if (Object.keys(patch).length > 0) await writeConfig(patch)
        const cfg = readConfig()
        return json(res, 200, { ok: true, themeId: sanitizeThemeId(cfg.themeId), wallpaper: cfg.wallpaper, glass: cfg.glass, radius: cfg.radius })
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
        const buf = await readBody(req, 100 * 1024 * 1024)
        /* 简易 multipart 解析：找第一个边界后取 headers 与内容；类型/大小按扩展名白名单校验。 */
        const contentType = req.headers['content-type'] || ''
        const m = /boundary=(.+)$/.exec(contentType)
        if (!m) return json(res, 200, { ok: false, error: '缺少 multipart boundary' })
        const boundary = Buffer.from('--' + m[1])
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
        const end = content.indexOf(Buffer.from('\r\n' + '--' + m[1]))
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
      try { body = JSON.parse((await readBody(req)).toString('utf8') || '{}') } catch {
        return json(res, 200, { ok: false, error: '请求体不是合法 JSON' })
      }
      const name = safeWallpaperName(body && body.name)
      if (!name) return json(res, 200, { ok: false, error: '非法文件名' })
      try {
        await fsp.rm(path.join(WALLPAPER_DIR, name), { force: true })
        /* 被删文件若正是当前壁纸，同步清掉配置引用，client 半随之回 none。 */
        const cfg = readConfig()
        const wp = cfg.wallpaper
        if (wp && wp.file === name) {
          await writeConfig({ wallpaper: { type: 'none', file: '', blur: wp.blur, dim: wp.dim } })
        }
        return json(res, 200, { ok: true })
      } catch (error) {
        return json(res, 200, { ok: false, error: String((error && error.message) || error) })
      }
    }
  }), 'dshp-inx-custom-ui: wallpaper delete route')

  /* 壁纸静态文件服务：prefix 路由，ETag 弱缓存，读文件流式回给浏览器。
   * 同源校验放宽为 Referer 兜底（<video>/<img> 标签请求可能不带 Origin）。 */
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
        const data = await fsp.readFile(filePath)
        res.end(data)
      } catch {
        res.writeHead(404)
        res.end()
      }
    }
  }), 'dshp-inx-custom-ui: wallpaper file route')
}
