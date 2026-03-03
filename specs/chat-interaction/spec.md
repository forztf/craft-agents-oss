# AI 聊天交互模块 - OpenSpec 需求规格

## 模块标识
- **模块名称**: 聊天交互模块 (Chat Interaction)
- **模块 ID**: #6
- **优先级**: 核心
- **状态**: 已实现

---

## ADDED Requirements

### Requirement: 自由文本输入

**系统 SHALL** 提供支持多行文本输入的富文本输入组件，具备自动高度扩展、字符计数和草稿持久化功能。

#### Scenario: 输入框自动扩展高度
- **WHEN** 用户在文本输入区域输入多行文本时
- **THEN** 输入框高度应自动扩展以适应内容（使用 `useAutoGrow` hook 实现基于内容的动态高度调整）
> 来源: `apps/electron/src/renderer/components/app-shell/input/useAutoGrow.ts:19`

#### Scenario: 草稿内容持久化
- **WHEN** 用户切换会话或模式时
- **THEN** 输入框内容应通过防抖机制自动保存到父组件（300ms 防抖延迟），并在卸载时立即同步
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:387-412`

#### Scenario: 输入框最大高度限制
- **WHEN** 内容长度超过窗口高度的66%时
- **THEN** 输入框高度应限制为最大540像素以避免遮挡过多屏幕空间
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:451-459`

---

### Requirement: 文件附件处理

**系统 SHALL** 支持通过按钮点击、拖放或粘贴方式添加多种文件类型的附件，并提供预览和大小验证功能。

#### Scenario: 通过按钮添加文件
- **WHEN** 用户点击回形针按钮选择文件时
- **THEN** 系统应打开文件选择器并将选定文件添加到附件列表
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:334`

#### Scenario: 拖放文件添加
- **WHEN** 用户将文件拖放到输入区域上方时
- **THEN** 系统应显示视觉反馈（拖放状态高亮），并在文件释放时添加到附件列表
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:414-415`

#### Scenario: 粘贴图片和文本
- **WHEN** 用户粘贴剪贴板中的图片或文本时
- **THEN** 系统应自动创建附件（如 `pasted-image-1.png`、`pasted-text-1`）并避免文件名冲突
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:645-658`

#### Scenario: 文件类型图标和标签显示
- **WHEN** 显示文件附件预览时
- **THEN** 系统应根据 MIME 类型或文件扩展名显示相应的图标和文件类型标签（如 PDF、Word、PNG、JavaScript）
> 来源: `packages/ui/src/components/chat/attachment-helpers.tsx:13-78`

#### Scenario: 图片附件缩略图预览
- **WHEN** 用户消息包含图片附件时
- **THEN** 系统应显示14x14像素的方形缩略图预览，点击可打开完整图片
> 来源: `packages/ui/src/components/chat/UserMessageBubble.tsx:379-393`

#### Scenario: 文档附件预览
- **WHEN** 用户消息包含文档附件时
- **THEN** 系统应显示包含缩略图/图标和两行文件信息的气泡（文件名和类型标签），宽度最大120px
> 来源: `packages/ui/src/components/chat/UserMessageBubble.tsx:395-417`

---

### Requirement: 智能语法输入

**系统 SHALL** 支持在输入时通过特殊语法触发菜单：@mention 提及文件/技能，/skill 调用技能，#label 应用标签。

#### Scenario: @mention 触发提及菜单
- **WHEN** 用户输入 `@` 字符时
- **THEN** 系统应显示下拉菜单列出可提到的源（sources）、技能（skills）和文件标签（files/folders）
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:147-148`

