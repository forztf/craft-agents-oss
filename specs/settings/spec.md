# Settings 模块需求规格规范

**版本**: 2.0
**生成日期**: 2026-03-03
**文档格式**: OpenSpec (EARS 语法)
**目标组件**: `apps/electron/src/renderer/pages/settings/`

---

## 模块概述

设置模块是 Craft Agents 应用的核心配置中心，提供全局应用级别设置和各功能模块的特定设置。模块包含 10 个子页面，每个页面负责特定功能的配置管理。

---

## ADDED Requirements

### Requirement: 桌面通知管理
系统 SHALL 提供桌面通知的启用/禁用配置功能。

#### Scenario: 启用桌面通知
- **WHEN** 用户将"桌面通知"开关切换到开启状态
- **THEN** 系统应通过 IPC 调用 `setNotificationsEnabled(true)` 保存设置，并在 AI 完成工作后发送桌面通知
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx:81-84, 101-106`

#### Scenario: 禁用桌面通知
- **WHEN** 用户将"桌面通知"开关切换到关闭状态
- **THEN** 系统应通过 IPC 调用 `setNotificationsEnabled(false)` 保存设置，不再发送桌面通知
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx:81-84, 101-106`

#### Scenario: 加载通知设置状态
- **WHEN** 应用启动并加载设置页面时
- **THEN** 系统应从主进程获取当前通知启用状态，并更新 UI 开关状态
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx:43, 63-79`

---

### Requirement: 电源管理设置
系统 SHALL 提供屏幕保持唤醒的配置功能。

#### Scenario: 启用屏幕保持唤醒
- **WHEN** 用户将"保持屏幕唤醒"开关切换到开启状态
- **THEN** 系统应通过 IPC 调用 `setKeepAwakeWhileRunning(true)` 防止屏幕在会话运行时关闭
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx:86-89, 113-118`

#### Scenario: 禁用屏幕保持唤醒
- **WHEN** 用户将"保持屏幕唤醒"开关切换到关闭状态
- **THEN** 系统应通过 IPC 调用 `setKeepAwakeWhileRunning(false)` 恢复正常屏幕休眠行为
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx:86-89, 113-118`

#### Scenario: 加载电源设置状态
- **WHEN** 应用启动并加载设置页面时
- **THEN** 系统应从主进程获取当前保持唤醒启用状态，并更新 UI 开关状态
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx:47, 63-79`

---

### Requirement: 应用更新管理
系统 SHALL 提供应用版本检查和更新功能。

#### Scenario: 显示当前应用版本
- **WHEN** 用户打开应用设置的"关于"部分
- **THEN** 系统应显示当前应用版本号，未加载时显示"加载中"
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx:125-129`

#### Scenario: 检查更新
- **WHEN** 用户点击"检查更新"按钮
- **THEN** 系统应异步调用更新检查器，显示加载状态，检查完成后更新可用更新信息
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx:53-60, 141-157`

#### Scenario: 显示可用更新
- **WHEN** 检测到有可用的新版本
- **THEN** 系统应显示"更新到 {版本号}"按钮，点击后触发更新安装
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx:130-138`

#### Scenario: 就绪状态下显示重启更新按钮
- **WHEN** 更新已下载并准备安装
- **THEN** 系统应显示"重启以更新"按钮，点击后重启应用并完成更新
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx:158-167`

---

### Requirement: AI 默认配置设置
系统 SHALL 允许用户配置 AI 对话的默认连接、模型和思考级别。

#### Scenario: 设置默认连接
- **WHEN** 用户从默认设置中选择一个 AI 连接
- **THEN** 系统应通过 IPC 调用 `setDefaultLlmConnection(slug)` 将其设为默认连接并刷新连接列表
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:670-684, 610-622`

#### Scenario: 设置默认模型
- **WHEN** 用户从默认设置中选择一个 AI 模型
- **THEN** 系统应更新默认连接的 `defaultModel` 属性并保存
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:686-692, 632-640`

#### Scenario: 设置默认思考级别
- **WHEN** 用户从默认设置中选择思考级别
- **THEN** 系统应更新默认的思考级别配置
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:693-703, 642-645`

#### Scenario: 动态模型选项
- **WHEN** 用户选择的连接有明确的模型列表
- **THEN** 系统应使用连接的模型列表作为下拉选项；否则使用提供商类型的注册模型
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:56-80`

---

### Requirement: 工作区 AI 配置覆盖
系统 SHALL 允许每个工作区覆盖应用级别的 AI 默认设置。

#### Scenario: 设置工作区特定连接
- **WHEN** 用户在工作区覆盖卡片中选择特定连接或"使用默认"
- **THEN** 系统应更新工作区的 `defaultLlmConnection` 设置，选择"使用默认"时清除覆盖
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:396-411, 299-302`

#### Scenario: 设置工作区特定模型
- **WHEN** 用户在工作区覆盖卡片中选择特定模型或"使用默认"
- **THEN** 系统应更新工作区的 `model` 设置，选择"使用默认"时清除覆盖
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:412-421, 304-307`

#### Scenario: 设置工作区特定思考级别
- **WHEN** 用户在工作区覆盖卡片中选择特定思考级别或"使用默认"
- **THEN** 系统应更新工作区的 `thinkingLevel` 设置，选择"使用默认"时清除覆盖
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:422-435, 309-312`

#### Scenario: 工作区覆盖折叠状态
- **WHEN** 工作区设置卡处于折叠状态
- **THEN** 系统应显示工作区名称、图标以及覆盖项摘要（如"使用默认"或具体配置）
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:333-348`

---

### Requirement: AI 连接管理
系统 SHALL 允许用户添加、编辑、删除和验证 AI 提供商连接。

