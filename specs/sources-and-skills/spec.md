# Sources 与 Skills 模块需求规格

## ADDED Requirements

### Requirement: SC-SRC-001 - MCP 服务器连接
**WHEN** 系统配置一个 **MCP 类型 Source**，**THEN** 系统应支持以下传输方式：
- **HTTP 传输**: 通过 URL 连接远程 MCP 服务器
- **SSE 传输**: 通过 Server-Sent Events 连接远程 MCP 服务器
- **stdio 传输**: 通过本地命令启动子进程 MCP 服务器

#### Scenario: 创建不同传输类型的 MCP Source
- **WHEN** 用户创建一个 HTTP/SSE MCP Source
- **THEN** 系统支持指定 URL 和认证方式
- **WHEN** 用户创建一个 stdio MCP Source
- **THEN** 系统支持指定命令、参数和环境变量

> 来源: packages/shared/src/sources/types.ts, packages/shared/src/sources/server-builder.ts

---

### Requirement: SC-SRC-002 - MCP 认证
**WHEN** 系统配置一个 **MCP Source**，**THEN** 系统应支持以下认证类型：
- **OAuth**: 通过标准 OAuth 2.0 流程进行认证
- **Bearer**: 使用 Bearer Token 进行认证
- **None**: 无需认证（公共 MCP 服务器）

#### Scenario: 配置不同认证类型的 MCP Source
- **WHEN** MCP Source 配置 authType 为 'oauth'
- **THEN** 系统使用 OAuth 流程进行认证
- **WHEN** MCP Source 配置 authType 为 'bearer'
- **THEN** 系统使用 Bearer Token 进行认证
- **WHEN** MCP Source 配置 authType 为 'none'
- **THEN** 系统跳过认证步骤

> 来源: packages/shared/src/sources/types.ts, packages/shared/src/sources/credential-manager.ts

---

### Requirement: SC-SRC-003 - MCP 工具发现
**WHEN** MCP 服务器连接成功，**THEN** 系统应:
- 从服务器获取可用工具列表
- 显示每个工具的名称和描述
- 显示每个工具的权限状态（允许/需要权限）

#### Scenario: 连接到 MCP 服务器并发现工具
- **WHEN** MCP 服务器连接成功
- **THEN** 系统请求并解析工具列表
- **THEN** UI 显示该服务器提供的所有工具

> 来源: packages/shared/src/sources/server-builder.ts

---

### Requirement: SC-SRC-004 - REST API 集成
**WHEN** 系统配置一个 **API 类型 Source**，**THEN** 系统应支持：
- **baseURL**: API 基础 URL 配置
- **认证方式**: Bearer Token、Header、Query Parameter、Basic Auth
- **多 Header 认证**: 支持需要多个认证头的 API（如 Datadog）
- **默认请求头**: 配置每个请求都包含的默认头

#### Scenario: 创建不同认证类型的 API Source
- **WHEN** 用户使用 Bearer 认证创建 API Source
- **THEN** 系统支持指定 authScheme (默认 "Bearer")
- **WHEN** 用户使用 Header 认证创建 API Source
- **THEN** 系统支持指定 headerName (如 "X-API-Key")
- **WHEN** 用户使用多 Header 认证创建 API Source (如 Datadog)
- **THEN** 系统支持 headerNames 数组配置
- **WHEN** 用户配置 Basic Auth 认证
- **THEN** 系统自动构建 Authorization: Basic {base64(user:password)} 头

> 来源: packages/shared/src/sources/types.ts, packages/shared/src/sources/api-tools.ts

---

### Requirement: SC-SRC-005 - API OAuth 集成
**WHEN** 系统配置一个 **OAuth API Source**（Google、Slack、Microsoft），**THEN** 系统应：
- 支持标准 OAuth 2.0 认证流程
- 支持预定义的服务作用域（Gmail/Calendar/Drive、Slack Messaging、Outlook 等）
- 支持自定义作用域配置
- 自动处理访问令牌刷新

#### Scenario: 配置 Google OAuth API Source
- **WHEN** 用户配置 Google API Source
- **THEN** 系统支持从 baseUrl 推断服务类型
- **THEN** 系统支持 googleService 预定义配置
- **THEN** 系统支持自定义 googleScopes

