# Onboarding 引导流程需求规格说明书

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档标题 | Onboarding 引导流程需求规格说明书 |
| 文档版本 | 1.0.0 |
| 创建日期 | 2026-03-03 |
| 模块标识 | onboarding |
| 负责人 | 需求提取团队 |

## 1. 执行摘要

Onboarding 引导流程是 Craft Agents 应用的用户初次设置向导，负责引导用户完成应用初始化配置，包括 API 连接设置、身份验证以及系统依赖检查。该模块支持新用户首次使用和现有用户更新配置两种场景。

### 1.1 核心功能

- 欢迎页面展示
- API 连接方式选择（Claude OAuth、API Key、ChatGPT OAuth、OpenAI API Key）
- 凭据输入与验证（支持 API Key 和 OAuth 两种认证方式）
- Windows Git Bash 依赖检测与配置
- 配置完成确认页面
- 会话过期重新认证流程

### 1.2 用户角色

| 角色 | 描述 |
|------|------|
| 新用户 | 首次使用 Craft Agents 的用户，需要完成完整的初始化配置 |
| 现有用户 | 已有配置但需要更新 API 连接设置的用户 |
| 过期用户 | 会话 Token 过期需要重新认证的用户 |

---

## 2. 架构概览

### 2.1 引导流程状态机

```
┌─────────┐    ┌──────────┐    ┌────────────┐    ┌────────────┐    ┌──────────┐
│ Welcome │──▶│ Git Bash │──▶│ API Setup  │──▶│ Credentials│──▶│ Complete │
└─────────┘    └──────────┘    └────────────┘    └────────────┘    └──────────┘
    │               │                   │                   │
    │               │                   │                   │
    └──────────▶(skip)                  │                   │
                                        │                   │
                                        └───────▶ OAuth Code Step
```

### 2.2 API Setup 方法映射

| Setup Method | Provider Type | Auth Type |
|--------------|---------------|-----------|
| `claude_oauth` | anthropic | oauth |
| `anthropic_api_key` | anthropic | api_key |
| `chatgpt_oauth` | openai | oauth |
| `openai_api_key` | openai | api_key |

---

## 3. 详细需求规格

#### Requirement: 欢迎页面展示

**系统 SHALL** 提供欢迎页面作为引导流程的起始界面。
- 系统 SHALL 显示 Craft Agents 应用图标
- 系统 SHALL 区分新用户和现有用户，显示不同的标题和描述文本
- 系统 SHALL 显示继续按钮或"开始使用"按钮
- 系统 SHALL 支持加载状态显示（如检查 Git Bash 时）

**Scenario: 新用户引导**
- WHEN 新用户首次打开应用
- THEN 系统显示标题"欢迎来到 Craft Agents"
- THEN 系统显示应用介绍文案
- THEN 系统显示"开始使用"按钮

**Scenario: 现有用户更新设置**
- WHEN 现有用户访问设置页面进行 API 连接更新
- THEN 系统显示标题"更新设置"
- THEN 系统提示更新 API 连接设置
- THEN 系统显示"继续"按钮

**Scenario: 加载状态显示**
- WHEN 系统执行后台检查（如 Git Bash 检测）
- THEN 系统显示加载动画
- THEN 系统显示"检查中..."文本
- THEN 继续按钮处于禁用状态

---

#### Requirement: Git Bash Windows 依赖检查

**系统 SHALL** 在 Windows 平台检测 Git Bash 可用性。
- 系统 SHALL 在进入引导流程前检查 Git Bash 是否存在
- 系统 SHALL 当 Git Bash 缺失时显示警告页面
- 系统 SHALL 提供下载 Git for Windows 的入口
- 系统 SHALL 支持用户手动指定 bash.exe 路径
- 系统 SHALL 支持重新检测 Git Bash

**Scenario: Git Bash 缺失警告**
- WHEN Windows 系统检测到 Git Bash 不可用
- THEN 系统显示"需要 Git Bash"标题
- THEN 系统显示解释为何需要 Git Bash 的描述
- THEN 系统显示下载 Git for Windows 按钮
- THEN 系统提供手动指定路径选项