#### Scenario: 编辑连接
- **WHEN** 用户点击连接行的编辑菜单项
- **THEN** 系统应打开全屏 API 设置向导，加载该连接的配置供编辑
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:212-216, 546-548`

#### Scenario: 设置默认连接
- **WHEN** 用户点击非默认连接的"设为默认"菜单项
- **THEN** 系统应调用 IPC 将该连接设为默认并刷新连接列表
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:217-222, 610-622`

#### Scenario: 重新认证连接
- **WHEN** 用户点击"重新认证"菜单项
- **THEN** 系统应打开 API 设置向导，对 OAuth 连接自动触发 OAuth 流程
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:223-228, 550-558`

#### Scenario: 验证连接
- **WHEN** 用户点击"验证连接"菜单项
- **THEN** 系统应调用 IPC 测试连接，显示验证状态（验证中/成功/失败），成功后 3 秒自动清除状态
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:229-235, 574-608`

#### Scenario: 删除连接
- **WHEN** 用户点击"删除"菜单项
- **THEN** 系统应调用 IPC 删除该连接并刷新连接列表（至少保留一个连接）
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:236-244, 560-572`

#### Scenario: 添加新连接
- **WHEN** 用户点击"+ 添加连接"按钮
- **THEN** 系统应打开全屏 API 设置向导供用户添加新的 AI 连接
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:754-761, 493-497`

---

### Requirement: 凭证健康监控
系统 SHALL 监控 AI 凭证健康状态并在检测到问题时显示警告。

#### Scenario: 检测凭证损坏
- **WHEN** 系统检测到凭证文件损坏
- **THEN** 系统应在 AI 设置页面顶部显示警告横幅，说明"凭证文件已损坏，请重新认证"
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:92-103, 116-137`

#### Scenario: 检测跨机器凭证
- **WHEN** 系统检测到凭证来自另一台机器
- **THEN** 系统应在 AI 设置页面顶部显示警告横幅，说明"检测到来自另一台机器的凭证"
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:94-97, 116-137`

#### Scenario: 从凭证警告重新认证
- **WHEN** 用户点击凭证警告横幅的"重新认证"按钮
- **THEN** 系统应打开默认连接或首个连接的 API 设置向导供用户重新认证
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:127-134, 534-543`

---

### Requirement: 外观主题设置
系统 SHALL 允许用户配置应用的外观主题。

#### Scenario: 设置主题模式
- **WHEN** 用户从模式分段控制器选择"系统"、"浅色"或"深色"
- **THEN** 系统应更新全局主题模式设置
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx:227-236`

#### Scenario: 设置颜色主题
- **WHEN** 用户从颜色主题下拉菜单选择预设主题
- **THEN** 系统应更新全局颜色主题设置
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx:238-243`

#### Scenario: 设置字体
- **WHEN** 用户从字体分段控制器选择字体类型
- **THEN** 系统应更新全局字体设置
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx:245-252`

---

### Requirement: 工作区主题覆盖
系统 SHALL 允许每个工作区覆盖应用级别的主题设置。

#### Scenario: 设置工作区特定颜色主题
- **WHEN** 用户在工作区主题设置中选择特定主题或"使用默认"
- **THEN** 系统应更新工作区的颜色主题设置，对于当前工作区立即应用，其他工作区通过 IPC 持久化
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx:284-297, 173-193`

#### Scenario: 显示工作区主题状态
- **WHEN** 渲染工作区主题设置行时
- **THEN** 系统应显示工作区名称、图标以及当前主题选择（如有自定义主题高亮显示，否则显示"使用默认"）
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx:268-283`

---

### Requirement: 工具图标映射管理
系统 SHALL 显示 CLI 命令到图标的映射配置并提供编辑入口。

#### Scenario: 显示工具图标映射表
- **WHEN** 用户打开工具图标设置部分
- **THEN** 系统应显示包含图标预览、工具名称、命令徽章的数据表格
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx:110-151, 323-329`

#### Scenario: 通过编辑弹窗编辑工具图标
- **WHEN** 用户点击工具图标部分的编辑按钮
- **THEN** 系统应打开 EditPopover 提供 AI 辅助编辑工具图标配置的功能
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx:309-320`

#### Scenario: 直接编辑工具图标文件
- **WHEN** 用户点击工具图标编辑弹窗的"编辑文件"操作
- **THEN** 系统应在系统编辑器中打开 `~/.craft-agent/tool-icons/tool-icons.json` 文件
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx:314-318`

---

### Requirement: 输入行为设置
系统 SHALL 允许用户配置聊天输入的行为。

#### Scenario: 启用自动大写
- **WHEN** 用户将"自动大写"开关切换到开启状态
- **THEN** 系统应通过 IPC 调用 `setAutoCapitalisation(true)`，输入消息时自动首字母大写
> 来源: `apps/electron/src/renderer/pages/settings/InputSettingsPage.tsx:68-71, 94-99`

#### Scenario: 启用拼写检查
- **WHEN** 用户将"拼写检查"开关切换到开启状态
- **THEN** 系统应通过 IPC 调用 `setSpellCheck(true)`，在输入时下划线标记拼写错误
> 来源: `apps/electron/src/renderer/pages/settings/InputSettingsPage.tsx:73-76, 100-105`

#### Scenario: 配置发送消息快捷键
- **WHEN** 用户从"发送消息用"下拉选择"Enter"或"Cmd Enter"（Windows 为 Ctrl+Enter）
- **THEN** 系统应通过 IPC 调用 `setSendMessageKey(key)` 更新发送消息的键盘快捷键
> 来源: `apps/electron/src/renderer/pages/settings/InputSettingsPage.tsx:78-82, 112-121`

---

### Requirement: 工作区标识设置
系统 SHALL 允许用户修改工作区的名称和图标。

#### Scenario: 重命名工作区
- **WHEN** 用户点击工作区名称旁边的"编辑"按钮，输入新名称并提交
- **THEN** 系统应更新工作区的 `name` 设置，刷新工作区列表显示新名称
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:303-317, 355-372`

