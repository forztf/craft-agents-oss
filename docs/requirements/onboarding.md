# Onboarding 模块需求文档

**模块标识**: onboarding
**模块名称**: 用户引导流程
**目标文件路径**:
- `apps/electron/src/renderer/components/onboarding/`
- `apps/electron/src/main/onboarding.ts`

---

## 模块概述

Onboarding 模块负责用户首次使用时的引导配置流程，包括：
- API 连接配置（支持多种提供商和认证方式）
- Windows 平台 Git Bash 检测与配置
- 凭据管理与验证
- 配置完成引导

该模块为多步骤向导式流程，在新用户首次启动或现有用户更新配置时显示。

---

## 场景需求

### 场景 1.1: 新用户欢迎引导

#### 需求 1.1.1: 显示欢迎界面
**WHEN** 用户首次启动应用
**THE SYSTEM** SHALL 显示欢迎界面

| 状态 | 显示内容 |
|------|----------|
| 新用户 | 显示 "Welcome to Craft Agents" |
| 新用户 | 显示应用介绍文本："Agents with the UX they deserve. Connect anything. Organize your sessions. Everything you need to do the work of your life!" |
| 新用户 | 显示 "Get Started" 按钮 |
| 老用户 | 显示 "Update Settings" |
| 老用户 | 显示 "Update your API connection or change your setup." |
| 老用户 | 显示 "Continue" 按钮 |

#### 需求 1.1.2: 平台环境检查
**WHEN** 用户点击 "Get Started" 或 "Continue" 按钮
**THE SYSTEM** SHALL 检测运行平台环境

| 平台 | 检查内容 |
|------|----------|
| Windows | 检查 Git Bash 是否安装 |
| macOS | 不需要特殊检查 |
| Linux | 不需要特殊检查 |

**WHERE** 检查结果为 "Windows 且未找到 Git Bash"
**THE SYSTEM** SHALL 跳转到 Git Bash 配置步骤（场景 2）

**WHERE** 检查结果为 "其他平台或 Git Bash 已安装"
**THE SYSTEM** SHALL 跳转到 API 设置步骤（场景 3）

---

### 场景 2: Windows Git Bash 配置

#### 需求 2.1: 显示 Git Bash 缺失警告
**WHEN** 在 Windows 上检测到 Git Bash 未安装
**THE SYSTEM** SHALL 显示 Git Bash 配置界面

**界面元素**:
- 标题："Git Bash Required"
- 说明："Craft Agent needs Git Bash to run shell commands on Windows. It was not found on your system."

**提供选项**:
1. 链接到 Git for Windows 下载页面（https://git-scm.com/downloads/win）
2. 浏览选择 bash.exe 文件路径
3. 重新检查按钮
4. 返回按钮

#### 需求 2.2: 手动指定 Git Bash 路径
**WHEN** 用户点击 "Browse..." 按钮
**THE SYSTEM** SHALL 打开文件选择对话框

**WHERE** 用户选择有效的 bash.exe 文件
**THE SYSTEM** SHALL 验证路径有效性并保存

**WHERE** 验证成功
**THE SYSTEM** SHALL 跳转到 API 设置步骤

**WHERE** 验证失败（路径无效）
**THE SYSTEM** SHALL 显示错误提示

#### 需求 2.3: 重新检测 Git Bash
**WHEN** 用户点击 "Re-check" 按钮
**THE SYSTEM** SHALL 重新搜索系统中的 Git Bash

**WHERE** 检测到 Git Bash
**THE SYSTEM** SHALL 自动跳转到 API 设置步骤

**WHERE** 仍未检测到
**THE SYSTEM** SHALL 保持在当前步骤并显示提示

#### 需求 2.4: 跳过 Git Bash 配置
**WHEN** 用户点击 "Back" 按钮
**THE SYSTEM** SHALL 返回欢迎页面或继续到 API 设置步骤（取决于实现策略）

---

### 场景 3: API 连接方式选择

