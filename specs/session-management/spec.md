# Session Management Specification

## Purpose
会话管理模块负责管理 Craft Agents 应用中的所有会话（对话）生命周期。该模块提供了完整的会话创建、浏览、组织、搜索、分享和删除功能。会话是用户与 AI 助手交互的核心单元，每个会话都属于某个工作区，包含消息历史、配置选项和状态标记。用户可以通过会话列表浏览所有对话，使用各种过滤器和标签管理会话，并支持多会话批量操作。

## Requirements

### Requirement: 会话创建
系统 SHALL 提供在工作区中创建新会话的功能。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx

#### Scenario: 创建基础会话
- **WHEN** 用户在会话列表中点击"New Session"按钮
- **THEN** 系统 SHALL 创建一个新会话，使用工作区的默认配置（权限模式、工作目录、模型、思考级别等）
- **THEN** 系统 SHALL 将新会话标记为活动会话
- **THEN** 用户 SHALL 能够立即开始与新会话交互

#### Scenario: 创建带自定义配置的会话
- **WHEN** 用户从特定视图（如某个状态或标签）创建会话
- **THEN** 系统 SHALL 使用该视图的状态或标签作为新会话的初始配置
- **THEN** 系统 SHALL 将自定义配置持久化存储

#### Scenario: 创建隐藏会话
- **WHEN** 系统需要创建内部使用的小编辑会话（如 EditPopover）
- **THEN** 系统 SHALL 支持创建带 `hidden=true` 标记的会话
- **THEN** 隐藏会话 SHALL 不会显示在会话列表中
> 来源: apps/electron/src/renderer/atoms/sessions.ts

---

### Requirement: 会话列表浏览
系统 SHALL 提供可视化的会话列表，按时间分组显示所有会话。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx, apps/electron/src/renderer/utils/session.ts

#### Scenario: 显示分组会话
- **WHEN** 用户查看会话列表
- **THEN** 系统 SHALL 按"Today"、"Yesterday"和具体日期（如"Dec 19"或"2024年12月19日"）分组显示会话
- **THEN** 每个日期分组 SHALL 按时间倒序排列会话

#### Scenario: 会话列表分页加载
- **WHEN** 会话数量较多（超过20个）
- **THEN** 系统 SHALL 初始显示前20个会话
- **THEN** 系统 SHALL 在用户滚动时自动加载更多会话（每批20个）

#### Scenario: 会话信息显示
- **WHEN** 会话显示在列表中
- **THEN** 系统 SHALL 显示会话标题（优先显示用户自定义名称，否则使用第一条用户消息内容，或"New chat"）
- **THEN** 系统 SHALL 显示相对时间（如"7m"、"2h"、"3d"、"2w"）
- **THEN** 系统 SHALL 显示会话状态标记（Flag、归档、未读等）

---

### Requirement: 会话搜索
系统 SHALL 提供会话搜索功能，支持模糊匹配和智能过滤。
> 来源: apps/electron/src/renderer/components/app-shell/SessionSearchHeader.tsx, apps/electron/src/renderer/components/app-shell/SessionList.tsx

#### Scenario: 执行会话搜索
- **WHEN** 用户在搜索框输入关键词（2个字符以上）
- **THEN** 系统 SHALL 在会话标题和消息内容中搜索匹配项
- **THEN** 系统 SHALL 使用 ripgrep 进行内容搜索
- **THEN** 系统 SHALL 使用模糊匹配算法显示最相关的会话（最多100个结果）

#### Scenario: 搜索结果分层显示
- **WHEN** 搜索返回结果且当前有活动过滤器
- **THEN** 系统 SHALL 将结果分为"In Current View"和"Other Conversations"两部分
- **THEN** 系统 SHALL 突出显示匹配的文本内容

#### Scenario: 清除搜索
- **WHEN** 用户点击关闭按钮
- **THEN** 系统 SHALL 关闭搜索模式并恢复显示之前的过滤列表
- **THEN** 活动的高亮标记 SHALL 被清除

#### Scenario: 搜索状态显示
- **WHEN** 搜索执行过程中
- **THEN** 系统 SHALL 显示"Loading…"状态提示
- **WHEN** 搜索完成
- **THEN** 系统 SHALL 显示搜索结果数量（如"15 results"或"100+ results"）

---

### Requirement: 会话过滤
系统 SHALL 提供多种过滤器来帮助用户快速定位特定会话。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx, apps/electron/src/contexts/NavigationContext.tsx

