/**
 * photo.js —— 壁纸取色引擎（Material You / MD3 动态配色）。
 *
 * 从用户上传的壁纸中提取 seed 色，生成整套 MD3 色彩系统：
 *   1. 壁纸缩到 48×48，逐像素采色；
 *   2. 饱和度过滤后在 HSL 空间按色相分 12 桶，加权选出 seed；
 *   3. seed 派生 5 组 ref 调色板（primary / secondary / tertiary / neutral /
 *      neutral-variant，色调号≈明度%，HSL 近似非 HCT）+ 固定 error 红；
 *   4. 按 MD3 基线映射 light / dark 两套 sys 色彩；
 *   5. sys 色彩再映射为 DSH overrideTokens 所需的 --dsw-* token。
 *
 * 导出格式兼容 MD3 令牌命名：--md-ref-palette-* + --md-sys-color-*-light/dark。
 * 持久化只存 { accent(seed), companionA, companionB }（settings 兼容旧数据，
 * seed 恒等于 accent；旧数据的 accent 直接当 seed 重建 MD3 主题）。
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
 * 从 ImageData 提取 seed 色（饱和度加权 + 色相分桶）。
 * 全灰图兜底默认蓝。
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

/**
 * 从 canvas ImageData 生成持久化调色盘。
 * accent 恒等于 seed（settings 兼容字段）；companions 仅作信息性派生。
 */
export function extractPalette(data) {
  const seed = extractDominant(data)
  const pal = buildM3Palettes(seed)
  return {
    accent: seed,
    companionA: pal.tertiary[60],
    companionB: pal.secondary[60]
  }
}

/** MD3 ref 调色板色调号全集（含 expressive 容器色调）。 */
export const M3_TONES = [0, 4, 6, 10, 12, 17, 20, 22, 24, 25, 30, 35, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 99, 100]

/** 预览条展示的色调号子集。 */
export const M3_PREVIEW_TONES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95]

function m3Tone(h, s, t) {
  if (t <= 0) return '#000000'
  if (t >= 100) return '#ffffff'
  return hslToHex(h, s, t / 100)
}

/**
 * seed → 6 组 ref 调色板（每组色调号 → hex）。
 * primary 保底饱和；secondary 降饱和；tertiary 色相+60；
 * neutral 近无彩；neutral-variant 弱彩；error 固定 MD3 红。
 */
export function buildM3Palettes(seed) {
  const { h, s } = hexToHsl(seed)
  const clampS = (v) => Math.min(0.9, Math.max(0, v))
  const defs = {
    primary: { h, s: clampS(Math.max(s, 0.45)) },
    secondary: { h, s: clampS(s * 0.45) },
    tertiary: { h: (h + 60) % 360, s: clampS(Math.max(s * 0.6, 0.3)) },
    neutral: { h, s: clampS(Math.min(s * 0.12, 0.08)) },
    neutralVariant: { h, s: clampS(Math.min(Math.max(s * 0.3, 0.1), 0.2)) },
    error: { h: 4, s: 0.72 }
  }
  const out = { seed }
  for (const key of Object.keys(defs)) {
    const tones = {}
    for (const t of M3_TONES) tones[t] = m3Tone(defs[key].h, defs[key].s, t)
    out[key] = tones
  }
  return out
}

