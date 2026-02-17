# i18n OCR 问题清单（before）

识别方式：由多模态模型直接读取 `test-results/i18n-screenshots/before/*.png` 截图内容，抽取截图中仍显示为英文的 UI 文本（排除 URL/代码片段/版本号等）。

## Chat.png

- New Session（左侧导航）
- All Sessions（左侧导航、列表标题）
- Status（左侧导航分组）
- Backlog / Todo / Needs Review / Done / Cancelled（Status 子项）
- Archived（左侧导航）
- APIs / MCPs / Local Folders（Sources 分组子项）
- Settings（左侧导航）
- Workspace（左下角工作区切换）

## Flagged.png / Archived.png / Sources*.png / Skills.png / Settings_*.png

- Something went wrong（错误页标题）
- Please restart the app. The error has been reported.（错误页说明）
- Reload（按钮）