#### 需求 3.1: 显示可用 API 提供商
**WHEN** 用户进入 API 设置步骤
**THE SYSTEM** SHALL 提供 API 提供商选项列表

**界面元素**:
- 标题："Set Up API Connection"
- 说明："Select how you'd like to power your AI agents."

**Anthropic 分组**:

| 选项 ID | 名称 | 描述 | 图标 |
|---------|------|------|------|
| claude_oauth | Claude Pro/Max | Use your Claude subscription for unlimited access. | CreditCard |
| anthropic_api_key | Anthropic API Key | Pay-as-you-go via Anthropic, OpenRouter, or compatible APIs. | Key |

**OpenAI 分组**:

| 选项 ID | 名称 | 描述 | 图标 |
|---------|------|------|------|
| chatgpt_oauth | Codex · ChatGPT Plus/Pro | Use your ChatGPT Plus or Pro subscription with Codex. | Cpu |
| openai_api_key | Codex · OpenAI API Key | Pay-as-you-go via OpenAI Platform, OpenRouter, or Vercel AI Gateway. | Key |

#### 需求 3.2: 选择 API 提供商
**WHEN** 用户点击任意 API 提供商选项
**THE SYSTEM** SHALL 高亮显示选中状态并启用继续按钮

**视觉反馈**:
- 背景颜色变化
- 图标颜色调整
- 显示选中标记（圆圈内的勾选符号）

**WHERE** 未选择任何提供商
**THE SYSTEM** SHALL 禁用继续按钮

#### 需求 3.3: 确认选择
**WHEN** 用户点击 "Continue" 按钮
**THE SYSTEM** SHALL 跳转到凭据输入步骤（场景 4）

---

### 场景 4.1: API Key 认证 —— Anthropic

#### 需求 4.1.1: 显示 API Key 输入表单
**WHEN** 用户选择 "Anthropic API Key"
**THE SYSTEM** SHALL 显示 API Key 配置表单

**界面元素**:
- 标题："API Configuration"
- 说明："Enter your API key. Optionally configure a custom endpoint for OpenRouter, Ollama, or compatible APIs."
- 返回按钮
- 继续按钮（绑定到表单提交）

**表单字段**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| API Key | 密码输入框 | 是（非自定义端点） | 格式：`sk-ant-...` |
| Endpoint | 下拉选择 + 输入框 | 否 | 预设：Anthropic, OpenRouter, Vercel AI Gateway, Ollama, Custom |
| Default Model | 文本输入框 | 是（非默认端点） | 例如：anthropic/claude-opus-4.6, anthropic/claude-haiku-4.5 |

#### 需求 4.1.2: API Key 显示与隐藏
**WHEN** 用户注视 API Key 输入框
**THE SYSTEM** SHALL 提供"显示/隐藏"切换按钮

**WHEN** 用户点击切换按钮
**THE SYSTEM** SHALL 切换输入框的明文/密文显示状态

#### 需求 4.1.3: 端点预设选择
**WHEN** 用户从下拉菜单选择端点预设
**THE SYSTEM** SHALL 更新 Base URL 字段并预填充推荐模型

| 预设 | Base URL | 推荐模型 |
|------|----------|----------|
| Anthropic | https://api.anthropic.com | 隐藏（使用提供商默认） |
| OpenRouter | https://openrouter.ai/api | anthropic/claude-opus-4.6, anthropic/claude-sonnet-4.5, anthropic/claude-haiku-4.5 |
| Vercel AI Gateway | https://ai-gateway.vercel.sh | 同 OpenRouter |
| Ollama | http://localhost:11434 | qwen3-coder |
| Custom | (用户输入) | 需要用户输入 |

**WHERE** 用户选择 "Anthropic" 预设
**THE SYSTEM** SHALL 隐藏 Base URL 输入框（使用默认端点）

#### 需量 4.1.4: API Key 验证
**WHEN** 用户点击继续按钮或按 Enter 键
**THE SYSTEM** SHALL 在保存前验证 API Key 连接

