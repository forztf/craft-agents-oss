# Craft Agents 需求文档索引

## 概述

本目录包含 Craft Agents 应用程序各模块的需求规格文档（EARS 格式）。所有文档均从现有代码库自动逆向生成，遵循 EARS（Easy Approach to Requirements Syntax）标准格式。

---

## 文档列表

| 文档 | 模块 | 描述 | 需求数 | 场景数 | 状态 |
|------|------|------|--------|--------|------|
| [_product-analysis.md](./_product-analysis.md) | 产品分析 | 产品定位、技术架构、模块边界划分、功能清单 | - | - | ✓ 完成 |
| [session-management.md](./session-management.md) | 会话管理 | 会话列表、搜索、筛选、状态管理、标签、重命名、分享、元数据、文件浏览、删除 | 19 | 70+ | ✓ 完成 |
| [workspace-management.md](./workspace-management.md) | 工作区管理 | 工作区选择器、创建流程、打开文件夹、标识设置、权限模式、模式循环、高级设置 | 18 | 77 | ✓ 完成 |
| [api-configuration.md](./api-configuration.md) | API配置与连接 | LLM连接配置、多提供商支持、认证机制、端点预设、模型管理、连接验证 | - | - | ✓ 完成 |
| [chat-interaction.md](./chat-interaction.md) | AI交互与聊天 | 自由文本输入、文件附件、智能语法、结构化输入、消息流式显示、工具可视化 | 13 | - | ✓ 完成 |
| [onboarding.md](./onboarding.md) | Onboarding引导流程 | 欢迎页面、Git Bash检测、API选择、凭据输入、OAuth认证、配置完成、会话过期重新认证 | 24 | - | ✓ 完成 |
| [settings.md](./settings.md) | 设置页面 | AI设置、外观设置、偏好设置、权限设置、标签设置、工作区设置、快捷键、应用设置 | - | - | ✓ 完成 |
| [shortcuts.md](./shortcuts.md) | 快捷键与操作 | Action注册机制、全局快捷键、跨平台适配、上下文相关操作、输入安全模式 | 22 | - | ✓ 完成 |
| [sources-skills.md](./sources-skills.md) | Sources与Skills | MCP集成、REST API、本地文件系统、Skills创建、信息展示、管理操作、权限配置、凭证管理 | 42 | - | ✓ 完成 |
| [i18n.md](./i18n.md) | 国际化 | 多语言支持、语言切换、翻译Key管理、动态文本替换、命名空间隔离 | - | - | ✓ 完成 |

---

## 模块分类架构

### 1. 核心交互模块

#### 会话管理 (session-management.md)
**功能范围**：
- 会话创建（基础、自定义、隐藏、子会话）
- 会话列表浏览（日期分组、分页、信息显示）
- 会话搜索（模糊匹配、分层数据、清除搜索）
- 会话过滤（Flag、状态、标签、视图、归档、组合过滤）
- 会话选择与导航（单选、多选、范围选择、全选）
- 会话操作（删除、重命名、分享、文件操作）
- 会话元数据管理（状态、标签、未读、配置）
- 数据持久化与同步（自动保存、延迟加载、跨窗口同步）

**关键组件**：
- `SessionList.tsx` - 会话列表主组件
- `SessionMenu.tsx` - 会话操作菜单
- `useSession.ts` - 会话选择 hook
- `sessions.ts` (main) - 后端会话服务

---

#### 工作区管理 (workspace-management.md)
**功能范围**：
- 工作区切换器（下拉列表、图标缓存、悬停操作）
- 工作区创建流程（新建、打开文件夹、状态管理）
- 工作区配置（目录结构、默认设置、路径可移植性）
- 工作区验证（Slug唯一性、存在性检查）
- 工作区管理（删除、颜色主题、MCP配置、元数据索引）
- 工作区菜单操作（新窗口打开、Finder显示）

**关键组件**：
- `WorkspaceSwitcher.tsx` - 工作区切换器
- `WorkspaceCreationScreen.tsx` - 工作区创建界面
- `AddWorkspaceStep_*` - 创建流程步骤组件

