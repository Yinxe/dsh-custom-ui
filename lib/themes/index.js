/**
 * index.js —— 主题目录：聚合全部主题为统一注册清单。
 *
 * 每套主题文件导出 { dark?, light?, meta }（meta.dark / meta.light 含
 * id / label / desc / swatch）。单模式主题只贡献自己那一份。
 * photo:custom 是虚拟主题（壁纸取色 MD3 运行时生成，不在目录内，
 * 由 client 半与 Host allowlist 另行处理）。
 */

import * as opencode from './opencode.js'
import * as linear from './linear.js'
import * as notion from './notion.js'
import * as claude from './claude.js'
import * as nvidia from './nvidia.js'
import * as github from './github.js'
import * as replicate from './replicate.js'
import * as cisco from './cisco.js'
import * as tide from './tide.js'
import * as nebula from './nebula.js'
import * as discord from './discord.js'
import * as supabase from './supabase.js'
import * as sakura from './sakura.js'
import * as skeumorphism from './skeumorphism.js'
import * as wechat from './wechat.js'
import * as xiaohongshu from './xiaohongshu.js'
import * as neobrutalism from './neobrutalism.js'
import * as missioncontrol from './missioncontrol.js'
import * as levels from './levels.js'
import * as arc from './arc.js'
import * as luxury from './luxury.js'

/**
 * 展开一套主题模块为注册条目。
 * 一个模块可能贡献 1~2 个主题（按其 dark/light 导出与 meta 决定）。
 */
function expand(module) {
  const entries = []
  for (const scheme of ['dark', 'light']) {
    const tokens = module[scheme]
    const meta = module.meta && module.meta[scheme]
    if (!tokens || !meta) continue
    entries.push({ colorScheme: scheme, tokens, ...meta })
  }
  return entries
}

/** 全部主题注册清单（顺序与 client 画廊展示顺序一致；Host 仅用 id 白名单）。 */
export const THEME_CATALOG = [
  ...expand(opencode),
  ...expand(github),
  ...expand(linear),
  ...expand(notion),
  ...expand(claude),
  ...expand(nvidia),
  ...expand(replicate),
  ...expand(cisco),
  ...expand(neobrutalism),
  ...expand(missioncontrol),
  ...expand(levels),
  ...expand(arc),
  ...expand(luxury),
  ...expand(skeumorphism),
  ...expand(wechat),
  ...expand(xiaohongshu),
  ...expand(discord),
  ...expand(supabase),
  ...expand(nebula),
  ...expand(sakura),
  ...expand(tide)
]

/** 目录内全部主题 id（Host allowlist 与一致性校验共用）。 */
export const THEME_IDS = THEME_CATALOG.map((t) => t.id)

/** 内置主题的画廊显示名（light/dark 也能在画廊里被切回）。 */
export const BUILTIN_LABELS = {
  light: '浅色（内置）',
  dark: '深色（内置）'
}
