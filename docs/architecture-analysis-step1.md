# Craft Agents 项目结构分析报告
## Step 1: 产品理解与模块识别

**模型信息:**
- 模型名称: Claude Haiku 4.5
- 模型大小: Haiku (精简版)
- 模型类型: 对话式AI助手
- 修订版本: 20251001 (更新日期: 2025-02-03)

---

## 一、产品定位与核心功能概述

### 1.1 产品定位
Craft Agents 是一个基于 Agent Native 软件原则的桌面AI代理助手应用，专注于提供直观的多任务处理能力、与各类API/服务的无连接、会话共享以及文档中心化而非代码中心化的工作流。

### 1.2 核心功能
根据 README.md 综合分析：

| 功能类别 | 具体特性 | 技术实现 |
|---------|---------|---------|
| **会话管理** | 多会话收件箱、状态工作流、标记功能、命名、持久化 | SessionStorage + Jotai Atoms |
| **AI连接** | 多LLM连接、Anthropic API、Codex/OpenAI支持、per-workspace默认设置 | LlmConnection + AgentBackend |
| **MCP集成** | 32+个Craft文档工具、MCP服务器连接、REST API连接 | CraftMcpClient + Sources |
| **权限模式** | 三级系统(Explore/Ask to Edit/Auto)、可定制规则 | PermissionMode + PermissionsConfig |
| **主题系统** | 级联主题(app和workspace)、6色方案 | ThemeResolver |
| **文件处理** | 多文件diff、拖拽附件、PDF/Office转换 | AttachmentPreview + FilePreviewOverlay |
| **背景任务** | 长时间操作的任务跟踪、进度显示 | BackgroundTasksAtom |
| **技能管理** | 每workspace存储的专用代理指令 | SkillsStorage |
| **快捷键** | 全局快捷键、用户标签 | ActionRegistry + HotkeySystem |
| **国际化** | 完整的i18n支持(en/zh-CN) | I18nContext + TranslationFiles |

---

## 二、主要模块清单（按业务功能划分）

### 2.1 会话管理模块 (Session Management)

#### 核心职责
- 会话创建、加载、保存、删除
- 会话状态管理（读取标记、标记、todo状态）
- 会话列表展示和过滤
- 会话元数据提取

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `packages/shared/src/sessions/index.ts` | 会话公共API入口 |
| `packages/shared/src/sessions/storage.ts` | 会话CRUD操作 |
| `packages/shared/src/sessions/jsonl.ts` | JSONL格式序列化 |
| `packages/shared/src/sessions/types.ts` | 会话类型定义 |
| `packages/shared/src/sessions/persistence-queue.ts` | 异步持久化队列 |
| `packages/shared/src/sessions/validation.ts` | 会话验证 |
| `packages/shared/src/sessions/word-lists.ts` | 名称生成词库 |
| `packages/shared/src/sessions/slug-generator.ts` | 会话ID生成器 |
| `apps/electron/src/renderer/atoms/sessions.ts` | Jotai状态管理 |
| `apps/electron/src/renderer/hooks/useSession.ts` | 会话操作Hook |
| `apps/electron/src/renderer/components/app-shell/SessionList.tsx` | 会话列表UI |
| `apps/electron/src/renderer/components/app-shell/SessionMenu.tsx` | 会话右键菜单 |
| `apps/electron/src/renderer/components/app-shell/SessionMenuParts.tsx` | 菜单部件 |
| `apps/electron/src/renderer/components/app-shell/SessionSearchHeader.tsx` | 会话搜索头部 |

#### 数据流程
```
用户操作 → useSession() Hook → Jotai Atoms → Shared Storage (JSONL) → 磁盘存储
    ↓            ↓                ↓                 ↓
UI更新    →   状态同步      →   持久化队列    →   文件系统
```

---

### 2.2 工作区管理模块 (Workspace Management)

