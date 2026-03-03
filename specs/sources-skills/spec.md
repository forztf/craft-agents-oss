# Sources & Skills Specification

## Purpose
Sources 和 Skills 模块为 Craft Agents 应用提供外部数据连接和自定义技能管理功能。Sources 允许用户连接 MCP 服务器、REST API 和本地文件系统，Skills 则提供可复用的智能体指令和技能。

## Requirements

### Requirement: Sources 列表展示
系统 SHALL 在侧边栏显示工作区的所有 Sources。

#### Scenario: 显示正常的 Sources 列表
- **WHEN** 用户在侧边栏查看 Sources 列表
- **THEN** 系统 SHALL 显示每个 Source 的名称、类型徽章（MCP/API/Local）、连接状态徽章和简介（tagline 或 provider）
- **THEN** 系统 SHALL 显示 Source 的图标（emoji 或 URL 下载的图标）
- **THEN** 系统 SHALL 在第一项显示教程标记（data-tutorial 属性）用于新手引导

> 来源: src/components/app-shell/SourcesListPanel.tsx

### Requirement: Source 类型徽章样式
系统 SHALL 为不同类型的 Source 使用不同的徽章颜色。

#### Scenario: MCP Source 类型徽章
- **WHEN** Source 类型为 'mcp'
- **THEN** 系统 SHALL 使用 accent/10 背景色和 accent 前景色

#### Scenario: API Source 类型徽章
- **WHEN** Source 类型为 'api'
- **THEN** 系统 SHALL 使用 success/10 背景色和 success 前景色

#### Scenario: Local Source 类型徽章
- **WHEN** Source 类型为 'local'
- **THEN** 系统 SHALL 使用 info/10 背景色和 info 前景色

> 来源: src/components/app-shell/SourcesListPanel.tsx

### Requirement: Source 连接状态显示
系统 SHALL 显示每个 Source 的连接状态。

#### Scenario: 显示连接成功的 Source
- **WHEN** Source 已连接
- **THEN** 系统 SHALL 不显示状态徽章

#### Scenario: 显示需要认证的 Source
- **WHEN** Source 需要认证但未认证
- **THEN** 系统 SHALL 显示黄色/红色 "Auth Required" 徽章

#### Scenario: 显示连接失败的 Source
- **WHEN** Source 连接失败
- **THEN** 系统 SHALL 显示红色 "Disconnected" 徽章

#### Scenario: 显示未测试的 Source
- **WHEN** Source 尚未测试连接
- **THEN** 系统 SHALL 显示灰色 "Not Tested" 徽章

#### Scenario: 显示禁用的本地 MCP Source
- **WHEN** 本地 MCP 服务器在设置中被禁用且 Source 类型为 stdio
- **THEN** 系统 SHALL 显示灰色 "Disabled" 徽章

> 来源: src/components/app-shell/SourcesListPanel.tsx, src/components/ui/source-status-indicator.tsx

### Requirement: Source 连接错误详情提示
系统 SHALL 在 Source 连接失败时提供错误详情。

#### Scenario: 在列表中显示连接错误 tooltip
- **WHEN** 连接状态为 failed 且有 connectionError 信息
- **THEN** 系统 SHALL 在状态徽章的 tooltip 中显示错误详情
- **THEN** 系统 SHALL 使用 Tooltip 组件在鼠标悬停时显示错误消息

> 来源: src/components/app-shell/SourcesListPanel.tsx

### Requirement: Sources 空状态
当工作区没有配置 Sources 时，系统 SHALL 显示空状态界面。

#### Scenario: 显示 Sources 空状态
- **WHEN** 工作区没有任何 Sources 配置
- **THEN** 系统 SHALL 显示空图标（DatabaseZap）和说明文本
- **THEN** 系统 SHALL 显示描述文本 "Sources connect your agent to external data — MCP servers, REST APIs, and local folders."
- **THEN** 系统 SHALL 提供 "Learn more" 链接跳转到相关文档文档
- **THEN** 系统 SHALL 提供 "Add Source" 按钮通过 EditPopover 添加新 Source

> 来源: src/components/app-shell/SourcesListPanel.tsx

### Requirement: Source 类型过滤显示
系统 SHALL 支持按 Source 类型（MCP/API/Local）过滤显示。

#### Scenario: 过滤显示特定类型的 Source
- **WHEN** 用户激活类型过滤器（如 "MCP" 或 "API"）
- **THEN** 系统 SHALL 仅显示匹配类型的 Sources
- **THEN** 空状态消息 SHALL 显示 "No {{type}} sources configured." 其中 type 为 "MCP"/"API"/"local folder"
- **THEN** "Add Source" 按钮 SHALL 针对类型进行配置（如 add-source-mcp）

> 来源: src/components/app-shell/SourcesListPanel.tsx

### Requirement: Source 上下文菜单
系统 SHALL 为每个 Source 提供上下文菜单和三点菜单。

#### Scenario: 显示 Source 操作菜单
- **WHEN** 用户右键点击或点击 Source 的三点菜单
- **THEN** 系统 SHALL 显示下拉菜单，包含以下操作：
  - Open in New Window - 在新窗口打开 Source 详情页
  - Show in Finder - 在 Finder 中显示 Source 文件夹
  - Delete Source - 删除该 Source（危险操作，红色样式）

> 来源: src/components/app-shell/SourceMenu.tsx, src/components/app-shell/SourcesListPanel.tsx