#### Scenario: 上传工作区图标
- **WHEN** 用户点击"更改"按钮选择图片文件（支持 png、jpg、jpeg、svg、webp、gif）
- **THEN** 系统应验证文件类型，转换图片为 base64，保存到工作区目录，并刷新工作区列表显示新图标
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:319-352, 142-194`

---

### Requirement: 工作区权限设置
系统 SHALL 允许用户配置工作区的默认权限模式。

#### Scenario: 设置默认权限模式
- **WHEN** 用户从默认模式下拉选择"只读"、"询问"或"全部允许"
- **THEN** 系统应更新工作区的 `permissionMode` 设置
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:377-387, 197-203`

---

### Requirement: 权限模式循环设置
系统 SHALL 允许用户配置可通过快捷键循环切换的权限模式。

#### Scenario: 启用/禁用权限模式循环
- **WHEN** 用户切换某个权限模式的开关
- **THEN** 系统应启用或禁用该模式在快捷键 Shift+Tab 循环中的参与
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:397-409, 238-267`

#### Scenario: 至少保留两个可循环模式
- **WHEN** 用户尝试禁用权限模式导致只剩少于 2 个模式
- **THEN** 系统应拒绝该操作，显示错误提示"至少需要 2 个模式"，2 秒后自动清除提示
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:247-254, 412-423`

---

### Requirement: 工作区高级配置
系统 SHALL 允许用户配置工作区的工作目录和本地 MCP 服务器。

#### Scenario: 更改默认工作目录
- **WHEN** 用户点击"更改..."按钮并通过文件夹对话框选择新目录
- **THEN** 系统应更新工作区的 `workingDirectory` 设置为选中路径
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:429-451, 205-217`

#### Scenario: 清除工作目录
- **WHEN** 用户点击"清除"按钮
- **THEN** 系统应清除工作区的 `workingDirectory` 设置，恢复使用会话文件夹
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:434-441, 219-228`

#### Scenario: 启用/禁用本地 MCP 服务器
- **WHEN** 用户切换"本地 MCP 服务器"开关
- **THEN** 系统应更新工作区的 `localMcpEnabled` 设置
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:453-458, 230-236`

---

### Requirement: 默认权限配置显示
系统 SHALL 显示 Explore 模式的默认权限模式配置。

#### Scenario: 显示默认权限说明
- **WHEN** 用户打开权限设置的"关于权限"部分
- **THEN** 系统应显示权限功能说明、推荐工作流程以及"了解更多"文档链接
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx:211-231`

#### Scenario: 显示默认权限表格
- **WHEN** 用户打开权限设置的"默认权限"部分
- **THEN** 系统应显示 Bash、MCP、API 端点、写入路径的允许模式规则表格
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx:234-269, 46-86`

#### Scenario: 通过编辑弹窗编辑默认权限
- **WHEN** 用户点击默认权限部分的编辑按钮
- **THEN** 系统应打开 EditPopover 提供 AI 辅助编辑 `default.json` 文件的功能
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx:238-248`

#### Scenario: 直接编辑默认权限文件
- **WHEN** 用户点击默认权限编辑弹窗的"编辑文件"操作
- **THEN** 系统应在系统编辑器中打开 `~/.craft-agent/permissions/default.json` 文件
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx:243-247`

---

### Requirement: 工作区权限自定义显示
系统 SHALL 显示工作区级别的自定义权限配置。

#### Scenario: 显示自定义权限表格
- **WHEN** 用户打开权限设置的"工作区自定义"部分
- **THEN** 系统应显示工作区扩展的 Bash、MCP、API 端点和写入路径规则
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx:272-311, 89-131`

#### Scenario: 通过编辑弹窗编辑自定义权限
- **WHEN** 用户点击工作区自定义部分的编辑按钮
- **THEN** 系统应打开 EditPopover 提供 AI 辅助编辑工作区 `permissions.json` 文件的功能
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx:276-291`

#### Scenario: 直接编辑自定义权限文件
- **WHEN** 用户点击工作区自定义编辑弹窗的"编辑文件"操作
- **THEN** 系统应在系统编辑器中打开工作区的 `permissions.json` 文件
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx:284-288`

#### Scenario: 监听默认权限文件变更
- **WHEN** `~/.craft-agent/permissions/default.json` 文件发生变化
- **THEN** 系统应自动重新加载默认权限配置并更新显示
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx:184-195`

---

### Requirement: 标签层级配置显示
系统 SHALL 显示工作区的标签层级结构。

#### Scenario: 显示标签说明
- **WHEN** 用户打开标签设置的"关于标签"部分
- **THEN** 系统应显示标签功能说明、值类型说明、自动应用规则说明以及"了解更多"文档链接
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx:72-95`

#### Scenario: 显示标签层级表格
- **WHEN** 用户打开标签设置的"标签层级"部分
- **THEN** 系统应显示可展开/折叠的标签树形表格，包含标签名称、颜色、值类型等信息
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx:98-132`

#### Scenario: 通过编辑弹窗编辑标签配置
- **WHEN** 用户点击标签层级部分的编辑按钮
- **THEN** 系统应打开 EditPopover 提供 AI 辅助编辑 `labels/config.json` 文件的功能
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx:102-110`