#### 核心职责
- 工作区创建、选择、切换
- 工作区特定配置（默认模型、权限模式、主题）
- 工作区间隔离（会话、技能、来源）

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `packages/shared/src/config/storage.ts` | 工作区配置存取 |
| `packages/shared/src/config/paths.ts` | 配置文件路径管理 |
| `packages/shared/src/workspaces/` | 工作区存储模块 |
| `apps/electron/src/renderer/components/workspace/WorkspaceCreationScreen.tsx` | 工作区创建UI |
| `apps/electron/src/renderer/components/workspace/AddWorkspaceStep_*.tsx` | 创建向导步骤 |
| `apps/electron/src/renderer/components/workspace/primitives.tsx` | 工作区基础组件 |
| `apps/electron/src/renderer/components/app-shell/WorkspaceSwitcher.tsx` | 工作区切换器 |

---

### 2.3 API配置与连接模块 (API Setup / Provider Integration)

#### 核心职责
- 多LLM提供商支持配置
- 认证机制管理（API Key、OAuth、IAM等）
- 连接状态监控
- 每会话连接锁定

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `packages/shared/src/config/llm-connections.ts` | LLM连接配置类型和逻辑 |
| `packages/shared/src/config/models.ts` | 模型定义和注册表 |
| `packages/shared/src/config/validators.ts` | 配置验证 |
| `packages/shared/src/agent/backend/factory.ts` | 后端工厂（Anthropic/Codex） |
| `packages/shared/src/agent/backend/anthropic/` | Anthropic后端实现 |
| `packages/shared/src/agent/backend/codex/` | Codex后端实现 |
| `packages/shared/src/credentials/` | 凭证管理（AES-256-GCM加密） |
| `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx` | API密钥输入UI |
| `apps/electron/src/renderer/components/apisetup/OAuthConnect.tsx` | OAuth连接UI |

#### 支持的Provider类型
```typescript
LlmProviderType:
  - 'anthropic'           // Anthropic官方API
  - 'anthropic_compat'    // Anthropic兼容端点(OpenRouter等)
  - 'openai'              // OpenAI API
  - 'openai_compat'       // OpenAI兼容端点(Ollama等)
  - 'bedrock'             // AWS Bedrock
  - 'vertex'              // Google Vertex AI
```

#### 支持的认证类型
```typescript
LlmAuthType:
  - 'api_key'             // 单API密钥
  - 'api_key_with_endpoint' // API密钥 + 自定义端点
  - 'oauth'               // OAuth流
  - 'iam_credentials'     // AWS IAM凭证
  - 'bearer_token'        // Bearer Token
  - 'service_account_file' // GCP服务账号文件
  - 'environment'         // 环境变量自动检测
  - 'none'                // 无认证（本地模型）
```

---

### 2.4 AI交互与聊天模块 (Chat / Message Display)

#### 核心职责
- 用户消息输入和发送
- AI响应流式显示
- 工具调用可视化
- 结构化输入处理（权限请求、凭证请求）
- 文件附件处理

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `packages/shared/src/agent/claude-agent.ts` | Claude Agent实例 |
| `packages/shared/src/agent/codex-agent.ts` | Codex Agent实例 |
| `packages/shared/src/agent/base-agent.ts` | 基础Agent抽象 |
| `packages/shared/src/agent/session-scoped-tools.ts` | 会话作用域工具 |
| `packages/shared/src/agent/mode-manager.ts` | 权限模式管理器 |
| `packages/shared/src/agent/permissions-config.ts` | 权限配置 |
| `apps/electron/src/renderer/event-processor/processor.ts` | 事件处理器 |
| `apps/electron/src/renderer/event-processor/handlers/` | 各种事件处理器 |
| `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx` | 聊天显示核心 |
| `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx` | 自由表单输入 |
| `apps/electron/src/renderer/components/app-shell/input/StructuredInput.tsx` | 结构化输入 |
| `apps/electron/src/renderer/components/app-shell/input/structured/PermissionRequest.tsx` | 权限请求UI |
| `apps/electron/src/renderer/components/app-shell/input/structured/CredentialRequest.tsx` | 凭证请求UI |
| `apps/electron/src/renderer/components/chat/AuthRequestCard.tsx` | 认证请求卡片 |
| `apps/electron/src/renderer/components/chat/EmptyStateHint.tsx` | 空状态提示 |
| `apps/electron/src/renderer/components/app-shell/AttachmentPreview.tsx` | 附件预览 |

