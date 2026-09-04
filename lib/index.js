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
 *   GET  /ext/dshp-inx-custom-ui/state   → { ok, themeId, radius }
 *   POST /ext/dshp-inx-custom-ui/theme  { themeId }  → { ok, themeId, radius }
 *   POST /ext/dshp-inx-custom-ui/config { radius? }  → { ok, themeId, radius }
 *
 * 持久化（对齐本地插件规范：settings.yaml 顶层 `dshp-inx-custom-ui` 命名空间）。
 */

import z from '@deepseek-ai/schemastery'

export const name = '@dshp-inx/custom-ui'
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
  photoPalette: null,
  radius: { global: -1 }
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
  }).default({ global: -1 })
})

/** 本插件支持的全部主题 id（与 client.js 的 THEMES 同源；未知 id 视为空）。 */
const KNOWN_THEME_IDS = new Set([
  'photo:custom',
  'opencode-terminal-dark',
  'opencode-terminal-light',
  'linear-dark',
  'notion-light',
  'claude-parchment-light',
  'nvidia-dark',
  'github-dark',
  'github-light'
])

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

export function apply(ctx) {
  /* composition entry 默认值（无用户层覆盖时生效） */
  const entry = JSON.parse(JSON.stringify(DEFAULT_CONFIG))

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
          radius: v.radius && typeof v.radius === 'object' ? v.radius : entry.radius
        }
      }
    } catch { /* 读失败按默认 */ }
    return { ...entry }
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

  const readBody = (req, limit = 1024 * 1024) => new Promise((resolve, reject) => {
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
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/state',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method not allowed' })
      const cfg = readConfig()
      return json(res, 200, { ok: true, themeId: cfg.themeId, photoPalette: cfg.photoPalette, radius: cfg.radius })
    }
  }), 'dshp-inx-custom-ui: state route')

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
        const cfg = readConfig()
        return json(res, 200, { ok: true, themeId, photoPalette: cfg.photoPalette, radius: cfg.radius })
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
        const cfg = readConfig()
        return json(res, 200, { ok: true, themeId: sanitizeThemeId(cfg.themeId), photoPalette: cfg.photoPalette, radius: cfg.radius })
      } catch (error) {
        return json(res, 200, { ok: false, error: String((error && error.message) || error) })
      }
    }
  }), 'dshp-inx-custom-ui: config route')
}