#### Scenario: 按Flag过滤
- **WHEN** 用户选择"Flagged"过滤器
- **THEN** 系统 SHALL 仅显示带有 `isFlagged=true` 标记的会话
- **THEN** 归档会话 SHALL 不包含在 Flagged 视图中

#### Scenario: 按Todo状态过滤
- **WHEN** 用户选择特定Todo状态（如"In Progress"、"Done"）
- **THEN** 系统 SHALL 仅显示该状态的会话
- **THEN** 状态图标 SHALL 使用对应颜色显示

#### Scenario: 按标签过滤
- **WHEN** 用户选择特定标签（如"bug"、"priority::3"）
- **THEN** 系统 SHALL 仅显示带有该标签的会话
- **THEN** 系统 SHALL 支持标签值的精确匹配

#### Scenario: 按视图过滤
- **WHEN** 用户选择自定义视图
- **THEN** 系统 SHALL 仅显示匹配视图配置的会话
- **THEN** 系统 SHALL 支持视图的布尔逻辑组合（AND/OR/NOT）

#### Scenario: 按归档状态过滤
- **WHEN** 用户选择"Archived"过滤器
- **THEN** 系统 SHALL 仅显示已被归档的会话

#### Scenario: 组合过滤
- **WHEN** 用户同时应用次级过滤器（状态芯片、标签芯片）
- **THEN** 系统 SHALL 过滤显示同时满足主过滤器和次级过滤器的会话

---

### Requirement: 会话选择与导航
系统 SHALL 提供灵活的会话选择机制，支持单选和多选操作。
> 来源: apps/electron/src/renderer/hooks/useSession.ts, apps/electron/src/renderer/components/app-shell/SessionList.tsx

#### Scenario: 单选会话
- **WHEN** 用户点击会话列表中的某一个会话
- **THEN** 系统 SHALL 将该会话设置为活动会话
- **THEN** 系统 SHALL 在右侧面板显示会话详情

#### Scenario: 多选会话（Cmd/Ctrl+Click）
- **WHEN** 用户按住Cmd或Ctrl键点击多个会话
- **THEN** 系统 SHALL 将所有点击的会话添加到选择集合
- **THEN** 系统 SHALL 在每个选定项上显示复选标记

#### Scenario: 范围选择（Shift+Click）
- **WHEN** 用户按住Shift键点击另一个会话
- **THEN** 系统 SHALL 选择从当前活动会话到目标会话之间的所有会话
- **THEN** 系统 SHALL 使用锚点（anchor）和目标索引确定选择范围

#### Scenario: 全选会话
- **WHEN** 用户在会话列表焦点区域使用Cmd+A全选快捷键
- **THEN** 系统 SHALL 选择当前列表中的所有可见会话

#### Scenario: 取消多选
- **WHEN** 用户在多选模式下点击单个会话或按ESC键
- **THEN** 系统 SHALL 清除多选状态，仅保留该会话为活动会话

#### Scenario: 键盘导航
- **WHEN** 用户在会话列表区域使用上下箭头键
- **THEN** 系统 SHALL 移动焦点到上一个/下一个会话
- **WHEN** 用户在会话列表区域使用左箭头键
- **THEN** 系统 SHALL 将焦点移动到侧边栏（sidebar）
- **WHEN** 用户在会话列表区域使用右箭头键
- **THEN** 系统 SHALL 将焦点移动到聊天区域（chat）
- **WHEN** 用户按Enter在会话列表
- **THEN** 系统 SHALL 焦点到聊天输入框

---

### Requirement: 会话删除
系统 SHALL 提供会话删除功能，支持单个删除和级联删除。
> 来源: apps/electron/src/renderer/components/app-shell/SessionMenu.tsx, apps/electron/src/renderer/components/app-shell/SessionList.tsx

#### Scenario: 删除单个会话
- **WHEN** 用户选择会话菜单中的"Delete"选项
- **THEN** 系统 SHALL 请求用户确认删除操作
- **THEN** 系统 SHALL 删除会话及其所有消息数据
- **THEN** 系统 SHALL 从存储中移除会话文件夹
- **THEN** 系统 SHALL 从列表中移除该会话
- **THEN** 系统 SHALL 显示"Session deleted"提示

#### Scenario: 级联删除会话家族
- **WHEN** 用户删除一个有子会话的父会话
- **THEN** 系统 SHALL 删除父会话及其所有子会话
- **THEN** 系统 SHALL 返回删除的会话总数