#### Scenario: 配置 Slack OAuth API Source
- **WHEN** 用户配置 Slack API Source
- **THEN** 系统支持预定义的 slackService 配置
- **THEN** 系统支持自定义 slackUserScopes

#### Scenario: 配置 Microsoft OAuth API Source
- **WHEN** 用户配置 Microsoft API Source
- **THEN** 系统支持预定义的 microsoftService 配置 (Outlook/OneDrive/Teams 等)
- **THEN** 系统支持自定义 microsoftScopes

> 来源: packages/shared/src/sources/types.ts, packages/shared/src/sources/credential-manager.ts

---

### Requirement: SC-SRC-006 - 本地文件系统访问
**WHEN** 系统配置一个 **Local 类型 Source**，**THEN** 系统应：
- 支持指定本地文件系统路径
- 支持路径变量扩展（~ 等环境变量）
- 显示文件的便携路径格式

#### Scenario: 创建 Local Source
- **WHEN** 用户创建 Local Source
- **THEN** 系统支持指定本地路径
- **THEN** 系统自动展开 ~ 等环境变量
- **THEN** 存储时转换为便携路径格式

> 来源: packages/shared/src/sources/types.ts, packages/shared/src/sources/storage.ts

---

### Requirement: SC-SRC-007 - Source 连接状态
**WHEN** Source 连接状态发生变化，**THEN** 系统应显示以下状态之一：
- **Connected**: 已连接并正常工作
- **Needs Auth**: 需要认证
- **Failed**: 连接失败（显示错误信息）
- **Untested**: 未测试连接
- **Local Disabled**: 本地 MCP 服务器被禁用（设置 > 高级）

#### Scenario: Source 连接状态更新
- **WHEN** Source 成功连接并认证
- **THEN** 系统将状态更新为 'connected' 并设置 isAuthenticated=true
- **WHEN** Source 需要认证
- **THEN** 系统将状态更新为 'needs_auth'
- **WHEN** Source 连接失败
- **THEN** 系统将状态更新为 'failed' 并存储错误消息
- **WHEN** Local MCP Source 对应的本地功能被禁用
- **THEN** 系统将状态更新为 'local_disabled'

> 来源: packages/shared/src/sources/types.ts, packages/shared/src/sources/storage.ts

---

### Requirement: SC-SKL-001 - Skill 文件结构
**WHEN** 用户创建一个新的 **Skill**，**THEN** 系统应在工作区创建以下文件结构：
```
skills/{skillSlug}/
└── SKILL.md
```

#### Scenario: 创建 Skill 目录结构
- **WHEN** 用户创建一个名为 'commit' 的 Skill
- **THEN** 系统创建 skills/commit/SKILL.md 文件

> 来源: packages/shared/src/skills/storage.ts

---

### Requirement: SC-SKL-002 - Skill 元数据
**WHEN** 用户配置 **Skill 元数据**，**THEN** 系统 YAML Frontmatter 应支持：
- **name**: Skill 显示名称
- **description**: Skill 简短描述

#### Scenario: 解析 Skill 元数据
- **WHEN** 系统读取 SKILL.md 文件
- **THEN** 系统从 YAML frontmatter 提取 name 和 description
- **THEN** 系统提取可选的 icon (emoji 或 URL)

> 来源: packages/shared/src/skills/types.ts, packages/shared/src/skills/storage.ts

---

### Requirement: SC-SKL-003 - Slug 生成
**WHEN** 用户创建一个 **名称重复的 Skill**，**THEN** 系统应：
自动追加数字后缀确保唯一性（例如：`commit`, `commit-2`, `commit-3`）

> 来源: 此需求与 Source 的 slug 生成逻辑一致，参考 packages/shared/src/sources/storage.ts 的 generateSourceSlug

---

### Requirement: SC-SKL-004 - Always Allowed Tools
**WHEN** 用户配置 **Always Allowed Tools**，**THEN** 系统应在不同的权限模式下表现出以下行为：

| 权限模式 | 行为 |
|---------|------|
| Explore（安全）| **Blocked** — 无论配置如何，写入工具都会被阻止 |
| Ask to Edit（询问编辑）| **Auto-approved** — 允许的工具无需提示 |
| Auto（自动）| **No effect** — 所有工具都已自动批准 |

