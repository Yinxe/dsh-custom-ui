/* custom-ui client half — hand-authored __ModuleLoader__ bundle.
 * 注册 8 套 open-design 主题到 theme 服务，并在设置面板挂「主题画廊」页：
 * 色卡预览 + 点击即切 + theme/change 驱动的实时高亮。
 * 主题 token 数据与 lib/themes/*.js 保持同步（同一来源规范）。 */
window.__ModuleLoader__.load({
  id: '@dshp-inx/custom-ui',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const React = require('react')

    /* ── 画廊样式（全部走 --dsw-* 主题 token，随主题自适应）── */
    const CSS = `
.tg-page{display:flex;flex-direction:column;gap:14px;color:var(--dsw-alias-label-primary)}
.tg-head{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.tg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.tg-card{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:14px;cursor:pointer;text-align:left;border-radius:8px;font:inherit;color:inherit;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);transition:border-color .15s,background .15s}
.tg-card:hover{background:var(--dsw-alias-interactive-bg-hover)}
.tg-card:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.tg-card.tg-active{background:var(--dsw-alias-interactive-bg-hover-accent);border:2px solid var(--dsw-alias-brand-primary)}
.tg-titleRow{display:flex;align-items:center;gap:8px}
.tg-title{font-size:13px;font-weight:600;line-height:18px}
.tg-badge{font-size:10px;padding:1px 6px;border-radius:999px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary-invert);white-space:nowrap}
.tg-swatches{display:flex;gap:4px}
.tg-swatch{display:inline-block;width:14px;height:14px;border-radius:3px;border:1px solid var(--dsw-alias-border-l2)}
.tg-desc{font-size:11px;color:var(--dsw-alias-label-tertiary);line-height:16px}
.tg-release{border:none;background:none;padding:0;font:inherit;font-size:12px;cursor:pointer;color:var(--dsw-alias-brand-primary)}
.tg-release:hover{text-decoration:underline}
.tg-release:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;border-radius:2px}
`

    /* ── 字体栈常量（与 lib/themes/shared.js 同源）── */
    const MONO = '"Berkeley Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
    const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'
    const INTER = '"Inter Variable", "Inter", "SF Pro Display", -apple-system, system-ui, "Segoe UI", Roboto, sans-serif'
    const NOTION = '"NotionInter", "Inter", -apple-system, system-ui, Helvetica, Arial, sans-serif'
    const CLAUDE_SANS = '"Anthropic Sans", "Arial", system-ui, -apple-system, sans-serif'

    const TEXT_STYLE_KEYS = ['base-16', 'base-strong-16', 'l-20', 'm-18', 's-14', 's-strong-14', 'xl-24', 'xs-13', 'xs-strong-13', 'xxs-12', 'xxs-strong-12', 'xxxs-11', 'xxxs-strong-11']
    const MD_STYLE_KEYS = ['base', 'base-italic', 'base-strong', 'base-strong-italic', 'small', 'small-italic', 'small-strong', 'small-strong-italic', 'code', 'code-block', 'code-block-small', 'h1', 'h2', 'h3', 'h4', 'table', 'table-head']

    function fillFontTokens(tokens, font, mono) {
      const ui = mono ? MONO : font
      for (const s of TEXT_STYLE_KEYS) tokens['--dsw-font-' + s + '-font-family'] = ui
      for (const m of MD_STYLE_KEYS) {
        const isCode = m === 'code' || m === 'code-block' || m === 'code-block-small'
        tokens['--dsw-font-markdown-' + m + '-font-family'] = isCode ? MONO : ui
      }
      return tokens
    }

    const FLAT = { '--dsw-shadow-lv1': 'none', '--dsw-shadow-lv2': 'none', '--dsw-shadow-lv3': 'none', '--dsw-shadow-lv1-blur': '0px' }

    /* ── 各主题 token 集（与 lib/themes/*.js 同源规范；深浅分离）── */

    const opencodeDark = fillFontTokens({
      '--dsw-alias-bg-base': '#201d1d', '--dsw-alias-bg-layer-1': '#302c2c', '--dsw-alias-bg-layer-2': '#3a3535', '--dsw-alias-bg-layer-3': '#423d3d', '--dsw-alias-bg-overlay': '#302c2c', '--dsw-alias-bg-multi-select': '#302c2c', '--dsw-alias-bg-module-platform': '#302c2c', '--dsw-alias-bg-skeleton': '#302c2c',
      '--dsw-alias-border-l1': '#464343', '--dsw-alias-border-l2': '#646262', '--dsw-alias-border-l2-darkmode-thin': '#464343', '--dsw-alias-border-l3': '#6e6e73', '--dsw-alias-border-l4': '#9a9898', '--dsw-alias-border-inverted': '#fdfcfc', '--dsw-alias-border-inverted2': '#c8c6c4', '--dsw-alias-separator-primary': '#464343', '--dsw-alias-line-secondary': '#302c2c', '--dsw-alias-fill-l2': '#3a3535', '--dsw-alias-fill-tsp-secondary': 'rgba(253, 252, 252, 0.06)',
      '--dsw-alias-brand-primary': '#007aff', '--dsw-alias-brand-primary-invert': '#ffffff', '--dsw-alias-brand-text': '#007aff',
      '--dsw-alias-button-primary-fill': '#007aff', '--dsw-alias-button-primary-hover': '#0056b3', '--dsw-alias-button-primary-dimmed': '#0056b3', '--dsw-alias-button-contrast-fill': '#fdfcfc', '--dsw-alias-button-elevated-fill': '#302c2c', '--dsw-alias-button-floating-fill': '#302c2c', '--dsw-alias-button-floating-hover': '#3a3535', '--dsw-alias-button-ghost-active-border': '#646262', '--dsw-alias-button-ghost-active-fill': '#3a3535', '--dsw-alias-button-ghost-active-hover': '#423d3d', '--dsw-alias-button-info-fill': '#007aff', '--dsw-alias-button-info-hover': '#0056b3', '--dsw-alias-button-tool-bar-fill': '#302c2c', '--dsw-alias-button-tool-bar-fill-invisible': 'transparent', '--dsw-alias-button-tool-bar-hover': '#3a3535',
      '--dsw-alias-interactive-bg-hover': '#2a2626', '--dsw-alias-interactive-bg-active': '#3a3535', '--dsw-alias-interactive-bg-hover-accent': 'rgba(0, 122, 255, 0.12)', '--dsw-alias-interactive-bg-hover-danger': 'rgba(255, 59, 48, 0.12)', '--dsw-alias-interactive-bg-hover-solid': '#3a3535',
      '--dsw-alias-label-primary': '#fdfcfc', '--dsw-alias-label-secondary': '#c8c6c4', '--dsw-alias-label-tertiary': '#9a9898', '--dsw-alias-label-quaternary': '#6e6e73', '--dsw-alias-label-caption': '#9a9898', '--dsw-alias-label-dimmed': '#6e6e73', '--dsw-alias-label-error': '#ff3b30', '--dsw-alias-label-primary-foreground': '#fdfcfc', '--dsw-alias-label-primary-inverted': '#201d1d', '--dsw-alias-label-primary-bluish': '#007aff',
      '--dsw-alias-state-error-primary': '#ff3b30', '--dsw-alias-state-error-secondary': 'rgba(255, 59, 48, 0.12)', '--dsw-alias-state-success-primary': '#30d158', '--dsw-alias-state-success-secondary': 'rgba(48, 209, 88, 0.12)', '--dsw-alias-state-warn-primary': '#ff9f0a', '--dsw-alias-state-warn-secondary': 'rgba(255, 159, 10, 0.12)', '--dsw-alias-state-warn-label': '#ff9f0a',
      '--dsw-alias-markdown-citation': '#007aff', '--dsw-alias-markdown-code-block': '#302c2c', '--dsw-alias-markdown-code-block-banner': '#3a3535', '--dsw-alias-markdown-inline-code': 'rgba(48, 209, 88, 0.08)', '--dsw-alias-markdown-code-segment-selected': 'rgba(0, 122, 255, 0.15)', '--dsw-alias-markdown-code-segment-unselected': 'transparent', '--dsw-alias-markdown-placeholder': '#6e6e73', '--dsw-alias-markdown-tag': '#9a9898',
      '--dsw-alias-scrollbar-bg-l1': '#464343', '--dsw-alias-scrollbar-bg-l2': '#3a3535', '--dsw-alias-scrollbar-hover-l1': '#646262', '--dsw-alias-scrollbar-hover-l2': '#423d3d',
      '--dsw-alias-toast-bg': '#302c2c', '--dsw-alias-tooltip-bg': '#302c2c', '--dsw-hovercard-bg': '#302c2c',
      '--dsw-specific-sidebar-fill': '#201d1d', '--dsw-specific-sidebar-nav-item-active': '#3a3535', '--dsw-specific-sidebar-nav-item-active-accent': '#007aff', '--dsw-specific-sidebar-nav-item-hover': '#2a2626', '--dsw-specific-bubble': '#302c2c', '--dsw-specific-bubble-highlight': '#3a3535', '--dsw-specific-input-major': '#302c2c', '--dsw-specific-login-input': '#302c2c', '--dsw-specific-menu': '#302c2c', '--dsw-specific-selector': '#302c2c', '--dsw-specific-tip': '#302c2c',
      '--dsw-font-family': MONO, '--dsw-font-mono': MONO, ...FLAT
    }, MONO, true)

    const opencodeLight = fillFontTokens({
      '--dsw-alias-bg-base': '#fdfcfc', '--dsw-alias-bg-layer-1': '#f1eeee', '--dsw-alias-bg-layer-2': '#e9e2e2', '--dsw-alias-bg-layer-3': '#e2dcdc', '--dsw-alias-bg-overlay': '#ffffff', '--dsw-alias-bg-multi-select': '#f1eeee', '--dsw-alias-bg-module-platform': '#f1eeee', '--dsw-alias-bg-skeleton': '#f1eeee',
      '--dsw-alias-border-l1': '#e2dcdc', '--dsw-alias-border-l2': '#9a9898', '--dsw-alias-border-l2-darkmode-thin': '#e2dcdc', '--dsw-alias-border-l3': '#b5aeae', '--dsw-alias-border-l4': '#9a9898', '--dsw-alias-border-inverted': '#201d1d', '--dsw-alias-border-inverted2': '#424245', '--dsw-alias-separator-primary': '#d6cfcf', '--dsw-alias-line-secondary': '#e9e2e2', '--dsw-alias-fill-l2': '#e9e2e2', '--dsw-alias-fill-tsp-secondary': 'rgba(32, 29, 29, 0.05)',
      '--dsw-alias-brand-primary': '#007aff', '--dsw-alias-brand-primary-invert': '#ffffff', '--dsw-alias-brand-text': '#007aff',
      '--dsw-alias-button-primary-fill': '#201d1d', '--dsw-alias-button-primary-hover': '#3d3a3a', '--dsw-alias-button-primary-dimmed': '#424245', '--dsw-alias-button-contrast-fill': '#201d1d', '--dsw-alias-button-elevated-fill': '#ffffff', '--dsw-alias-button-floating-fill': '#ffffff', '--dsw-alias-button-floating-hover': '#f1eeee', '--dsw-alias-button-ghost-active-border': '#9a9898', '--dsw-alias-button-ghost-active-fill': '#e9e2e2', '--dsw-alias-button-ghost-active-hover': '#d6cfcf', '--dsw-alias-button-info-fill': '#007aff', '--dsw-alias-button-info-hover': '#0056b3', '--dsw-alias-button-tool-bar-fill': '#f1eeee', '--dsw-alias-button-tool-bar-fill-invisible': 'transparent', '--dsw-alias-button-tool-bar-hover': '#e9e2e2',
      '--dsw-alias-interactive-bg-hover': '#f1eeee', '--dsw-alias-interactive-bg-active': '#e9e2e2', '--dsw-alias-interactive-bg-hover-accent': 'rgba(0, 122, 255, 0.10)', '--dsw-alias-interactive-bg-hover-danger': 'rgba(255, 59, 48, 0.10)', '--dsw-alias-interactive-bg-hover-solid': '#e2dcdc',
      '--dsw-alias-label-primary': '#201d1d', '--dsw-alias-label-secondary': '#424245', '--dsw-alias-label-tertiary': '#6e6e73', '--dsw-alias-label-quaternary': '#9a9898', '--dsw-alias-label-caption': '#6e6e73', '--dsw-alias-label-dimmed': '#9a9898', '--dsw-alias-label-error': '#d70015', '--dsw-alias-label-primary-foreground': '#fdfcfc', '--dsw-alias-label-primary-inverted': '#fdfcfc', '--dsw-alias-label-primary-bluish': '#007aff',
      '--dsw-alias-state-error-primary': '#d70015', '--dsw-alias-state-error-secondary': 'rgba(255, 59, 48, 0.10)', '--dsw-alias-state-success-primary': '#178a33', '--dsw-alias-state-success-secondary': 'rgba(48, 209, 88, 0.10)', '--dsw-alias-state-warn-primary': '#b26a00', '--dsw-alias-state-warn-secondary': 'rgba(255, 159, 10, 0.10)', '--dsw-alias-state-warn-label': '#b26a00',
      '--dsw-alias-markdown-citation': '#007aff', '--dsw-alias-markdown-code-block': '#f6f3f3', '--dsw-alias-markdown-code-block-banner': '#eae4e4', '--dsw-alias-markdown-inline-code': 'rgba(48, 209, 88, 0.10)', '--dsw-alias-markdown-code-segment-selected': 'rgba(0, 122, 255, 0.12)', '--dsw-alias-markdown-code-segment-unselected': 'transparent', '--dsw-alias-markdown-placeholder': '#9a9898', '--dsw-alias-markdown-tag': '#6e6e73',
      '--dsw-alias-scrollbar-bg-l1': '#d6cfcf', '--dsw-alias-scrollbar-bg-l2': '#e2dcdc', '--dsw-alias-scrollbar-hover-l1': '#9a9898', '--dsw-alias-scrollbar-hover-l2': '#d6cfcf',
      '--dsw-alias-toast-bg': '#ffffff', '--dsw-alias-tooltip-bg': '#ffffff', '--dsw-hovercard-bg': '#ffffff',
      '--dsw-specific-sidebar-fill': '#f1eeee', '--dsw-specific-sidebar-nav-item-active': '#e2dcdc', '--dsw-specific-sidebar-nav-item-active-accent': '#007aff', '--dsw-specific-sidebar-nav-item-hover': '#e9e2e2', '--dsw-specific-bubble': '#f1eeee', '--dsw-specific-bubble-highlight': '#e9e2e2', '--dsw-specific-input-major': '#f8f7f7', '--dsw-specific-login-input': '#f8f7f7', '--dsw-specific-menu': '#ffffff', '--dsw-specific-selector': '#ffffff', '--dsw-specific-tip': '#f1eeee',
      '--dsw-font-family': MONO, '--dsw-font-mono': MONO, ...FLAT
    }, MONO, true)

    const linearDark = fillFontTokens({
      '--dsw-alias-bg-base': '#08090a', '--dsw-alias-bg-layer-1': '#191a1b', '--dsw-alias-bg-layer-2': '#1f2022', '--dsw-alias-bg-layer-3': '#252629', '--dsw-alias-bg-overlay': '#191a1b', '--dsw-alias-bg-multi-select': '#191a1b', '--dsw-alias-bg-module-platform': '#191a1b', '--dsw-alias-bg-skeleton': '#191a1b',
      '--dsw-alias-border-l1': 'rgba(255, 255, 255, 0.08)', '--dsw-alias-border-l2': 'rgba(255, 255, 255, 0.14)', '--dsw-alias-border-l2-darkmode-thin': 'rgba(255, 255, 255, 0.08)', '--dsw-alias-border-l3': 'rgba(255, 255, 255, 0.22)', '--dsw-alias-border-l4': 'rgba(255, 255, 255, 0.35)', '--dsw-alias-border-inverted': '#f7f8f8', '--dsw-alias-border-inverted2': '#d0d6e0', '--dsw-alias-separator-primary': 'rgba(255, 255, 255, 0.08)', '--dsw-alias-line-secondary': 'rgba(255, 255, 255, 0.05)', '--dsw-alias-fill-l2': '#1f2022', '--dsw-alias-fill-tsp-secondary': 'rgba(247, 248, 248, 0.05)',
      '--dsw-alias-brand-primary': '#5e6ad2', '--dsw-alias-brand-primary-invert': '#ffffff', '--dsw-alias-brand-text': '#828fff',
      '--dsw-alias-button-primary-fill': '#5e6ad2', '--dsw-alias-button-primary-hover': '#828fff', '--dsw-alias-button-primary-dimmed': '#4752c4', '--dsw-alias-button-contrast-fill': '#f7f8f8', '--dsw-alias-button-elevated-fill': '#191a1b', '--dsw-alias-button-floating-fill': '#191a1b', '--dsw-alias-button-floating-hover': '#1f2022', '--dsw-alias-button-ghost-active-border': 'rgba(255, 255, 255, 0.14)', '--dsw-alias-button-ghost-active-fill': '#1f2022', '--dsw-alias-button-ghost-active-hover': '#252629', '--dsw-alias-button-info-fill': '#5e6ad2', '--dsw-alias-button-info-hover': '#828fff', '--dsw-alias-button-tool-bar-fill': '#191a1b', '--dsw-alias-button-tool-bar-fill-invisible': 'transparent', '--dsw-alias-button-tool-bar-hover': '#1f2022',
      '--dsw-alias-interactive-bg-hover': 'rgba(255, 255, 255, 0.06)', '--dsw-alias-interactive-bg-active': 'rgba(255, 255, 255, 0.10)', '--dsw-alias-interactive-bg-hover-accent': 'rgba(94, 106, 210, 0.25)', '--dsw-alias-interactive-bg-hover-danger': 'rgba(220, 38, 38, 0.20)', '--dsw-alias-interactive-bg-hover-solid': '#1f2022',
      '--dsw-alias-label-primary': '#f7f8f8', '--dsw-alias-label-secondary': '#d0d6e0', '--dsw-alias-label-tertiary': '#8f959f', '--dsw-alias-label-quaternary': '#6a707a', '--dsw-alias-label-caption': '#8f959f', '--dsw-alias-label-dimmed': '#6a707a', '--dsw-alias-label-error': '#dc2626', '--dsw-alias-label-primary-foreground': '#f7f8f8', '--dsw-alias-label-primary-inverted': '#08090a', '--dsw-alias-label-primary-bluish': '#828fff',
      '--dsw-alias-state-error-primary': '#dc2626', '--dsw-alias-state-error-secondary': 'rgba(220, 38, 38, 0.15)', '--dsw-alias-state-success-primary': '#27a644', '--dsw-alias-state-success-secondary': 'rgba(39, 166, 68, 0.15)', '--dsw-alias-state-warn-primary': '#eab308', '--dsw-alias-state-warn-secondary': 'rgba(234, 179, 8, 0.15)', '--dsw-alias-state-warn-label': '#eab308',
      '--dsw-alias-markdown-citation': '#828fff', '--dsw-alias-markdown-code-block': '#191a1b', '--dsw-alias-markdown-code-block-banner': '#1f2022', '--dsw-alias-markdown-inline-code': 'rgba(130, 143, 255, 0.12)', '--dsw-alias-markdown-code-segment-selected': 'rgba(94, 106, 210, 0.25)', '--dsw-alias-markdown-code-segment-unselected': 'transparent', '--dsw-alias-markdown-placeholder': '#6a707a', '--dsw-alias-markdown-tag': '#8f959f',
      '--dsw-alias-scrollbar-bg-l1': 'rgba(255, 255, 255, 0.10)', '--dsw-alias-scrollbar-bg-l2': 'rgba(255, 255, 255, 0.06)', '--dsw-alias-scrollbar-hover-l1': 'rgba(255, 255, 255, 0.20)', '--dsw-alias-scrollbar-hover-l2': 'rgba(255, 255, 255, 0.12)',
      '--dsw-alias-toast-bg': '#191a1b', '--dsw-alias-tooltip-bg': '#252629', '--dsw-hovercard-bg': '#1f2022',
      '--dsw-specific-sidebar-fill': '#08090a', '--dsw-specific-sidebar-nav-item-active': 'rgba(255, 255, 255, 0.10)', '--dsw-specific-sidebar-nav-item-active-accent': '#5e6ad2', '--dsw-specific-sidebar-nav-item-hover': 'rgba(255, 255, 255, 0.06)', '--dsw-specific-bubble': '#191a1b', '--dsw-specific-bubble-highlight': '#1f2022', '--dsw-specific-input-major': '#191a1b', '--dsw-specific-login-input': '#191a1b', '--dsw-specific-menu': '#1f2022', '--dsw-specific-selector': '#1f2022', '--dsw-specific-tip': '#252629',
      '--dsw-font-family': INTER, '--dsw-font-mono': MONO, ...FLAT
    }, INTER)

    const notionLight = fillFontTokens({
      '--dsw-alias-bg-base': '#ffffff', '--dsw-alias-bg-layer-1': '#f6f5f4', '--dsw-alias-bg-layer-2': '#efefee', '--dsw-alias-bg-layer-3': '#e8e7e5', '--dsw-alias-bg-overlay': '#ffffff', '--dsw-alias-bg-multi-select': '#f6f5f4', '--dsw-alias-bg-module-platform': '#f6f5f4', '--dsw-alias-bg-skeleton': '#f6f5f4',
      '--dsw-alias-border-l1': 'rgba(0, 0, 0, 0.1)', '--dsw-alias-border-l2': 'rgba(0, 0, 0, 0.16)', '--dsw-alias-border-l2-darkmode-thin': 'rgba(0, 0, 0, 0.1)', '--dsw-alias-border-l3': 'rgba(0, 0, 0, 0.24)', '--dsw-alias-border-l4': 'rgba(0, 0, 0, 0.32)', '--dsw-alias-border-inverted': '#31302e', '--dsw-alias-border-inverted2': '#615d59', '--dsw-alias-separator-primary': 'rgba(0, 0, 0, 0.06)', '--dsw-alias-line-secondary': 'rgba(0, 0, 0, 0.1)', '--dsw-alias-fill-l2': '#efefee', '--dsw-alias-fill-tsp-secondary': 'rgba(0, 0, 0, 0.04)',
      '--dsw-alias-brand-primary': '#0075de', '--dsw-alias-brand-primary-invert': '#ffffff', '--dsw-alias-brand-text': '#0075de',
      '--dsw-alias-button-primary-fill': '#0075de', '--dsw-alias-button-primary-hover': '#005bab', '--dsw-alias-button-primary-dimmed': '#005bab', '--dsw-alias-button-contrast-fill': '#31302e', '--dsw-alias-button-elevated-fill': '#ffffff', '--dsw-alias-button-floating-fill': '#ffffff', '--dsw-alias-button-floating-hover': '#f6f5f4', '--dsw-alias-button-ghost-active-border': 'rgba(0, 0, 0, 0.16)', '--dsw-alias-button-ghost-active-fill': '#efefee', '--dsw-alias-button-ghost-active-hover': '#e8e7e5', '--dsw-alias-button-info-fill': '#0075de', '--dsw-alias-button-info-hover': '#005bab', '--dsw-alias-button-tool-bar-fill': '#f6f5f4', '--dsw-alias-button-tool-bar-fill-invisible': 'transparent', '--dsw-alias-button-tool-bar-hover': '#efefee',
      '--dsw-alias-interactive-bg-hover': '#f6f5f4', '--dsw-alias-interactive-bg-active': '#efefee', '--dsw-alias-interactive-bg-hover-accent': 'rgba(0, 117, 222, 0.10)', '--dsw-alias-interactive-bg-hover-danger': 'rgba(220, 38, 38, 0.08)', '--dsw-alias-interactive-bg-hover-solid': '#efefee',
      '--dsw-alias-label-primary': 'rgba(0, 0, 0, 0.95)', '--dsw-alias-label-secondary': '#31302e', '--dsw-alias-label-tertiary': '#615d59', '--dsw-alias-label-quaternary': '#a39e98', '--dsw-alias-label-caption': '#615d59', '--dsw-alias-label-dimmed': '#a39e98', '--dsw-alias-label-error': '#dc2626', '--dsw-alias-label-primary-foreground': '#ffffff', '--dsw-alias-label-primary-inverted': '#ffffff', '--dsw-alias-label-primary-bluish': '#0075de',
      '--dsw-alias-state-error-primary': '#dc2626', '--dsw-alias-state-error-secondary': 'rgba(220, 38, 38, 0.08)', '--dsw-alias-state-success-primary': '#1aae39', '--dsw-alias-state-success-secondary': 'rgba(26, 174, 57, 0.10)', '--dsw-alias-state-warn-primary': '#dd5b00', '--dsw-alias-state-warn-secondary': 'rgba(221, 91, 0, 0.10)', '--dsw-alias-state-warn-label': '#dd5b00',
      '--dsw-alias-markdown-citation': '#0075de', '--dsw-alias-markdown-code-block': '#f6f5f4', '--dsw-alias-markdown-code-block-banner': '#efefee', '--dsw-alias-markdown-inline-code': 'rgba(0, 0, 0, 0.06)', '--dsw-alias-markdown-code-segment-selected': 'rgba(0, 117, 222, 0.12)', '--dsw-alias-markdown-code-segment-unselected': 'transparent', '--dsw-alias-markdown-placeholder': '#a39e98', '--dsw-alias-markdown-tag': '#615d59',
      '--dsw-alias-scrollbar-bg-l1': 'rgba(0, 0, 0, 0.14)', '--dsw-alias-scrollbar-bg-l2': 'rgba(0, 0, 0, 0.08)', '--dsw-alias-scrollbar-hover-l1': 'rgba(0, 0, 0, 0.26)', '--dsw-alias-scrollbar-hover-l2': 'rgba(0, 0, 0, 0.16)',
      '--dsw-alias-toast-bg': '#ffffff', '--dsw-alias-tooltip-bg': '#31302e', '--dsw-hovercard-bg': '#ffffff',
      '--dsw-specific-sidebar-fill': '#f6f5f4', '--dsw-specific-sidebar-nav-item-active': '#efefee', '--dsw-specific-sidebar-nav-item-active-accent': '#0075de', '--dsw-specific-sidebar-nav-item-hover': '#efefee', '--dsw-specific-bubble': '#f6f5f4', '--dsw-specific-bubble-highlight': '#efefee', '--dsw-specific-input-major': '#f6f5f4', '--dsw-specific-login-input': '#f6f5f4', '--dsw-specific-menu': '#ffffff', '--dsw-specific-selector': '#ffffff', '--dsw-specific-tip': '#31302e',
      '--dsw-shadow-lv1': '0 1px 2px rgba(0, 0, 0, 0.04)', '--dsw-shadow-lv2': '0 2px 6px rgba(0, 0, 0, 0.04)', '--dsw-shadow-lv3': '0 4px 12px rgba(0, 0, 0, 0.05)', '--dsw-shadow-lv1-blur': '2px',
      '--dsw-font-family': NOTION, '--dsw-font-mono': MONO
    }, NOTION)

    const claudeLight = fillFontTokens({
      '--dsw-alias-bg-base': '#f5f4ed', '--dsw-alias-bg-layer-1': '#faf9f5', '--dsw-alias-bg-layer-2': '#f0eee6', '--dsw-alias-bg-layer-3': '#e8e6dc', '--dsw-alias-bg-overlay': '#faf9f5', '--dsw-alias-bg-multi-select': '#faf9f5', '--dsw-alias-bg-module-platform': '#faf9f5', '--dsw-alias-bg-skeleton': '#f0eee6',
      '--dsw-alias-border-l1': '#f0eee6', '--dsw-alias-border-l2': '#e8e6dc', '--dsw-alias-border-l2-darkmode-thin': '#f0eee6', '--dsw-alias-border-l3': '#dcd9ce', '--dsw-alias-border-l4': '#c9c5b8', '--dsw-alias-border-inverted': '#141413', '--dsw-alias-border-inverted2': '#3d3d3a', '--dsw-alias-separator-primary': '#f0eee6', '--dsw-alias-line-secondary': '#e8e6dc', '--dsw-alias-fill-l2': '#f0eee6', '--dsw-alias-fill-tsp-secondary': 'rgba(20, 20, 19, 0.04)',
      '--dsw-alias-brand-primary': '#c96442', '--dsw-alias-brand-primary-invert': '#faf9f5', '--dsw-alias-brand-text': '#c96442',
      '--dsw-alias-button-primary-fill': '#c96442', '--dsw-alias-button-primary-hover': '#b5573a', '--dsw-alias-button-primary-dimmed': '#b5573a', '--dsw-alias-button-contrast-fill': '#141413', '--dsw-alias-button-elevated-fill': '#faf9f5', '--dsw-alias-button-floating-fill': '#faf9f5', '--dsw-alias-button-floating-hover': '#f0eee6', '--dsw-alias-button-ghost-active-border': '#dcd9ce', '--dsw-alias-button-ghost-active-fill': '#e8e6dc', '--dsw-alias-button-ghost-active-hover': '#dcd9ce', '--dsw-alias-button-info-fill': '#c96442', '--dsw-alias-button-info-hover': '#b5573a', '--dsw-alias-button-tool-bar-fill': '#faf9f5', '--dsw-alias-button-tool-bar-fill-invisible': 'transparent', '--dsw-alias-button-tool-bar-hover': '#f0eee6',
      '--dsw-alias-interactive-bg-hover': '#f0eee6', '--dsw-alias-interactive-bg-active': '#e8e6dc', '--dsw-alias-interactive-bg-hover-accent': 'rgba(201, 100, 66, 0.10)', '--dsw-alias-interactive-bg-hover-danger': 'rgba(181, 51, 51, 0.08)', '--dsw-alias-interactive-bg-hover-solid': '#e8e6dc',
      '--dsw-alias-label-primary': '#141413', '--dsw-alias-label-secondary': '#3d3d3a', '--dsw-alias-label-tertiary': '#5e5d59', '--dsw-alias-label-quaternary': '#87867f', '--dsw-alias-label-caption': '#5e5d59', '--dsw-alias-label-dimmed': '#87867f', '--dsw-alias-label-error': '#b53333', '--dsw-alias-label-primary-foreground': '#faf9f5', '--dsw-alias-label-primary-inverted': '#faf9f5', '--dsw-alias-label-primary-bluish': '#c96442',
      '--dsw-alias-state-error-primary': '#b53333', '--dsw-alias-state-error-secondary': 'rgba(181, 51, 51, 0.08)', '--dsw-alias-state-success-primary': '#17a34a', '--dsw-alias-state-success-secondary': 'rgba(23, 163, 74, 0.10)', '--dsw-alias-state-warn-primary': '#eab308', '--dsw-alias-state-warn-secondary': 'rgba(234, 179, 8, 0.10)', '--dsw-alias-state-warn-label': '#b8860b',
      '--dsw-alias-markdown-citation': '#c96442', '--dsw-alias-markdown-code-block': '#f0eee6', '--dsw-alias-markdown-code-block-banner': '#e8e6dc', '--dsw-alias-markdown-inline-code': 'rgba(201, 100, 66, 0.08)', '--dsw-alias-markdown-code-segment-selected': 'rgba(201, 100, 66, 0.12)', '--dsw-alias-markdown-code-segment-unselected': 'transparent', '--dsw-alias-markdown-placeholder': '#87867f', '--dsw-alias-markdown-tag': '#5e5d59',
      '--dsw-alias-scrollbar-bg-l1': '#dcd9ce', '--dsw-alias-scrollbar-bg-l2': '#e8e6dc', '--dsw-alias-scrollbar-hover-l1': '#c9c5b8', '--dsw-alias-scrollbar-hover-l2': '#dcd9ce',
      '--dsw-alias-toast-bg': '#faf9f5', '--dsw-alias-tooltip-bg': '#31302e', '--dsw-hovercard-bg': '#faf9f5',
      '--dsw-specific-sidebar-fill': '#f0eee6', '--dsw-specific-sidebar-nav-item-active': '#e8e6dc', '--dsw-specific-sidebar-nav-item-active-accent': '#c96442', '--dsw-specific-sidebar-nav-item-hover': '#f0eee6', '--dsw-specific-bubble': '#faf9f5', '--dsw-specific-bubble-highlight': '#f0eee6', '--dsw-specific-input-major': '#faf9f5', '--dsw-specific-login-input': '#faf9f5', '--dsw-specific-menu': '#faf9f5', '--dsw-specific-selector': '#faf9f5', '--dsw-specific-tip': '#31302e',
      '--dsw-shadow-lv1': '0 0 0 1px #e8e6dc', '--dsw-shadow-lv2': '0 0 0 1px #dcd9ce', '--dsw-shadow-lv3': '0 0 0 1px #c9c5b8', '--dsw-shadow-lv1-blur': '0px',
      '--dsw-font-family': CLAUDE_SANS, '--dsw-font-mono': MONO
    }, CLAUDE_SANS)

    const nvidiaDark = fillFontTokens({
      '--dsw-alias-bg-base': '#000000', '--dsw-alias-bg-layer-1': '#1a1a1a', '--dsw-alias-bg-layer-2': '#222222', '--dsw-alias-bg-layer-3': '#2a2a2a', '--dsw-alias-bg-overlay': '#1a1a1a', '--dsw-alias-bg-multi-select': '#1a1a1a', '--dsw-alias-bg-module-platform': '#1a1a1a', '--dsw-alias-bg-skeleton': '#1a1a1a',
      '--dsw-alias-border-l1': '#2a2a2a', '--dsw-alias-border-l2': '#5e5e5e', '--dsw-alias-border-l2-darkmode-thin': '#2a2a2a', '--dsw-alias-border-l3': '#7a7a7a', '--dsw-alias-border-l4': '#9a9a9a', '--dsw-alias-border-inverted': '#ffffff', '--dsw-alias-border-inverted2': '#a7a7a7', '--dsw-alias-separator-primary': '#2a2a2a', '--dsw-alias-line-secondary': '#222222', '--dsw-alias-fill-l2': '#222222', '--dsw-alias-fill-tsp-secondary': 'rgba(255, 255, 255, 0.05)',
      '--dsw-alias-brand-primary': '#76b900', '--dsw-alias-brand-primary-invert': '#000000', '--dsw-alias-brand-text': '#76b900',
      '--dsw-alias-button-primary-fill': '#76b900', '--dsw-alias-button-primary-hover': '#1eaedb', '--dsw-alias-button-primary-dimmed': '#3f8500', '--dsw-alias-button-contrast-fill': '#ffffff', '--dsw-alias-button-elevated-fill': '#1a1a1a', '--dsw-alias-button-floating-fill': '#1a1a1a', '--dsw-alias-button-floating-hover': '#222222', '--dsw-alias-button-ghost-active-border': '#76b900', '--dsw-alias-button-ghost-active-fill': '#222222', '--dsw-alias-button-ghost-active-hover': '#2a2a2a', '--dsw-alias-button-info-fill': '#1eaedb', '--dsw-alias-button-info-hover': '#007fff', '--dsw-alias-button-tool-bar-fill': '#1a1a1a', '--dsw-alias-button-tool-bar-fill-invisible': 'transparent', '--dsw-alias-button-tool-bar-hover': '#222222',
      '--dsw-alias-interactive-bg-hover': '#161616', '--dsw-alias-interactive-bg-active': '#222222', '--dsw-alias-interactive-bg-hover-accent': 'rgba(118, 185, 0, 0.15)', '--dsw-alias-interactive-bg-hover-danger': 'rgba(229, 32, 32, 0.15)', '--dsw-alias-interactive-bg-hover-solid': '#222222',
      '--dsw-alias-label-primary': '#ffffff', '--dsw-alias-label-secondary': '#a7a7a7', '--dsw-alias-label-tertiary': '#898989', '--dsw-alias-label-quaternary': '#757575', '--dsw-alias-label-caption': '#898989', '--dsw-alias-label-dimmed': '#757575', '--dsw-alias-label-error': '#e52020', '--dsw-alias-label-primary-foreground': '#ffffff', '--dsw-alias-label-primary-inverted': '#000000', '--dsw-alias-label-primary-bluish': '#1eaedb',
      '--dsw-alias-state-error-primary': '#e52020', '--dsw-alias-state-error-secondary': 'rgba(229, 32, 32, 0.15)', '--dsw-alias-state-success-primary': '#76b900', '--dsw-alias-state-success-secondary': 'rgba(118, 185, 0, 0.15)', '--dsw-alias-state-warn-primary': '#ef9100', '--dsw-alias-state-warn-secondary': 'rgba(239, 145, 0, 0.15)', '--dsw-alias-state-warn-label': '#ef9100',
      '--dsw-alias-markdown-citation': '#76b900', '--dsw-alias-markdown-code-block': '#1a1a1a', '--dsw-alias-markdown-code-block-banner': '#222222', '--dsw-alias-markdown-inline-code': 'rgba(118, 185, 0, 0.10)', '--dsw-alias-markdown-code-segment-selected': 'rgba(118, 185, 0, 0.18)', '--dsw-alias-markdown-code-segment-unselected': 'transparent', '--dsw-alias-markdown-placeholder': '#757575', '--dsw-alias-markdown-tag': '#898989',
      '--dsw-alias-scrollbar-bg-l1': '#2a2a2a', '--dsw-alias-scrollbar-bg-l2': '#222222', '--dsw-alias-scrollbar-hover-l1': '#5e5e5e', '--dsw-alias-scrollbar-hover-l2': '#2a2a2a',
      '--dsw-alias-toast-bg': '#1a1a1a', '--dsw-alias-tooltip-bg': '#2a2a2a', '--dsw-hovercard-bg': '#222222',
      '--dsw-specific-sidebar-fill': '#000000', '--dsw-specific-sidebar-nav-item-active': '#222222', '--dsw-specific-sidebar-nav-item-active-accent': '#76b900', '--dsw-specific-sidebar-nav-item-hover': '#161616', '--dsw-specific-bubble': '#1a1a1a', '--dsw-specific-bubble-highlight': '#222222', '--dsw-specific-input-major': '#1a1a1a', '--dsw-specific-login-input': '#1a1a1a', '--dsw-specific-menu': '#222222', '--dsw-specific-selector': '#222222', '--dsw-specific-tip': '#2a2a2a',
      '--dsw-font-family': SANS, '--dsw-font-mono': MONO, ...FLAT
    }, SANS)

    const githubDark = fillFontTokens({
      '--dsw-alias-bg-base': '#0d1117', '--dsw-alias-bg-layer-1': '#161b22', '--dsw-alias-bg-layer-2': '#21262d', '--dsw-alias-bg-layer-3': '#282e35', '--dsw-alias-bg-overlay': '#161b22', '--dsw-alias-bg-multi-select': '#161b22', '--dsw-alias-bg-module-platform': '#161b22', '--dsw-alias-bg-skeleton': '#161b22',
      '--dsw-alias-border-l1': '#30363d', '--dsw-alias-border-l2': '#3d444d', '--dsw-alias-border-l2-darkmode-thin': '#30363d', '--dsw-alias-border-l3': '#545d68', '--dsw-alias-border-l4': '#6e7681', '--dsw-alias-border-inverted': '#f0f6fc', '--dsw-alias-border-inverted2': '#c9d1d9', '--dsw-alias-separator-primary': '#21262d', '--dsw-alias-line-secondary': '#30363d', '--dsw-alias-fill-l2': '#21262d', '--dsw-alias-fill-tsp-secondary': 'rgba(240, 246, 252, 0.05)',
      '--dsw-alias-brand-primary': '#2f81f7', '--dsw-alias-brand-primary-invert': '#ffffff', '--dsw-alias-brand-text': '#2f81f7',
      '--dsw-alias-button-primary-fill': '#238636', '--dsw-alias-button-primary-hover': '#2ea043', '--dsw-alias-button-primary-dimmed': '#1f6e30', '--dsw-alias-button-contrast-fill': '#f0f6fc', '--dsw-alias-button-elevated-fill': '#161b22', '--dsw-alias-button-floating-fill': '#161b22', '--dsw-alias-button-floating-hover': '#21262d', '--dsw-alias-button-ghost-active-border': '#3d444d', '--dsw-alias-button-ghost-active-fill': '#21262d', '--dsw-alias-button-ghost-active-hover': '#282e35', '--dsw-alias-button-info-fill': '#2f81f7', '--dsw-alias-button-info-hover': '#1f6feb', '--dsw-alias-button-tool-bar-fill': '#161b22', '--dsw-alias-button-tool-bar-fill-invisible': 'transparent', '--dsw-alias-button-tool-bar-hover': '#21262d',
      '--dsw-alias-interactive-bg-hover': '#161b22', '--dsw-alias-interactive-bg-active': '#21262d', '--dsw-alias-interactive-bg-hover-accent': 'rgba(47, 129, 247, 0.15)', '--dsw-alias-interactive-bg-hover-danger': 'rgba(248, 81, 73, 0.15)', '--dsw-alias-interactive-bg-hover-solid': '#21262d',
      '--dsw-alias-label-primary': '#f0f6fc', '--dsw-alias-label-secondary': '#c9d1d9', '--dsw-alias-label-tertiary': '#8b949e', '--dsw-alias-label-quaternary': '#6e7681', '--dsw-alias-label-caption': '#8b949e', '--dsw-alias-label-dimmed': '#6e7681', '--dsw-alias-label-error': '#f85149', '--dsw-alias-label-primary-foreground': '#f0f6fc', '--dsw-alias-label-primary-inverted': '#0d1117', '--dsw-alias-label-primary-bluish': '#2f81f7',
      '--dsw-alias-state-error-primary': '#f85149', '--dsw-alias-state-error-secondary': 'rgba(248, 81, 73, 0.15)', '--dsw-alias-state-success-primary': '#3fb950', '--dsw-alias-state-success-secondary': 'rgba(63, 185, 80, 0.15)', '--dsw-alias-state-warn-primary': '#d29922', '--dsw-alias-state-warn-secondary': 'rgba(210, 153, 34, 0.15)', '--dsw-alias-state-warn-label': '#d29922',
      '--dsw-alias-markdown-citation': '#2f81f7', '--dsw-alias-markdown-code-block': '#161b22', '--dsw-alias-markdown-code-block-banner': '#21262d', '--dsw-alias-markdown-inline-code': 'rgba(56, 139, 253, 0.15)', '--dsw-alias-markdown-code-segment-selected': 'rgba(47, 129, 247, 0.25)', '--dsw-alias-markdown-code-segment-unselected': 'transparent', '--dsw-alias-markdown-placeholder': '#6e7681', '--dsw-alias-markdown-tag': '#8b949e',
      '--dsw-alias-scrollbar-bg-l1': '#30363d', '--dsw-alias-scrollbar-bg-l2': '#21262d', '--dsw-alias-scrollbar-hover-l1': '#545d68', '--dsw-alias-scrollbar-hover-l2': '#30363d',
      '--dsw-alias-toast-bg': '#161b22', '--dsw-alias-tooltip-bg': '#282e35', '--dsw-hovercard-bg': '#21262d',
      '--dsw-specific-sidebar-fill': '#0d1117', '--dsw-specific-sidebar-nav-item-active': '#21262d', '--dsw-specific-sidebar-nav-item-active-accent': '#2f81f7', '--dsw-specific-sidebar-nav-item-hover': '#161b22', '--dsw-specific-bubble': '#161b22', '--dsw-specific-bubble-highlight': '#21262d', '--dsw-specific-input-major': '#0d1117', '--dsw-specific-login-input': '#0d1117', '--dsw-specific-menu': '#21262d', '--dsw-specific-selector': '#21262d', '--dsw-specific-tip': '#282e35',
      '--dsw-font-family': SANS, '--dsw-font-mono': MONO, ...FLAT
    }, SANS)

    const githubLight = fillFontTokens({
      '--dsw-alias-bg-base': '#ffffff', '--dsw-alias-bg-layer-1': '#f6f8fa', '--dsw-alias-bg-layer-2': '#eff2f5', '--dsw-alias-bg-layer-3': '#eaeef2', '--dsw-alias-bg-overlay': '#ffffff', '--dsw-alias-bg-multi-select': '#f6f8fa', '--dsw-alias-bg-module-platform': '#f6f8fa', '--dsw-alias-bg-skeleton': '#f6f8fa',
      '--dsw-alias-border-l1': '#d0d7de', '--dsw-alias-border-l2': '#afb8c1', '--dsw-alias-border-l2-darkmode-thin': '#d0d7de', '--dsw-alias-border-l3': '#8c959f', '--dsw-alias-border-l4': '#57606a', '--dsw-alias-border-inverted': '#1f2328', '--dsw-alias-border-inverted2': '#656d76', '--dsw-alias-separator-primary': '#d8dee4', '--dsw-alias-line-secondary': '#eff2f5', '--dsw-alias-fill-l2': '#eff2f5', '--dsw-alias-fill-tsp-secondary': 'rgba(31, 35, 40, 0.04)',
      '--dsw-alias-brand-primary': '#0969da', '--dsw-alias-brand-primary-invert': '#ffffff', '--dsw-alias-brand-text': '#0969da',
      '--dsw-alias-button-primary-fill': '#1f883d', '--dsw-alias-button-primary-hover': '#1a7f37', '--dsw-alias-button-primary-dimmed': '#16795c', '--dsw-alias-button-contrast-fill': '#1f2328', '--dsw-alias-button-elevated-fill': '#ffffff', '--dsw-alias-button-floating-fill': '#ffffff', '--dsw-alias-button-floating-hover': '#f6f8fa', '--dsw-alias-button-ghost-active-border': '#afb8c1', '--dsw-alias-button-ghost-active-fill': '#eff2f5', '--dsw-alias-button-ghost-active-hover': '#eaeef2', '--dsw-alias-button-info-fill': '#0969da', '--dsw-alias-button-info-hover': '#0550ae', '--dsw-alias-button-tool-bar-fill': '#f6f8fa', '--dsw-alias-button-tool-bar-fill-invisible': 'transparent', '--dsw-alias-button-tool-bar-hover': '#eff2f5',
      '--dsw-alias-interactive-bg-hover': '#f6f8fa', '--dsw-alias-interactive-bg-active': '#eff2f5', '--dsw-alias-interactive-bg-hover-accent': 'rgba(9, 105, 218, 0.10)', '--dsw-alias-interactive-bg-hover-danger': 'rgba(207, 34, 46, 0.08)', '--dsw-alias-interactive-bg-hover-solid': '#eff2f5',
      '--dsw-alias-label-primary': '#1f2328', '--dsw-alias-label-secondary': '#1f2328', '--dsw-alias-label-tertiary': '#656d76', '--dsw-alias-label-quaternary': '#8c959f', '--dsw-alias-label-caption': '#656d76', '--dsw-alias-label-dimmed': '#8c959f', '--dsw-alias-label-error': '#cf222e', '--dsw-alias-label-primary-foreground': '#ffffff', '--dsw-alias-label-primary-inverted': '#ffffff', '--dsw-alias-label-primary-bluish': '#0969da',
      '--dsw-alias-state-error-primary': '#cf222e', '--dsw-alias-state-error-secondary': 'rgba(207, 34, 46, 0.08)', '--dsw-alias-state-success-primary': '#1a7f37', '--dsw-alias-state-success-secondary': 'rgba(26, 127, 55, 0.10)', '--dsw-alias-state-warn-primary': '#9a6700', '--dsw-alias-state-warn-secondary': 'rgba(154, 103, 0, 0.10)', '--dsw-alias-state-warn-label': '#9a6700',
      '--dsw-alias-markdown-citation': '#0969da', '--dsw-alias-markdown-code-block': '#f6f8fa', '--dsw-alias-markdown-code-block-banner': '#eff2f5', '--dsw-alias-markdown-inline-code': 'rgba(9, 105, 218, 0.08)', '--dsw-alias-markdown-code-segment-selected': 'rgba(9, 105, 218, 0.12)', '--dsw-alias-markdown-code-segment-unselected': 'transparent', '--dsw-alias-markdown-placeholder': '#8c959f', '--dsw-alias-markdown-tag': '#656d76',
      '--dsw-alias-scrollbar-bg-l1': '#d0d7de', '--dsw-alias-scrollbar-bg-l2': '#eff2f5', '--dsw-alias-scrollbar-hover-l1': '#afb8c1', '--dsw-alias-scrollbar-hover-l2': '#d0d7de',
      '--dsw-alias-toast-bg': '#ffffff', '--dsw-alias-tooltip-bg': '#1f2328', '--dsw-hovercard-bg': '#ffffff',
      '--dsw-specific-sidebar-fill': '#f6f8fa', '--dsw-specific-sidebar-nav-item-active': '#eff2f5', '--dsw-specific-sidebar-nav-item-active-accent': '#0969da', '--dsw-specific-sidebar-nav-item-hover': '#eff2f5', '--dsw-specific-bubble': '#f6f8fa', '--dsw-specific-bubble-highlight': '#eff2f5', '--dsw-specific-input-major': '#f6f8fa', '--dsw-specific-login-input': '#f6f8fa', '--dsw-specific-menu': '#ffffff', '--dsw-specific-selector': '#ffffff', '--dsw-specific-tip': '#1f2328',
      '--dsw-shadow-lv1': '0 1px 0 rgba(31, 35, 40, 0.04)', '--dsw-shadow-lv2': '0 1px 3px rgba(31, 35, 40, 0.06)', '--dsw-shadow-lv3': '0 1px 5px rgba(31, 35, 40, 0.08)', '--dsw-shadow-lv1-blur': '1px',
      '--dsw-font-family': SANS, '--dsw-font-mono': MONO
    }, SANS)

    /* ── 主题目录（与 lib/themes/index.js 的 THEME_CATALOG 同源）── */
    const THEMES = [
      { id: 'opencode-terminal-dark', colorScheme: 'dark', tokens: opencodeDark, label: 'OpenCode 暱夜终端', desc: '暖黑 #201d1d + Apple 蓝，全站 mono', swatch: ['#201d1d', '#302c2c', '#007aff', '#30d158'] },
      { id: 'opencode-terminal-light', colorScheme: 'light', tokens: opencodeLight, label: 'OpenCode 纸感终端', desc: '暖白 #fdfcfc + 暖灰层次', swatch: ['#fdfcfc', '#f1eeee', '#201d1d', '#007aff'] },
      { id: 'linear-dark', colorScheme: 'dark', tokens: linearDark, label: 'Linear 暗夜无彩', desc: '近黑 #08090a + Indigo #5e6ad2', swatch: ['#08090a', '#191a1b', '#5e6ad2', '#f7f8f8'] },
      { id: 'notion-light', colorScheme: 'light', tokens: notionLight, label: 'Notion 暖白极简', desc: '纯白 + 暖灰 + Notion 蓝', swatch: ['#ffffff', '#f6f5f4', '#31302e', '#0075de'] },
      { id: 'claude-parchment-light', colorScheme: 'light', tokens: claudeLight, label: 'Claude 羊皮纸', desc: '羊皮纸 #f5f4ed + 赤陶 #c96442', swatch: ['#f5f4ed', '#faf9f5', '#c96442', '#141413'] },
      { id: 'nvidia-dark', colorScheme: 'dark', tokens: nvidiaDark, label: 'NVIDIA 硬核绿', desc: '纯黑 #000 + 信号绿 #76b900', swatch: ['#000000', '#1a1a1a', '#76b900', '#ffffff'] },
      { id: 'github-dark', colorScheme: 'dark', tokens: githubDark, label: 'GitHub 暗色 Primer', desc: '#0d1117 + Primer 蓝 #2f81f7', swatch: ['#0d1117', '#161b22', '#2f81f7', '#3fb950'] },
      { id: 'github-light', colorScheme: 'light', tokens: githubLight, label: 'GitHub 亮色 Primer', desc: '纯白 + #0969da + 绿色按钮', swatch: ['#ffffff', '#f6f8fa', '#0969da', '#1f883d'] }
    ]

    /* ── 设置页：背景与外观卡片（壁纸上传/选择/删除 + 模糊/压暗/毛玻璃/圆角）── */
    function createBackgroundPanel(bridge, onChange) {
      return function BackgroundPanel() {
        const [cfg, setCfg] = React.useState(null)
        const [files, setFiles] = React.useState([])
        const [busy, setBusy] = React.useState(false)
        const [notice, setNotice] = React.useState(null)

        const reload = React.useCallback(function () {
          bridge.state().then(function (reply) {
            if (reply && reply.ok === true) {
              setCfg({ wallpaper: reply.wallpaper, glass: reply.glass, radius: reply.radius })
              setNotice(null)
            } else {
              setNotice({ err: (reply && reply.error) || '状态读取失败' })
            }
          }).catch(function (e) { setNotice({ err: '状态读取失败：' + String((e && e.message) || e) }) })
          fetch('/ext/dshp-inx-custom-ui/wallpapers').then(function (r) { return r.json() }).then(function (reply) {
            if (reply && reply.ok === true) setFiles(reply.files || [])
          }).catch(function () { /* 列表失败不阻塞 */ })
        }, [])
        React.useEffect(function () { reload() }, [reload])

        const save = function (patch) {
          setBusy(true)
          bridge.saveConfig(patch).then(function (reply) {
            setBusy(false)
            if (reply && reply.ok === true) {
              setCfg({ wallpaper: reply.wallpaper, glass: reply.glass, radius: reply.radius })
              if (onChange) onChange(reply)
              setNotice({ ok: '已保存' })
            } else {
              setNotice({ err: (reply && reply.error) || '保存失败' })
            }
          }).catch(function (e) {
            setBusy(false)
            setNotice({ err: '保存失败：' + String((e && e.message) || e) })
          })
        }

        const upload = function (file) {
          if (!file) return
          setBusy(true)
          setNotice(null)
          const form = new FormData()
          form.append('file', file, file.name)
          fetch('/ext/dshp-inx-custom-ui/wallpaper', { method: 'POST', body: form }).then(function (r) { return r.json() }).then(function (reply) {
            setBusy(false)
            if (reply && reply.ok === true) {
              const isVideo = /\.(mp4|webm)$/i.test(reply.name)
              save({ wallpaper: { type: isVideo ? 'video' : 'image', file: reply.name, blur: (cfg && cfg.wallpaper && cfg.wallpaper.blur) || 0, dim: (cfg && cfg.wallpaper && cfg.wallpaper.dim) || 0 } })
              reload()
            } else {
              setNotice({ err: (reply && reply.error) || '上传失败' })
            }
          }).catch(function (e) {
            setBusy(false)
            setNotice({ err: '上传失败：' + String((e && e.message) || e) })
          })
        }

        const del = function (name) {
          setBusy(true)
          fetch('/ext/dshp-inx-custom-ui/wallpaper-delete', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ name })
          }).then(function (r) { return r.json() }).then(function (reply) {
            setBusy(false)
            if (reply && reply.ok === true) reload()
            else setNotice({ err: (reply && reply.error) || '删除失败' })
          }).catch(function (e) {
            setBusy(false)
            setNotice({ err: '删除失败：' + String((e && e.message) || e) })
          })
        }

        if (cfg === null) {
          return React.createElement('p', { className: 'tg-head' }, '读取配置中…')
        }

        const wp = cfg.wallpaper || { type: 'none', file: '', blur: 0, dim: 0 }
        const gl = cfg.glass || { enabled: false, strength: 14 }
        const rd = cfg.radius || { global: -1 }

        const sliders = []
        const mkSlider = function (label, value, min, max, step, onInput) {
          return React.createElement('label', { key: label, style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } },
            React.createElement('span', { style: { width: '72px', flex: 'none' } }, label),
            React.createElement('input', {
              type: 'range', min: String(min), max: String(max), step: String(step),
              value: String(value), disabled: busy,
              style: { flex: '1' },
              onChange: function (e) { onInput(Number(e.target.value)) }
            }),
            React.createElement('span', { style: { width: '40px', textAlign: 'right', flex: 'none' } }, String(value))
          )
        }

        const wpPatch = function (patch) {
          save({ wallpaper: Object.assign({}, wp, patch) })
        }

        return React.createElement('div', { className: 'tg-page' },
          React.createElement('p', { className: 'tg-head' }, '壁纸与视觉效果（选择即时保存）'),
          notice && notice.err ? React.createElement('p', { className: 'tg-head', style: { color: 'var(--dsw-alias-state-error-primary)' } }, notice.err) : null,
          notice && notice.ok ? React.createElement('p', { className: 'tg-head', style: { color: 'var(--dsw-alias-state-success-primary)' } }, notice.ok) : null,

          /* 壁纸选择行 */
          React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } },
            React.createElement('button', {
              className: 'tg-card' + (wp.type === 'none' ? ' tg-active' : ''), style: { padding: '8px 12px' },
              disabled: busy,
              onClick: function () { wpPatch({ type: 'none', file: '' }) }
            }, '无壁纸'),
            React.createElement('label', { className: 'tg-card', style: { padding: '8px 12px', cursor: 'pointer' } },
              busy ? '处理中…' : '上传壁纸（图片 ≤24MB / 视频 ≤96MB）',
              React.createElement('input', {
                type: 'file',
                accept: '.png,.jpg,.jpeg,.gif,.webp,.avif,.bmp,.mp4,.webm',
                style: { display: 'none' },
                disabled: busy,
                onChange: function (e) { upload(e.target.files && e.target.files[0]) }
              }))
          ),

          /* 文件列表 */
          files.length > 0 ? React.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
            files.map(function (f) {
              const active = wp.file === f.name && wp.type !== 'none'
              const icon = f.type === 'video' ? '🎬' : '🖼️'
              return React.createElement('span', { key: f.name, style: { display: 'inline-flex', gap: '6px', alignItems: 'center', padding: '6px 10px', borderRadius: '8px', border: active ? '2px solid var(--dsw-alias-brand-primary)' : '1px solid var(--dsw-alias-border-l1)', background: active ? 'var(--dsw-alias-interactive-bg-hover-accent)' : 'var(--dsw-alias-bg-layer-1)', fontSize: '12px' } },
                icon,
                React.createElement('button', {
                  style: { border: 'none', background: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', padding: 0 },
                  onClick: function () { wpPatch({ type: f.type, file: f.name }) }
                }, f.name),
                React.createElement('span', { style: { color: 'var(--dsw-alias-label-tertiary)' } }, Math.round(f.size / 1024) + 'K'),
                React.createElement('button', {
                  style: { border: 'none', background: 'none', color: 'var(--dsw-alias-state-error-primary)', cursor: 'pointer', padding: 0, font: 'inherit' },
                  disabled: busy,
                  onClick: function () { del(f.name) }
                }, '✕'))
            })
          ) : null,

          /* 模糊 / 压暗 */
          wp.type !== 'none' ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            mkSlider('模糊度', wp.blur || 0, 0, 40, 1, function (v) { wpPatch({ blur: v }) }),
            mkSlider('压暗度', wp.dim || 0, 0, 0.8, 0.05, function (v) { wpPatch({ dim: v }) })
          ) : null,

          /* 毛玻璃：纯开关（开启 = 侧栏/详情栏半透明 + 14px 磨砂） */
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--dsw-alias-border-l1)', paddingTop: '12px' } },
            React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--dsw-alias-label-secondary)', cursor: 'pointer' } },
              React.createElement('input', {
                type: 'checkbox', checked: gl.enabled === true, disabled: busy,
                onChange: function (e) { save({ glass: Object.assign({}, gl, { enabled: e.target.checked }) }) }
              }),
              '侧栏与详情栏毛玻璃（需壁纸生效）'
            )
          ),

          /* 全局圆角：三档单选 */
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--dsw-alias-border-l1)', paddingTop: '12px' } },
            React.createElement('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, '全局圆角'),
            React.createElement('div', { style: { display: 'flex', gap: '8px' } },
              [['-1', '默认（跟随主题）'], ['0', '全锐角'], ['12', '圆润（12px）']].map(function (opt) {
                const value = Number(opt[0])
                const active = Number(rd.global) === value
                return React.createElement('button', {
                  key: opt[0],
                  className: active ? 'tg-card tg-active' : 'tg-card',
                  style: { padding: '8px 12px', fontSize: '12px' },
                  disabled: busy,
                  onClick: function () { save({ radius: { global: value } }) }
                }, opt[1])
              })
            )
          )
        )
      }
    }


    /* ── 持久化守护状态：当前生效的自定义主题 id（空 = 跟随内置偏好）──
     * 官方 theme runtime 的 adopt() 订阅共享 settings 镜像，任何 settings
     * 写入（含本插件保存 themeId、其它插件写配置）都会把内存里的自定义
     * 偏好重置回 ui-theme.preference。守护监听 theme/change，在被重置的
     * 同一个同步事件链里重新应用持久化主题，避免"先跳回默认配色、
     * 要点两次"（重置+重应用发生在同一 JS 任务内，绘制前完成，无闪烁）。 */
    let desiredId = ''

    /* 内置主题的画廊显示名（light/dark 也能在画廊里被切回）。 */
    const BUILTIN_LABELS = { light: '浅色（内置）', dark: '深色（内置）' }

    /* ── 持久化桥：Host 半的 settings 路由（dshp-inx-custom-ui 命名空间）── */
    function createBridge() {
      const state = async () => {
        const response = await fetch('/ext/dshp-inx-custom-ui/state', { cache: 'no-store' })
        return response.json()
      }
      const saveTheme = async (themeId) => {
        const response = await fetch('/ext/dshp-inx-custom-ui/theme', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ themeId })
        })
        return response.json()
      }
      const saveConfig = async (patch) => {
        const response = await fetch('/ext/dshp-inx-custom-ui/config', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(patch || {})
        })
        return response.json()
      }
      return { state, saveTheme, saveConfig }
    }

    /* ── 画廊组件：theme/change 驱动实时高亮 ── */
    function createGallery(ctx, theme, bridge) {
      return function ThemeGallery() {
        const [revision, setRevision] = React.useState(-1)
        const [notice, setNotice] = React.useState(null)
        React.useEffect(function () {
          return ctx.on('theme/change', function (snap) {
            setRevision(snap && typeof snap.revision === 'number' ? snap.revision : 0)
          })
        }, [])
        const snap = theme.getTheme()
        const current = snap && snap.active ? snap.active.id : ''
        const label = {}
        for (const t of THEMES) label[t.id] = t.label
        label.light = BUILTIN_LABELS.light
        label.dark = BUILTIN_LABELS.dark
        const currentLabel = label[current] || current

        const pick = function (t) {
          desiredId = t.id
          /* 双写策略：
           * 1) 先把内置 scheme 写进官方 ui-theme.preference（走 setTheme 正规通道）——
           *    官方 adopt() 触发时读到的偏好与自定义主题同色系，恢复也不会亮暗跳变；
           * 2) 再切自定义 id（内存生效）。 */
          try {
            if (t.colorScheme === 'light' || t.colorScheme === 'dark') {
              if (theme.getTheme().preference !== t.colorScheme) theme.setTheme(t.colorScheme)
            }
            theme.setTheme(t.id)
          } catch (e) { console.error(String(e && e.message)) }
          bridge.saveTheme(t.id).then(function (reply) {
            setNotice(reply && reply.ok ? null : { err: (reply && reply.error) || '主题选择保存失败（重启后会回到内置偏好）' })
          }).catch(function (e) {
            setNotice({ err: '主题选择保存失败：' + String((e && e.message) || e) })
          })
        }

        /* 回到内置偏好：清持久化 + 跟随官方外观行（解除守护）。 */
        const release = function () {
          desiredId = ''
          bridge.saveTheme('').then(function (reply) {
            setNotice(reply && reply.ok
              ? { err: null, ok: '已回到内置偏好，请在"外观"行选择浅色/深色/跟随系统' }
              : { err: (reply && reply.error) || '清除失败' })
          }).catch(function (e) {
            setNotice({ err: '清除失败：' + String((e && e.message) || e) })
          })
        }

        const cards = THEMES.map(function (t) {
          const active = current === t.id
          const swatches = t.swatch.map(function (c) {
            return React.createElement('span', { key: c, className: 'tg-swatch', style: { background: c } })
          })
          return React.createElement('button', {
            key: t.id,
            className: active ? 'tg-card tg-active' : 'tg-card',
            onClick: function () { pick(t) }
          },
            React.createElement('div', { className: 'tg-titleRow' },
              React.createElement('span', { className: 'tg-title' }, t.label),
              active ? React.createElement('span', { className: 'tg-badge' }, '使用中') : null),
            React.createElement('div', { className: 'tg-swatches' }, swatches),
            React.createElement('span', { className: 'tg-desc' }, t.desc)
          )
        })

        return React.createElement('div', { key: 'tg-r' + String(revision), className: 'tg-page' },
          React.createElement('p', { className: 'tg-head' }, '当前主题：' + currentLabel + '（点击卡片切换，选择自动保存）'),
          notice && notice.err ? React.createElement('p', { className: 'tg-head', style: { color: 'var(--dsw-alias-state-error-primary)' } }, notice.err) : null,
          notice && notice.ok ? React.createElement('p', { className: 'tg-head', style: { color: 'var(--dsw-alias-state-success-primary)' } }, notice.ok) : null,
          React.createElement('div', { className: 'tg-grid' }, cards),
          React.createElement('p', { className: 'tg-head' },
            '不用画廊主题了？',
            ' ',
            React.createElement('button', {
              className: 'tg-release',
              onClick: release
            }, '回到内置偏好（浅色/深色/跟随系统）'))
        )
      }
    }

    exports.inject = ['slots', 'theme']
    exports.apply = function apply(ctx) {
      const slots = ctx.get('slots')
      const theme = ctx.get('theme')
      if (slots === undefined || theme === undefined) return

      /* 注册全部主题（disposer 交给 ctx.effect） */
      for (const t of THEMES) {
        ctx.effect(function () {
          return theme.register({ id: t.id, colorScheme: t.colorScheme, tokens: t.tokens })
        }, 'custom-ui: register ' + t.id)
      }

      /* 画廊设置页 */
      const style = document.createElement('style')
      style.setAttribute('data-plugin-css', 'dshp-inx-custom-ui/gallery.css')
      style.textContent = CSS
      document.head.appendChild(style)
      ctx.effect(function () { return function () { style.remove() } }, 'custom-ui: section styles')

      /* 启动恢复 + 守护：
       * 1) 读 settings 持久化的 themeId，注册完成后 setTheme 恢复；
       * 2) 守护监听 theme/change——官方 adopt() 在任何 settings 提交后把内存
       *    偏好重置回 ui-theme.preference（自定义 id 不在其 schema 里），
       *    守护在同一同步事件链里重新应用，页面无闪跳；
       * 3) 用户"回到内置偏好"后 desiredId 为空，守护退出，官方外观行恢复权威。
       * Host 半 404（旧版本未重启）时静默跳过——内置偏好仍然生效。 */
      const bridge = createBridge()
      bridge.state().then(function (reply) {
        const saved = reply && reply.ok === true && typeof reply.themeId === 'string' ? reply.themeId : ''
        if (saved.length > 0) {
          desiredId = saved
          try { theme.setTheme(saved) } catch (e) {
            desiredId = ''
            console.log('[dshp-inx-custom-ui] 恢复主题失败（可能插件版本不匹配）: ' + String(e && e.message))
          }
        }
      }).catch(function (e) {
        console.log('[dshp-inx-custom-ui] 读取持久化主题失败: ' + String((e && e.message) || e))
      })

      ctx.effect(function () {
        return ctx.on('theme/change', function (snap) {
          if (desiredId.length === 0) return
          const activeId = snap && snap.active ? snap.active.id : ''
          if (activeId !== desiredId) {
            try { theme.setTheme(desiredId) } catch (e) {
              console.error('[dshp-inx-custom-ui] 守护重应用失败: ' + String(e && e.message))
            }
          }
        })
      }, 'custom-ui: preference guard')

      /* 启动自愈：恢复后短窗口内核对三次（原生 setTimeout，dispose 清理）。
       * 第一次 apply 后镜像可能还有一轮 adopt 在途，单次 setTheme 可能被盖；
       * 短周期重试兜住这一窗口，之后完全交给 theme/change 守护。 */
      ctx.effect(function () {
        const checks = [300, 900, 2000]
        const timers = checks.map(function (delay) {
          return setTimeout(function () {
            if (desiredId.length === 0) return
            try {
              const snapNow = theme.getTheme()
              const activeId = snapNow && snapNow.active ? snapNow.active.id : ''
              if (activeId !== desiredId) theme.setTheme(desiredId)
            } catch (e) { /* 注册不匹配等启动竞态：跳过本轮 */ }
          }, delay)
        })
        return function () { for (const t of timers) clearTimeout(t) }
      }, 'custom-ui: startup settle guard')

      const Gallery = createGallery(ctx, theme, bridge)

      /* 背景面板：保存后即时重渲染壁纸层（onChange 钩子） */
      const BackgroundPanel = createBackgroundPanel(bridge, function (newCfg) {
        renderBackground(newCfg.wallpaper, newCfg.glass, newCfg.radius)
      })

      /* 外观定制页 = 主题画廊 + 背景与外观，两块垂直堆叠 */
      function AppearanceSection() {
        return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '28px' } },
          React.createElement(Gallery),
          React.createElement(BackgroundPanel)
        )
      }

      ctx.effect(function () {
        return slots.inject('settings.section', function () {
          return slots.register(
            { name: 'settings.section', id: 'dshp-inx-custom-ui', order: 50, label: '外观定制' },
            AppearanceSection
          )
        })
      }, 'custom-ui: settings section')

      /* ── 背景与外观引擎：壁纸层 + 毛玻璃 + 全局圆角（配置驱动）── */
      applyBackground(bridge.state())

      /* 主题守护之外，配置变化（外部改 settings.yaml 热重载后手动刷新）也重应用背景 */
    }

    /* ── 背景引擎：body 壁纸层（fixed，模糊/压暗滤镜），三栏半透明 + 毛玻璃，
     *     全局圆角覆盖。所有 DOM 归本插件 effect 管理，停止即完全还原。 ── */
    function applyBackground(statePromise) {
      statePromise.then(function (cfg) {
        if (!cfg || cfg.ok !== true) return
        renderBackground(cfg.wallpaper, cfg.glass, cfg.radius)
      }).catch(function (e) {
        console.log('[dshp-inx-custom-ui] 读取背景配置失败: ' + String((e && e.message) || e))
      })
    }

    function renderBackground(wallpaper, glass, radius) {
      const layerId = 'dshp-inx-custom-ui-wallpaper'
      const cssId = 'dshp-inx-custom-ui-bg-css'

      /* 移除旧层与旧样式（幂等重渲染） */
      const oldLayer = document.getElementById(layerId)
      if (oldLayer) oldLayer.remove()
      const oldCss = document.getElementById(cssId)
      if (oldCss) oldCss.remove()

      const wp = wallpaper || { type: 'none', file: '', blur: 0, dim: 0 }
      const gl = glass || { enabled: false, strength: 14 }
      const rd = radius || { global: -1 }
      const hasWallpaper = wp.type !== 'none' && typeof wp.file === 'string' && wp.file.length > 0
      const blurPx = Math.min(40, Math.max(0, Number(wp.blur) || 0))
      const dimPct = Math.min(0.8, Math.max(0, Number(wp.dim) || 0))

      /* 壁纸层：fixed 垫底，模糊压暗滤镜，cover 填充 */
      if (hasWallpaper) {
        const layer = document.createElement('div')
        layer.id = layerId
        layer.setAttribute('aria-hidden', 'true')
        layer.style.cssText = [
          'position:fixed', 'inset:0', 'z-index:0', 'pointer-events:none',
          'overflow:hidden',
          'filter:blur(' + blurPx + 'px)' + (blurPx > 0 ? ';transform:scale(1.' + Math.min(20, Math.ceil(blurPx / 2)) + ')' : ''),
          dimPct > 0 ? ';background:#000' : '',
          'background-position:center', 'background-repeat:no-repeat'
        ].join(';')
        if (wp.type === 'image') {
          layer.style.backgroundImage = 'url("/ext/dshp-inx-custom-ui/file/' + encodeURIComponent(wp.file) + '")'
          layer.style.backgroundSize = 'cover'
          if (dimPct > 0) layer.style.opacity = String(1 - dimPct)
        } else {
          /* 动态壁纸：内嵌静音循环视频，同样吃 blur/dim */
          const video = document.createElement('video')
          video.autoplay = true
          video.loop = true
          video.muted = true
          video.playsInline = true
          video.setAttribute('playsinline', '')
          video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover'
          video.src = '/ext/dshp-inx-custom-ui/file/' + encodeURIComponent(wp.file)
          if (dimPct > 0) video.style.opacity = String(1 - dimPct)
          layer.appendChild(video)
          layer.style.background = '#000'
        }
        document.body.prepend(layer)
      }

      /* 样式层：壁纸时压暗主框架底色并给三栏加毛玻璃；无壁纸时仅圆角生效。
       * 类名取自 layout/settings/conversation 的 CSS module 实值（VOzbGW_/pI_x6G_/gdEzaW_）。 */
      const css = []
      if (hasWallpaper) {
        /* frame/中间栏透明，露出 body 壁纸层；body 兜底深色防白闪 */
        css.push('body{background:#101014 !important}')
        css.push('.pI_x6G_frame{background:transparent !important}')
        const glassOn = gl.enabled === true
        /* color-mix 的第二个分量必须是 62% 这样的百分比——之前传 0.72 导致整条
         * 声明非法，三栏背景没变透明，壁纸看起来"不生效"。 */
        const alphaPct = glassOn ? 62 : 85
        const colBg = (token) => 'color-mix(in srgb, ' + token + ' ' + alphaPct + '%, transparent)'
        /* 毛玻璃必须放在 ::before 伪元素上，绝不能放在 sidebarCol/detailsCol 元素自身：
         * backdrop-filter 会把元素变成其内 position:fixed 后代的包含块——
         * 设置 dialog（.VOzbGW_overlay fixed）渲染在 sidebar 树内（SettingsRoot
         * 挂 sidebar.settings 槽），一旦 sidebarCol 自带 backdrop-filter，
         * dialog 的定位基准就从视口变成侧栏列，整个面板被压进侧栏（真实翻车案例）。
         * 伪元素不构成 fixed 后代的包含块，安全。 */
        const glassBefore = (selector, token) => selector + '::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none'
          + (glassOn ? ';backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2)' : '')
          + ';background:' + colBg(token) + '}'
        css.push('.pI_x6G_sidebarCol,.pI_x6G_detailsCol,.pI_x6G_centerCol{position:relative;background:transparent !important}')
        css.push(glassBefore('.pI_x6G_sidebarCol', 'var(--dsw-specific-sidebar-fill)'))
        css.push(glassBefore('.pI_x6G_detailsCol', 'var(--dsw-alias-bg-layer-1)'))
        /* 会话内容区也透出壁纸（浅覆盖，保证气泡可读） */
        css.push('.pI_x6G_centerCol::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:color-mix(in srgb, var(--dsw-alias-bg-base) ' + (glassOn ? 30 : 55) + '%, transparent)}')
      }
      /* 全局圆角：-1 跟随主题；0 全锐角；12 统一圆润。 */
      const r = Number(rd.global)
      if (Number.isFinite(r)) {
        if (r === 0) {
          css.push([
            '.gdEzaW_bubble', '.VOzbGW_panel', '.VOzbGW_navCell', '.VOzbGW_close',
            'button', 'input', 'textarea', 'select', '[class*="_card"]', '[class*="_bubble"]'
          ].join(',') + '{border-radius:0 !important}')
        } else if (r > 0) {
          css.push([
            '.gdEzaW_bubble', '.VOzbGW_panel', '.VOzbGW_navCell', '.VOzbGW_close'
          ].join(',') + '{border-radius:' + Math.min(24, r) + 'px !important}')
        }
      }
      if (css.length > 0) {
        const style = document.createElement('style')
        style.id = cssId
        style.textContent = css.join('\n')
        document.head.appendChild(style)
      }
    }


    return module.exports
  }
})
