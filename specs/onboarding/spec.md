# Onboarding Module Specification

## Purpose
Onboarding 引导流程模块为新用户和老用户提供首次配置和设置向导，支持多种 API 连接方式（API Key 和 OAuth）以及 Windows 平台的 Git Bash 检测与配置。

---

## Requirements

### Requirement: 欢迎引导显示
系统 SHALL 根据用户类型显示不同的欢迎文案和操作按钮。

#### Scenario: 新用户进入欢迎界面
- **WHEN** 新用户首次启动应用
- **THEN** 系统显示欢迎标题 "Welcome to Craft Agents"、产品描述文本以及 "Get Started" 按钮
> 来源: apps/electron/src/renderer/components/onboarding/WelcomeStep.tsx:34-42

#### Scenario: 老用户进入设置更新界面
- **WHEN** 已有用户更新 API 连接设置时
- **THEN** 系统显示 "Update Settings" 标题和 "Continue" 按钮
> 来源: apps/electron/src/renderer/components/onboarding/WelcomeStep.tsx:34-42

#### Scenario: 欢迎界面加载状态
- **WHEN** 系统正在检查 Git Bash 状态时
- **THEN** 按钮显示为加载状态，文本为 "Checking..."
> 来源: apps/electron/src/renderer/components/onboarding/WelcomeStep.tsx:41-42

---

### Requirement: Windows Git Bash 配置警告
系统 SHALL 在 Windows 平台检测到 Git Bash 缺失时显示配置警告并提供多种解决方案。

#### Scenario: 检测到 Git Bash 缺失
- **WHEN** 平台为 Windows 且 Git Bash 未找到
- **THEN** 系统显示警告界面"Git Bash Required"并解释需要 Git Bash 的原因
> 来源: apps/electron/src/renderer/components/onboarding/GitBashWarning.tsx:65-67

#### Scenario: 提供 Git for Windows 下载链接
- **WHEN** 用户在 Git Bash 警告界面
- **THEN** 系统提供下载按钮，点击后打开 https://git-scm.com/downloads/win
> 来源: apps/electron/src/renderer/components/onboarding/GitBashWarning.tsx:60-85

#### Scenario: 允许手动指定 Git Bash 路径
- **WHEN** 用户点击"Browse..."按钮选择 bash.exe 文件
- **THEN** 系统显示选择路径的输入框并允许用户确认使用该路径
> 来源: apps/electron/src/renderer/components/onboarding/GitBashWarning.tsx:97-140

#### Scenario: 允许重新检测 Git Bash
- **WHEN** 用户点击"Re-check"按钮
- **THEN** 系统重新检测 Git Bash 状态，如果找到则自动跳转到 API 设置步骤
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:479-494

#### Scenario: 提供返回按钮返回上一步
- **WHEN** 用户在 Git Bash 警告界面点击返回按钮
- **THEN** 系统返回欢迎界面
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:219-222

---

### Requirement: API 连接方式选择
系统 SHALL 提供四种 API 连接方式，按提供商分组显示并支持视觉反馈。

#### Scenario: 显示 Anthropic 分组选项
- **WHEN** 用户进入 API 设置步骤
- **THEN** 系统显示 "Anthropic" 分组，包含 "Claude Pro/Max" 和 "Anthropic API Key" 两个选项
> 来源: apps/electron/src/renderer/components/onboarding/APISetupStep.tsx:174-185

#### Scenario: 显示 OpenAI 分组选项
- **WHEN** 用户进入 API 设置步骤
- **THEN** 系统显示 "OpenAI" 分组，包含 "Codex · ChatGPT Plus/Pro" 和 "Codex · OpenAI API Key" 两个选项
> 来源: apps/electron/src/renderer/components/onboarding/APISetupStep.tsx:189-201

#### Scenario: 选中 API 连接方式
- **WHEN** 用户点击某个 API 连接选项
- **THEN** 系统高亮显示该选项背景，图标显示选中状态，并显示复选标记
> 来源: apps/electron/src/renderer/components/onboarding/APISetupStep.tsx:98-140