### Requirement: Source 详情页展示
系统 SHALL 提供查看 Source 详情的页面。

#### Scenario: 显示 Source 完整信息
- **WHEN** 用户点击 Source 列表项
- **THEN** 系统 SHALL 显示 Source 详情页，包含：
  - Hero 区域：Source 图标、名称和标语（tagline）
  - Connection 区域：Source 类型、连接 URL（可点击）、最后测试时间、连接错误（如果有）
  - Permissions 区域（API/Local）：权限规则表格
  - Tools 区域（MCP）：工具列表和权限状态
  - Documentation 区域：guide.md Markdown 内容

> 来源: src/pages/SourceInfoPage.tsx

### Requirement: Source 详情页警告提示
系统 SHALL 在 Source 需要用户注意时显示警告。

#### Scenario: 显示本地 MCP 禁用警告
- **WHEN** Source 的 mcp.transport 为 'stdio' 且 localMcpEnabled 为 false
- **THEN** 系统 SHALL 显示警告提示框（warning variant）
- **THEN** 系统 SHALL 显示警告标题 "Source Disabled"
- **THEN** 系统 SHALL 显示说明内容 "Local MCP servers are disabled in Settings > Advanced. Enable them to use this source."

> 来源: src/pages/SourceInfoPage.tsx

### Requirement: Source 详情页编辑功能
系统 SHALL 支持通过 EditPopover 编辑 Source 配置文件。

#### Scenario: 编辑 Source 配置
- **WHEN** 用户在 Info 页面点击 "Edit" 按钮
- **THEN** 系统 SHALL 打开 EditPopover，支持 AI 辅助编辑
- **THEN** 系统 SHALL 提供 "Edit File" 次要操作，可直接编辑文件

> 来源: src/pages/SourceInfoPage.tsx

### Requirement: Source 详情页权限展示
系统 SHALL 在 Source 详情页展示权限配置。

#### Scenario: 显示 API/Local Source 权限
- **WHEN** 查看类型为 api 或 local 的 Source
- **THEN** 系统 SHALL 显示 Permissions 区域，描述为 "API endpoints allowed in Explore mode"
- **THEN** 系统 SHALL 使用 PermissionsDataTable 展示权限规则

#### Scenario: 显示 MCP Source 权限
- **WHEN** 查看类型为 mcp 的 Source
- **THEN** 系统 SHALL 显示 Permissions 区域，描述为 "Tool patterns allowed in Explore mode"
- **THEN** 系统 SHALL 使用 PermissionsDataTable 展示权限规则（隐藏 Type 列）

> 来源: src/pages/SourceInfoPage.tsx

### Requirement: Source 详情页工具列表
系统 SHALL 在 MCP Source 详情页展示工具列表。

#### Scenario: 显示 MCP Tools 列表
- **WHEN** 查看类型为 mcp 的 Source
- **THEN** 系统 SHALL 显示 Tools 区域，描述为 "Operations exposed by this server."
- **THEN** 系统 SHALL 使用 ToolsDataTable 展示工具名称、描述和权限状态

> 来源: src/pages/SourceInfoPage.tsx

### Requirement: Skills 列表展示
系统 SHALL 在侧边栏显示工作区的所有 Skills。

#### Scenario: 显示正常的 Skills 列表
- **WHEN** 用户在侧边栏查看 Skills 列表
- **THEN** 系统 SHALL 显示每个 Skill 的名称和描述
- **THEN** 系统 SHALL 显示 Skill 的图标（emoji 或 URL 下载的图标，默认为 Zap 闪电图标）
- **THEN** 系统 SHALL 显示 Skill 的完整描述（截断换行）

> 来源: src/components/app-shell/SkillsListPanel.tsx

### Requirement: Skills 空状态
当工作区没有配置 Skills 时，系统 SHALL 显示空状态界面。

#### Scenario: 显示 Skills 空状态
- **WHEN** 工作区没有任何 Skills 配置
- **THEN** 系统 SHALL 显示空图标（Zap）和说明文本
- **THEN** 系统 SHALL 显示描述文本 "Skills are reusable instructions that teach your agent specialized behaviors."
- **THEN** 系统 SHALL 提供 "Learn more" 链接跳转到相关文档
- **THEN** 系统 SHALL 提供 "Add Skill" 按钮通过 EditPopover 添加新 Skill

> 来源: src/components/app-shell/SkillsListPanel.tsx

### Requirement: Skill 上下文菜单
系统 SHALL 为每个 Skill 提供上下文菜单和三点菜单。

#### Scenario: 显示 Skill 操作菜单
- **WHEN** 用户右键点击或点击 Skill 的三点菜单
- **THEN** 系统 SHALL 显示下拉菜单，包含以下操作：
  - Open in New Window - 在新窗口打开 Skill 详情页
  - Show in Finder - 在 Finder 中显示 Skill 文件夹（选中 SKILL.md）
  - Delete Skill - 删除该 Skill（危险操作，红色样式）

> 来源: src/components/app-shell/SkillMenu.tsx, src/components/app-shell/SkillsListPanel.tsx

### Requirement: Skill 详情页展示
系统 SHALL 提供查看 Skill 详情的页面。

