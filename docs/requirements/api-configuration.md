# API 配置模块需求规格文档

## 文档信息

| 属性 | 值 |
|------|-----|
| 模块名称 | API Configuration（API配置模块） |
| 文档版本 | 2.0 |
| 创建日期 | 2026-03-03 |
| 需求规格 | EARS 格式 |

---

## 1. 执行摘要

API 配置模块负责管理 LLM（大语言模型）连接的生命周期，提供统一的配置界面支持多种 AI 服务提供商和认证方式。该模块是应用引导流程（Onboarding）和设置页面的核心组件，为用户提供安全、便捷的 API 凭证管理体验。

### 核心功能点
- 统一的 LLM 连接配置系统（替代旧的独立认证方式）
- 支持多种 LLM 提供商（Anthropic、OpenAI、AWS Bedrock、Google Vertex AI）
- 支持多种认证机制（API密钥、OAuth、AWS IAM、GCP 服务账号、环境变量、无认证）
- 预置常用第三方端点（OpenRouter、Vercel AI Gateway、Ollama）
- 兼容端点支持（`*_compat` 提供商类型用于第三方 API）
- 模型列表管理和默认模型选择
- 实时连接验证和错误反馈
- 会话级、工作区级、全局三级连接默认值链

---

## 2. 架构概览

### 2.1 模块边界