#### Scenario: 验证选择后方可继续
- **WHEN** 用户未选择任何 API 连接方式
- **THEN** "Continue" 按钮处于禁用状态
> 来源: apps/electron/src/renderer/components/onboarding/APISetupStep.tsx:167

---

### Requirement: Anthropic API Key 认证
系统 SHALL 提供 Anthropic API Key 输入表单，支持多种端点预设和模型配置。

#### Scenario: 输入 API Key 并显示/隐藏
- **WHEN** 用户在 API Key 输入框中输入内容
- **THEN** 系统提供眼睛图标按钮，点击可切换显示/隐藏 API Key
> 来源: apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:203-214

#### Scenario: 选择端点预设
- **WHEN** 用户从下拉菜单选择端点预设
- **THEN** 系统根据预设自动填充端点 URL，对于非默认预设显示 URL 输入框
> 来源: apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:125-143, 244-260

#### Scenario: 配置默认模型
- **WHEN** 用户选择非默认端点预设（Ollama、OpenRouter、Vercel 或自定义）
- **THEN** 系统显示模型输入框，并支持逗号分隔的模型列表
> 来源: apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:264-327

#### Scenario: 验证 API Key 连接
- **WHEN** 用户提交 API Key 配置
- **THEN** 系统先验证 API Key 和端点连接，验证成功后保存配置
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:274-311

#### Scenario: 提供上下文帮助信息
- **WHEN** 用户选择特定端点预设
- **THEN** 系统显示该预设对应的帮助链接和格式说明
> 来源: apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx:297-316

---

### Requirement: Claude OAuth 认证（两步流程）
系统 SHALL 实现两步式 Claude OAuth 认证流程，包括授权码输入和令牌交换。

#### Scenario: 启动 Claude OAuth 流程
- **WHEN** 用户点击"Sign in with Claude"按钮
- **THEN** 系统调用后端打开浏览器进行 OAuth 授权，并显示授权代码输入界面
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:374-396

#### Scenario: 输入授权代码
- **WHEN** 浏览器打开成功后
- **THEN** 界面切换为"Enter Authorization Code"，显示输入框供用户粘贴授权代码
> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx:98-125

#### Scenario: 提交授权代码
- **WHEN** 用户输入授权代码并点击继续
- **THEN** 系统调用后端交换令牌，成功后保存配置并跳转到完成步骤
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:407-446

#### Scenario: 取消 OAuth 流程
- **WHEN** 用户在等待授权代码时点击取消
- **THEN** 系统清除 OAuth 状态并返回初始界面
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:450-455

---

### Requirement: ChatGPT OAuth 认证（单步流程）
系统 SHALL 实现单步式 ChatGPT OAuth 认证流程，自动捕获令牌。

#### Scenario: 启动 ChatGPT OAuth 流程
- **WHEN** 用户点击"Sign in with ChatGPT"按钮
- **THEN** 系统调用后端在原生浏览器中启动 OAuth 并自动捕获令牌
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:352-372

#### Scenario: ChatGPT OAuth 成功验证
- **WHEN** OAuth 流程成功捕获令牌
- **THEN** 系统自动保存配置并显示成功消息"Connected! Your ChatGPT subscription is ready."
> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx:85-88

#### Scenario: ChatGPT OAuth 失败处理
- **WHEN** OAuth 流程失败
- **THEN** 系统显示错误消息
> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx:80-84

---

### Requirement: OpenAI API Key 认证
系统 SHALL 提供 OpenAI API Key 输入表单，支持标准端点和自定义端点。

#### Scenario: 验证 OpenAI API Key
- **WHEN** 用户正在使用 OpenAI 流程
- **THEN** API Key 为必填项，空值时显示错误提示
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:253-261

