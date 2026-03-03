# Onboarding 模块需求规格

**模块标识**: onboarding
**模块名称**: 用户引导流程

---

## ADDED Requirements

### 1.1: 欢迎界面显示

#### Scenario: 新用户首次启动
- **WHEN** 用户首次启动应用
- **THEN** 系统显示欢迎界面，包含 "Welcome to Craft Agents" 标题、"Agents with the UX they deserve. Connect anything. Organize your sessions. Everything you need to do the work of your life!" 介绍文本，以及 "Get Started" 按钮

#### Scenario: 老用户打开设置
- **WHEN** 已有配置的用户打开设置
- **THEN** 系统显示更新界面，包含 "Update Settings" 标题、"Update your API connection or change your setup." 说明文本，以及 "Continue" 按钮

> 来源: apps/electron/src/renderer/components/onboarding/WelcomeStep.tsx

---

### 1.2: 平台环境检查

#### Scenario: 平台环境检测
- **WHEN** 用户点击 "Get Started" 或 "Continue" 按钮
- **THEN** 系统检测运行平台环境

#### Scenario: Windows 未安装 Git Bash
- **WHEN** 在 Windows 上检测到 Git Bash 未安装
- **THEN** 系统跳转到 Git Bash 配置步骤

#### Scenario: 其他平台或 Git Bash 已安装
- **WHEN** 检查结果为其他平台或 Git Bash 已安装
- **THEN** 系统跳转到 API 设置步骤

> 来源: apps/electron/src/renderer/components/onboarding/WelcomeStep.tsx, apps/electron/src/renderer/hooks/useOnboarding.ts

---

### 2.1: Git Bash 缺失警告显示

#### Scenario: Windows 缺失 Git Bash
- **WHEN** 在 Windows 上检测到 Git Bash 未安装
- **THEN** 系统显示 "Git Bash Required" 标题和 "Craft Agent needs Git Bash to run shell commands on Windows. It was not found on your system." 说明文字，并提供链接到 Git for Windows 下载页面、浏览选择 bash.exe 文件路径、重新检查按钮和返回按钮

> 来源: apps/electron/src/renderer/components/onboarding/GitBashWarning.tsx

---

### 2.2: 手动指定 Git Bash 路径

#### Scenario: 浏览选择 bash.exe
- **WHEN** 用户点击 "Browse..." 按钮
- **THEN** 系统打开文件选择对话框

#### Scenario: 验证路径成功
- **WHEN** 用户选择有效的 bash.exe 文件
- **THEN** 系统验证路径有效性并跳转到 API 设置步骤

#### Scenario: 验证路径失败
- **WHEN** 用户选择的路径无效
- **THEN** 系统显示错误提示并保持在当前步骤

> 来源: apps/electron/src/renderer/components/onboarding/GitBashWarning.tsx

---

### 2.3: 重新检测 Git Bash

#### Scenario: 检测到 Git Bash
- **WHEN** 用户点击 "Re-check" 按钮且检测到 Git Bash
- **THEN** 系统自动跳转到 API 设置步骤

#### Scenario: 未检测到 Git Bash
- **WHEN** 用户点击 "Re-check" 按钮但仍未检测到 Git Bash
- **THEN** 系统保持在当前步骤并显示提示

> 来源: apps/electron/src/renderer/components/onboarding/GitBashWarning.tsx

---

### 3.1: API 提供商列表显示

#### Scenario: 显示 API 提供商选项
- **WHEN** 用户进入 API 设置步骤
- **THEN** 系统显示 "Set Up API Connection" 标题和 "Select how you'd like to power your AI agents." 说明文字，以及 Anthropic 分组（Claude Pro/Max 和 Anthropic API Key）和 OpenAI 分组（Codex · ChatGPT Plus/Pro 和 Codex · OpenAI API Key）的选项列表

> 来源: apps/electron/src/renderer/components/onboarding/APISetupStep.tsx

---

### 3.2: API 提供商选择

#### Scenario: 选择 API 提供商
- **WHEN** 用户点击任意 API 提供商选项
- **THEN** 系统高亮显示选中状态并启用继续按钮

#### Scenario: 未选择任何提供商
- **WHEN** 用户未选择任何提供商
- **THEN** 系统禁用继续按钮

> 来源: apps/electron/src/renderer/components/onboarding/APISetupStep.tsx

---

### 3.3: 确认 API 提供商选择

#### Scenario: 确认选择并继续
- **WHEN** 用户点击 "Continue" 按钮
- **THEN** 系统跳转到凭据输入步骤