#### Scenario: 批量删除会话
- **WHEN** 用户选中多个会话并触发删除操作
- **THEN** 系统 SHALL 批量删除所有选定会话
- **THEN** 系统 SHALL 在删除完成后更新会话列表

---

### Requirement: 会话重命名
系统 SHALL 提供会话重命名功能，支持手动输入和AI自动生成。
> 来源: apps/electron/src/renderer/components/app-shell/SessionMenu.tsx, apps/electron/src/renderer/components/app-shell/SessionList.tsx, apps/electron/src/renderer/utils/session.ts

#### Scenario: 手动重命名
- **WHEN** 用户从会话菜单选择"Rename"或点击标题
- **THEN** 系统 SHALL 打开重命名对话框
- **THEN** 系统 SHALL 预填充当前会话标题
- **WHEN** 用户输入新名称并提交
- **THEN** 系统 SHALL 更新会话的 `name` 字段并持久化
- **THEN** 系统 SHALL 在所有窗口同步更新标题显示

#### Scenario: AI自动生成标题
- **WHEN** 用户从菜单选择"Regenerate Title"
- **THEN** 系统 SHALL 分析最近的用户消息
- **THEN** 系统 SHALL 使用AI模型生成简洁的会话标题
- **THEN** 系统 SHALL 显示闪烁效果（shimmer）表示正在生成
- **THEN** 系统 SHALL 设置 `isAsyncOperationOngoing` 为 true
- **THEN** 系统 SHALL 在生成完成后更新标题并显示"Title refreshed"提示

#### Scenario: 标题回退逻辑
- **WHEN** 系统显示会话标题
- **THEN** 系统 SHALL 按"用户自定义名称 > 第一条用户消息 > preview字段 > 'New chat'"的优先级选择显示

---

### Requirement: 会话状态管理
系统 SHALL 提供多种状态标记来帮助用户组织和管理会话。
> 来源: apps/electron/src/renderer/components/app-shell/SessionMenu.tsx, apps/electron/src/renderer/components/app-shell/SessionList.tsx, apps/electron/src/renderer/event-processor/handlers/session.ts

#### Scenario: Flag标记会话
- **WHEN** 用户点击"Flag"按钮或菜单项
- **THEN** 系统 SHALL 将 `isFlagged` 设置为 `true`
- **THEN** 系统 SHALL 在会话列表中显示Flag图标
- **THEN** 系统 SHALL 同步更新到所有窗口
- **THEN** 系统 SHALL 显示"Session flagged"提示

#### Scenario: 取消Flag标记
- **WHEN** Flag会话的用户点击"Unflag"
- **THEN** 系统 SHALL 将 `isFlagged` 设置为 `false`
- **THEN** 系统 SHALL 移除Flag图标显示

#### Scenario: 归档会话
- **WHEN** 用户点击"Archive"菜单项
- **THEN** 系统 SHALL 将 `isArchived` 设置为 `true`
- **THEN** 系统 SHALL 记录归档时间戳 `archivedAt`
- **THEN** 系统 SHALL 将会话从默认列表中移除
- **THEN** 系统 SHALL 通过"Archived"过滤器可以重新查看
- **THEN** 系统 SHALL 显示"Session archived"提示和"Undo"选项

#### Scenario: 取消归档
- **WHEN** 用户在归档列表中点击"Unarchive"或使用"Undo"
- **THEN** 系统 SHALL 将 `isArchived` 设置为 `false`
- **THEN** 系统 SHALL 清除 `archivedAt` 时间戳
- **THEN** 系统 SHALL 将会话恢复到默认列表中
- **THEN** 系统 SHALL 显示"Session restored"提示

#### Scenario: 修改Todo状态
- **WHEN** 用户从状态下拉菜单或"Status"子菜单中选择状态
- **THEN** 系统 SHALL 更新 `todoState` 字段为所选状态值
- **THEN** 系统 SHALL 在列表中显示对应的状态图标和颜色

---

### Requirement: 标签系统
系统 SHALL 提供灵活的标签系统，支持层级结构和标签值。
> 来源: apps/electron/src/renderer/components/app-shell/SessionMenu.tsx, apps/electron/src/renderer/components/app-shell/SessionMenuParts.tsx

#### Scenario: 添加标签
- **WHEN** 用户从"Labels"子菜单选择标签
- **THEN** 系统 SHALL 将标签ID添加到会话的 `labels` 数组中
- **THEN** 系统 SHALL 在会话列表显示标签徽章
- **THEN** 系统 SHALL 会话菜单中显示标签数量