#### Scenario: 直接编辑标签配置文件
- **WHEN** 用户点击标签层级编辑弹窗的"编辑文件"操作
- **THEN** 系统应在系统编辑器中打开工作区的 `labels/config.json` 文件
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx:53-56`

#### Scenario: 显示未配置标签的空状态
- **WHEN** 工作区未配置任何标签
- **THEN** 系统应显示空状态提示，说明标签可通过编辑 `labels/config.json` 文件创建
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx:122-130`

---

### Requirement: 标签自动应用规则显示
系统 SHALL 显示标签的自动应用正则表达式规则。

#### Scenario: 显示自动应用规则表格
- **WHEN** 用户打开标签设置的"自动应用规则"部分
- **THEN** 系统应显示所有标签的自动应用规则表格，包含父标签、正则表达式、示例匹配值等信息
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx:135-158`

#### Scenario: 通过编辑弹窗编辑自动应用规则
- **WHEN** 用户点击自动应用规则部分的编辑按钮
- **THEN** 系统应打开 EditPopover 提供 AI 辅助编辑自动应用规则的功能
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx:139-147`

---

### Requirement: 快捷键参考显示
系统 SHALL 显示应用和组件的快捷键参考信息。

#### Scenario: 显示全局快捷键
- **WHEN** 用户打开快捷键设置页面
- **THEN** 系统应从集中式操作注册表按类别显示全局快捷键
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx:103-111`

#### Scenario: 显示组件特定快捷键
- **WHEN** 用户打开快捷键设置页面
- **THEN** 系统应显示列表导航、会话列表、聊天输入等组件的快捷键
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx:114-128, 31-57`

#### Scenario: 智能分隔快捷键显示
- **WHEN** 渲染快捷键
- **THEN** Mac 平台应正确分隔 `⌘⇧N` 等组合键，Windows 平台应正确分隔 `Ctrl+Shift+N`
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx:78-80`

---

### Requirement: 用户偏好设置
系统 SHALL 允许用户 configuring 个人偏好信息。

#### Scenario: 设置用户姓名
- **WHEN** 用户在"姓名"输入框输入姓名
- **THEN** 系统应自动保存（500ms 防抖）到 `~/.craft-agent/preferences.json` 文件
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:217-224, 140-169`

#### Scenario: 设置时区
- **WHEN** 用户在"时区"输入框输入时区（如 America/New_York）
- **THEN** 系统应自动保存（500ms 防抖）到偏好文件
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:226-232`

#### Scenario: 设置语言偏好
- **WHEN** 用户从"语言"下拉选择英语或简体中文
- **THEN** 系统应自动保存语言偏好到偏好文件，并立即切换应用语言
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:234-251, 237-244`

#### Scenario: 设置城市信息
- **WHEN** 用户在"城市"输入框输入城市名称
- **THEN** 系统应自动保存（500ms 防抖）到偏好文件的 location.city 字段
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:262-268`

#### Scenario: 设置国家信息
- **WHEN** 用户在"国家"输入框输入国家名称
- **THEN** 系统应自动保存（500ms 防抖）到偏好文件的 location.country 字段
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:270-276`

#### Scenario: 设置用户备注
- **WHEN** 用户在"备注"文本框输入自由格式内容
- **THEN** 系统应自动保存（500ms 防抖）到偏好文件的 notes 字段
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:299-306`

#### Scenario: 组件卸载时保存未保存更改
- **WHEN** 用户离开偏好设置页面且存在未保存的更改
- **THEN** 系统应在组件卸载时立即将当前状态保存到偏好文件
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:172-188`

#### Scenario: 通过编辑弹窗编辑备注
- **WHEN** 用户点击备注部分的编辑按钮
- **THEN** 系统应打开 EditPopover 提供 AI 辅助编辑备注的功能
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:286-296`

#### Scenario: 直接编辑偏好文件
- **WHEN** 用户点击备注编辑弹窗的"编辑文件"操作
- **THEN** 系统应在系统编辑器中打开 `~/.craft-agent/preferences.json` 文件
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:290-294`

---

### Requirement: 设置页面导航器
系统 SHALL 提供设置页面导航面板。

#### Scenario: 显示设置页面列表
- **WHEN** 用户打开设置导航面板
- **THEN** 系统应从共享架构渲染设置页面列表，包含图标、标签和描述
> 来源: `apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx:47-52, 162-171`

#### Scenario: 选择设置页面
- **WHEN** 用户点击设置页面列表项
- **THEN** 系统应调用 `onSelectSubpage` 切换到选中的设置子页面
> 来源: `apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx:95-123`

#### Scenario: 显示选中状态
- **WHEN** 某个设置页面被选中
- **THEN** 系统应高亮显示该列表项，图标和标签使用前景色
> 来源: `apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx:98-105, 110-116`

#### Scenario: 鼠标悬停显示快捷菜单
- **WHEN** 鼠标悬停在设置列表项上
- **THEN** 系统应显示"..."快捷菜单按钮
> 来源: `apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx:125-148`

#### Scenario: 在新窗口打开设置页面
- **WHEN** 用户点击"..."菜单的"在新窗口打开"选项
- **THEN** 系统应通过 deep link `craftagents://settings/{subpageId}?window=focused` 在新窗口打开该设置页面
> 来源: `apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx:140-143`

---

### Requirement: 空工作区状态处理
系统 SHALL 在没有活动工作区时显示空状态。

#### Scenario: 显示无选中工作区空状态
- **WHEN** 用户打开工作区设置页面但没有活动工作区时
- **THEN** 系统应显示"未选择工作区"提示信息
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:269-278`

---

### Requirement: 加载状态处理
系统 SHALL 在加载数据时显示加载指示器。

#### Scenario: 显示工作区设置加载状态
- **WHEN** 正在加载工作区设置时
- **THEN** 系统应显示旋转加载图标
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:281-290`

