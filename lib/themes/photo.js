/**
 * photo.js —— 图片取色主题引擎（调色盘「自选颜色」）。
 *
 * 从用户上传的图片中提取主色，派生出完整的一套主题 token（亮/暗成对），
 * 生成 CSS 渐变背景（不是贴图）——参考 QQ 超级调色盘的自定义配色。
 *
 * 算法（浏览器端，纯 canvas，无依赖）：
 *   1. 图片缩到 48×48，逐像素采色；
 *   2. 饱和度过滤（跳过接近灰的像素）后在 HSL 空间按色相分 12 桶；
 *   3. 每桶取平均色，按「桶大小 × 饱和度」加权选出主色 accent；
 *   4. 从 accent 派生整套配色：
 *      - 暗主题：accent 压暗到 8% 亮度做画布，18% 做抬升面，accent 提亮做交互色；
 *      - 亮主题：accent 去饱和+提亮做画布，accent 本体做交互色；
 *   5. 输出亮/暗两份完整 token（含 CSS 渐变 body 背景）。
 */

/** hex → {h,s,l}（0-360 / 0-1 / 0-1）。 */
export function hexToHsl(hex) {
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

/** hsl → hex。 */
export function hslToHex(h, s, l) {
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

/** rgba 数组 → hex。 */
function rgbToHex(r, g, b) {
  const to = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return '#' + to(r) + to(g) + to(b)
}

/** hex → rgb 数组。 */
function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

/** hex + alpha → rgba() 字符串。 */
export function withAlpha(hex, a) {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/**
 * 从 ImageData 提取主色（饱和度加权 + 色相分桶）。
 * 返回主色 hex（一般 2-3 个备选中的第一个）。
 */
export function extractDominant(data) {
  const buckets = new Array(12).fill(null).map(() => ({ count: 0, r: 0, g: 0, b: 0, sat: 0 }))
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]; const g = data[i + 1]; const b = data[i + 2]
    const { h, s, l } = hexToHsl(rgbToHex(r, g, b))
    if (s < 0.15 || l < 0.06 || l > 0.96) continue /* 跳过灰/黑/白 */
    const bucket = buckets[Math.floor(h / 30) % 12]
    bucket.count++
    bucket.r += r; bucket.g += g; bucket.b += b
    bucket.sat += s
  }
  let best = null
  let bestScore = 0
  for (const bucket of buckets) {
    if (bucket.count === 0) continue
    const avgSat = bucket.sat / bucket.count
    const score = bucket.count * (0.3 + avgSat)
    if (score > bestScore) { bestScore = score; best = bucket }
  }
  if (!best) return '#3b82f6' /* 全灰图兜底：默认蓝 */
  return rgbToHex(best.r / best.count, best.g / best.count, best.b / best.count)
}

/** 从 canvas ImageData 生成调色盘（主色 + 辅助色）。 */
export function extractPalette(data) {
  const accent = extractDominant(data)
  const { h } = hexToHsl(accent)
  /* 辅助色：色相 ±28° 的两个近邻，用于渐变层次 */
  return {
    accent,
    companionA: hslToHex(h + 28, Math.min(0.85, hexToHsl(accent).s + 0.05), 0.52),
    companionB: hslToHex(h - 28, Math.min(0.8, hexToHsl(accent).s), 0.46)
  }
}

/**
 * 从调色盘生成亮/暗两份完整主题 token（走 overrideTokens pair 前的单侧形态）。
 * 暗主题：画布用 accent 极暗色 + 渐变；亮主题：画布用 accent 极淡色 + 渐变。
 * 渐变通过额外 CSS 变量 --dshp-cu-body-gradient 注入（renderLayer 消费），
 * token 层只管面/字/边框/交互色。
 */
export function buildPhotoTokens(palette, scheme) {
  const { accent } = palette
  const { h, s } = hexToHsl(accent)
  const dark = scheme === 'dark'

  /* 画布体系：同色相不同亮度 */
  const base = dark
    ? { bg: hslToHex(h, Math.min(0.5, s * 0.7), 0.07), l1: hslToHex(h, Math.min(0.45, s * 0.6), 0.11), l2: hslToHex(h, Math.min(0.42, s * 0.55), 0.145), l3: hslToHex(h, Math.min(0.4, s * 0.5), 0.18) }
    : { bg: hslToHex(h, 0.28, 0.97), l1: hslToHex(h, 0.22, 0.94), l2: hslToHex(h, 0.18, 0.91), l3: hslToHex(h, 0.16, 0.88) }

  /* 品牌色：暗态提亮（保对比），亮态加深 */
  const brand = dark ? hslToHex(h, Math.max(0.55, s), 0.62) : hslToHex(h, Math.max(0.6, s), 0.42)
  const brandHover = dark ? hslToHex(h, Math.max(0.55, s), 0.72) : hslToHex(h, Math.max(0.6, s), 0.34)

  /* 文字体系 */
  const textPrimary = dark ? hslToHex(h, 0.08, 0.95) : hslToHex(h, 0.35, 0.12)
  const textSecondary = dark ? hslToHex(h, 0.06, 0.78) : hslToHex(h, 0.22, 0.28)
  const textTertiary = dark ? hslToHex(h, 0.05, 0.6) : hslToHex(h, 0.16, 0.45)
  const textQuaternary = dark ? hslToHex(h, 0.05, 0.44) : hslToHex(h, 0.12, 0.6)

  /* 边框 */
  const border1 = dark ? hslToHex(h, 0.3, 0.2) : hslToHex(h, 0.24, 0.86)
  const border2 = dark ? hslToHex(h, 0.35, 0.3) : hslToHex(h, 0.3, 0.74)

  /* 交互悬停 */
  const hover = dark ? hslToHex(h, 0.3, 0.15) : hslToHex(h, 0.3, 0.92)
  const active = dark ? hslToHex(h, 0.32, 0.2) : hslToHex(h, 0.32, 0.88)

  return {
    /* 背景 */
    '--dsw-alias-bg-base': base.bg,
    '--dsw-alias-bg-layer-1': base.l1,
    '--dsw-alias-bg-layer-2': base.l2,
    '--dsw-alias-bg-layer-3': base.l3,
    '--dsw-alias-bg-overlay': base.l1,
    '--dsw-alias-bg-multi-select': base.l2,
    '--dsw-alias-bg-module-platform': base.l1,
    '--dsw-alias-bg-skeleton': base.l2,

    /* 边框 */
    '--dsw-alias-border-l1': border1,
    '--dsw-alias-border-l2': border2,
    '--dsw-alias-border-l2-darkmode-thin': border1,
    '--dsw-alias-border-l3': border2,
    '--dsw-alias-border-l4': dark ? textTertiary : border2,
    '--dsw-alias-border-inverted': textPrimary,
    '--dsw-alias-border-inverted2': textSecondary,
    '--dsw-alias-separator-primary': border1,
    '--dsw-alias-line-secondary': base.l2,
    '--dsw-alias-fill-l2': base.l2,
    '--dsw-alias-fill-tsp-secondary': dark ? withAlpha(textPrimary, 0.05) : withAlpha(textPrimary, 0.04),

    /* 品牌 */
    '--dsw-alias-brand-primary': brand,
    '--dsw-alias-brand-primary-invert': dark ? base.bg : '#ffffff',
    '--dsw-alias-brand-text': brand,

    /* 按钮 */
    '--dsw-alias-button-primary-fill': brand,
    '--dsw-alias-button-primary-hover': brandHover,
    '--dsw-alias-button-primary-dimmed': brandHover,
    '--dsw-alias-button-contrast-fill': textPrimary,
    '--dsw-alias-button-elevated-fill': base.l1,
    '--dsw-alias-button-floating-fill': base.l1,
    '--dsw-alias-button-floating-hover': base.l2,
    '--dsw-alias-button-ghost-active-border': border2,
    '--dsw-alias-button-ghost-active-fill': hover,
    '--dsw-alias-button-ghost-active-hover': active,
    '--dsw-alias-button-info-fill': brand,
    '--dsw-alias-button-info-hover': brandHover,
    '--dsw-alias-button-tool-bar-fill': base.l1,
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': hover,

    /* 交互 */
    '--dsw-alias-interactive-bg-hover': hover,
    '--dsw-alias-interactive-bg-active': active,
    '--dsw-alias-interactive-bg-hover-accent': withAlpha(brand, dark ? 0.2 : 0.12),
    '--dsw-alias-interactive-bg-hover-danger': withAlpha('#ef4444', dark ? 0.18 : 0.1),
    '--dsw-alias-interactive-bg-hover-solid': active,

    /* 文字 */
    '--dsw-alias-label-primary': textPrimary,
    '--dsw-alias-label-secondary': textSecondary,
    '--dsw-alias-label-tertiary': textTertiary,
    '--dsw-alias-label-quaternary': textQuaternary,
    '--dsw-alias-label-caption': textTertiary,
    '--dsw-alias-label-dimmed': textQuaternary,
    '--dsw-alias-label-error': dark ? '#f87171' : '#dc2626',
    '--dsw-alias-label-primary-foreground': dark ? textPrimary : '#ffffff',
    '--dsw-alias-label-primary-inverted': dark ? base.bg : '#ffffff',
    '--dsw-alias-label-primary-bluish': brand,

    /* 语义 */
    '--dsw-alias-state-error-primary': dark ? '#f87171' : '#dc2626',
    '--dsw-alias-state-error-secondary': withAlpha('#ef4444', dark ? 0.15 : 0.1),
    '--dsw-alias-state-success-primary': dark ? '#4ade80' : '#16a34a',
    '--dsw-alias-state-success-secondary': withAlpha('#22c55e', dark ? 0.15 : 0.1),
    '--dsw-alias-state-warn-primary': dark ? '#fbbf24' : '#d97706',
    '--dsw-alias-state-warn-secondary': withAlpha('#f59e0b', dark ? 0.15 : 0.1),
    '--dsw-alias-state-warn-label': dark ? '#fbbf24' : '#b45309',

    /* Markdown */
    '--dsw-alias-markdown-citation': brand,
    '--dsw-alias-markdown-code-block': base.l1,
    '--dsw-alias-markdown-code-block-banner': base.l2,
    '--dsw-alias-markdown-inline-code': withAlpha(brand, dark ? 0.14 : 0.1),
    '--dsw-alias-markdown-code-segment-selected': withAlpha(brand, dark ? 0.25 : 0.16),
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': textQuaternary,
    '--dsw-alias-markdown-tag': textTertiary,

    /* 滚动条 */
    '--dsw-alias-scrollbar-bg-l1': border2,
    '--dsw-alias-scrollbar-bg-l2': base.l2,
    '--dsw-alias-scrollbar-hover-l1': textTertiary,
    '--dsw-alias-scrollbar-hover-l2': border2,

    /* 浮层 */
    '--dsw-alias-toast-bg': base.l1,
    '--dsw-alias-tooltip-bg': dark ? base.l3 : hslToHex(h, 0.35, 0.14),
    '--dsw-hovercard-bg': base.l1,

    /* 特定区域 */
    '--dsw-specific-sidebar-fill': base.bg,
    '--dsw-specific-sidebar-nav-item-active': active,
    '--dsw-specific-sidebar-nav-item-active-accent': brand,
    '--dsw-specific-sidebar-nav-item-hover': hover,
    '--dsw-specific-bubble': base.l1,
    '--dsw-specific-bubble-highlight': base.l2,
    '--dsw-specific-input-major': base.l1,
    '--dsw-specific-login-input': base.l1,
    '--dsw-specific-menu': base.l1,
    '--dsw-specific-selector': base.l1,
    '--dsw-specific-tip': base.l2,

    /* 阴影 */
    '--dsw-shadow-lv1': dark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)',
    '--dsw-shadow-lv2': dark ? '0 4px 16px rgba(0,0,0,0.45)' : '0 2px 8px rgba(0,0,0,0.08)',
    '--dsw-shadow-lv3': dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.1)',
    '--dsw-shadow-lv1-blur': '8px',

    /* 自定义：body 渐变（renderBodyGradient 消费，模拟 QQ 卡片的渐变观感） */
    '--dshp-cu-body-gradient': dark
      ? `radial-gradient(1000px 600px at 85% -10%, ${withAlpha(palette.companionA, 0.16)}, transparent 55%), radial-gradient(900px 560px at 8% 108%, ${withAlpha(palette.companionB, 0.13)}, transparent 58%), linear-gradient(180deg, ${base.bg}, ${hslToHex(h, Math.min(0.5, s * 0.7), 0.05)})`
      : `radial-gradient(1000px 600px at 85% -10%, ${withAlpha(palette.companionA, 0.22)}, transparent 55%), radial-gradient(900px 560px at 8% 108%, ${withAlpha(palette.companionB, 0.18)}, transparent 58%), linear-gradient(180deg, ${base.bg}, ${hslToHex(h, 0.28, 0.99)})`,

    '--dsw-font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    '--dsw-font-mono': '"Berkeley Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
  }
}