```
┌─────────────────────────────────────────────────────────────────┐
│                        API 配置模块                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  用户界面层                                                       │
│  ┌──────────────────┐  ┌──────────────────────────────────┐    │
│  │   ApiKeyInput    │  │          OAuthConnect            │    │
│  │  (API密钥输入)    │  │        (OAuth连接控制)            │    │
│  └──────────────────┘  └──────────────────────────────────┘    │
│           │                           │                         │
│           └───────────────┬───────────┘                         │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────┐          │
│  │              APISetupStep                         │          │
│  │  (提供商/认证方式选择：Anthropic/OpenAI/其他)     │          │
│  └──────────────────────────────────────────────────┘          │
│                           │                                     │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────┐          │
│  │             CredentialsStep                      │          │
│  │     (引导流程中的凭证配置包装器)                    │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 应用层 (hooks)                                                   │
│  ┌──────────────────────────────────────────────────┐          │
│  │              useOnboarding                        │          │
│  │     (引导流程状态管理和验证逻辑)                   │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ IPC (Electron)
┌─────────────────────────────────────────────────────────────────┐
│  后端层 (Main Process)                                           │
│  - setupLlmConnection() - 创建/更新连接                         │
│  - testApiConnection() - 验证连接                                       │
│  - testOpenAiConnection() - OpenAI 专用验证                       │
│  - startClaudeOAuth() - 启动 Claude OAuth 流程                  │
│  - exchangeClaudeCode() - 交换授权码                               │
│  - startChatGptOAuth() - 启动 ChatGPT OAuth 流程                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 关键组件

| 组件 | 职责 | 位置 |
|------|------|------|
| `ApiKeyInput` | API 密钥输入表单，包含端点预设和模型配置 | `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx` |
| `OAuthConnect` | OAuth 连接流程控制，处理授权码输入 | `apps/electron/src/renderer/components/apisetup/OAuthConnect.tsx` |
| `APISetupStep` | 提供商和认证方式选择步骤 | `apps/electron/src/renderer/components/onboarding/APISetupStep.tsx` |
| `CredentialsStep` | 引导流程中的凭证输入步骤包装器 | `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx` |
| `useOnboarding` | 引导流程状态管理 hook | `apps/electron/src/renderer/hooks/useOnboarding.ts` |
| `llm-connections.ts` | LLM 连接类型定义和辅助函数 | `packages/shared/src/config/llm-connections.ts` |

---

## 3. 需求规格

### 3.1 LLM 提供商类型

#### Requirement: LLM 提供商支持
- 系统 SHALL 支持以下 LLM 提供商类型：
  - `anthropic` - Anthropic 官方 API (api.anthropic.com)
  - `anthropic_compat` - Anthropic 格式兼容端点（OpenRouter 等）
  - `openai` - OpenAI 官方 API（通过 Codex）
  - `openai_compat` - OpenAI 格式兼容端点（Ollama、OpenRouter 等）
  - `bedrock` - AWS Bedrock（Claude 模型）
  - `vertex` - Google Vertex AI（Claude 模型）

#### Requirement: 提供商模型支持
- 系统 SHALL 为 `anthropic`、`bedrock`、`vertex` 提供商使用 Anthropic/Claude 模型
- 系统 SHALL 为 `openai` 提供商使用 OpenAI/Codex 模型
- 系统 SHALL 要求 `*_compat` 提供商提供显式的模型列表

---

### 3.2 认证机制

#### Requirement: 支持的认证类型
- 系统 SHALL 支持以下认证机制：
  - `api_key` - 单 API 密钥字段，固定已知端点
  - `api_key_with_endpoint` - API 密钥 + 自定义端点 URL 字段
  - `oauth` - 浏览器 OAuth 流程
  - `iam_credentials` - AWS 风格（Access Key + Secret Key + Region）
  - `bearer_token` - Bearer token（与 API key header 不同）
  - `service_account_file` - GCP 风格 JSON 文件上传
  - `environment` - 从环境变量自动检测
  - `none` - 无需认证（本地模型如 Ollama）

#### Requirement: 提供商-认证组合验证
- 系统 SHALL 只允许有效的提供商-认证组合：
  - `anthropic` + `api_key` / `oauth`
  - `anthropic_compat` + `api_key_with_endpoint`
  - `openai` + `api_key` / `oauth`
  - `openai_compat` + `api_key_with_endpoint` / `none`
  - `bedrock` + `bearer_token` / `iam_credentials` / `environment`
  - `vertex` + `oauth` / `service_account_file` / `environment`

---

### 3.3 UI 认证方式选择（Onboarding）

#### Requirement: 认证方式选项展示
- 系统 SHALL 为 Anthropic 提供商提供以下选择：
  - Claude Pro/Max（OAuth）
  - Anthropic API Key
- 系统 SHALL 为 OpenAI 提供商提供以下选择：
  - Codex·ChatGPT Plus/Pro（OAuth）
  - Codex·OpenAI API Key

#### Scenario: 用户选择 Claude Pro/Max
- WHEN 用户在 APISetupStep 点击"Claude Pro/Max"选项
- THEN 系统 SHALL 设置 `apiSetupMethod` 为 `claude_oauth`
- THEN 系统 SHALL 在下一步显示"Connect Claude Account"界面

#### Scenario: 用户选择 ChatGPT Plus/Pro
- WHEN 用户在 APISetupStep 点击"Codex·ChatGPT Plus/Pro"选项
- THEN 系统 SHALL 设置 `apiSetupMethod` 为 `chatgpt_oauth`
- THEN 系统 SHALL 在下一步显示"Connect ChatGPT"界面

#### Scenario: 用户选择 Anthropic API Key
- WHEN 用户在 APISetupStep 点击"Anthropic API Key"选项
- THEN 系统 SHALL 设置 `apiSetupMethod` 为 `anthropic_api_key`
- THEN 系统 SHALL 在下一步显示 ApiKeyInput 组件，providerType 设为 `anthropic`

#### Scenario: 用户选择 OpenAI API Key
- WHEN 用户在 APISetupStep 点击"Codex·OpenAI API Key"选项
- THEN 系统 SHALL 设置 `apiSetupMethod` 为 `openai_api_key`
- THEN 系统 SHALL 在下一步显示 ApiKeyInput 组件，providerType 设为 `openai`

---

### 3.4 API 密钥输入

#### Requirement: ApiKeyInput 组件
- 系统 SHALL 提供密码类型的 API 密钥输入框
- 系统 SHALL 提供显示/隐藏明文的切换按钮（眼睛图标）
- 系统 SHALL 根据提供商类型显示对应的密钥格式提示：
  - OpenAI: `sk-...`
  - Anthropic: `sk-ant-...`
- 系统 SHALL 在输入框获得焦点时自动选中（autoFocus）

#### Requirement: 端点预设选择
- 系统 SHALL 为 Anthropic 提供商渲染以下预设：
  - Anthropic（`https://api.anthropic.com`）
  - OpenRouter（`https://openrouter.ai/api`）
  - Vercel AI Gateway（`https://ai-gateway.vercel.sh`）
  - Ollama（`http://localhost:11434`）
  - Custom（自定义）