#### 事件流处理
```
Agent Event → EventProcessor → Handler → Jotai Atom更新 → UI渲染
     ↓              ↓              ↓              ↓
流式响应    消息解析      状态同步      React重新渲染
```

---

### 2.5 Onboarding引导流程模块

#### 核心职责
- 首次启动引导流程
- API配置设置（API Key或OAuth）
- Git Bash检测（Windows）
- 凭证配置
- 重新认证流程

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `apps/electron/src/renderer/components/onboarding/OnboardingWizard.tsx` | 引导向导主容器 |
| `apps/electron/src/renderer/components/onboarding/WelcomeStep.tsx` | 欢迎步骤 |
| `apps/electron/src/renderer/components/onboarding/APISetupStep.tsx` | API设置步骤 |
| `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx` | 凭证步骤 |
| `apps/electron/src/renderer/components/onboarding/CompletionStep.tsx` | 完成步骤 |
| `apps/electron/src/renderer/components/onboarding/ReauthScreen.tsx` | 重新认证屏幕 |
| `apps/electron/src/renderer/components/onboarding/GitBashWarning.tsx` | Git Bash警告 |
| `apps/electron/src/renderer/components/onboarding/primitives.tsx` | 引导组件基础 |
| `apps/electron/src/renderer/hooks/useOnboarding.ts` | 引导流程Hook |
| `apps/electron/src/main/onboarding.ts` | Electron主进程引导逻辑 |

#### 引导流程状态机
```
Welcome → GitBash(Win) → APISetup → Credentials → Complete
           ↓              ↓
        (可选)        Key输入或OAuth启动
```

---

### 2.6 设置页面模块 (Settings)

#### 核心职责
- 应用级和工作区级设置
- LLM连接管理
- 主题配置
- 权限配置
- 状态配置

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `apps/electron/src/renderer/pages/settings/index.tsx` | 设置页面入口 |
| `apps/electron/src/renderer/components/settings/SettingsCard.tsx` | 设置卡片 |
| `apps/electron/src/renderer/components/settings/SettingsRow.tsx` | 设置行 |
| `apps/electron/src/renderer/components/settings/SettingsSection.tsx` | 设置分区 |
| `apps/electron/src/renderer/components/settings/SettingsInput.tsx` | 设置输入框 |
| `apps/electron/src/renderer/components/settings/SettingsSelect.tsx` | 设置选择器 |
| `apps/electron/src/renderer/components/settings/SettingsToggle.tsx` | 设置开关 |
| `apps/electron/src/renderer/components/settings/SearchableModelInput.tsx` | 模型搜索输入 |
| `packages/shared/src/config/preferences.ts` | 偏好设置管理 |
| `packages/shared/src/config/theme.ts` | 主题管理 |

---

### 2.7 快捷键与操作模块 (Shortcuts / Actions)

#### 核心职责
- 全局操作定义和注册
- 快捷键管理
- 用户可见标签国际化
- 操作执行

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `apps/electron/src/renderer/actions/definitions.ts` | 操作定义库 |
| `apps/electron/src/renderer/actions/registry.tsx` | 操作注册表 |
| `apps/electron/src/renderer/actions/types.ts` | 操作类型 |
| `apps/electron/src/renderer/actions/index.ts` | 公共导出 |
| `apps/electron/src/renderer/actions/useAction.ts` | 操作执行Hook |
| `apps/electron/src/renderer/actions/useHotkeyLabel.ts` | 快捷键标签Hook |
| `i18n/locales/en/actions/` | 操作翻译(英文) |
| `i18n/locales/zh-CN/actions/` | 操作翻译(简体中文) |

