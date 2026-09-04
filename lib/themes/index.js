/**
 * index.js —— 主题目录：聚合 8 套主题为统一注册清单。
 *
 * 每个条目：{ id, colorScheme, tokens, label, desc, swatch }。
 * 单模式主题只含自己那一份（linear / notion / claude / nvidia 纯单色系）。
 */

import * as opencode from './opencode.js'
import * as linear from './linear.js'
import * as notion from './notion.js'
import * as claude from './claude.js'
import * as nvidia from './nvidia.js'
import * as github from './github.js'

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

/** 全部主题注册清单（顺序即画廊展示顺序）。 */
export const THEME_CATALOG = [
  ...expand(opencode),
  ...expand(linear),
  ...expand(notion),
  ...expand(claude),
  ...expand(nvidia),
  ...expand(github)
]

/** 内置主题的画廊显示名（light/dark 也能在画廊里被切回）。 */
export const BUILTIN_LABELS = {
  light: '浅色（内置）',
  dark: '深色（内置）'
}