- 系统 SHALL 为 OpenAI 提供商渲染以下预设：
  - OpenAI（空 URL，使用默认端点）
  - OpenRouter（`https://openrouter.ai/api/v1`）
  - Vercel AI Gateway（`https://ai-gateway.vercel.sh/v1`）
  - Custom（自定义）
- 系统 SHALL 为默认提供商预设（Anthropic/OpenAI）隐藏端点 URL 输入框
- 系统 SHALL 为非默认预设显示端点 URL 输入框

#### Requirement: 预设选择交互
- 系统 SHALL 当用户从下拉菜单选择预设时：
  - 更新 `activePreset` 状态
  - 设置对应端点 URL
  - Ollama 预设：预填充模型 `qwen3-coder`
  - OpenRouter/Vercel 预设：预填充兼容模型列表
  - Custom 预设：清空 URL，预填充兼容模型列表

#### Scenario: 用户选择预设
- WHEN 用户从端点预设下拉菜单选择"OpenRouter"
- THEN 系统 SHALL 更新URL为 `https://openrouter.ai/api`
- THEN 系统 SHALL 显示端点 URL 输入框
- THEN 系统 SHALL 预填充兼容的 Anthropic 模型列表

---

### 3.5 端点 URL 输入

#### Requirement: 自定义端点输入
- 系统 SHALL 提供文本输入框用于端点 URL
- 系统 SHALL 显示占位符：`https://your-api-endpoint.com`
- 系统 SHALL 根据输入的 URL 自动匹配预设

#### Requirement: URL 自动匹配预设
- 系统 SHALL 当用户输入 URL 匹配已知预设 URL 时：
  - 自动更新 `activePreset` 状态为匹配的预设
  - 保持 URL 输入不变

#### Scenario: 用户输入已知预设 URL
- WHEN 用户在端点 URL 输入框输入 `https://openrouter.ai/api`
- THEN 系统 SHALL 自动更新下拉菜单中选中的预设为"OpenRouter"
- THEN 系统 SHALL 保留 URL 输入框可见

---

### 3.6 默认模型配置

#### Requirement: 默认模型字段
- 系统 SHALL 为非默认提供商预设显示模型输入框
- 系统 SHALL 标记模型字段为可选或必填：
  - 空端点 URL + 默认预设：可选（使用提供商模型路由）
  - 非空端点 URL：必填
- 系统 SHALL 支持逗号分隔的模型列表输入
- 系统 SHALL 逗号分隔值两侧的空格在解析时被去除

#### Requirement: 模型验证
- 系统 SHALL 在提交时验证：
  - 如果端点有效且非默认预设，模型列表不能为空
  - 模型字段为空时显示错误："Default model is required for compatible endpoints."

#### Requirement: 模型列表解析
- 系统 SHALL 将逗号分隔的模型字符串解析为字符串数组
- 系统 SHALL 过滤空字符串项
- 系统 SHALL 第一个模型作为默认模型（`connectionDefaultModel`）
- 系统 SHALL 最后一个模型用于总结（`getSummarizationModel`）

#### Requirement: 预设特定帮助文本
- 系统 SHALL 为 OpenRouter 显示：
  - "Required for OpenRouter-compatible endpoints."
  - 模型格式：`provider/model-name`
  - 链接指向 https://openrouter.ai/models
- 系统 SHALL 为 Vercel AI Gateway 显示：
  - "Required for Vercel AI Gateway endpoints."
  - 模型格式：`provider/model-name`
  - 链接指向 https://vercel.com/docs/ai-gateway
- 系统 SHALL 为 Ollama 显示：
  - "Use any model pulled via `ollama pull`. No API key required."
- 系统 SHALL 为 Custom 显示：
  - "Required for custom endpoints. Use the provider-specific model ID."

#### Scenario: 模型验证失败
- WHEN 用户提交表单且端点需要模型但模型字段为空
- THEN 系统 SHALL 在模型字段显示红色错误边框
- THEN 系统 SHALL 显示错误消息："Default model is required for compatible endpoints."
- THEN 系统 SHALL 阻止表单提交

---

### 3.7 Claude OAuth 流程（两步）

#### Requirement: Claude OAuth 两步流程
- 系统 SHALL 支持以下步骤：
  1. 点击"Sign in with Claude"按钮打开浏览器
  2. 浏览器完成授权，用户复制授权码
  3. 应用内输入授权码并完成连接

