# API 配置与连接模块需求规格

## Document Information

| Property | Value |
|----------|-------|
| Module Name | API Configuration |
| Version | 3.0 |
| Created | 2026-03-03 |
| Updated | 2026-03-03 |
| Spec Format | OpenSpec |

---

## ADDED Requirements

### Requirement: LLM 提供商支持
系统 SHALL 支持多种 LLM 提供商类型，包括 Anthropic、OpenAI、AWS Bedrock、Google Vertex AI 以及兼容端点。

> 来源: `packages/shared/src/config/llm-connections.ts:31-37`

#### Scenario: Anthropic 直接 API 连接
- **WHEN** 用户创建 providerType 为 'anthropic' 的连接
- **THEN** 系统使用 api.anthropic.com 作为默认端点
- **THEN** 系统提供 Anthropic Claude 模型列表（Opus 4.6、Sonnet 4.5、Haiku 4.5）

> 来源: `packages/shared/src/config/models.ts:53-76`

#### Scenario: Anthropic 兼容端点连接
- **WHEN** 用户创建 providerType 为 'anthropic_compat' 的连接
- **THEN** 系统要求用户提供自定义端点 URL
- **THEN** 系统要求提供模型列表（如 openrouter、vercel、ollama 等）

> 来源: `packages/shared/src/config/llm-connections.ts:283-285`

#### Scenario: OpenAI 直接 API 连接
- **WHEN** 用户创建 providerType 为 'openai' 的连接
- **THEN** 系统使用 Codex 代理连接
- **THEN** 系统提供 OpenAI/Codex 模型列表（GPT-5.3 Codex、GPT-5.1 Codex Mini）

> 来源: `packages/shared/src/config/models.ts:82-97`

#### Scenario: OpenAI 兼容端点连接
- **WHEN** 用户创建 providerType 为 'openai_compat' 的连接
- **THEN** 系统要求用户提供自定义端点 URL
- **THEN** 系统要求提供模型列表

> 来源: `packages/shared/src/config/llm-connections.ts:344-347`

#### Scenario: AWS Bedrock 连接
- **WHEN** 用户创建 providerType 为 'bedrock' 的连接
- **THEN** 系统使用 AWS Bedrock 后端
- **THEN** 系统支持通过 AWS IAM 凭证或环境变量认证

> 来源: `packages/shared/src/config/llm-connections.ts:36`

#### Scenario: Google Vertex AI 连接
- **WHEN** 用户创建 providerType 为 'vertex' 的连接
- **THEN** 系统使用 Google Vertex AI 后端
- **THEN** 系统支持通过 OAuth、服务账号或环境变量认证

> 来源: `packages/shared/src/config/llm-connections.ts:37`

---

### Requirement: 认证机制支持
系统 SHALL 支持多种认证机制，每种认证类型对应不同的凭证存储和验证方式。

> 来源: `packages/shared/src/config/llm-connections.ts:64-72`

#### Scenario: API Key 认证
- **WHEN** 用户的连接使用 authType 为 'api_key'
- **THEN** 系统提供一个 API Key 输入字段
- **THEN** 系统将凭证存储为加密的 API key

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:183-216`

#### Scenario: API Key 带自定义端点认证
- **WHEN** 用户的连接使用 authType 为 'api_key_with_endpoint'
- **THEN** 系统提供 API Key 输入字段和自定义端点 URL 输入字段

> 来源: `packages/shared/src/config/llm-connections.ts:273-275`

#### Scenario: OAuth 浏览器认证
- **WHEN** 用户的连接使用 authType 为 'oauth'
- **THEN** 系统启动浏览器 OAuth 流程
- **THEN** 系统使用 PKCE 协议
- **THEN** 系统存储 access_token、refresh_token 和 expiresAt

> 来源: `packages/shared/src/auth/claude-oauth.ts:1-234`

#### Scenario: AWS IAM 凭证认证
- **WHEN** 用户的连接使用 authType 为 'iam_credentials'
- **THEN** 系统提供 Access Key ID、Secret Access Key 和可选的 Region 输入字段

> 来源: `packages/shared/src/credentials/manager.ts:357-390`

#### Scenario: Bearer Token 认证
- **WHEN** 用户的连接使用 authType 为 'bearer_token'
- **THEN** 系统提供 Bearer Token 输入字段
- **THEN** 系统通过 Authorization 头部发送 token

> 来源: `packages/shared/src/config/llm-connections.ts:464`

#### Scenario: GCP 服务账号认证
- **WHEN** 用户的连接使用 authType 为 'service_account_file'
- **THEN** 系统提供服务账号 JSON 文件上传功能
- **THEN** 系统存储项目 ID 和区域信息

> 来源: `packages/shared/src/credentials/manager.ts:401-434`

#### Scenario: 环境变量认证
- **WHEN** 用户的连接使用 authType 为 'environment'
- **THEN** 系统从环境变量自动读取凭证
- **THEN** 系统无需用户输入

> 来源: `packages/shared/src/config/llm-connections.ts:456-458`

#### Scenario: 无认证本地连接
- **WHEN** 用户的连接使用 authType 为 'none'
- **THEN** 系统不要求任何凭证（如本地 Ollama 连接）

> 来源: `packages/shared/src/credentials/manager.ts:456-458`

---

### Requirement: 端点预设支持
系统 SHALL 提供常用端的预设配置，方便用户快速设置。

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:60-75`

