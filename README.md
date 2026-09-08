# @dshp-inx/custom-ui —— DSH 定制 UI 套件

主题画廊是第一个模块：23 套主题（14 套品牌适配 + 9 套原创）+ 设置内一键切换。后续字体、布局、交互等定制模块都归入本包。

## 主题清单（label/desc/swatch 以 `lib/themes/*/meta` 为准；token 单源 `lib/themes/`，Host 经 `GET /themes` 下发，client 只存 meta——改色只改 lib，跑 `scripts/check-themes.mjs` 校验三处一致）

| 主题 id | 模式 | 风格 | 来源 |
|---|---|---|---|
| `opencode-terminal-dark` | 纯暗 | 暖黑 #201d1d + Apple 蓝 + 全站 Berkeley Mono | opencode-ai |
| `opencode-terminal-light` | 纯亮 | 暖白 #fdfcfc 纸感 + 暖灰层次 | opencode-ai |
| `linear-dark` | 纯暗 | 近黑 #08090a + Indigo #5e6ad2，半透明白边框 | linear-app |
| `notion-light` | 纯亮 | 纯白 + 暖灰 + Notion Blue，whisper 边框 + 微阴影 | notion |
| `claude-parchment-light` | 纯亮 | 羊皮纸 #f5f4ed + 赤陶 #c96442，ring 型深度 | claude |
| `nvidia-dark` | 纯暗 | 纯黑 #000 + 信号绿 #76b900（悬停绿→青惊喜） | nvidia |
| `github-dark` | 双模式 | #0d1117 + Primer 蓝 #2f81f7 + 绿色主按钮 | github |
| `github-light` | | 纯白 + #0969da + 发丝线 #d0d7de | github |
| `replicate-light` | 纯亮 | 纯白 #ffffff + 品牌红 #ea2804，全站胶囊感 | replicate |
| `cisco-dark` | 纯暗 | 藏青 #0f1720 + 信号蓝 #049fd9，企业级深色 | cisco |
| `neobrutalism-light` | 纯亮 | 奶油 #fff4cf + 橘红 #d24b1f，硬偏移阴影 | neobrutalism |
| `mission-control-dark` | 纯暗 | 深空 #090b12 + 指挥蓝 #60a5fa，霓虹青点缀 | mission-control |
| `levels-light` | 纯亮 | 米纸 #fbf7ef + 代谢绿 #2f8f46 | levels |
| `arc-light` | 纯亮 | 蜜桃 #fdf3ec + 珊瑚 #ff5f5f | arc |
| `luxury-dark` | 纯暗 | 曜石 #080706 + 鎏金 #c6a15b | luxury |
| `skeumorphism-light` | 纯亮 | 陶土 #f7eee6 + 陶釉 #b46a46，柔和拟物阴影 | skeumorphism |
| `wechat-light` | 纯亮 | 浅灰 #ededed + 微信绿 #07c160 | wechat |
| `xiaohongshu-light` | 纯亮 | 米灰 #f5f5f5 + 种草红 #ff2442 | xiaohongshu |
| `discord-dark` | 纯暗 | 深灰 #313338 + Blurple #5865f2 | discord |
| `supabase-dark` | 纯暗 | 墨黑 #171717 + 翡翠绿 #3ecf8e | supabase |
| `nebula-dark` | 纯暗 | 紫黑 #0d0a1a + 霓紫 #8b5cf6（原创） | 原创 |
| `sakura-light` | 纯亮 | 樱白 #fff9fa + 樱粉 #e75480（原创） | 原创 |
| `tide-dark` | 纯暗 | 深青 #062a2c + 潮汐 #2dd4bf（原创） | 原创 |

每套主题 ~110 个 `--dsw-*` token 全量映射：背景 / 边框 / 品牌 / 按钮 / 交互态 /
文字 / 语义色 / Markdown / 滚动条 / 侧栏 / 气泡 / 浮层 / 阴影 / 字体栈。

## 结构

