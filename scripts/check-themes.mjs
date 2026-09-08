/**
 * check-themes.mjs —— 主题三处一致性校验（lib 目录 / Host allowlist / client 画廊）。
 *
 * token 单源 lib/themes（Host 经 GET /themes 下发，client 只存 meta），
 * 本脚本只校验 meta（id/colorScheme/label/desc/swatch）三处同源：
 *   node scripts/check-themes.mjs
 *
 * 新增主题文件后：lib/themes/index.js 加两行（import + expand），client
 * THEMES 加一条 meta（含 swatch），然后跑本脚本。CI/平时抽查都可用，
 * 不一致直接非零退出。
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = dirname(here)
const { THEME_CATALOG, THEME_IDS } = await import('../lib/themes/index.js')

let fail = 0
const bad = (msg) => { fail++; console.error('FAIL ' + msg) }

// 1. 目录自洽：id 唯一，swatch 四色齐
const seen = new Set()
for (const t of THEME_CATALOG) {
  if (seen.has(t.id)) bad('目录 id 重复：' + t.id)
  seen.add(t.id)
  if (!Array.isArray(t.swatch) || t.swatch.length < 3) bad(`目录 ${t.id} swatch 缺失`)
  if (!t.label || !t.desc || (t.colorScheme !== 'dark' && t.colorScheme !== 'light')) {
    bad(`目录 ${t.id} meta 不全`)
  }
}
console.log(`lib 目录：${THEME_CATALOG.length} 套`)

// 2. Host allowlist = 目录 + photo:custom（读 lib/index.js 源码确认动态派生）
const hostSrc = readFileSync(join(root, 'lib', 'index.js'), 'utf8')
if (!hostSrc.includes("...THEME_IDS, 'photo:custom'")) bad('Host allowlist 未从 THEME_IDS 动态派生')
if (!hostSrc.includes("path: '/ext/dshp-inx-custom-ui/themes'")) bad('Host 缺 /themes 下发路由')

// 3. client THEMES meta 与目录逐项对齐
const clientSrc = readFileSync(join(root, 'client.js'), 'utf8')
if (/tokens:\s*\w+(Dark|Light)/.test(clientSrc)) bad('client 仍内联目录 token')
if (clientSrc.includes('const GROUPS')) bad('client 残留已死的 GROUPS')
const entryRe = /\{\s*id: '([^']+)', colorScheme: '(dark|light)', label: '([^']*)', desc: '([^']*)', (?:group: '([^']+)', )?swatch: \[([^\]]*)\]/g
const clientEntries = [...clientSrc.matchAll(entryRe)]
console.log(`client 画廊：${clientEntries.length} 条`)
if (clientEntries.length !== THEME_CATALOG.length) {
  bad(`数量不一致：client ${clientEntries.length} vs lib ${THEME_CATALOG.length}`)
}
const clientIds = new Set(clientEntries.map((m) => m[1]))
for (const t of THEME_CATALOG) {
  if (!clientIds.has(t.id)) { bad('client 缺条目：' + t.id); continue }
  const m = clientEntries.find((x) => x[1] === t.id)
  if (m[2] !== t.colorScheme) bad(`${t.id} colorScheme 不一致`)
  if (m[3] !== t.label) bad(`${t.id} label 不一致`)
  if (m[4] !== t.desc) bad(`${t.id} desc 不一致`)
  const sw = m[6].split(',').map((s) => s.trim().replace(/^'|'$/g, ''))
  for (let i = 0; i < 3; i++) {
    if (sw[i] !== t.swatch[i]) bad(`${t.id} swatch[${i}] 不一致：${sw[i]} vs ${t.swatch[i]}`)
  }
}
for (const m of clientEntries) {
  if (!THEME_IDS.includes(m[1])) bad('client 多余条目：' + m[1])
}

// 4. settings 命名空间：Host 半自带 kebab-case 校验（各插件 lib/index.js 顶部独立持有）
if (!hostSrc.includes("settingsNamespace('dshp-inx-custom-ui')")) bad('Host 缺 settings 命名空间注册')
if (!hostSrc.includes('NAMESPACE_PATTERN')) bad('Host 缺命名空间 kebab-case 校验')

if (fail > 0) { console.error(`\n${fail} 项不一致`); process.exit(1) }
console.log('三处一致 ✓')