**验证流程**:
1. 检查 API Key 格式
2. 针对非默认端点，检查模型配置
3. 调用 API 端点进行连接测试
4. 验证工具支持（Claude Agents 功能）

**WHERE** 验证成功
**THE SYSTEM** SHALL 保存配置并跳转到完成步骤

**WHERE** 验证失败
**THE SYSTEM** SHALL 显示错误提示并保持在当前步骤

---

### 场景 4.2: OAuth 认证 —— Claude

#### 需求 4.2.1: 显示 Claude OAuth 连接界面
**WHEN** 用户选择 "Claude Pro/Max"
**THE SYSTEM** SHALL 显示 Claude OAuth 连接界面

**界面元素**:
- 标题："Connect Claude Account"
- 说明："Use your Claude subscription to power multi-agent workflows."
- 返回按钮
- "Sign in with Claude" 按钮

#### 需求 4.2.2: 启动 OAuth 浏览器流程
**WHEN** 用户点击 "Sign in with Claude" 按钮
**THE SYSTEM** SHALL 授权并打开浏览器进行 Claude OAuth 认证

**OAuth 流程说明**:
- 这是一个两步流程
- 应用打开浏览器跳转到 Claude 授权页面
- 用户在浏览器中完成授权
- 用户复制授权代码并在应用中粘贴

**显示状态**:
- 按钮显示加载状态："Connecting..."
- 禁用返回按钮

#### 需求 4.2.3: 输入授权代码
**WHEN** 浏览器成功打开授权页面
**THE SYSTEM** SHALL 显示授权代码输入界面

**界面元素**:
- 标题："Enter Authorization Code"
- 说明："Copy the code from the browser page and paste it below."
- 取消按钮
- 继续按钮（绑定到表单提交）
- 授权代码输入框（等宽字体）

**交互说明**:
- 输入框自动获取焦点
- 用户粘贴授权代码后按 Enter 提交

**WHERE** 用户点击取消按钮
**THE SYSTEM** SHALL 放弃当前 OAuth 流程并清除后端状态

#### 需求 4.2.4: 交换授权代码
**WHEN** 用户提交授权代码
**THE SYSTEM** SHALL 将代码交换为有效的访问令牌

**交换流程**:
1. 验证代码格式有效性
2. 调用 Claude API 交换代码
3. 获取访问令牌和刷新令牌
4. 保存令牌到凭证管理器（支持刷新令牌）
5. 保存到 LLM 连接系统

**WHERE** 交换成功
**THE SYSTEM** SHALL 保存配置并跳转到完成步骤

**WHERE** 交换失败
**THE SYSTEM** SHALL 显示错误提示

#### 需求 4.2.5: OAuth 状态管理
**WHEN** 用户取消或失败 OAuth 流程
**THE SYSTEM** SHALL 清除后端 OAuth 状态，避免过期状态干扰

---

### 场景 4.3: OAuth 认证 —— ChatGPT

#### 需求 4.3.1: 显示 ChatGPT OAuth 连接界面
**WHEN** 用户选择 "Codex · ChatGPT Plus/Pro"
**THE SYSTEM** SHALL 显示 ChatGPT OAuth 连接界面

**界面元素**:
- 标题："Connect ChatGPT"
- 说明："Use your ChatGPT Plus or Pro subscription to power Codex."
- 说明："Click the button above to sign in with your OpenAI account. A browser window will open for authentication."
- 返回按钮
- "Sign in with ChatGPT" 按钮（带外部链接图标）

#### 需求 4.3.2: 启动单步 OAuth 流程
**WHEN** 用户点击 "Sign in with ChatGPT" 按钮
**THE SYSTEM** SHALL 启动原生浏览器 OAuth 流程

**OAuth 流程**:
- 单步流程（无需手动复制代码）
- 打开浏览器进行 OpenAI 授权
- 自动捕获授权令牌
- 无需用户输入代码