#### Scenario: 第一步 - 打开授权页面
- WHEN 用户点击"Sign in with Claude"按钮
- THEN 系统 SHALL 调用 `window.electronAPI.startClaudeOAuth()`
- THEN 系统 SHALL 在浏览器中打开 Anthropic OAuth 授权页面
- THEN 系统 SHALL 设置状态为 `isWaitingForCode: true`
- THEN 系统 SHALL 显示"Enter Authorization Code"界面
- THEN 系统 SHALL 显示输入框："Paste your authorization code here"

#### Scenario: 第二步 - 输入授权码
- WHEN 用户在授权码输入框中粘贴代码并提交
- THEN 系统 SHALL 调用 `window.electronAPI.exchangeClaudeCode(code, connectionSlug)`
- THEN 系统 SHALL 验证授权码并交换为访问令牌
- THEN 系统 SHALL 保存令牌到凭证存储
- THEN 系统 SHALL 将状态设置为 `success`
- THEN 系统 SHALL 导航到完成步骤

#### Scenario: 取消 OAuth 流程
- WHEN 用户在等待授权码时点击"Cancel"
- THEN 系统 SHALL 调用 `window.electronAPI.clearClaudeOAuthState()`
- THEN 系统 SHALL 设置 `isWaitingForCode: false`
- THEN 系统 SHALL 返回到上一步骤

---

### 3.8 ChatGPT OAuth 流程（原生）

#### Requirement: ChatGPT OAuth 原生流程
- 系统 SHALL 支持浏览器原生 OAuth 流程
- 系统 SHALL 自动捕获回调令牌
- 系统 SHALL 无需用户手动输入授权码

#### Scenario: ChatGPT OAuth 流程
- WHEN 用户点击"Sign in with ChatGPT"按钮
- THEN 系统 SHALL 调用 `window.electronAPI.startChatGptOAuth(connectionSlug)`
- THEN 系统 SHALL 在浏览器中打开 OpenAI OAuth 授权页面
- THEN 系统 SHALL 等待授权完成回调
- WHEN 授权成功回调收到
- THEN 系统 SHALL 自动捕获 tokens
- THEN 系统 SHALL 保存到凭证存储
- THEN 系统 SHALL 完成连接并显示成功状态

---

### 3.9 连接状态管理

#### Requirement: 连接状态类型
- 系统 SHALL 维护以下状态：
  - `idle` - 初始/空闲状态
  - `validating` - 验证中
  - `success` - 验证/连接成功
  - `error` - 验证/连接失败

#### Requirement: 状态 UI 反馈
- 系统 SHALL 在 `validating` 状态时：
  - 禁用所有输入控件
  - 显示加载指示器
  - 禁用提交按钮
- 系统 SHALL 在 `success` 状态时：
  - 显示成功消息
  - 导航到下一步（Onboarding）或保存配置（Settings）
- 系统 SHALL 在 `error` 状态时：
  - 显示错误消息
  - 保持输入控件可编辑
  - 错误消息支持多语言

---

### 3.10 连接验证

#### Requirement: Anthropic 连接验证
- 系统 SHALL 调用 `window.electronAPI.testApiConnection(apiKey, baseUrl, models)` 进行验证
- 系统 SHALL 验证：
  - API 密钥有效性
  - 端点可访问性
  - 模型可用性
  - 工具支持（Tool support）

#### Requirement: OpenAI 连接验证
- 系统 SHALL 调用 `window.electronAPI.testOpenAiConnection(apiKey, baseUrl, models)` 进行验证
- 系统 SHALL 验证：
  - API 密钥有效性
  - `/v1/models` 端点响应
  - 模型列表

#### Requirement: 验证错误处理
- 系统 SHALL 当验证失败时：
  - 设置状态为 `error`
  - 显示服务器返回的错误消息
  - 保持输入控件可编辑

#### Scenario: API 密钥无效
- WHEN 用户提交无效的 API 密钥
- THEN 系统 SHALL 显示错误消息
- THEN 系统 SHALL 允许用户重新输入

---

### 3.11 表单提交

#### Requirement: 表单数据收集
- 系统 SHALL 当用户提交时收集：
  - `apiKey` - 去除前后空格的字符串
  - `baseUrl` - 可选端点 URL（默认预设时省略）
  - `connectionDefaultModel` - 第一个模型
  - `models` - 模型字符串数组