#### Scenario: Anthropic 端点预设
- **WHEN** 用户提供商类型为 Anthropic 并选择预设
- **THEN** 系统提供 Anthropic（https://api.anthropic.com）
- **THEN** 系统提供 OpenRouter（https://openrouter.ai/api）
- **THEN** 系统提供 Vercel AI Gateway（https://ai-gateway.vercel.sh）
- **THEN** 系统提供 Ollama（http://localhost:11434）
- **THEN** 系统提供自定义端点选项

#### Scenario: OpenAI 端点预设
- **WHEN** 用户提供商类型为 OpenAI 并选择预设
- **THEN** 系统提供 OpenAI（默认）
- **THEN** 系统提供 OpenRouter（https://openrouter.ai/api/v1）
- **THEN** 系统提供 Vercel AI Gateway（https://ai-gateway.vercel.sh/v1）
- **THEN** 系统提供自定义端点选项

#### Scenario: Ollama 端点自动模型推荐
- **WHEN** 用户选择 Ollama 预设
- **THEN** 系统将默认模型设置为 'qwen3-coder'

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:136, 153`

#### Scenario: OpenRouter 端点模型格式提示
- **WHEN** 用户选择 OpenRouter 预设
- **THEN** 系统提示模型格式应为 'provider/model-name'
- **THEN** 系统提供浏览模型链接（https://openrouter.ai/models）

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:297-305`

