/* custom-ui client half — hand-authored __ModuleLoader__ bundle.
 * 「外观定制 = 调色盘」：参考 QQ 超级调色盘——分组主题卡片（渐变色卡）+
 * 图片取色生成专属渐变主题（上传图片 → 提取主色 → 亮/暗双套 token + body 渐变）。
 * 架构：官方亮/暗为唯一偏好（overrideTokens 覆盖层），持久化走 Host settings。
 * 主题 token 数据与 lib/themes/*.js 保持同步（同一来源规范）；photo 取色算法
 * 与 lib/themes/photo.js 同源。 */
window.__ModuleLoader__.load({
  id: '@dshp-inx/custom-ui',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const React = require('react')

    /* ── 调色盘样式（全部走 --dsw-* 主题 token，随主题自适应）── */
    const CSS = `
.tg-page{display:flex;flex-direction:column;gap:14px;color:var(--dsw-alias-label-primary)}
.tg-head{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.tg-group{display:flex;flex-direction:column;gap:10px}
.tg-groupTitle{display:flex;flex-direction:column;gap:2px}
.tg-groupName{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600;line-height:20px}
.tg-groupSub{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.tg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:12px}
.tg-card{display:flex;flex-direction:column;gap:8px;padding:10px;cursor:pointer;text-align:left;border-radius:12px;font:inherit;color:inherit;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);transition:border-color .15s,background .15s,transform .15s}
.tg-card:hover{background:var(--dsw-alias-interactive-bg-hover);transform:translateY(-1px)}
.tg-card:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.tg-card.tg-active{border:2px solid var(--dsw-alias-brand-primary)}
/* 卡片内：色块（渐变条）+ 名字 + 描述，纵向 */
.tg-swatch{display:block;width:100%;height:36px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1)}
.tg-nameRow{display:flex;align-items:center;gap:6px;min-height:18px}
.tg-name{font-size:12.5px;font-weight:600;line-height:17px;color:var(--dsw-alias-label-primary)}
.tg-badge{font-size:10px;padding:1px 6px;border-radius:999px;background:var(--dsw-alias-brand-primary);color:#fff;white-space:nowrap;flex:none}
.tg-desc{font-size:11px;color:var(--dsw-alias-label-tertiary);line-height:15px}
.tg-photoSwatch{background:conic-gradient(from 180deg,#f87171,#fbbf24,#4ade80,#38bdf8,#818cf8,#f472b6,#f87171)}
.tg-release{border:none;background:none;padding:0;font:inherit;font-size:12px;cursor:pointer;color:var(--dsw-alias-brand-primary)}
.tg-release:hover{text-decoration:underline}
.tg-release:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;border-radius:2px}
.tg-radiusRow{display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--dsw-alias-border-l1);padding-top:12px;margin-top:4px}
.tg-radiusLabel{font-size:12px;color:var(--dsw-alias-label-secondary)}
.tg-radiusBtns{display:flex;gap:8px;flex-wrap:wrap}
.tg-radiusBtn{padding:8px 12px;font-size:12px}
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

    /* ── 主题目录（与 lib/themes/index.js 的 THEME_CATALOG 同源）──
     * gradient：卡片渐变背景（QQ 调色盘观感）；group：分组归属。 */
    const THEMES = [
      { id: 'opencode-terminal-dark', colorScheme: 'dark', tokens: opencodeDark, label: '暱夜终端', desc: '暖黑 + Apple 蓝', group: '终端美学', gradient: 'linear-gradient(135deg,#201d1d,#302c2c 60%,#007aff)' },
      { id: 'opencode-terminal-light', colorScheme: 'light', tokens: opencodeLight, label: '纸感终端', desc: '暖白 + 暖灰', group: '终端美学', gradient: 'linear-gradient(135deg,#fdfcfc,#f1eeee 60%,#e2dcdc)' },
      { id: 'github-dark', colorScheme: 'dark', tokens: githubDark, label: 'GitHub 暗色', desc: '#0d1117 + Primer 蓝', group: '终端美学', gradient: 'linear-gradient(135deg,#0d1117,#161b22 60%,#2f81f7)' },
      { id: 'github-light', colorScheme: 'light', tokens: githubLight, label: 'GitHub 亮色', desc: '纯白 + #0969da', group: '终端美学', gradient: 'linear-gradient(135deg,#ffffff,#f6f8fa 60%,#0969da)' },
      { id: 'linear-dark', colorScheme: 'dark', tokens: linearDark, label: 'Linear 无彩', desc: '近黑 + Indigo', group: '极简风物', gradient: 'linear-gradient(135deg,#08090a,#191a1b 55%,#5e6ad2)' },
      { id: 'notion-light', colorScheme: 'light', tokens: notionLight, label: 'Notion 暖白', desc: '纯白 + 暖灰', group: '极简风物', gradient: 'linear-gradient(135deg,#ffffff,#f6f5f4 55%,#e8e7e5)' },
      { id: 'claude-parchment-light', colorScheme: 'light', tokens: claudeLight, label: 'Claude 羊皮纸', desc: '羊皮纸 + 赤陶', group: '极简风物', gradient: 'linear-gradient(135deg,#f5f4ed,#faf9f5 55%,#c96442)' },
      { id: 'nvidia-dark', colorScheme: 'dark', tokens: nvidiaDark, label: 'NVIDIA 硬核', desc: '纯黑 + 信号绿', group: '极简风物', gradient: 'linear-gradient(135deg,#000000,#1a1a1a 55%,#76b900)' },
    ]

    /* 分组定义（QQ 调色盘式：组名 + 文艺副标题）。 */
    const GROUPS = [
      { name: '终端美学', sub: '代码即诗，暗色为主的两端开发味' },
      { name: '极简风物', sub: '少即是多，克制的品牌色' }
    ]

    /* ── 图片取色主题（与 lib/themes/photo.js 同源）── */
    function hexToHsl(hex) {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      const max = Math.max(r, g, b); const min = Math.min(r, g, b)
      let h = 0; let s = 0
      const l = (max + min) / 2
      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        else if (max === g) h = ((b - r) / d + 2) / 6
        else h = ((r - g) / d + 4) / 6
      }
      return { h: h * 360, s, l }
    }
    function hslToHex(h, s, l) {
      h = ((h % 360) + 360) % 360
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
      const m = l - c / 2
      let r = 0; let g = 0; let b = 0
      const seg = Math.floor(h / 60)
      if (seg === 0) { r = c; g = x } else if (seg === 1) { r = x; g = c } else if (seg === 2) { g = c; b = x } else if (seg === 3) { g = x; b = c } else if (seg === 4) { r = x; b = c } else { r = c; b = x }
      const to = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
      return '#' + to(r) + to(g) + to(b)
    }
    function rgbToHex(r, g, b) {
      const to = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
      return '#' + to(r) + to(g) + to(b)
    }
    function withAlpha(hex, a) {
      const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16)
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')'
    }

    /** 从 ImageData 提取主色：饱和度过滤 + 色相分桶 + 加权选桶。 */
    function extractDominant(data) {
      const buckets = new Array(12).fill(null).map(() => ({ count: 0, r: 0, g: 0, b: 0, sat: 0 }))
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]; const g = data[i + 1]; const b = data[i + 2]
        const { h, s, l } = hexToHsl(rgbToHex(r, g, b))
        if (s < 0.15 || l < 0.06 || l > 0.96) continue
        const bucket = buckets[Math.floor(h / 30) % 12]
        bucket.count++
        bucket.r += r; bucket.g += g; bucket.b += b
        bucket.sat += s
      }
      let best = null; let bestScore = 0
      for (const bucket of buckets) {
        if (bucket.count === 0) continue
        const score = bucket.count * (0.3 + bucket.sat / bucket.count)
        if (score > bestScore) { bestScore = score; best = bucket }
      }
      if (!best) return '#3b82f6'
      return rgbToHex(best.r / best.count, best.g / best.count, best.b / best.count)
    }

    function extractPalette(data) {
      const accent = extractDominant(data)
      const { h, s } = hexToHsl(accent)
      return {
        accent,
        companionA: hslToHex(h + 28, Math.min(0.85, s + 0.05), 0.52),
        companionB: hslToHex(h - 28, Math.min(0.8, s), 0.46)
      }
    }

    /** 调色盘 → 完整主题 token（亮/暗双份，与 lib/themes/photo.js 同源）。 */
    function buildPhotoTokens(palette, scheme) {
      const { accent } = palette
      const { h, s } = hexToHsl(accent)
      const dark = scheme === 'dark'
      const base = dark
        ? { bg: hslToHex(h, Math.min(0.5, s * 0.7), 0.07), l1: hslToHex(h, Math.min(0.45, s * 0.6), 0.11), l2: hslToHex(h, Math.min(0.42, s * 0.55), 0.145), l3: hslToHex(h, Math.min(0.4, s * 0.5), 0.18) }
        : { bg: hslToHex(h, 0.28, 0.97), l1: hslToHex(h, 0.22, 0.94), l2: hslToHex(h, 0.18, 0.91), l3: hslToHex(h, 0.16, 0.88) }
      const brand = dark ? hslToHex(h, Math.max(0.55, s), 0.62) : hslToHex(h, Math.max(0.6, s), 0.42)
      const brandHover = dark ? hslToHex(h, Math.max(0.55, s), 0.72) : hslToHex(h, Math.max(0.6, s), 0.34)
      const textPrimary = dark ? hslToHex(h, 0.08, 0.95) : hslToHex(h, 0.35, 0.12)
      const textSecondary = dark ? hslToHex(h, 0.06, 0.78) : hslToHex(h, 0.22, 0.28)
      const textTertiary = dark ? hslToHex(h, 0.05, 0.6) : hslToHex(h, 0.16, 0.45)
      const textQuaternary = dark ? hslToHex(h, 0.05, 0.44) : hslToHex(h, 0.12, 0.6)
      const border1 = dark ? hslToHex(h, 0.3, 0.2) : hslToHex(h, 0.24, 0.86)
      const border2 = dark ? hslToHex(h, 0.35, 0.3) : hslToHex(h, 0.3, 0.74)
      const hover = dark ? hslToHex(h, 0.3, 0.15) : hslToHex(h, 0.3, 0.92)
      const active = dark ? hslToHex(h, 0.32, 0.2) : hslToHex(h, 0.32, 0.88)
      return {
        '--dsw-alias-bg-base': base.bg, '--dsw-alias-bg-layer-1': base.l1, '--dsw-alias-bg-layer-2': base.l2, '--dsw-alias-bg-layer-3': base.l3,
        '--dsw-alias-bg-overlay': base.l1, '--dsw-alias-bg-multi-select': base.l2, '--dsw-alias-bg-module-platform': base.l1, '--dsw-alias-bg-skeleton': base.l2,
        '--dsw-alias-border-l1': border1, '--dsw-alias-border-l2': border2, '--dsw-alias-border-l2-darkmode-thin': border1, '--dsw-alias-border-l3': border2,
        '--dsw-alias-border-l4': dark ? textTertiary : border2, '--dsw-alias-border-inverted': textPrimary, '--dsw-alias-border-inverted2': textSecondary,
        '--dsw-alias-separator-primary': border1, '--dsw-alias-line-secondary': base.l2, '--dsw-alias-fill-l2': base.l2,
        '--dsw-alias-fill-tsp-secondary': dark ? withAlpha(textPrimary, 0.05) : withAlpha(textPrimary, 0.04),
        '--dsw-alias-brand-primary': brand, '--dsw-alias-brand-primary-invert': dark ? base.bg : '#ffffff', '--dsw-alias-brand-text': brand,
        '--dsw-alias-button-primary-fill': brand, '--dsw-alias-button-primary-hover': brandHover, '--dsw-alias-button-primary-dimmed': brandHover,
        '--dsw-alias-button-contrast-fill': textPrimary, '--dsw-alias-button-elevated-fill': base.l1, '--dsw-alias-button-floating-fill': base.l1,
        '--dsw-alias-button-floating-hover': base.l2, '--dsw-alias-button-ghost-active-border': border2, '--dsw-alias-button-ghost-active-fill': hover,
        '--dsw-alias-button-ghost-active-hover': active, '--dsw-alias-button-info-fill': brand, '--dsw-alias-button-info-hover': brandHover,
        '--dsw-alias-button-tool-bar-fill': base.l1, '--dsw-alias-button-tool-bar-fill-invisible': 'transparent', '--dsw-alias-button-tool-bar-hover': hover,
        '--dsw-alias-interactive-bg-hover': hover, '--dsw-alias-interactive-bg-active': active,
        '--dsw-alias-interactive-bg-hover-accent': withAlpha(brand, dark ? 0.2 : 0.12), '--dsw-alias-interactive-bg-hover-danger': withAlpha('#ef4444', dark ? 0.18 : 0.1),
        '--dsw-alias-interactive-bg-hover-solid': active,
        '--dsw-alias-label-primary': textPrimary, '--dsw-alias-label-secondary': textSecondary, '--dsw-alias-label-tertiary': textTertiary,
        '--dsw-alias-label-quaternary': textQuaternary, '--dsw-alias-label-caption': textTertiary, '--dsw-alias-label-dimmed': textQuaternary,
        '--dsw-alias-label-error': dark ? '#f87171' : '#dc2626', '--dsw-alias-label-primary-foreground': dark ? textPrimary : '#ffffff',
        '--dsw-alias-label-primary-inverted': dark ? base.bg : '#ffffff', '--dsw-alias-label-primary-bluish': brand,
        '--dsw-alias-state-error-primary': dark ? '#f87171' : '#dc2626', '--dsw-alias-state-error-secondary': withAlpha('#ef4444', dark ? 0.15 : 0.1),
        '--dsw-alias-state-success-primary': dark ? '#4ade80' : '#16a34a', '--dsw-alias-state-success-secondary': withAlpha('#22c55e', dark ? 0.15 : 0.1),
        '--dsw-alias-state-warn-primary': dark ? '#fbbf24' : '#d97706', '--dsw-alias-state-warn-secondary': withAlpha('#f59e0b', dark ? 0.15 : 0.1),
        '--dsw-alias-state-warn-label': dark ? '#fbbf24' : '#b45309',
        '--dsw-alias-markdown-citation': brand, '--dsw-alias-markdown-code-block': base.l1, '--dsw-alias-markdown-code-block-banner': base.l2,
        '--dsw-alias-markdown-inline-code': withAlpha(brand, dark ? 0.14 : 0.1), '--dsw-alias-markdown-code-segment-selected': withAlpha(brand, dark ? 0.25 : 0.16),
        '--dsw-alias-markdown-code-segment-unselected': 'transparent', '--dsw-alias-markdown-placeholder': textQuaternary, '--dsw-alias-markdown-tag': textTertiary,
        '--dsw-alias-scrollbar-bg-l1': border2, '--dsw-alias-scrollbar-bg-l2': base.l2, '--dsw-alias-scrollbar-hover-l1': textTertiary, '--dsw-alias-scrollbar-hover-l2': border2,
        '--dsw-alias-toast-bg': base.l1, '--dsw-alias-tooltip-bg': dark ? base.l3 : hslToHex(h, 0.35, 0.14), '--dsw-hovercard-bg': base.l1,
        '--dsw-specific-sidebar-fill': base.bg, '--dsw-specific-sidebar-nav-item-active': active, '--dsw-specific-sidebar-nav-item-active-accent': brand,
        '--dsw-specific-sidebar-nav-item-hover': hover, '--dsw-specific-bubble': base.l1, '--dsw-specific-bubble-highlight': base.l2,
        '--dsw-specific-input-major': base.l1, '--dsw-specific-login-input': base.l1, '--dsw-specific-menu': base.l1,
        '--dsw-specific-selector': base.l1, '--dsw-specific-tip': base.l2,
        '--dsw-shadow-lv1': dark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)',
        '--dsw-shadow-lv2': dark ? '0 4px 16px rgba(0,0,0,0.45)' : '0 2px 8px rgba(0,0,0,0.08)',
        '--dsw-shadow-lv3': dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.1)', '--dsw-shadow-lv1-blur': '8px',
        '--dshp-cu-body-gradient': dark
          ? 'radial-gradient(1000px 600px at 85% -10%, ' + withAlpha(palette.companionA, 0.16) + ', transparent 55%), radial-gradient(900px 560px at 8% 108%, ' + withAlpha(palette.companionB, 0.13) + ', transparent 58%), linear-gradient(180deg, ' + base.bg + ', ' + hslToHex(h, Math.min(0.5, s * 0.7), 0.05) + ')'
          : 'radial-gradient(1000px 600px at 85% -10%, ' + withAlpha(palette.companionA, 0.22) + ', transparent 55%), radial-gradient(900px 560px at 8% 108%, ' + withAlpha(palette.companionB, 0.18) + ', transparent 58%), linear-gradient(180deg, ' + base.bg + ', ' + hslToHex(h, 0.28, 0.99) + ')',
        '--dsw-font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
        '--dsw-font-mono': '"Berkeley Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
      }
    }

    /** 图片 File → 调色盘（48×48 canvas 采样）。 */
    function paletteFromFile(file) {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = 48; canvas.height = 48
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            ctx.drawImage(img, 0, 0, 48, 48)
            const data = ctx.getImageData(0, 0, 48, 48).data
            resolve(extractPalette(data))
          } catch (e) { reject(e) } finally { URL.revokeObjectURL(url) }
        }
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片解码失败')) }
        img.src = url
      })
    }

    /* 图片主题的运行时登记表：id 'photo:<hash>'；palette 持久化到 settings。 */
    const PHOTO_ID = 'photo:custom'
    let photoTheme = null /* { palette, dark, light } */
    /* apply 作用域的 renderBodyGradient 注入桥（Gallery 的 theme/change 监听调用） */
    const renderBodyGradientRef = { fn: null }


    /* ── 持久化主题选择：非空 = 有自定义覆盖层在生效（见 apply 的覆盖层架构）── */
    let desiredId = ''
    /* 持久化的全局圆角（-1 默认；画廊挂载时作初值） */
    let desiredRadius = -1

    /* 内置主题的画廊显示名（light/dark 也能在画廊里被切回）。 */
    const BUILTIN_LABELS = { light: '浅色（内置）', dark: '深色（内置）' }

    /* 官方样式表的原始 alias/specific token 值（无操作覆盖用）。
     * 来源：dsh-client-ui-theme 的 body 与 body[data-ds-dark-theme] 规则。
     * 覆盖层的对侧 scheme 分支填这些 var() 引用 —— 用户在官方亮/暗之间切换时，
     * 覆盖层自动呈现对侧官方原值，等于"没有覆盖"。 */
    const OFFICIAL_LIGHT = {
      "--dsw-alias-bg-base": "var(--dsw-static-neutral-bluish-00)", "--dsw-alias-bg-layer-1": "var(--dsw-static-neutral-bluish-00)", "--dsw-alias-bg-layer-2": "var(--dsw-static-neutral-bluish-00)", "--dsw-alias-bg-layer-3": "var(--dsw-static-neutral-bluish-00)", "--dsw-alias-bg-mask-1": "#0000003d", "--dsw-alias-bg-mask-2": "#0000001f", "--dsw-alias-bg-mask-3": "#0000007a", "--dsw-alias-bg-mask-photo": "#000000e0", "--dsw-alias-bg-mask-drop": "#ffffffb3", "--dsw-alias-bg-module-platform": "var(--dsw-static-neutral-bluish-60)", "--dsw-alias-bg-multi-select": "var(--dsw-static-neutral-bluish-60)", "--dsw-alias-bg-overlay": "var(--dsw-static-neutral-bluish-150)", "--dsw-alias-bg-skeleton": "#0000000a", "--dsw-alias-border-inverted2": "#0000", "--dsw-alias-border-inverted": "#0000", "--dsw-alias-border-l1": "#0000000a", "--dsw-alias-border-l2-darkmode-thin": "#0000001a", "--dsw-alias-border-l2": "#0000001a", "--dsw-alias-border-l3": "#0000001f", "--dsw-alias-border-l4": "#00000029", "--dsw-alias-brand-primary-invert": "var(--dsw-static-neutral-bluish-1000)", "--dsw-alias-brand-primary": "var(--dsw-static-neutral-bluish-1000)", "--dsw-alias-brand-text": "var(--dsw-static-neutral-bluish-1000)", "--dsw-alias-button-contrast-fill": "var(--dsw-static-neutral-bluish-700)", "--dsw-alias-button-elevated-fill": "var(--dsw-static-neutral-bluish-00)", "--dsw-alias-button-floating-fill": "var(--dsw-static-neutral-bluish-00)", "--dsw-alias-button-floating-hover": "var(--dsw-static-neutral-bluish-75)", "--dsw-alias-button-ghost-active-border": "var(--dsw-static-neutral-bluish-500)", "--dsw-alias-button-ghost-active-fill": "var(--dsw-static-neutral-bluish-100)", "--dsw-alias-button-ghost-active-hover": "var(--dsw-static-neutral-bluish-150)", "--dsw-alias-button-info-fill": "var(--dsw-static-deepseek-500)", "--dsw-alias-button-info-hover": "var(--dsw-static-deepseek-400)", "--dsw-alias-button-primary-dimmed": "var(--dsw-static-neutral-bluish-100)", "--dsw-alias-button-primary-fill": "var(--dsw-alias-brand-primary)", "--dsw-alias-button-primary-hover": "var(--dsw-static-neutral-bluish-750)", "--dsw-alias-button-tool-bar-fill-invisible": "#1f1f1f5c", "--dsw-alias-button-tool-bar-fill": "#54555780", "--dsw-alias-button-tool-bar-hover": "#54555799", "--dsw-alias-interactive-bg-active": "#2631481a", "--dsw-alias-interactive-bg-hover-accent": "#26314824", "--dsw-alias-interactive-bg-hover-danger": "#ec13130d", "--dsw-alias-interactive-bg-hover-solid": "var(--dsw-static-neutral-bluish-75)", "--dsw-alias-interactive-bg-hover": "#2631480f", "--dsw-alias-label-caption": "var(--dsw-static-neutral-bluish-400)", "--dsw-alias-label-dimmed": "var(--dsw-static-neutral-bluish-200)", "--dsw-alias-label-primary-bluish": "var(--dsw-static-blue-900)", "--dsw-alias-label-primary-dimmed": "var(--dsw-static-neutral-bluish-950)", "--dsw-alias-label-primary-foreground": "var(--dsw-static-neutral-bluish-00)", "--dsw-alias-label-primary-inverted": "var(--dsw-static-neutral-bluish-00)", "--dsw-alias-label-primary": "var(--dsw-static-neutral-bluish-1000)", "--dsw-alias-label-secondary": "var(--dsw-static-neutral-bluish-700)", "--dsw-alias-label-tertiary": "var(--dsw-static-neutral-bluish-600)", "--dsw-alias-markdown-citation": "var(--dsw-static-neutral-bluish-100)", "--dsw-alias-markdown-code-block-banner": "var(--dsw-static-neutral-bluish-50)", "--dsw-alias-markdown-code-block": "var(--dsw-static-neutral-bluish-50)", "--dsw-alias-markdown-code-segment-selected": "var(--dsw-static-neutral-bluish-00)", "--dsw-alias-markdown-code-segment-unselected": "var(--dsw-static-neutral-bluish-75)", "--dsw-alias-markdown-inline-code": "var(--dsw-static-neutral-bluish-100)", "--dsw-alias-markdown-placeholder": "var(--dsw-static-neutral-bluish-60)", "--dsw-alias-markdown-tag": "var(--dsw-static-neutral-bluish-75)", "--dsw-alias-scrollbar-bg-l1": "var(--dsw-static-neutral-200)", "--dsw-alias-scrollbar-bg-l2": "var(--dsw-static-neutral-200)", "--dsw-alias-scrollbar-hover-l1": "var(--dsw-static-neutral-300)", "--dsw-alias-scrollbar-hover-l2": "var(--dsw-static-neutral-300)", "--dsw-alias-state-business-primary": "var(--dsw-static-deepseek-500)", "--dsw-alias-state-business-tertiary": "var(--dsw-static-deepseek-100)", "--dsw-alias-state-error-primary": "var(--dsw-static-red-600)", "--dsw-alias-state-error-secondary": "var(--dsw-static-red-400)", "--dsw-alias-state-success-primary": "var(--dsw-static-green-500)", "--dsw-alias-state-success-secondary": "var(--dsw-static-green-400)", "--dsw-alias-state-success-tertiary": "var(--dsw-static-green-100)", "--dsw-alias-state-warn-label": "var(--dsw-static-amber-600)", "--dsw-alias-state-warn-primary": "var(--dsw-static-amber-500)", "--dsw-alias-state-warn-secondary": "var(--dsw-static-amber-400)", "--dsw-alias-state-warn-tertiary": "var(--dsw-static-amber-100)", "--dsw-alias-toast-bg": "var(--dsw-static-neutral-bluish-800)", "--dsw-alias-tooltip-bg": "var(--dsw-static-neutral-bluish-850)", "--dsw-specific-bubble-highlight": "var(--dsw-static-deepseek-200)", "--dsw-specific-bubble": "var(--dsw-static-deepseek-50)", "--dsw-specific-input-major": "var(--dsw-static-neutral-bluish-00)", "--dsw-specific-login-input": "var(--dsw-static-neutral-bluish-50)", "--dsw-specific-menu": "var(--dsw-alias-bg-layer-3)", "--dsw-specific-selector": "var(--dsw-static-neutral-bluish-60)", "--dsw-specific-sidebar-fill": "var(--dsw-static-neutral-bluish-50)", "--dsw-specific-sidebar-nav-item-active-accent": "var(--dsw-static-deepseek-100)", "--dsw-specific-sidebar-nav-item-active": "var(--dsw-static-neutral-bluish-100)", "--dsw-specific-sidebar-nav-item-hover": "var(--dsw-static-neutral-bluish-75)", "--dsw-specific-tip": "var(--dsw-static-neutral-bluish-60)"
    }
    const OFFICIAL_DARK = {
      "--dsw-alias-bg-base": "var(--dsw-static-neutral-bluish-950)", "--dsw-alias-bg-layer-1": "var(--dsw-static-neutral-bluish-900)", "--dsw-alias-bg-layer-2": "var(--dsw-static-neutral-bluish-850)", "--dsw-alias-bg-layer-3": "var(--dsw-static-neutral-bluish-800)", "--dsw-alias-bg-mask-1": "#ffffff1a", "--dsw-alias-bg-mask-2": "#ffffff0f", "--dsw-alias-bg-mask-3": "#ffffff4d", "--dsw-alias-bg-mask-photo": "#000000e0", "--dsw-alias-bg-mask-drop": "#ffffff33", "--dsw-alias-bg-module-platform": "var(--dsw-static-neutral-bluish-900)", "--dsw-alias-bg-multi-select": "var(--dsw-static-neutral-bluish-850)", "--dsw-alias-bg-overlay": "var(--dsw-static-neutral-bluish-850)", "--dsw-alias-bg-skeleton": "#ffffff0d", "--dsw-alias-border-inverted2": "#0000", "--dsw-alias-border-inverted": "#0000", "--dsw-alias-border-l1": "#ffffff12", "--dsw-alias-border-l2-darkmode-thin": "#ffffff14", "--dsw-alias-border-l2": "#ffffff1f", "--dsw-alias-border-l3": "#ffffff29", "--dsw-alias-border-l4": "#ffffff33", "--dsw-alias-brand-primary-invert": "var(--dsw-static-neutral-bluish-00)", "--dsw-alias-brand-primary": "var(--dsw-static-deepseek-400)", "--dsw-alias-brand-text": "var(--dsw-static-deepseek-400)", "--dsw-alias-button-contrast-fill": "var(--dsw-static-neutral-bluish-100)", "--dsw-alias-button-elevated-fill": "var(--dsw-static-neutral-bluish-900)", "--dsw-alias-button-floating-fill": "var(--dsw-static-neutral-bluish-850)", "--dsw-alias-button-floating-hover": "var(--dsw-static-neutral-bluish-800)", "--dsw-alias-button-ghost-active-border": "var(--dsw-static-neutral-bluish-600)", "--dsw-alias-button-ghost-active-fill": "var(--dsw-static-neutral-bluish-850)", "--dsw-alias-button-ghost-active-hover": "var(--dsw-static-neutral-bluish-800)", "--dsw-alias-button-info-fill": "var(--dsw-static-deepseek-400)", "--dsw-alias-button-info-hover": "var(--dsw-static-deepseek-300)", "--dsw-alias-button-primary-dimmed": "var(--dsw-static-deepseek-600)", "--dsw-alias-button-primary-fill": "var(--dsw-alias-brand-primary)", "--dsw-alias-button-primary-hover": "var(--dsw-static-deepseek-450)", "--dsw-alias-button-tool-bar-fill-invisible": "#54555799", "--dsw-alias-button-tool-bar-fill": "#54555780", "--dsw-alias-button-tool-bar-hover": "#54555799", "--dsw-alias-interactive-bg-active": "#5686fe29", "--dsw-alias-interactive-bg-hover-accent": "#5686fe33", "--dsw-alias-interactive-bg-hover-danger": "#f25a5a33", "--dsw-alias-interactive-bg-hover-solid": "var(--dsw-static-neutral-bluish-800)", "--dsw-alias-interactive-bg-hover": "#5686fe1f", "--dsw-alias-label-caption": "var(--dsw-static-neutral-bluish-500)", "--dsw-alias-label-dimmed": "var(--dsw-static-neutral-bluish-600)", "--dsw-alias-label-primary-bluish": "var(--dsw-static-blue-100)", "--dsw-alias-label-primary-dimmed": "var(--dsw-static-neutral-bluish-50)", "--dsw-alias-label-primary-foreground": "var(--dsw-static-neutral-bluish-950)", "--dsw-alias-label-primary-inverted": "var(--dsw-static-neutral-bluish-00)", "--dsw-alias-label-primary": "var(--dsw-static-neutral-bluish-00)", "--dsw-alias-label-secondary": "var(--dsw-static-neutral-bluish-100)", "--dsw-alias-label-tertiary": "var(--dsw-static-neutral-bluish-600)", "--dsw-alias-markdown-citation": "var(--dsw-static-deepseek-400)", "--dsw-alias-markdown-code-block-banner": "var(--dsw-static-neutral-bluish-900)", "--dsw-alias-markdown-code-block": "var(--dsw-static-neutral-bluish-900)", "--dsw-alias-markdown-code-segment-selected": "var(--dsw-static-neutral-bluish-50)", "--dsw-alias-markdown-code-segment-unselected": "var(--dsw-static-neutral-bluish-700)", "--dsw-alias-markdown-inline-code": "var(--dsw-static-neutral-bluish-800)", "--dsw-alias-markdown-placeholder": "var(--dsw-static-neutral-bluish-700)", "--dsw-alias-markdown-tag": "var(--dsw-static-neutral-bluish-700)", "--dsw-alias-scrollbar-bg-l1": "var(--dsw-static-neutral-400)", "--dsw-alias-scrollbar-bg-l2": "var(--dsw-static-neutral-500)", "--dsw-alias-scrollbar-hover-l1": "var(--dsw-static-neutral-500)", "--dsw-alias-scrollbar-hover-l2": "var(--dsw-static-neutral-600)", "--dsw-alias-state-business-primary": "var(--dsw-static-deepseek-400)", "--dsw-alias-state-business-tertiary": "var(--dsw-static-deepseek-100)", "--dsw-alias-state-error-primary": "var(--dsw-static-red-400)", "--dsw-alias-state-error-secondary": "var(--dsw-static-red-400)", "--dsw-alias-state-success-primary": "var(--dsw-static-green-400)", "--dsw-alias-state-success-secondary": "var(--dsw-static-green-400)", "--dsw-alias-state-success-tertiary": "var(--dsw-static-green-100)", "--dsw-alias-state-warn-label": "var(--dsw-static-amber-400)", "--dsw-alias-state-warn-primary": "var(--dsw-static-amber-400)", "--dsw-alias-state-warn-secondary": "var(--dsw-static-amber-400)", "--dsw-alias-state-warn-tertiary": "var(--dsw-static-amber-100)", "--dsw-alias-toast-bg": "var(--dsw-static-neutral-bluish-800)", "--dsw-alias-tooltip-bg": "var(--dsw-static-neutral-bluish-850)", "--dsw-specific-bubble-highlight": "var(--dsw-static-deepseek-700)", "--dsw-specific-bubble": "var(--dsw-static-deepseek-800)", "--dsw-specific-input-major": "var(--dsw-static-neutral-bluish-900)", "--dsw-specific-login-input": "var(--dsw-static-neutral-bluish-850)", "--dsw-specific-menu": "var(--dsw-alias-bg-layer-3)", "--dsw-specific-selector": "var(--dsw-static-neutral-bluish-850)", "--dsw-specific-sidebar-fill": "var(--dsw-static-neutral-bluish-900)", "--dsw-specific-sidebar-nav-item-active-accent": "var(--dsw-static-deepseek-700)", "--dsw-specific-sidebar-nav-item-active": "var(--dsw-static-neutral-bluish-800)", "--dsw-specific-sidebar-nav-item-hover": "var(--dsw-static-neutral-bluish-850)", "--dsw-specific-tip": "var(--dsw-static-neutral-bluish-700)"
    }


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
    function createGallery(ctx, theme, bridge, applyChoice) {
      return function ThemeGallery() {
        const [revision, setRevision] = React.useState(-1)
        const [notice, setNotice] = React.useState(null)
        const [radiusCfg, setRadiusCfg] = React.useState(desiredRadius)
        React.useEffect(function () {
          return ctx.on('theme/change', function (snap) {
            setRevision(snap && typeof snap.revision === 'number' ? snap.revision : 0)
            /* 亮暗切换后渐变需按新 scheme 重渲染（photo 主题双分支） */
            if (typeof renderBodyGradientRef.fn === 'function') renderBodyGradientRef.fn()
          })
        }, [])
        const snap = theme.getTheme()
        const current = snap && snap.active ? snap.active.id : ''
        const resolved = snap && snap.preference === 'system'
          ? (current === 'dark' ? 'dark' : 'light')
          : (snap ? snap.preference : current)
        const label = {}
        for (const t of THEMES) label[t.id] = t.label
        label[PHOTO_ID] = '我的取色主题'
        label.light = BUILTIN_LABELS.light
        label.dark = BUILTIN_LABELS.dark
        /* 新架构下「当前态」显示：官方 scheme（resolved）+ 是否有自定义层（desiredId） */
        const currentLabel = desiredId.length > 0 && label[desiredId]
          ? label[desiredId]
          : (resolved === 'dark' ? BUILTIN_LABELS.dark : resolved === 'light' ? BUILTIN_LABELS.light : current)

        const pick = function (t) {
          desiredId = t.id
          /* 新架构：覆盖层 + 官方偏好双写，无守护 */
          applyChoice(t.id)
          bridge.saveTheme(t.id).then(function (reply) {
            setNotice(reply && reply.ok ? null : { err: (reply && reply.error) || '主题选择保存失败（重启后会回到官方默认）' })
          }).catch(function (e) {
            setNotice({ err: '主题选择保存失败：' + String((e && e.message) || e) })
          })
        }

        /* 回到官方默认：撤销覆盖层 + 清持久化；官方亮/暗偏好保留原值。 */
        const release = function () {
          desiredId = ''
          applyChoice('')
          bridge.saveTheme('').then(function (reply) {
            setNotice(reply && reply.ok
              ? { err: null, ok: '已回到官方默认配色；亮/暗请用上方「外观」行切换' }
              : { err: (reply && reply.error) || '清除失败' })
          }).catch(function (e) {
            setNotice({ err: '清除失败：' + String((e && e.message) || e) })
          })
        }

        /* 卡片渲染：色块（渐变）+ 名字 + 描述，纵向排列 */
        const mkCard = (t, active, onPick) => {
          return React.createElement('button', {
            key: t.id,
            className: active ? 'tg-card tg-active' : 'tg-card',
            onClick: onPick
          },
            React.createElement('span', { className: 'tg-swatch', style: { background: t.gradient || 'linear-gradient(135deg,#666,#888)' } }),
            React.createElement('span', { className: 'tg-nameRow' },
              React.createElement('span', { className: 'tg-name' }, t.label),
              active ? React.createElement('span', { className: 'tg-badge' }, '使用中') : null),
            React.createElement('span', { className: 'tg-desc' }, t.desc))
        }

        const groupSections = []
        for (const g of GROUPS) {
          const cards = THEMES.filter((t) => t.group === g.name).map((t) =>
            mkCard(t, desiredId === t.id, () => pick(t)))
          groupSections.push(React.createElement('div', { key: g.name, className: 'tg-group' },
            React.createElement('div', { className: 'tg-groupTitle' },
              React.createElement('span', { className: 'tg-groupName' }, g.name),
              React.createElement('span', { className: 'tg-groupSub' }, g.sub)),
            React.createElement('div', { className: 'tg-grid' }, cards)))
        }

        /* 我的取色（QQ「自选颜色」）：上传图片 → 提取主色 → 渐变主题 */
        const [photoBusy, setPhotoBusy] = React.useState(false)
        const pickPhoto = function (file) {
          if (!file) return
          setPhotoBusy(true)
          paletteFromFile(file).then(function (palette) {
            photoTheme = { palette, dark: buildPhotoTokens(palette, 'dark'), light: buildPhotoTokens(palette, 'light') }
            desiredId = PHOTO_ID
            applyChoice(PHOTO_ID)
            /* palette 持久化到 settings（Host 端存色值，不存图） */
            bridge.saveConfig({ photoPalette: palette }).then(function (reply) {
              setPhotoBusy(false)
              setNotice(reply && reply.ok
                ? { err: null, ok: '取色主题已生成（' + palette.accent + '）并保存；亮/暗切换请用「外观」行' }
                : { err: '主题已生效但保存失败（重启后会丢失取色）' })
            }).catch(function () { setPhotoBusy(false); setNotice({ err: '主题已生效但保存失败' }) })
            /* saveTheme 存 id；photo 的 token 从 palette 重建（palette 持久化即可重建 token） */
            bridge.saveTheme(PHOTO_ID).catch(function () {})
          }).catch(function (e) {
            setPhotoBusy(false)
            setNotice({ err: '取色失败：' + String((e && e.message) || e) })
          })
        }
        const photoActive = desiredId === PHOTO_ID
        const photoSection = React.createElement('div', { key: 'photo', className: 'tg-group' },
          React.createElement('div', { className: 'tg-groupTitle' },
            React.createElement('span', { className: 'tg-groupName' }, '我的取色'),
            React.createElement('span', { className: 'tg-groupSub' }, '上传一张图片，提取主色生成专属渐变主题')),
          React.createElement('div', { className: 'tg-grid' },
            photoTheme || photoActive
              ? mkCard(
                { id: PHOTO_ID, label: photoTheme ? '主色 ' + photoTheme.palette.accent : '我的取色主题', desc: '图片提取的专属配色', gradient: photoTheme ? 'linear-gradient(135deg,' + photoTheme.palette.companionB + ',' + photoTheme.palette.accent + ' 55%,' + photoTheme.palette.companionA + ')' : 'linear-gradient(135deg,#f472b6,#38bdf8)' },
                photoActive,
                function () { desiredId = PHOTO_ID; applyChoice(PHOTO_ID); bridge.saveTheme(PHOTO_ID).catch(function () {}) })
              : null,
            React.createElement('label', { key: 'photo-upload', className: 'tg-card', style: { cursor: 'pointer' } },
              React.createElement('span', { className: 'tg-swatch tg-photoSwatch' }),
              React.createElement('span', { className: 'tg-nameRow' },
                React.createElement('span', { className: 'tg-name' }, photoBusy ? '取色中…' : '上传图片取色')),
              React.createElement('span', { className: 'tg-desc' }, 'png/jpg/webp，本地采样不上传'),
              React.createElement('input', {
                type: 'file', accept: '.png,.jpg,.jpeg,.webp',
                style: { display: 'none' }, disabled: photoBusy,
                onChange: function (e) { pickPhoto(e.target.files && e.target.files[0]); e.target.value = '' }
              }))))

        /* 全局圆角三档：保存即生效（独立于主题，保留的轻量外观能力） */
        const pickRadius = function (v) {
          setRadiusCfg(v)
          bridge.saveConfig({ radius: { global: v } }).then(function (reply) {
            if (reply && reply.ok === true) applyRadius(reply.radius)
          }).catch(function () { /* 保存失败静默：下次刷新回读 */ })
        }
        const rdNow = radiusCfg && typeof radiusCfg.global === 'number' ? radiusCfg.global : -1
        const radiusButtons = [['-1', '默认（跟随主题）'], ['0', '全锐角'], ['12', '圆润（12px）']].map(function (opt) {
          const value = Number(opt[0])
          const active = rdNow === value
          return React.createElement('button', {
            key: opt[0],
            className: active ? 'tg-card tg-active tg-radiusBtn' : 'tg-card tg-radiusBtn',
            onClick: function () { pickRadius(value) }
          }, opt[1])
        })

        return React.createElement('div', { key: 'tg-r' + String(revision), className: 'tg-page' },
          React.createElement('p', { className: 'tg-head' }, '当前主题：' + currentLabel + '（点击卡片切换，选择自动保存）'),
          notice && notice.err ? React.createElement('p', { className: 'tg-head', style: { color: 'var(--dsw-alias-state-error-primary)' } }, notice.err) : null,
          notice && notice.ok ? React.createElement('p', { className: 'tg-head', style: { color: 'var(--dsw-alias-state-success-primary)' } }, notice.ok) : null,
          groupSections,
          photoSection,
          React.createElement('p', { className: 'tg-head' },
            '不用调色盘了？',
            ' ',
            React.createElement('button', {
              className: 'tg-release',
              onClick: release
            }, '回到官方默认配色（亮/暗请用「外观」行切换）')),
          React.createElement('div', { className: 'tg-radiusRow' },
            React.createElement('span', { className: 'tg-radiusLabel' }, '全局圆角'),
            React.createElement('div', { className: 'tg-radiusBtns' }, radiusButtons))
        )
      }
    }

    exports.inject = ['slots', 'theme']
    exports.apply = function apply(ctx) {
      const slots = ctx.get('slots')
      const theme = ctx.get('theme')
      if (slots === undefined || theme === undefined) return

      /* 画廊设置页 */
      const style = document.createElement('style')
      style.setAttribute('data-plugin-css', 'dshp-inx-custom-ui/gallery.css')
      style.textContent = CSS
      document.head.appendChild(style)
      ctx.effect(function () { return function () { style.remove() } }, 'custom-ui: section styles')

      /* ── 新架构：官方亮/暗为唯一偏好，自定义主题作为 overrideTokens 覆盖层 ──
       *
       * 设计（遵循官方系统，不再与之对抗）：
       *   - 不再 register 自定义主题 id——官方 ui-theme.preference 只认
       *     light/dark/system，之前注册自定义 id 后守护与 adopt 互相抢夺偏好。
       *   - 每套主题 = 一个 token 覆盖层 { 每 token: {light, dark} }：
       *     · 主题自身 scheme 分支填主题值；
       *     · 对侧分支填官方样式表原始值（var(--dsw-static-…) 引用，无操作覆盖），
       *       用户切官方亮/暗时覆盖层自动呈现对侧（=官方原样）。
       *   - 选主题 = overrideTokens('dshp-inx-custom-ui', pair) + setTheme(主题scheme)
       *     ——本质就是"切官方亮/暗 + 换 CSS"，与官方外观行完全同轨，
       *     官方 adopt() 读到的偏好永远合法，无需任何守护。
       *   - 「回到官方默认」= 撤销覆盖层（disposer）。
       * 官方 preference=system 时按 prefers-color-scheme 解析，覆盖层随之自动切换。 */
      const OVERRIDE_SOURCE = 'dshp-inx-custom-ui'
      let overrideDispose = null

      function findTheme(id) {
        if (id === PHOTO_ID && photoTheme) {
          return { id: PHOTO_ID, colorScheme: 'dark', tokens: photoTheme.dark, label: '我的取色主题', desc: '从图片提取的专属配色' }
        }
        for (const t of THEMES) if (t.id === id) return t
        return null
      }

      /** 把一套主题 token（单 scheme）展开成官方覆盖层 pair。
       *  photo 主题双 scheme 都有值（亮暗双套）；静态主题对侧回官方原值。 */
      function buildPair(t) {
        const pair = {}
        if (t.id === PHOTO_ID && photoTheme) {
          for (const [name, value] of Object.entries(photoTheme.dark)) {
            pair[name] = { dark: value, light: photoTheme.light[name] || value }
          }
          return pair
        }
        const officialSide = t.colorScheme === 'dark' ? OFFICIAL_LIGHT : OFFICIAL_DARK
        for (const [name, value] of Object.entries(t.tokens)) {
          pair[name] = t.colorScheme === 'dark'
            ? { light: name in officialSide ? officialSide[name] : value, dark: value }
            : { dark: name in officialSide ? officialSide[name] : value, light: value }
        }
        return pair
      }

      /** photo 主题的 body 渐变渲染：--dshp-cu-body-gradient 已在 token 层生效，
       *  这里把 body 背景替换成渐变（官方 body 无渐变概念，需 DOM 层补）。
       *  同步挂到 ref 供 Gallery 的 theme/change 监听复调（亮暗切换重渲染）。 */
      function renderBodyGradient() {
        renderBodyGradientRef.fn = renderBodyGradient
        const bgId = 'dshp-inx-custom-ui-body-gradient'
        const old = document.getElementById(bgId)
        if (old) old.remove()
        const active = theme.getTheme()
        if (!active || !active.active || !active.active.tokens) return
        const grad = active.active.tokens['--dshp-cu-body-gradient']
        if (!grad) return
        const style = document.createElement('style')
        style.id = bgId
        style.textContent = 'body{background:' + grad + ' !important}'
        document.head.appendChild(style)
      }

      /** 应用主题覆盖层 + 官方偏好切到主题 scheme。空 id = 撤销覆盖（回官方）。 */
      function applyThemeChoice(themeId) {
        try {
          if (overrideDispose) { overrideDispose(); overrideDispose = null }
          const t = themeId ? findTheme(themeId) : null
          if (t) {
            overrideDispose = theme.overrideTokens(OVERRIDE_SOURCE, buildPair(t))
            const pref = theme.getTheme().preference
            const scheme = t.id === PHOTO_ID
              ? (pref === 'light' ? 'light' : 'dark') /* photo 双套跟随当前偏好方向 */
              : t.colorScheme
            if (pref !== scheme) theme.setTheme(scheme)
          }
          renderBodyGradient()
        } catch (e) {
          console.error('[dshp-inx-custom-ui] 主题覆盖失败: ' + String(e && e.message))
        }
      }

      /* 启动恢复：读 settings 持久化的 themeId 重建覆盖层；photo 主题从持久化
       * palette 重建 token；同时恢复全局圆角。 */
      const bridge = createBridge()
      bridge.state().then(function (reply) {
        if (reply && reply.ok === true) {
          const saved = typeof reply.themeId === 'string' ? reply.themeId : ''
          const pal = reply.photoPalette
          if (pal && typeof pal.accent === 'string') {
            photoTheme = { palette: pal, dark: buildPhotoTokens(pal, 'dark'), light: buildPhotoTokens(pal, 'light') }
          }
          desiredId = saved
          if (saved.length > 0) applyThemeChoice(saved)
          applyRadius(reply.radius)
          desiredRadius = reply.radius && typeof reply.radius.global === 'number' ? reply.radius.global : -1
        }
      }).catch(function (e) {
        console.log('[dshp-inx-custom-ui] 读取持久化配置失败: ' + String((e && e.message) || e))
      })

      /* 插件停止时清覆盖层（ctx.effect 自动收回）。 */
      ctx.effect(function () {
        return function () {
          if (overrideDispose) { try { overrideDispose() } catch (e) { /* 进程停止，忽略 */ } overrideDispose = null }
        }
      }, 'custom-ui: override teardown')

      const Gallery = createGallery(ctx, theme, bridge, applyThemeChoice)

      /* 外观定制页 = 主题画廊（全局圆角等仍在画廊尾部） */
      ctx.effect(function () {
        return slots.inject('settings.section', function () {
          return slots.register(
            { name: 'settings.section', id: 'dshp-inx-custom-ui', order: 50, label: '外观定制' },
            Gallery
          )
        })
      }, 'custom-ui: settings section')
    }

    /* ── 全局圆角：独立能力保留。-1 跟随主题；0 全锐角；N 统一圆润。
     * 覆盖面：不追官方 hash 类名（升级即漂移、插件组件覆盖不到），改用
     * 语义属性选择器通吃 —— DSH 生态组件类名统一为 'xxx_card' / 'xxx_panel' /
     * 'xxx_bubble'（CSS module 约定），属性选择器 [class*="_card"] 全量命中；
     * 圆形/胶囊（border-radius:50% / 999px）分档保留，避免把头像、徽标掰成方块。── */
    function applyRadius(radius) {
      const cssId = 'dshp-inx-custom-ui-radius-css'
      const old = document.getElementById(cssId)
      if (old) old.remove()
      const r = Number(radius && radius.global)
      const css = []
      if (Number.isFinite(r)) {
        /* 语义面：官方 + 三方插件的卡片 / 面板 / 气泡 + 通用控件 */
        const SURFACES = '[class*="_card"],[class*="_panel"],[class*="_bubble"],[class*="-card"],[class*="-panel"],[class*="-bubble"],button,input,textarea,select'
        if (r === 0) {
          css.push(SURFACES + '{border-radius:0 !important}')
        } else if (r > 0) {
          css.push(SURFACES + '{border-radius:' + Math.min(24, r) + 'px !important}')
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
