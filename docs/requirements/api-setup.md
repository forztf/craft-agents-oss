# API配置集成模块需求规格文档

## 文档信息

| 属性 | 值 |
|------|-----|
| 模块名称 | API配置集成 |
| 文档版本 | 1.0 |
| 创建日期 | 2026-03-03 |
| 需求规格 | EARS格式 |

---

## 1. 执行摘要

API配置集成模块负责管理用户与AI服务提供商之间的连接，支持多种认证方式（API密钥、OAuth）和多种端点类型（官方API、第三方网关、本地服务）。该模块为新用户引导流程和应用内设置提供统一的数据输入和验证界面，确保用户能够安全、便捷地连接到所需的AI服务。

### 核心功能点
- 支持Anthropic和OpenAI两大类AI提供商
- 提供API密钥和OAuth两种认证方式
- 预置常用第三方端点（OpenRouter、Vercel AI Gateway、Ollama）
- 支持自定义端点配置
- 模型列表管理和默认模型选择
- 实时连接验证和错误反馈

---

## 2. 架构概览

### 2.1 模块边界

```
┌─────────────────────────────────────────────────────────┐
│                   API配置集成模块                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │  ApiKeyInput │  │ OAuthConnect │                   │
│  └──────────────┘  └──────────────┘                   │
│         ↑                   ↑                          │
│         └─────────┬─────────┘                          │
│                   ↓                                    │
│  ┌──────────────────────────────┐                    │
│  │      APISetupStep           │                    │
│  │    (提供商/认证方式选择)      │                    │
│  └──────────────────────────────┘                    │
│                   ↑                                    │
│                   ↓                                    │
│  ┌──────────────────────────────┐                    │
│  │     CredentialsStep         │                    │
│  │   (引导流程中的认证配置)       │                    │
│  └──────────────────────────────┘                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ 外部接口                                               │
│ - onSubmit(data): 提交配置数据                         │
│ - onStartOAuth(): 启动OAuth流程                        │
│ - onSubmitAuthCode(code): 提交授权码                   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 关键组件

| 组件 | 职责 | 位置 |
|------|------|------|
| `ApiKeyInput` | API密钥输入表单，包含端点预设和模型配置 | `apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx` |
| `OAuthConnect` | OAuth连接流程控制，处理授权码输入 | `apps/electron/src/renderer/components/apisetup/OAuthConnect.tsx` |
| `APISetupStep` | 提供商和认证方式选择步骤 | `apps/electron/src/renderer/components/onboarding/APISetupStep.tsx` |
| `CredentialsStep` | 引导流程中的凭证输入步骤包装器 | `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx` |

---

## 3. 需求规格

### 3.1 提供商选择

#### Requirement: AI提供商选择
- 系统 SHALL 提供 Anthropic 和 OpenAI 两类主要AI提供商供用户选择
- 系统 SHALL 为每个提供商显示对应的认证方式选项
- 系统 SHALL 在提供商选择界面显示提供商的图标和简短描述

#### Scenario: 用户选择Anthropic提供商
- WHEN 用户在提供商选择界面点击Anthropic相关选项
- THEN 系统 SHALL 显示可用的认证方式：Claude Pro/Max（OAuth）和Anthropic API密钥

#### Scenario: 用户选择OpenAI提供商
- WHEN 用户在提供商选择界面点击OpenAI相关选项
- THEN 系统 SHALL 显示可用的认证方式：Codex·ChatGPT Plus/Pro（OAuth）和OpenAI API密钥

---

### 3.2 认证方式

#### Requirement: OAuth认证流程
- 系统 SHALL 支持 Anthropic 和 OpenAI 的OAuth认证流程
- 系统 SHALL 为Claude OAuth提供两步流程：浏览器授权 -> 授权码输入
- 系统 SHALL 为ChatGPT OAuth提供原生浏览器OAuth流程
- 系统 SHALL 在OAuth流程期间显示连接状态（等待连接、连接中、成功、错误）

#### Scenario: Claude OAuth两步流程第一步
- WHEN 用户选择Claude OAuth认证方式并点击"Sign in with Claude"
- THEN 系统 SHALL 在浏览器中打开Anthropic授权页面
- THEN 系统 SHALL 在应用内显示等待用户操作的状态提示

#### Scenario: Claude OAuth两步流程第二步
- WHEN 用户在浏览器中完成授权并获得授权码
- THEN 系统 SHALL 在应用内显示授权码输入表单
- WHEN 用户粘贴授权码并提交
- THEN 系统 SHALL 验证授权码并完成连接

#### Scenario: ChatGPT OAuth原生流程
- WHEN 用户选择ChatGPT OAuth认证方式并点击"Sign in with ChatGPT"
- THEN 系统 SHALL 在浏览器中打开OpenAI授权页面
- THEN 系统 SHALL 等待授权完成回调
- WHEN 授权成功回调收到
- THEN 系统 SHALL 完成连接并显示成功状态

---

### 3.3 API密钥输入

#### Requirement: API密钥输入组件
- 系统 SHALL 提供密码类型的API密钥输入框
- 系统 SHALL 提供显示/隐藏明文的切换按钮
- 系统 SHALL 根据提供商类型显示对应的密钥格式提示（Anthropic: sk-ant-..., OpenAI: sk-...）
- 系统 SHALL 在输入框获得焦点时自动选中

#### Requirement: 端点预设选择
- 系统 SHALL 为Anthropic提供商提供以下端点预设：
  - Anthropic（官方API）
  - OpenRouter
  - Vercel AI Gateway
  - Ollama
  - Custom（自定义）
- 系统 SHALL 为OpenAI提供商提供以下端点预设：
  - OpenAI（官方API）
  - OpenRouter
  - Vercel AI Gateway
  - Custom（自定义）
- 系统 SHALL 当用户选择非官方/自定义预设时显示自定义端点URL输入框
- 系统 SHALL 当用户选择官方预设时隐藏端点URL输入框

#### Requirement: 默认模型配置
- 系统 SHALL 为第三方端点提供默认模型输入框
- 系统 SHALL 支持逗号分隔的模型列表输入
- 系统 SHALL 当端点URL非空且非官方预设时标记模型字段为必填
- 系统 SHALL 当用户选择Ollama预设时预填充推荐模型（qwen3-coder）
- 系统 SHALL 当用户选择OpenRouter或Vercel预设时预填充兼容模型列表
- 系统 SHALL 显示模型字段的可选/必填状态标签
- 系统 SHALL 提供模型格式帮助文本和外部链接

#### Scenario: 用户输入API密钥并选择预设
- WHEN 用户在API密钥输入框中输入密钥
- THEN 系统 SHALL 保存密钥值到组件状态
- WHEN 用户从端点预设下拉菜单选择一个选项
- THEN 系统 SHALL 更新选中的预设状态并设置对应端点URL
- WHEN 新预设为Ollama
- THEN 系统 SHALL 自动填充推荐模型名称

#### Scenario: 用户模型验证失败
- WHEN 用户提交表单且端点配置需要模型但模型字段为空
- THEN 系统 SHALL 显示"Default model is required for compatible endpoints."错误提示
- THEN 系统 SHALL 阻止表单提交

---

### 3.4 端点配置

#### Requirement: 自定义端点URL
- 系统 SHALL 允许用户输入自定义端点URL
- 系统 SHALL 提供URL格式的占位符提示
- 系统 SHALL 根据输入的URL自动匹配合适的端点预设
- 系统 SHALL 当输入URL与已知预设URL匹配时自动切换到对应预设

#### Requirement: 端点URL有效性验证
- 系统 SHALL 在表单提交时验证端点URL格式
- 系统 SHALL 对于空URL且非官方预设的配置视为无效
- 系统 SHALL 提供清晰的错误消息指导用户修正

#### Scenario: 用户输入自定义URL
- WHEN 用户在端点URL输入框中输入一个有效URL
- THEN 系统 SHALL 实时更新组件状态中的URL值
- WHEN 输入的URL与已知预设URL匹配
- THEN 系统 SHALL 自动更新选中预设为匹配的预设类型

---

### 3.5 连接验证

#### Requirement: 连接状态管理
- 系统 SHALL 维护以下连接状态：
  - idle（初始状态）
  - validating（验证中）
  - success（验证成功）
  - error（验证失败）
- 系统 SHALL 在validating状态时禁用所有输入控件
- 系统 SHALL 在success状态时显示成功提示图标
- 系统 SHALL 在error状态时显示错误消息

#### Requirement: 错误处理
- 系统 SHALL 在API密钥验证失败时显示服务器返回的错误消息
- 系统 SHALL 在OAuth流程失败时显示错误描述
- 系统 SHALL 提供清晰的错误分类（网络错误、认证失败、权限不足等）
- 系统 SHALL 错误消息应支持多语言显示

#### Scenario: API密钥验证失败
- WHEN 用户提交API密钥且服务器返回认证失败
- THEN 系统 SHALL 将连接状态设置为error
- THEN 系统 SHALL 显示错误消息
- THEN 系统 SHALL 保持输入控件可用以便用户修正

#### Scenario: OAuth授权码无效
- WHEN 用户提交的OAuth授权码无效或已过期
- THEN 系统 SHALL 显示相应的错误消息
- THEN 系统 SHALL 维持输入表单状态以待用户重新输入

---

### 3.6 表单提交与数据流

#### Requirement: 表单数据提交
- 系统 SHALL 当用户提交表单时收集以下数据：
  - API密钥（字符串，已去除前后空格）
  - 端点URL（可选字符串，官方预设时省略）
  - 默认模型（可选字符串，第一个模型作为默认）
  - 模型列表（可选字符串数组）
- 系统 SHALL 对空端点URL进行特殊处理（使用官方默认）
- 系统 SHALL 将解析后的数据通过onSubmit回调传递给父组件

#### Requirement: 表单验证规则
- 系统 SHALL 验证API密钥字段不为空（除非特定端点如Ollama允许无密钥）
- 系统 SHALL 验证所需模型字段不为空
- 系统 SHALL 在验证失败时显示具体错误并阻止提交

#### Scenario: 用户提交有效配置
- WHEN 用户填写所有必填字段并点击提交
- THEN 系统 SHALL 执行验证检查
- WHEN 所有验证通过
- THEN 系统 SHALL 构造ApiKeySubmitData对象
- THEN 系统 SHALL 调用onSubmit回调传递数据

---

### 3.7 用户界面与交互

#### Requirement: 界面响应性
- 系统 SHALL 在验证过程中显示加载状态指示器
- 系统 SHALL 为密码显示切换按钮提供悬停效果
- 系统 SHALL 为下拉菜单项提供悬停和选中视觉反馈
- 系统 SHALL 输入框获得焦点时显示明显边框样式

#### Requirement: 键盘导航
- 系统 SHALL 支持Tab键在输入控件间导航
- 系统 SHALL 支持Enter键提交表单（当焦点在输入框时）
- 系统 SHALL 支持Escape键取消某些交互（如关闭下拉菜单）

#### Scenario: 用户使用键盘操作
- WHEN 用户按Tab键
- THEN 系统 SHALL 将焦点移动到下一个可交互元素
- WHEN用户按Enter键且焦点在输入框
- THEN 系统 SHALL 触发表单提交

---

### 3.8 预设端点帮助信息

#### Requirement: 端点特定帮助文本
- 系统 SHALL 当用户选择OpenRouter预设时显示：
  - 模型格式要求（provider/model-name）
  - "Browse models"链接指向 https://openrouter.ai/models
- 系统 SHALL 当用户选择Vercel AI Gateway预设时显示：
  - 模型格式要求
  - "View supported models"链接指向 https://vercel.com/docs/ai-gateway
- 系统 SHALL 当用户选择Ollama预设时显示：
  - "Use any model pulled via ollama pull. No API key required."
- 系统 SHALL 当用户选择Custom预设时显示：
  - "Required for custom endpoints. Use the provider-specific model ID."

---

## 4. 数据模型

### 4.1 ApiSetupMethod

```typescript
type ApiSetupMethod =
  | 'anthropic_api_key'
  | 'claude_oauth'
  | 'chatgpt_oauth'
  | 'openai_api_key'
