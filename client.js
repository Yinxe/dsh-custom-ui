/* custom-ui client half — hand-authored __ModuleLoader__ bundle.
 * 「外观定制 = 调色盘」：主题网格（grid 自适应，一行默认 4 张）+
 * 背景管线（图片/视频壁纸 + 模糊/压暗/磨砂，社区主题式分层）+
 * 壁纸取色生成 Material You 整套配色（上传壁纸 → 提取 seed → MD3 调色板 +
 * 亮/暗双 scheme + body 渐变，导出兼容 MD3 令牌命名）。
 * 架构：官方亮/暗为唯一偏好（overrideTokens 覆盖层），持久化走 Host settings。
 * 主题 token 数据与 lib/themes/*.js 保持同步（同一来源规范）；MD3 引擎
 * 与 lib/themes/photo.js 同源。 */
window.__ModuleLoader__.load({
  id: '@dshp-inx/custom-ui',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const React = require('react')

    /* ── 调色盘样式（全部走 --dsw-* 主题 token，随主题自适应；紧凑版）── */
    const CSS = `
.tg-page{max-width:800px;display:flex;flex-direction:column;gap:8px;color:var(--dsw-alias-label-primary)}
/* 顶部简单配置区：状态 + 圆角 + 快捷操作，一张小面板收拢 */
.tg-topbar{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border-radius:12px;background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2)}
.tg-status{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.tg-status b{color:var(--dsw-alias-label-primary);font-weight:600}
.tg-release{border:none;background:none;padding:0;font:inherit;font-size:12px;cursor:pointer;color:var(--dsw-alias-state-business-primary)}
.tg-release:hover{text-decoration:underline}
.tg-release:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;border-radius:2px}
.tg-ctl{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tg-ctlLabel{font-size:12px;color:var(--dsw-alias-label-tertiary);flex:none}
.tg-ctlSep{width:1px;height:16px;background:var(--dsw-alias-border-l2);flex:none}
.tg-head{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.tg-headErr{color:var(--dsw-alias-state-error-primary)}
.tg-headOk{color:var(--dsw-alias-state-success-primary)}
/* 主题色列表（最后一项）：无分组，grid 密铺默认 4 列自适应 */
.tg-list{display:flex;flex-direction:column;gap:8px;padding-top:8px}
.tg-now{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2)}
.tg-nowMosaic{display:flex;width:76px;height:30px;border-radius:7px;overflow:hidden;flex:none;border:.5px solid var(--dsw-alias-border-l2)}
.tg-nowMosaic i{display:block;height:100%;min-width:0}
.tg-nowMeta{display:flex;flex-direction:column;gap:0;min-width:0;flex:1}
.tg-nowTitle{font-size:12px;font-weight:700;line-height:17px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-nowSub{font-size:11px;line-height:15px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-nowDots{display:flex;gap:5px;align-items:center;flex:none}
.tg-nowDots i{width:12px;height:12px;border-radius:50%;border:.5px solid var(--dsw-alias-border-l2);display:block}
.tg-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tg-search{box-sizing:border-box;height:26px;width:170px;max-width:100%;padding:0 11px;border-radius:13px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;line-height:26px;outline:none}
.tg-search::placeholder{color:var(--dsw-alias-label-quaternary)}
.tg-search:focus{border-color:var(--dsw-alias-brand-primary)}
.tg-count{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
/* 壁纸取色独立配置区（MD3 整套配色预览 + 操作） */
.tg-wall{display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:12px;background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2)}
.tg-wallHead{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tg-wallTitle{font-size:12px;font-weight:700;line-height:18px;color:var(--dsw-alias-label-primary)}
.tg-seedChip{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 9px;border-radius:11px;background:var(--dsw-alias-bg-layer-1);font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dsw-alias-label-secondary)}
.tg-seedChip i{width:11px;height:11px;border-radius:50%;display:block;border:.5px solid var(--dsw-alias-border-l2)}
.tg-wallActions{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.tg-wallBody{display:flex;flex-direction:column;gap:6px}
.tg-toneRow{display:flex;align-items:center;gap:6px}
.tg-toneName{width:88px;flex:none;font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-toneCells{display:flex;flex:1;gap:2px;min-width:0}
.tg-toneCells i{flex:1;height:20px;border-radius:4px;min-width:0;display:block}
.tg-roles{display:flex;flex-direction:column;gap:3px}
.tg-roleRow{display:flex;align-items:flex-start;gap:6px}
.tg-chips{display:flex;flex:1;gap:4px;flex-wrap:wrap;min-width:0}
.tg-chip{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);font-size:10px;line-height:20px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.tg-chip i{width:10px;height:10px;border-radius:3px;display:block;flex:none}
.tg-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-items:stretch}
@media (max-width:720px){.tg-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:520px){.tg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.tg-search{width:130px}}
/* 截图式主题卡·小尺寸：顶部拼接色块 + 编号 + 标签标题描述 + 底部胶囊按钮 + Live 态（grid 子项） */
.tg-card{box-sizing:border-box;display:flex;flex-direction:column;padding:0;overflow:hidden;cursor:pointer;text-align:left;border-radius:12px;font:inherit;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2);min-width:0;width:100%;transition:border-color .15s,box-shadow .15s,transform .15s}
.tg-card:hover:not(.tg-active){border-color:var(--dsw-alias-border-l4)}
.tg-card:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.tg-card.tg-active{background:var(--dsw-alias-bg-module-platform)}
.tg-mosaic{position:relative;display:flex;height:44px;flex:none}
.tg-mosaic i{display:block;height:100%;min-width:0}
.tg-mA{flex:5}
.tg-mB{flex:3}
.tg-mC{flex:2}
.tg-idx{position:absolute;top:4px;right:6px;font-size:9px;line-height:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:rgba(255,255,255,.88);text-shadow:0 1px 3px rgba(0,0,0,.45);letter-spacing:.04em}
.tg-body{display:flex;flex-direction:column;gap:1px;padding:7px 9px 8px;min-width:0}
.tg-tag{font-size:10px;font-weight:600;line-height:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-title{font-size:13px;font-weight:700;line-height:18px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-desc{font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-foot{display:flex;align-items:center;gap:6px;margin-top:6px}
.tg-use{display:inline-flex;align-items:center;justify-content:center;height:22px;padding:0 10px;border:none;border-radius:11px;font-size:11px;font-weight:600;line-height:22px;color:#fff;cursor:pointer;flex:none}
.tg-use:hover{filter:brightness(1.08)}
.tg-live{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:500;line-height:14px;white-space:nowrap}
.tg-live i{width:5px;height:5px;border-radius:50%;background:currentColor;display:inline-block;flex:none}
.tg-check{margin-left:auto;font-size:11px;font-weight:700;flex:none}
.tg-photoSwatch{background:conic-gradient(from 180deg,#f87171,#fbbf24,#4ade80,#38bdf8,#818cf8,#f472b6,#f87171)}
/* 紧凑胶囊按钮（圆角档 + 上传取色共用小尺寸） */
.tg-radiusBtns{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.tg-radiusBtn{box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);height:24px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:12px;align-items:center;gap:6px;padding:0 10px;font-size:11px;line-height:24px;display:inline-flex}
.tg-radiusBtn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.tg-radiusBtn.tg-active{background:var(--dsw-alias-bg-multi-select);box-shadow:inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)}
@media (prefers-reduced-motion:reduce){.tg-card{transition:none}}
/* ── 背景管线设置区 ── */
.tg-bkg{display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:12px;background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2)}
.tg-bkgHead{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tg-bkgTitle{font-size:12px;font-weight:700;line-height:18px;color:var(--dsw-alias-label-primary)}
.tg-bkgActions{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.tg-bkgBody{display:flex;flex-direction:column;gap:8px}
.tg-bkgRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tg-bkgRowLabel{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);flex:none}
.tg-bkgFiles{display:flex;gap:6px;flex-wrap:wrap}
.tg-bkgFile{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 8px 0 9px;border-radius:12px;background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2);font-size:11px;line-height:24px;color:var(--dsw-alias-label-secondary);max-width:100%}
.tg-bkgFile.tg-active{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary)}
.tg-bkgFileBtn{border:none;background:none;padding:0;font:inherit;font-size:11px;line-height:24px;color:inherit;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}
.tg-bkgFileBtn:hover{text-decoration:underline}
.tg-bkgFileDel{border:none;background:none;padding:0;font:inherit;font-size:12px;line-height:1;color:var(--dsw-alias-label-tertiary);cursor:pointer;flex:none}
.tg-bkgFileDel:hover{color:var(--dsw-alias-state-error-primary)}
.tg-bkgSlider{display:flex;align-items:center;gap:8px;flex:1;min-width:200px}
.tg-bkgRange{flex:1;min-width:0;height:4px;-webkit-appearance:none;appearance:none;border-radius:2px;background:var(--dsw-alias-interactive-bg-hover);outline:none}
.tg-bkgRange::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-brand-primary);cursor:pointer;border:none}
.tg-bkgRange::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-brand-primary);cursor:pointer;border:none}
.tg-bkgRange:disabled{opacity:.45;cursor:default}
.tg-bkgVal{width:36px;flex:none;text-align:right;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
`

    /* ── 主题目录（meta-only；token 由 Host 经 GET /themes 下发，单源 lib/themes）──
     * swatch：卡片三色拼接 + 搜索 accent（= lib meta.swatch，不含 token）；
     * group：分组归属（品牌主题不设，与 cisco/replicate 一致）。 */

    const THEMES = [
      { id: 'opencode-terminal-dark', colorScheme: 'dark', label: 'OpenCode 暱夜终端', desc: '暖黑 #201d1d + Apple 蓝，全站 mono', group: '终端美学', swatch: ['#201d1d', '#302c2c', '#007aff', '#30d158'] },
      { id: 'opencode-terminal-light', colorScheme: 'light', label: 'OpenCode 纸感终端', desc: '暖白 #fdfcfc + 暖灰层次', group: '终端美学', swatch: ['#fdfcfc', '#f1eeee', '#201d1d', '#007aff'] },
      { id: 'github-dark', colorScheme: 'dark', label: 'GitHub 暗色 Primer', desc: '#0d1117 + Primer 蓝 #2f81f7', group: '终端美学', swatch: ['#0d1117', '#161b22', '#2f81f7', '#3fb950'] },
      { id: 'github-light', colorScheme: 'light', label: 'GitHub 亮色 Primer', desc: '纯白 + #0969da + 绿色按钮', group: '终端美学', swatch: ['#ffffff', '#f6f8fa', '#0969da', '#1f883d'] },
      { id: 'linear-dark', colorScheme: 'dark', label: 'Linear 暗夜无彩', desc: '近黑 #08090a + Indigo #5e6ad2', group: '极简风物', swatch: ['#08090a', '#191a1b', '#5e6ad2', '#f7f8f8'] },
      { id: 'notion-light', colorScheme: 'light', label: 'Notion 暖白极简', desc: '纯白 + 暖灰 + Notion 蓝', group: '极简风物', swatch: ['#ffffff', '#f6f5f4', '#31302e', '#0075de'] },
      { id: 'claude-parchment-light', colorScheme: 'light', label: 'Claude 羊皮纸', desc: '羊皮纸 #f5f4ed + 赤陶 #c96442', group: '极简风物', swatch: ['#f5f4ed', '#faf9f5', '#c96442', '#141413'] },
      { id: 'nvidia-dark', colorScheme: 'dark', label: 'NVIDIA 硬核绿', desc: '纯黑 #000 + 信号绿 #76b900', group: '极简风物', swatch: ['#000000', '#1a1a1a', '#76b900', '#ffffff'] },
      { id: 'replicate-light', colorScheme: 'light', label: 'Replicate 开发者红', desc: '纯白 #ffffff + 品牌红 #ea2804', swatch: ['#ffffff', '#f8f8f8', '#ea2804', '#202020'] },
      { id: 'cisco-dark', colorScheme: 'dark', label: 'Cisco 信任蓝', desc: '藏青 #0f1720 + 信号蓝 #049fd9', swatch: ['#0f1720', '#1b2530', '#049fd9', '#ffffff'] },
      { id: 'neobrutalism-light', colorScheme: 'light', label: 'Neobrutalism 粗野拼贴', desc: '奶油 #fff4cf + 橘红 #d24b1f', swatch: ['#fff4cf', '#fffaf0', '#d24b1f', '#2a1810'] },
      { id: 'mission-control-dark', colorScheme: 'dark', label: 'Mission Control 深空', desc: '深空 #090b12 + 指挥蓝 #60a5fa', swatch: ['#090b12', '#121722', '#60a5fa', '#f8fafc'] },
      { id: 'levels-light', colorScheme: 'light', label: 'Levels 纸感评审', desc: '米纸 #fbf7ef + 代谢绿 #2f8f46', swatch: ['#fbf7ef', '#ffffff', '#2f8f46', '#1f2a24'] },
      { id: 'arc-light', colorScheme: 'light', label: 'Arc 蜜桃珊瑚', desc: '蜜桃 #fdf3ec + 珊瑚 #ff5f5f', swatch: ['#fdf3ec', '#ffffff', '#ff5f5f', '#1a1a1f'] },
      { id: 'luxury-dark', colorScheme: 'dark', label: 'Luxury 鎏金黑', desc: '曜石 #080706 + 鎏金 #c6a15b', swatch: ['#080706', '#151310', '#c6a15b', '#fff8ea'] },
      { id: 'skeumorphism-light', colorScheme: 'light', label: 'Skeumorphism 拟物陶土', desc: '陶土 #f7eee6 + 陶釉 #b46a46', swatch: ['#f7eee6', '#fff8f1', '#b46a46', '#2b211c'] },
      { id: 'wechat-light', colorScheme: 'light', label: 'WeChat 微信绿', desc: '浅灰 #ededed + 微信绿 #07c160', swatch: ['#ededed', '#f7f7f7', '#07c160', '#1a1a1a'] },
      { id: 'xiaohongshu-light', colorScheme: 'light', label: '小红书 种草红', desc: '米灰 #f5f5f5 + 种草红 #ff2442', swatch: ['#f5f5f5', '#ffffff', '#ff2442', 'rgba(0, 0, 0, 0.8)'] },
      { id: 'discord-dark', colorScheme: 'dark', label: 'Discord Blurple夜', desc: '深灰 #313338 + Blurple #5865f2', swatch: ['#313338', '#2b2d31', '#5865f2', '#dbdee1'] },
      { id: 'supabase-dark', colorScheme: 'dark', label: 'Supabase 翡翠夜', desc: '墨黑 #171717 + 翡翠绿 #3ecf8e', swatch: ['#171717', '#1c1c1c', '#3ecf8e', '#fafafa'] },
      { id: 'nebula-dark', colorScheme: 'dark', label: 'Nebula 星云紫', desc: '紫黑 #0d0a1a + 霓紫 #8b5cf6', swatch: ['#0d0a1a', '#161230', '#8b5cf6', '#f1edfd'] },
      { id: 'sakura-light', colorScheme: 'light', label: 'Sakura 樱粉', desc: '樱白 #fff9fa + 樱粉 #e75480', swatch: ['#fff9fa', '#fbeef2', '#e75480', '#432635'] },
      { id: 'tide-dark', colorScheme: 'dark', label: 'Tide 潮汐青', desc: '深青 #062a2c + 潮汐 #2dd4bf', swatch: ['#062a2c', '#0b3538', '#2dd4bf', '#eafaf8'] }
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
      const seed = extractDominant(data)
      const seedHsl = hexToHsl(seed)
      return {
        accent: seed,
        companionA: hslToHex(seedHsl.h + 60, Math.min(0.85, seedHsl.s), 0.52),
        companionB: hslToHex(seedHsl.h, Math.min(0.5, seedHsl.s * 0.45), 0.5)
      }
    }

    /* ── Material You 动态取色：seed → 5 组 ref 调色板 → MD3 sys 色彩 ──
     * 与 lib/themes/photo.js 同源（HSL 近似，色调号≈明度%；导出用 MD3 令牌命名）。 */
    const M3_TONES = [0, 4, 6, 10, 12, 17, 20, 22, 24, 25, 30, 35, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 99, 100]
    const M3_PREVIEW_TONES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95]
    const M3_REF_NAMES = { primary: 'primary', secondary: 'secondary', tertiary: 'tertiary', neutral: 'neutral', neutralVariant: 'neutral-variant', error: 'error' }
    const M3_SYS_NAMES = {
      primary: 'primary', onPrimary: 'on-primary', primaryContainer: 'primary-container', onPrimaryContainer: 'on-primary-container',
      secondary: 'secondary', onSecondary: 'on-secondary', secondaryContainer: 'secondary-container', onSecondaryContainer: 'on-secondary-container',
      tertiary: 'tertiary', onTertiary: 'on-tertiary', tertiaryContainer: 'tertiary-container', onTertiaryContainer: 'on-tertiary-container',
      error: 'error', onError: 'on-error', errorContainer: 'error-container', onErrorContainer: 'on-error-container',
      background: 'background', onBackground: 'on-background',
      surfaceDim: 'surface-dim', surface: 'surface', surfaceBright: 'surface-bright',
      surfaceContainerLowest: 'surface-container-lowest', surfaceContainerLow: 'surface-container-low', surfaceContainer: 'surface-container',
      surfaceContainerHigh: 'surface-container-high', surfaceContainerHighest: 'surface-container-highest',
      onSurface: 'on-surface', onSurfaceVariant: 'on-surface-variant', outline: 'outline', outlineVariant: 'outline-variant',
      shadow: 'shadow', scrim: 'scrim', inverseSurface: 'inverse-surface', inverseOnSurface: 'inverse-on-surface',
      inversePrimary: 'inverse-primary', surfaceTint: 'surface-tint'
    }
    function m3Tone(h, s, t) {
      if (t <= 0) return '#000000'
      if (t >= 100) return '#ffffff'
      return hslToHex(h, s, t / 100)
    }
    function buildM3Palettes(seed) {
      const parsed = hexToHsl(seed)
      const h = parsed.h
      const s = parsed.s
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
    function buildM3Scheme(pal, scheme) {
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

    /** seed → MD3 导出 CSS（--md-ref-palette-* + --md-sys-color-*-light/dark）。 */
    function buildM3ExportCss(seed) {
      const pal = buildM3Palettes(seed)
      const lines = [':root {', '  /* seed: ' + seed + ' · Material You (MD3) · exported by dshp-inx-custom-ui */']
      for (const key of Object.keys(M3_REF_NAMES)) {
        for (const t of M3_TONES) lines.push('  --md-ref-palette-' + M3_REF_NAMES[key] + t + ': ' + pal[key][t] + ';')
      }
      const schemes = { light: buildM3Scheme(pal, 'light'), dark: buildM3Scheme(pal, 'dark') }
      for (const sk of ['light', 'dark']) {
        lines.push('  /* sys-' + sk + ' */')
        const roles = schemes[sk]
        for (const role of Object.keys(M3_SYS_NAMES)) {
          lines.push('  --md-sys-color-' + M3_SYS_NAMES[role] + '-' + sk + ': ' + roles[role] + ';')
        }
      }
      lines.push('}')
      return lines.join('\n')
    }

    function copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          const p = navigator.clipboard.writeText(text)
          if (p && typeof p.then === 'function') return p
        } catch (e) { /* 走 fallback */ }
      }
      return new Promise(function (resolve, reject) {
        try {
          const ta = document.createElement('textarea')
          ta.value = text
          ta.style.position = 'fixed'
          ta.style.opacity = '0'
          document.body.appendChild(ta)
          ta.select()
          const ok = document.execCommand('copy')
          ta.remove()
          if (ok) resolve()
          else reject(new Error('copy failed'))
        } catch (e) { reject(e) }
      })
    }

    /** seed → 壁纸主题运行时 { seed, palettes, dark, light }。 */
    function buildWallpaperTheme(seed) {
      const palettes = buildM3Palettes(seed)
      return { seed, palettes, dark: buildPhotoTokens(palettes, 'dark'), light: buildPhotoTokens(palettes, 'light') }
    }

    /** MD3 sys 色彩 → DSH 单侧 --dsw-* token（与 lib/themes/photo.js 同源）。
     *  入参 ref 调色板或 seed/持久化 palette（seed 恒等于 accent，兼容旧数据）。 */
    function buildPhotoTokens(seedOrPalettes, scheme) {
      const pal = (seedOrPalettes && seedOrPalettes.primary) ? seedOrPalettes : buildM3Palettes(
        typeof seedOrPalettes === 'string' ? seedOrPalettes : (seedOrPalettes.seed || seedOrPalettes.accent))
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
        '--dsw-alias-bg-base': m.surface, '--dsw-alias-bg-layer-1': m.surfaceContainerLow, '--dsw-alias-bg-layer-2': m.surfaceContainer, '--dsw-alias-bg-layer-3': m.surfaceContainerHigh,
        '--dsw-alias-bg-overlay': m.surfaceContainerLow, '--dsw-alias-bg-multi-select': m.surfaceContainer, '--dsw-alias-bg-module-platform': m.surfaceContainerLow, '--dsw-alias-bg-skeleton': m.surfaceContainer,
        '--dsw-alias-border-l1': border1, '--dsw-alias-border-l2': border2, '--dsw-alias-border-l2-darkmode-thin': border1, '--dsw-alias-border-l3': border2,
        '--dsw-alias-border-l4': dark ? textTertiary : border2, '--dsw-alias-border-inverted': textPrimary, '--dsw-alias-border-inverted2': textSecondary,
        '--dsw-alias-separator-primary': border1, '--dsw-alias-line-secondary': m.surfaceContainer, '--dsw-alias-fill-l2': m.surfaceContainer,
        '--dsw-alias-fill-tsp-secondary': withAlpha(m.onSurface, dark ? 0.05 : 0.04),
        '--dsw-alias-brand-primary': brand, '--dsw-alias-brand-primary-invert': m.onPrimary, '--dsw-alias-brand-text': brand,
        '--dsw-alias-button-primary-fill': brand, '--dsw-alias-button-primary-hover': brandHover, '--dsw-alias-button-primary-dimmed': brandHover,
        '--dsw-alias-button-contrast-fill': m.onSurface, '--dsw-alias-button-elevated-fill': m.surfaceContainerLow, '--dsw-alias-button-floating-fill': m.surfaceContainerLow,
        '--dsw-alias-button-floating-hover': m.surfaceContainer, '--dsw-alias-button-ghost-active-border': border2, '--dsw-alias-button-ghost-active-fill': hover,
        '--dsw-alias-button-ghost-active-hover': active, '--dsw-alias-button-info-fill': info, '--dsw-alias-button-info-hover': infoHover,
        '--dsw-alias-button-tool-bar-fill': m.surfaceContainerLow, '--dsw-alias-button-tool-bar-fill-invisible': 'transparent', '--dsw-alias-button-tool-bar-hover': hover,
        '--dsw-alias-interactive-bg-hover': hover, '--dsw-alias-interactive-bg-active': active,
        '--dsw-alias-interactive-bg-hover-accent': withAlpha(brand, dark ? 0.2 : 0.12), '--dsw-alias-interactive-bg-hover-danger': withAlpha(err, dark ? 0.18 : 0.1),
        '--dsw-alias-interactive-bg-hover-solid': active,
        '--dsw-alias-label-primary': textPrimary, '--dsw-alias-label-secondary': textSecondary, '--dsw-alias-label-tertiary': textTertiary,
        '--dsw-alias-label-quaternary': textQuaternary, '--dsw-alias-label-caption': textTertiary, '--dsw-alias-label-dimmed': textQuaternary,
        '--dsw-alias-label-error': err, '--dsw-alias-label-primary-foreground': dark ? textPrimary : '#ffffff',
        '--dsw-alias-label-primary-inverted': dark ? m.surface : '#ffffff', '--dsw-alias-label-primary-bluish': brand,
        '--dsw-alias-state-error-primary': err, '--dsw-alias-state-error-secondary': withAlpha(err, dark ? 0.15 : 0.1),
        '--dsw-alias-state-success-primary': dark ? '#4ade80' : '#16a34a', '--dsw-alias-state-success-secondary': withAlpha('#22c55e', dark ? 0.15 : 0.1),
        '--dsw-alias-state-warn-primary': dark ? '#fbbf24' : '#d97706', '--dsw-alias-state-warn-secondary': withAlpha('#f59e0b', dark ? 0.15 : 0.1),
        '--dsw-alias-state-warn-label': dark ? '#fbbf24' : '#b45309',
        '--dsw-alias-markdown-citation': brand, '--dsw-alias-markdown-code-block': m.surfaceContainerLow, '--dsw-alias-markdown-code-block-banner': m.surfaceContainer,
        '--dsw-alias-markdown-inline-code': withAlpha(brand, dark ? 0.14 : 0.1), '--dsw-alias-markdown-code-segment-selected': withAlpha(brand, dark ? 0.25 : 0.16),
        '--dsw-alias-markdown-code-segment-unselected': 'transparent', '--dsw-alias-markdown-placeholder': textQuaternary, '--dsw-alias-markdown-tag': textTertiary,
        '--dsw-alias-scrollbar-bg-l1': border2, '--dsw-alias-scrollbar-bg-l2': m.surfaceContainer, '--dsw-alias-scrollbar-hover-l1': textTertiary, '--dsw-alias-scrollbar-hover-l2': border2,
        '--dsw-alias-toast-bg': m.inverseSurface, '--dsw-alias-tooltip-bg': m.inverseSurface, '--dsw-hovercard-bg': m.surfaceContainerLow,
        '--dsw-specific-sidebar-fill': m.surface, '--dsw-specific-sidebar-nav-item-active': active, '--dsw-specific-sidebar-nav-item-active-accent': brand,
        '--dsw-specific-sidebar-nav-item-hover': hover, '--dsw-specific-bubble': m.surfaceContainerLow, '--dsw-specific-bubble-highlight': m.surfaceContainer,
        '--dsw-specific-input-major': m.surfaceContainerLow, '--dsw-specific-login-input': m.surfaceContainerLow, '--dsw-specific-menu': m.surfaceContainer,
        '--dsw-specific-selector': m.surfaceContainer, '--dsw-specific-tip': m.surfaceContainer,
        '--dsw-shadow-lv1': dark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)',
        '--dsw-shadow-lv2': dark ? '0 4px 16px rgba(0,0,0,0.45)' : '0 2px 8px rgba(0,0,0,0.08)',
        '--dsw-shadow-lv3': dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.1)', '--dsw-shadow-lv1-blur': '8px',
        '--dshp-cu-body-gradient': dark
          ? 'radial-gradient(1000px 600px at 85% -10%, ' + withAlpha(m.tertiary, 0.16) + ', transparent 55%), radial-gradient(900px 560px at 8% 108%, ' + withAlpha(m.secondary, 0.13) + ', transparent 58%), linear-gradient(180deg, ' + m.surface + ', ' + pal.neutral[4] + ')'
          : 'radial-gradient(1000px 600px at 85% -10%, ' + withAlpha(m.tertiary, 0.22) + ', transparent 55%), radial-gradient(900px 560px at 8% 108%, ' + withAlpha(m.secondary, 0.18) + ', transparent 58%), linear-gradient(180deg, ' + m.surface + ', ' + pal.neutral[96] + ')',
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

    /* 壁纸 MD3 主题运行时：{ seed, palettes, dark, light }；seed 持久化到 settings（= photoPalette.accent）。 */
    const PHOTO_ID = 'photo:custom'
    let photoTheme = null
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


    /* ── 持久化桥：Host 半的 settings 路由（dshp-inx-custom-ui 命名空间）──
     * themes()：主题目录全量 token（单源 lib/themes），内存缓存一次，切换/恢复时用。 */
    function createBridge() {
      const state = async () => {
        const response = await fetch('/ext/dshp-inx-custom-ui/state', { cache: 'no-store' })
        return response.json()
      }
      let cachedTokens = null
      const themes = async () => {
        if (cachedTokens) return cachedTokens
        const response = await fetch('/ext/dshp-inx-custom-ui/themes', { cache: 'no-store' })
        const reply = await response.json()
        if (!reply || reply.ok !== true || !Array.isArray(reply.themes)) {
          throw new Error((reply && reply.error) || '主题目录下发失败')
        }
        const map = {}
        for (const th of reply.themes) {
          if (th && typeof th.id === 'string' && th.tokens && typeof th.tokens === 'object') map[th.id] = th.tokens
        }
        cachedTokens = map
        return map
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
      return { state, themes, saveTheme, saveConfig }
    }

    /* ── 画廊组件：theme/change 驱动实时高亮 ── */
    function createGallery(ctx, theme, bridge, applyChoice) {
      return function ThemeGallery() {
        const [revision, setRevision] = React.useState(-1)
        const [notice, setNotice] = React.useState(null)
        const [radiusCfg, setRadiusCfg] = React.useState(desiredRadius)
        const [query, setQuery] = React.useState('')
        const [schemeFilter, setSchemeFilter] = React.useState('all')
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
        label[PHOTO_ID] = '壁纸取色'
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

        /* ── 截图式卡片：顶部三色拼接 + 右上编号 + 标签/标题/描述 + 底部胶囊按钮 + Live 态 ──
         * 颜色只走 meta.swatch（= lib 目录元数据），token 按需问 Host 要，不进 bundle。 */
        function accentOf(t) {
          if (t && typeof t.accent === 'string' && t.accent) return t.accent
          if (t && Array.isArray(t.swatch) && typeof t.swatch[2] === 'string') return t.swatch[2]
          return '#2f81f7'
        }
        function mosaicOf(t) {
          if (t && t.id === PHOTO_ID && photoTheme) {
            const pal = photoTheme.palettes
            return [pal.secondary[60], photoTheme.seed, pal.tertiary[60]]
          }
          const sw = (t && Array.isArray(t.swatch)) ? t.swatch : []
          return [
            sw[0] || '#222222',
            sw[1] || '#444444',
            accentOf(t)
          ]
        }
        const mkCard = (t, active, onPick, idx) => {
          const accent = accentOf(t)
          const mosaic = mosaicOf(t)
          const schemeLabel = t.colorScheme === 'dark' ? '深色' : '浅色'
          const tagText = t.tag || (schemeLabel + ' · ' + accent)
          return React.createElement('button', {
            key: t.id,
            type: 'button',
            className: active ? 'tg-card tg-active' : 'tg-card',
            'aria-pressed': active,
            style: active ? { borderColor: accent, boxShadow: '0 0 0 1px ' + accent } : null,
            onClick: onPick
          },
            React.createElement('span', { className: 'tg-mosaic', 'aria-hidden': true },
              React.createElement('i', { className: 'tg-mA', style: { background: mosaic[0] } }),
              React.createElement('i', { className: 'tg-mB', style: { background: mosaic[1] } }),
              React.createElement('i', { className: 'tg-mC', style: { background: accent } }),
              React.createElement('span', { className: 'tg-idx' }, idx || '')),
            React.createElement('span', { className: 'tg-body' },
              React.createElement('span', { className: 'tg-tag', style: { color: accent }, title: tagText }, tagText),
              React.createElement('span', { className: 'tg-title' }, t.label),
              React.createElement('span', { className: 'tg-desc', title: t.desc }, t.desc),
              React.createElement('span', { className: 'tg-foot' },
                React.createElement('span', { className: 'tg-use', style: { background: accent } }, active ? '使用中' : '启用'),
                React.createElement('span', { className: 'tg-live', style: { color: accent, opacity: active ? 1 : 0.72 } },
                  React.createElement('i', null),
                  active ? 'Live' : schemeLabel),
                active ? React.createElement('span', { className: 'tg-check', style: { color: accent } }, '✓') : null)))
        }

        /* 无分组：全部主题（含取色）直接平铺，grid 自适应 */
        const ALL_THEMES = THEMES.map(function (t, i) {
          return { data: t, idx: String(i + 1).padStart(3, '0') }
        })

        /* 壁纸取色（Material You 独立配置）：上传壁纸 → 提取 seed → MD3 整套配色 */
        const [photoBusy, setPhotoBusy] = React.useState(false)
        const pickPhoto = function (file) {
          if (!file) return
          setPhotoBusy(true)
          paletteFromFile(file).then(function (palette) {
            const seed = palette.accent
            photoTheme = buildWallpaperTheme(seed)
            desiredId = PHOTO_ID
            applyChoice(PHOTO_ID)
            const pal = photoTheme.palettes
            /* 持久化（Host 字段不变做兼容：accent 即 seed） */
            bridge.saveConfig({ photoPalette: { accent: seed, companionA: pal.tertiary[60], companionB: pal.secondary[60] } }).then(function (reply) {
              setPhotoBusy(false)
              setNotice(reply && reply.ok
                ? { err: null, ok: '壁纸 MD3 配色已生成（seed ' + seed + '）并保存；亮/暗跟随「外观」行' }
                : { err: '配色已生效但保存失败（重启后会丢失取色）' })
            }).catch(function () { setPhotoBusy(false); setNotice({ err: '配色已生效但保存失败' }) })
            bridge.saveTheme(PHOTO_ID).catch(function () {})
          }).catch(function (e) {
            setPhotoBusy(false)
            setNotice({ err: '取色失败：' + String((e && e.message) || e) })
          })
        }
        const photoActive = desiredId === PHOTO_ID
        const enableWallpaper = function () {
          if (!photoTheme) { setNotice({ err: '还没有壁纸配色，先上传一张壁纸取色' }); return }
          desiredId = PHOTO_ID
          applyChoice(PHOTO_ID)
          bridge.saveTheme(PHOTO_ID).then(function (reply) {
            setNotice(reply && reply.ok ? null : { err: (reply && reply.error) || '启用失败' })
          }).catch(function (e) {
            setNotice({ err: '启用失败：' + String((e && e.message) || e) })
          })
        }
        const clearWallpaper = function () {
          photoTheme = null
          if (desiredId === PHOTO_ID) { desiredId = ''; applyChoice('') }
          bridge.saveTheme('').catch(function () {})
          bridge.saveConfig({ photoPalette: null }).then(function (reply) {
            setNotice(reply && reply.ok
              ? { err: null, ok: '壁纸配色已清除，回到官方默认' }
              : { err: (reply && reply.error) || '清除失败' })
          }).catch(function (e) {
            setNotice({ err: '清除失败：' + String((e && e.message) || e) })
          })
        }
        const copyM3 = function () {
          if (!photoTheme) { setNotice({ err: '还没有壁纸配色，先上传一张壁纸取色' }); return }
          copyText(buildM3ExportCss(photoTheme.seed)).then(function () {
            setNotice({ err: null, ok: 'MD3 令牌已复制（--md-ref-palette-* ×156 + --md-sys-color-*-light/dark ×74）' })
          }, function (e) {
            setNotice({ err: '复制失败：' + String((e && e.message) || e) })
          })
        }

        /* 全局圆角三档：保存即生效。同时写模块级 desiredRadius——
         * theme/change 触发 setRevision 时若组件树因 key 重建，state 也不丢。 */
        const pickRadius = function (v) {
          desiredRadius = v
          setRadiusCfg(v)
          bridge.saveConfig({ radius: { global: v } }).then(function (reply) {
            if (reply && reply.ok === true) applyRadius(reply.radius)
          }).catch(function () { /* 保存失败静默：下次刷新回读 */ })
        }
        const rdNow = typeof radiusCfg === 'number' ? radiusCfg : -1
        const radiusButtons = [['-1', '默认'], ['0', '锐角'], ['12', '圆润']].map(function (opt) {
          const value = Number(opt[0])
          const active = rdNow === value
          return React.createElement('button', {
            key: opt[0],
            type: 'button',
            className: active ? 'tg-radiusBtn tg-active' : 'tg-radiusBtn',
            'aria-pressed': active,
            title: opt[0] === '-1' ? '跟随主题' : opt[0] === '0' ? '全锐角' : '统一 12px 圆润',
            onClick: function () { pickRadius(value) }
          }, opt[1])
        })

        /* ── 背景管线状态：cfg 镜像 Host background；files 来自壁纸目录 ── */
        const [bgCfg, setBgCfg] = React.useState(null)
        const [bgFiles, setBgFiles] = React.useState([])
        const [bgBusy, setBgBusy] = React.useState(false)
        React.useEffect(function () {
          bridge.state().then(function (reply) {
            if (reply && reply.ok === true) setBgCfg(Object.assign({}, DEFAULT_BG, reply.background || {}))
          }).catch(function () { /* 状态失败不阻塞画廊 */ })
          fetch('/ext/dshp-inx-custom-ui/wallpapers', { cache: 'no-store' }).then(function (r) { return r.json() }).then(function (reply) {
            if (reply && reply.ok === true && Array.isArray(reply.files)) setBgFiles(reply.files)
          }).catch(function () { /* 列表失败不阻塞 */ })
        }, [])

        const bgSave = function (patch) {
          if (!bgCfg) return
          const next = Object.assign({}, bgCfg, patch)
          setBgCfg(next)
          applyBackground(next)
          bridge.saveConfig({ background: next }).then(function (reply) {
            if (reply && reply.ok === true) {
              const merged = Object.assign({}, next, reply.background || {})
              setBgCfg(merged)
              applyBackground(merged)
            } else {
              setNotice({ err: (reply && reply.error) || '背景配置保存失败' })
            }
          }).catch(function (e) {
            setNotice({ err: '背景配置保存失败：' + String((e && e.message) || e) })
          })
        }

        const bgUpload = function (file) {
          if (!file) return
          setBgBusy(true)
          setNotice(null)
          const form = new FormData()
          form.append('file', file, file.name)
          fetch('/ext/dshp-inx-custom-ui/wallpaper', { method: 'POST', body: form }).then(function (r) { return r.json() }).then(function (reply) {
            setBgBusy(false)
            if (reply && reply.ok === true) {
              setBgFiles(function (prev) {
                const without = prev.filter(function (f) { return f.name !== reply.name })
                return without.concat([{ name: reply.name, size: reply.size, type: reply.type }]).sort(function (a, b) { return a.name.localeCompare(b.name) })
              })
              bgSave({ type: reply.type, file: reply.name })
              setNotice({ err: null, ok: '已上传并应用为背景：' + reply.name })
            } else {
              setNotice({ err: (reply && reply.error) || '上传失败' })
            }
          }).catch(function (e) {
            setBgBusy(false)
            setNotice({ err: '上传失败：' + String((e && e.message) || e) })
          })
        }

        const bgDelete = function (name) {
          setBgBusy(true)
          fetch('/ext/dshp-inx-custom-ui/wallpaper-delete', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ name })
          }).then(function (r) { return r.json() }).then(function (reply) {
            setBgBusy(false)
            if (reply && reply.ok === true) {
              setBgFiles(function (prev) { return prev.filter(function (f) { return f.name !== name }) })
              /* 若删的是当前背景：Host 已清引用，本地同步回 none */
              if (bgCfg && bgCfg.file === name) {
                const off = Object.assign({}, bgCfg, { type: 'none', file: '' })
                setBgCfg(off)
                applyBackground(off)
              }
            } else {
              setNotice({ err: (reply && reply.error) || '删除失败' })
            }
          }).catch(function (e) {
            setBgBusy(false)
            setNotice({ err: '删除失败：' + String((e && e.message) || e) })
          })
        }

        /* 背景滑杆（label / 当前值 / min / max / step / 值后缀 / onChange） */
        const bgSlider = function (label, value, min, max, step, suffix, onInput) {
          return React.createElement('div', { className: 'tg-bkgRow' },
            React.createElement('span', { className: 'tg-bkgRowLabel' }, label),
            React.createElement('span', { className: 'tg-bkgSlider' },
              React.createElement('input', {
                className: 'tg-bkgRange', type: 'range',
                min: String(min), max: String(max), step: String(step),
                value: String(value), disabled: bgBusy,
                onChange: function (e) { onInput(Number(e.target.value)) }
              }),
              React.createElement('span', { className: 'tg-bkgVal' }, String(value) + suffix)))
        }

        const bgActive = bgCfg && (bgCfg.type === 'image' || bgCfg.type === 'video') && bgCfg.file
        const bkgSection = bgCfg === null ? null : React.createElement('div', { className: 'tg-bkg' },
          React.createElement('div', { className: 'tg-bkgHead' },
            React.createElement('span', { className: 'tg-bkgTitle' }, '背景壁纸'),
            bgActive ? React.createElement('span', { className: 'tg-live', style: { color: 'var(--dsw-alias-state-business-primary)' } },
              React.createElement('i', null), bgCfg.type === 'video' ? 'Live 视频' : 'Live 图片') : null,
            React.createElement('span', { className: 'tg-bkgActions' },
              React.createElement('button', {
                type: 'button', className: 'tg-radiusBtn',
                disabled: bgBusy || !bgActive,
                onClick: function () { bgSave({ type: 'none', file: '' }) }
              }, '关闭背景'),
              React.createElement('label', { className: 'tg-radiusBtn', style: { cursor: bgBusy ? 'wait' : 'pointer', opacity: bgBusy ? 0.6 : 1 } },
                bgBusy ? '处理中…' : '上传图片/视频',
                React.createElement('input', {
                  type: 'file', accept: '.png,.jpg,.jpeg,.gif,.webp,.avif,.bmp,.mp4,.webm',
                  style: { display: 'none' }, disabled: bgBusy,
                  onChange: function (e) { bgUpload(e.target.files && e.target.files[0]); e.target.value = '' }
                })))),
          bgFiles.length > 0 ? React.createElement('div', { className: 'tg-bkgFiles' },
            bgFiles.map(function (f) {
              const active = bgActive && bgCfg.file === f.name
              return React.createElement('span', { key: f.name, className: active ? 'tg-bkgFile tg-active' : 'tg-bkgFile', title: f.name + ' · ' + Math.round(f.size / 1024) + ' KB' },
                f.type === 'video' ? '🎬 ' : '🖼 ',
                React.createElement('button', {
                  type: 'button', className: 'tg-bkgFileBtn',
                  onClick: function () { bgSave({ type: f.type, file: f.name }) }
                }, f.name),
                React.createElement('button', {
                  type: 'button', className: 'tg-bkgFileBtn', title: '文件大小',
                  style: { cursor: 'default', maxWidth: 'none', flex: 'none' }
                }, Math.round(f.size / 1024) + 'K'),
                React.createElement('button', {
                  type: 'button', className: 'tg-bkgFileDel', title: '删除文件',
                  disabled: bgBusy,
                  onClick: function () { bgDelete(f.name) }
                }, '✕'))
            })) : React.createElement('span', { className: 'tg-head' }, '还没有壁纸文件，上传一张图片（≤24MB）或视频（≤96MB）开始。'),
          bgActive ? React.createElement('div', { className: 'tg-bkgBody' },
            bgSlider('背景模糊', bgCfg.blur || 0, 0, 40, 1, 'px', function (v) { bgSave({ blur: v }) }),
            bgSlider('背景压暗', bgCfg.dim || 0, 0, 0.8, 0.05, '', function (v) { bgSave({ dim: v }) }),
            bgSlider('磨砂强度', bgCfg.glass || 0, 0, 24, 1, 'px', function (v) { bgSave({ glass: v }) }),
            bgSlider('列不透明度', bgCfg.containerAlpha == null ? 84 : bgCfg.containerAlpha, 40, 100, 1, '%', function (v) { bgSave({ containerAlpha: v }) }),
            bgSlider('内容不透明度', bgCfg.centerAlpha == null ? 92 : bgCfg.centerAlpha, 60, 100, 1, '%', function (v) { bgSave({ centerAlpha: v }) }),
            React.createElement('span', { className: 'tg-head' }, '背景垫 body 底层，侧栏/详情/中列半透明浮于其上；磨砂走伪元素，不影响弹窗定位。')) : null)


        /* 顶部简单配置区：圆角 + 回到官方（取色已独立成区，当前主题下沉到列表头 now 条） */
        const topbar = React.createElement('div', { className: 'tg-topbar' },
          React.createElement('div', { className: 'tg-ctl' },
            React.createElement('span', { className: 'tg-ctlLabel' }, '圆角'),
            React.createElement('div', { className: 'tg-radiusBtns' }, radiusButtons),
            React.createElement('span', { className: 'tg-ctlSep' }),
            React.createElement('button', { type: 'button', className: 'tg-release', onClick: release }, '回到官方'),
            React.createElement('span', { className: 'tg-head' }, '点击卡片切换，自动保存')),
          notice && notice.err ? React.createElement('p', { className: 'tg-head tg-headErr' }, notice.err) : null,
          notice && notice.ok ? React.createElement('p', { className: 'tg-head tg-headOk' }, notice.ok) : null)

        /* 壁纸取色独立配置区（MD3 整套配色，不占用主题卡片位） */
        const wallSeed = photoTheme ? photoTheme.seed : null
        const wallAccent = photoTheme
          ? (resolved === 'dark' ? photoTheme.palettes.primary[80] : photoTheme.palettes.primary[40])
          : '#2f81f7'
        const wallToneRows = photoTheme ? ['primary', 'secondary', 'tertiary', 'neutral', 'neutralVariant'].map(function (name) {
          const cells = M3_PREVIEW_TONES.map(function (t) {
            const hex = photoTheme.palettes[name][t]
            return React.createElement('i', { key: t, style: { background: hex }, title: name + t + ' ' + hex })
          })
          return React.createElement('div', { key: name, className: 'tg-toneRow' },
            React.createElement('span', { className: 'tg-toneName' }, name === 'neutralVariant' ? 'neutral-variant' : name),
            React.createElement('span', { className: 'tg-toneCells' }, cells))
        }) : null
        const wallRoleRows = photoTheme ? ['light', 'dark'].map(function (sk) {
          const roles = buildM3Scheme(photoTheme.palettes, sk)
          const keys = ['primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer', 'secondary', 'secondaryContainer', 'tertiary', 'tertiaryContainer', 'surface', 'surfaceContainer', 'surfaceContainerHighest', 'onSurface', 'outline', 'error', 'errorContainer']
          const chips = keys.map(function (k) {
            return React.createElement('span', { key: k, className: 'tg-chip', title: '--md-sys-color-' + k + '-' + sk + ' ' + roles[k] },
              React.createElement('i', { style: { background: roles[k] } }), k)
          })
          return React.createElement('div', { key: sk, className: 'tg-roleRow' },
            React.createElement('span', { className: 'tg-toneName' }, sk === 'light' ? '浅色' : '深色'),
            React.createElement('span', { className: 'tg-chips' }, chips))
        }) : null
        const wallSection = React.createElement('div', { className: 'tg-wall' },
          React.createElement('div', { className: 'tg-wallHead' },
            React.createElement('span', { className: 'tg-wallTitle' }, '壁纸取色 · Material You'),
            wallSeed ? React.createElement('span', { className: 'tg-seedChip', title: 'seed ' + wallSeed },
              React.createElement('i', { style: { background: wallSeed } }), wallSeed) : null,
            photoActive ? React.createElement('span', { className: 'tg-live', style: { color: wallAccent } },
              React.createElement('i', null), 'Live') : null,
            React.createElement('span', { className: 'tg-wallActions' },
              React.createElement('label', { className: 'tg-radiusBtn', style: { cursor: photoBusy ? 'wait' : 'pointer', opacity: photoBusy ? 0.6 : 1 } },
                photoBusy ? '取色中…' : '上传壁纸',
                React.createElement('input', {
                  type: 'file', accept: '.png,.jpg,.jpeg,.webp',
                  style: { display: 'none' }, disabled: photoBusy,
                  onChange: function (e) { pickPhoto(e.target.files && e.target.files[0]); e.target.value = '' }
                })),
              photoTheme && !photoActive ? React.createElement('button', { type: 'button', className: 'tg-radiusBtn', onClick: enableWallpaper }, '启用配色') : null,
              photoTheme ? React.createElement('button', { type: 'button', className: 'tg-radiusBtn', onClick: copyM3, title: '复制 MD3 令牌（ref 调色板 + 亮/暗 sys 色彩）' }, '复制 MD3') : null,
              photoTheme ? React.createElement('button', { type: 'button', className: 'tg-release', onClick: clearWallpaper }, '清除') : null)),
          photoTheme
            ? React.createElement('div', { className: 'tg-wallBody' }, wallToneRows,
              React.createElement('div', { className: 'tg-roles' }, wallRoleRows))
            : React.createElement('span', { className: 'tg-head' }, '上传一张壁纸，生成整套 MD3 动态配色（5 组 ref 调色板 × 亮/暗 scheme）；本地采样不上传。'))

        /* 当前正在使用的主题（列表头） */
        const nowTheme = (function () {
          if (desiredId === PHOTO_ID) {
            return photoTheme
              ? { id: PHOTO_ID, label: '壁纸取色', desc: 'seed ' + photoTheme.seed + ' · MD3 动态配色', colorScheme: 'dark', accent: photoTheme.seed }
              : { id: PHOTO_ID, label: '壁纸取色', desc: '取色数据缺失，请重新上传壁纸', colorScheme: 'dark', accent: '#2f81f7' }
          }
          for (const t of THEMES) if (t.id === desiredId) return t
          return null
        })()
        const nowMosaic = nowTheme ? mosaicOf(nowTheme) : ['var(--dsw-alias-bg-layer-1)', 'var(--dsw-alias-bg-layer-2)', 'var(--dsw-alias-brand-primary)']
        const nowAccent = nowTheme ? accentOf(nowTheme) : '#2f81f7'
        const nowStrip = React.createElement('div', { className: 'tg-now' },
          React.createElement('span', { className: 'tg-nowMosaic', 'aria-hidden': true },
            React.createElement('i', { className: 'tg-mA', style: { background: nowMosaic[0] } }),
            React.createElement('i', { className: 'tg-mB', style: { background: nowMosaic[1] } }),
            React.createElement('i', { className: 'tg-mC', style: { background: nowAccent } })),
          React.createElement('span', { className: 'tg-nowMeta' },
            React.createElement('span', { className: 'tg-nowTitle' }, '正在使用：' + currentLabel),
            React.createElement('span', { className: 'tg-nowSub' }, nowTheme ? (nowTheme.desc + ' · ' + nowAccent) : '官方默认配色 · 跟随「外观」亮/暗')),
          React.createElement('span', { className: 'tg-nowDots', 'aria-hidden': true },
            React.createElement('i', { style: { background: nowMosaic[0] } }),
            React.createElement('i', { style: { background: nowMosaic[1] } }),
            React.createElement('i', { style: { background: nowAccent } })))

        /* 关键词搜索 + 亮/暗过滤 */
        const q = query.trim().toLowerCase()
        const matchEntry = function (entry) {
          const t = entry.data
          if (schemeFilter !== 'all' && t.colorScheme !== schemeFilter) return false
          if (!q) return true
          const hay = (t.label + ' ' + t.desc + ' ' + t.id + ' ' + accentOf(t)).toLowerCase()
          return hay.indexOf(q) !== -1
        }
        const schemePills = [['all', '全部'], ['dark', '深色'], ['light', '浅色']].map(function (opt) {
          const active = schemeFilter === opt[0]
          return React.createElement('button', {
            key: opt[0],
            type: 'button',
            className: active ? 'tg-radiusBtn tg-active' : 'tg-radiusBtn',
            'aria-pressed': active,
            onClick: function () { setSchemeFilter(opt[0]) }
          }, opt[1])
        })
        const visibleEntries = ALL_THEMES.filter(matchEntry)
        const toolbar = React.createElement('div', { className: 'tg-toolbar' },
          React.createElement('input', {
            className: 'tg-search',
            type: 'search',
            placeholder: '搜索主题…',
            value: query,
            onChange: function (e) { setQuery(e.target.value) }
          }),
          React.createElement('div', { className: 'tg-radiusBtns' }, schemePills),
          React.createElement('span', { className: 'tg-count' }, visibleEntries.length + ' / ' + ALL_THEMES.length))
        const cards = visibleEntries.map(function (entry) {
          const t = entry.data
          const onPick = entry.onPick || (function () { const tt = t; return function () { pick(tt) } })()
          return mkCard(t, desiredId === t.id, onPick, entry.idx)
        })

        /* 简单配置在前，壁纸取色居中，主题色列表（最后一项）在后 */
        return React.createElement('div', { className: 'tg-page' },
          topbar,
          bkgSection,
          wallSection,
          React.createElement('div', { className: 'tg-list' },
            nowStrip,
            toolbar,
            cards.length > 0
              ? React.createElement('div', { className: 'tg-grid' }, cards)
              : React.createElement('span', { className: 'tg-head' }, '无匹配主题，换个关键词或切换亮/暗过滤试试。'))
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
        if (id === PHOTO_ID) {
          return photoTheme
            ? { id: PHOTO_ID, colorScheme: 'dark', label: '壁纸取色', desc: 'seed ' + photoTheme.seed + ' · MD3 动态配色' }
            : null
        }
        for (const t of THEMES) if (t.id === id) return t
        return null
      }

      /** 把一套主题 token（单 scheme）展开成官方覆盖层 pair。
       *  photo 主题双 scheme 都有值（亮暗双套）；静态主题 token 问 Host 要，
       *  对侧回官方原值。 */
      function buildPair(t, tokens) {
        const pair = {}
        if (t.id === PHOTO_ID && photoTheme) {
          for (const [name, value] of Object.entries(photoTheme.dark)) {
            pair[name] = { dark: value, light: photoTheme.light[name] || value }
          }
          return pair
        }
        const officialSide = t.colorScheme === 'dark' ? OFFICIAL_LIGHT : OFFICIAL_DARK
        for (const [name, value] of Object.entries(tokens)) {
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

      /** 应用主题覆盖层 + 官方偏好切到主题 scheme。空 id = 撤销覆盖（回官方）。
       *  静态主题 token 问 Host 要（/themes，一次缓存）；photo 本地即有。
       *  异步到达时若用户已改选（desiredId 变化）则丢弃，避免后到覆盖先到。 */
      function applyThemeChoice(themeId) {
        try {
          if (overrideDispose) { overrideDispose(); overrideDispose = null }
          if (!themeId) { renderBodyGradient(); return }
          if (themeId === PHOTO_ID) {
            if (!photoTheme) { renderBodyGradient(); return }
            overrideDispose = theme.overrideTokens(OVERRIDE_SOURCE, buildPair({ id: PHOTO_ID }))
            const pref = theme.getTheme().preference
            if (pref !== 'light' && pref !== 'dark') { /* system 交给覆盖层自动跟随 */ }
            renderBodyGradient()
            return
          }
          const t = findTheme(themeId)
          if (!t) {
            console.warn('[dshp-inx-custom-ui] 未知主题 id，已回官方: ' + themeId)
            desiredId = ''
            renderBodyGradient()
            return
          }
          bridge.themes().then(function (map) {
            if (desiredId !== themeId) return /* 已改选，丢弃 */
            const tokens = map[themeId]
            if (!tokens) {
              console.error('[dshp-inx-custom-ui] 主题下发缺失: ' + themeId)
              return
            }
            try {
              if (overrideDispose) { overrideDispose(); overrideDispose = null }
              overrideDispose = theme.overrideTokens(OVERRIDE_SOURCE, buildPair(t, tokens))
              const pref = theme.getTheme().preference
              if (pref !== t.colorScheme) theme.setTheme(t.colorScheme)
            } catch (e) {
              console.error('[dshp-inx-custom-ui] 主题覆盖失败: ' + String(e && e.message))
            }
            renderBodyGradient()
          }).catch(function (e) {
            console.error('[dshp-inx-custom-ui] 主题 token 下发失败: ' + String((e && e.message) || e))
          })
        } catch (e) {
          console.error('[dshp-inx-custom-ui] 主题覆盖失败: ' + String(e && e.message))
        }
      }

      /* 启动恢复：读 settings 持久化的 themeId 重建覆盖层；壁纸 MD3 从持久化
       * seed（= photoPalette.accent，兼容旧数据）重建 token；同时恢复全局圆角
       * 与背景管线（背景层 + 容器磨砂覆盖）。 */
      const bridge = createBridge()
      bridge.state().then(function (reply) {
        if (reply && reply.ok === true) {
          const saved = typeof reply.themeId === 'string' ? reply.themeId : ''
          const pal = reply.photoPalette
          if (pal && typeof pal.accent === 'string') {
            photoTheme = buildWallpaperTheme(pal.seed || pal.accent)
          }
          desiredId = saved
          if (saved.length > 0) applyThemeChoice(saved)
          applyRadius(reply.radius)
          desiredRadius = reply.radius && typeof reply.radius.global === 'number' ? reply.radius.global : -1
          applyBackground(reply.background)
        }
      }).catch(function (e) {
        console.log('[dshp-inx-custom-ui] 读取持久化配置失败: ' + String((e && e.message) || e))
      })

      /* 插件停止时清覆盖层与背景层（ctx.effect 自动收回）。 */
      ctx.effect(function () {
        return function () {
          if (overrideDispose) { try { overrideDispose() } catch (e) { /* 进程停止，忽略 */ } overrideDispose = null }
          const bgLayer = document.getElementById('dshp-inx-custom-ui-bg-layer')
          if (bgLayer) bgLayer.remove()
          const bgCss = document.getElementById('dshp-inx-custom-ui-bg-css')
          if (bgCss) bgCss.remove()
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


    /* ── 背景管线：壁纸层 + 容器透明化/磨砂覆盖层 ──
     * 社区通行方案（BetterDiscord Translucence 的 --app-bg + layers 磨砂、
     * Obsidian workspace background snippet 的容器降透明）在 DSH 的落地：
     *
     * 分层（z-index 升序）：
     *   body 背景   → 主题 --dsw-alias-bg-base（官方 body 规则持有，不动）
     *   #bg-layer   → fixed 全屏壁纸（图/视频，blur/dim 滤镜吃在层上）
     *   #root       → 三列 frame（grid，原位）—— 官方 frame 背景
     *                 --dsw-alias-bg-base 改为半透明，壁纸透出
     *   各列        → ::before 磨砂伪元素（glass>0 时 backdrop-filter），
     *                 绝不能把 backdrop-filter 放在列自身 —— 列内 fixed
     *                 浮层（设置 dialog .VOzbGW_overlay）会以列为包含块
     *                 被压塌（历史翻车 a3fd708）。
     *
     * 伪元素不构成 fixed 后代的包含块，磨砂安全；同时列自身 background
     * 保持 transparent（原 token 交给 ::before 上色），实现社区主题同款
     * 「背景图 + 磨砂浮层」观感。设置面板/菜单（--dsw-specific-menu/
     * bg-overlay）不透明，浮在最上不受影响。 */
    const BG_LAYER_ID = 'dshp-inx-custom-ui-bg-layer'
    const BG_CSS_ID = 'dshp-inx-custom-ui-bg-css'
    const DEFAULT_BG = { type: 'none', file: '', blur: 0, dim: 0, glass: 0, containerAlpha: 84, centerAlpha: 92 }

    /** 渲染背景（幂等）：none = 拆层回官方。cfg 来自 Host state.background。 */
    function applyBackground(cfg) {
      const bg = cfg && typeof cfg === 'object' ? Object.assign({}, DEFAULT_BG, cfg) : DEFAULT_BG
      const oldLayer = document.getElementById(BG_LAYER_ID)
      if (oldLayer) oldLayer.remove()
      const oldCss = document.getElementById(BG_CSS_ID)
      if (oldCss) oldCss.remove()

      const active = (bg.type === 'image' || bg.type === 'video') && typeof bg.file === 'string' && bg.file.length > 0
      if (!active) return

      const blurPx = Math.min(40, Math.max(0, Number(bg.blur) || 0))
      const dimPct = Math.min(0.8, Math.max(0, Number(bg.dim) || 0))
      const glassPx = Math.min(24, Math.max(0, Math.round(Number(bg.glass) || 0)))
      const containerAlpha = Math.min(100, Math.max(40, Math.round(Number(bg.containerAlpha) || 84)))
      const centerAlpha = Math.min(100, Math.max(60, Math.round(Number(bg.centerAlpha) || 92)))
      const src = 'url("/ext/dshp-inx-custom-ui/file/' + encodeURIComponent(bg.file) + '")'

      /* 壁纸层：fixed 垫底。blur 会露边缘 → 等比放大；dim 吃在 opacity。 */
      const layer = document.createElement('div')
      layer.id = BG_LAYER_ID
      layer.setAttribute('aria-hidden', 'true')
      const scale = blurPx > 0 ? 1 + Math.min(0.2, Math.ceil(blurPx / 20) / 10) : 1
      layer.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;'
        + 'transform:scale(' + scale + ')'
        + (blurPx > 0 ? ';filter:blur(' + blurPx + 'px)' : '')
      if (bg.type === 'image') {
        const dimWrap = document.createElement('div')
        dimWrap.style.cssText = 'position:absolute;inset:0;background-image:' + src + ';background-size:cover;background-position:center;background-repeat:no-repeat' + (dimPct > 0 ? ';opacity:' + (1 - dimPct) + ';background-color:#000' : '')
        layer.appendChild(dimWrap)
      } else {
        /* 动态壁纸：内嵌静音循环视频，同样吃 dim */
        const video = document.createElement('video')
        video.autoplay = true
        video.loop = true
        video.muted = true
        video.playsInline = true
        video.setAttribute('playsinline', '')
        video.setAttribute('disablepictureinpicture', '')
        video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover' + (dimPct > 0 ? ';opacity:' + (1 - dimPct) : '')
        video.src = '/ext/dshp-inx-custom-ui/file/' + encodeURIComponent(bg.file)
        layer.appendChild(video)
      }
      document.body.prepend(layer)

      /* 覆盖层样式：frame 半透明 + 各列伪元素磨砂。
       * color-mix 第二分量是百分比（62%），传小数会让整条声明非法（历史坑）。
       * frame 是 #root 直下 grid 容器（.pI_x6G_frame）；选择器不强绑 hash，
       * 用 [class*="_frame"] 语义命中，漂移风险低。 */
      const mix = (token, pct) => 'color-mix(in srgb, ' + token + ' ' + pct + '%, transparent)'
      const glassCss = glassPx > 0 ? 'backdrop-filter:blur(' + glassPx + 'px) saturate(1.15);-webkit-backdrop-filter:blur(' + glassPx + 'px) saturate(1.15);' : ''
      const css = [
        'body{background:var(--dsw-alias-bg-base) !important}',
        '#root>[class*="_frame"]{background:' + mix('var(--dsw-alias-bg-base)', centerAlpha) + ' !important}',
        /* 侧栏列（.pI_x6G_sidebarCol）：sidebar-fill 半透明 + 磨砂伪元素 */
        '#root [class*="_sidebarCol"]{position:relative;background:transparent !important}',
        '#root [class*="_sidebarCol"]::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;'
          + glassCss + 'background:' + mix('var(--dsw-specific-sidebar-fill)', containerAlpha) + '}',
        /* 详情列（.pI_x6G_detailsCol）：bg-layer-1 半透明 + 磨砂 */
        '#root [class*="_detailsCol"]{position:relative;background:transparent !important}',
        '#root [class*="_detailsCol"]::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;'
          + glassCss + 'background:' + mix('var(--dsw-alias-bg-layer-1)', containerAlpha) + '}',
        /* 中列（.pI_x6G_centerCol）：本身无背景 token，给浅覆盖保气泡可读 */
        '#root [class*="_centerCol"]{position:relative}',
        '#root [class*="_centerCol"]::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;'
          + 'background:' + mix('var(--dsw-alias-bg-base)', centerAlpha) + '}'
      ]
      const style = document.createElement('style')
      style.id = BG_CSS_ID
      style.textContent = css.join('\n')
      document.head.appendChild(style)
    }


    return module.exports
  }
})