**显示状态**:
- 按钮显示加载状态："Connecting..."
- 禁用返回按钮

**WHERE** 授权成功
**THE SYSTEM** shall 自动令牌、保存配置并跳转到完成步骤

**WHERE** 授权失败
**THE SYSTEM** shall 显示错误提示并启用返回按钮

---

### 场景 4.4: API Key 认证 —— OpenAI

#### 需求 4.4.1: 显示 OpenAI API Key 输入表单
**WHEN** 用户选择 "Codex · OpenAI API Key"
**THE SYSTEM** SHALL 显示 OpenAI API Key 配置表单

**界面元素**:
- 标题："API Configuration"
- 说明："Enter your OpenAI API key. Optionally configure OpenRouter or Vercel AI Gateway."
- 返回按钮
- 继续按钮（绑定到表单提交）

**表单字段**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| API Key | 密码输入框 | 是 | 格式：`sk-...` |
| Endpoint | 下拉选择 + 输入框 | 否 | 预设：OpenAI, OpenRouter, Vercel AI Gateway, Custom |
| Default Model | 文本输入框 | 是（非默认端点） | 例如：openai/gpt-5.2-codex, openai/gpt-5.1-codex-mini |

#### 需求 4.4.2: OpenAI 端点预设选择
**WHEN** 用户从下拉菜单选择端点预设
**THE SYSTEM** SHALL 更新 Base URL 字段并预填充推荐模型

| 预设 | Base URL | 推荐模型 |
|------|----------|----------|
| OpenAI | (提供者默认) | 隐藏（使用提供商默认） |
| OpenRouter | https://openrouter.ai/api/v1 | openai/gpt-5.2-codex, openai/gpt-5.1-codex-mini |
| Vercel AI Gateway | https://ai-gateway.vercel.sh/v1 | 同 OpenRouter |
| Custom | (用户输入) | 需要用户输入 |

**WHERE** 用户选择 "OpenAI" 预设
**THE SYSTEM** SHALL 隐藏 Base URL 输入框（使用默认端点）

#### 需求 4.4.3: OpenAI API Key 验证
**WHEN** 用户点击继续按钮或按 Enter 键
**THE SYSTEM** SHALL 在保存前验证 API Key 连接

**验证流程**:
1. 检查 API Key 格式
2. 针对非默认端点，检查模型配置
3. 调用 /v1/models 端点进行连接测试

**WHERE** 验证成功
**THE SYSTEM** SHALL 保存配置并跳转到完成步骤

**WHERE** 验证失败
**THE SYSTEM** SHALL 显示错误提示并保持在当前步骤

---

### 场景 5: 配置完成

#### 需求 5.1: 显示保存进度
**WHEN** 保存配置到本地存储
**THE SYSTEM** SHALL 显示加载界面

**界面元素**:
- 标题："Setting up..."
- 说明："Saving your configuration..."
- 加载动画（Spinner）

**保存内容**:
- LLM 连接配置（slug, credential, baseUrl, defaultModel, models）
- OAuth 令牌（包含访问令牌和刷新令牌）

#### 需求 5.2: 显示成功界面
**WHEN** 配置保存成功
**THE SYSTEM** SHALL 显示成功界面

**界面元素**:
- 应用图标
- 标题："You're all set!"
- 说明："Just start a chat and get to work."
- "Get Started" 按钮

**WHERE** 用户点击 "Get Started" 按钮
**THE SYSTEM** SHALL 关闭向导并触发 `onComplete` 回调

---

### 场景 6: 会话过期重新认证

#### 需求 6.1: 显示重新认证界面
**WHEN** 用户已有工作区配置但 Craft 会话令牌已过期或无效
**THE SYSTEM** SHALL 简化的重新登录界面

**界面元素**:
- 提示图标（警告）
- 标题："Session Expired"
- 说明：
  - "Your Craft session has expired or is no longer valid."
  - "Please log in again to continue using Craft Agents."
  - "Your conversations and settings are preserved."