#### Scenario: 移除标签
- **WHEN** 用户在标签值弹窗中点击移除标签
- **THEN** 系统 SHALL 从 `labels` 数组中移除该标签
- **THEN** 系统 SHALL 移除标签值关联的条目（处理 valued labels）

#### Scenario: 标签层级显示
- **WHEN** 标签配置包含子标签
- **THEN** 系统 SHALL 在子菜单中显示层级结构
- **THEN** 父菜单项 SHALL 显示子树中已应用的标签数量

#### Scenario: 标签值支持
- **WHEN** 标签支持值（如"priority::3"）
- **THEN** 系统 SHALL 支持完整的"标签ID::值"格式
- **THEN** 系统 SHALL 支持修改标签值并在徽章中显示
- **THEN** 系统 SHALL 使用 `extractLabelId` 提取标签ID进行匹配

---

### Requirement: 未读状态跟踪
系统 SHALL 跟踪会话的未读状态，帮助用户识别新消息。
> 来源: apps/electron/src/renderer/components/app-shell/SessionMenu.tsx, apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx, apps/electron/src/renderer/atoms/sessions.ts

#### Scenario: 显示未读标记
- **WHEN** 会话有未读消息（`hasUnread=true`）
- **THEN** 系统 SHALL 在会话列表中显示"NEW"徽章

#### Scenario: 清除未读标记
- **WHEN** 用户查看会话且窗口处于焦点状态
- **THEN** 系统 SHALL 设置 `hasUnread` 为 `false`

#### Scenario: 手动标记为未读
- **WHEN** 用户从菜单选择"Mark as Unread"
- **THEN** 系统 SHALL 将 `hasUnread` 设置为 `true`
- **THEN** 系统 SHALL 在会话列表中显示NEW标记

#### Scenario: 自动设置未读标记
- **WHEN** 辅助消息完成且用户不在查看该会话
- **THEN** 系统 SHALL 设置 `hasUnread` 为 `true`
- **THEN** 系统 SHALL 更新 `lastFinalMessageId` 标记最后消息位置

---

### Requirement: 会话分享
系统 SHALL 支持将会话分享到在线查看器。
> 来源: apps/electron/src/renderer/components/app-shell/SessionMenu.tsx

#### Scenario: 创建分享链接
- **WHEN** 用户点击"Share"按钮
- **THEN** 系统 SHALL 将会话上传到云端查看器服务
- **THEN** 系统 SHALL 生成可访问的分享URL
- **THEN** 系统 SHALL 设置 `sharedUrl` 和 `sharedId`
- **THEN** 系统 SHALL 复制URL到剪贴板并显示"Link copied to clipboard"提示
- **THEN** 系统 SHALL 设置 `isAsyncOperationOngoing` 为 true 显示闪烁效果

#### Scenario: 查看已分享的会话
- **WHEN** 会话已分享且用户查看"Shared"菜单
- **THEN** 系统 SHALL 显示子菜单项："Open in Browser"、"Copy Link"、"Update Share"、"Stop Sharing"

#### Scenario: 更新分享内容
- **WHEN** 会话有新消息后用户点击"Update Share"
- **THEN** 系统 SHALL 将最新的消息内容同步到云端查看器
- **THEN** 系统 SHALL 显示"Share updated"提示

#### Scenario: 停止分享
- **WHEN** 用户点击"Stop Sharing"
- **THEN** 系统 SHALL 向云端发送撤销分享请求
- **THEN** 系统 SHALL 清除本地的 `sharedUrl` 和 `sharedId` 字段
- **THEN** 系统 SHALL 移除共享图标显示
- **THEN** 系统 SHALL 显示"Sharing stopped"提示

#### Scenario: 在浏览器中打开
- **WHEN** 用户点击"Open in Browser"
- **THEN** 系统 SHALL 使用默认浏览器打开分享链接

#### Scenario: 复制分享链接
- **WHEN** 用户点击"Copy Link"
- **THEN** 系统 SHALL 将分享URL复制到剪贴板
- **THEN** 系统 SHALL 显示"Link copied to clipboard"提示

---

### Requirement: 会话文件操作
系统 SHALL 提供访问和管理会话磁盘存储的功能。
> 来源: apps/electron/src/renderer/components/app-shell/SessionMenu.tsx

#### Scenario: 在Finder/文件管理器中查看
- **WHEN** 用户点击"View in Finder"
- **THEN** 系统 SHALL 在系统文件管理器中打开会话文件夹
- **THEN** 用户 SHALL 能够查看和操作会话文件