#### Scenario: 不同权限模式下的 Always Allowed Tools 行为
- **WHEN** 权限模式为 'safe' (Explore)
- **THEN** 写入工具始终被阻止，即使配置了 alwaysAllow
- **WHEN** 权限模式为 'ask' (Ask to Edit)
- **THEN** 配置为 alwaysAllow 的工具自动批准，无需用户确认
- **WHEN** 权限模式为 'allow-all' (Auto)
- **THEN** 所有工具都已自动批准，alwaysAllow 配置无效

> 来源: packages/shared/src/skills/types.ts

---

### Requirement: SC-SKL-005 - 在 Finder 中显示
**WHEN** 用户选择显示 Skill 位置，**THEN** 系统应：
- 打开包含 SKILL.md 的文件夹
- 选中 SKILL.md 文件以便用户快速定位

> 来源: packages/shared/src/skills/storage.ts (skill 目录路径管理)

---

### Requirement: SC-INF-001 - Source 资料页信息
**WHEN** 用户查看 **Source 资料页**，**THEN** 系统应显示以下信息：

#### Hero 部分
- Source 头像（emoji、URL 或本地图标文件）
- Source 名称
- Source 标语（来自 config.tagline 或从 guide.md 提取）

#### Connection 部分
- **Type**: MCP / API / Local
- **URL**: 服务器 URL、API 基础 URL 或本地路径（可点击打开）
- **Last Tested**: 相对时间（例如：5 分钟前、2 小时前、从未）
- **Connection Error**: 如果连接失败，显示错误消息

#### Tools 部分（仅 MCP Sources）
- 服务器暴露的所有工具列表
- 工具名称和描述
- 工具权限状态

#### Permissions 部分
- **MCP Sources**: 允许的工具模式和阻止的工具列表
- **API Sources**: 允许的 API 端点和允许的 Bash 模式

#### Documentation 部分
- guide.md 原始 Markdown 内容
- Markdown 渲染预览

#### Scenario: 查看 MCP Source 资料页
- **WHEN** 用户打开 MCP Source 资料页
- **THEN** Hero 部分显示 Source 名称、头像和标语
- **THEN** Connection 部分显示传输类型、URL 和连接状态
- **THEN** Tools 部分列出所有可用的 MCP 工具
- **THEN** Permissions 部分显示权限规则

> 来源: packages/shared/src/sources/types.ts, packages/shared/src/sources/storage.ts

---

### Requirement: SC-INF-002 - Skill 资料页信息
**WHEN** 用户查看 **Skill 资料页**，**THEN** 系统应显示以下信息：

#### Hero 部分
- Skill 头像（从 SKILL.md 内容或图标文件）
- Skill 名称
- Skill 描述

#### Metadata 部分
- **Slug**: Skill 标识符
- **Name**: Skill 显示名称
- **Description**: Skill 详细描述
- **Location**: SKILL.md 文件路径（可点击在 Finder 中打开）

#### Permission Modes 部分
- Always Allowed Tools 在不同权限模式下的行为说明表格

#### Instructions 部分
- SKILL.md 的指令内容（Markdown 渲染）

#### Scenario: 查看 Skill 资料页
- **WHEN** 用户打开 Skill 资料页
- **THEN** Hero 部分显示 Skill 名称、描述和头像
- **THEN** Metadata 部分显示 slug、名称、描述和文件位置
- **THEN** Permission Modes 部分显示行为说明表格
- **THEN** Instructions 部分渲染 Skill 指令内容

> 来源: packages/shared/src/skills/types.ts, packages/shared/src/skills/storage.ts

---

### Requirement: SC-INF-003 - 格式化相对时间
**WHEN** 系统显示时间戳，**THEN** 系统应使用以下相对时间格式：
- **小于 1 分钟**: "Just now"（刚刚）
- **1-59 分钟**: "{X} minute(s) ago"（X 分钟前）
- **1-23 小时**: "{X} hour(s) ago"（X 小时前）
- **1+ 天**: "{X} day(s) ago"（X 天前）