#### Scenario: 显示 Skill 完整信息
- **WHEN** 用户点击 Skill 列表项
- **THEN** 系统 SHALL 显示 Skill 详情页，包含：
  - Hero 区域：Skill 图标、名称和描述
  - Metadata 区域：Slug、Name、Description、Location（可点击在 Finder 中打开）
  - Permission Modes 区域（如果有 alwaysAllow 配置）：展示与 Explore/Ask/Auto 模式交互的表格
  - Instructions 区域：SKILL.md 内容（Markdown 渲染）

> 来源: src/pages/SkillInfoPage.tsx

### Requirement: Permission Modes 表格说明
系统 SHALL 在 Skill 详情页显示 alwaysAllow 配置与权限模式的关系。

#### Scenario: 显示 Permission Modes 表格
- **WHEN** Skill 配置了 alwaysAllow 字段且非空
- **THEN** 系统 SHALL 显示一个表格，说明在各种权限模式下 "Always Allowed Tools" 的行为：
  - Explore：Blocked — write tools blocked regardless（带 X 图标）
  - Ask to Edit：Auto-approved — no prompts for allowed tools（带 Check 图标）
  - Auto：No effect — all tools already auto-approved（带 Minus 图标）

> 来源: src/pages/SkillInfoPage.tsx

### Requirement: Skill 详情页编辑功能
系统 SHALL 支持通过 EditPopover 编辑 Skill 配置文件。

#### Scenario: 编辑 Skill Metadata
- **WHEN** 用户在 Skill 详情页 Metadata 区域点击 "Edit" 按钮
- **THEN** 系统 SHALL 打开 EditPopover 用于 AI 辅助编辑（编辑 name、description 等元数据）
- **THEN** 系统 SHALL 提供 "Edit File" 次要操作，可直接编辑 SKILL.md 文件

#### Scenario: 编辑 Skill Instructions
- **WHEN** 用户在 Skill 详情页 Instructions 区域点击 "Edit" 按钮
- **THEN** 系统 SHALL 打开 EditPopover 用于 AI 辅助编辑指令内容
- **THEN** 系统 SHALL 提供 "Edit File" 次要操作，可直接编辑 SKILL.md 文件

> 来源: src/pages/SkillInfoPage.tsx

### Requirement: Source/Skill 图标支持
系统 SHALL 支持 Source 和 Skill 的图标配置。

#### Scenario: 使用 emoji 图标
- **WHEN** 配置文件中的 icon 字段为 emoji
- **THEN** 系统 SHALL 直接渲染 emoji 作为图标

#### Scenario: 使用 URL 图标
- **WHEN** 配置文件中的 icon 字段为 URL
- **THEN** 系统 SHALL 下载图标到本地文件（icon.svg, icon.png 等）
- **THEN** 系统 SHALL 缓存下载的图标以避免重复下载

#### Scenario: 使用本地图标文件
- **WHEN** icon 字段未配置但目录中有 icon.svg 等文件
- **THEN** 系统 SHALL 自动使用本地图标文件

#### Scenario: Source 无图标配置
- **WHEN** 没有配置 Source 图标且没有本地文件
- **THEN** 系统 SHALL 使用类型对应的默认图标（MCP/Mcplcon、API/Globe、Local/HardDrive）

#### Scenario: Skill 无图标配置
- **WHEN** 没有配置 Skill 图标且没有本地文件
- **THEN** 系统 SHALL 使用 Zap（闪电）图标作为默认

> 来源: src/components/ui/source-avatar.tsx, src/components/ui/skill-avatar.tsx, packages/shared/src/sources/storage.ts

### Requirement: Source 在新窗口打开
系统 SHALL 支持在新窗口中打开 Source 详情页。

#### Scenario: 使用深链接打开新窗口
- **WHEN** 用户选择 "Open in New Window" 操作
- **THEN** 系统 SHALL 使用 craftagents://sources/source/{slug}?window=focused URL 打开新窗口
- **THEN** 系统 SHALL 将 currentSource 设置为指定的 sourceSlug

> 来源: src/components/app-shell/SourceMenu.tsx, src/components/app-shell/SourcesListPanel.tsx

### Requirement: Skill 在新窗口打开
系统 SHALL 支持在新窗口中打开 Skill 详情页。

#### Scenario: 使用深链接打开新窗口
- **WHEN** 用户选择 "Open in New Window" 操作
- **THEN** 系统 SHALL 使用 craftagents://skills/skill/{slug}?window=focused URL 打开新窗口

> 来源: src/components/app-shell/SkillMenu.tsx, src/components/app-shell/SkillsListPanel.tsx

### Requirement: Source 在 Finder 中显示
系统 SHALL 支持在系统文件管理器中显示 Source 文件夹。

#### Scenario: 打开 Source 文件夹
- **WHEN** 用户选择 "Show in Finder" 操作
- **THEN** 系统 SHALL 调用 window.electronAPI.showInFolder(source.folderPath) 打开文件夹

> 来源: src/components/app-shell/SourceMenu.tsx, src/components/app-shell/SourcesListPanel.tsx

### Requirement: Skill 在 Finder 中显示
系统 SHALL 支持在系统文件管理器中显示 Skill 文件夹。

#### Scenario: 打开 Skill 文件夹
- **WHEN** 用户选择 "Show in Finder" 操作
- **THEN** 系统 SHALL 调用 window.electronAPI.openSkillInFinder(workspaceId, skillSlug) 打开文件夹

> 来源: src/components/app-shell/SkillMenu.tsx, src/components/app-shell/SkillsListPanel.tsx

## ADDED Requirements