- "Log In with Craft" 按钮（主操作）
- "Reset app and start fresh..." 按钮（次要操作）

#### 需求 6.2: 执行重新登录
**WHEN** 用户点击 "Log In with Craft" 按钮
**THE SYSTEM** SHALL 启行 Craft OAuth 登录流程

**显示状态**:
- 按钮显示加载状态："Logging in..."
- 禁用所有按钮

**WHERE** 登录成功
**THE SYSTEM** SHALL 保存新令牌并刷新界面

**WHERE** 登录失败
**THE SYSTEM** SHALL 显示错误提示

#### 需求 6.3: 重置应用
**WHEN** 用户点击 "Reset app and start fresh..." 按钮
**THE SYSTEM** SHALL 触发应用重置流程

**重置内容**:
- 清除所有本地会话数据
- 重新启动引导流程（场景 1）

---

## 状态机定义

### OnboardingStep 类型
```typescript
type OnboardingStep =
  | 'welcome'      // 欢迎页面
  | 'git-bash'     // Git Bash 配置（Windows）
  | 'api-setup'    // API 方式选择
  | 'credentials'  // 凭据输入
  | 'complete'     // 完成页面
```

### ApiSetupMethod 类型
```typescript
type ApiSetupMethod =
  | 'anthropic_api_key'  // Anthropic API Key
  | 'claude_oauth'       // Claude Pro/Max OAuth
  | 'chatgpt_oauth'      // ChatGPT OAuth
  | 'openai_api_key'     // OpenAI API Key
```

### CredentialStatus 类型
```typescript
type ApiKeyStatus = 'idle' | 'validating' | 'success' | 'error'
type OAuthStatus = 'idle' | 'validating' | 'success' | 'error'
type CredentialStatus = ApiKeyStatus | OAuthStatus
```

### OnboardingState 接口
```typescript
interface OnboardingState {
  step: OnboardingStep
  loginStatus: 'idle' | 'waiting' | 'success' | 'error'
  credentialStatus: CredentialStatus
  completionStatus: 'saving' | 'complete'
  apiSetupMethod: ApiSetupMethod | null
  isExistingUser: boolean
  errorMessage?: string
  gitBashStatus?: GitBashStatus
  isRecheckingGitBash?: boolean
  isCheckingGitBash?: boolean
}
```

---

## LLM 连接配置映射

### ApiSetupMethod 到 LlmConnectionSetup 的映射
```typescript
function apiSetupMethodToConnectionSetup(method: ApiSetupMethod): LlmConnectionSetup
```

| ApiSetupMethod | Slug | Credential Type |
|----------------|------|-----------------|
| anthropic_api_key | anthropic-api | API Key |
| claude_oauth | claude-max | OAuth Token |
| chatgpt_oauth | codex | OAuth Token |
| openai_api_key | codex-api | API Key |

---

## IPC 通信

### 主进程提供的 IPC 处理器 (`apps/electron/src/main/onboarding.ts`)

| IPC 频道 | 功能 | 返回值 |
|----------|------|--------|
| ONBOARDING_GET_AUTH_STATE | 获取当前认证状态 | { authState, setupNeeds } |
| ONBOARDING_VALIDATE_MCP | 验证 MCP 连接 | McpValidationResult |
| ONBOARDING_START_MCP_OAUTH | 启动 MCP OAuth | { success, accessToken?, clientId?, error? } |
| ONBOARDING_START_CLAUDE_OAUTH | 启动 Claude OAuth（打开浏览器） | { success, authUrl?, error? } |
| ONBOARDING_EXCHANGE_CLAUDE_CODE | 交换 Claude 授权代码 | { success, token?, error? } |
| ONBOARDING_HAS_CLAUDE_OAUTH_STATE | 检查有效的 Claude OAuth 状态 | boolean |
| ONBOARDING_CLEAR_CLAUDE_OAUTH_STATE | 清除 Claude OAuth 状态 | { success } |

### 渲染进程可用的 API (`window.electronAPI`)