**Scenario: 下载 Git for Windows**
- WHEN 用户点击下载按钮
- THEN 系统打开 Git for Windows 官方下载页面

**Scenario: 手动指定 Git Bash 路径**
- WHEN 用户已有 Git 但安装位置不标准
- THEN 用户选择浏览按钮选择 bash.exe
- THEN 系统将选择的路径保存为自定义路径
- THEN 系统验证路径有效性

**Scenario: 使用自定义路径**
- WHEN 用户输入有效的 bash.exe 路径
- THEN 用户点击"使用此路径"按钮
- THEN 系统保存自定义 Git Bash 路径

**Scenario: 重新检测 Git Bash**
- WHEN 用户安装 Git 后点击重新检测
- THEN 系统执行重新检测
- THEN 检测成功则进入下一步，失败则显示错误消息

---

#### Requirement: API 连接方式选择

**系统 SHALL** 让用户选择 API 连接方式。
- 系统 SHALL 提供四种 API 连接方式选项
- 系统 SHALL 按服务商分组显示选项（Anthropic 和 OpenAI）
- 系统 SHALL 显示每个选项的名称和描述
- 系统 SHALL 为每个选项显示对应的图标
- 系统 SHALL 仅允许选择一个连接方式
- 系统 SHALL 禁用继续按钮，直到用户做出选择

**Scenario: 选择 Claude Pro/Max**
- WHEN 用户选择"Claude Pro/Max"选项
- THEN 系统显示该选项为选中状态
- THEN 启用继续按钮
- THEN 下一步使用 OAuth 认证方式

**Scenario: 选择 Anthropic API Key**
- WHEN 用户选择"Anthropic API Key"选项
- THEN 系统显示该选项为选中状态
- THEN 启用继续按钮
- THEN 下一步使用 API Key 认证方式

**Scenario: 选择 Codex ChatGPT OAuth**
- WHEN 用户选择"Codex · ChatGPT Plus/Pro"选项
- THEN 系统显示该选项为选中状态
- THEN 启用继续按钮
- THEN 下一步使用 OpenAI OAuth 认证方式

**Scenario: 选择 OpenAI API Key**
- WHEN 用户选择"Codex · OpenAI API Key"选项
- THEN 系统显示该选项为选中状态
- THEN 启用继续按钮
- THEN 下一步使用 API Key 认证方式

---

#### Requirement: API Key 凭据输入

**系统 SHALL** 支持用户输入 API Key 进行认证。
- 系统 SHALL 根据选择的连接方式显示对应的输入表单
- 系统 SHALL 提供 API Key 输入字段
- 系统 SHALL 可选提供自定义端点配置
- 系统 SHALL 可选提供模型配置
- 系统 SHALL 提供表单验证功能
- 系统 SHALL 验证成功后继续下一步

**Scenario: 输入 Anthropic API Key**
- WHEN 用户选择 Anthropic API Key 方式
- THEN 系统显示标题"API 配置"
- THEN 系统显示描述"输入您的 API 密钥。可选择配置自定义端点..."
- THEN 系统提供 API Key 输入框
- THEN 系统可能提供 OpenRouter、Ollama 等兼容端点选项

**Scenario: 输入 OpenAI API Key**
- WHEN 用户选择 OpenAI API Key 方式
- THEN 系统显示标题"API 配置"
- THEN 系统显示描述"输入您的 OpenAI API 密钥..."
- THEN 系统提供 API Key 输入框
- THEN 系统可能提供 OpenRouter、Vercel AI Gateway 等兼容端点选项

**Scenario: API Key 验证失败**
- WHEN 输入的 API Key 无效
- THEN 系统显示错误消息
- THEN 继续按钮保持禁用状态或显示验证状态

**Scenario: API Key 验证成功**
- WHEN 输入的 API Key 有效
- THEN 系统显示验证成功状态
- THEN 继续按钮自动激活或自动进入下一步

---

#### Requirement: OAuth 认证流程（Claude）