#### Scenario: /skills 触发技能菜单
- **WHEN** 用户输入 `/` 字符时
- **THEN** 系统应显示斜杠命令菜单列出可用的技能命令
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:22-25`

#### Scenario: #label 触发标签菜单
- **WHEN** 用户输入 `#` 字符时
- **THEN** 系统应显示标签菜单列出可用的标签配置（LabelConfig 树结构）
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:150-151`

#### Scenario: 内容徽章内联显示
- **WHEN** 用户消息包含 @mention 或 #label 标记时
- **THEN** 系统应在消息中渲染内联徽章显示已提及的源/技能/标签，使用背景色和阴影样式
> 来源: `packages/ui/src/components/chat/UserMessageBubble.tsx:70-89`

---

### Requirement: 结构化输入 - 认证请求

**系统 SHALL** 在需要用户凭证时提供结构化输入界面，支持 API Key、Bearer Token、Basic Auth、Multi-Header 和 OAuth 认证方式。

#### Scenario: API Key / Bearer Token 单字段输入
- **WHEN** 系统请求 API Key 或 Bearer Token 认证时
- **THEN** 系统应显示单个密码框输入凭证，带眼睛图标切换显示/隐藏，验证非空后启用保存按钮
> 来源: `apps/electron/src/renderer/components/app-shell/input/structured/CredentialRequest.tsx:237-271`

#### Scenario: Basic Auth 用户名密码输入
- **WHEN** 系统请求 Basic Auth 认证时
- **THEN** 系统应显示用户名框和密码框（带眼睛图标），验证两者非空（或仅需用户名当 `passwordRequired=false`）
> 来源: `apps/electron/src/renderer/components/app-shell/input/structured/CredentialRequest.tsx:147-198`

#### Scenario: Multi-Header 多字段输入
- **WHEN** 系统请求多个自定义 header（如 Datadog 的 DD-API-KEY 和 DD-APPLICATION-KEY）时
- **THEN** 系统应为每个 header 名称显示密码框，验证所有字段非空后启用保存按钮
> 来源: `apps/electron/src/renderer/components/app-shell/input/structured/CredentialRequest.tsx:199-235`

#### Scenario: 密码表单支持密码管理器
- **WHEN** 显示凭证输入表单时
- **THEN** 表单应为 `<form>` 元素且指向源 URL（`action` 属性）以支持 1Password 等密码管理器的自动填充
> 来源: `apps/electron/src/renderer/components/app-shell/input/structured/CredentialRequest.tsx:117-122`

#### Scenario: 凭证安全性提示
- **WHEN** 显示凭证输入表单时
- **THEN** 底部应显示"凭证在静态存储时已加密"的提示文本
> 来源: `apps/electron/src/renderer/components/app-shell/input/structured/CredentialRequest.tsx:307-309`

---

### Requirement: 结构化输入 - OAuth 认证流程

**系统 SHALL** 支持触发 OAuth 认证流程，包括 Google、Slack、Microsoft 等提供商的登录。

#### Scenario: OAuth 触发按钮
- **WHEN** 系统请求 OAuth 认证（如 `oauth-google`、`oauth-slack`）时
- **THEN** 系统应显示描述信息和一个登录按钮（如"Sign in with Google"）
> 来源: `apps/electron/src/renderer/components/chat/AuthRequestCard.tsx:404-411`

#### Scenario: OAuth 浏览器认证流程
- **WHEN** 用户点击 OAuth 登录按钮时
- **THEN** 系统应触发浏览器重定向到 OAuth 提供商的登录页面
> 来源: `apps/electron/src/renderer/components/chat/AuthRequestCard.tsx:265-275`

#### Scenario: OAuth 认证中状态
- **WHEN** OAuth 流程进行中时
- **THEN** 系统应显示加载图标和"Authenticating..."提示，告知用户在浏览器中完成认证
> 来源: `apps/electron/src/renderer/components/chat/AuthRequestCard.tsx:386-401`

#### Scenario: OAuth 认证完成状态
- **WHEN** OAuth 认证成功时
- **THEN** 系统应显示绿色成功状态，显示已连接的源名称和登录邮箱
> 来源: `apps/electron/src/renderer/components/chat/AuthRequestCard.tsx:354-363`

---

### Requirement: 结构化输入 - 权限请求

**系统 SHALL** 在需要用户批准敏感操作时显示权限请求面板，支持一次性批准、始终允许和拒绝操作。

#### Scenario: 权限请求显示
- **WHEN** AI 代理请求执行需要用户批准的操作（如 bash 命令）时
- **THEN** 系统应显示权限请求面板，包含盾牌图标、"Permission Required"标题、工具名称和操作描述
> 来源: `apps/electron/src/renderer/components/app-shell/input/structured/PermissionRequest.tsx:52-66`

#### Scenario: 命令预览
- **WHEN** 权限请求包含要执行的命令时
- **THEN** 系统应在面板中显示可滚动的命令预览代码块（最多24px高度）
> 来源: `apps/electron/src/renderer/components/app-shell/input/structured/PermissionRequest.tsx:69-73`

#### Scenario: 批准操作
- **WHEN** 用户点击"Allow"按钮时
- **THEN** 系统应授权单次执行当前操作
> 来源: `apps/electron/src/renderer/components/app-shell/input/structured/PermissionRequest.tsx:28-30`

#### Scenario: 始终允许操作
- **WHEN** 用户点击"Always Allow"按钮时
- **THEN** 系统应授权当前操作并在本次会话中记住该命令以避免重复提示
> 来源: `apps/electron/src/renderer/components/app-shell/input/structured/PermissionRequest.tsx:32-34`

#### Scenario: 拒绝操作
- **WHEN** 用户点击"Deny"按钮时
- **THEN** 系统应拒绝执行当前操作
> 来源: `apps/electron/src/renderer/components/app-shell/input/structured/PermissionRequest.tsx:36-38`

---

### Requirement: 结构化输入 - 模式切换动画

**系统 SHALL** 在自由文本模式和结构化输入模式之间切换时提供平滑的高度和淡入淡出动画。

#### Scenario: 输入模式切换动画
- **WHEN** 输入容器从 freeform 模式切换到 structured 模式时
- **THEN** 系统应使用 Motion 的 `motion.div` 容器以 0.25s 持续时间和贝塞尔曲线过渡动画高度，同时使用 AnimatePresence 的淡入淡出效果切换内容
> 来源: `apps/electron/src/renderer/components/app-shell/input/InputContainer.tsx:22-23,248-259`

#### Scenario: 隐藏测量 div
- **WHEN** 渲染结构化输入时
- **THEN** 系统应使用不可见的测量 div 计算内容自然高度，然后动画化可见容器到该高度
> 来源: `apps/electron/src/renderer/components/app-shell/input/InputContainer.tsx:220-230`

#### Scenario: 帧同步高度更新
- **WHEN** 高度动画进行中时
- **THEN** 系统应在每帧通过 `onAnimatedHeightChange` 回调传递高度变化量，用于滚动视图同步
> 来源: `apps/electron/src/renderer/components/app-shell/input/InputContainer.tsx:166-173`

---

### Requirement: 消息流式显示

**系统 SHALL** 支持实时更新流式响应（Markdown 渲染），并显示处理状态指示器。

#### Scenario: 处理状态指示器
- **WHEN** AI 代理正在处理请求时
- **THEN** 系统应显示轮转的状态文本（如"Thinking...", "Pondering...", "Processing..."），每10秒随机切换，并显示已用时间
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:205-215,246-276`