#### Scenario: 显示相对时间
- **WHEN** Source 的 lastTestedAt 为 2 分钟前
- **THEN** 系统显示 "2 minutes ago"
- **WHEN** Source 的 lastTestedAt 为 1 小时前
- **THEN** 系统显示 "1 hour ago"

> 来源: UI 层组件 (Frontend 渲染逻辑)

---

### Requirement: SC-INF-004 - Source 禁用警告
**WHEN** 查看 **stdio 传输的 MCP Source** 且本地 MCP 服务器被禁用，**THEN** 系统应：
- 显示警告横幅
- 警告消息：本地 MCP 服务器在 设置 > 高级 中已禁用
- 指示用户启用该设置以使用此 Source

#### Scenario: 查看被禁用的 stdio MCP Source
- **WHEN** 用户打开一个 stdio 类型的 Source
- **WHEN** 本地 MCP 服务器功能被禁用
- **THEN** 页面显示警告横幅

> 来源: packages/shared/src/sources/types.ts (connectionStatus: 'local_disabled')

---

### Requirement: SC-OPR-001 - 在新窗口中打开
**WHEN** 用户选择在新窗口中打开 Source 或 Skill，**THEN** 系统应：
- 打开新的应用窗口
- URL 格式：`craftagents://sources/source/{slug}` 或 `craftagents://skills/skill/{slug}`
- 保持聚焦状态（?window=focused）

> 来源: UI 层组件 (Frontend 路由管理)

---

### Requirement: SC-OPR-002 - 在 Finder 中显示
**WHEN** 用户选择在 Finder 中显示 Source 或 Skill，**THEN** 系统应：
- **Source**: 显示 Source 文件夹（包含 config.json 和 guide.md）
- **Skill**: 显示包含 SKILL.md 文件的文件夹

> 来源: packages/shared/src/sources/storage.ts, packages/shared/src/skills/storage.ts

---

### Requirement: SC-OPR-003 - 删除 Source
**WHEN** 用户删除一个 **Source**，**THEN** 系统应：
- 完全删除 Source 文件夹及其所有内容
- 显示成功消息：已删除 Source: {name}
- 导航到 Source 列表页面
- 如果删除失败，显示错误消息

#### Scenario: 删除 Source
- **WHEN** 用户删除一个 Source
- **THEN** 系统递归删除 sources/{slug} 文件夹

> 来源: packages/shared/src/sources/storage.ts (deleteSource)

---

### Requirement: SC-OPR-004 - 删除 Skill
**WHEN** 用户删除一个 **Skill**，**THEN** 系统应：
- 完全删除 Skill 文件夹及其所有内容
- 显示成功消息：已删除 Skill: {name}
- 导航到 Skills 列表页面
- 如果删除失败，显示错误消息

#### Scenario: 删除 Skill
- **WHEN** 用户删除一个 Skill
- **THEN** 系统递归删除 skills/{skillSlug} 文件夹

> 来源: packages/shared/src/skills/storage.ts (deleteSkill)

---

### Requirement: SC-OPR-005 - 编辑 Source 配置
**WHEN** 用户选择编辑 Source 配置，**THEN** 系统应提供：
- **AI 辅助编辑**: 通过 EditPopover 组件进行 AI 辅助编辑
- **直接编辑文件**: 跳转到 Source 文件夹的 config.json 文件

支持编辑的文件：
- `config.json`: Source 配置
- `permissions.json`: 权限配置
- `guide.md`: 使用指南

> 来源: packages/shared/src/sources/storage.ts, packages/shared/src/sources/types.ts

---

### Requirement: SC-OPR-006 - 编辑 Skill 文件
**WHEN** 用户选择编辑 Skill 文件，**THEN** 系统应提供：
- **AI 辅助编辑**: 通过 EditPopover 组件进行 AI 辅助编辑
- **直接编辑文件**: 跳转到 SKILL.md 文件

> 来源: packages/shared/src/skills/storage.ts

---

### Requirement: SC-OPR-007 - Source 图标管理
**WHEN** 配置 Source 图标，**THEN** 系统应支持：
- **Emoji**: 直接使用 emoji 作为图标
- **URL**: 从 URL 下载图标并保存到 Source 文件夹
- **本地文件**: 自动发现 Source 文件夹中的图标文件（icon.svg, icon.png 等）
- **自动获取**: 如果未提供图标，尝试从服务 URL 自动获取高质量 logo

