/**
 * @dshp-inx/custom-ui host half —— 标准 DSH Bundle 插件包。
 * 挂载：~/.dsh/profiles/web/cordis.patch.yml（bundle patch 自动插入）
 *
 * 职责：主题选择的持久化。官方 theme 服务的 settings schema（ui-theme.preference）
 * 只接受 light/dark/system——自定义主题 id 只写内存，重启即丢。本 Host 半补上
 * 这一环：
 *   - 注册 `dshp-inx-custom-ui` settings 命名空间（标准 settings 存储），
 *     字段 themeId 持久化用户选中的主题 id；
 *   - 同源路由 GET /state 读、POST /theme 写，供 client 半在启动时恢复、点击时保存。
 *
 * 路由（全部同源校验）：
 *   GET  /ext/dshp-inx-custom-ui/state   → { ok, themeId }
 *   POST /ext/dshp-inx-custom-ui/theme   { themeId } → { ok, themeId }
 *
 * 持久化（对齐本地插件规范：settings.yaml 顶层 `dshp-inx-custom-ui` 命名空间）。
 */

import z from '@deepseek-ai/schemastery'
import { settingsNamespace, installSettingsSection } from '@deepseek-ai/dsh-settings'

export const name = '@dshp-inx-custom-ui'
export const inject = ['webServer']

/* ── 官方 settings 命名空间与 schema（settings.yaml: dshp-inx-custom-ui）── */
export const NS = settingsNamespace('dshp-inx-custom-ui')

/** 默认值（settings base 层）：空串表示跟随官方偏好（system/light/dark）。 */
const DEFAULT_CONFIG = { themeId: '' }

export const ConfigSchema = z.object({
  themeId: z.string().default('')
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

function sanitizeThemeId(value) {
  if (typeof value !== 'string') return ''
  const v = value.trim()
  return KNOWN_THEME_IDS.has(v) ? v : ''
}

export function apply(ctx) {
  /* composition entry 默认值（无用户层覆盖时生效） */
  const entry = { ...DEFAULT_CONFIG }

  /* 官方 settings：当前生效配置源 */
  let current = () => entry
  installSettingsSection(ctx, NS, ConfigSchema, entry, {
    setSource: (src) => { current = src },
    onChange: () => {}
  })

  function getThemeId() {
    try {
      const v = current()
      if (v && typeof v === 'object' && typeof v.themeId === 'string') return sanitizeThemeId(v.themeId)
    } catch { /* 读失败按默认 */ }
    return ''
  }

  async function setThemeId(themeId) {
    const settings = ctx.get('settings')
    if (!settings) throw new Error('settings 服务不可用，无法持久化主题选择')
    await settings.update(NS, { themeId: sanitizeThemeId(themeId) })
  }

  /* ── 同源 JSON 路由 ── */
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

  const readBody = (req) => new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/state',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method not allowed' })
      return json(res, 200, { ok: true, themeId: getThemeId() })
    }
  }), 'dshp-inx-custom-ui: state route')

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/ext/dshp-inx-custom-ui/theme',
    handler: async (req, res) => {
      if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' })
      let body = {}
      try { body = JSON.parse((await readBody(req)) || '{}') } catch {
        return json(res, 200, { ok: false, error: '请求体不是合法 JSON' })
      }
      const raw = body && typeof body === 'object' && !Array.isArray(body) ? body.themeId : ''
      const themeId = sanitizeThemeId(raw)
      if (typeof raw !== 'string' || (raw.trim().length > 0 && themeId === '')) {
        return json(res, 200, { ok: false, error: '未知主题 id，请更新插件后重试' })
      }
      try {
        await setThemeId(themeId)
        return json(res, 200, { ok: true, themeId })
      } catch (error) {
        return json(res, 200, { ok: false, error: String((error && error.message) || error) })
      }
    }
  }), 'dshp-inx-custom-ui: theme route')
}