#### 操作分类
```typescript
General:      app.newChat, app.settings, app.toggleTheme, app.search, ...
Navigation:   nav.focusSidebar, nav.focusSessionList, nav.focusChat, ...
Session:      session.rename, session.archive, session.delete, session.pin, ...
Permission:   permission.explore, permission.askToEdit, permission.auto, ...
Sources:      source.toggle, source.settings, source.remove, ...
Skills:       skill.create, skill.edit, skill.remove, ...
```

---

### 2.8 国际化模块 (i18n)

#### 核心职责
- 多语言支持(en/zh-CN)
- 翻译上下文提供
- 翻译文件管理
- 翻译key命名规范执行

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `apps/electron/src/renderer/contexts/I18nContext.tsx` | I18n Context |
| `apps/electron/src/renderer/i18n.ts` | I18n配置入口 |
| `apps/electron/src/renderer/i18n/` | I18n内部目录 |
| `i18n/locales/en/` | 英文翻译文件 |
| `i18n/locales/zh-CN/` | 简体中文翻译文件 |

#### 翻译文件结构
```
i18n/locales/
├── en/
│   ├── actions/
│   │   ├── app.json
│   │   ├── nav.json
│   │   └── ...
│   ├── components/
│   │   ├── app-shell/
│   │   │   ├── AppShell.json
│   │   │   ├── ChatDisplay.json
│   │   │   └── SessionList.json
│   │   ├── apisetup/
│   │   │   └── ApiKeyInput.json
│   │   ├── onboarding/
│   │   │   ├── primitives.json
│   │   │   ├── WelcomeStep.json
│   │   │   └── ...
│   │   ├── settings/
│   │   │   └── ...
│   │   └── ui/
│   │       └── ...
│   └── contexts/
│       └── NavigationContext.json
└── zh-CN/
    └── (镜像 en 的结构)
```

#### 翻译Key命名规范
```typescript
// ✅ 正确 - 使用完整英文原文作为key
t('New Chat')
t('Enter your API key...')
t('Default model is required for compatible endpoints.')

// ❌ 错误 - 不要使用缩写
t('new_chat')
t('auth.enter_key')
```

---

### 2.9 Sources与MCP模块

#### 核心职责
- MCP服务器连接管理
- REST API源管理
- 本地文件系统集成
- 凭证和认证处理

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `packages/shared/src/mcp/` | MCP客户端核心 |
| `packages/shared/src/sources/index.ts` | Sources公共API |
| `packages/shared/src/sources/types.ts` | Sources类型定义 |
| `packages/shared/src/sources/storage.ts` | Sources存储 |
| `packages/shared/src/sources/server-builder.ts` | MCP服务器构建器 |
| `packages/shared/src/sources/credential-manager.ts` | 凭证管理器 |
| `packages/shared/src/sources/token-refresh-manager.ts` | Token刷新管理 |
| `packages/shared/src/sources/builtin-sources.ts` | 内置Sources定义 |
| `packages/shared/src/sources/api-tools.ts` | API工具生成 |
| `apps/electron/src/renderer/atoms/sources.ts` | Sources状态 |
| `packages/bridge-mcp-server/` | Bridge MCP Server (Codex用) |
| `packages/session-mcp-server/` | Session MCP Server |

---

### 2.10 技能与标签模块 (Skills & Labels)

#### 核心职责
- 技能创建、编辑、删除
- 标签管理
- 每workspace隔离

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `packages/shared/src/skills/` | 技能存储和类型 |
| `apps/electron/src/renderer/atoms/skills.ts` | 技能状态 |
| `packages/shared/src/labels/` | 标签系统 |
| `packages/shared/src/labels/auto/` | 自动标签生成 |
| `apps/electron/src/renderer/hooks/useLabels.ts` | 标签操作Hook |
| `apps/electron/src/renderer/components/app-shell/SkillMenu.tsx` | 技能菜单 |
| `apps/electron/src/renderer/components/app-shell/SkillsListPanel.tsx` | 技能列表面板 |

---

### 2.11 导航与路由模块 (Navigation & Routing)