> 来源: apps/electron/src/renderer/components/onboarding/APISetupStep.tsx

---

### 4.1.1: Anthropic API Key 输入表单

#### Scenario: 显示 Anthropic API Key 配置
- **WHEN** 用户选择 "Anthropic API Key"
- **THEN** 系统显示 "API Configuration" 标题、"Enter your API key. Optionally configure a custom endpoint for OpenRouter, Ollama, or compatible APIs." 说明文字，以及 API Key 密码输入框、Endpoint 下拉选择 + 输入框、Default Model 文本输入框（非默认端点时为必填）

> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx

---

### 4.1.2: API Key 显示/隐藏切换

#### Scenario: 提供显示/隐藏按钮
- **WHEN** 用户注视 API Key 输入框
- **THEN** 系统提供"显示/隐藏"切换按钮

#### Scenario: 切换明文/密文状态
- **WHEN** 用户点击切换按钮
- **THEN** 系统切换输入框的明文/密文显示状态

> 来源: apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx

---

### 4.1.3: 端点预设选择

#### Scenario: 预设选择更新字段
- **WHEN** 用户从下拉菜单选择端点预设
- **THEN** 系统更新 Base URL 字段并预填充推荐模型

#### Scenario: 选择 Anthropic 预设
- **WHEN** 用户选择 "Anthropic" 预设
- **THEN** 系统隐藏 Base URL 输入框（使用默认端点）

> 来源: apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx

---

### 4.1.4: Anthropic API Key 验证

#### Scenario: 验证成功
- **WHEN** 用户点击继续按钮或按 Enter 键且验证成功
- **THEN** 系统保存配置并跳转到完成步骤

#### Scenario: 验证失败
- **WHEN** 用户点击继续按钮或按 Enter 键且验证失败
- **THEN** 系统显示错误提示并保持在当前步骤

> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx, apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx

---

### 4.2.1: Claude OAuth 连接界面

#### Scenario: 显示 Claude OAuth 连接
- **WHEN** 用户选择 "Claude Pro/Max"
- **THEN** 系统显示 "Connect Claude Account" 标题、"Use your Claude subscription to power multi-agent workflows." 说明文字、返回按钮和 "Sign in with Claude" 按钮

> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx

---

### 4.2.2: Claude OAuth 浏览器流程

#### Scenario: 启动 OAuth 流程
- **WHEN** 用户点击 "Sign in with Claude" 按钮
- **THEN** 系统授权并打开浏览器进行 Claude OAuth 认证，按钮显示加载状态 "Connecting..."，并禁用返回按钮

> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx

---

### 4.2.3: Claude 授权代码输入

#### Scenario: 显示授权代码输入界面
- **WHEN** 浏览器成功打开授权页面
- **THEN** 系统显示 "Enter Authorization Code" 标题、"Copy the code from the browser page and paste it below." 说明文字、取消按钮、继续按钮和授权代码输入框

#### Scenario: 输入框自动聚焦
- **WHEN** 显示授权代码输入界面
- **THEN** 系统使输入框自动获取焦点

#### Scenario: 取消 OAuth 流程
- **WHEN** 用户点击取消按钮
- **THEN** 系统放弃当前 OAuth 流程并清除后端状态

> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx

---

### 4.2.4: Claude 授权代码交换

#### Scenario: 交换成功
- **WHEN** 用户提交授权代码且交换成功
- **THEN** 系统获取访问令牌和刷新令牌，保存到凭证管理器和 LLM 连接系统，并跳转到完成步骤

#### Scenario: 交换失败
- **WHEN** 用户提交授权代码且交换失败
- **THEN** 系统显示错误提示

> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx

---

### 4.2.5: Claude OAuth 状态管理

#### Scenario: 清除过期状态
- **WHEN** 用户取消或失败 OAuth 流程
- **THEN** 系统清除后端 OAuth 状态，避免过期状态干扰

> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx

---

### 4.3.1: ChatGPT OAuth 连接界面

#### Scenario: 显示 ChatGPT OAuth 连接
- **WHEN** 用户选择 "Codex · ChatGPT Plus/Pro"
- **THEN** 系统显示 "Connect ChatGPT" 标题、"Use your ChatGPT Plus or Pro subscription to power Codex." 说明文字、"Click the button above to sign in with your OpenAI account. A browser window will open for authentication." 说明文字、返回按钮和 "Sign in with ChatGPT" 按钮（带外部链接图标）

> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx

---

### 4.3.2: ChatGPT OAuth 单步流程