#### Requirement: 空端点处理
- 系统 SHALL 当端点 URL 为空且为默认预设时：
  - 不传递 `baseUrl`（使用提供商默认）
  - 设置 `isDefault: true`

#### Requirement: 模型列表传递
- 系统 SHALL 当模型列表非空时：
  - 传递完整的 `models` 数组
  - 传递第一个作为 `connectionDefaultModel`

#### Scenario: 提交完整配置
- WHEN 用户填写 Anthropic API Key + OpenRouter URL + 模型列表
- THEN 系统 SHALL 调用 `onSubmit({ apiKey, baseUrl, connectionDefaultModel, models })`
- THEN 父组件 SHALL 执行验证并保存配置

---

### 3.12 LLM 连接数据结构

#### Requirement: LlmConnection 接口
- 系统 SHALL 使用以下连接结构：

```typescript
interface LlmConnection {
  slug: string;                    // URL 安全标识符
  name: string;                    // 显示名称
  providerType: LlmProviderType;    // 提供商类型
  baseUrl?: string;                // 自定义基础 URL
  authType: LlmAuthType;           // 认证机制
  models?: Array<ModelDefinition | string>;  // 模型列表
  defaultModel?: string;           // 默认模型 ID
  codexPath?: string;              // Codex 二进制路径（OpenAI）
  awsRegion?: string;              // AWS 区域（Bedrock）
  gcpProjectId?: string;           // GCP 项目 ID（Vertex）
  gcpRegion?: string;              // GCP 区域（Vertex）
  createdAt: number;               // 创建时间戳
  lastUsedAt?: number;             // 最后使用时间戳
}
```

#### Requirement: LlmConnectionWithStatus 扩展
- 系统 SHALL 支持带认证状态的连接：

```typescript
interface LlmConnectionWithStatus extends LlmConnection {
  isAuthenticated: boolean;        // 是否已认证
  authError?: string;              // 认证错误消息
  isDefault?: boolean;             // 是否为全局默认
}
```

---

### 3.13 连接默认值解析链

#### Requirement: 连接选择优先级
- 系统 SHALL 使用以下优先级解析会话连接：
  1. 会话显式连接（`session.llmConnection`）
  2. 工作区默认覆盖（`workspace.defaultLlmConnection`）
  3. 全局默认（连接的 `isDefault` 标志）
  4. 第一个可用连接

#### Requirement: 失效连接检测
- 系统 SHALL 当会话的显式连接被删除时：
  - 标记会话为"连接不可用"
  - 显示提示信息

---

### 3.14 凭证存储

#### Requirement: 凭证密钥格式
- 系统 SHALL 使用格式：`llm::{slug}::{credentialType}`
- 系统 SHALL 支持的凭证类型：
  - `api_key` - API 密钥或 bearer token
  - `oauth_token` - OAuth tokens（access, refresh, expiry）

#### Requirement: 认证类型到凭证存储映射
- 系统 SHALL 按以下方式映射：
  - `api_key` / `api_key_with_endpoint` / `bearer_token` → `api_key`
  - `oauth` → `oauth_token`
  - `iam_credentials` → `iam_credentials`
  - `service_account_file` → `service_account`
  - `environment` / `none` → `null`

---

### 3.15 多语言支持（i18n）

#### Requirement: 多语言文本
- 系统 SHALL 所有用户可见文本支持多语言
- 系统 SHALL 使用翻译 key 命名空间：
  - `components/apisetup/ApiKeyInput`
  - `components/apisetup/OAuthConnect`
  - `components/onboarding/APISetupStep`
  - `components/onboarding/CredentialsStep`

#### Requirement: 多语言占位符
- 系统 SHALL API 密钥占位符根据提供商本地化：
  - OpenAI: 英文"sk-..." / 中文 "输入您的 OpenAI API 密钥..."
  - Anthropic: 英文"sk-ant-..." / 中文 "输入您的 API 密钥..."

---

## 4. 数据模型

### 4.1 ApiSetupMethod（UI 选择类型）

```typescript
type ApiSetupMethod =
  | 'anthropic_api_key'   // Anthropic + api_key
  | 'claude_oauth'        // Anthropic + oauth
  | 'chatgpt_oauth'       // OpenAI + oauth (Codex)
  | 'openai_api_key';     // OpenAI + api_key (Codex)
```

### 4.2 LlmProviderType（后端提供商类型）