#### 核心职责
- 统一导航状态管理
- 路由解析和生成
- 深度链接处理
- 三面板导航协调

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `apps/electron/src/renderer/contexts/NavigationContext.tsx` | 导航上下文 |
| `apps/electron/src/main/deep-link.ts` | 深度链接处理 |
| `apps/electron/src/renderer/lib/navigate.ts` | 导航函数 |
| `packages/shared/src/route-parser.ts` | 路由解析器 |
| `packages/shared/src/routes.ts` | 路由定义 |
| `apps/electron/src/renderer/components/app-shell/LeftSidebar.tsx` | 左侧边栏 |
| `apps/electron/src/renderer/components/app-shell/RightSidebar.tsx` | 右侧边栏 |
| `apps/electron/src/renderer/components/app-shell/NavigatorPanel.tsx` | 导航面板 |

#### 导航状态流
```
NavigationState (统一状态)
    ├─ navigator: 'sessions' | 'sources' | 'skills' | 'settings'
    ├─ filter: SessionFilter | SourceFilter
    ├─ details: sessionId | sourceSlug | skillId | null
    └─ subpage: string | null
         ↓
    ├─ LeftSidebar: 高亮项
    ├─ NavigatorPanel: 列表内容
    └─ MainContentPanel: 详情展示
```

---

### 2.12 主题系统模块 (Theme System)

#### 核心职责
- 级联主题解析
- 明暗模式支持
- 自定义主题编辑

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `packages/shared/src/config/theme.ts` | 主题解析和管理 |
| `apps/electron/src/renderer/hooks/useTheme.ts` | 主题Hook |
| `packages/shared/src/colors/` | 颜色系统 |

---

### 2.13 应用外壳模块 (App Shell)

#### 核心职责
- 主应用框架
- 布局协调
- 全局状态管理
- 跨组件通信

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `apps/electron/src/renderer/components/app-shell/AppShell.tsx` | 主应用外壳 |
| `apps/electron/src/renderer/components/app-shell/MainContentPanel.tsx` | 主内容面板 |
| `apps/electron/src/renderer/components/app-shell/Panel.tsx` | 基础面板 |
| `apps/electron/src/renderer/components/app-shell/PanelHeader.tsx` | 面板头部 |
| `apps/electron/src/renderer/components/app-shell/ActiveOptionBadges.tsx` | 激活选项徽章 |
| `apps/electron/src/renderer/components/app-shell/ActiveTasksBar.tsx` | 任务栏 |
| `apps/electron/src/renderer/components/app-shell/SidebarMenu.tsx` | 侧边栏菜单 |
| `apps/electron/src/renderer/hooks/useDynamicStack.ts` | 动态堆栈Hook |

---

### 2.14 状态系统模块 (Statuses)

#### 核心职责
- 动态状态配置
- 工作流状态CRUD
- 状态排序和分类

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `packages/shared/src/statuses/` | 状态系统核心 |
| `apps/electron/src/renderer/hooks/useStatuses.ts` | 状态Hook |

---

### 2.15 Electron主进程模块 (Main Process)

#### 核心职责
- 应用生命周期管理
- IPC通信
- 窗口管理
- 文件系统操作
- 系统通知

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `apps/electron/src/main/index.ts` | 主进程入口 |
| `apps/electron/src/main/ipc.ts` | IPC处理器 |
| `apps/electron/src/main/window-manager.ts` | 窗口管理器 |
| `apps/electron/src/main/window-state.ts` | 窗口状态 |
| `apps/electron/src/main/sessions.ts` | 会话IPC |
| `apps/electron/src/main/menu.ts` | 应用菜单 |
| `apps/electron/src/main/auto-update.ts` | 自动更新 |
| `apps/electron/src/main/notifications.ts` | 通知 |
| `apps/electron/src/main/power-manager.ts` | 电源管理 |
| `apps/electron/src/main/thumbnail-protocol.ts` | 缩略图协议 |
| `apps/electron/src/main/logo-protocol.ts` | Logo协议 |
| `apps/electron/src/main/config-watcher.ts` | 配置监视器 |

