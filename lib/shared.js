/**
 * shared.js —— Host 半共享小工具（零依赖）。
 *
 * 本地六插件（dsh-custom-ui / dsh-mcwiki-search / dsh-tavily-search /
 * dsh-token-quota / dsh-token-stats / dsh-vision-bridge）各持一份**逐字相同**
 * 的文件，不建跨包共享依赖（bundle 包各自独立发布，profile 软链即时生效）。
 *
 * - settingsNamespace：kebab-case 运行时校验。DSH 0.1.2-rc.1 起
 *   @deepseek-ai/dsh-settings 不再导出该辅助（0.1.1-rc.2 及以前有），本地内联。
 *   settings 安装统一走 settings 服务的 installSection 方法
 *   （官方 dsh-bash-local 同款写法）。
 * - json / sameOrigin / readBody：同源 JSON 路由三件套（与官方插件同策略：
 *   无 Origin 头视为同源；Origin 与 Host 一致才放行；body 限 1MB 防刷）。
 *
 * 约定：改一处就同步六处，跑一遍各包单测 + `node --check`。
 *
 * @module shared
 */

export const NAMESPACE_PATTERN = /^[a-z][a-z0-9-]*$/

export function settingsNamespace(value) {
  if (!NAMESPACE_PATTERN.test(value)) throw new TypeError(`settings namespace "${value}" must match ${String(NAMESPACE_PATTERN)}`)
  return value
}

/** JSON 应答（含 no-store：/ext 状态接口不进缓存）。 */
export function json(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(value))
}

/** 拦截跨站调用：无 Origin 头（同源 GET）或 Origin 与 Host 一致才放行。 */
export function sameOrigin(req) {
  const origin = req.headers.origin
  if (origin === undefined) return true
  const host = req.headers.host
  return origin === `http://${host}` || origin === `https://${host}`
}

/**
 * 读请求体（默认限 1MB，超限 reject Error('payload-too-large') 并销毁流）。
 * 调用方在 JSON.parse 外层区分该错误返回「请求体过大」。
 */
export function readBody(req, limit = 1024 * 1024) {
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