### Requirement: Source OAuth 身份验证流程
系统 SHALL 支持为 Source 触发 OAuth 身份验证流程。

#### Scenario: MCP Source OAuth 触发
- **WHEN** 用户调用 source_oauth_trigger 工具
- **WHEN** Source 类型为 'mcp' 且 authType 为 'oauth'
- **THEN** 系统 SHALL 构建 OAuth 2.0 + PKCE 请求
- **THEN** 系统 SHALL 调用 onAuthRequest 回调触发浏览器打开认证页面
- **THEN** 系统 SHALL 返回认证请求状态消息

> 来源: packages/session-tools-core/src/handlers/source-oauth.ts

### Requirement: Google API Source OAuth 流程
系统 SHALL 支持 Google API (Gmail, Calendar, Drive, etc.) 的 OAuth 身份验证。

#### Scenario: Google OAuth 触发
- **WHEN** 用户调用 source_google_oauth_trigger 工具
- **WHEN** Source provider 为 'google'
- **THEN** 系统 SHALL 确定 Google 服务类型（googleService 或从 URL 推断）
- **THEN** 系统 SHALL 验证 Google OAuth 凭证配置
- **THEN** 系统 SHALL 使用正确的服务范围触发 Google OAuth
- **THEN** 系统 SHALL 保存访问令牌和刷新令牌

#### Scenario: 从 URL 推断 Google 服务
- **WHEN** API baseUrl 为 googleapis.com 域名
- **THEN** 系统 SHALL 根据路径推断服务（gmail, calendar, drive, docs, sheets）
- **WHEN** URL 为 gmail.googleapis.com
- **THEN** 系统 SHALL 自动识别为 gmail 服务

> 来源: packages/shared/src/sources/types.ts, packages/session-tools-core/src/handlers/source-oauth.ts

### Requirement: Slack API Source OAuth 流程
系统 SHALL 支持 Slack API 的 OAuth 身份验证。

#### Scenario: Slack OAuth 触发
- **WHEN** 用户调用 source_slack_oauth_trigger 工具
- **WHEN** Source provider 为 'slack' 且 type 为 'api'
- **THEN** 系统 SHALL 确定 Slack 服务类型（slackService）
- **THEN** 系统 SHALL 使用用户范围（user scope）触发 OAuth
- **THEN** 系统 SHALL 返回团队名称作为认证标识

> 来源: packages/shared/src/sources/types.ts, packages/session-tools-core/src/handlers/source-oauth.ts

### Requirement: Microsoft API Source OAuth 流程
系统 SHALL 支持 Microsoft Graph API (Outlook, OneDrive, Teams, etc.) 的 OAuth 身份验证。

#### Scenario: Microsoft OAuth 触发
- **WHEN** 用户调用 source_microsoft_oauth_trigger 工具
- **WHEN** Source provider 为 'microsoft'
- **THEN** 系统 SHALL 确定 Microsoft 服务类型
- **THEN** 系统 SHALL 根据 Graph API 路径或显式配置选择服务
- **THEN** 系统 SHALL 返回用户邮箱作为认证标识

#### Scenario: Microsoft 服务推断
- **WHEN** API baseUrl 为 graph.microsoft.com
- **THEN** 系统 SHALL 根据路径推断服务（outlook, teams, onedrive, sharepoint）
- **WHEN** 路径包含 /me/messages
- **THEN** 系统 SHALL 自动识别为 outlook 服务

> 来源: packages/shared/src/sources/types.ts, packages/session-tools-core/src/handlers/source-oauth.ts

### Requirement: Source 测试验证
系统 SHALL 提供完整的 Source 配置验证和连接测试功能。

#### Scenario: Schema 验证
- **WHEN** 运行 source_test 工具
- **THEN** 系统 SHALL 验证 config.json 包含必需字段（slug, name, type）
- **THEN** 系统 SHALL 使用验证器检查配置有效性
- **THEN** 系统 SHALL 返回验证结果和错误信息

#### Scenario: 图标处理
- **WHEN** 检查 Source 图标状态
- **THEN** 系统 SHALL 检测本地图标文件（icon.png, icon.svg, icon.jpg）
- **THEN** 系统 SHALL 下载 URL 图标并缓存
- **THEN** 系统 SHALL 识别并验证 emoji 图标
- **THEN** 系统 SHALL 尝试从服务 URL 自动获取图标

#### Scenario: 连接测试
- **WHEN** 测试 API Source 连接
- **THEN** 系统 SHALL 使用 testEndpoint 或 baseUrl 发送请求
- **THEN** 系统 SHALL 支持 HEAD 和 GET 方法
- **THEN** 系统 SHALL 正确处理 401/403 状态码（需要认证）
- **WHEN** 测试 MCP Source 连接
- **THEN** 系统 SHALL 验证 HTTP/SSE 端点可达性
- **THEN** 系统 SHALL 验证 stdio 命令可执行且启动成功
- **THEN** 系统 SHALL 报告可用工具数量和服务器版本

> 来源: packages/session-tools-core/src/handlers/source-test.ts

### Requirement: Source 认证状态检查
系统 SHALL 在测试时验证 Source 的认证状态。

#### Scenario: 验证已认证 Source
- **WHEN** Source 标记为已认证
- **THEN** 系统 SHALL 通过 CredentialManager 验证令牌有效性
- **THEN** 系统 SHALL 报告令牌是否完整且未过期

