# Craft Agents OSS User Stories

本文档描述了 Craft Agents OSS 项目的用户故事，明确了不同用户角色在各种场景下的需求和验收标准。

## 1. 用户角色 (Personas)

| ID | 角色名称 | 描述 | 典型特征 |
| :--- | :--- | :--- | :--- |
| **P1** | **全栈开发者 (Full Stack Developer)** | 使用 AI 辅助编码、调试和重构的专业开发者。 | 熟悉 CLI，需要连接 Git、数据库，关注效率和自动化。 |
| **P2** | **知识工作者 (Knowledge Worker)** | 利用 AI 处理文档、整理信息、撰写报告的非技术或半技术人员。 | 需要连接 Notion, Gmail, Slack，关注易用性和文档流。 |
| **P3** | **Prompt 工程师 (Prompt Engineer)** | 专注于设计和优化 Prompt，构建自定义 AI 技能的用户。 | 需要灵活的技能定义和调试工具，关注模型表现。 |

---

## 2. Epics & Stories

### Epic 1: 智能会话管理 (Intelligent Session Management)

**目标**: 提供一个高效、持久化且易于管理的多任务工作环境。

| ID | 故事 (User Story) | 优先级 | 验收标准 (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **S1.1** | 作为 **P1/P2**，我希望能够**同时开启多个独立的会话**，以便我可以在不同的任务（如修复 Bug、撰写文档）之间快速切换，而不仅限于线性的单一对话。 | High | 1. 侧边栏显示所有活动会话。<br>2. 点击不同会话可无缝切换上下文。<br>3. 会话状态（Todo/Doing/Done）可见。 |
| **S1.2** | 作为 **P1**，我希望**会话历史能够自动持久化到本地**，以便我在重启应用后能继续之前的上下文，或者回溯几周前的决策过程。 | High | 1. 重启应用后历史记录不丢失。<br>2. 支持全文搜索历史会话内容。<br>3. 数据存储在本地磁盘，不依赖云端同步。 |
| **S1.3** | 作为 **P2**，我希望能**给会话打标签或设置状态**（如 "Todo", "In Progress", "Review"），以便我能像管理项目任务一样管理我的 AI 对话。 | Medium | 1. 提供可视化看板或列表视图。<br>2. 支持拖拽或点击更改会话状态。<br>3. 支持按状态过滤会话。 |

### Epic 2: 全能连接器 (Universal Connector)

**目标**: 打通 AI 与外部世界的数据和能力壁垒。

| ID | 故事 (User Story) | 优先级 | 验收标准 (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **S2.1** | 作为 **P1**，我希望通过 **MCP (Model Context Protocol)** 连接我的 GitHub 仓库和 Postgres 数据库，以便 AI 能直接读取代码库和查询实时数据。 | High | 1. 支持标准 MCP 协议。<br>2. 支持配置 stdio (本地进程) 和 sse (远程服务) 模式。<br>3. 能够识别并调用 MCP Server 暴露的工具。 |
| **S2.2** | 作为 **P2**，我希望**连接我的 Google 账号 (Gmail, Calendar)**，以便我能让 AI 帮我总结未读邮件或安排会议，而不需要编写任何代码。 | High | 1. 提供 OAuth 登录流程。<br>2. 安全存储 OAuth Token。<br>3. AI 能调用 Gmail/Calendar API 执行读写操作。 |
| **S2.3** | 作为 **P1**，我希望 AI 能**直接读取和修改我的本地文件**，以便我能让它直接重构整个项目目录或生成新的测试文件。 | High | 1. 支持挂载本地目录作为数据源。<br>2. AI 能够执行 `ls`, `cat`, `grep`, `write` 等文件操作。<br>3. 文件修改提供 Diff 预览（可选）。 |

### Epic 3: 技能系统 (Skill System)

**目标**: 沉淀和复用高质量的 AI 工作流。

| ID | 故事 (User Story) | 优先级 | 验收标准 (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **S3.1** | 作为 **P3**，我希望**定义自定义技能 (Skill)**，将复杂的 Prompt 工程封装成一个简单的指令（如 `/rewrite-doc`），以便团队成员复用。 | Medium | 1. 此技能可被特定触发词调用。<br>2. 支持参数化输入。<br>3. 技能定义文件可配置和版本化。 |
| **S3.2** | 作为 **P1**，我希望**从 Claude Code 导入现有的技能配置**，以便我想无缝迁移到 Craft Agents 环境中。 | Low | 1. 提供一键导入功能或命令。<br>2. 自动转换配置格式兼容性。 |

### Epic 4: 安全与权限 (Security & Permissions)

**目标**: 在赋予 AI 强大能力的同时，确保数据和系统的安全。

| ID | 故事 (User Story) | 优先级 | 验收标准 (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **S4.1** | 作为 **P1**，我希望**设置权限模式 (Permission Mode)**，在执行敏感操作（如删除文件、发送邮件）前必须经过我的确认。 | Critical | 1. 提供 Safe, Ask, Allow-all 三种模式。<br>2. 在 Ask 模式下，工具调用前弹出确认框。<br>3. 默认配置应偏向安全 (Ask)。 |
| **S4.2** | 作为 **P1**，我希望**敏感凭证 (API Keys, OAuth Tokens) 被加密存储**，以防止恶意软件扫描我的磁盘获取密钥。 | Critical | 1. 使用 AES-256-GCM 等强加密算法。<br>2. 密钥文件在磁盘上不可读。<br>3. 仅在运行时解密到内存。 |
| **S4.3** | 作为 **P1**，我希望**本地 MCP Server 的环境变量被隔离**，防止主进程的敏感 Key (如 `ANTHROPIC_API_KEY`) 泄露给不可信的第三方 MCP 插件。 | High | 1. 启动子进程时过滤环境变量。<br>2. 仅传递显式配置的环境变量。 |

---
