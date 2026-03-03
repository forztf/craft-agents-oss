# AI交互与聊天模块需求规格文档

## 文档信息

| 属性 | 值 |
|------|-----|
| 模块名称 | AI交互与聊天 |
| 文档版本 | 1.0 |
| 创建日期 | 2026-03-03 |
| 需求规格 | EARS格式 |

---

## 1. 执行摘要

AI交互与聊天模块是用户与AI进行对话交互的核心界面。该模块负责消息显示、用户输入、实时响应预览、工具执行可视化、以及复杂的搜索和导航功能。支持富文本输入、文件附件、@提及技能、#标签、结构化输入（权限请求、凭证请求）等多种交互方式。

### 核心功能点
- 多轮对话历史显示与自动滚动
- 实时流式响应预览（StreamingMarkdown）
- 工具执行活动可视化（TurnCard）
- 结构化输入处理（权限/凭证请求）
- 富文本输入支持（@技能、#标签、斜杠命令）
- 搜索高亮与导航
- 会话连接状态管理

---

## 2. 架构概览

### 2.1 模块边界

```
┌─────────────────────────────────────────────────────────────┐
│                    AI交互与聊天模块                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ChatDisplay  │←→│ TurnCard     │←→│ UserMessage  │      │
│  │   (主容器)   │  │ (助手回复)    │  │    Bubble    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↑                   ↑                               │
│         │                   ↓                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │InputContainer│←→│FreeFormInput │                        │
│  │(输入容器)    │  │(富文本输入)   │                        │
│  └──────────────┘  └──────────────┘                        │
│         ↑                                                   │
│         ↓                                                   │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │StructuredInput│ │Permission/Credential Requests      │  │
│  │(结构化输入)   │ │(权限/凭证请求)                        │  │
│  └──────────────┘  └──────────────┘                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 外部接口                                                   │
│ - onSendMessage(msg, attachments, skills): 发送消息         │
│ - onStop(): 停止当前响应                                    │
│ - onModelChange(model, connection): 切换模型                │
│ - onRespondToPermission(sessionId, requestId, allowed, alwaysAllow): 响应权限 |
│ - onOpenFile(path): 打开文件                                │
│ - onOpenUrl(url): 打开URL                                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 关键组件

| 组件 | 职责 | 位置 |
|------|------|------|
| `ChatDisplay` | 主聊天容器，管理消息列表、输入区域、滚动和搜索 | `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx` |
| `TurnCard` | 助手响应卡片，包含活动列表、工具执行状态、markdown内容 | `packages/ui/src/components/chat/TurnCard.tsx` |
| `UserMessageBubble` | 用户消息气泡显示 | `packages/ui/src/components/chat/UserMessageBubble.tsx` |
| `FreeFormInput` | 富文本输入组件，支持@提及、#标签、附件 | `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx` |
| `StructuredInput` | 结构化输入路由（权限请求、凭证请求） | `apps/electron/src/renderer/components/app-shell/input/StructuredInput.tsx` |
| `PermissionRequest` | 权限请求UI | `apps/electron/src/renderer/components/app-shell/input/structured/PermissionRequest.tsx` |
| `CredentialRequest` | 凭证请求UI | `apps/electron/src/renderer/components/app-shell/input/structured/CredentialRequest.tsx` |
| `StreamingMarkdown` | 流式markdown渲染组件 | `apps/electron/src/renderer/components/markdown/StreamingMarkdown.tsx` |

---

## 3. 需求规格

### 3.1 消息显示

#### Requirement: 消息列表与轮次分组
- 系统 SHALL 将消息按照对话轮次（Turn）分组显示
- 系统 SHALL 每个用户消息与其后的助手响应组成一个Turn
- 系统 SHALL 区分不同类型的Turn：用户（user）、助手（assistant）、系统（system）、授权请求（auth_request）
- 系统 SHALL 支持反向分页，初始显示最后N轮对话，向上滚动加载更多

#### Requirement: 消息渲染
- 系统 SHALL 将用户消息显示在右侧的消息气泡中
- 系统 SHALL 将助手响应显示在左侧的TurnCard中
- 系统 SHALL 支持markdown格式的内容渲染
- 系统 SHALL 在消息气泡中显示文件附件预览

#### Scenario: 用户发送消息并接收响应
- WHEN 用户发送一条消息
- THEN 系统 SHALL 在消息列表底部显示用户消息气泡
- WHEN 助手开始响应
- THEN 系统 SHALL 显示新的TurnCard并开始流式渲染响应内容

#### Scenario: 向上滚动加载历史消息
- WHEN 用户滚动到消息列表顶部
- THEN 系统 SHALL 从缓存或服务器加载更多历史轮次
- THEN 系统 SHALL 将新消息插入到当前显示的顶部

---

### 3.2 实时响应预览

#### Requirement: 流式响应渲染
- 系统 SHALL 使用StreamingMarkdown组件实现流式响应渲染
- 系统 SHALL 在响应过程中实时显示处理中的内容
- 系统 SHALL 当响应完成时完成markdown渲染
- 系统 SHALL 显示处理状态指示器（ProcessingIndicator）

#### Requirement: 处理状态显示
- 系统 SHALL 在助手响应过程中显示旋转的加载指示器
- 系统 SHALL 显示循环变化的处理提示文本（如"Thinking..."、"Pondering..."等）
- 系统 SHALL 显示已处理时间（格式：秒数<60显示"45s"，>=60显示"1:02"）
- 系统 SHALL 当有特定操作时显示状态消息覆盖默认循环文本

#### Scenario: 助手响应中
- WHEN 助手正在生成响应
- THEN 系统 SHALL 显示旋转的加载图标
- THEN 系统 SHALL 循环显示随机的处理提示文本
- THEN 系统 SHALL 每秒更新显示的已处理时间

#### Scenario: 执行特定操作中
- WHEN 助手执行特定任务（如"Compacting..."）
- THEN 系统 SHALL 显示当前操作状态而不是循环提示文本
- THEN 系统 SHALL 保持时间显示更新

---

### 3.3 工具执行可视化

#### Requirement: 活动列表显示
- 系统 SHALL 在TurnCard中显示工具执行活动列表
- 系统 SHALL 区分活动状态：pending（待处理）、running（运行中）、completed（完成）、error（错误）、backgrounded（后台）
- 系统 SHALL 支持活动的父子嵌套关系（Task子agent）
- 系统 SHALL 显示活动的工具名称和简短描述

#### Requirement: 活动状态图标
- 系统 SHALL 为不同活动状态显示对应的图标：
  - running: 旋转的spinner
  - completed: CheckCircle2
  - error: XCircle
  - pending: Circle
- 系统 SHALL 显示活动的执行时长和token统计（如"45s · 12k tokens"）

#### Scenario: 工具开始执行
- WHEN 助手调用工具
- THEN 系统 SHALL 在活动列表中添加新活动项
- THEN 系统 SHALL 显示工具名称和运行状态图标

#### Scenario: 工具执行完成
- WHEN 工具执行成功
- THEN 系统 SHALL 更新活动状态为completed
- THEN 系统 SHALL 显示完成图标和执行统计

#### Scenario: 工具执行失败
- WHEN 工具执行失败
- THEN 系统 SHALL 更新活动状态为error
- THEN 系统 SHALL 显示错误图标和错误消息

---

### 3.4 TurnCard交互

#### Requirement: TurnCard展开与折叠
- 系统 SHALL 允许用户展开或折叠TurnCard
- 系统 SHALL 将展开状态持久化到localStorage
- 系统 SHALL 在会话切换后恢复用户设置的展开状态
- 系统 SHALL 自动展开最新接收的TurnCard

#### Requirement: TurnCard操作菜单
- 系统 SHALL 为每个TurnCard提供操作菜单（TurnCardActionsMenu）
- 系统 SHALL 支持复制响应内容
- 系统 SHALL 支持在新窗口中打开完整响应
- 系统 SHALL 支持重新生成响应（如果会话未锁定连接）

#### Scenario: 用户展开TurnCard
- WHEN 用户点击TurnCard的展开/折叠控制
- THEN 系统 SHALL 切换TurnCard的展开状态
- THEN 系统 SHALL 保存新状态到localStorage

#### Scenario: 用户使用操作菜单
- WHEN 用户点击TurnCard的操作菜单按钮
- THEN 系统 SHALL 显示菜单选项
- WHEN 用户选择"复制"
- THEN 系统 SHALL 将TurnCard内容复制到剪贴板

---

### 3.5 用户输入

#### Requirement: 富文本输入组件
- 系统 SHALL 提供支持富文本格式化的输入区域
- 系统 SHALL 支持换行、删除等基本编辑操作
- 系统 SHALL 自动调整输入区高度适应内容
- 系统 SHALL 显示占位符文本（支持轮播多个提示）

#### Requirement: 输入类型增强
- 系统 SHALL 支持@提及技能（InlineMentionMenu）
- 系统 SHALL 支持#标签（InlineLabelMenu）
- 系统 SHALL 支持/斜杠命令（InlineSlashCommandMenu）
- 系统 SHALL 支持文件附件（通过拖放或点击上传）

#### Requirement: 输入模式切换
- 系统 SHALL 根据状态切换输入模式（freeform / structured）
- 系统 SHALL 在结构化输入时显示专用UI
- 系列 SHALL 在模式切换时保持输入值

#### Scenario: 用户输入@提及
- WHEN 用户在输入区域输入@符号
- THEN 系统 SHALL 显示可用技能列表
- WHEN 用户继续输入过滤文本
- THEN 系统 SHALL 过滤并显示匹配的技能
- WHEN 用户选择技能
- THEN 系统 SHALL 在输入中插入@skill语法

#### Scenario: 用户上传附件
- WHEN 用户拖放文件到输入区域
- THEN 系统 SHALL 显示附件预览
- THEN 系统 SHALL 将附件信息添加到待发送数据

---

### 3.6 结构化输入

#### Requirement: 权限请求处理
- 系统 SHALL 当工具需要用户批准时显示PermissionRequest界面
- 系统 SHALL 显示请求的工具名称和描述
- 系统 SHALL 显示待执行的命令预览（如果可用）
- 系统 SHALL 提供Allow、Always Allow、Deny按钮

#### Requirement: 凭证请求处理
- 系统 SHALL 当操作需要认证凭证时显示CredentialRequest界面
- 系统 SHALL 支持多种认证模式：bearer、basic、header、multi-header
- 系统 SHALL 为basic auth提供用户名和密码输入
- 系统 SHALL 提供显示/隐藏密码功能
- 系统 SHALL 验证输入有效性后才能提交

#### Scenario: Bash工具需要权限
- WHEN Bash工具执行需要用户批准
- THEN 系统 SHALL 显示PermissionRequest界面
- THEN 系统 SHALL 显示工具名称"Bash"
- THEN 系统 SHALL 显示要执行的命令
- WHEN 用户点击Allow
- THEN 系统 SHALL 发送允许响应并继续执行

#### Scenario: 操作需要HTTP认证
- WHEN HTTP操作需要认证凭证
- THEN 系统 SHALL 显示CredentialRequest界面
- WHEN认证模式为basic
- THEN 系统 SHALL 显示用户名和密码输入框
- WHEN 用户填写凭证并提交
- THEN 系统 SHALL 使用凭证继续操作

---

### 3.7 搜索与导航

#### Requirement: 搜索高亮
- 系统 SHALL 支持在聊天记录中搜索文本
- 系统 SHALL 高亮显示所有匹配的文本
- 系统 SHALL 计算并显示匹配数量
- 系统 SHALL 自动展开包含匹配内容的轮次

#### Requirement: 搜索导航
- 系统 SHALL 支持在匹配项之间导航（上一项/下一项）
- 系统 SHALL 当前匹配项高亮显示
- 系统 SHALL 滚动到当前匹配位置
- 系统 SHALL 显示当前匹配索引（如"3/15"）

#### Scenario: 用户搜索文本
- WHEN 用户在搜索框输入搜索查询
- THEN 系统 SHALL 扫描所有消息内容
- THEN 系统 SHALL 高亮显示所有匹配项
- THEN 系统 SHALL 显示匹配总数
- WHEN 只有一个匹配项
- THEN 系统 SHALL 自动滚动到匹配位置

#### Scenario: 用户导航搜索结果
- WHEN 用户点击"下一项"按钮
- THEN 系统 SHALL 移动到下一个匹配项
- THEN 系统 SHALL 滚动到新匹配位置
- THEN 系统 SHALL 更新当前匹配索引显示

---

### 3.8 发送与停止

#### Requirement: 发送消息
- 系统 SHALL 当用户按Enter键发送消息
- 系统 SHALL 当用户按Shift+Enter键插入换行
- 系统 SHALL 将输入内容、附件和@提及技能一起发送
- 系统 SHALL 发送后清空输入区域

#### Requirement: 停止响应
- 系统 SHALL 当用户按Escape键或点击停止按钮时停止当前响应
- 系统 SHALL 在停止时显示"Response interrupted"消息（默认）
- 系统 SHALL 支持静默停止（silent=true）不显示消息
- 系统 SHALL 停止后允许用户发送新消息

#### Requirement: 追加输入继续对话
- 系统 SHALL 当用户在处理过程中输入新内容时停止当前响应
- 系统 SHALL 追加新用户消息到会话
- 系统 SHALL 使用新用户输入继续对话

#### Scenario: 用户发送消息
- WHEN 用户在输入区域输入消息并按Enter
- THEN 系统 SHALL 将消息发送到后台
- THEN 系统 SHALL 清空输入区域
- THEN 系统 SHALL 显示新的用户消息

#### Scenario: 用户停止响应
- WHEN 助手正在响应且用户按Escape键
- THEN 系统 SHALL 停止流式响应
- THEN 系统 SHALL 显示"Response interrupted"消息
- THEN 系统 SHALL 启用输入控件

---

### 3.9 模型与连接管理

#### Requirement: 模型选择
- 系统 SHALL 显示当前选择的模型名称
- 系统 SHALL 提供模型选择下拉菜单
- 系统 SHALL 当会话有消息后锁定连接选择
- 系统 SHALL 根据连接类型显示可用模型列表

#### Requirement: 上下文窗口显示
- 系统 SHALL 显示当前模型的上下文窗口大小
- 系统 SHALL 计算并显示已使用的上下文百分比
- 系统 SHALL 当上下文接近满时显示警告

#### Scenario: 用户切换模型
- WHEN 用户打开模型选择下拉菜单
- THEN 系统 SHALL 显示当前连接的可用模型
- WHEN 用户选择新模型
- THEN 系统 SHALL 更新当前模型
- THEN 系统 SHALL 保存选择到持久化存储

#### Scenario: 会话锁定连接
- WHEN 会话已有消息
- THEN 系统 SHALL 禁用连接选择
- THEN 系统 SHALL 显示当前无法更改连接的提示

---

### 3.10 高级选项

#### Requirement: 思考级别（Thinking Level）
- 系统 SHALL 提供三个思考级别选项：off、think、max
- 系统 SHALL 默认选择think级别
- 系统 SHALL 在输入区域显示当前思考级别指示器
- 系统 SHALL 允许用户通过键盘快捷键或菜单切换

#### Requirement: 超级思考模式（Ultrathink）
- 系统 SHALL 提供Ultrathink开关
- 系统 SHALL 当Ultrathink启用时显示视觉效果
- 系统 SHALL 在输入区域下方显示Ultrathink图标或指示器

#### Requirement: 权限模式（Permission Mode）
- 系统 SHALL 提供多种权限模式：ask、auto、disabled
- 系统 SHALL 通过Shift+Tab快捷键循环切换权限模式
- 系统 SHALL 在输入区域显示当前权限模式指示器
- 系统 SHALL 模式切换时保持输入值不变

#### Scenario: 用户切换思考级别
- WHEN 用户点击思考级别指示器
- THEN 系统 SHALL 显示级别选择菜单
- WHEN 用户选择max级别
- THEN 系统 SHALL 更新思考级别为max
- THEN 系统 SHALL 更新UI显示

#### Scenario: 用户切换权限模式
- WHEN 用户按下Shift+Tab
- THEN 系统 SHALL 循环到下一个权限模式
- THEN 系统 SHALL 更新UI指示器
- THEN 系统 SHALL 保存新模式到会话设置

---

### 3.11 会话状态

#### Requirement: 连接不可用状态
- 系统 SHALL 当会话的锁定的连接被移除时显示不可用状态
- 系统 SHALL 禁用发送按钮
- 系统 SHALL 显示连接不可用的错误提示
- 系统 SHALL 建议用户创建新会话或重新配置连接

#### Requirement: 会话加载状态
- 系统 SHALL 当首次打开会话时显示加载状态
- 系统 SHALL 在消息区域显示旋转指示器
- 系统 SHALL 加载完成后显示消息内容

#### Scenario: 连接被移除
- WHEN 用户移除会话锁定的连接
- THEN 系统 SHALL 在会话中显示连接不可用状态
- THEN 系统 SHALL 禁用发送功能

---

## 4. 数据模型

### 4.1 Message Type

```typescript
type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string | Array<ContentBlock>
  timestamp?: number
  attachments?: FileAttachment[]
}