#### Scenario: Vercel AI Gateway 端点模型格式提示
- **WHEN** 用户选择 Vercel AI Gateway 预设
- **THEN** 系统提示模型格式应为 'provider/model-name'
- **THEN** 系统提供支持模型链接（https://vercel.com/docs/ai-gateway）

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:307-316`

---

### Requirement: 模型配置支持
系统 SHALL 支持模型列表配置、默认模型设置和总结模型配置。

> 来源: `packages/shared/src/config/llm-connections.ts:101-108`

#### Scenario: 连接模型列表配置
- **WHEN** 用户为兼容端点配置模型
- **THEN** 系统支持逗号分隔的模型列表输入
- **THEN** 系统将第一个模型作为默认模型
- **THEN** 系统将最后一个模型用作总结模型

> 来源: `packages/shared/src/config/llm-connections.ts:104, apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:294`

#### Scenario: 获取默认模型
- **WHEN** 系统需要获取连接的默认模型
- **THEN** 系统从连接的 .models 数组的第一个元素获取
- **THEN** 系统的默认值为第一个注册模型

> 来源: `packages/shared/src/config/llm-connections.ts:363-370`

#### Scenario: 获取总结模型
- **WHEN** 系统需要获取连接的总结模型
- **THEN** 系统从连接的 .models 数组的最后一个元素获取

> 来源: `packages/shared/src/config/llm-connections.ts:182-186`

#### Scenario: 获取 Mini 模型（Codex）
- **WHEN** 系统需要获取连接的 Mini 模型
- **THEN** 系统从连接的 .models 数组的最后一个元素获取
- **THEN** 系统将模型用于 Codex Mini Agent

> 来源: `packages/shared/src/config/llm-connections.ts:165-169`

#### Scenario: 标准提供商模型注册表
- **WHEN** 用户的标准提供商连接没有显式模型列表
- **THEN** 系统从中心化的 MODEL_REGISTRY 获取模型列表

> 来源: `packages/shared/src/config/models.ts:49-98, packages/shared/src/config/llm-connections.ts:318-331`

#### Scenario: 兼容端点默认模型
- **WHEN** 用户创建兼容端点连接
- **THEN** 系统为 anthropic_compat 提供 Claude 模型列表（'anthropic/claude-opus-4.6', 'anthropic/claude-sonnet-4.5', 'anthropic/claude-haiku-4.5'）
- **THEN** 系统为 openai_compat 提供 Codex 模型列表（'openai/gpt-5.2-codex', 'openai/gpt-5.1-codex-mini'）

> 来源: `packages/shared/src/config/llm-connections.ts:343-356`

---

### Requirement: Claude OAuth 认证
系统 SHALL 支持 Claude 原生浏览器 OAuth 认证，使用 PKCE 协议。

> 来源: `packages/shared/src/auth/claude-oauth.ts:1-234`

#### Scenario: 启动 Claude OAuth 流程
- **WHEN** 用户选择 Claude OAuth 认证
- **THEN** 系统生成 secure random state、code_verifier 和 code_challenge
- **THEN** 系统打开浏览器授权页面
- **THEN** 系统设置状态有效期为 10 分钟

> 来源: `packages/shared/src/auth/claude-oauth.ts:63-102`

#### Scenario: 交换 Claude 授权码
- **WHEN** 用户从授权页面复制授权码并提交
- **THEN** 系统验证 state 参数并检查过期时间
- **THEN** 系统使用 code_verifier 和授权码交换 access_token、refresh_token 和 expiresAt
- **THEN** 系统清理授权码中的 URL 片段和查询参数

> 来源: `packages/shared/src/auth/claude-oauth.ts:132-211`

#### Scenario: OAuth 状态验证
- **WHEN** 用户提交授权码
- **THEN** 系统验证 state 参数
- **THEN** 系统检查过期时间（10 分钟有效期）
- **THEN** 系统在过期时清除状态并抛出错误

> 来源: `packages/shared/src/auth/claude-oauth.ts:137-144`

---

### Requirement: ChatGPT OAuth 认证
系统 SHALL 支持 ChatGPT（OpenAI）原生浏览器 OAuth 认证，使用 PKCE 协议和本地回调服务器。

> 来源: `packages/shared/src/auth/chatgpt-oauth.ts:1-414`

#### Scenario: 启动 ChatGPT OAuth 流程
- **WHEN** 用户选择 ChatGPT OAuth 认证
- **THEN** 系统生成本地回调服务器（监听 localhost 端口）
- **THEN** 系统生成 secure random state 和 PKCE 参数
- **THEN** 系统打开浏览器授权页面
- **THEN** 系统等待回调接收授权码

> 来源: `packages/shared/src/auth/chatgpt-oauth.ts:171-237`

#### Scenario: 本地回调服务器接收授权码
- **WHEN** OAuth 提供商将用户重定向到 localhost 回调
- **THEN** 系统的本地服务器接收授权码和 state 参数
- **THEN** 系统验证 state 参数
- **THEN** 系统验证成功后关闭服务器

> 来源: `packages/shared/src/auth/chatgpt-oauth.ts:77-148`

#### Scenario: 交换 ChatGPT 授权码
- **WHEN** 本地回调服务器接收到有效授权码
- **THEN** 系统使用 code_verifier 和授权码交换 id_token、access_token、refresh_token 和 expiresAt
- **THEN** 系统清除 OAuth 状态

> 来源: `packages/shared/src/auth/chatgpt-oauth.ts:268-340`

#### Scenario: 刷新 ChatGPT tokens
- **WHEN** ChatGPT token 过期且存在 refresh_token
- **THEN** 系统使用 refresh_token 获取新的 access_token 和 id_token

> 来源: `packages/shared/src/auth/chatgpt-oauth.ts:349-405`

#### Scenario: 取消 ChatGPT OAuth 流程
- **WHEN** 用户取消或认证失败
- **THEN** 系统停止本地回调服务器
- **THEN** 系统清除 OAuth 状态

> 来源: `packages/shared/src/auth/chatgpt-oauth.ts:410-414`

---

### Requirement: 连接默认值解析
系统 SHALL 支持三级连接默认值解析：会话级、工作区级和全局级。

> 来源: `packages/shared/src/config/llm-connections.ts:386-395`

#### Scenario: 有效连接 slug 解析
- **WHEN** 系统需要确定当前使用的连接
- **THEN** 系统按照以下优先级顺序解析：会话连接 > 工作区默认 > 全局默认（isDefault 标记）> 第一个可用连接

#### Scenario: 会话连接不可用检测
- **WHEN** 会话有明确的 llmConnection 设置但该连接已删除
- **THEN** 系统将连接标记为不可用
- **THEN** 系统不回退到其他连接

> 来源: `packages/shared/src/config/llm-connections.ts:407-413`

#### Scenario: 无会话连接时的回退
- **WHEN** 会话没有明确的 llmConnection 设置
- **THEN** 系统回退到工作区默认、全局默认或第一个可用连接

---

### Requirement: 凭证管理与存储
系统 SHALL 提供安全的凭证存储和管理功能。

> 来源: `packages/shared/src/credentials/manager.ts:1-660`

#### Scenario: 加密凭证存储
- **WHEN** 用户保存凭证
- **THEN** 系统使用 AES-256-GCM 加密将凭证存储在 ~/.craft-agent/credentials.enc 文件中

#### Scenario: LLM 凭证存储
- **WHEN** 用户保存 LLM 连接凭证
- **THEN** 系统根据 authType 存储不同类型的凭证（api_key、oauth_token、iam_credentials、service_account）

> 来源: `packages/shared/src/credentials/manager.ts:276-434`

#### Scenario: 凭证过期检查
- **WHEN** 系统检查凭证状态
- **THEN** 系统检查 expiresAt 字段
- **THEN** 系统在过期前 5 分钟标记为已过期

> 来源: `packages/shared/src/credentials/manager.ts:546-562`

#### Scenario: 凭证健康检查
- **WHEN** 应用启动或用户检查凭证状态
- **THEN** 系统验证凭证文件可解密
- **THEN** 系统检查默认连接是否有有效凭证

> 来源: `packages/shared/src/credentials/manager.ts:579-649`

#### Scenario: 跨机器迁移检测
- **WHEN** 凭证文件解密失败
- **THEN** 系统识别为跨机器迁移
- **THEN** 系统提示用户重新认证

> 来源: `packages/shared/src/credentials/manager.ts:594-599`

---

### Requirement: 提供商认证组合验证
系统 SHALL 验证提供商类型和认证类型的有效组合。

> 来源: `packages/shared/src/config/llm-connections.ts:432-446`

#### Scenario: Anthropic 有效认证类型
- **WHEN** 用户提供商类型为 'anthropic'
- **THEN** 系统仅允许 'api_key' 或 'oauth' 认证类型

#### Scenario: OpenAI 有效认证类型
- **WHEN** 用户提供商类型为 'openai'
- **THEN** 系统仅允许 'api_key' 或 'oauth' 认证类型

#### Scenario: AWS Bedrock 有效认证类型
- **WHEN** 用户提供商类型为 'bedrock'
- **THEN** 系统仅允许 'bearer_token'、'iam_credentials' 或 'environment' 认证类型

#### Scenario: Google Vertex 有效认证类型
- **WHEN** 用户提供商类型为 'vertex'
- **THEN** 系统仅允许 'oauth'、'service_account_file' 或 'environment' 认证类型

#### Scenario: 兼容端点有效认证类型
- **WHEN** 用户提供商类型为 'anthropic_compat' 或 'openai_compat'
- **THEN** 系统仅允许 'api_key_with_endpoint' 或 'none'（仅 openai_compat）认证类型

---

### Requirement: 连接状态管理
系统 SHALL 管理连接的状态，包括认证状态和验证状态。

> 来源: `packages/shared/src/config/llm-connections.ts:139-148`

#### Scenario: 连接认证状态
- **WHEN** UI 显示连接列表
- **THEN** 系统显示每个连接的 isAuthenticated 状态
- **THEN** 系统显示认证方式描述

#### Scenario: 连接验证状态
- **WHEN** 用户验证连接
- **THEN** 系统显示 'validating'、'success' 或 'error' 状态
- **THEN** 系统显示错误消息（如有）

> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:144-155`