---

#### 快捷键与操作 (shortcuts.md)
**功能范围**：
- Action 注册机制（ActionRegistryProvider、useAction Hook）
- 全局快捷键绑定（27个预定义操作）
- 上下文相关操作（global、session-list、chat、sidebar 作用域）
- 跨平台适配（macOS 符号、Windows/Linux 文本显示）
- 输入安全模式（inputSafe 标记、文本选择处理）
- 用户快捷键覆盖架构

**关键组件**：
- `ActionRegistryProvider` - 注册表提供者
- `useAction` - 动态注册 Hook
- `KeyboardShortcutsDialog` - 快捷键对话框
- `definitions.ts` - 27个预定义操作

---

### 2. AI 集成模块

#### API配置与连接 (api-configuration.md)
**功能范围**：
- LLM 提供商支持（Anthropic、OpenAI、AWS Bedrock、Google Vertex AI、兼容端点）
- 认证机制（API Key、OAuth、AWS IAM、Bearer Token、GCP 服务账号、环境变量、无认证）
- 端点预设（Anthropic、OpenRouter、Vercel AI Gateway、Ollama、Custom）
- 模型配置（模型列表、默认模型、总结模型）
- 连接验证（Anthropic、OpenAI 专用验证端点）
- Claude OAuth（两步流程：浏览器授权 → 授权码输入）
- ChatGPT OAuth（原生浏览器 OAuth 流程）
- 连接默认值解析（会话/工作区/全局三级）

**关键组件**：
- `ApiKeyInput.tsx` - API Key 输入组件
- `OAuthConnect.tsx` - OAuth 连接控制
- `llm-connections.ts` - LLM 连接类型定义
- `claude-oauth.ts` - Claude OAuth 实现

---

#### AI交互与聊天 (chat-interaction.md)
**功能范围**：
- 自由文本输入（多行文本、自动高度扩展、字符计数、草稿持久化）
- 文件附件处理（多种文件类型、预览、大小验证）
- 智能语法输入（@mention 文件提及、/skill 技能调用、#label 标签输入）
- 结构化输入 - 认证请求（API Key、Bearer Token、Basic Auth、Multi-Header、OAuth）
- 结构化输入 - 权限请求（敏感操作审批、命令预览、批准/拒绝）
- 消息流式显示（实时更新、流式 Markdown、状态指示器）
- 工具调用可视化（Read/Bash/Grep/Glob/Write/Edit 工具结果展示）
- 消息附件显示（图片/文本/PDF/Office 文档预览）
- 空状态提示（随机工作流建议、实体内联徽章）
- 消息搜索高亮（搜索结果高亮、导航支持）

**关键组件**：
- `ChatDisplay.tsx` - 核心聊天显示组件（~29000 tokens）
- `AuthRequestCard.tsx` - 认证请求卡片（5种认证类型、4种状态）
- `StructuredInput.tsx` - 结构化输入容器
- `FreeFormInputContext.tsx` - 自由文本输入上下文
- `EmptyStateHint.tsx` - 空状态提示（15+ 工作流建议）

---

### 3. 用户引导模块

#### Onboarding引导流程 (onboarding.md)
**功能范围**：
- 欢迎引导（新用户/老用户不同文案）
- Windows Git Bash 配置（配置警告、手动指定路径、重新检测、跳过配置）
- API 连接方式选择（Anthropic 和 OpenAI 分组、视觉反馈、选中标记）
- API Key 认证 - Anthropic（输入表单、显示/隐藏、端点预设、API Key 验证）
- OAuth 认证 - Claude（两步 OAuth 流程、授权代码输入、令牌交换、状态管理）
- OAuth 认证 - ChatGPT（单步 OAuth 流程、原生浏览器、自动捕获令牌）
- API Key 认证 - OpenAI（输入表单、端点预设、API Key 验证）
- 配置完成（保存进度、成功界面）
- 会话过期重新认证（重新认证界面、执行重新登录、重置应用）