#### Scenario: 测试 OpenAI 连接
- **WHEN** 用户提交 OpenAI API Key
- **THEN** 系统调用 testOpenAiConnection 验证 /v1/models 端点
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:277-283

#### Scenario: OpenAI 连接失败
- **WHEN** API Key 验证失败
- **THEN** 系统显示错误消息并保持在凭证步骤
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:293-299

---

### Requirement: 配置完成流程
系统 SHALL 在配置验证成功后保存配置并显示成功界面。

#### Scenario: 保存配置并显示加载状态
- **WHEN** API 验证成功
- **THEN** 系统显示"Setting up..."和保存旋转指示器，同时保存 LLM 连接配置
> 来源: apps/electron/src/renderer/components/onboarding/CompletionStep.tsx:30-42

#### Scenario: 显示配置完成界面
- **WHEN** 配置保存成功
- **THEN** 系统显示"You're all set!"成功消息和"Just start a chat and get to work."描述，出现"Get Started"按钮
> 来源: apps/electron/src/renderer/components/onboarding/CompletionStep.tsx:39-50

#### Scenario: 完成配置并关闭向导
- **WHEN** 用户点击"Get Started"按钮
- **THEN** 系统调用 onComplete 回调关闭引导向导
> 来源: apps/electron/src/renderer/components/onboarding/CompletionStep.tsx:49-50

---

### Requirement: 会话过期重新认证
系统 SHALL 在会话令牌过期时提供简化重新认证界面。

#### Scenario: 显示会话过期界面
- **WHEN** 用户 Craft 令牌过期或无效时
- **THEN** 系统显示"Session Expired"标题，解释会话过期原因，并提示对话记录和设置已保留
> 来源: apps/electron/src/renderer/components/onboarding/ReauthScreen.tsx:49-59

#### Scenario: 执行重新登录
- **WHEN** 用户点击"Log In with Craft"按钮
- **THEN** 系统显示加载状态并执行重新登录逻辑
> 来源: apps/electron/src/renderer/components/onboarding/ReauthScreen.tsx:25-34

#### Scenario: 登录失败错误处理
- **WHEN** 重新登录过程中发生错误
- **THEN** 系统显示错误消息并允许用户重试
> 来源: apps/electron/src/renderer/components/onboarding/ReauthScreen.tsx:93-97

#### Scenario: 重置应用并重新开始
- **WHEN** 用户点击"Reset app and start fresh..."按钮
- **THEN** 系统调用 onReset 回调重置应用状态
> 来源: apps/electron/src/renderer/components/onboarding/ReauthScreen.tsx:81-89

---

### Requirement: 向导状态管理和导航
系统 SHALL 维护向导状态机并提供前进、后退和取消功能。

#### Scenario: 前进到下一步
- **WHEN** 用户点击 Continue 按钮
- **THEN** 系统根据当前步骤执行相应的状态转换
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:184-211

#### Scenario: 后退到上一步
- **WHEN** 用户点击 Back 按钮
- **THEN** 系统返回上一步，如果是初始步骤则调用 onDismiss
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:214-235

#### Scenario: 重置向导状态
- **WHEN** 调用 reset 方法时
- **THEN** 系统重置所有状态到初始值并清除 OAuth 状态
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:511-526

---

## ADDED Requirements

### Requirement: 配置保存回调通知
系统 SHALL 在配置保存到磁盘后立即触发 onConfigSaved 回调通知 UI 更新。

#### Scenario: 保存配置后触发回调
- **WHEN** API 验证成功并保存到磁盘后
- **THEN** 系统调用 onConfigSaved 回调，使 UI 能够立即反映账单和模型变更，无需等待 onCompletion 调用
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:144-181

---

### Requirement: 自定义起始步骤
系统 SHALL 支持从指定步骤开始向导流程，而不仅限于 welcome 步骤。

#### Scenario: 从指定步骤启动向导
- **WHEN** 通过 initialStep 参数指定步骤（如 'api-setup' 或 'credentials'）
- **THEN** 向导直接从指定步骤开始，并支持正常的前进和后退导航
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:107-126