#### Scenario: 默认连接标记
- **WHEN** 用户提供商连接被设置为默认
- **THEN** 系统在 UI 中显示 'Default' 标记

> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:194-197`

---

### Requirement: 模型定义注册表
系统 SHALL 维护中心化的模型定义注册表，作为模型信息的单一真实来源。

> 来源: `packages/shared/src/config/models.ts:1-200`

#### Scenario: 模型注册表内容
- **WHEN** 系统加载模型定义
- **THEN** MODEL_REGISTRY 包含所有模型的 id、name、shortName、description、provider 和 contextWindow

#### Scenario: 按提供商过滤模型
- **WHEN** 系统按提供商获取模型列表
- **THEN** 系统从 MODEL_REGISTRY 过滤出指定提供商的模型

> 来源: `packages/shared/src/config/models.ts:107-115`

#### Scenario: 获取模型显示名称
- **WHEN** 系统需要显示模型名称
- **THEN** 系统从 MODEL_REGISTRY 获取完整名称
- **THEN** 系统回退到模型 ID 的简化版本

> 来源: `packages/shared/src/config/models.ts:181-186`

#### Scenario: 获取模型短名称
- **WHEN** 系统需要显示紧凑 UI 的模型名称
- **THEN** 系统从 MODEL_REGISTRY 获取 shortName
- **THEN** 系统回退到去除版本的前缀

> 来源: `packages/shared/src/config/models.ts:191-200`

---

### Requirement: OAuth 连接组件
系统 SHALL 提供可重用的 OAuth 连接组件。

> 来源: `apps/electron/src/renderer/components/apisetup/OAuthConnect.tsx:1-103`

#### Scenario: OAuth 授权码输入表单
- **WHEN** 用户正在等待输入授权码
- **THEN** 系统显示授权码输入表单（OAuthConnect 组件）
- **THEN** 系统将表单绑定到外部提交按钮

#### Scenario: OAuth 错误消息显示
- **WHEN** OAuth 认证失败
- **THEN** 系统在错误消息区域显示详细的错误信息

> 来源: `apps/electron/src/renderer/components/apisetup/OAuthConnect.tsx:81-83`

#### Scenario: OAuth 状态管理
- **WHEN** OAuth 状态为 'idle'、'validating'、'success' 或 'error'
- **THEN** 系统根据状态控制输入框禁用和错误显示

> 来源: `apps/electron/src/renderer/components/apisetup/OAuthConnect.tsx:21-22`

---

### Requirement: API Key 输入组件
系统 SHALL 提供可重用的 API Key 输入组件。

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:1-337`