**关键组件**：
- `OnboardingWizard.tsx` - 向导主容器
- `WelcomeStep.tsx`, `GitBashWarning.tsx`, `APISetupStep.tsx`
- `CredentialsStep.tsx`, `CompletionStep.tsx`, `ReauthScreen.tsx`
- `useOnboarding.ts` - 完整状态机实现（549行）

---

### 4. 配置管理模块

#### 设置页面 (settings.md)
**功能范围**：
- **应用级别设置**：通知管理、电源管理、应用更新（9项需求）
- **AI 配置设置**：默认配置、工作区覆盖、连接管理、凭证健康监控（17项需求）
- **外观设置**：默认主题、工作区覆盖、工具图标（9项需求）
- **输入设置**：输入行为、发送配置（4项需求）
- **工作区设置**：标识、权限、模式循环、高级配置（16项需求）
- **权限设置**：权限说明、默认配置、工作区自定义、配置监视（11项需求）
- **标签设置**：功能说明、层次结构、自动规则（12项需求）
- **快捷键设置**：全局快捷键、组件快捷键、视觉表示（9项需求）
- **偏好设置**：个人信息、位置、备注、文件管理（10项需求）
- **设置导航器**：页面列表、快捷菜单（4项需求）

**配置文件位置**：
| 配置类型 | 存储位置 |
|---------|----------|
| 用户偏好 | `~/.craft-agent/preferences.json` |
| 默认权限 | `~/.craft-agent/permissions/default.json` |
| 工具图标 | `~/.craft-agent/tool-icons/tool-icons.json` |
| 工作区配置 | `{workspace}/workspace.json` |
| 工作区权限 | `{workspace}/permissions.json` |
| 标签配置 | `{workspace}/labels/config.json` |

---

### 5. 系统模块

#### Sources与Skills (sources-skills.md)
**功能范围**：
- **Sources 连接**（2场景）：MCP、API、本地文件系统
- **Skills 创建**（5场景）：文件结构、元数据、行为控制、Always Allowed Tools
- **Source/Skill 信息展示**（4场景）：资料页内容展示（描述、类型、配置、权限、使用示例）
- **Source/Skill 管理操作**（8场景）：CRUD、编辑、菜单操作
- **Source 权限配置**（5场景）：权限规则、表格显示、Explore/Ask/Auto 交互
- **凭证管理**（6场景）：OAuth（Google、Slack、Microsoft）、加密存储、令牌刷新、并发刷新防护
- **API 工具功能**（7场景）：灵活工具、二进制处理、大响应摘要（>15K tokens）
- **实时更新**（4场景）：事件通知、页面同步
- **错误处理**（5场景）：各类失败场景处理

**Sources 支持类型**：
- **传输类型**：HTTP、SSE、stdio（子进程）
- **认证方式**：OAuth、Bearer、Header、Query、Basic、多 Header
- **OAuth 集成**：Google（Gmail/Calendar/Drive）、Slack、Microsoft

**关键组件**：
- `source/storage.ts` - 文件存储、CRUD、图标管理
- `source/credential-manager.ts` - OAuth 流程、凭证存储、令牌刷新
- `source/server-builder.ts` - MCP/API 服务器构建逻辑
- `source/api-tools.ts` - 动态 API 工具工厂、二进制处理

---

#### 国际化 (i18n.md)
**功能范围**：
- 多语言支持（en 英文、zh-CN 简体中文）
- 语言切换（UI 切换、Electron IPC 持久化）
- 翻译 Key 管理（完整英文文本作为 key、{{variable}} 占位符、命名空间隔离）
- 动态文本替换

**统计信息**：
- **总翻译文件数**：214 个（107 个英文 + 107 个中文）
- **目录结构**：`i18n/locales/{lang}/{namespace}.json`
- **组织方式**：按组件和功能模块组织命名空间

**技术架构**：
```
I18nProvider (React Context)
├── language: 'en' | 'zh-CN'
├── setLanguage(lang)
├── t(key, namespace, params)
└── isLoading: boolean

文件加载: import.meta.glob('../../../../i18n/locales/**/*.json', { eager: true })
```