#### Scenario: 复制会话路径
- **WHEN** 用户点击"Copy Path"
- **THEN** 系统 SHALL 将会话文件夹的绝对路径复制到剪贴板
- **THEN** 系统 SHALL 显示"Path copied to clipboard"提示

---

### Requirement: 会话在新窗口打开
系统 SHALL 支持在新窗口中打开会话。
> 来源: apps/electron/src/renderer/components/app-shell/SessionMenu.tsx

#### Scenario: 在新窗口中打开会话
- **WHEN** 用户点击"Open in New Window"
- **THEN** 系统 SHALL 在新的Electron窗口中打开会话
- **THEN** 新窗口 SHALL 加载相同的会话视图

---

### Requirement: 会话配置管理
系统 SHALL 支持会话级别的配置选项，用于控制AI行为。
> 来源: apps/electron/src/renderer/event-processor/handlers/session.ts

#### Scenario: 设置工作目录
- **WHEN** 用户在工作目录输入中选择路径
- **THEN** 系统 SHALL 更新会话的 `workingDirectory` 字段
- **THEN** 系统 SHALL 持久化配置并在后续消息中生效

#### Scenario: 更换LLM模型
- **WHEN** 用户从模型下拉菜单选择新模型
- **THEN** 系统 SHALL 更新会话的 `model` 字段
- **THEN** 系统 SHALL 持久化模型选择

#### Scenario: 权限模式变更
- **WHEN** 用户更换权限模式（safe/ask/allow-all）
- **THEN** 系统 SHALL 更新 `permissionMode` 字段
- **THEN** 系统 SHALL 影响后续工具调用的自动批准逻辑

---

### Requirement: 会话数据持久化
系统 SHALL 确保所有会话数据安全持久化。
> 来源: apps/electron/src/renderer/atoms/sessions.ts

#### Scenario: 自动保存会话
- **WHEN** 会话状态发生变化（如消息添加、配置更新）
- **THEN** 系统 SHALL 自动将会话数据写入磁盘
- **THEN** 系统 SHALL 使用队列批处理写入操作以优化性能

#### Scenario: 延迟加载消息
- **WHEN** 用户查看大量会话
- **THEN** 系统 SHALL 仅加载会话元数据（从JSONL头部）
- **THEN** 系统 SHALL 在用户打开会话时才加载完整消息历史

#### Scenario: 恢复未完成的会话
- **WHEN** 应用重启
- **THEN** 系统 SHALL 从磁盘加载所有保存的会话
- **THEN** 系统 SHALL 恢复会话的草稿输入内容

#### Scenario: 跨窗口同步
- **WHEN** 会话在主进程更新时
- **THEN** 系统 SHALL 通过IPC事件通知所有渲染进程窗口
- **THEN** 所有窗口 SHALL 同步更新会话状态

---

### Requirement: 性能优化
系统 SHALL 优化会话管理性能以处理大量会话。
> 来源: apps/electron/src/renderer/atoms/sessions.ts, apps/electron/src/renderer/components/app-shell/SessionList.tsx

#### Scenario: 懒加载会话列表
- **WHEN** 应用启动
- **THEN** 系统 SHALL 首先仅加载会话元数据（不包括消息）
- **THEN** 系统 SHALL 延迟加载消息直到用户打开会话

#### Scenario: 批量操作优化
- **WHEN** 用户执行批量操作（如删除多个会话）
- **THEN** 系统 SHALL 批量处理以提高效率
- **THEN** 系统 SHALL 在完成后统一更新UI

#### Scenario: 内存管理
- **WHEN** 切换工作区
- **THEN** 系统 SHALL 清理旧工作区的会话 atom family 条目
- **THEN** 系统 SHALL 避免内存泄漏

---

### Requirement: Token使用跟踪
系统 SHALL 跟踪会话的Token使用情况。
> 来源: apps/electron/src/renderer/event-processor/handlers/session.ts

#### Scenario: 实时Token使用更新
- **WHEN** 会话处理过程中发生 usage_update 事件
- **THEN** 系统 SHALL 更新会话的 tokenUsage 字段
- **THEN** 系统 SHALL 保留现有 outputTokens、costUsd 等字段

#### Scenario: 完成事件Token同步
- **WHEN** 会话处理完成（complete 事件）
- **THEN** 系统 SHALL 更新 tokenUsage 信息
- **THEN** 系统 SHALL 支持缓存统计（cacheReadTokens、cacheCreationTokens）
- **THEN** 系统 SHALL 支持上下文窗口大小（contextWindow）