---

### Requirement: 取消引导流程重置
系统 SHALL 提供取消功能，将向导状态重置到欢迎步骤。

#### Scenario: 取消引导并返回欢迎界面
- **WHEN** 调用 handleCancel 方法时
- **THEN** 系统将 step 状态设置为 'welcome'，保留其他状态，不调用 onDismiss
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:505-508

---

### Requirement: 错误消息清除
系统 SHALL 提供清除错误消息的功能。

#### Scenario: 清除 Git Bash 路径错误消息
- **WHEN** 用户在 Git Bash 路径输入框中修改路径时
- **THEN** 系统调用 onClearError 清除之前的错误消息
> 来源: apps/electron/src/renderer/components/onboarding/GitBashWarning.tsx:100-104

---

### Requirement: OAuth 方法覆盖
系统 SHALL 支持在 OAuth 流程中覆盖当前选择的 API 设置方法。

#### Scenario: 使用覆盖方法启动 OAuth
- **WHEN** 调用 handleStartOAuth 并传入 methodOverride 参数
- **THEN** 系统使用指定方法而非 state.apiSetupMethod，并更新状态和步骤
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:326-339

---

### Requirement: API Setup 方法类型映射转换
系统 SHALL 将 ApiSetupMethod 映射为 LlmConnectionSetup 类型用于统一连接系统。

#### Scenario: 映射 Anthropic API Key 方法
- **WHEN** 方法为 'anthropic_api_key' 时
- **THEN** 返回 slug='anthropic-api'，包含 credential、baseUrl、defaultModel、models 字段
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:73-105

#### Scenario: 映射 Claude OAuth 方法
- **WHEN** 方法为 'claude_oauth' 时
- **THEN** 返回 slug='claude-max'，仅包含 credential 字段
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:86-90

#### Scenario: 映射 ChatGPT OAuth 方法
- **WHEN** 方法为 'chatgpt_oauth' 时
- **THEN** 返回 slug='codex'，仅包含 credential 字段
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:91-95

#### Scenario: 映射 OpenAI API Key 方法
- **WHEN** 方法为 'openai_api_key' 时
- **THEN** 返回 slug='codex-api'，包含 credential、baseUrl、defaultModel、models 字段
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:96-104

---

### Requirement: Anthropic API Key 可选验证
系统 SHALL 对 Anthropic API Key 进行可选验证，本地端点时 API Key 可为空。

#### Scenario: Anthropic 本地端点 API Key 可为空
- **WHEN** 用户使用 Ollama 或其他本地端点预设时
- **THEN** 如果未提供 baseUrl，系统要求提供 API Key；如果提供了 baseUrl，API Key 可为空
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:262-272

---

### Requirement: Git Bash 检测异步状态管理
系统 SHALL 在检测 Git Bash 期间维护异步状态并提供用户反馈。

#### Scenario: 启动时开始检测 Git Bash
- **WHEN** 向导启动且初始步骤为 welcome 时
- **THEN** 系统将 isCheckingGitBash 设置为 true，开始异步检测 Git Bash
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:129-141

#### Scenario: 检测完成后更新状态
- **WHEN** Git Bash 检测完成（无论成功或失败）
- **THEN** 系统将 isCheckingGitBash 设置为 false，更新 gitBashStatus
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:129-141

#### Scenario: 按钮根据检测状态禁用
- **WHEN** isCheckingGitBash 为 true 时
- **THEN** Continue 按钮显示加载状态，文本为 "Checking..."
> 来源: apps/electron/src/renderer/components/onboarding/WelcomeStep.tsx:41-42

---

### Requirement: 保存配置错误处理
系统 SHALL 在配置保存失败时显示错误消息并保持当前状态。

#### Scenario: 配置保存失败显示错误
- **WHEN** setupLlmConnection API 调用失败
- **THEN** 系统显示 result.error 或默认错误消息，completionStatus 保持为 'saving'
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:161-180