#### Scenario: API Key 输入与显示切换
- **WHEN** 用户输入 API Key
- **THEN** 系统提供密码/明文显示切换功能

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:203-215`

#### Scenario: 端点预设选择器
- **WHEN** 用户配置端点
- **THEN** 系统提供下拉菜单选择预设
- **THEN** 系统在自定义端点时显示 URL 输入框

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:218-242`

#### Scenario: 默认模型输入
- **WHEN** 用户配置兼容端点
- **THEN** 系统显示默认模型输入框
- **THEN** 系统支持逗号分隔的模型列表

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:263-328`

#### Scenario: 默认模型验证
- **WHEN** 用户提交兼容端点配置且未填写默认模型
- **THEN** 系统阻止提交
- **THEN** 系统显示错误消息 "Default model is required for compatible endpoints."

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:166-170`

---

### Requirement: 连接操作
系统 SHALL 支持对连接的增删改操作。

> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:142-249`

#### Scenario: 创建连接
- **WHEN** 用户提交新的连接配置
- **THEN** 系统创建新的 LlmConnection 对象
- **THEN** 系统包含 slug、name、providerType、authType、baseUrl、models、defaultModel 和 createdAt

> 来源: `packages/shared/src/config/llm-connections.ts:78-133`

#### Scenario: 编辑连接
- **WHEN** 用户修改现有连接
- **THEN** 系统更新连接配置并保留凭证

> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:213-216`

#### Scenario: 删除连接
- **WHEN** 用户删除连接
- **THEN** 系统删除连接配置及其所有关联凭证
- **THEN** 系统阻止删除最后一个连接

> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:237-244, packages/shared/src/credentials/manager.ts:341-346`

#### Scenario: 设置默认连接
- **WHEN** 用户将连接设置为默认
- **THEN** 系统清除其他连接的 isDefault 标记
- **THEN** 系统将当前连接标记为 isDefault

> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:218-221`

---

### Requirement: Codex 代理连接支持
系统 SHALL 为 OpenAI/Codex 连接提供 Codex 二进制路径配置。

> 来源: `packages/shared/src/config/llm-connections.ts:107-113`

#### Scenario: Codex 路径设置
- **WHEN** 用户创建 OpenAI 提供商连接
- **THEN** 系统提供可选的 codexPath 字段
- **THEN** 系统默认为 PATH 中的 'codex'

#### Scenario: Codex 路径验证
- **WHEN** 系统验证 Codex 连接
- **THEN** 系统检查自定义 codexPath 是否存在
- **THEN** 系统不存在时返回错误

> 来源: `packages/shared/src/config/llm-connections.ts:455-484`

---

### Requirement: 云提供商特定配置
系统 SHALL 为 AWS Bedrock 和 Google Vertex AI 提供云提供商特定配置字段。

> 来源: `packages/shared/src/config/llm-connections.ts:115-124`

#### Scenario: AWS 区域配置
- **WHEN** 用户创建 AWS Bedrock 连接
- **THEN** 系统提供 awsRegion 字段（如 us-east-1）

#### Scenario: GCP 项目 ID 配置
- **WHEN** 用户创建 Google Vertex AI 连接
- **THEN** 系统提供 gcpProjectId 字段

#### Scenario: GCP 区域配置
- **WHEN** 用户创建 Google Vertex AI 连接
- **THEN** 系统提供 gcpRegion 字段（如 us-central1）

---

### Requirement: 连接迁移和向后兼容
系统 SHALL 支持旧版连接配置的迁移。

> 来源: `packages/shared/src/config/llm-connections.ts:538-567`