#### Scenario: 识别认证需求
- **WHEN** Source 未认证且需要认证
- **THEN** 系统 SHALL 根据 provider 和 authType 识别特定的 OAuth 工具
- **WHEN** Source 使用 Google
- **THEN** 系统 SHALL 提示使用 source_google_oauth_trigger

> 来源: packages/session-tools-core/src/handlers/source-test.ts

### Requirement: Source 凭证管理
系统 SHALL 提供 Source 凭证的完整 CRUD 和刷新管理。

#### Scenario: 存储凭证
- **WHEN** 保存 Source 凭证
- **THEN** 系统 SHALL 根据 Source 类型确定凭证 ID（source_oauth, source_bearer, source_basic, source_apikey）
- **THEN** 系统 SHALL 使用 CredentialManager 加密存储

#### Scenario: 检索凭证
- **WHEN** 加载 Source 凭证
- **THEN** 系统 SHALL 支持 MCP 的 OAuth 和 bearer 回退
- **THEN** 系统 SHALL 正确解析基本认证凭证（username/password JSON）
- **THEN** 系统 SHALL 解析多头认证凭证（headerNames 映射）

#### Scenario: 令牌过期检查
- **WHEN** 检查凭证有效期
- **THEN** 系统 SHALL 验证 expiresAt 时间戳
- **THEN** 系统 SHALL 标记需要刷新的凭证（过期前 5 分钟）

#### Scenario: OAuth 令牌刷新
- **WHEN** 刷新过期令牌
- **THEN** 系统 SHALL 使用正确的提供者刷新逻辑（Google, Slack, Microsoft, MCP）
- **THEN** 系统 SHALL 使用承诺去重防并发刷新
- **THEN** 系统 SHALL 保存新令牌和刷新令牌
- **THEN** 系统 SHALL 在刷新失败时标记 Source 需要重新认证

> 来源: packages/shared/src/sources/credential-manager.ts

### Requirement: Source 服务器构建
系统 SHALL 从 Source 配置构建 MCP 和 API 服务器配置。

#### Scenario: 构建 MCP 服务器配置
- **WHEN** 构建 MCP Source
- **THEN** 系统 SHALL 根据 transport 类型构建配置（http, sse, stdio）
- **WHEN** transport 为 stdio
- **THEN** 系统 SHALL 返回命令、参数和环境变量配置
- **WHEN** transport 为 http/sse
- **THEN** 系统 SHALL 标准化 MCP URL（添加 /mcp 后缀）
- **THEN** 系统 SHALL 为已认证 Source 添加 Authorization header

#### Scenario: 构建 API 服务器配置
- **WHEN** 构建 API Source
- **THEN** 系统 SHALL 根据 authType 构建认证配置（bearer, header, query, basic, none）
- **WHEN** provider 为 Google/Slack
- **THEN** 系统 SHALL 支持令牌获取器函数以实现自动刷新
- **THEN** 系统 SHALL 映射 defaultHeaders 到服务器配置

#### Scenario: 批量构建服务器
- **WHEN** 为多个 Source 构建服务器
- **THEN** 系统 SHALL 过滤不可用的 Source（isSourceUsable）
- **THEN** 系统 SHALL 返回服务器配置集合和错误列表
- **THEN** 系统 SHALL 为每个 OAuth Source 提供令牌获取器

> 来源: packages/shared/src/sources/server-builder.ts

### Requirement: Source Guide 内容解析
系统 SHALL 解析 guide.md 文件中的结构化内容。

#### Scenario: 解析 Guide 部分
- **WHEN** 加载 guide.md
- **THEN** 系统 SHALL 提取以下部分：Scope, Guidelines, Context, API Notes, Cache
- **WHEN** 发现 Cache 部分
- **THEN** 系统 SHALL 解析 JSON 代码块并提取缓存数据

#### Scenario: 提取 Tagline
- **WHEN** 来源没有配置 tagline
- **THEN** 系统 SHALL 尝试从指南内容中提取
- **THEN** 系统 SHALL 查找标题后的第一个段落
- **THEN** 系统 SHALL 回退到 Scope 部分的第一行

> 来源: packages/shared/src/sources/storage.ts

### Requirement: Source 创建和删除
系统 SHALL 支持创建和删除 Source 配置。

#### Scenario: 创建新 Source
- **WHEN** 创建 Source
- **THEN** 系统 SHALL 生成唯一的 URL 安全 slug
- **THEN** 系统 SHALL 验证 Source 配置
- **THEN** 系统 SHALL 处理图标（emoji 或 URL 下载）
- **THEN** 系统 SHALL 在图标未配置时尝试自动获取
- **THEN** 系统 SHALL 创建包含默认模板的 guide.md

#### Scenario: 生成 Source Slug
- **WHEN** 从名称生成 slug
- **THEN** 系统 SHALL 转换为小写并用连字符替换非字母数字
- **THEN** 系统 SHALL 如存在冲突则追加数字后缀
- **THEN** 系统 SHALL 限制最大长度为 50 个字符

#### Scenario: 删除 Source
- **WHEN** 删除 Source
- **THEN** 系统 SHALL 递归删除 Source 文件夹及其所有内容

> 来源: packages/shared/src/sources/storage.ts

### Requirement: Source 配置验证和管理
系统 SHALL 验证和管理 Source 配置文件。

#### Scenario: 验证配置
- **WHEN** 保存 Source 配置
- **THEN** 系统 SHALL 使用验证器检查所有必需字段
- **THEN** 系统 SHALL 在验证失败时抛出错误