```typescript
type LlmProviderType =
  | 'anthropic'          // Anthropic 官方 API
  | 'anthropic_compat'   // Anthropic 格式兼容端点
  | 'openai'             // OpenAI 官方 API
  | 'openai_compat'      // OpenAI 格式兼容端点
  | 'bedrock'            // AWS Bedrock
  | 'vertex';            // Google Vertex AI
```

### 4.3 LlmAuthType（认证机制类型）

```typescript
type LlmAuthType =
  | 'api_key'                    // API 密钥（固定端点）
  | 'api_key_with_endpoint'      // API 密钥 + 自定义端点
  | 'oauth'                      // 浏览器 OAuth
  | 'iam_credentials'            // AWS IAM 凭证
  | 'bearer_token'               // Bearer token
  | 'service_account_file'       // GCP 服务账号文件
  | 'environment'                // 环境变量
  | 'none';                      // 无认证
```

### 4.4 ApiKeyStatus / OAuthStatus（UI 状态）

```typescript
type ApiKeyStatus = 'idle' | 'validating' | 'success' | 'error';
type OAuthStatus = 'idle' | 'validating' | 'success' | 'error';
```

### 4.5 ApiKeySubmitData（提交数据）

```typescript
interface ApiKeySubmitData {
  apiKey: string;                        // API 密钥
  baseUrl?: string;                      // 可选端点 URL
  connectionDefaultModel?: string;       // 默认模型
  models?: string[];                     // 模型列表
}
```

---

## 5. 使用场景

### 5.1 新用户引导（Onboarding）

#### Scenario 1: 使用 Claude OAuth 连接
1. 用户在 APISetupStep 选择"Claude Pro/Max"
2. 点击"Sign in with Claude"按钮
3. 浏览器打开 Anthropic 授权页面
4. 用户完成授权，复制授权码
5. 应用内粘贴授权码并提交
6. 连接成功，引导完成

#### Scenario 2: 使用 Anthropic API Key + OpenRouter
1. 用户在 APISetupStep 选择"Anthropic API Key"
2. 输入 API 密钥
3. 从下拉菜单选择"OpenRouter"预设
4. 输入模型列表（如 `anthropic/claude-opus-4.6, anthropic/claude-haiku-4.5`）
5. 点击"Continue"验证连接
6. 连接成功，引导完成

#### Scenario 3: 使用 Ollama 本地模型（无 API 密钥）
1. 用户在 APISetupStep 选择"Anthropic API Key"
2. 从下拉菜单选择"Ollama"预设
3. 系统预填充模型 `qwen3-coder`
4. 用户可修改模型名称
5. API 密钥留空
6. 点击"Continue"验证连接
7. 连接成功，引导完成

### 5.2 设置中添加新连接

#### Scenario: 添加 OpenAI API Key + Vercel AI Gateway
1. 用户在设置页面打开"Ai Settings"
2. 点击"Add Connection"
3. 选择"OpenAI"提供商
4. 输入 API 密钥
5. 从预设下拉菜单选择"Vercel AI Gateway"
6. 输入端点 URL（自动填充）
7. 输入模型列表
8. 点击"Save"
9. 连接保存成功，在列表中显示

### 5.3 连接验证失败

#### Scenario: 无效的 API 密钥
1. 用户输入的 API 密钥无效
2. 点击"Continue"
3. 系统显示验证动画
4. 验证失败，显示错误消息
5. 用户重新输入有效密钥
6. 再次提交，连接成功

---

## 6. MODIFIED 区块

### v2.0 变更说明

1. **统一的 LLM 连接系统**
   - 新增 `LlmConnection` 类型系统，取代旧的分立凭证管理
   - 支持多个连接配置和切换

2. **扩展的提供商支持**
   - 新增 AWS Bedrock (`bedrock`)
   - 新增 Google Vertex AI (`vertex`)
   - 改进兼容端点支持

3. **更多的认证机制**
   - 新增 AWS IAM 凭证 (`iam_credentials`)
   - 新增 Bearer token (`bearer_token`)
   - 新增 GCP 服务账号文件 (`service_account_file`)
   - 新增 环境变量自动检测 (`environment`)

4. **连接默认值链**
   - 新增会话级、工作区级、全局三级默认值
   - 新增 `resolveEffectiveConnectionSlug()` 函数