---

### Requirement: 会话事件处理
系统 SHALL 处理会话生命周期中的各种事件。
> 来源: apps/electron/src/renderer/event-processor/handlers/session.ts

#### Scenario: 处理完成事件
- **WHEN** 收到 complete 事件
- **THEN** 系统 SHALL 设置 isProcessing 为 false
- **THEN** 系统 SHALL 清除流式状态
- **THEN** 系统 SHALL 标记任何运行中的工具为完成状态（安全保证）

#### Scenario: 处理错误事件
- **WHEN** 收到 error 事件
- **THEN** 系统 SHALL 设置 isProcessing 为 false
- **THEN** 系统 SHALL 标记运行中的工具为失败状态
- **THEN** 系统 SHALL 添加错误消息到会话

#### Scenario: 处理打断事件
- **WHEN** 收到 interrupted 事件
- **THEN** 系统 SHALL 设置 isProcessing 为 false
- **THEN** 系统 SHALL 清除流式状态（isPending、isStreaming）
- **THEN** 系统 SHALL 标记运行中的工具为中断状态
- **THEN** 系统 SHALL 过滤掉状态消息（transient UI state）

#### Scenario: 处理标题生成事件
- **WHEN** 收到 title_generated 事件
- **THEN** 系统 SHALL 更新会话名称
- **THEN** 系统 SHALL 清除重新生成状态

---

### Requirement: 空状态处理
系统 SHALL 为各种空状态提供友好的用户界面。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx

#### Scenario: 无会话时显示空状态
- **WHEN** 会话列表为空且不在搜索模式
- **THEN** 系统 SHALL 显示"No sessions yet"空状态
- **THEN** 系统 SHALL 提供创建新会话的按钮

#### Scenario: 归档视图中无会话
- **WHEN** 归档过滤器中无会话
- **THEN** 系统 SHALL 显示"No archived sessions"空状态
- **THEN** 系统 SHALL 显示说明文字解释归档功能

#### Scenario: 搜索无结果
- **WHEN** 搜索返回无结果
- **THEN** 系统 SHALL 显示"No sessions found"消息
- **THEN** 系统 SHALL 显示"Searched titles and message content"说明
- **THEN** 系统 SHALL 提供"Clear search"按钮

#### Scenario: 当前过滤下无结果
- **WHEN** 搜索在当前过滤视图下无结果但有其他结果
- **THEN** 系统 SHALL 显示"No results in current filter"消息
- **THEN** 系统 SHALL 在"Other Conversations"部分显示其他结果

---

### Requirement: 会话共享状态处理
系统 SHALL 正确处理会话共享相关的状态变化。
> 来源: apps/electron/src/renderer/event-processor/handlers/session.ts

#### Scenario: 处理会话共享事件
- **WHEN** 收到 session_shared 事件
- **THEN** 系统 SHALL 设置 sharedUrl 字段
- **THEN** 系统 SHALL 显示共享图标

#### Scenario: 处理会话取消共享事件
- **WHEN** 收到 session_unshared 事件
- **THEN** 系统 SHALL 清除 sharedUrl 和 sharedId 字段
- **THEN** 系统 SHALL 移除共享图标

---

### Requirement: 异步操作状态跟踪
系统 SHALL 跟踪会话的异步操作状态。
> 来源: apps/electron/src/renderer/event-processor/handlers/session.ts

#### Scenario: 异步操作开始
- **WHEN** 会话执行异步操作（分享、更新分享、撤销分享、标题重新生成）
- **THEN** 系统 SHALL 设置 isAsyncOperationOngoing 为 true
- **THEN** 系统 SHALL 在会话标题显示闪烁效果

#### Scenario: 异步操作结束
- **WHEN** 异步操作完成
- **THEN** 系统 SHALL 设置 isAsyncOperationOngoing 为 false
- **THEN** 系统 SHALL 移除闪烁效果

---

### Requirement: 右键上下文菜单
系统 SHALL 为会话提供右键上下文菜单快捷操作。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx

#### Scenario: 显示上下文菜单
- **WHEN** 用户右键点击会话
- **THEN** 系统 SHALL 显示会话操作上下文菜单
- **THEN** 上下文菜单 SHALL 包含与会话下拉菜单相同的操作选项
- **THEN** 上下文菜单 SHALL 在鼠标位置附近显示

---

### Requirement: 会话元数据面板
系统 SHALL 提供会话元数据的查看和编辑功能。
> 来源: apps/electron/src/renderer/components/right-sidebar/SessionMetadataPanel.tsx