#### Scenario: 连接类型迁移
- **WHEN** 系统检测到旧版 'type' 字段
- **THEN** 系统将 legacyType 映射到新的 providerType
- **THEN** 系统将 'openai-compat' 映射为 'openai_compat'

> 来源: `packages/shared/src/config/llm-connections.ts:497-506`

#### Scenario: 认证类型迁移
- **WHEN** 系统检测到旧版 authType
- **THEN** 系统根据是否有自定义端点将 'api_key' 映射到 'api_key' 或 'api_key_with_endpoint'

> 来源: `packages/shared/src/config/llm-connections.ts:516-529`

#### Scenario: 连接对象迁移
- **WHEN** 系统加载旧版连接对象
- **THEN** 系统创建包含 providerType 的新连接对象
- **THEN** 系统保留 type 字段以实现向后兼容

---

### Requirement: 工作区级别 AI 设置覆盖
系统 SHALL 支持工作区级别的 AI 设置覆盖。

> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:255-350`

#### Scenario: 工作区连接覆盖
- **WHEN** 用户为工作区设置特定的 LLM 连接
- **THEN** 系统在该工作区中使用指定的连接
- **THEN** 系统不覆盖应用全局默认

#### Scenario: 工作区设置加载
- **WHEN** UI 加载工作区设置卡片
- **THEN** 系统异步加载工作区的 AI 设置（连接、模型、思考级别）

> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:271-285`

#### Scenario: 工作区设置保存
- **WHEN** 用户修改工作区 AI 设置
- **THEN** 系统通过 IPC 调用更新工作区设置
- **THEN** 系统刷新 UI

> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:288-297`

---

### Requirement: 凭证健康问题分类
系统 SHALL 分类并显示不同的凭证健康问题。

> 来源: `packages/shared/src/credentials/manager.ts:579-649, apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:92-138`

#### Scenario: 文件损坏问题
- **WHEN** 凭证文件解析失败
- **THEN** 系统显示 "Credential file is corrupted. Please re-authenticate." 错误

#### Scenario: 解密失败问题
- **WHEN** 凭证文件解密失败
- **THEN** 系统显示 "Credentials from another machine detected" 错误

#### Scenario: 默认连接缺少凭证问题
- **WHEN** 默认连接缺少凭证
- **THEN** 系统显示 "No credentials found for your default connection." 错误

---

### Requirement: 连接重新认证
系统 SHALL 支持重新认证已配置的连接。

> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:223-228`

#### Scenario: 重新认证连接
- **WHEN** 用户点击 "Re-authenticate" 按钮
- **THEN** 系统启动相应的认证流程（OAuth 或 API Key）
- **THEN** 系统更新存储的凭证

---

### Requirement: 连接验证操作
系统 SHALL 支持验证连接的有效性。

> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:229-236`

#### Scenario: 验证连接
- **WHEN** 用户点击 "Validate Connection" 按钮
- **THEN** 系统显示 'validating' 状态
- **THEN** 系统执行连接验证
- **THEN** 系统显示 'success' 或 'error' 状态

---

### Requirement: 连接验证操作
系统 SHALL 支持验证连接的有效性。

> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx:229-236`

#### Scenario: 验证连接
- **WHEN** 用户点击 "Validate Connection" 按钮
- **THEN** 系统显示 'validating' 状态
- **THEN** 系统执行连接验证
- **THEN** 系统显示 'success' 或 'error' 状态

---

### Requirement: OAuth 回调页面
系统 SHALL 为 OAuth 认证流程提供浏览器回调页面，显示认证结果。

> 来源: `packages/shared/src/auth/callback-page.ts:1-183`

#### Scenario: OAuth 认证成功回调页面
- **WHEN** OAuth 提供商将用户重定向到回调 URL 并携带授权码
- **THEN** 系统显示绿色卡片状态消息 "Authorization successful"
- **THEN** 系统显示提示信息 "You can now return to the application."
- **THEN** 系统在 1.5 秒后自动关闭浏览器窗口
- **THEN** 系统（如果提供了 deeplink）重定向到应用

> 来源: `packages/shared/src/auth/callback-page.ts:95-137`

#### Scenario: OAuth 认证失败回调页面
- **WHEN** OAuth 回调包含错误参数
- **THEN** 系统显示红色卡片状态消息 "Authorization failed: {errorDetail}"
- **THEN** 系统显示提示信息 "Please close this window and try again."
- **THEN** 系统提供 "Return to Craft Agents" 链接（如果提供了 deeplink）

> 来源: `packages/shared/src/auth/callback-page.ts:138-178`

#### Scenario: OAuth 回调页面暗黑模式
- **WHEN** 用户操作系统设置为暗黑模式
- **THEN** 系统应用暗黑主题样式（深色背景、更亮的紫色调图标、更亮的状态文本）