**系统 SHALL** 支持 Claude OAuth 双步认证流程。
- 系统 SHALL 显示连接 Claude 账户的引导页面
- 系统 SHALL 提供"使用 Claude 登录"按钮
- 系统 SHALL 在用户点击后打开浏览器进行授权
- 系统 SHALL 等待用户复制授权码
- 系统 SHALL 提供授权码输入界面
- 系统 SHALL 验证授权码的有效性

**Scenario: 开始 Claude OAuth**
- WHEN 用户选择 Claude Pro/Max 并点击继续
- THEN 系统显示"连接 Claude 账户"标题
- THEN 系统显示描述"使用您的 Claude 订阅..."
- THEN 系统显示"使用 Claude 登录"按钮

**Scenario: 等待授权码输入**
- WHEN 用户点击"使用 Claude 登录"按钮
- THEN 系统打开浏览器进行 OAuth 授权
- THEN 系统显示"输入授权代码"标题
- THEN 系统显示描述"从浏览器页面复制代码并粘贴到下方"

**Scenario: 提交授权码**
- WHEN 用户在浏览器获取授权码并粘贴到输入框
- THEN 用户点击继续按钮
- THEN 系统验证授权码
- THEN 验证成功后继续下一步

**Scenario: 取消 OAuth**
- WHEN 用户点击取消按钮
- THEN 系统取消当前 OAuth 流程
- THEN 系统返回到 API 选择页面

**Scenario: OAuth 连接失败**
- WHEN 授权码无效或网络错误
- THEN 系统显示错误消息
- THEN 允许用户重新输入或取消

---

#### Requirement: OAuth 认证流程（ChatGPT）

**系统 SHALL** 支持 ChatGPT 原生浏览器 OAuth 认证。
- 系统 SHALL 显示连接 ChatGPT 的引导页面
- 系统 SHALL 提供"使用 ChatGPT 登录"按钮
- 系统 SHALL 在用户点击后打开原生浏览器进行授权
- 系统 SHALL 自动检测认证完成状态
- 系统 SHALL 显示连接成功或失败的消息

**Scenario: 开始 ChatGPT OAuth**
- WHEN 用户选择 Codex ChatGPT OAuth 并点击继续
- THEN 系统显示"连接 ChatGPT"标题
- THEN 系统显示说明文字
- THEN 系统显示"使用 ChatGPT 登录"按钮

**Scenario: 原生浏览器授权**
- WHEN 用户点击"使用 ChatGPT 登录"按钮
- THEN 系统打开原生浏览器进行 OAuth 授权
- THEN 系统在授权后自动关闭浏览器
- THEN 系统自动获取访问令牌

**Scenario: ChatGPT 连接成功**
- WHEN OAuth 授权成功
- THEN 系统显示"已连接！您的 ChatGPT 订阅已就绪。"
- THEN 系统自动进入完成页面

**Scenario: ChatGPT 连接失败**
- WHEN OAuth 授权失败
- THEN 系统显示错误消息
- THEN 允许用户重试或返回上一步

---

#### Requirement: 配置完成页面

**系统 SHALL** 在配置完成后显示成功页面。
- 系统 SHALL 显示保存配置时的加载状态
- 系统 SHALL 配置保存后显示成功消息
- 系统 SHALL 显示 Craft Agents 应用图标
- 系统 SHALL 提供"开始使用"按钮进入主应用

**Scenario: 保存配置中**
- WHEN 用户完成凭据提交
- THEN 系统显示"设置中..."标题
- THEN 系统显示"正在保存您的配置..."描述
- THEN 显示加载动画

**Scenario: 配置成功**
- WHEN 配置保存成功
- THEN 系统显示"您已准备就绪！"标题
- THEN 系统显示"只需开始聊天并开始工作"描述
- THEN 系统显示"开始使用"按钮

**Scenario: 进入主应用**
- WHEN 用户点击"开始使用"按钮
- THEN 系统关闭引导流程
- THEN 系统加载主应用界面

---

#### Requirement: 会话过期重新认证