#### Scenario: 配置 Source 图标
- **WHEN** 用户配置 emoji 图标
- **THEN** 系统直接使用 emoji
- **WHEN** 用户配置 URL 图标
- **THEN** 系统下载图标并保存到 Source 文件夹
- **WHEN** Source 文件夹包含 icon.svg 或 icon.png
- **THEN** 系统自动使用该本地文件
- **WHEN** 未提供图标
- **THEN** 系统尝试从服务 URL 自动获取 logo

> 来源: packages/shared/src/sources/storage.ts (icon 相关函数)

---

### Requirement: SC-OPR-008 - 菜单操作一致性
**WHEN** 用户在 **Source/Skill 列表面板** 通过 "..." 按钮访问菜单，**WHEN** 用户在 **资源页** 通过标题下拉菜单访问，**THEN** 菜单应提供相同的操作选项：
- Open in New Window（在新窗口中打开）
- Show in Finder（在 Finder 中显示）
- Delete（删除）

> 来源: UI 层组件 (Frontend 菜单一致性)

---

### Requirement: SC-PRM-001 - 权限配置文件位置
**WHEN** 为 Source 配置权限，**THEN** 权限配置存储：
- 工作区级别: `~/.craft-agent/workspaces/{id}/permissions.json`
- Source 级别: `~/.craft-agent/workspaces/{id}/sources/{slug}/permissions.json`
- Source 级别配置与工作区级别配置合并（Source 级别优先）

> 来源: packages/shared/src/agent/permissions-config.ts

---

### Requirement: SC-PRM-002 - MCP 权限规则
**WHEN** 为 **MCP Source** 配置权限，**THEN** 支持以下规则类型：
- **blockedTools**: 要阻止的工具模式（字符串或带注释的对象）
- **allowedMcpPatterns**: Explore 模式下允许的工具模式

> 来源: packages/shared/src/agent/permissions-config.ts

---

### Requirement: SC-PRM-003 - API 权限规则
**WHEN** 为 **API Source** 配置权限，**THEN** 支持以下规则类型：
- **blockedTools**: 要阻止的工具模式
- **allowedBashPatterns**: Explore 模式下允许的只读 Bash 命令模式
- **allowedApiEndpoints**: Explore 模式下允许的 API 端点
  - method: HTTP 方法（GET/POST/PUT/DELETE/PATCH）
  - path: 路径模式
  - comment: 可选注释

> 来源: packages/shared/src/agent/permissions-config.ts

---

### Requirement: SC-PRM-004 - 权限表格显示
**WHEN** 显示 **Permissions 表格**，**THEN** 系统应显示以下列：
- **Access**: allowed / blocked
- **Type**: tool / bash / api / mcp
- **Pattern**: 规则模式
- **Comment**: 规则注释（如果存在）

> 来源: UI 层组件 (Frontend 权限表格渲染)

---

### Requirement: SC-PRM-005 - 权限表格操作
**WHEN** 查看 **Permissions 表格**，**THEN** 系统应支持：
- 全屏查看模式以便处理大量规则
- 编辑按钮启动 AI 辅助编辑
- "Edit File" 按钮直接打开 permissions.json

> 来源: UI 层组件 (Frontend 权限表格操作)

---

### Requirement: SC-CRED-001 - 凭证存储
**WHEN** 存储 Source 凭证，**THEN** 系统应：
- 使用 AES-256-GCM 加密存储在 `~/.craft-agent/credentials.enc`
- 凭证标识符格式：
  - OAuth: `source_oauth:{workspaceId}:{sourceSlug}`
  - Bearer Token: `source_bearer:{workspaceId}:{sourceSlug}`
  - API Key: `source_apikey:{workspaceId}:{sourceSlug}`
  - Basic Auth: `source_basic:{workspaceId}:{sourceSlug}`

