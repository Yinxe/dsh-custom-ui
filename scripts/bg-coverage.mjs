/* bg-coverage.mjs — 验证 applyBackground 生成的覆盖层 CSS 命中全部遮挡元素。
 * 从 client.js 源码提取函数体（与运行时同一份源），stub 最小 DOM 执行，
 * 断言三列容器 + 三个内容根（会话/侧栏/chat）+ composerSeat 渐变全覆盖。
 * 用法：node scripts/bg-coverage.mjs */
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const src = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
const start = src.indexOf('function applyBackground(cfg)')
if (start === -1) throw new Error('applyBackground 未找到')
const lines = src.slice(start).split('\n')
let end = start
for (const l of lines) {
  end += l.length + 1
  if (l === '    }') break
}
const fnSrc = src.slice(start, end)
/* 在 style 创建点泄漏 css 数组，供断言用 */
const patched = fnSrc.replace(
  /const style = document\.createElement\('style'\)/,
  'globalThis.__emittedCss = css.join(String.fromCharCode(10)); var style = document.createElement(\'style\')'
)

const created = []
globalThis.document = {
  getElementById: () => null,
  createElement: (tag) => ({ tag, style: { cssText: '' }, children: [], attrs: {}, setAttribute() {}, appendChild() {} }),
  body: { prepend() {} },
  head: { appendChild() {} }
}

/* 提供函数所在闭包的三个依赖（真实值与 client.js 一致） */
const DEFAULT_BG = { type: 'none', file: '', blur: 0, dim: 0, glass: 0, containerAlpha: 84, centerAlpha: 92 }
const BG_LAYER_ID = 'x'
const BG_CSS_ID = 'y'
const harness = 'const DEFAULT_BG = ' + JSON.stringify(DEFAULT_BG) + ';\n'
  + 'const BG_LAYER_ID = "x"; const BG_CSS_ID = "y";\n'
  + patched + '\nexport default (cfg) => { applyBackground(cfg); return globalThis.__emittedCss }\n'
const harnessPath = join(tmpdir(), 'dsh-custom-ui-bg-harness.mjs')
writeFileSync(harnessPath, harness)
const mod = await import('file://' + harnessPath)
const run = mod.default || mod.applyBackground

let fail = 0
const cases = [
  /* 关闭态不发射 CSS */
  ['none 不发射', { type: 'none', file: '' }, null],
  ['完整参数', { type: 'image', file: 'pic.jpg', blur: 8, dim: 0.3, glass: 12, containerAlpha: 80, centerAlpha: 90 }, {
    frame: /pI_x6G_frame\{background:color-mix\(in srgb, var\(--dsw-alias-bg-base\) 90%/,
    sidebarCol: /\.pI_x6G_sidebarCol\{position:relative;background:transparent !important\}/,
    sidebarGlass: /\.pI_x6G_sidebarCol::before\{[^\}]*backdrop-filter:blur\(12px\)/,
    sidebarRoot: /\.pI_x6G_sidebarCol>\.hHd-Xa_root\{background:color-mix\(in srgb, var\(--dsw-specific-sidebar-fill\) 80%/,
    detailsCol: /\.pI_x6G_detailsCol\{position:relative;background:transparent !important\}/,
    detailsRoot: /\.pI_x6G_detailsCol \._2ctAZa_root\{background:color-mix\(in srgb, var\(--dsw-alias-bg-base\) 80%/,
    centerCol: /\.pI_x6G_centerCol\{position:relative;background:transparent !important\}/,
    centerRoot: /\.pI_x6G_centerCol>\.wSkVaW_root\{background:color-mix\(in srgb, var\(--dsw-alias-bg-base\) 90%/,
    composerSeat: /wSkVaW_composerSeat\{background:linear-gradient/
  }],
  /* glass=0 不带 backdrop-filter */
  ['无磨砂', { type: 'video', file: 'v.mp4', glass: 0, containerAlpha: 70, centerAlpha: 88 }, {
    noGlass: (css) => !css.includes('backdrop-filter'),
    sidebarAlpha70: /sidebarCol>\.hHd-Xa_root\{background:color-mix\(in srgb, var\(--dsw-specific-sidebar-fill\) 70%/
  }]
]

for (const [name, cfg, expects] of cases) {
  const css = run(cfg)
  if (expects === null) {
    const pass = css === undefined || css === null
    if (!pass) fail++
    console.log(pass ? 'PASS' : 'FAIL', name)
    continue
  }
  for (const [k, v] of Object.entries(expects)) {
    const ok = typeof v === 'function' ? v(css) : v.test(css)
    if (!ok) fail++
    console.log(ok ? 'PASS' : 'FAIL', name + '/' + k)
  }
}

rmSync(harnessPath)
if (fail > 0) { console.error(fail + ' 项未命中'); process.exit(1) }
console.log('背景遮挡链全覆盖 ✓')