| 方法 | 功能 |
|------|------|
| testApiConnection(apiKey, baseUrl?, models?) | 测试 Anthropic API 连接 |
| testOpenAiConnection(apiKey, baseUrl?, models?) | 测试 OpenAI API 连接 |
| setupLlmConnection(setup) | 保存 LLM 连接配置到存储 |
| startClaudeOAuth() | 启动 Claude OAuth 浏览器流程 |
| exchangeClaudeCode(code, connectionSlug) | 交换 Claude 授权代码 |
| startChatGptOAuth(connectionSlug) | 启动 ChatGPT OAuth（原声浏览器） |
| clearClaudeOAuthState() | 清除 Claude OAuth 状态 |
| checkGitBash() | 检查 Git Bash 是否安装 |
| browseForGitBash() | 打开文件选择对话框选择 bash.exe |
| setGitBashPath(path) | 设置 Git Bash 自定义路径 |

---

## 用户界面组件

### 核心组件

| 组件文件 | 功能 |
|----------|------|
| OnboardingWizard.tsx | 向导容器，管理所有步骤 |
| WelcomeStep.tsx | 欢迎页面 |
| GitBashWarning.tsx | Git Bash 配置警告 |
| APISetupStep.tsx | API 方式选择 |
| CredentialsStep.tsx | 凭据输入（API Key 和 OAuth） |
| CompletionStep.tsx | 完成页面 |
| ReauthScreen.tsx | 会话过期重新认证 |
| primitives.tsx | 共享 UI 原语（StepFormLayout, BackButton, ContinueButton） |

### 组合组件依赖

| 组件 | 使用的组合组件 |
|------|----------------|
| CredentialsStep | ApiKeyInput, OAuthConnect |
| ApiKeyInput | Input, Label, DropdownMenu |
| OAuthConnect | Input, Label |

---

## 浏览器与外部交互

### 外部链接操作
- Git for Windows 下载：https://git-scm.com/downloads/win
- OpenRouter 模型列表：https://openrouter.ai/models
- Vercel AI Gateway 文档：https://vercel.com/docs/ai-gateway
- Claude OAuth 授权页面（动态生成）
- ChatGPT OAuth 授权页面（动态生成）

### 浏览器打开行为
- 使用系统默认浏览器打开外部链接
- OAuth 流程使用深度链接或本地回调
- 应用窗口保持在 OAuth 流程期间

---

## 非功能性需求

### 易用性
- 所有交互提供清晰的加载状态反馈
- 错误消息应提供可操作的指导
- 支持键盘导航（Enter 提交，Esc 取消）
- 支持表单自动聚焦

### 可访问性
- 所有图标提供备用文本
- 表单字段提供正确的 label 和 placeholder
- 错误消息使用语义化的 HTML 元素
- 颜色对比度符合 WCAG AA 标准

### 多语言支持
- 所有 用户可见文本支持国际化
- 翻译 key 按组件文件组织
- 支持动态语言切换

### 数据安全
- API Key 和 OAuth 令牌使用系统凭证管理器存储
- 传输过程使用 HTTPS
- 错误日志中不泄露敏感信息

### 性能
- 保存配置操作异步执行（不阻塞 UI）
- 支持取消加载中的异步操作
- 最小化不必要的组件重渲染

---

## 用户故事验收标准

### 故事 1: 新用户首次配置 Claude Pro/Max
**Given** 新用户首次启动
**When** 用户完成欢迎页面
**And** 用户选择 "Claude Pro/Max"
**And** 用户点击 "Sign in with Claude"
**And** 用户在浏览器中授权并复制授权代码
**And** 用户在应用中粘贴并提交代码
**Then** 系统验证并保存配置
**And** 显示成功页面
**And** 用户点击 "Get Started" 进入主界面