#### Scenario: 流式 Markdown 渲染
- **WHEN** 接收 AI 响应文本流时
- **THEN** 系统应实时渲染 Markdown 内容，并使用缓冲策略在达到阈值前隐藏内容以避免频繁闪烁
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:284-330`

#### Scenario: 响应缓冲策略
- **WHEN** 响应正在流式传输且未达到显示阈值时
- **THEN** 系统应基于内容类型（代码块、列表、问题）和词数（代码15词、列表20词、标准40词）决定是否显示内容，最大缓冲时间为 2.5s
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:356-413`

---

### Requirement: 指令卡片展示

**系统 SHALL** 显示 AI 代理执行的工具调用活动，包括状态指示器、工具名称、输入参数和输出结果。

#### Scenario: 活动状态图标
- **WHEN** 显示工具活动时
- **THEN** 系统应根据活动状态显示相应图标：pending（圆圈）、running（加载动画）、completed（勾选或自定义图标）、error（X）、backgrounded（暂停）
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:683-815`

#### Scenario: 工具显示格式化
- **WHEN** 显示工具调用信息时
- **THEN** 系统应使用 `toolDisplayMeta` 中的嵌套元数据（显示名称、图标 base64、描述）格式化工具显示，支持 MCP 工具的工具 slug 后缀显示
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:540-604`

#### Scenario: 工具输入摘要
- **WHEN** 显示 Edit/Write 工具时
- **THEN** 系统应只显示文件路径，省略 `old_string`、`new_string`、`content` 等大段文本
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:476-510`

#### Scenario: 活动分组和嵌套
- **WHEN** 显示带父活动嵌套的子代理活动时
- **THEN** 系统应使用 `depth` 参数缩进显示嵌套层级，并将相关活动分组在一起
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:194-195`

---

### Requirement: TodoWrite 工具可视化

**系统 SHALL** 显示 TodoWrite 工具创建的任务列表，支持待办、进行中、已完成和中断状态的跟踪。

#### Scenario: Todo 列表显示
- **WHEN** AI 代理使用 TodoWrite 工具时
- **THEN** 系统应在 TurnCard 底部显示任务列表，每个任务显示内容、状态和可选的进行中表单
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:167-179`

#### Scenario: Todo 状态图标
- **WHEN** 显示任务状态时
- **THEN** 系统应使用相应图标：pending（圆圈）、in_progress（加载动画）、completed（勾选）、interrupted（暂停）
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:169`

---

### Requirement: 空状态提示