#### Scenario: 启动单步 OAuth 流程
- **WHEN** 用户点击 "Sign in with ChatGPT" 按钮
- **THEN** 系统启动原生浏览器 OAuth 流程，按钮显示加载状态 "Connecting..."，并禁用返回按钮

#### Scenario: ChatGPT 授权成功
- **WHEN** ChatGPT OAuth 授权成功
- **THEN** 系统自动获取令牌、保存配置并跳转到完成步骤

#### Scenario: ChatGPT 授权失败
- **WHEN** ChatGPT OAuth 授权失败
- **THEN** 系统显示错误提示并启用返回按钮

> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx

---

### 4.4.1: OpenAI API Key 输入表单

#### Scenario: 显示 OpenAI API Key 配置
- **WHEN** 用户选择 "Codex · OpenAI API Key"
- **THEN** 系统显示 "API Configuration" 标题、"Enter your OpenAI API key. Optionally configure OpenRouter or Vercel AI Gateway." 说明文字，以及 API Key 密码输入框、Endpoint 下拉选择 + 输入框、Default Model 文本输入框（非默认端点时为必填）

> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx

---

### 4.4.2: OpenAI 端点预设选择

#### Scenario: 预设选择更新字段
- **WHEN** 用户从下拉菜单选择端点预设
- **THEN** 系统更新 Base URL 字段并预填充推荐模型

#### Scenario: 选择 OpenAI 预设
- **WHEN** 用户选择 "OpenAI" 预设
- **THEN** 系统隐藏 Base URL 输入框（使用默认端点）

> 来源: apps/electron/src/renderer/components/apisetup/ApiKeyInput.tsx

---

### 4.4.3: OpenAI API Key 验证

#### Scenario: 验证成功
- **WHEN** 用户点击继续按钮或按 Enter 键且验证成功
- **THEN** 系统保存配置并跳转到完成步骤

#### Scenario: 验证失败
- **WHEN** 用户点击继续按钮或按 Enter 键且验证失败
- **THEN** 系统显示错误提示并保持在当前步骤

> 来源: apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx

---

### 5.1: 配置保存进度显示

#### Scenario: 显示保存进度
- **WHEN** 保存配置到本地存储
- **THEN** 系统显示加载界面，包含 "Setting up..." 标题、"Saving your configuration..." 说明文字和加载动画

> 来源: apps/electron/src/renderer/components/onboarding/CompletionStep.tsx

---

### 5.2: 配置成功界面显示

#### Scenario: 显示成功界面
- **WHEN** 配置保存成功
- **THEN** 系统显示成功界面，包含应用图标、"You're all set!" 标题、"Just start a chat and get to work." 说明文字和 "Get Started" 按钮

#### Scenario: 完成向导
- **WHEN** 用户点击 "Get Started" 按钮
- **THEN** 系统关闭向导并触发 `onComplete` 回调

> 来源: apps/electron/src/renderer/components/onboarding/CompletionStep.tsx

---

### 6.1: 会话过期重新认证界面

#### Scenario: 显示重新认证界面
- **WHEN** 用户已有工作区配置但 Craft 会话令牌已过期或无效
- **THEN** 系统显示简化的重新登录界面，包含警告图标、"Session Expired" 标题、"Your Craft session has expired or is no longer valid."、"Please log in again to continue using Craft Agents."、"Your conversations and settings are preserved." 说明文字，以及 "Log In with Craft" 主操作按钮和 "Reset app and start fresh..." 次要操作按钮

> 来源: apps/electron/src/renderer/components/onboarding/ReauthScreen.tsx

---

### 6.2: 执行重新登录

#### Scenario: 启动重新登录
- **WHEN** 用户点击 "Log In with Craft" 按钮
- **THEN** 系统启动 Craft OAuth 登录流程，按钮显示加载状态 "Logging in..."，并禁用所有按钮

#### Scenario: 登录成功
- **WHEN** 重新登录成功
- **THEN** 系统保存新令牌并刷新界面

#### Scenario: 登录失败
- **WHEN** 重新登录失败
- **THEN** 系统显示错误提示

> 来源: apps/electron/src/renderer/components/onboarding/ReauthScreen.tsx

---

### 6.3: 重置应用

#### Scenario: 触发应用重置
- **WHEN** 用户点击 "Reset app and start fresh..." 按钮
- **THEN** 系统触发应用重置流程，清除所有本地会话数据并重新启动引导流程

> 来源: apps/electron/src/renderer/components/onboarding/ReauthScreen.tsx

---

## MODIFIED Requirements

> 当前版本为新提取需求，没有修改的需求

---

## REMOVED Requirements

> 当前版本为新提取需求，没有移除的需求