#### Scenario: 显示权限设置加载状态
- **WHEN** 正在加载权限配置时
- **THEN** 系统应显示旋转加载图标
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx:139, 204-207`

#### Scenario: 显示标签设置加载状态
- **WHEN** 正在加载标签配置时
- **THEN** 系统应显示旋转加载图标
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx:43, 65-68`

#### Scenario: 显示偏好设置加载状态
- **WHEN** 正在加载用户偏好时
- **THEN** 系统应显示旋转加载图标
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:101, 197-202`

---

## 附录 A: 设置页面索引

| 页面ID | 页面名称 | 描述 | 组件文件 |
|--------|---------|------|----------|
| app | App | 通知和更新 | AppSettingsPage.tsx |
| ai | AI | 模型、思考、连接 | AiSettingsPage.tsx |
| appearance | Appearance | 主题、字体、工具图标 | AppearanceSettingsPage.tsx |
| input | Input | 发送键、拼写检查 | InputSettingsPage.tsx |
| workspace | Workspace | 名称、图标、工作目录 | WorkspaceSettingsPage.tsx |
| permissions | Permissions | Explore 模式规则 | PermissionsSettingsPage.tsx |
| labels | Labels | 管理会话标签 | LabelsSettingsPage.tsx |
| shortcuts | Shortcuts | 键盘快捷键 | ShortcutsPage.tsx |
| preferences | Preferences | 用户偏好 | PreferencesPage.tsx |

---

## 附录 B: 配置文件位置

| 配置类型 | 存储位置 | 说明 |
|---------|---------|------|
| AI 连接 | 应用配置目录 | LLM 连接和凭证 |
| 用户偏好 | `~/.craft-agent/preferences.json` | 用户个人信息和备注 |
| 默认权限 | `~/.craft-agent/permissions/default.json` | Explore 模式默认权限 |
| 工作区配置 | `{workspace}/settings.json` | 工作区特定设置 |
| 标签配置 | `{workspace}/labels/config.json` | 标签层次和自动规则 |
| 工作区权限 | `{workspace}/permissions.json` | 工作区自定义权限 |
| 工具图标 | `~/.craft-agent/tool-icons/tool-icons.json` | CLI 命令图标映射 |

---

## 附录 C: IPC 通信接口

| IPC 方法 | 描述 |
|---------|------|
| `getNotificationsEnabled()` / `setNotificationsEnabled(enabled)` | 桌面通知管理 |
| `getKeepAwakeWhileRunning()` / `setKeepAwakeWhileRunning(enabled)` | 屏幕唤醒控制 |
| `getDefaultLlmConnection()` / `setDefaultLlmConnection(slug)` | 默认 AI 连接 |
| `saveLlmConnection(connection)` / `deleteLlmConnection(slug)` | 连接管理 |
| `testLlmConnection(slug)` | 连接验证 |
| `getCredentialHealth()` | 凭证健康检查 |
| `getWorkspaceSettings(id)` / `updateWorkspaceSetting(id, key, value)` | 工作区设置 |
| `getWorkspaceIcon(id)` | 工作区图标 |
| `getDefaultPermissionsConfig()` / `getWorkspacePermissionsConfig(id)` | 权限配置 |
| `readPreferences()` / `writePreferences(content)` | 用户偏好 |
| `readWorkspaceImage(id, path)` / `writeWorkspaceImage(id, path, data, type)` | 图片文件读写 |
| `loadPresetThemes()` / `setWorkspaceColorTheme(id, theme)` | 主题配置 |
| `getToolIconMappings()` | 工具图标映射 |

---

## 变更历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 2.0 | 2026-03-03 | 重写为标准 EARS 语法（WHEN/THEN）格式 |
| 1.0 | 2026-03-03 | 初始版本 |

---

### Requirement: SettingsInput 表单验证
系统 SHALL 在设置页面输入组件中支持表单验证功能。

#### Scenario: 在 SettingsInput 中显示验证错误
- **WHEN** 输入组件设置了 error 属性值
- **THEN** 系统应在输入框下方显示红色错误消息，并在输入框周围显示红色边框
> 来源: `apps/electron/src/renderer/components/settings/SettingsInput.tsx:30-34, 98-99, 131`

#### Scenario: 在 SettingsInputRow 中显示验证错误
- **WHEN** 内联输入组件设置了 error 属性值
- **THEN** 系统应在标签下方显示红色错误消息，并在输入框周围显示红色边框
> 来源: `apps/electron/src/renderer/components/settings/SettingsInput.tsx:156-157, 196-198, 193`

---

### Requirement: 密码输入可见性控制
系统 SHALL 在密码输入框中支持显示/隐藏密码的切换功能。

#### Scenario: 在 SettingsInput 中切换密码可见性
- **WHEN** 用户点击密码类型输入框的显示/隐藏图标按钮
- **THEN** 系统应在明文和密文输入类型之间切换，并相应更新图标
> 来源: `apps/electron/src/renderer/components/settings/SettingsInput.tsx:28-29, 73-76, 114-127`

#### Scenario: 在 SettingsSecretInput 中切换值可见性
- **WHEN** 用户点击密钥输入框的显示/隐藏图标按钮
- **THEN** 系统应在明文和密文输入类型之间切换，并相应更新图标
> 来源: `apps/electron/src/renderer/components/settings/SettingsInput.tsx:252, 255, 282, 290-301`

---

### Requirement: 可搜索模型选择器
系统 SHALL 在设置页面提供可搜索的模型选择器组件。

#### Scenario: 打开模型下拉列表
- **WHEN** 用户点击输入框右侧的下拉按钮且已有可用模型
- **THEN** 系统应打开 popover 下拉菜单，显示所有可用模型并自动聚焦搜索输入框
> 来源: `apps/electron/src/renderer/components/settings/SearchableModelInput.tsx:87-95, 119-123, 92-94`

#### Scenario: 搜索模型列表
- **WHEN** 用户在下拉菜单的搜索框中输入搜索关键词
- **THEN** 系统应根据模型 ID 和名称进行不区分大小写的过滤，更新显示的模型列表
> 来源: `apps/electron/src/renderer/components/settings/SearchableModelInput.tsx:61-69, 138-141`

#### Scenario: 从列表选择模型
- **WHEN** 用户从过滤后的模型列表中选中一个模型
- **THEN** 系统应更新输入框值为选中模型的 ID，关闭下拉菜单，清空搜索查询，并调用可选的 onBlur 处理器
> 来源: `apps/electron/src/renderer/components/settings/SearchableModelInput.tsx:71-76`

#### Scenario: 显示无模型结果
- **WHEN** 搜索过滤后没有匹配的模型
- **THEN** 系统应显示"No models found"提示消息
> 来源: `apps/electron/src/renderer/components/settings/SearchableModelInput.tsx:145-148`

#### Scenario: 异步获取模型列表
- **WHEN** 用户点击获取按钮且 onFetchModels 处理器已设置
- **THEN** 系统应调用 onFetchModels 异步获取模型，打开下拉菜单，加载完成后自动聚焦搜索输入框
> 来源: `apps/electron/src/renderer/components/settings/SearchableModelInput.tsx:78-85`

---

### Requirement: SettingsSection 危险变体
系统 SHALL 支持在设置区域使用危险变体来突出显示具有潜在风险的操作。

#### Scenario: 显示危险区域标题
- **WHEN** SettingsSection 设置了 variant="danger"
- **THEN** 系统应在区域标题使用红色文字（text-destructive）样式
> 来源: `apps/electron/src/renderer/components/settings/SettingsSection.tsx:24, 51-53`

---

### Requirement: SettingsSection 操作按钮
系统 SHALL 支持在设置区域标题右侧显示操作按钮（如编辑按钮）。

#### Scenario: 显示区域操作按钮
- **WHEN** SettingsSection 提供了 action 属性
- **THEN** 系统应在区域标题右侧显示提供的操作元素
> 来源: `apps/electron/src/renderer/components/settings/SettingsSection.tsx:25-27, 61`

---

### Requirement: SettingsRow 动态内容渲染
系统 SHALL 支持在设置行中渲染动态的标签内容和右侧内容。

#### Scenario: 使用 JSX 作为标签
- **WHEN** SettingsRow 的 label 属性是 JSX 元素
- **THEN** 系统应正确渲染 JSX 内容作为标签
> 来源: `apps/electron/src/renderer/components/settings/SettingsRow.tsx:14, 61-62`

---

### Requirement: SettingsRow 点击交互
系统 SHALL 支持设置行的点击交互。

#### Scenario: 设置行可点击
- **WHEN** SettingsRow 设置了 onClick 处理器
- **THEN** 系统应将容器渲染为 button 元素，点击时执行处理器，鼠标悬停时显示背景色变化
> 来源: `apps/electron/src/renderer/components/settings/SettingsRow.tsx:19-20, 51-54, 54-58`

---

### Requirement: SettingsCard 内部分隔
系统 SHALL 支持在卡片内使用分隔线来分隔子项。

#### Scenario: 卡片内分隔线
- **WHEN** SettingsCard 的 divided 设置为 true 且有多个子项
- **THEN** 系统应在子项之间添加 1px 高的水平分隔线
> 来源: `apps/electron/src/renderer/components/settings/SettingsCard.tsx:17, 39-45`

#### Scenario: 跳过最后一项的分隔线
- **WHEN** SettingsCard 渲染带有分隔线的多个子项时
- **THEN** 系统应在每个子项后添加分隔线，除了最后一项
> 来源: `apps/electron/src/renderer/components/settings/SettingsCard.tsx:40-45`

---

### Requirement: SettingsCardContent 独立内容包装器
系统 SHALL 支持在卡片中使用独立的内容包装器。

#### Scenario: 使用内容包装器
- **WHEN** 在 SettingsCard 内使用 SettingsCardContent
- **THEN** 系统应将内容包裹在带边距的 div 中
> 来源: `apps/electron/src/renderer/components/settings/SettingsCard.tsx:56-64`

---

### Requirement: SettingsCardFooter 操作页脚
系统 SHALL 支持在卡片底部显示操作按钮区域。

#### Scenario: 显示卡片操作页脚
- **WHEN** 在 SettingsCard 后使用 SettingsCardFooter
- **THEN** 系统应显示带背景色的底部区域，右对齐显示操作按钮
> 来源: `apps/electron/src/renderer/components/settings/SettingsCard.tsx:69-86`

---

### Requirement: SettingsSegmentedControlCard 卡片变体
系统 SHALL 支持卡片风格的分段控制器。

#### Scenario: 渲染卡片风格分段控制器
- **WHEN** 使用 SettingsSegmentedControlCard 组件
- **THEN** 系统应以网格布局渲染选项，每个选项为圆角卡片，选中时高亮背景并显示选中标识
> 来源: `apps/electron/src/renderer/components/settings/SettingsSegmentedControl.tsx:121-181`

#### Scenario: 动态列数
- **WHEN** SettingsSegmentedControlCard 设置了 columns 属性
- **THEN** 系统应使用指定的列数（2、3 或 4）布局选项卡片
> 来源: `apps/electron/src/renderer/components/settings/SettingsSegmentedControl.tsx:117, 132-136`

---

### Requirement: SettingsSelect 内联变体
系统 SHALL 支持内联样式选择器。

#### Scenario: 渲染内联选择器
- **WHEN** 使用 SettingsSelectRow 组件
- **THEN** 系统应将标签放在左侧，选择器放在右侧，固定选择器宽度为 180px
> 来源: `apps/electron/src/renderer/components/settings/SettingsSelect.tsx:136-183`

---

### Requirement: SettingsSelect 国际化占位符
系统 SHALL 支持选择器占位符文本的国际化。

#### Scenario: 使用翻译后的占位符
- **WHEN** SettingsSelect 未设置 placeholder 属性
- **THEN** 系统应从翻译字典获取"Select..."作为占位符文本
> 来源: `apps/electron/src/renderer/components/settings/SettingsSelect.tsx:72, 74`

---

### Requirement: SettingsRowLabel 独立标签
系统 SHALL 支持独立使用设置行标签组件。

#### Scenario: 使用独立标签
- **WHEN** 在 SettingsRow 外使用 SettingsRowLabel
- **THEN** 系统应渲染标签和描述文本，使用与 SettingsRow 相同的样式
> 来源: `apps/electron/src/renderer/components/settings/SettingsRow.tsx:86-103`

---

### Requirement: SettingsGroup 顶级分组
系统 SHALL 支持使用分组组件组织设置页面的主要区域。

#### Scenario: 渲染设置分组
- **WHEN** 使用 SettingsGroup 组件
- **THEN** 系统应显示大写分组标题，使用横线分隔，并在下方按垂直间距排列子内容
> 来源: `apps/electron/src/renderer/components/settings/SettingsSection.tsx:90-98`

---

### Requirement: SettingsDivider 水平分隔
系统 SHALL 支持在设置区域间使用分隔线。

#### Scenario: 渲染分隔线
- **WHEN** 使用 SettingsDivider 组件
- **THEN** 系统应渲染 1px 高的水平分隔线
> 来源: `apps/electron/src/renderer/components/settings/SettingsSection.tsx:115-117`

---

### Requirement: AI 设置空状态
系统 SHALL 在没有配置连接时显示空状态提示。

#### Scenario: 显示无连接空状态
- **WHEN** AI 设置页面没有配置任何连接
- **THEN** 系统应显示"No connections configured. Add a connection to get started."提示信息
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:727-730`