**系统 SHALL** 在空会话中显示随机的工作流建议，包含内联实体徽章。

#### Scenario: 工作流建议显示
- **WHEN** 会话中没有消息时
- **THEN** 系统应显示随机选择的工作流建议文本（从15个模板中选择），使用 `{source:Gmail}`、`{file:screenshot}`、`{folder}`、`{skill}` 实体标记
> 来源: `apps/electron/src/renderer/components/chat/EmptyStateHint.tsx:45-62`

#### Scenario: 实体徽章渲染
- **WHEN** 空状态提示中包含实体标记时
- **THEN** 系统应解析标记并渲染带背景色和阴影的内联徽章显示实体名称
> 来源: `apps/electron/src/renderer/components/chat/EmptyStateHint.tsx:145-151`

---

### Requirement: 消息搜索高亮

**系统 SHALL** 在搜索模式下高亮显示匹配的文本，并提供导航支持。

#### Scenario: 搜索匹配统计
- **WHEN** 用户输入搜索查询时
- **THEN** 系统应计算并显示总匹配数（遍历所有回合的文本内容），通过 `onMatchInfoChange` 回调向 session list 传递匹配信息
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:500-550`

#### Scenario: 搜索自动展开分页
- **WHEN** 搜索激活且有匹配项时
- **THEN** 系统应自动扩展分页以显示所有匹配的回合（计算最早匹配的回合索引并设置可见回合数）
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:552-568`

#### Scenario: 单匹配自动滚动
- **WHEN** 搜索查询只有一个匹配结果时
- **THEN** 系统应自动滚动到该匹配项并使其居中显示
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:584-590`

#### Scenario: 匹配导航支持
- **WHEN** 用户点击导航按钮（上一个/下一个）时
- **THEN** 系统应更新当前匹配索引并滚动到对应位置，确保匹配项在视图内（带128px边缘缓冲）
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:592-629`

---

### Requirement: Ultrathink 模式支持

**系统 SHALL** 支持启用 extended reasoning 模式，并在输入和响应中显示相应的视觉效果。

#### Scenario: Ultrathink 徽章显示
- **WHEN** 用户启用了 ultrathink 模式时
- **THEN** 系统应在输入区域底部显示渐变色的"Ultrathink"徽章，并使用 UltrathinkGlow shader 效果在整个输入区域添加脉冲边框
> 来源: `apps/electron/src/renderer/components/app-shell/input/InputContainer.tsx:240-245`

#### Scenario: 用户消息 Ultrathink 徽章
- **WHEN** 用户使用 ultrathink 发送消息时
- **THEN** 系统应在用户消息气泡上方显示渐变色的"Ultrathink"徽章
> 来源: `packages/ui/src/components/chat/UserMessageBubble.tsx:52-64`

---

### Requirement: 中断响应功能

**系统 SHALL** 支持在处理过程中通过两次按 Esc 键中断响应。

#### Scenario: 第一次 Esc 显示提示
- **WHEN** 用户在处理过程中第一次按 Esc 键时
- **THEN** 系统应在底部工具栏上方显示半透明的提示覆盖层"Press Esc again to interrupt"
> 来源: `apps/electron/src/renderer/components/app-shell/input/EscapeInterruptOverlay.tsx:58-61`

#### Scenario: 第二次 Esc 中断处理
- **WHEN** 用户在提示可见时第二次按 Esc 键时
- **THEN** 系统应调用 `onStop` 回调中断当前处理（可选择静默中断）
> 来源: `apps/electron/src/renderer/components/app-shell/input/EscapeInterruptOverlay.tsx:5-8`

---

### Requirement: 计划批准功能

**系统 SHALL** 在 AI 代理生成计划时显示批准选项，支持直接执行或先紧凑化会话再执行。

#### Scenario: 计划批准按钮
- **WHEN** AI 代理生成计划响应且是最后一个响应时
- **THEN** 系统应在 TurnCard 底部显示"Accept Plan"下拉菜单按钮
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:260-263`

#### Scenario: 计划批准下拉菜单
- **WHEN** 用户点击批准按钮时
- **THEN** 系统应显示下拉菜单提供两个选项："Accept"（立即执行）和"Accept & Compact"（先紧凑化会话再执行）
> 来源: `packages/ui/src/components/chat/AcceptPlanDropdown.tsx:17-24`

#### Scenario: 执行计划事件
- **WHEN** 用户选择"Accept"时
- **THEN** 系统应发送 `craft:approve-plan` 自定义事件，包含 sessionId 和计划文本
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:493-518`