```

### 4.2 ApiKeyStatus / OAuthStatus

```typescript
type ApiKeyStatus = 'idle' | 'validating' | 'success' | 'error'
type OAuthStatus = 'idle' | 'validating' | 'success' | 'error'
```

### 4.3 ApiKeySubmitData

```typescript
interface ApiKeySubmitData {
  apiKey: string
  baseUrl?: string
  connectionDefaultModel?: string
  models?: string[]
}
```

---

## 5. MODIFIED区块

> 本模块自初始版本以来未进行重大架构变更。

---

## 6. REMOVED区块

> 本模块自初始版本以来未移除关键功能。

---

## 7. 附录

### 7.1 术语表

| 术语 | 定义 |
|------|------|
| API密钥 | 用于身份验证的字符串凭证 |
| OAuth | 开放授权协议，允许第三方应用在不暴露用户凭据的情况下访问服务 |
| 端点预设 | 预定义的API服务端点配置 |
| 提供商 | AI服务提供商，如Anthropic、OpenAI |
| 第三方网关 | 中转请求到多个AI提供商的代理服务 |
| 模型列表 | 逗号分隔的AI模型标识符字符串 |
| 默认模型 | 模型列表中用于常规请求的第一个模型 |

### 7.2 外部依赖

| 依赖 | 用途 |
|------|------|
| Anthropic API | Claude模型的官方API接口 |
| OpenAI API | GPT模型的官方API接口 |
| OpenRouter | 多模型聚合API网关 |
| Vercel AI Gateway | Vercel提供的AI服务代理 |

### 7.3 参考资料

- Anthropic API文档: https://docs.anthropic.com
- OpenAI API文档: https://platform.openai.com/docs
- OpenRouter模型列表: https://openrouter.ai/models
- Vercel AI Gateway文档: https://vercel.com/docs/ai-gateway

---

## 8. 变更历史

| 版本 | 日期 | 变更说明 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-03-03 | 初始版本 | 需求提取专家-AI聊天 |