type ContentBlock = {
  type: 'text' | 'image' | 'file'
  text?: string
  file?: FileAttachment
}
```

### 4.2 Turn Type

```typescript
type Turn = UserTurn | AssistantTurn | SystemTurn | AuthRequestTurn

type UserTurn = {
  type: 'user'
  message: Message
}

type AssistantTurn = {
  type: 'assistant'
  turnId: string
  response: {
    text: string
    isStreaming: boolean
  }
  activities: ActivityItem[]
}

type ActivityItem = {
  id: string
  type: 'tool' | 'thinking' | 'intermediate' | 'status' | 'plan'
  status: 'pending' | 'running' | 'completed' | 'error' | 'backgrounded'
  toolName?: string
  toolUseId?: string
  content?: string
  intent?: string
  timestamp: number
  error?: string
}
```

### 4.3 StructuredInputState

```typescript
type StructuredInputState =
  | { type: 'permission'; data: PermissionRequest }
  | { type: 'credential'; data: CredentialRequest }
```

---

## 5. 交互流程

### 5.1 发送消息流程

```
用户输入/粘贴内容
       ↓
用户按Enter或点击发送
       ↓
系统收集：消息内容 + 附件 + @技能
       ↓
onSendMessage回调发送到后台
       ↓
显示用户消息气泡
       ↓