#### Scenario: 存储不同类型的凭证
- **WHEN** 存储 OAuth 凭证
- **THEN** 使用 source_oauth 类型并存储 accessToken、refreshToken、expiresAt
- **WHEN** 存储 API Key 凭证
- **THEN** 使用 source_apikey 类型
- **WHEN** 存储 Basic Auth 凭证
- **THEN** 使用 source_basic 类型并存储 username:password 的 JSON 对象

> 来源: packages/shared/src/sources/credential-manager.ts

---

### Requirement: SC-CRED-002 - OAuth 凭证刷新
**WHEN** OAuth 访问令牌即将在 5 分钟内过期或已过期，**THEN** 系统应：
- 自动使用刷新令牌获取新的访问令牌
- 更新存储的凭证
- 如果刷新失败，将 Source 标记为需要重新认证

#### Scenario: OAuth 凭证即将过期
- **WHEN** OAuth 凭证的 expiresAt 在 5 分钟内
- **THEN** 系统自动刷新令牌
- **THEN** 更新存储的凭证

#### Scenario: OAuth 凭证已过期
- **WHEN** OAuth 凭证已过期
- **THEN** 系统尝试刷新令牌
- **THEN** 如果刷新失败，将 Source 标记为 needs_auth

> 来源: packages/shared/src/sources/credential-manager.ts (refresh, needsRefresh)

---

### Requirement: SC-CRED-003 - 并发刷新防护
**WHEN** 多个 API 请求同时触发令牌刷新，**THEN** 系统应：
- 使用 Promise 去重确保只有一个刷新请求执行
- 其他请求等待并使用同一个刷新结果
- 这特别重要，因为 Microsoft 会轮换刷新令牌

> 来源: packages/shared/src/sources/credential-manager.ts (pendingRefreshes 防护)

---

### Requirement: SC-CRED-004 - 多 Header 凭证
**WHEN** API 需要多个认证头（例如 Datadog），**THEN** 系统应支持：
- 存储为 JSON 格式：`{"DD-API-KEY": "xxx", "DD-APPLICATION-KEY": "yyy"}`
- 在构建请求时自动注入所有必要的认证头

#### Scenario: 配置多 Header 认证
- **WHEN** API Source 配置 headerNames=["DD-API-KEY", "DD-APPLICATION-KEY"]
- **THEN** 凭证存储为 JSON 对象包含两个 key 的值
- **THEN** 发起请求时注入两个 header

> 来源: packages/shared/src/sources/credential-manager.ts (MultiHeaderCredential, isMultiHeaderCredential)

---

### Requirement: SC-CRED-005 - Basic Auth 凭证
**WHEN** API 使用 Basic Auth，**THEN** 系统应支持：
- 存储用户名和密码的 JSON 对象
- 在发送请求时自动构建 Authorization: Basic {base64(user:password)} 头

> 来源: packages/shared/src/sources/credential-manager.ts (BasicAuthCredential)

---

### Requirement: SC-CRED-006 - Source 认证状态
**WHEN** Source 需要认证，**THEN** 系统应：
- 显示 "needs_auth" 状态
- 提供触发 OAuth 流程或输入凭证的选项
- 认证成功后自动将 Source 标记为已认证

#### Scenario: Source 需要认证
- **WHEN** Source 连接但未认证
- **THEN** UI 显示 "needs_auth" 状态
- **THEN** 用户触发 OAuth 流程后
- **THEN** 系统将 Source 标记为 isAuthenticated=true, connectionStatus='connected'

> 来源: packages/shared/src/sources/credential-manager.ts (authenticate, markSourceAuthenticated)

---

### Requirement: SC-API-001 - 灵活的 API 工具
**WHEN** API Source 连接，**THEN** 系统应提供单个灵活的 MCP 工具，接受：
- **path**: API 端点路径（例如："/search" 或 "/v1/completions"）
- **method**: HTTP 方法（GET/POST/PUT/DELETE/PATCH）
- **params**: 请求体（POST/PUT/PATCH）或查询参数（GET）
- **_intent**: 意图描述（用于大数据响应的摘要）

#### Scenario: 使用 API 工具发起请求
- **WHEN** Agent 调用 API 工具
- **THEN** 工具接受 path、method、params 参数
- **THEN** 系统构建并发送 HTTP 请求

> 来源: packages/shared/src/sources/api-tools.ts