**系统 SHALL** 提供会话过期时的重新认证流程。
- 系统 SHALL 检测 Craft Token 是否过期或缺失
- 系统 SHALL 显示会话过期警告页面
- 系统 SHALL 提示用户重新登录
- 系统 SHALL 保留用户的对话记录和设置
- 系统 SHALL 提供重置应用选项

**Scenario: 会话过期检测**
- WHEN 用户打开应用时检测到 Token 过期
- THEN 系统显示会话过期页面
- THEN 系统显示警告图标

**Scenario: 重新登录提示**
- WHEN 会话过期时
- THEN 系统显示标题"会话已过期"
- THEN 系统显示描述"您的 Craft 会话已过期或不再有效。请重新登录..."
- THEN 系统提示"您的对话和设置已保留"

**Scenario: 执行重新登录**
- WHEN 用户点击"使用 Craft 登录"按钮
- THEN 系统执行登录流程
- THEN 显示"正在登录..."加载状态

**Scenario: 重置应用选项**
- WHEN 用户点击"重置应用并重新开始"按钮
- THEN 系统清除本地配置
- THEN 系统重新开始引导流程

---

#### Requirement: 导航与状态管理

**系统 SHALL** 支持引导流程的导航和状态管理。
- 系统 SHALL 支持返回上一步功能
- 系统 SHALL 在某些步骤禁用返回按钮（如验证中）
- 系统 SHALL 记录用户的选择状态
- 系统 SHALL 在步骤切换时保持上下文

**Scenario: 返回上一步**
- WHEN 用户点击返回按钮
- THEN 系统返回到上一步
- THEN 保存当前步骤的状态

**Scenario: 禁用返回按钮**
- WHEN 当前步骤正在进行验证或处理
- THEN 返回按钮处于禁用状态

**Scenario: 状态保持**
- WHEN 用户在各步骤间导航
- THEN 系统保持之前的选择（如 API 方式、输入内容等）

---

#### Requirement: macOS 窗口拖拽支持

**系统 SHALL** 支持透明窗口的区域拖拽功能（macOS）。
- 系统 SHALL 为全屏引导流程顶部提供拖拽区域
- 系统 SHALL 确保拖拽区域不阻挡交互元素

**Scenario: macOS 窗口拖拽区域**
- WHEN 引导流程在 macOS 运行
- THEN 系统在顶部 50px 区域提供拖拽区域
- THEN 该区域不遮挡任何可交互元素

---

## 4. 数据模型

### 4.1 OnboardingState

```typescript
interface OnboardingState {
  step: OnboardingStep           // 当前步骤
  loginStatus: LoginStatus        // 登录状态
  credentialStatus: CredentialStatus // 凭据状态
  completionStatus: 'saving' | 'complete' // 完成状态
  apiSetupMethod: ApiSetupMethod | null // API 设置方式
  isExistingUser: boolean         // 是否为现有用户
  errorMessage?: string           // 错误消息
  gitBashStatus?: GitBashStatus   // Git Bash 状态
  isRecheckingGitBash?: boolean   // 是否正在重新检查 Git Bash
  isCheckingGitBash?: boolean     // 是否正在检查 Git Bash
}
```

### 4.2 ApiSetupMethod

```typescript
type ApiSetupMethod =
  | 'anthropic_api_key'  // Anthropic API Key
  | 'claude_oauth'       // Claude Pro/Max OAuth
  | 'openai_api_key'     // OpenAI API Key
  | 'chatgpt_oauth'      // ChatGPT OAuth
```

---

## 5. 修改记录

### MODIFIED 区块

<!-- 本区块用于记录需求的变更历史，初始时为空 -->

```markdown
示例格式：
| 日期 | 版本 | 修改类型 | 修改内容 | 修改人 |
|------|------|----------|----------|--------|
| YYYY-MM-DD | 1.1.0 | 更新 | 添加 XXX 功能需求 | XXX |
```

### REMOVED 区块

<!-- 本区块用于记录已废弃或移除的需求，初始时为空 -->

```markdown
示例格式：
| 日期 | 版本 | 移除需求 | 移除原因 |
|------|------|----------|----------|
| YYYY-MM-DD | 1.1.0 | 原需求编号 | 具体原因 |
```