#### Scenario: 紧凑化并执行计划
- **WHEN** 用户选择"Accept & Compact"时
- **THEN** 系统应发送 `craft:approve-plan-with-compact` 事件，发送 `/compact` 命令，并在紧凑化完成后自动发送执行消息
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:520-581`

#### Scenario: 页面重载恢复
- **WHEN** 页面在计划执行待定状态下重载时
- **THEN** 系统应在挂载时检查待定状态，如果紧凑化已完成则自动发送执行消息
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:583-624`

---

### Requirement: TurnCard 展开和折叠

**系统 SHALL** 支持回合卡片的展开和折叠状态持久化，以及活动组的分组折叠。

#### Scenario: 回合卡片切换展开/折叠
- **WHEN** 用户点击回合卡片的展开/折叠按钮时
- **THEN** 系统应切换展开状态并将状态保存到 localStorage（按 sessionId 和 turnId 键）
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:429-435`

#### Scenario: 活动分组折叠
- **WHEN** 回合包含多个相关活动（如多个 Bash 工具）时
- **THEN** 系统应将活动按 `parentId` 分组显示，支持独立折叠每个活动组
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:194-195`

#### Scenario: 自动展开搜索匹配
- **WHEN** 搜索查询激活且有匹配项时
- **THEN** 系统应自动展开包含匹配项的回合卡片
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:576-579`

---

### Requirement: 反向分页加载

**系统 SHALL** 支持反向分页加载历史消息，初始显示最近回合，向上滚动时加载更多。

#### Scenario: 初始加载最近 N 个回合
- **WHEN** 进入会话时
- **THEN** 系统应初始加载最近 20 个回合（TURNS_PER_PAGE）
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:403-404`

#### Scenario: 向上滚动加载更多
- **WHEN** 用户滚动到接近顶部时
- **THEN** 系统应增加可见回合数并渲染更多历史回合
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:406`

---

### Requirement: 源选择和工作目录

**系统 SHALL** 支持选择启用的数据源和设置当前工作目录。

#### Scenario: 启用/禁用源
- **WHEN** 用户勾选或取消勾选源列表中的选项时
- **THEN** 系统应乐观更新 UI 并调用 `onSourcesChange` 回调
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:360-375`

#### Scenario: 工作目录设置
- **WHEN** 用户从菜单中添加或更改工作目录时
- **THEN** 系统应调用 `onWorkingDirectoryChange` 回调传递新路径
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:160-161`

---

### Requirement: 连接和模型选择

**系统 SHALL** 支持分层选择 LLM 连接（按提供商分组）和模型（每个连接的可用模型列表）。

#### Scenario: 连接分组显示
- **WHEN** 显示连接选择器时
- **THEN** 系统应按提供商类型（Anthropic、OpenAI）分组显示连接，每个分组包含该提供商的所有连接
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:285-302`

#### Scenario: 模型列表基于连接
- **WHEN** 选择不同的连接时
- **THEN** 系统应显示该连接的可用模型列表，而非所有模型的合并列表
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:265-280`

#### Scenario: 首条消息后锁定连接
- **WHEN** 会话已有消息时
- **THEN** 系统应禁止更改 LLM 连接（保持会话一致性）
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:103-105`

---

### Requirement: 思考级别和权限模式

**系统 SHALL** 支持选择思考级别（off、think、max）和权限模式（safe、ask、allow-all）并支持 Shift+Tab 循环切换。

#### Scenario: 思考级别选择
- **WHEN** 用户从菜单中选择思考级别时
- **THEN** 系统应调用 `onThinkingLevelChange` 回调传递新级别
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:116-120`

#### Scenario: 权限模式循环切换
- **WHEN** 用户按 Shift+Tab 时
- **THEN** 系统应在启用的权限模式列表中循环切换（safe → ask → allow-all → safe...）
> 来源: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx:124-127`

---

### Requirement: EditPopover 内联执行视图

**系统 SHALL** 在编辑弹窗中提供紧凑的内联执行视图，显示活动进度和结果。

#### Scenario: 执行中状态显示
- **WHEN** 内联执行正在进行时
- **THEN** 系统应显示加载指示器和"Editing..."标题，列出最近3个活动项
> 来源: `packages/ui/src/components/chat/InlineExecution.tsx:86-120`

#### Scenario: 执行成功状态显示
- **WHEN** 内联执行成功完成时
- **THEN** 系统应显示勾选图标和"Done"标题，渲染 Markdown 格式的结果消息
> 来源: `packages/ui/src/components/chat/InlineExecution.tsx:124-141`