---

### 2.16 预加载模块 (Preload)

#### 核心职责
- 上下文桥接
- API暴露给渲染进程

#### 源文件路径

| 文件路径 | 职责说明 |
|---------|---------|
| `apps/electron/src/preload/index.ts` | 预加载脚本 |

---

## 三、模块间依赖关系图

### 3.1 高层架构视图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Electron Main Process                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  IPC     │ │  Window  │ │  Sessions│ │   Config │ │ Notify │ │
│  │  Handler │ │ Manager  │ │   Handler│ │  Watcher │ │        │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬───┘ │
└───────┼────────────┼────────────┼────────────┼────────────┼─────┘
        │            │            │            │            │
        ▼            ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Preload (Context Bridge)                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                         Renderer Process                          │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │                        App Shell                            │ │
│ │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │ │
│ │  │ LeftSide │ │ Navigator│ │MainContent│ │ Right Sidebar│  │ │
│ │  │  Bar     │ │  Panel   │ │  Panel    │ │              │  │ │
│ │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘  │ │
│ └───────┼────────────┼────────────┼────────────┼───────────┘ │
│         ▼            ▼            ▼            ▼              │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │                   Navigation Context                        │ │
│ │              (Unified State for 3 Panels)                   │ │
│ └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────────┐ ┌──────────────────┐ ┌────────────┐
│   Jotai Atoms     │ │      Hooks       │ │ Components │
│ ┌───────────────┐ │ │ ┌────────────┐  │ │ ┌────────┐ │
│ │ sessions      │ │ │ │ useSession │  │ │ │AppShell│ │
│ │ sources       │ │ │ │useWorkspace│  │ │ │ChatDisplay│ │
│ │ skills        │ │ │ │useOnboarding│ │ │ │Settings│ │
│ └───────────────┘ │ │ └────────────┘  │ │ └────────┘ │
└───────┬───────────┘ └────────┬─────────┘ └────┬───────┘
        │                      │                  │
        ▼                      ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     @craft-agent/shared                        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐     │
│ │  Agent   │ │ Sessions │ │  Config  │ │     Sources  │     │
│ │ Backend  │ │ Storage  │ │  Storage │ │    Manager   │     │
│ └──────────┘ └──────────┘ └──────────┘ └──────────────┘     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐     │
│ │  MCP     │ │ Credentials│ │  Theme   │ │   Statuses   │     │
│ │  Client  │ │   Manager │ │ Renderer │ │    System    │     │
│ └──────────┘ └──────────┘ └──────────┘ └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
        │                      │                        │
        ▼                      ▼                        ▼
┌──────────────────┐ ┌──────────────────┐ ┌─────────────┐
│ Claude Agent SDK │ │   File System    │ │  External   │
│                  │ │    ~/.craft-agent│ │   APIs/MCP  │
└──────────────────┘ └──────────────────┘ └─────────────┘
```

### 3.2 核心数据流向

#### 3.2.1 会话创建流程
```
用户点击"New Chat"
    ↓
useSession() Hook 调用 createSession()
    ↓
shared/sessions/storage.ts 生成 Session 对象
    ↓
Jotai Atoms 更新 (addSessionAtom)
    ↓
AppShell 导航到新会话 (navigate(routes.session.view(id)))
    ↓
ChatDisplay 渲染新会话UI
    ↓
用户输入消息
    ↓
Agent 实例创建 (ClaudeAgent 或 CodexAgent)
    ↓
流式响应开始
    ↓
EventProcessor 处理事件流
    ↓
ChatDisplay 渲染消息卡片
```

#### 3.2.2 API配置流程
```
用户打开设置 → LLM Connections
    ↓
SettingsCard 渲染 LLMConnectionList
    ↓
用户点击"Add Connection"
    ↓
ApiKeyInput 或 OAuthConnect 弹窗
    ↓
用户输入凭证或完成OAuth
    ↓
CredentialsManager 存储加密凭证
    ↓
ConfigStorage 更新 llmConnections 数组
    ↓