---

### Requirement: SC-API-002 - API 工具描述
**WHEN** Agent 查看 API 工具描述，**THEN** 描述应包含：
- API 名称和 baseUrl
- 认证由系统自动处理的说明
- 从配置文档提取的完整 API 文档
- 官方文档链接（如果有）
- 二进制文件处理说明

> 来源: packages/shared/src/sources/api-tools.ts (工具描述生成)

---

### Requirement: SC-API-003 - 二进制文件处理
**WHEN** API 返回二进制内容（PDF、图片、归档等），**THEN** 系统应：
- 自动检测二进制内容（通过 Content-Type 或内容检查）
- 保存文件到会话的 downloads 文件夹
- 返回结构化元数据：`{ type: "file_download", path, filename, mimeType, size, sizeHuman }`
- 支持 Gmail 附件（base64 包装的二进制）

#### Scenario: API 返回二进制文件
- **WHEN** API 响应 Content-Type 为 application/pdf 或 image/png
- **THEN** 系统检测到二进制内容
- **THEN** 保存文件到会话的 downloads 文件夹
- **THEN** 返回文件路径和元数据给 Agent

> 来源: packages/shared/src/sources/api-tools.ts

---

### Requirement: SC-API-004 - 大响应处理
**WHEN** API 响应超过 token 限制（~15K tokens），**THEN** 系统应：
- 将完整响应保存到会话的 responses 文件夹
- 使用 AI 摘要生成响应的简洁摘要
- 返回文件路径 + 摘要给 Agent
- 如果响应超过 Haiku 限制（~100K tokens），仅返回文件路径 + 预览

#### Scenario: API 返回大响应
- **WHEN** API 响应超过 15K tokens
- **THEN** 系统将完整响应保存到文件
- **THEN** 使用 AI 摘要生成简洁版本
- **THEN** 返回文件路径和摘要

> 来源: packages/shared/src/sources/api-tools.ts (summarizeLargeResult, saveLargeResponse)

---

### Requirement: SC-API-005 - 大文件保护
**WHEN** API 响应 Content-Length 超过 500MB，**THEN** 系统应：
- 拒绝加载响应到内存
- 返回错误消息建议使用流式下载工具

#### Scenario: API 响应过大
- **WHEN** API 响应 Content-Length > 500MB
- **THEN** 系统拒绝加载
- **THEN** 返回错误消息

> 来源: packages/shared/src/sources/api-tools.ts (MAX_DOWNLOAD_SIZE)

---

### Requirement: SC-API-006 - 文件命名
**WHEN** 保存二进制文件，**THEN** 文件名按以下优先级确定：
1. Content-Disposition 头中的 filename
2. URL 路径中的文件名（如果有扩展名）
3. 使用时间戳 + MIME 类型/魔术字节检测的扩展名

#### Scenario: 确定下载文件名
- **WHEN** Content-Disposition 头包含 filename
- **THEN** 使用该文件名
- **WHEN** URL 路径包含文件名
- **THEN** 使用 URL 路径中的文件名
- **WHEN** 无上述信息
- **THEN** 使用时间戳 + MIME 类型检测

> 来源: packages/shared/src/sources/api-tools.ts (文件名逻辑)

---

### Requirement: SC-API-007 - 认证头构建
**WHEN** 发出 API 请求，**THEN** 系统应根据认证类型自动注入认证：
- **Bearer**: `Authorization: {authScheme} {token}`（authScheme 默认为 "Bearer"）
- **Header**: 将 credential 作为指定的 header 值注入
- **Multi-Header**: 将 credential 对象的所有字段作为 headers 注入
- **Query**: 在 URL 中添加查询参数（例如：`?api_key=xxx`）
- **Basic**: `Authorization: Basic {base64(user:password)}`

#### Scenario: 构建不同认证类型的请求
- **WHEN** API Source 使用 Bearer 认证
- **THEN** 注入 Authorization: Bearer {token}
- **WHEN** API Source 使用 Header 认证
- **THEN** 注入 {headerName}: {credential}
- **WHEN** API Source 使用 Query 认证
- **THEN** URL 包含 ?{queryParam}={credential}
- **WHEN** API Source 使用 Basic 认证
- **THEN** 注入 Authorization: Basic {base64(user:password)}