> 来源: `packages/shared/src/auth/callback-page.ts:135-168`

---

### Requirement: OAuth 配置管理
系统 SHALL 维护 OAuth 配置的单一真实来源。

> 来源: `packages/shared/src/auth/claude-oauth-config.ts:1-39`

#### Scenario: Claude OAuth 配置
- **WHEN** 系统启动 Claude OAuth 流程
- **THEN** 系统使用 CLIENT_ID '9d1c250a-e61b-44d9-88ed-5944d1962f5e'
- **THEN** 系统使用 AUTH_URL 'https://claude.ai/oauth/authorize'
- **THEN** 系统使用 TOKEN_URL 'https://console.anthropic.com/v1/oauth/token'
- **THEN** 系统使用 REDIRECT_URI 'https://console.anthropic.com/oauth/code/callback'
- **THEN** 系统请求 SCOPES 'org:create_api_key user:profile user:inference'

> 来源: `packages/shared/src/auth/claude-oauth-config.ts:8-36`

#### Scenario: ChatGPT OAuth 配置
- **WHEN** 系统启动 ChatGPT OAuth 流程
- **THEN** 系统使用 CLIENT_ID 'app_EMoamEEZ73f0CkXaXp7hrann'
- **THEN** 系统使用 AUTH_URL 'https://auth.openai.com/oauth/authorize'
- **THEN** 系统使用 TOKEN_URL 'https://auth.openai.com/oauth/token'
- **THEN** 系统使用 REDIRECT_URI 'http://localhost:1455/auth/callback'
- **THEN** 系统监听 CALLBACK_PORT 1455
- **THEN** 系统请求 SCOPES 'openid profile email offline_access'

> 来源: `packages/shared/src/auth/chatgpt-oauth-config.ts:11-46`

#### Scenario: Codex CLI 兼容性参数
- **WHEN** 系统构建 ChatGPT OAuth URL
- **THEN** 系统添加 codex_cli_simplified_flow='true' 参数
- **THEN** 系统添加 id_token_add_organizations='true' 参数
- **THEN** 系统确保与 Codex CLI 的 OAuth 流程兼容

> 来源: `packages/shared/src/auth/chatgpt-oauth-config.ts:58-66, packages/shared/src/auth/chatgpt-oauth.ts:220-221`

---

### Requirement: 凭证过期精细化检查
系统 SHALL 提供细粒度的凭证过期检查机制。

> 来源: `packages/shared/src/credentials/manager.ts:546-562`

#### Scenario: 凭证过期缓冲时间
- **WHEN** 系统检查凭证是否过期
- **THEN** 系统在过期时间前 5 分钟将凭证视为已过期
- **THEN** 系统在显示警告时提供足够的缓冲时间进行刷新

> 来源: `packages/shared/src/credentials/manager.ts:548-549`

#### Scenario: OAuth 无过期时间凭证处理
- **WHEN** OAuth 凭证缺少 expiresAt 字段且有 refreshToken
- **THEN** 系统将凭证视为已过期
- **THEN** 系统强制尝试刷新而不是假设凭证永远有效

#### Scenario: API Key 无过期时间凭证处理
- **WHEN** API Key 凭证缺少 expiresAt 字段
- **THEN** 系统将凭证视为永不过期
- **THEN** 系统假设 API Keys 通常没有明确的过期时间

> 来源: `packages/shared/src/credentials/manager.ts:556-560`

---

### Requirement: OAuth 状态持久化与清理
系统 SHALL 管理状态的持久化和清理。

> 来源: `packages/shared/src/auth/claude-oauth.ts:122-124`

#### Scenario: 清除 Claude OAuth 状态
- **WHEN** Claude OAuth 流程完成或失败
- **THEN** 系统清除内存中的 currentOAuthState
- **THEN** 系统防止状态被重复使用

> 来源: `packages/shared/src/auth/claude-oauth.ts:122-124`

#### Scenario: 检查有效 OAuth 状态存在性
- **WHEN** 系统需要确认是否正在进行有效的 OAuth 流程
- **THEN** 系统检查 currentOAuthState 是否存在
- **THEN** 系统检查当前时间是否在 expiresAt 之前

> 来源: `packages/shared/src/auth/claude-oauth.ts:107-110`

---

### Requirement: 本地端点特殊认证处理
系统 SHALL 支持本地端点的特殊认证需求。

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:136, 317-321`

#### Scenario: Ollama 本地端点推荐模型
- **WHEN** 用户选择 Ollama 预设
- **THEN** 系统预填充推荐模型 'qwen3-coder'
- **THEN** 系统提示用户通过 'ollama pull' 命令拉取模型
- **THEN** 系统允许用户不需要 API Key（authType 可为 'none'）

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:136, 317-320`