Jotai Sources 更新
    ↓
UI显示新连接
```

#### 3.2.3 国际化流程
```
应用启动
    ↓
I18nContext 初始化
    ↓
加载当前语言配置 (preferences.language)
    ↓
加载对应语言文件 (i18n/locales/{lang}/...)
    ↓
创建翻译函数 t(namespace, key)
    ↓
组件使用 useTranslation(namespace)
    ↓
t('text') 返回翻译文本
    ↓
UI 渲染翻译后文本
```

### 3.3 层级依赖关系

```
Presentation Layer (表现层)
    - 组件 (*.tsx)
    - 使用 Hooks 和 Contexts

Business Logic Layer (业务逻辑层)
    - Custom Hooks (useSession, useOnboarding, etc.)
    - Service Modules (@craft-agent/shared/*)

Data Layer (数据层)
    - Jotai Atoms (客户端状态)
    - ConfigStorage/SessionsStorage (持久化)
    - File System (~/.craft-agent/) (存储)

Integration Layer (集成层)
    - Claude Agent SDK
    - MCP Client
    - External APIs
```

---

## 四、技术栈总结

| 层级 | 技术选型 | 用途 |
|-----|---------|-----|
| **运行时** | Bun | 构建工具和包管理器 |
| **桌面应用** | Electron | 跨平台桌面应用框架 |
| **前端框架** | React 18 | UI构建 |
| **状态管理** | Jotai | 原子化状态管理 |
| **构建工具** | esbuild (Main), Vite (Renderer) | 代码打包 |
| **UI库** | shadcn/ui + Tailwind CSS v4 | 组件系统和样式 |
| **AI SDK** | @anthropic-ai/claude-agent-sdk | Claude Agent集成 |
| **加密** | Node.js crypto (AES-256-GCM) | 凭证加密存储 |
| **文件系统** | Node fs/promises | 配置和会话持久化 |
| **类型检查** | TypeScript | 静态类型检查 |

---

## 五、架构约束与开发规范

### 5.1 目录结构约束
```
apps/
├── electron/
│   ├── src/
│   │   ├── main/           # Electron主进程
│   │   ├── preload/        # 预加载脚本
│   │   └── renderer/       # React UI
│   │       ├── actions/    # 系统快捷键定义
│   │       ├── atoms/      # Jotai状态
│   │       ├── components/ # React组件
│   │       ├── contexts/   # React Contexts
│   │       ├── hooks/      # Custom Hooks
│   │       └── pages/      # 页面组件
│   └── package.json

packages/
├── core/                   # 共享类型定义
├── shared/                 # 核心业务逻辑
├── ui/                     # 共享UI组件
└── ...
```

### 5.2 代码模块化原则
- **单一职责**: 每个模块/函数只做一件事
- **依赖注入**: 通过Context和Hooks传递依赖
- **类型安全**: 所有模块强类型化
- **状态隔离**: 工作区间完全隔离

### 5.3 国际化约束
- 翻译key使用完整英文原文
- 按组件路径组织翻译文件
- 支持变量替换 `{variable}`
- 命名空间与文件路径对应

---

## 六、下一步计划

基于Step 1的分析，Step 2将进入需求提取阶段：

### 6.2 待提取需求的模块
1. ✅ 会话管理模块 - 待提取
2. ✅ 工作区管理模块 - 待提取
3. ✅ API配置与连接模块 - 待提取
4. ✅ AI交互与聊天模块 - 待提取
5. ✅ Onboarding引导流程模块 - 待提取
6. ✅ 设置页面模块 - 待提取
7. ✅ 快捷键与操作模块 - 待提取
8. ✅ 国际化模块 - 待提取

### 6.2 验证计划
- 创建需求验证脚本
- 验证需求完整性
- 生成需求文档索引 INDEX.md

---

**报告完成时间:** 2026-03-03
**分析人员:** 架构分析师
**报告状态:** ✅ 已完成

**向团队lead确认:** Step 1架构分析已完成，已准备好进入Step 2（需求提取阶段）。