#### Scenario: 标记已认证
- **WHEN** Source 认证成功
- **THEN** 系统 SHALL 设置 isAuthenticated 为 true
- **THEN** 系统 SHALL 设置 connectionStatus 为 'connected'
- **THEN** 系统 SHALL 清除 connectionError

#### Scenario: 可用性检查
- **WHEN** 检查 Source 是否可用
- **THEN** 系统 SHALL 验证 Source 已启用
- **THEN** 系统 SHALL 检查认证状态（authType: 'none' 跳过认证检查）
- **THEN** 系统 SHALL 为需要认证的 Source 验证 isAuthenticated

> 来源: packages/shared/src/sources/storage.ts

### Requirement: Skill 元数据解析
系统 SHALL 解析 SKILL.md 文件中的 YAML frontmatter。

#### Scenario: 解析 Skill 前置字段
- **WHEN** 加载 SKILL.md
- **THEN** 系统 SHALL 使用 gray-matter 解析 frontmatter 和正文
- **THEN** 系统 SHALL 验证必需字段（name, description）
- **THEN** 系统 SHALL 验证和提取可选图标字段（仅 emoji 或 URL）
- **THEN** 系统 SHALL 提取 globs 和 alwaysAllow 字段

> 来源: packages/shared/src/skills/storage.ts

### Requirement: Skill 文件操作
系统 SHALL 提供工作区中 Skill 的 CRUD 操作。

#### Scenario: 加载单个 Skill
- **WHEN** 通过 slug 加载 Skill
- **THEN** 系统 SHALL 验证 Skills 目录存在
- **THEN** 系统 SHALL 读取并解析 SKILL.md
- **THEN** 系统 SHALL 返回包含元数据、内容和图标路径的 LoadedSkill

#### Scenario: 加载工作区所有 Skills
- **WHEN** 加载工作区 Skills
- **THEN** 系统 SHALL 遍历 skills 目录
- **THEN** 系统 SHALL 加载每个包含 SKILL.md 的目录
- **THEN** 系统 SHALL 返回 LoadedSkill 列表

#### Scenario: 删除 Skill
- **WHEN** 删除 Skill
- **THEN** 系统 SHALL 递归删除 Skill 目录

#### Scenario: 获取技能图标
- **WHEN** 获取 Skill 图标
- **THEN** 系统 SHALL 查找本地图标文件
- **THEN** 系统 SHALL 根据元数据下载 URL 图标
- **THEN** 系统 SHALL 验证图标下载需求

> 来源: packages/shared/src/skills/storage.ts

### Requirement: Source 类型推断
系统 SHALL 从 API URL 推断服务类型。

#### Scenario: 推断 Google 服务
- **WHEN** baseUrl 为 googleapis.com
- **THEN** 系统 SHALL 根据主机名推断服务类型
- **WHEN** 主机名为 gmail.googleapis.com
- **THEN** 系统 SHALL 返回 'gmail'
- **WHEN** 主机名为 calendar.googleapis.com
- **THEN** 系统 SHALL 返回 'calendar'

#### Scenario: 推断 Slack 服务
- **WHEN** baseUrl 匹配 slack.com 或 api.slack.com
- **THEN** 系统 SHALL 返回 'full' 作为默认服务

#### Scenario: 推断 Microsoft 服务
- **WHEN** baseUrl 为 graph.microsoft.com
- **THEN** 系统 SHALL 根据路径推断服务
- **WHEN** 路径包含 /me/messages
- **THEN** 系统 SHALL 返回 'outlook'
- **WHEN** 路径包含 /me/calendar
- **THEN** 系统 SHALL 返回 'microsoft-calendar'

> 来源: packages/shared/src/sources/types.ts


---

### Requirement: SourceStatusIndicator 连接状态指示器

系统 SHALL 提供 Source 连接状态的可视化指示器，包括脉冲动画和错误详情提示。

#### Scenario: 状态类型配置
- **WHEN** 渲染连接状态指示器时
- **THEN** 系统应支持五种状态：connected（绿色）、needs_auth（黄色）、failed（红色）、untested（灰色）、local_disabled（灰色）
> 来源: apps/electron/src/renderer/components/ui/source-status-indicator.tsx:43-79

#### Scenario: 连接状态脉冲动画
- **WHEN** 连接状态为 connected 时
- **THEN** 系统应显示带脉冲动画的绿色圆点（2秒动画周期）
> 来源: apps/electron/src/renderer/components/ui/source-status-indicator.tsx:106-115

#### Scenario: 错误详情显示
- **WHEN** 连接状态为 failed 且有 errorMessage 时
- **THEN** 系统应在 tooltip 中显示连接描述加上错误消息详情
> 来源: apps/electron/src/renderer/components/ui/source-status-indicator.tsx:92-94

#### Scenario: 状态尺寸变体
- **WHEN** 渲染不同尺寸的状态指示器时
- **THEN** 系统应支持三种尺寸：xs（1.5x1.5px）、sm（2x2px）、md（2.5x2.5px）
> 来源: apps/electron/src/renderer/components/ui/source-status-indicator.tsx:82-86

---

### Requirement: 连接状态自动推导

系统 SHALL 根据源配置自动推导连接状态。