#### Scenario: 本地端点允许空 API Key
- **WHEN** 用户配置兼容端点且不需要 API Key（如 Ollama）
- **THEN** 系统允许 API Key 输入为空
- **THEN** 系统根据具体端点类型决定是否验证默认模型

> 来源: `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:162-164, 165-170`

---

## Appendix A: 数据结构

### LlmConnection 接口

```typescript
interface LlmConnection {
  slug: string;                              // URL-safe identifier (e.g., 'anthropic-api', 'ollama-local')
  name: string;                              // Display name shown in UI
  providerType: LlmProviderType;             // Provider type determines backend/SDK implementation
  baseUrl?: string;                          // Custom base URL (required for *_compat providers)
  authType: LlmAuthType;                     // Authentication mechanism
  models?: Array<ModelDefinition | string>;  // Override available models
  defaultModel?: string;                     // Default model for this connection
  codexPath?: string;                        // Path to the Codex binary (for 'openai' provider)
  awsRegion?: string;                        // AWS region (for 'bedrock' provider)
  gcpProjectId?: string;                     // GCP project ID (for 'vertex' provider)
  gcpRegion?: string;                        // GCP region (for 'vertex' provider)
  createdAt: number;                         // Timestamp when connection was created
  lastUsedAt?: number;                       // Timestamp when connection was last used
}
```

> 来源: `packages/shared/src/config/llm-connections.ts:78-133`

### ModelDefinition 接口

```typescript
interface ModelDefinition {
  id: string;              // Model identifier (e.g., 'claude-opus-4-6')
  name: string;            // Human-readable name (e.g., 'Opus 4.6')
  shortName: string;       // Short display name (e.g., 'Opus')
  description: string;     // Brief description of the model's strengths
  provider: ModelProvider; // Provider that offers this model ('anthropic' or 'openai')
  contextWindow: number;   // Maximum context window in tokens
}
```

> 来源: `packages/shared/src/config/models.ts:26-39`

### ClaudeTokens 接口

```typescript
interface ClaudeTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scopes?: string[];
}
```

> 来源: `packages/shared/src/auth/claude-oauth.ts:22-27`

### ChatGptTokens 接口

```typescript
interface ChatGptTokens {
  idToken: string;           // JWT id_token containing user identity claims
  accessToken: string;       // Access token for API calls
  refreshToken?: string;     // Refresh token for getting new tokens
  expiresAt?: number;        // Token expiration timestamp (Unix ms)
}
```

> 来源: `packages/shared/src/auth/chatgpt-oauth.ts:31-40`

---

## Appendix B: 架构说明

### 数据流

```
用户输入 → UI 组件 → 存储配置 (LlmConnection) → 凭证管理器 → 加密存储
         ↓                  ↓                           ↓
   ApiKeyInput      llm-connections.ts           ~/.craft-agent/
   OAuthConnect     CredentialManager            credentials.enc
```

### 连接默认值解析链

```
会话连接 (session.llmConnection)
    ↓ 未设置/不可用
工作区默认 (workspace.defaultLlmConnection)
    ↓ 未设置
全局默认 (isDefault 标记)
    ↓ 未设置
第一个可用连接
```

> 来源: `packages/shared/src/config/llm-connections.ts:386-395`

### OAuth 流程对比

| 特性 | Claude OAuth | ChatGPT OAuth |
|------|-------------|---------------|
| 回调方式 | 手动复制授权码 | 本地回调服务器 |
| 返回令牌 | access_token, refresh_token | id_token, access_token, refresh_token |
| 端口需求 | 无 | localhost 端口（默认 51000） |
| 用户体验 | 两步流程（浏览器 → 复制） | 单步流程（浏览器自动重定向） |

> 来源: `packages/shared/src/auth/claude-oauth.ts`, `packages/shared/src/auth/chatgpt-oauth.ts`

### 凭证存储类型映射

| authType | storageType | 存储内容 |
|----------|-------------|----------|
| api_key | api_key | 单个 token 值 |
| api_key_with_endpoint | api_key | 单个 token 值 |
| bearer_token | api_key | 单个 token 值 |
| oauth | oauth_token | access_token, refresh_token, expiresAt, idToken |
| iam_credentials | iam_credentials | awsAccessKeyId, awsRegion, awsSessionToken |
| service_account_file | service_account | 完整的 JSON 内容, gcpProjectId, gcpRegion |
| environment | null | 无存储（从环境变量读取） |
| none | null | 无存储 |

> 来源: `packages/shared/src/config/llm-connections.ts:224-266`

---

## MODIFIED Requirements

No modified requirements.

---

## REMOVED Requirements

No removed requirements.