---

### Requirement: 连接排序
系统 SHALL 在 AI 设置中按优先级和名称排序连接列表。

#### Scenario: 按默认状态和名称排序连接
- **WHEN** 渲染 AI 连接列表时
- **THEN** 系统应将默认连接排在前面，其他连接按字母顺序排序
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:732-737`

---

### Requirement: 工作区设置加载状态
系统 SHALL 在加载工作区设置时显示加载指示器。

#### Scenario: 显示空状态工作区提示
- **WHEN** 工作区设置页面没有活动工作区
- **THEN** 系统应显示"No workspace selected"提示，禁用设置编辑功能
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:270-278`

#### Scenario: 显示工作区加载指示器
- **WHEN** 正在加载工作区设置数据
- **THEN** 系统应显示旋转的 Spinner 加载图标
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:282-290`

---

### Requirement: 工作区图标上传反馈
系统 SHALL 在工作区图标上传过程中提供视觉反馈。

#### Scenario: 显示上传中状态
- **WHEN** 正在上传工作区图标文件
- **THEN** 系统应在图标区域显示小型 Spinner 加载图标，按钮显示"Uploading..."文本，禁用文件输入
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:154, 192, 328, 330-331, 342-344`

#### Scenario: 上传完成后重置文件输入
- **WHEN** 工作区图标上传完成（无论成功或失败）
- **THEN** 系统应重置文件输入的 value，允许用户选择同一文件再次上传
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:190-193`

---

### Requirement: 工作区重命名对话框
系统 SHALL 使用模态对话框进行工作区重命名操作。

#### Scenario: 打开重命名对话框
- **WHEN** 用户在工作区设置中点击名称旁的"Edit"按钮
- **THEN** 系统应打开 RenameDialog，预填充当前工作区名称，聚焦输入框
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:307-317, 355-358`

