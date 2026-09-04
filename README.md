# @dshp-inx/custom-ui —— DSH 定制 UI 套件

主题画廊是第一个模块：8 套 open-design 主题 + 设置内一键切换。后续字体、布局、交互等定制模块都归入本包。

## 主题清单

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

每套主题 ~110 个 `--dsw-*` token 全量映射：背景 / 边框 / 品牌 / 按钮 / 交互态 /
文字 / 语义色 / Markdown / 滚动条 / 侧栏 / 气泡 / 浮层 / 阴影 / 字体栈。

## 结构

```
dsh-custom-ui/
├── package.json          # @dshp-inx/custom-ui，dsh.client 声明
├── cordis.patch.yml       # bundle 挂载行
├── lib/
│   ├── index.js           # Host 半（极薄占位：全部价值在浏览器侧）
│   └── themes/
│       ├── index.js       # 主题目录聚合（THEME_CATALOG）
│       ├── shared.js      # 字体栈常量 + 字体 token 批量填充 + FLAT_SHADOWS
│       ├── opencode.js    # OpenCode 双模式（dark + light）
│       ├── linear.js      # Linear 纯暗
│       ├── notion.js      # Notion 纯亮
│       ├── claude.js      # Claude 纯亮
│       ├── nvidia.js      # NVIDIA 纯暗
│       └── github.js      # GitHub 双模式
└── client.js             # Client 半（__ModuleLoader__：主题注册 + 画廊 UI）
```

主题数据在 `lib/themes/`（规范源码，ESM、带注释）与 `client.js`（浏览器侧
内联同源副本）各存一份——client 半无法 require 本地 lib，改色时两处同步。

## 挂载

```sh
cd ~/.dsh/profiles/web
pnpm add --offline "@dshp-inx/custom-ui@link:../../plugins/dsh-custom-ui"
rm -rf node_modules/@dshp-inx/custom-ui
ln -s /home/yinxin/.dsh/plugins/dsh-custom-ui node_modules/@dshp-inx/custom-ui
# cordis.patch.yml 已由 bundle 自带（cordis.patch.yml），profile 层无需再插行
# 重启 dsh web
```

## 使用

设置 → 外观定制（两块）：

- **主题画廊**：色卡预览 + 点击即切，`theme/change` 事件驱动"使用中"
  徽标实时跟随；内置浅色/深色也可在画廊顶部查看当前态并随时切回。
- **背景与外观**：壁纸上传（图片 ≤24MB：png/jpg/gif/webp/avif/bmp；视频
  ≤96MB：mp4/webm）、文件列表选择/删除、模糊度（0–40px）、压暗度（0–80%）、
  侧栏与详情栏毛玻璃（0–40px 强度）、全局圆角（-1 默认 / 0 全锐角 / 1–24 上限）。
  保存即生效，无需刷新。

壁纸层为 body 下 fixed 层（z-index:0，pointer-events:none），视频壁纸
静音循环 playsInline；三栏背景改为 `color-mix` 半透明 + `backdrop-filter`
实现毛玻璃，透明度随玻璃强度联动；全部 DOM 与样式节点带 id，重渲染幂等，
插件停止即完全还原。

## 持久化

官方 theme 服务的 settings schema（`ui-theme.preference`）只接受
`light/dark/system`——自定义主题 id 只写内存，重启即丢。本插件补上持久化：

- **Host 半**：注册 `dshp-inx-custom-ui` settings 命名空间
  （settings.yaml 顶层，`themeId` 字段），同源路由
  `GET /ext/dshp-inx-custom-ui/state`、`POST /ext/dshp-inx-custom-ui/theme`
- **Client 半**：启动时读 state 恢复主题（注册完成后再 setTheme，静默容错）；
  画廊点击时先 setTheme 再 POST 保存，保存失败会提示（重启后回退内置偏好）
- 清空持久化：把 settings.yaml 里 `dshp-inx-custom-ui.themeId` 置空串，
  即完全跟随官方外观偏好（system/light/dark）
- 白名单校验：Host 半只接受本插件已知的 8 个主题 id，未知 id 拒写

## 已知限制

- 动态插件版（会话内 cordis_define）与静态版并存会 WEB_DUPLICATE_PROVIDER，
  静态挂载前先 `cordis_undefine` 动态版。