/** ref 调色板 → MD3 基线 sys 色彩（light / dark）。 */
export function buildM3Scheme(pal, scheme) {
  const P = pal.primary
  const S = pal.secondary
  const T = pal.tertiary
  const N = pal.neutral
  const NV = pal.neutralVariant
  const E = pal.error
  if (scheme === 'dark') {
    return {
      primary: P[80], onPrimary: P[20], primaryContainer: P[30], onPrimaryContainer: P[90],
      secondary: S[80], onSecondary: S[20], secondaryContainer: S[30], onSecondaryContainer: S[90],
      tertiary: T[80], onTertiary: T[20], tertiaryContainer: T[30], onTertiaryContainer: T[90],
      error: E[80], onError: E[20], errorContainer: E[30], onErrorContainer: E[90],
      background: N[6], onBackground: N[90],
      surfaceDim: N[6], surface: N[6], surfaceBright: N[24],
      surfaceContainerLowest: N[4], surfaceContainerLow: N[10], surfaceContainer: N[12],
      surfaceContainerHigh: N[17], surfaceContainerHighest: N[22],
      onSurface: N[90], onSurfaceVariant: NV[80],
      outline: NV[60], outlineVariant: NV[30],
      shadow: '#000000', scrim: '#000000',
      inverseSurface: N[90], inverseOnSurface: N[20], inversePrimary: P[40],
      surfaceTint: P[80]
    }
  }
  return {
    primary: P[40], onPrimary: P[100], primaryContainer: P[90], onPrimaryContainer: P[10],
    secondary: S[40], onSecondary: S[100], secondaryContainer: S[90], onSecondaryContainer: S[10],
    tertiary: T[40], onTertiary: T[100], tertiaryContainer: T[90], onTertiaryContainer: T[10],
    error: E[40], onError: E[100], errorContainer: E[90], onErrorContainer: E[10],
    background: N[99], onBackground: N[10],
    surfaceDim: N[87], surface: N[99], surfaceBright: N[100],
    surfaceContainerLowest: N[100], surfaceContainerLow: N[96], surfaceContainer: N[94],
    surfaceContainerHigh: N[92], surfaceContainerHighest: N[90],
    onSurface: N[10], onSurfaceVariant: NV[30],
    outline: NV[50], outlineVariant: NV[80],
    shadow: '#000000', scrim: '#000000',
    inverseSurface: N[20], inverseOnSurface: N[95], inversePrimary: P[80],
    surfaceTint: P[40]
  }
}

/** MD3 ref 名 → 令牌名。 */
export const M3_REF_NAMES = {
  primary: 'primary', secondary: 'secondary', tertiary: 'tertiary',
  neutral: 'neutral', neutralVariant: 'neutral-variant', error: 'error'
}

/** MD3 sys 角色 → 令牌名。 */
export const M3_SYS_NAMES = {
  primary: 'primary', onPrimary: 'on-primary',
  primaryContainer: 'primary-container', onPrimaryContainer: 'on-primary-container',
  secondary: 'secondary', onSecondary: 'on-secondary',
  secondaryContainer: 'secondary-container', onSecondaryContainer: 'on-secondary-container',
  tertiary: 'tertiary', onTertiary: 'on-tertiary',
  tertiaryContainer: 'tertiary-container', onTertiaryContainer: 'on-tertiary-container',
  error: 'error', onError: 'on-error',
  errorContainer: 'error-container', onErrorContainer: 'on-error-container',
  background: 'background', onBackground: 'on-background',
  surfaceDim: 'surface-dim', surface: 'surface', surfaceBright: 'surface-bright',
  surfaceContainerLowest: 'surface-container-lowest', surfaceContainerLow: 'surface-container-low',
  surfaceContainer: 'surface-container', surfaceContainerHigh: 'surface-container-high',
  surfaceContainerHighest: 'surface-container-highest',
  onSurface: 'on-surface', onSurfaceVariant: 'on-surface-variant',
  outline: 'outline', outlineVariant: 'outline-variant',
  shadow: 'shadow', scrim: 'scrim',
  inverseSurface: 'inverse-surface', inverseOnSurface: 'inverse-on-surface',
  inversePrimary: 'inverse-primary', surfaceTint: 'surface-tint'
}

/**
 * seed → MD3 导出 CSS（--md-ref-palette-* + --md-sys-color-*-light/dark）。
 * 与 MD3 色彩令牌命名规范兼容，可直接粘贴进任何 MD3 项目。
 */
export function buildM3ExportCss(seed) {
  const pal = buildM3Palettes(seed)
  const lines = [':root {', `  /* seed: ${seed} · Material You (MD3) · exported by dshp-inx-custom-ui */`]
  for (const key of Object.keys(M3_REF_NAMES)) {
    for (const t of M3_TONES) lines.push(`  --md-ref-palette-${M3_REF_NAMES[key]}${t}: ${pal[key][t]};`)
  }
  const schemes = { light: buildM3Scheme(pal, 'light'), dark: buildM3Scheme(pal, 'dark') }
  for (const sk of ['light', 'dark']) {
    lines.push(`  /* sys-${sk} */`)
    const roles = schemes[sk]
    for (const role of Object.keys(M3_SYS_NAMES)) {
      lines.push(`  --md-sys-color-${M3_SYS_NAMES[role]}-${sk}: ${roles[role]};`)
    }
  }
  lines.push('}')
  return lines.join('\n')
}