---

## 7. REMOVED 区块

无删除的功能。

---

## 8. 附录

### 8.1 术语表

| 术语 | 定义 |
|------|------|
| LLM Connection | LLM（大语言模型）连接配置，包含提供商、认证、模型等信息 |
| Provider Type | 提供 LLM 服务的实体类型（Anthropic、OpenAI、AWS Bedrock 等） |
| Auth Type | 连接到提供商使用的认证机制 |
| Compat Provider | 兼容端点提供商，使用标准 API 格式但非官方端点 |
| OAuth | 开放授权协议，允许第三方应用在不暴露用户凭据的情况下访问服务 |
| Endpoint | API 服务的网络端点 URL |
| Model List | 逗号分隔的模型标识符字符串数组 |
| Slug | URL 友好的唯一标识符 |

### 8.2 外部依赖

| 依赖 | 用途 |
|------|------|
| Anthropic API | Claude 模型的官方 API 接口 |
| OpenAI API | GPT 模型的官方 API 接口 |
| OpenRouter | 多模型聚合 API 网关 |
| Vercel AI Gateway | Vercel 提供的 AI 服务代理 |
| Ollama | 本地 LLM 运行环境 |
| AWS Bedrock | Amazon Web Services 的 LLM 服务 |
| Google Vertex AI | Google Cloud Platform 的 LLM 服务 |

### 8.3 参考资料

- Anthropic API 文档: https://docs.anthropic.com
- OpenAI API 文档: https://platform.openai.com/docs
- OpenRouter 模型列表: https://openrouter.ai/models
- Vercel AI Gateway 文档: https://vercel.com/docs/ai-gateway
- Ollama 文档: https://ollama.ai
- AWS Bedrock 文档: https://docs.aws.amazon.com/bedrock
- Google Vertex AI 文档: https://cloud.google.com/vertex-ai

### 8.4 相关文件

| 路径 | 描述 |
|------|------|
| `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx` | API 密钥输入组件 |
| `apps/electron/src/renderer/components/apisetup/OAuthConnect.tsx` | OAuth 连接组件 |
| `apps/electron/src/renderer/components/onboarding/APISetupStep.tsx` | 引导流程 API 设置步骤 |
| `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx` | 引导流程凭证步骤 |
| `apps/electron/src/renderer/hooks/useOnboarding.ts` | 引导流程状态管理 hook |
| `packages/shared/src/config/llm-connections.ts` | LLM 连接类型定义 |
| `packages/shared/src/auth/claude-oauth.ts` | Claude OAuth 实现 |
| `packages/shared/src/auth/chatgpt-oauth.ts` | ChatGPT OAuth 实现 |

---

## 9. 变更历史

| 版本 | 日期 | 变更说明 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-03-03 | 初始版本（基于 ApiKeyInput 和 OAuthConnect） | 需求提取专家 |
| 2.0 | 2026-03-03 | 重构为统一 LLM 连接系统，扩展提供商和认证支持 | 需求提取专家 |

---

## 10. 验收标准

### 10.1 功能验收

- [x] 支持 Anthropic API Key 和 OAuth 认证
- [x] 支持 OpenAI API Key 和 OAuth 认证
- [x] 支持端点预设选择（Anthropic、OpenRouter、Vercel、Ollama、Custom）
- [x] 支持自定义端点 URL 输入
- [x] 支持模型列表输入和验证
- [x] Claude OAuth 两步流程（浏览器授权 -> 授权码输入）
- [x] ChatGPT OAuth 原生流程
- [x] 实时连接验证
- [x] 连接状态管理（idle、validating、success、error）
- [x] 多语言支持（英文、简体中文）

### 10.2 非功能验收

- [x] API 密钥输入支持密码类型（不可见）
- [x] 显示/隐藏切换按钮工作正常
- [x] 表单验证提供清晰错误消息
- [x] 键盘导航支持（Tab、Enter、Escape）
- [x] 响应式设计适配不同屏幕尺寸
- [x] 无障碍支持（ARIA 标签）

### 10.3 边界情况

- [x] 空端点 URL 和默认预设下不传递 baseUrl
- [x] Ollama 允许不输入 API 密钥
- [x] 模型字段验证正确识别可选/必填状态
- [x] OAuth 流程取消时正确清理状态
- [x] 多个连接同时存在时选择逻辑正确