#### Scenario: 执行错误状态显示
- **WHEN** 内联执行失败时
- **THEN** 系统应显示 X 图标和"Error"标题，渲染错误消息，并提供重试和取消选项
> 来源: `packages/ui/src/components/chat/InlineExecution.tsx:142-171`

---

### Requirement: 认证请求历史显示

**系统 SHALL** 在聊天历史中显示认证请求卡片，并根据交互状态调整显示。

#### Scenario: 交互式认证卡片
- **WHEN** 认证请求是最后一条消息且无后续用户消息时
- **THEN** 系统应显示完整的交互式表单/按钮
> 来源: `apps/electron/src/renderer/components/chat/AuthRequestCard.tsx:149`

#### Scenario: 终端状态紧凑视图
- **WHEN** 认证请求已完成/取消/失败且非最后一条消息时
- **THEN** 系统应显示紧凑的卡片，仅包含图标、标题和子标题（如已连接的邮箱信息）
> 来源: `apps/electron/src/renderer/components/chat/AuthRequestCard.tsx:320-349`

---

### Requirement: Diff 统计显示

**系统 SHALL** 为 Edit 和 Write 工具显示差异统计（添加和删除的行数）。

#### Scenario: Edit 工具差异统计
- **WHEN** 显示 Edit 工具活动时
- **THEN** 系统应计算并显示 `old_string` 和 `new_string` 之间的添加行数和删除行数
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:89-116`

#### Scenario: Write 工具差异统计
- **WHEN** 显示 Write 工具活动时
- **THEN** 系统应将所有内容计为添加行数（新文件）
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:118-130`

---

### Requirement: 回合预览文本

**系统 SHALL** 在折叠状态下显示回合的预览文本，摘要描述回合的主要内容。

#### Scenario: 意图优先作为预览
- **WHEN** 回合有明确的 intent 字段时
- **THEN** 系统应使用 intent 作为预览文本
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:607-671`

#### Scenario: 活动意图作为预览
- **WHEN** 回合没有 intent 但有带 intent 的活动时
- **THEN** 系统应使用活动的 intent 作为预览文本
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:618-620`

#### Scenario: 运行中工具作为预览
- **WHEN** 回合有运行中的工具时
- **THEN** 系统应显示最多3个运行中工具的名称
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:642-651`

#### Scenario: Task 描述作为预览
- **WHEN** 回合有 Task 工具时
- **THEN** 系统应显示 Task 的描述（如果有），并附加错误计数（如果有）
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:624-634`

#### Scenario: 完成状态摘要
- **WHEN** 回合完成且有多个活动时
- **THEN** 系统应显示"Steps Completed"摘要并附加错误计数（如果有）
> 来源: `packages/ui/src/components/chat/TurnCard.tsx:663-668`

---

### Requirement: 主题适配

**系统 SHALL** 根据当前主题调整覆盖层和认证卡片的颜色。