#### Scenario: 显示会话元数据
- **WHEN** 用户在右侧边栏查看会话信息
- **THEN** 系统 SHALL 显示会话的基本信息（ID、创建时间、最后更新时间）
- **THEN** 系统 SHALL 显示会话配置（工作目录、模型、权限模式等）
- **THEN** 系统 SHALL 显示Token使用统计

#### Scenario: 编辑会话配置
- **WHEN** 用户在元数据面板中修改配置
- **THEN** 系统 SHALL 更新会话的相应字段
- **THEN** 系统 SHALL 持久化配置变更

---

### Requirement: 会话文件树显示
系统 SHALL 提供会话文件的文件树展示和管理功能。
> 来源: apps/electron/src/renderer/components/right-sidebar/SessionFilesSection.tsx

#### Scenario: 显示会话文件树
- **WHEN** 用户在右侧边栏查看会话文件
- **THEN** 系统 SHALL 以递归树结构显示会话目录中的所有文件和文件夹
- **THEN** 系统 SHALL 为不同文件类型显示对应图标
- **THEN** 系统 SHALL 支持用户展开/折叠文件夹

#### Scenario: 从文件树打开文件
- **WHEN** 用户点击文件树中的文件
- **THEN** 系统 SHALL 尝试在应用内预览文件（支持的格式）
- **THEN** 系统 SHALL 对于不支持预览的文件，在系统默认应用中打开

---

### Requirement: 计划消息标记显示
系统 SHALL 在会话列表中显示计划消息标记。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx:593-597

#### Scenario: 显示计划徽章
- **WHEN** 会话的最后一条消息角色是 `plan`
- **THEN** 系统 SHALL 在徽章区显示"Plan"徽章
- **THEN** 计划徽章 SHALL 使用绿色背景（`bg-success/10 text-success`）
- **THEN** 计划徽章 SHALL 固定显示在徽章列表中

---

### Requirement: 徽章横向滚动
系统 SHALL 支持会话徽章的横向滚动以处理过多徽章的情况。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx:582-586

#### Scenario: 徽章过多时横向滚动
- **WHEN** 会话徽章数量超过可用显示空间
- **THEN** 系统 SHALL 启用横向滚动
- **THEN** 系统 SHALL 隐藏滚动条（`scrollbar-hide`）
- **THEN** 系统 SHALL 在右侧边缘显示渐变遮罩提示有更多内容
- **THEN** 时间戳 SHALL 保持固定位置不受滚动影响

---

### Requirement: 会话搜索匹配高亮
系统 SHALL 在搜索结果中高亮显示匹配的文本。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx:567

#### Scenario: 高亮匹配文本
- **WHEN** 用户输入搜索关键词
- **THEN** 系统 SHALL 在会话标题中高亮显示匹配的部分
- **THEN** 高亮 SHALL 使用黄色背景标记
- **THEN** 系统 SHALL 对每个搜索结果应用高亮效果

---

### Requirement: 搜索匹配计数
系统 SHALL 显示每个会话中搜索匹配的数量。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx:750-764

#### Scenario: 显示匹配计数
- **WHEN** 搜索模式激活且会话有匹配项
- **THEN** 系统 SHALL 在会话项右侧显示匹配数量徽章
- **THEN** 选中会话的匹配徽章 SHALL 使用更亮的背景色
- **THEN** 匹配徽章 SHALL 显示具体匹配次数数值
- **THEN** 匹配徽章 SHALL 显示快捷键导航提示（"next prev"）

#### Scenario: 隐藏操作按钮
- **WHEN** 搜索匹配计数徽章显示时
- **THEN** 系统 SHALL 隐藏"更多"操作按钮
- **THEN** 用户 SHALL 无法在搜索结果中直接操作会话菜单

---

### Requirement: 多选批量操作
系统 SHALL 提供多选会话时的批量操作功能。
> 来源: apps/electron/src/renderer/components/app-shell/MultiSelectPanel.tsx

#### Scenario: 显示多选面板
- **WHEN** 用户选中多个会话
- **THEN** 系统 SHALL 显示多选面板（MultiSelectPanel）
- **THEN** 系统 SHALL 显示选中会话数量
- **THEN** 系统 SHALL 提供批量操作按钮

#### Scenario: 批量更改状态
- **WHEN** 用户在多选面板点击"Change Status"
- **THEN** 系统 SHALL 显示状态下拉菜单
- **WHEN** 用户选择特定状态
- **THEN** 系统 SHALL 将所有选中会话的状态更新为所选状态

