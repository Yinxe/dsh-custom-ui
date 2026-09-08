/**
 * @dshp-inx/custom-ui host half —— 标准 DSH Bundle 插件包。
 * 挂载：~/.dsh/profiles/web/cordis.patch.yml（bundle patch 自动插入）
 *
 * DSH 定制 UI 套件的持久化 Host 半。模块：
 *   - 主题画廊（themeId）：官方 ui-theme schema 只认 light/dark/system，
 *     自定义主题配色经 client 半 overrideTokens 覆盖层生效——本命名空间
 *     只持久化「选了哪套」；
 *   - 全局圆角（radius.global）：-1 跟随主题 / 0 全锐角 / N 统一圆润。
 *
 * 路由（全部同源校验）：
 *   GET  /ext/dshp-inx-custom-ui/state   → { ok, themeId, photoPalette, radius, wallpaper, glass }
 *   GET  /ext/dshp-inx-custom-ui/themes  → { ok, count, themes }（主题目录全量 token，
 *     client 按需拉取 —— client 只存 meta，token 单源 lib/themes，不再内联）
 *   POST /ext/dshp-inx-custom-ui/theme  { themeId }  → { ok, ...snapshot }
 *   POST /ext/dshp-inx-custom-ui/config { radius? }  → { ok, ...snapshot }
 *
 * 持久化（对齐本地插件规范：settings.yaml 顶层 `dshp-inx-custom-ui` 命名空间）。
 */

import z from '@deepseek-ai/schemastery'
/* ── 同源 JSON 路由小工具（本插件自有，零依赖；各插件独立持有，不跨包同步）── */
const NAMESPACE_PATTERN = /^[a-z][a-z0-9-]*$/
// settings 命名空间 kebab-case 运行时校验。
function settingsNamespace(value) {
  if (!NAMESPACE_PATTERN.test(value)) throw new TypeError(`settings namespace "${value}" must match ${String(NAMESPACE_PATTERN)}`)
  return value
}
// JSON 应答（含 no-store：/ext 状态接口不进缓存）。
function json(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(value))
}
// 拦截跨站调用：无 Origin 头（同源 GET）或 Origin 与 Host 一致才放行。
function sameOrigin(req) {
  const origin = req.headers.origin
  if (origin === undefined) return true
  const host = req.headers.host
  return origin === `http://${host}` || origin === `https://${host}`
}
// 读请求体（默认限 1MB，超限 reject Error('payload-too-large') 并销毁流）。
function readBody(req, limit = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error('payload-too-large'))
        try { req.destroy() } catch {}
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}
import { THEME_IDS, THEME_CATALOG } from './themes/index.js'

export const name = '@dshp-inx/custom-ui'
export const inject = ['webServer']

/* ── 官方 settings 命名空间与 schema（settings.yaml: dshp-inx-custom-ui）── */
export const NS = settingsNamespace('dshp-inx-custom-ui')

/** 默认值（settings base 层）。 */
const DEFAULT_CONFIG = {
  themeId: '',
  photoPalette: null,
  radius: { global: -1 },
  // 背景壁纸（wallpaper.*）与毛玻璃（glass.*）是已退役的旧特性：
  // 当前 client 不再读写它们，这里仅做不透明透传，避免 settings 更新时
  // 丢掉用户 settings.yaml 里的数据。受支持的取色路径是 photoPalette
  //（上传图片 → MD3 动态配色）。
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
      wallpaper: cfg.wallpaper,
      glass: cfg.glass
    }
  }

  async function writeConfig(patch) {
    const settings = ctx.get('settings')
    if (!settings) throw new Error('settings 服务不可用，无法持久化定制 UI 配置')
    await settings.update(NS, patch)
  }

  /* ── 同源 JSON 路由（小工具见本文件顶部）── */

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/state',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method not allowed' })
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
      const rd = sanitizeRadius(a.radius)
      const patch = {}
      if (rd) patch.radius = rd
      if (Object.hasOwn(a, 'photoPalette')) {
        const pal = sanitizePhotoPalette(a.photoPalette)
        if (pal === null && a.photoPalette !== null) {
          return json(res, 200, { ok: false, error: 'photoPalette 非法（需三个 #rrggbb 色值）' })
        }
        patch.photoPalette = pal
      }
      try {
        if (Object.keys(patch).length > 0) await writeConfig(patch)
        return json(res, 200, { ok: true, ...snapshot() })
      } catch (error) {
        return json(res, 200, { ok: false, error: String((error && error.message) || error) })
      }
    }
  }), 'dshp-inx-custom-ui: config route')
}