### 故事 2: Windows 用户配置 Git Bash
**Given** Windows 用户首次启动
**And** 系统未安装 Git Bash
**When** 用户点击 "Get Started"
**Then** 系统显示 Git Bash 配置界面
**When** 用户点击 "Browse..." 并选择有效的 bash.exe
**Then** 系统验证路径并继续
**And** 用户完成 API 配置后可以正常使用

### 故事 3: 老用户更新 API 配置
**Given** 已有配置的用户打开设置
**When** 用户选择更新 API 连接
**Then** 系统显示 "Update Settings" 页面
**And** 用户可以修改 API Key 或切换提供商
**And** 保存后配置立即生效

### 故事 4: 会话过期重新登录
**Given** 已有工作区配置的用户
**When** Craft 会话过期
**Then** 系统显示重新登录界面
**And** 用户点击 "Log In with Craft" 后完成 OAuth
**Then** 系统保留所有之前的对话和设置
**And** 用户可以继续使用

---

## 技术约束

- 使用自定义的 useTranslation hook 进行国际化
- 翻译 key 使用完整英文原文（可读性优先）
- 组件使用 styled-components 和 Tailwind CSS 样式
- 使用 Electron IPC 进行主、渲染进程通信
- 凭据存储依赖 `@craft-agent/shared/credentials`
- LLM 连接系统使用 `@craft-agent/shared/config`

---

## 相关文件清单

### 渲染进程组件
- `apps/electron/src/renderer/components/onboarding/OnboardingWizard.tsx`
- `apps/electron/src/renderer/components/onboarding/WelcomeStep.tsx`
- `apps/electron/src/renderer/components/onboarding/GitBashWarning.tsx`
- `apps/electron/src/renderer/components/onboarding/APISetupStep.tsx`
- `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx`
- `apps/electron/src/renderer/components/onboarding/CompletionStep.tsx`
- `apps/electron/src/renderer/components/onboarding/ReauthScreen.tsx`
- `apps/electron/src/renderer/components/onboarding/primitives.tsx`

### 渲染进程逻辑
- `apps/electron/src/renderer/hooks/useOnboarding.ts`

### 主进程逻辑
- `apps/electron/src/main/onboarding.ts`

### 组合组件
- `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx`
- `apps/electron/src/renderer/components/apisetup/OAuthConnect.tsx`

### 类型定义
- `apps/electron/src/shared/types.ts`

### 翻译文件（英文）
- `i18n/locales/en/components/onboarding/WelcomeStep.json`
- `i18n/locales/en/components/onboarding/GitBashWarning.json`
- `i18n/locales/en/components/onboarding/APISetupStep.json`
- `i18n/locales/en/components/onboarding/CredentialsStep.json`
- `i18n/locales/en/components/onboarding/CompletionStep.json`
- `i18n/locales/en/components/onboarding/ReauthScreen.json`
- `i18n/locales/en/components/onboarding/primitives.json`

### 翻译文件（简体中文）
- `i18n/locales/zh-CN/components/onboarding/WelcomeStep.json`
- `i18n/locales/zh-CN/components/onboarding/GitBashWarning.json`
- `i18n/locales/zh-CN/components/onboarding/APISetupStep.json`
- `i18n/locales/zh-CN/components/onboarding/CredentialsStep.json`
- `i18n/locales/zh-CN/components/onboarding/CompletionStep.json`
- `i18n/locales/zh-CN/components/onboarding/ReauthScreen.json`
- `i18n/locales/zh-CN/components/onboarding/primitives.json`

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2026-03-03 | 初始版本 - 从代码逆向提取功能需求 |

---

## 变更记录

### 需求提取完成状态
- [x] 场景 1: 欢迎引导
- [x] 场景 2: Git Bash 配置
- [x] 场景 3: API 连接方式选择
- [x] 场景 4.1: API Key - Anthropic
- [x] 场景 4.2: OAuth - Claude
- [x] 场景 4.3: OAuth - ChatGPT
- [x] 场景 4.4: API Key - OpenAI
- [x] 场景 5: 配置完成
- [x] 场景 6: 会话过期重新认证