创建新的AssistantTurn
       ↓
显示ProcessingIndicator
       ↓
流式接收响应 → 递增渲染
       ↓
工具调用 → 添加ActivityItem → 更新状态
       ↓
响应完成 → 标记Streaming完成
       ↓
更新TurnCard为完成状态
```

### 5.2 权限请求流程

```
工具需要用户批准
       ↓
PendingPermission设置
       ↓
设置structuredInput为permission类型
       ↓
切换到PermissionRequest UI
       ↓
用户选择Allow/Deny
       ↓
onRespondToPermission回调
       ↓
继续或取消工具执行
       ↓
清空structuredInput，返回freeform
```

---

## 6. MODIFIED区块

> 本模块自初始版本以来，增强了结构化输入支持，增加了搜索高亮和导航功能。

---

## 7. REMOVED区块

> 本模块自初始版本以来未移除关键功能。

---

## 8. 附录

### 8.1 术语表

| 术语 | 定义 |
|------|------|
| Turn（轮次） | 由一条用户消息和对应的助手响应组成的对话单元 |
| Activity（活动） | 助手执行的一个工具调用或思考过程 |
| StreamingMarkdown | 流式渲染的markdown组件，支持实时内容更新 |
| ProcessingIndicator | 显示处理状态的指示器，包含图标和时间 |
| TurnCard | 显示助手响应的卡片组件，包含活动和内容 |
| @技能 | 通过@符号引用的技能，用于调用特定功能 |
| #标签 | 通过#符号引用的标签，用于分类或状态 |
| /斜杠命令 | 通过/符号触发的快捷命令 |
| 结构化输入 | 特殊的输入UI，用于权限请求、凭证请求等场景 |
| ThinkingLevel | 思考级别，控制AI的推理深度：off、think、max |
| Ultrathink | 超级思考模式，扩展推理能力 |
| PermissionMode | 权限模式，控制工具执行是否需要用户批准 |
| 上下文窗口 | 模型可处理的输入token数量限制 |

### 8.2 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| Enter | 发送消息（输入区域） |
| Shift+Enter | 插入换行（输入区域） |
| Escape | 停止当前响应 |
| Cmd/Ctrl+K | 快速命令 |
| Shift+Tab | 循环切换权限模式 |

### 8.3 状态码说明

| 状态 | 说明 |
|------|------|
| pending | 活动等待执行 |
| running | 活动正在执行 |
| completed | 活动执行成功 |
| error | 活动执行失败 |
| backgrounded | 活动移至后台执行 |

---

## 9. 变更历史

| 版本 | 日期 | 变更说明 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-03-03 | 初始版本 | 需求提取专家-AI聊天 |