#### Scenario: 保存工作区重命名
- **WHEN** 用户在重命名对话框中提交新名称
- **THEN** 系统应验证名称非空且与原名称不同，更新工作区设置，刷新工作区列表，关闭对话框
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:359-369`

---

### Requirement: 工作区权限模式错误提示
系统 SHALL 在用户尝试禁用过多权限模式时显示错误提示。

#### Scenario: 模式禁用错误提示
- **WHEN** 用户尝试禁用权限模式导致可循环模式少于 2 个
- **THEN** 系统应显示"At least 2 modes required"错误消息，2 秒后自动淡化隐藏
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx:247-254, 418-423`

---

### Requirement: 偏好表单初始加载跳过
系统 SHALL 在加载过程中跳过自动保存以避免不必要的写入。

#### Scenario: 初始加载期间跳过自动保存
- **WHEN** 用户偏好表单处于初始加载状态
- **THEN** 系统应跳过防抖自动保存逻辑
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:104, 124, 131-133, 142-143`

#### Scenario: 完成初始加载
- **WHEN** 用户偏好表单数据加载完成
- **THEN** 系统应延迟 100ms 后重置初始加载标记
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:130-134`

---

### Requirement: 用户偏好语言规范化
系统 SHALL 支持规范化历史遗留的语言偏好值。