> 来源: packages/shared/src/sources/api-tools.ts (认证头构建逻辑)

---

### Requirement: SC-RTL-001 - Sources 变化通知
**WHEN** Sources 列表发生变化（创建、更新、删除），**THEN** 系统：
- 发送 `onSourcesChanged` 事件
- 包含更新后的 Sources 列表
- UI 组件监听事件并刷新显示

> 来源: UI 层组件 (Frontend 事件监听)

---

### Requirement: SC-RTL-002 - Skills 变化通知
**WHEN** Skills 列表发生变化（创建、更新、删除），**THEN** 系统：
- 发送 `onSkillsChanged` 事件
- 包含更新后的 Skills 列表
- UI 组件监听事件并刷新显示

> 来源: UI 层组件 (Frontend 事件监听)

---

### Requirement: SC-RTL-003 - Source 详情页面同步
**WHEN** 在 Source 资料页查看 Source 且该 Source 被更新，**THEN** 系统：
- 监听 Sources 变化事件
- 自动重新加载 Source 配置和权限配置
- 更新页面显示

> 来源: UI 层组件 (Frontend 实时同步)

---

### Requirement: SC-RTL-004 - Skill 详情页面同步
**WHEN** 在 Skill 资料页查看 Skill 且该 Skill 被更新，**THEN** 系统：
- 监听 Skills 变化事件
- 自动重新加载 Skill 数据
- 更新页面显示

> 来源: UI 层组件 (Frontend 实时同步)

---

### Requirement: SC-ERR-001 - Source 加载失败
**WHEN** 加载 Source 配置失败，**THEN** 系统应：
- 显示 "Source not found" 错误消息
- 提供返回 Source 列表的选项

#### Scenario: Source 加载失败
- **WHEN** 请求的 Source 不存在
- **THEN** 显示错误页面并提供返回按钮

> 来源: packages/shared/src/sources/storage.ts (loadSource 返回 null)

---

### Requirement: SC-ERR-002 - MCP 工具加载失败
**WHEN** 加载 MCP 工具失败，**THEN** 系统应：
- 显示错误消息："Failed to load tools"
- 在 Tools 表格中显示错误状态
- 提供重试选项

> 来源: packages/shared/src/sources/server-builder.ts (错误处理)

---

### Requirement: SC-ERR-003 - 连接测试失败
**WHEN** Source 连接测试失败，**THEN** 系统应：
- 在 Connection 部分显示错误横幅
- 显示详细的错误消息
- 更新 Source 状态为 "failed"

#### Scenario: Source 连接测试失败
- **WHEN** 连接测试失败
- **THEN** 将 connectionStatus 更新为 'failed'
- **THEN** 存储 connectionError 消息

> 来源: packages/shared/src/sources/types.ts (SourceConnectionStatus)

---

### Requirement: SC-ERR-004 - OAuth 认证失败
**WHEN** OAuth 认证流程失败，**THEN** 系统应：
- 显示错误消息描述失败原因
- 提供 "重试" 选项
- 不将 Source 标记为已认证

#### Scenario: OAuth 认证失败
- **WHEN** 用户取消 OAuth 流程
- **THEN** 显示错误消息
- **THEN** 保持 isAuthenticated=false

> 来源: packages/shared/src/sources/credential-manager.ts (authenticate 返回失败)

---

### Requirement: SC-ERR-005 - 令牌刷新失败
**WHEN** OAuth 令牌刷新失败，**THEN** 系统应：
- 将 Source 标记为需要重新认证（"needs_auth"）
- 在配置中存储错误消息：token refresh failed: {reason}
- 提示用户重新进行 OAuth 流程

#### Scenario: OAuth 令牌刷新失败
- **WHEN** 令牌刷新失败
- **THEN** 调用 markSourceNeedsReauth
- **THEN** 更新 config 为 isAuthenticated=false, connectionStatus='needs_auth'

> 来源: packages/shared/src/sources/credential-manager.ts (markSourceNeedsReauth)

---

## MODIFIED Requirements

(当前无修改的需求)

---

## REMOVED Requirements

(当前无移除的需求)