#### Scenario: 本地 MCP 禁用检测
- **WHEN** 源的 mcp.transport 为 'stdio' 且 localMcpEnabled 为 false 时
- **THEN** 系统应返回 'local_disabled' 状态
> 来源: apps/electron/src/renderer/components/ui/source-status-indicator.tsx:153-156

#### Scenario: 明确状态优先
- **WHEN** 源配置中设置了 connectionStatus 字段时
- **THEN** 系统应优先使用明确设置的状态值
> 来源: apps/electron/src/renderer/components/ui/source-status-indicator.tsx:159-161

#### Scenario: 认证状态推导
- **WHEN** 源需要认证（mcp.authType 或 api.authType 不为 'none'）但未通过认证时
- **THEN** 系统应返回 'needs_auth' 状态
> 来源: apps/electron/src/renderer/components/ui/source-status-indicator.tsx:165-170

#### Scenario: 本地源默认连接
- **WHEN** 源类型为 'local' 时
- **THEN** 系统应默认返回 'connected' 状态
> 来源: apps/electron/src/renderer/components/ui/source-status-indicator.tsx:177-179


---

### Requirement: SourceAvatar 源头像组件

系统 SHALL 提供功能完整的源头像组件，支持多种图标回退策略。

#### Scenario: 按类型的默认图标
- **WHEN** 源没有配置图标且没有本地图标文件时
- **THEN** 系统应根据类型使用默认图标：McpIcon（mcp）、Globe（api）、Mail（gmail）、HardDrive（local）
> 来源: apps/electron/src/renderer/components/ui/source-avatar.tsx:44-57

#### Scenario: Favicon 回退策略
- **WHEN** 主图标解析为 fallback（无本地文件找到）时
- **THEN** 系统应尝试从服务 URL 解析 favicon 作为次级回退
> 来源: apps/electron/src/renderer/components/ui/source-avatar.tsx:86,154-155

#### Scenario: 服务 URL 提取
- **WHEN** 需要解析 favicon 时
- **THEN** 系统应从 MCP source 的 mcp.url 或 API source 的 api.baseUrl 提取服务 URL
> 来源: apps/electron/src/renderer/components/ui/source-avatar.tsx:103-105

#### Scenario: Logo URL 缓存
- **WHEN** 解析 favicon URL 时
- **THEN** 系统应使用 logoUrlCache 缓存结果，避免重复解析
> 来源: apps/electron/src/renderer/components/ui/source-avatar.tsx:115-119

#### Scenario: 连接状态指示器叠加
- **WHEN** showStatus 属性为 true 时
- **THEN** 系统应在头像右下角叠加连接状态指示器
> 来源: apps/electron/src/renderer/components/ui/source-avatar.tsx:176-192

---

### Requirement: SkillAvatar 技能头像组件

系统 SHALL 提供简化的技能头像组件，使用 Zap 闪电图标作为默认值。

#### Scenario: 技能头像默认图标
- **WHEN** 技能没有配置图标且没有本地图标文件时
- **THEN** 系统应使用 Zap（闪电）图标作为默认图标
> 来源: apps/electron/src/renderer/components/ui/skill-avatar.tsx:40

---

### Requirement: 权限数据表

系统 SHALL 提供可搜索、可排序、可全屏的权限规则数据表。

#### Scenario: 模式徽章复制功能
- **WHEN** 用户点击权限模式徽章时
- **THEN** 系统应将模式复制到剪贴板并显示成功提示 toast
> 来源: apps/electron/src/renderer/components/info/PermissionsDataTable.tsx:60-67

#### Scenario: 长模式 Tooltip
- **WHEN** 模式字符串长度≥30字符时
- **THEN** 系统应在鼠标悬停时显示完整模式的 tooltip
> 来源: apps/electron/src/renderer/components/info/PermissionsDataTable.tsx:79-86

#### Scenario: 可搜索模式
- **WHEN** searchable 属性为 true 时
- **THEN** 系统应显示搜索输入框并可过滤权限模式
> 来源: apps/electron/src/renderer/components/info/PermissionsDataTable.tsx:219

#### Scenario: 最大高度滚动
- **WHEN** 数据行数量超过指定最大高度时
- **THEN** 系统应显示滚动条，默认最大高度为 400px
> 来源: apps/electron/src/renderer/components/info/PermissionsDataTable.tsx:96,220

#### Scenario: 全屏视图
- **WHEN** fullscreen 属性为 true 时
- **THEN** 系统应在 hover 时显示全屏按钮，点击后打开全屏覆盖层
> 来源: apps/electron/src/renderer/components/info/PermissionsDataTable.tsx:198-212,226-242

#### Scenario: 类型列隐藏
- **WHEN** hideTypeColumn 属性为 true 时
- **THEN** 系统应隐藏 Type 列（用于只显示工具模式的 MCP sources）
> 来源: apps/electron/src/renderer/components/info/PermissionsDataTable.tsx:195

#### Scenario: 评论国际化
- **WHEN** 显示权限评论时
- **THEN** 系统应尝试使用 i18n 翻译评论值，如果翻译值不同于原文则使用翻译，否则使用原文
> 来源: apps/electron/src/renderer/components/info/PermissionsDataTable.tsx:147-149

---

### Requirement: ToolsDataTable 工具数据表

系统 SHALL 提供可搜索、可排序的工具列表数据表，支持加载和错误状态。

#### Scenario: 工具权限状态徽章
- **WHEN** 显示工具权限状态时
- **THEN** 系统应使用 Info_StatusBadge 组件显示 allowed 或 requires-permission 状态
> 来源: apps/electron/src/renderer/components/info/ToolsDataTable.tsx:47-50

