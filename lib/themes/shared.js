/**
 * shared.js —— 主题包共享常量与工具。
 *
 * 字体栈、字体 token 批量填充、单主题定义的通用形状。
 * 每套主题文件导出 { dark?, light?, meta }：
 *   - dark / light：`--dsw-*` token → CSS 值 的映射（不含字体批量 token，注册前填充）
 *   - meta：画廊展示元数据（id / scheme / label / desc / swatch / mono）
 */

/** Berkeley Mono 等宽栈（opencode "everything is code"）。 */
export const MONO = '"Berkeley Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
/** 通用系统无衬线栈（GitHub / NVIDIA）。 */
export const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'
/** Linear 的 Inter 栈。 */
export const INTER = '"Inter Variable", "Inter", "SF Pro Display", -apple-system, system-ui, "Segoe UI", Roboto, sans-serif'
/** Notion 的 NotionInter 栈。 */
export const NOTION = '"NotionInter", "Inter", -apple-system, system-ui, Helvetica, Arial, sans-serif'
/** Claude 的 Anthropic Sans 栈。 */
export const CLAUDE_SANS = '"Anthropic Sans", "Arial", system-ui, -apple-system, sans-serif'

/** UI 文本字体 token 前缀集合（base-16 / l-20 / … / xxxs-strong-11）。 */
export const TEXT_STYLE_KEYS = [
  'base-16', 'base-strong-16',
  'l-20', 'm-18',
  's-14', 's-strong-14',
  'xl-24',
  'xs-13', 'xs-strong-13',
  'xxs-12', 'xxs-strong-12',
  'xxxs-11', 'xxxs-strong-11'
]

/** Markdown 渲染字体 token 前缀集合。 */
export const MD_STYLE_KEYS = [
  'base', 'base-italic', 'base-strong', 'base-strong-italic',
  'small', 'small-italic', 'small-strong', 'small-strong-italic',
  'code', 'code-block', 'code-block-small',
  'h1', 'h2', 'h3', 'h4',
  'table', 'table-head'
]

/**
 * 把字体批量 token 填充进一份 token 映射（原地修改）。
 * mono 主题全部走 MONO；其他主题用传入的 font 栈（code 系仍走 MONO）。
 */
export function fillFontTokens(tokens, font, mono = false) {
  const ui = mono ? MONO : font
  for (const s of TEXT_STYLE_KEYS) tokens[`--dsw-font-${s}-font-family`] = ui
  for (const m of MD_STYLE_KEYS) {
    const isCode = m === 'code' || m === 'code-block' || m === 'code-block-small'
    tokens[`--dsw-font-markdown-${m}-font-family`] = isCode ? MONO : ui
  }
  return tokens
}

/** 阴影扁平化（opencode / Linear / NVIDIA / GitHub 暗色的纯 border 深度观感）。 */
export const FLAT_SHADOWS = {
  '--dsw-shadow-lv1': 'none',
  '--dsw-shadow-lv2': 'none',
  '--dsw-shadow-lv3': 'none',
  '--dsw-shadow-lv1-blur': '0px'
}