/**
 * MD3 sys 色彩 → DSH 单侧 --dsw-* token（overrideTokens pair 前的单侧形态）。
 * 入参 seed 字符串或持久化 palette（seed 恒等于 accent，兼容旧数据）。
 * 渐变经 --dshp-cu-body-gradient 注入（renderBodyGradient 消费）。
 */
export function buildPhotoTokens(seedOrPalette, scheme) {
  const seed = typeof seedOrPalette === 'string' ? seedOrPalette : (seedOrPalette.seed || seedOrPalette.accent)
  const pal = buildM3Palettes(seed)
  const m = buildM3Scheme(pal, scheme)
  const dark = scheme === 'dark'

  const brand = m.primary
  const brandHover = dark ? pal.primary[70] : pal.primary[30]
  const info = m.tertiary
  const infoHover = dark ? pal.tertiary[70] : pal.tertiary[30]
  const textPrimary = m.onSurface
  const textSecondary = withAlpha(m.onSurface, dark ? 0.8 : 0.72)
  const textTertiary = m.onSurfaceVariant
  const textQuaternary = m.outline
  const border1 = m.outlineVariant
  const border2 = m.outline
  const hover = m.surfaceContainerHighest
  const active = m.surfaceContainerHigh
  const err = m.error

  return {
    /* 背景 */
    '--dsw-alias-bg-base': m.surface,
    '--dsw-alias-bg-layer-1': m.surfaceContainerLow,
    '--dsw-alias-bg-layer-2': m.surfaceContainer,
    '--dsw-alias-bg-layer-3': m.surfaceContainerHigh,
    '--dsw-alias-bg-overlay': m.surfaceContainerLow,
    '--dsw-alias-bg-multi-select': m.surfaceContainer,
    '--dsw-alias-bg-module-platform': m.surfaceContainerLow,
    '--dsw-alias-bg-skeleton': m.surfaceContainer,

    /* 边框 */
    '--dsw-alias-border-l1': border1,
    '--dsw-alias-border-l2': border2,
    '--dsw-alias-border-l2-darkmode-thin': border1,
    '--dsw-alias-border-l3': border2,
    '--dsw-alias-border-l4': dark ? textTertiary : border2,
    '--dsw-alias-border-inverted': textPrimary,
    '--dsw-alias-border-inverted2': textSecondary,
    '--dsw-alias-separator-primary': border1,
    '--dsw-alias-line-secondary': m.surfaceContainer,
    '--dsw-alias-fill-l2': m.surfaceContainer,
    '--dsw-alias-fill-tsp-secondary': withAlpha(m.onSurface, dark ? 0.05 : 0.04),

    /* 品牌 */
    '--dsw-alias-brand-primary': brand,
    '--dsw-alias-brand-primary-invert': m.onPrimary,
    '--dsw-alias-brand-text': brand,

    /* 按钮 */
    '--dsw-alias-button-primary-fill': brand,
    '--dsw-alias-button-primary-hover': brandHover,
    '--dsw-alias-button-primary-dimmed': brandHover,
    '--dsw-alias-button-contrast-fill': m.onSurface,
    '--dsw-alias-button-elevated-fill': m.surfaceContainerLow,
    '--dsw-alias-button-floating-fill': m.surfaceContainerLow,
    '--dsw-alias-button-floating-hover': m.surfaceContainer,
    '--dsw-alias-button-ghost-active-border': border2,
    '--dsw-alias-button-ghost-active-fill': hover,
    '--dsw-alias-button-ghost-active-hover': active,
    '--dsw-alias-button-info-fill': info,
    '--dsw-alias-button-info-hover': infoHover,
    '--dsw-alias-button-tool-bar-fill': m.surfaceContainerLow,
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': hover,

    /* 交互 */
    '--dsw-alias-interactive-bg-hover': hover,
    '--dsw-alias-interactive-bg-active': active,
    '--dsw-alias-interactive-bg-hover-accent': withAlpha(brand, dark ? 0.2 : 0.12),
    '--dsw-alias-interactive-bg-hover-danger': withAlpha(err, dark ? 0.18 : 0.1),
    '--dsw-alias-interactive-bg-hover-solid': active,

    /* 文字 */
    '--dsw-alias-label-primary': textPrimary,
    '--dsw-alias-label-secondary': textSecondary,
    '--dsw-alias-label-tertiary': textTertiary,
    '--dsw-alias-label-quaternary': textQuaternary,
    '--dsw-alias-label-caption': textTertiary,
    '--dsw-alias-label-dimmed': textQuaternary,
    '--dsw-alias-label-error': err,
    '--dsw-alias-label-primary-foreground': dark ? textPrimary : '#ffffff',
    '--dsw-alias-label-primary-inverted': dark ? m.surface : '#ffffff',
    '--dsw-alias-label-primary-bluish': brand,

    /* 语义 */
    '--dsw-alias-state-error-primary': err,
    '--dsw-alias-state-error-secondary': withAlpha(err, dark ? 0.15 : 0.1),
    '--dsw-alias-state-success-primary': dark ? '#4ade80' : '#16a34a',
    '--dsw-alias-state-success-secondary': withAlpha('#22c55e', dark ? 0.15 : 0.1),
    '--dsw-alias-state-warn-primary': dark ? '#fbbf24' : '#d97706',
    '--dsw-alias-state-warn-secondary': withAlpha('#f59e0b', dark ? 0.15 : 0.1),
    '--dsw-alias-state-warn-label': dark ? '#fbbf24' : '#b45309',

    /* Markdown */
    '--dsw-alias-markdown-citation': brand,
    '--dsw-alias-markdown-code-block': m.surfaceContainerLow,
    '--dsw-alias-markdown-code-block-banner': m.surfaceContainer,
    '--dsw-alias-markdown-inline-code': withAlpha(brand, dark ? 0.14 : 0.1),
    '--dsw-alias-markdown-code-segment-selected': withAlpha(brand, dark ? 0.25 : 0.16),
    '--dsw-alias-markdown-code-segment-unselected': 'transparent',
    '--dsw-alias-markdown-placeholder': textQuaternary,
    '--dsw-alias-markdown-tag': textTertiary,

    /* 滚动条 */
    '--dsw-alias-scrollbar-bg-l1': border2,
    '--dsw-alias-scrollbar-bg-l2': m.surfaceContainer,
    '--dsw-alias-scrollbar-hover-l1': textTertiary,
    '--dsw-alias-scrollbar-hover-l2': border2,

    /* 浮层 */
    '--dsw-alias-toast-bg': m.inverseSurface,
    '--dsw-alias-tooltip-bg': m.inverseSurface,
    '--dsw-hovercard-bg': m.surfaceContainerLow,

    /* 特定区域 */
    '--dsw-specific-sidebar-fill': m.surface,
    '--dsw-specific-sidebar-nav-item-active': active,
    '--dsw-specific-sidebar-nav-item-active-accent': brand,
    '--dsw-specific-sidebar-nav-item-hover': hover,
    '--dsw-specific-bubble': m.surfaceContainerLow,
    '--dsw-specific-bubble-highlight': m.surfaceContainer,
    '--dsw-specific-input-major': m.surfaceContainerLow,
    '--dsw-specific-login-input': m.surfaceContainerLow,
    '--dsw-specific-menu': m.surfaceContainer,
    '--dsw-specific-selector': m.surfaceContainer,
    '--dsw-specific-tip': m.surfaceContainer,

    /* 阴影 */
    '--dsw-shadow-lv1': dark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)',
    '--dsw-shadow-lv2': dark ? '0 4px 16px rgba(0,0,0,0.45)' : '0 2px 8px rgba(0,0,0,0.08)',
    '--dsw-shadow-lv3': dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.1)',
    '--dsw-shadow-lv1-blur': '8px',

    /* 自定义：body 渐变（renderBodyGradient 消费） */
    '--dshp-cu-body-gradient': dark
      ? `radial-gradient(1000px 600px at 85% -10%, ${withAlpha(m.tertiary, 0.16)}, transparent 55%), radial-gradient(900px 560px at 8% 108%, ${withAlpha(m.secondary, 0.13)}, transparent 58%), linear-gradient(180deg, ${m.surface}, ${pal.neutral[4]})`
      : `radial-gradient(1000px 600px at 85% -10%, ${withAlpha(m.tertiary, 0.22)}, transparent 55%), radial-gradient(900px 560px at 8% 108%, ${withAlpha(m.secondary, 0.18)}, transparent 58%), linear-gradient(180deg, ${m.surface}, ${pal.neutral[96]})`,

    '--dsw-font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    '--dsw-font-mono': '"Berkeley Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
  }
}