```
dsh-custom-ui/
├── package.json          # @dshp-inx/custom-ui，dsh.client 声明
├── cordis.patch.yml       # bundle 挂载行
├── lib/
│   ├── index.js           # Host 半：顶部同源小工具（settingsNamespace/json/sameOrigin/readBody，本包自有）+ settings 持久化 + 同源路由（state/themes/theme/config）+ 主题 allowlist（动态派生自目录）
│   └── themes/
│       ├── index.js       # 主题目录聚合（THEME_CATALOG）
│       ├── shared.js      # 字体栈常量 + 字体 token 批量填充 + FLAT_SHADOWS
│       ├── opencode.js    # OpenCode 双模式（dark + light）
│       ├── linear.js      # Linear 纯暗
│       ├── notion.js      # Notion 纯亮
│       ├── claude.js      # Claude 纯亮
│       ├── nvidia.js      # NVIDIA 纯暗
│       └── github.js      # GitHub 双模式
│       ├── replicate.js   # Replicate 纯亮
│       ├── cisco.js       # Cisco 纯暗
│       ├── neobrutalism.js # Neobrutalism 纯亮（硬阴影例外）
│       ├── missioncontrol.js # Mission Control 纯暗
│       ├── levels.js      # Levels 纯亮
│       ├── arc.js         # Arc 纯亮
│       ├── luxury.js      # Luxury 纯暗
│       ├── skeumorphism.js # Skeumorphism 纯亮（柔和阴影例外）
│       ├── wechat.js      # WeChat 纯亮
│       ├── xiaohongshu.js # 小红书 纯亮
│       ├── discord.js     # Discord 纯暗
│       ├── supabase.js    # Supabase 纯暗
│       ├── nebula.js      # Nebula 纯暗（原创）
│       ├── sakura.js      # Sakura 纯亮（原创，柔粉阴影）
│       ├── tide.js        # Tide 纯暗（原创）
│       ├── photo.js       # 壁纸 MD3 引擎（seed→ref 调色板→sys→DSW，含 MD3 导出）
├── scripts/
│   └── check-themes.mjs   # 三处一致性校验（lib 目录 / Host allowlist / client 画廊 meta）
└── client.js             # Client 半（__ModuleLoader__：画廊 UI；只存主题 meta，token 按需问 Host 要）
```

主题数据单源 `lib/themes/`（规范源码，ESM、带注释）。client 半无法 require
本地 lib，主题 token 由 Host 经 `GET /ext/dshp-inx-custom-ui/themes` 下发
（内存缓存一次）；client 只保留 `id/colorScheme/label/desc/group/swatch`，
卡片渲染走 swatch。新增主题三步：`lib/themes/` 加一文件 →
`lib/themes/index.js` 加 import + expand → client `THEMES` 加一条 meta，
然后跑 `node scripts/check-themes.mjs`。

## 挂载

```sh
cd ~/.dsh/profiles/web
pnpm add --offline "@dshp-inx/custom-ui@link:../../plugins/dsh-custom-ui"
rm -rf node_modules/@dshp-inx/custom-ui
ln -s "$HOME/.dsh/plugins/dsh-custom-ui" node_modules/@dshp-inx/custom-ui
# cordis.patch.yml 已由 bundle 自带（cordis.patch.yml），profile 层无需再插行
# 重启 dsh web
```

## 使用

设置 → 外观定制（两块）：

- **主题画廊**：色卡预览 + 点击即切，`theme/change` 事件驱动"使用中"
  徽标实时跟随；内置浅色/深色也可在画廊顶部查看当前态并随时切回。
- **壁纸取色（Material You）**：独立配置区，不占主题卡片位。上传壁纸→
  提取 seed→生成 5 组 ref 调色板 × 亮/暗 sys 色彩，色调条 + 角色预览，
  一键启用；`复制 MD3` 导出 `--md-ref-palette-*` + `--md-sys-color-*-light/dark`
 （与 MD3 令牌命名兼容，可直接用于 MD3 项目）。持久化只存 seed（兼容旧数据）。
- **全局圆角**：三档（-1 跟随主题 / 0 全锐角 / 12 统一圆润），保存即生效，无需刷新。
- ~~**背景与外观**（壁纸上传/视频/毛玻璃）~~：已退役（见 `aebe395`）。`settings.yaml`
  里残留的 `wallpaper.*`/`glass.*` 仅做不透明透传保留数据，不再有 UI；
  取色请用上面的壁纸取色（MD3 动态配色）。

## 持久化

官方 theme 服务的 settings schema（`ui-theme.preference`）只接受
`light/dark/system`——自定义主题 id 只写内存，重启即丢。本插件补上持久化：

- **Host 半**：注册 `dshp-inx-custom-ui` settings 命名空间
  （settings.yaml 顶层，`themeId`/`photoPalette`/`radius` 字段；
  退役的 `wallpaper`/`glass` 仅透传保留），同源路由
  `GET /ext/dshp-inx-custom-ui/state`（偏好快照）、
  `GET /ext/dshp-inx-custom-ui/themes`（目录全量 token 下发）、
  `POST /ext/dshp-inx-custom-ui/theme`（切主题）、
  `POST /ext/dshp-inx-custom-ui/config`（圆角/取色）
- **Client 半**：启动时读 state 恢复主题（注册完成后再 setTheme，静默容错）；
  画廊点击时先 setTheme 再 POST 保存，保存失败会提示（重启后回退内置偏好）
- 清空持久化：把 settings.yaml 里 `dshp-inx-custom-ui.themeId` 置空串，
  即完全跟随官方外观偏好（system/light/dark）
- 白名单校验：Host 半只接受目录内的 23 个主题 id（+ 虚拟 `photo:custom`），未知 id 拒写

## 已知限制

- 动态插件版（会话内 cordis_define）与静态版并存会 WEB_DUPLICATE_PROVIDER，
  静态挂载前先 `cordis_undefine` 动态版。