---

### Requirement: 默认完成状态初始化
系统 SHALL 将 completionStatus 初始化为 'saving' 状态。

#### Scenario: 初始化状态为保存中
- **WHEN** onboarding 状态初始化时
- **THEN** completionStatus 默认为 'saving'，表示配置尚未保存
> 来源: apps/electron/src/renderer/hooks/useOnboarding.ts:116-126

---

## Technical Implementation Notes

### 状态机流程图

```
welcome → (Windows + 无 Git Bash) → git-bash
    |
    └→ api-setup → credentials → complete
```

### API Setup Method 映射

| ApiSetupMethod | ProviderType | AuthType | Connection Slug |
|----------------|--------------|----------|-----------------|
| `claude_oauth` | anthropic | oauth | claude-max |
| `anthropic_api_key` | anthropic | api_key | anthropic-api |
| `chatgpt_oauth` | openai | oauth | codex |
| `openai_api_key` | openai | api_key | codex-api |

### Electron API 调用

- `window.electronAPI.checkGitBash()` - 检测 Git Bash 状态
- `window.electronAPI.browseForGitBash()` - 打开文件选择器
- `window.electronAPI.setGitBashPath(path)` - 设置 Git Bash 路径
- `window.electronAPI.startClaudeOAuth()` - 启动 Claude OAuth
- `window.electronAPI.exchangeClaudeCode(code, slug)` - 交换授权代码
- `window.electronAPI.clearClaudeOAuthState()` - 清除 OAuth 状态
- `window.electronAPI.startChatGptOAuth(slug)` - 启动 ChatGPT OAuth
- `window.electronAPI.setupLlmConnection(setup)` - 保存 LLM 连接配置
- `window.electronAPI.testApiConnection(key, url, models)` - 测试 Anthropic 连接
- `window.electronAPI.testOpenAiConnection(key, url, models)` - 测试 OpenAI 连接

### 端点预设配置

#### Anthropic 提供商预设
- `anthropic` - Anthropic 官方 (https://api.anthropic.com)
- `openrouter` - OpenRouter (https://openrouter.ai/api)
- `vercel` - Vercel AI Gateway (https://ai-gateway.vercel.sh)
- `ollama` - Ollama (http://localhost:11434)
- `custom` - 自定义端点

#### OpenAI 提供商预设
- `openai` - OpenAI 官方 (默认，隐藏 URL)
- `openrouter` - OpenRouter (https://openrouter.ai/api/v1)
- `vercel` - Vercel AI Gateway (https://ai-gateway.vercel.sh/v1)
- `custom` - 自定义端点

### OnboardingState 类型定义

```typescript
type OnboardingStep = 'welcome' | 'git-bash' | 'api-setup' | 'credentials' | 'complete'
type LoginStatus = 'idle' | 'waiting' | 'success' | 'error'
type CredentialStatus = ApiKeyStatus | OAuthStatus
type ApiKeyStatus = 'idle' | 'validating' | 'success' | 'error'
type OAuthStatus = 'idle' | 'validating' | 'success' | 'error'
```

### 组件结构

```
OnboardingWizard (主容器)
├── WelcomeStep (欢迎界面)
├── GitBashWarning (Windows Git Bash 配置)
├── APISetupStep (API 连接方式选择)
├── CredentialsStep (API Key 或 OAuth 认证)
│   └── ApiKeyInput / OAuthConnect (复合组件)
├── CompletionStep (配置成功)
└── ReauthScreen (会话过期重新登录)
```

### Hook 选项接口

```typescript
interface UseOnboardingOptions {
  onComplete: () => void                      // 完成回调
  initialSetupNeeds?: SetupNeeds              // 初始设置需求
  initialStep?: OnboardingStep                // 起始步骤 (默认: 'welcome')
  onDismiss?: () => void                      // 取消回调
  onConfigSaved?: () => void                  // 配置保存回调（立即触发）
}
```