#### Scenario: 覆盖层主题适配
- **WHEN** 调用 `onPopOut` 或 `onOpenActivityDetails` 打开 Monaco 编辑器时
- **THEN** 系统应根据 `isDark` 主题参数传递给覆盖层组件以适配颜色
> 来源: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx:412-414`

#### Scenario: 认证卡片主题适配
- **WHEN** 显示认证卡片时
- **THEN** 系统应根据状态（success、error、default、muted）使用相应的背景色和文本颜色
> 来源: `apps/electron/src/renderer/components/chat/AuthRequestCard.tsx:21-26,318-320`

---

### Requirement: TurnCard 操作菜单

**系统 SHALL** 在回合卡片头部显示操作菜单，支持查看文件更改和回合详情。

#### Scenario: 操作菜单显示条件
- **WHEN** TurnCard 有可用的操作时（onOpenDetails 或 onOpenMultiFileDiff）
- **THEN** 系统应在回合卡片头部显示操作菜单按钮（三点图标），仅在 hover 时可见
> 来源: `packages/ui/src/components/chat/TurnCardActionsMenu.tsx:32-35`

#### Scenario: 查看文件更改选项
- **WHEN** 回合包含 Edit 或 Write 工具活动时
- **THEN** 操作菜单应显示"View file changes"选项，点击时触发多文件差异视图
> 来源: `packages/ui/src/components/chat/TurnCardActionsMenu.tsx:64-71`

#### Scenario: 查看回合详情选项
- **WHEN** 操作菜单可用时
- **THEN** 菜单应始终显示"View turn details"选项，点击时在新窗口中打开回合详情
> 来源: `packages/ui/src/components/chat/TurnCardActionsMenu.tsx:72-79`

---

### Requirement: 系统消息显示

**系统 SHALL** 显示非对话消息的错误、警告、信息和系统消息，使用不同的视觉样式。

#### Scenario: 系统消息类型定义
- **WHEN** 显示系统消息时
- **THEN** 系统支持四种消息类型：error（错误）、info（信息）、warning（警告）、system（系统消息）
> 来源: `packages/ui/src/components/chat/SystemMessage.tsx:16`

#### Scenario: 错误和警告样式
- **WHEN** 显示错误或警告消息时
- **THEN** 系统应使用带阴影着色的样式，混合前景色以获得更好的文本对比度
> 来源: `packages/ui/src/components/chat/SystemMessage.tsx:35-48`

#### Scenario: 信息和系统消息样式
- **WHEN** 显示信息或系统消息时
- **THEN** 系统应使用简单的边框样式，带淡色背景
> 来源: `packages/ui/src/components/chat/SystemMessage.tsx:49-56`

#### Scenario: 消息内容渲染
- **WHEN** 显示系统消息内容时
- **THEN** 系统应使用最小化模式的 Markdown 渲染内容
> 来源: `packages/ui/src/components/chat/SystemMessage.tsx:80`

---

### Requirement: 回合生命周期阶段

**系统 SHALL** 跟踪回合的生命周期阶段，并在相应的阶段显示正确的 UI 状态。

#### Scenario: 回合阶段类型
- **WHEN** 管理回合状态时
- **THEN** 系统支持五种阶段：pending（等待首个活动）、tool_active（工具运行中）、awaiting（工具完成后的间隙）、streaming（响应流式传输）、complete（回合完成）
> 来源: `packages/ui/src/components/chat/turn-utils.ts:149-154`

#### Scenario: 思考指示器显示条件
- **WHEN** 回合处于特定阶段时
- **THEN** 系统应在 pending、awaiting 阶段或 buffering 的 streaming 阶段显示"Thinking..."指示器
> 来源: `packages/ui/src/components/chat/turn-utils.ts:214-220`

#### Scenario: 工具活动检测
- **WHEN** 判断回合是否为 tool_active 阶段时
- **THEN** 系统仅检测 type='tool' 且 status='running' 的活动，忽略 intermediate 和 status 活动
> 来源: `packages/ui/src/components/chat/turn-utils.ts:186-191`

---

### Requirement: 活动深度计算和增量更新

**系统 SHALL** 为活动的父子嵌套关系计算深度，并支持流式传输期间的增量更新。

#### Scenario: 增量深度计算
- **WHEN** 将消息转换为活动时
- **THEN** 系统应使用现有活动立即计算深度，以在流式传输期间实现正确的树状视图渲染
> 来源: `packages/ui/src/components/chat/turn-utils.ts:244-275`

#### Scenario: 深度安全网计算
- **WHEN** 回合完成或刷新时
- **THEN** 系统应重新计算所有活动的深度，处理边缘情况（如父活动晚于子活动到达）
> 来源: `packages/ui/src/components/chat/turn-utils.ts:285-308`

---

### Requirement: Task 子代代理活动分组

**系统 SHALL** 将子代代理的活动与其父 Task 工具分组显示，显示持续时间、令牌使用等元数据。

#### Scenario: TaskOutput 数据提取
- **WHEN** 处理 TaskOutput 工具结果时
- **THEN** 系统应提取 duration_ms、input_tokens、output_tokens 等数据
> 来源: `packages/ui/src/components/chat/turn-utils.ts:1033-1062`

#### Scenario: 活动分组
- **WHEN** 分组活动时
- **THEN** 系统应将每个 Task 工具创建一个活动组，包含其所有子活动，并保持时间顺序
> 来源: `packages/ui/src/components/chat/turn-utils.ts:1076-1180`

#### Scenario: TaskOutput 隐藏
- **WHEN** 显示活动时
- **THEN** 系统应隐藏 TaskOutput 活动，但其数据应附加到父 Task 组
> 来源: `packages/ui/src/components/chat/turn-utils.ts:1146-1150`

---

### Requirement: 紧凑化状态显示

**系统 SHALL** 显示会话紧凑化过程的状态和完成通知。

#### Scenario: 紧凑化状态活动
- **WHEN** 会话正在进行紧凑化时
- **THEN** 系统应显示类型为 'status' 的活动，statusType 为 'compacting'
> 来源: `packages/ui/src/components/chat/turn-utils.ts:458-483`

#### Scenario: 紧凑化完成更新
- **WHEN** 收到 compacting_complete 信息消息时
- **THEN** 系统应更新对应的 compacting 状态活动为 completed 状态
> 来源: `packages/ui/src/components/chat/turn-utils.ts:486-501`

---

### Requirement: 最后孩子集计算

**系统 SHALL** 预计算哪些活动是其深度级别的最后一个孩子，用于树状视图渲染。

#### Scenario: 最后孩子集预计算
- **WHEN** 渲染活动列表时
- **THEN** 系统应预先计算深度大于0的活动中最后孩子的 ID 集合，使用 O(n) 算法代替 O(n²)
> 来源: `packages/ui/src/components/chat/turn-utils.ts:935-947`

---

### Requirement: 会话文件夹路径前缀去除

**系统 SHALL** 支持去除文件路径中的会话文件夹前缀，使路径显示更简洁。

#### Scenario: 路径前缀去除
- **WHEN** 显示工具调用中的文件路径且提供 sessionFolderPath 时
- **THEN** 系统应使用 stripPathPrefix 工具去除路径中的会话文件夹前缀
> 来源: `packages/ui/src/components/chat/TurnCard.tsx` (使用 normalizePath、pathStartsWith、stripPathPrefix)

---

### Requirement: 活动组展开状态管理

**系统 SHALL** 支持单独展开和折叠每个活动组（如 Task 子代代理的活动）。

#### Scenario: 活动组展开状态传递
- **WHEN** 渲染 TurnCard 时
- **THEN** 系统应接收 expandedActivityGroups 参数（Set<string>）来跟踪哪些活动组已展开
> 来源: `packages/ui/src/components/chat/SessionViewer.tsx:102-103`

#### Scenario: 活动组展开变化回调
- **WHEN** 用户展开或折叠活动组时
- **THEN** 系统应通过 onExpandedActivityGroupsChange 回调传递新的展开组集合
> 来源: `packages/ui/src/components/chat/SessionViewer.tsx:117-119`

---

### Requirement: 会话查看器

**系统 SHALL** 提供平台无关的只读会话查看器组件，用于显示会话记录。

#### Scenario: 只读模式渲染
- **WHEN** SessionViewer 处于 readonly 模式时
- **THEN** 系统应以只读方式渲染回合卡片，不提供交互功能
> 来源: `packages/ui/src/components/chat/SessionViewer.tsx:26,82-86`

#### Scenario: 顶部和底部渐变遮罩
- **WHEN** 渲染消息区域时
- **THEN** 系统应应用线性渐变遮罩，使顶部32px和底部32px处的消息淡入淡出
> 来源: `packages/ui/src/components/chat/SessionViewer.tsx:148-153`

#### Scenario: 会话文件夹路径传递
- **WHEN** 渲染 SessionViewer 时
- **THEN** 系统应接收 sessionFolderPath 参数并传递给 TurnCard 用于路径前缀去除
> 来源: `packages/ui/src/components/chat/SessionViewer.tsx:47,212`

---

### Requirement: 多文件差异视图触发

**系统 SHALL** 支持触发多文件差异视图，显示回合中所有 Edit/Write 工具的更改。

#### Scenario: 多文件差异视图检测
- **WHEN** TurnCard 包含 Edit 或 Write 工具活动时
- **THEN** 系统应设置 hasEditOrWriteActivities 属性为 true
> 来源: `packages/ui/src/components/chat\SessionViewer.tsx:205-207`

#### Scenario: 多文件差异视图触发
- **WHEN** 用户点击操作菜单中的"View file changes"时
- **THEN** 系统应调用 onOpenMultiFileDiff 回调，传递 sessionId 和 turnId
> 来源: `packages/ui/src/components/chat/SessionViewer.tsx:208-211`

---

### Requirement: 持续时间和令牌格式化

**系统 SHALL** 将持续时间和令牌计数格式化为人类可读的字符串。

#### Scenario: 持续时间格式化
- **WHEN** 格式化持续时间时
- **THEN** 系统应显示为秒（<60s）、分钟+秒（<2m）或"Xm+"（≥2m）
> 来源: `packages/ui/src/components/chat/turn-utils.ts:959-974`

#### Scenario: 令牌格式化
- **WHEN** 格式化令牌计数时
- **THEN** 系统应显示原始数字（<1000）、"1.5k"（1000-10000）或"Xk"（≥10000）
> 来源: `packages/ui/src/components/chat/turn-utils.ts:982-996`

---

## MODIFIED Requirements

(无修改的需求)

---

## REMOVED Requirements

(无移除的需求)

---

**文档版本**: v1.0
**最后更新**: 2026-03-03
**规范**: OpenSpec v1.0