#### Scenario: 加载状态显示
- **WHEN** loading 属性为 true 时
- **THEN** 系统应在数据表中显示加载指示器
> 来源: apps/electron/src/renderer/components/info/ToolsDataTable.tsx:83

#### Scenario: 错误状态显示
- **WHEN** error 属性有值时
- **THEN** 系统应在数据表中显示错误消息
> 来源: apps/electron/src/renderer/components/info/ToolsDataTable.tsx:84

#### Scenario: 工具名称徽章
- **WHEN** 显示工具名称时
- **THEN** 系统应使用 Info_Badge 组件显示工具名称
> 来源: apps/electron/src/renderer/components/info/ToolsDataTable.tsx:58-62

#### Scenario: 可排序列
- **WHEN** 表格包含排序列时
- **THEN** 系统应使用 SortableHeader 组件实现列排序功能
> 来源: apps/electron/src/renderer/components/info/ToolsDataTable.tsx:46,56


---

### Requirement: 统一图标缓存

系统 SHALL 提供统一的图标缓存机制，支持 source、skill、status 等所有实体类型。

#### Scenario: 统一缓存键格式
- **WHEN** 存储图标到缓存时
- **THEN** 系统应使用 `{type}:{workspaceId}:{identifier}` 格式的键
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:61

#### Scenario: Logo URL 缓存分离
- **WHEN** 缓存服务器的 logo URL 时
- **THEN** 系统应使用单独的 logoUrlCache，键格式为 `{serviceUrl}:{provider}`
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:66,68

#### Scenario: 缓存清除
- **WHEN** 调用 clearIconCaches 时
- **THEN** 系统应清除所有图标缓存（iconCache、logoUrlCache、colorableCache、rawSvgCache）
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:113-118

#### Scenario: 部分类型缓存清除
- **WHEN** 调用 clearSourceIconCaches 或 clearSkillIconCaches 时
- **THEN** 系统应仅清除对应类型的缓存条目
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:124-148

---

### Requirement: useEntityIcon 统一图标加载钩子

系统 SHALL 提供统一的图标加载钩子，处理所有实体类型的图标解析。

#### Scenario: 图标解析优先级
- **WHEN** 解析实体图标时
- **THEN** 系统应按以下优先级解析：iconValue 中的 emoji > iconValue 中的 URL > 本地文件（iconPath）> 自动发现（iconDir）> fallback
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:517-524

#### Scenario: Emoji 检测
- **WHEN** iconValue 是 emoji 字符串时
- **THEN** 系统应返回 { kind: 'emoji', value: emoji, colorable: false }
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:537-545

#### Scenario: 图标颜色性检测
- **WHEN** 加载 SVG 图标时
- **THEN** 系统应检测 SVG 内容是否包含 currentColor 以确定是否可着色
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:683

#### Scenario: 并行图标发现
- **WHEN** 自动发现图标文件时
- **THEN** 系统应并行探测所有扩展名（.svg、.png、.jpg、.jpeg）以减少 IPC 往返次数
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:734-738

#### Scenario: 图标扩展名优先级
- **WHEN** 多个扩展名的图标都存在时
- **THEN** 系统应按优先级返回：svg > png > jpg > jpeg
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:741-743

#### Scenario: SVG 内联渲染
- **WHEN** SVG 可着色（使用 currentColor）时
- **THEN** 系统应返回原始 SVG 用于内联渲染，以便 CSS 颜色类可以级联到 SVG 填充
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:687-690

#### Scenario: SVG 清理
- **WHEN** 准备 SVG 用于内联渲染时
- **THEN** 系统应移除 script 标签、事件处理器、JavaScript URL 和 width/height 属性
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:709-717

---

### Requirement: SVG 主题化

系统 SHALL 为 SVG 图标注入主题前景色以适配深色/浅色模式。

#### Scenario: 前景色获取
- **WHEN** 获取主题前景色时
- **THEN** 系统应从 CSS 自定义属性 --foreground 获取值，默认使用 '#e3e2e5'（深色主题默认）
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:376-389

#### Scenario: currentColor 替换
- **WHEN** 处理 SVG 内容时
- **THEN** 系统应将所有 'currentColor' 引用替换为实际的主题前景色
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:410-412

#### Scenario: SVG 根元素 fill 属性注入
- **WHEN** SVG 根元素没有 fill 属性时
- **THEN** 系统应添加 fill 属性为主题前景色
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:415-425

#### Scenario: SVG 主题化转 Data URL
- **WHEN** 将 SVG 转换为数据 URL 时
- **THEN** 系统应先注入主题前景色，然后使用 base64 编码
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:434-437

---

### Requirement: 图标缓存 Emoji 前缀

系统 SHALL 使用特殊前缀标记缓存的 emoji 图标。

#### Scenario: Emoji 图标标记
- **WHEN** 存储 emoji 图标到缓存时
- **THEN** 系统应使用 'emoji:' 前缀（如 'emoji:🔧'）
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:155

#### Scenario: Emoji 检测
- **WHEN** 检查图标值是否为 emoji 时
- **THEN** 系统应使用 isEmoji 工具函数进行检测
> 来源: apps/electron/src/renderer/lib/icon-cache.ts:185

---

**文档版本**: v1.1
**最后更新**: 2026-03-03
**规范**: OpenSpec v1.0