#### Scenario: 规范化语言偏好值
- **WHEN** 解析用户偏好文件中的语言设置时
- **THEN** 系统应将"English"转换为"en"，将简体中文 Unicode 转换为"zh-CN"，其他值保持为字符串
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx:43-50, 68`

---

### Requirement: 权限设置文档链接
系统 SHALL 在权限设置页面提供相关文档链接。

#### Scenario: 打开权限文档
- **WHEN** 用户在权限设置页面点击"Learn more"链接
- **THEN** 系统应在系统默认浏览器中打开权限文档页面
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx:223-228`

---

### Requirement: 标签设置文档链接
系统 SHALL 在标签设置页面提供相关文档链接。

#### Scenario: 打开标签文档
- **WHEN** 用户在标签设置页面点击"Learn more"链接
- **THEN** 系统应在系统默认浏览器中打开标签文档页面
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx:87-92`

---

### Requirement: 标签设置编辑弹窗模型参数
系统 SHALL 支持为标签编辑弹窗配置自定义模型参数。

#### Scenario: 使用自定义模型编辑标签
- **WHEN** 用户打开标签层级或自动规则编辑弹窗
- **THEN** 系统应使用预定义的 model、context、example 和 systemPromptPreset 参数配置
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx:103-109, 140-146`

---

### Requirement: 权限设置自定义编辑配置
系统 SHALL 支持为工作区自定义权限编辑弹窗配置自定义参数。

#### Scenario: 使用自定义配置编辑权限
- **WHEN** 用户打开工作区自定义权限编辑弹窗
- **THEN** 系统应使用工作区根路径获取预定义的编辑配置（context 和 example）
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx:276-290`

---

### Requirement: 快捷键页面组件特定区域
系统 SHALL 在快捷键设置页面显示组件级别的快捷键参考。

#### Scenario: 显示列表导航快捷键
- **WHEN** 用户查看快捷键设置页面的列表导航区域
- **THEN** 系统应显示上下键导航、Home/End 键操作等快捷键
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx:33-41`

#### Scenario: 显示会话列表快捷键
- **WHEN** 用户查看快捷键设置页面的会话列表区域
- **THEN** 系统应显示 Enter 键聚焦输入、右键打开菜单等快捷键
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx:42-48`

#### Scenario: 显示聊天输入快捷键
- **WHEN** 用户查看快捷键设置页面的聊天输入区域
- **THEN** 系统应显示 Enter/Shift+Enter 发送消息、Esc 关闭对话框等快捷键
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx:50-57`

---

### Requirement: Mac 平台快捷键符号分割
系统 SHALL 在 Mac 平台正确分割组合快捷键符号。

#### Scenario: 分隔 Mac 快捷键符号
- **WHEN** 快捷键热键包含连续的 Mac 符号（如 ⌘⇧N）
- **THEN** 系统应使用正则表达式将符号分割为单个按键元素进行显示
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx:78-80`

---

## 附录 D: 设置组件索引

| 组件名称 | 文件路径 | 用途说明 |
|---------|---------|---------|
| SettingsCard | components/settings/SettingsCard.tsx | 容器卡片，支持内部分隔 |
| SettingsInput | components/settings/SettingsInput.tsx | 文本输入，支持密码类型 |
| SettingsInputRow | components/settings/SettingsInput.tsx | 内联文本输入 |
| SettingsSecretInput | components/settings/SettingsInput.tsx | 密钥输入，支持显示/隐藏 |
| SettingsCard | components/settings/SettingsCard.tsx | 容器卡片，支持分隔 |
| SettingsCard | components/settings/SettingsCard.tsx | 卡片容器，支持分组和分隔 |
| SettingsCardContent | components/settings/SettingsCard.tsx | 卡片内容包装器 |
| SettingsCardFooter | components/settings/SettingsCard.tsx | 卡片操作页脚 |
| SettingsRow | components/settings/SettingsRow.tsx | 通用设置行 |
| SettingsRowLabel | components/settings/SettingsRow.tsx | 独立行标签 |
| SearchableModelInput | components/settings/SearchableModelInput.tsx | 可搜索模型选择器 |
| SettingsSection | components/settings/SettingsSection.tsx | 设置区域容器 |
| SettingsGroup | components/settings/SettingsSection.tsx | 顶级分组容器 |
| SettingsDivider | components/settings/SettingsSection.tsx | 水平分隔线 |
| SettingsSegmentedControl | components/settings/SettingsSegmentedControl.tsx | 水平按钮组 |
| SettingsSegmentedControlCard | components/settings/SettingsSegmentedControl.tsx | 卡片风格按钮组 |
| SettingsSelect | components/settings/SettingsSelect.tsx | 下拉选择器 |
| SettingsSelectRow | components/settings/SettingsSelect.tsx | 内联下拉选择器 |
| SettingsMenuSelectRow | components/settings/SettingsMenuSelectRow.tsx | 带描述的下拉选择器 |
| SettingsTextarea | components/settings/SettingsTextarea.tsx | 多行文本输入 |
| SettingsToggle | components/settings/SettingsToggle.tsx | 开关切换 |
| EditButton | components/ui/EditPopover.tsx | 编辑按钮 |
| EditPopover | components/ui/EditPopover.tsx | AI 辅助编辑弹窗 |
| RenameDialog | components/ui/rename-dialog.tsx | 重命名对话框 |

---

## 文档元数据

- 创建日期: 2026-03-03
- 最后更新: 2026-03-03
- 文档格式: OpenSpec (EARS 语法)
- 规范语法: WHEN/THEN
- 分析范围: `apps/electron/src/renderer/pages/settings/` 和 `apps/electron/src/renderer/components/settings/`
- 作者: Code Analyzer Agent