#### Scenario: 批量设置标签
- **WHEN** 用户在多选面板点击"Set Labels"
- **THEN** 系统 SHALL 显示标签下拉菜单
- **WHEN** 用户选择或取消选择标签
- **THEN** 系统 SHALL 更新所有选中会话的标签

#### Scenario: 批量归档
- **WHEN** 用户在多选面板点击"Archive"
- **THEN** 系统 SHALL 将所有选中会话归档
- **THEN** 系统 SHALL 从当前列表中移除这些会话

#### Scenario: 显示选择提示
- **WHEN** 多选面板显示时
- **THEN** 系统 SHALL 显示选择操作提示
- **THEN** 提示 SHALL 支持 Command/Control+Click 进行切换选择
- **THEN** 提示 SHALL 支持 Shift+Click 进行范围选择
- **THEN** 提示 SHALL 支持 Esc 清除选择

---

### Requirement: 标签值编辑
系统 SHALL 支持在会话列表中直接编辑标签值。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx:617-677

#### Scenario: 打开标签值编辑器
- **WHEN** 用户点击徽章区域的标签项
- **THEN** 系统 SHALL 打开 LabelValuePopover
- **THEN** 弹窗 SHALL 显示当前标签值（如果有值）

#### Scenario: 修改标签值
- **WHEN** 用户在编辑器中输入新值
- **THEN** 系统 SHALL 更新标签条目为新值（格式：`标签ID::值`）
- **THEN** 系统 SHALL 持久化更改
- **THEN** 会话列表徽章 SHALL 显示更新后的值

#### Scenario: 移除标签
- **WHEN** 用户在编辑器中点击移除
- **THEN** 系统 SHALL 从会话标签数组中移除该标签
- **THEN** 系统 SHALL 移除对应的标签值条目
- **THEN** 会话列表徽章 SHALL 被移除

---

### Requirement: 权限模式徽章显示
系统 SHALL 在会话列表中显示权限模式徽章。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx:598-609

#### Scenario: 显示权限模式徽章
- **WHEN** 会话设置了权限模式
- **THEN** 系统 SHALL 在徽章区显示权限模式徽章
- **THEN** safe 模式 SHALL 使用灰色背景（`bg-foreground/5`）
- **THEN** ask 模式 SHALL 使用蓝色背景（`bg-info/10 text-info`）
- **THEN** allow-all 模式 SHALL 使用强调色背景（`bg-accent/10 text-accent`）
- **THEN** 徽章 SHALL 显示权限模式的简短名称

---

### Requirement: 标签值类型图标
系统 SHALL 为带值类型的标签显示类型图标。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx:669-675

#### Scenario: 显示类型图标
- **WHEN** 标签定义了值类型但用户未设置具体值
- **THEN** 系统 SHALL 在标签徽章中显示类型图标
- **THEN** 图标 SHALL 位于标签名称和间隔符之间
- **THEN** 图标 SHALL 对应标签的值类型（如数字、日期等）

---

### Requirement: 异步操作视觉反馈
系统 SHALL 为会话的异步操作提供视觉反馈。
> 来源: apps/electron/src/renderer/components/app-shell/SessionList.tsx:563-566

#### Scenario: 异步操作时标题闪烁
- **WHEN** 会话正在执行异步操作（分享、更新分享、撤销分享、标题重新生成）
- **THEN** 系统 SHALL 将 `isAsyncOperationOngoing` 设置为 true
- **THEN** 会话标题 SHALL 显示闪烁/shimmer 动画效果（`animate-shimmer-text`）
- **THEN** 闪烁 SHALL 在异步操作完成后停止

---

### Requirement: 刷新会话标题
系统 SHALL 支持使用 AI 刷新会话标题。
> 来源: apps/electron/src/renderer/components/app-shell/SessionMenu.tsx:174-181

#### Scenario: AI 刷新标题
- **WHEN** 用户从菜单选择"Regenerate Title"
- **THEN** 系统 SHALL 分析最近的用户消息
- **THEN** 系统 SHALL 使用 AI 模型生成新的会话标题
- **THEN** 系统 SHALL 显示"Title refreshed"成功提示和生成的标题
- **WHEN** 标题生成失败
- **THEN** 系统 SHALL 显示"Failed to refresh title"错误提示

---

## MODIFIED Requirements

初版整理，暂无。

## REMOVED Requirements

初版整理，暂无。