**相关脚本**：
- `scripts/validate-locales.ts` - 翻译文件验证
- `scripts/validate-i18n.ts` - i18n 完整性验证
- `scripts/i18n-progress-report.ts` - 进度报告生成

---

## EARS 格式规范

需求文档遵循 [Easy Approach to Requirements Syntax (EARS)](https://www.modernanalyst.com/Careers/InterviewQuestions/tabid/128/ID/6212/What-is-EARS.aspx) 格式：

### 需求模板

```markdown
### Requirement: <功能名>

系统 SHALL <描述功能>

#### Scenario: <场景名>
- **WHEN** <前提条件>
- **THEN** <预期结果>
```

### 三段式结构

所有需求文档包含以下三个板块：

- **ADDED Requirements** - 当前版本新增或提取的需求
- **MODIFIED Requirements** - 从上一版本修改的需求（初版通常为空）
- **REMOVED Requirements** - 从上一版本删除的需求（初版通常为空）

---

## 文档使用指南

### 对于开发人员
1. 开始实现前阅读对应模块的需求文档
2. 确保实现符合所有 `SHALL` 要求
3. 实现所有场景描述的功能
4. 遵守 `SHALL NOT` 约束条件

### 对于测试人员
1. 根据场景编写测试用例
2. 确保覆盖所有正常流、异常流和边界情况
3. 验证约束条件

### 对于项目经理
1. 使用场景作为验收标准
2. 根据需求模块拆分开发任务
3. 跟踪需求覆盖进度

### 对于需求分析人员
1. 从用户/业务角度编写需求，而非实现角度
2. 使用"系统 SHALL"的标准 EARS 语法
3. 场景描述包含正常流、异常流、边界情况
4. 代码引用使用 `file_path:line_number` 格式

---

## 统计数据

| 指标 | 数值 |
|------|------|
| 总模块数 | 10个 |
| 需求文档数 | 10个 |
| 需求规格数量 | 150+ 个 |
| 场景描述数量 | 300+ 个 |
| 文档创建日期 | 2026-03-03 |
| 生成方式 | AI Agent Team 自动逆向生成 |
| 需求规格 | EARS（Easy Approach to Requirements Syntax） |

---

## 更新日志

| 日期 | 版本 | 描述 | 作者 |
|------|------|------|------|
| 2026-03-03 | 2.0 | 完整更新索引，包含所有10个模块的最新需求文档 | 需求提取团队 |
| 2026-03-03 | 1.0 | 初版索引，8个模块需求文档 | 需求提取团队 |

---

## 验证状态

### 已完成验证
- ✅ 产品理解与项目结构分析
- ✅ 模块识别与划分
- ✅ 会话管理模块需求提取
- ✅ 工作区管理模块需求提取
- ✅ API 配置模块需求提取
- ✅ AI 聊天模块需求提取
- ✅ Onboarding 模块需求提取
- ✅ 快捷键与操作模块需求提取
- ✅ Sources 与 Skills 模块需求提取
- ✅ 国际化模块需求提取
- ✅ 设置模块需求提取
- ✅ 需求索引文件创建

### 待验证
- ⏳ 验证脚本开发
- ⏳ 完整性验证执行

---

## 团队信息

**团队名称**: requirements-extraction-team

**团队目标**: 为 Craft Agents 桌面 AI 客户端建立结构化需求规格文档系统，包含提取类成员和验证类成员。

**团队成员结构**:
- **提取类成员**: 从代码逆向生成需求文档
  - 产品架构分析师
  - 模块提取专家（9名，各负责一个模块）

- **验证类成员**: 验证交付物完整性
  - 文档验证专家
  - 验证脚本开发者

---

## 备注

- 所有需求从用户/业务角度编写，而非实现角度
- 使用"系统 SHALL"的标准 EARS 语法
- 场景描述包含正常流、异常流、边界情况
- 文档中的代码引用使用 `file_path:line_number` 格式
- 所有文档均由 AI Agent Team 自动逆向生成，基于代码分析
- 遵循 SOLID、KISS、DRY、YAGNI 原则进行需求提取
