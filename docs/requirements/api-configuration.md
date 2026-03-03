# API配置模块需求文档 (API Configuration Requirements)

## ADDED Requirements

### Requirement: API密钥输入
系统 SHALL 提供API密钥输入功能，用于用户输入LLM服务的API密钥。

#### Scenario: 输入API密钥
- **WHEN** 用户在API密钥输入框输入内容
- **THEN** 系统显示密码格式输入，自动聚焦输入框

#### Scenario: 切换密钥可见性
- **WHEN** 用户点击眼睛图标按钮
- **THEN** 系统切换显示/隐藏API密钥的明文状态

#### Scenario: 显示验证状态
- **WHEN** API密钥验证中
- **THEN** 输入框禁用，防止用户修改

#### Scenario: 显示错误状态
- **WHEN** API密钥验证失败
- **THEN** 输入框焦点状态显示红色边框，显示错误消息

---

### Requirement: 端点预设选择
系统 SHALL 提供端点预设选择功能，包括官方和第三方服务。

#### Scenario: 显示预设列表
- **WHEN** 端点预设下拉菜单展开
- **THEN** 显示Anthropic、OpenRouter、Vercel AI Gateway、Ollama、Custom等选项

#### Scenario: 选择官方预设
- **WHEN** 用户选择Anthropic或OpenAI预设
- **THEN** 系统隐藏基础URL输入框（使用官方端点）

#### Scenario: 选择第三方预设
- **WHEN** 用户选择OpenRouter或Vercel等第三方预设
- **THEN** 系统显示对应的基础URL并预填充

#### Scenario: 选择自定义预设
- **WHEN** 用户选择Custom预设
- **THEN** 系统显示空的基础URL输入框供用户填写

---

### Requirement: 基础端点URL配置
系统 SHALL 提供自定义API端点配置功能。

#### Scenario: 输入基础URL
- **WHEN** 用户在基础URL输入框输入网址
- **THEN** 系统自动匹配对应预设（OpenRouter、Vercel等）

#### Scenario: 自定义端点URL
- **WHEN** 用户在Custom预设下输入自定义URL
- **THEN** 系统保持Custom预设状态

---

### Requirement: 默认模型配置
系统 SHALL 提供默认模型配置功能，用于兼容端点的模型选择。

#### Scenario: 预填充模型名称
- **WHEN** 用户选择Ollama预设
- **THEN** 系统预填充推荐模型"qwen3-coder"

#### Scenario: 预填充提供商模型列表
- **WHEN** 用户选择OpenRouter或Vercel预设
- **THEN** 系统预填充逗号分隔的推荐模型列表

#### Scenario: 多模型配置
- **WHEN** 用户输入多个模型（逗号分隔）
- **THEN** 系统将第一个模型作为默认模型，最后一个用于摘要生成

#### Scenario: 模型验证
- **WHEN** 用户提交时配置了自定义端点但未指定模型
- **THEN** 系统显示错误提示"Default model is required for compatible endpoints."

---

### Requirement: API密钥验证
系统 SHALL 提供API密钥实时验证功能。

#### Scenario: 提交验证
- **WHEN** 用户提交API密钥配置
- **THEN** 系统显示验证中状态，禁用输入

#### Scenario: 验证成功
- **WHEN** API密钥验证通过
- **THEN** 系统更新状态为success，允许继续操作

#### Scenario: 验证失败
- **WHEN** API密钥验证失败
- **THEN** 系统更新状态为error，显示错误消息

---

### Requirement: OAuth连接流程
系统 SHALL 提供OAuth连接功能，用于ChatGPT和Claude账户连接。

#### Scenario: 发起OAuth连接
- **WHEN** 用户点击"Sign in with Claude/ChatGPT"按钮
- **THEN** 系统在浏览器中打开OAuth授权页面

#### Scenario: 等待授权码
- **WHEN** OAuth流程在浏览器中完成
- **THEN** 系统显示授权码输入表单

#### Scenario: 输入授权码
- **WHEN** 用户粘贴授权码并提交
- **THEN** 系统验证授权码并完成连接

#### Scenario: 取消OAuth流程
- **WHEN** 用户在等待授权码时点击Cancel
- **THEN** 系统取消OAuth流程返回初始状态

#### Scenario: OAuth连接成功
- **WHEN** OAuth授权完成
- **THEN** 系统显示成功消息，保存认证信息

---

### Requirement: 提供商特定帮助
系统 SHALL 提供不同提供商的配置帮助信息。

#### Scenario: OpenRouter模型格式说明
- **WHEN** 用户选择OpenRouter预设
- **THEN** 系统显示模型格式说明"provider/model-name"和模型浏览链接

#### Scenario: Vercel模型格式说明
- **WHEN** 用户选择Vercel AI Gateway预设
- **THEN** 系统显示模型格式说明和支持模型页面链接

#### Scenario: Ollama配置说明
- **WHEN** 用户选择Ollama预设
- **THEN** 系统说明无需API密钥，使用ollama pull命令拉取模型

#### Scenario: 自定义端点说明
- **WHEN** 用户选择Custom预设
- **THEN** 系统说明需要使用提供商特定的模型ID

---

### Requirement: 提供商类型支持
系统 SHALL 支持不同的AI提供商类型配置。

#### Scenario: Anthropic提供商
- **WHEN** 用户配置Anthropic API
- **THEN** 显示sk-ant-前缀的密码占位符，支持Anthropic兼容端点

#### Scenario: OpenAI提供商
- **WHEN** 用户配置OpenAI API
- **THEN** 显示sk-前缀的密码占位符，支持OpenAI兼容端点

---

### Requirement: 连接管理
系统 SHALL 提供LLM连接管理功能。

#### Scenario: 添加新连接
- **WHEN** 用户在设置页面添加新连接
- **THEN** 系统保存连接配置，支持多个连接并存

#### Scenario: 编辑连接
- **WHEN** 用户编辑现有连接
- **THEN** 系统加载当前配置，允许修改并保存

#### Scenario: 删除连接
- **WHEN** 用户删除连接
- **THEN** 系统移除连接配置（如果是默认连接会提示）

#### Scenario: 设置默认连接
- **WHEN** 用户将某个连接设为默认
- **THEN** 系统更新默认连接标记，显示"Default"徽章

---

### Requirement: 连接验证
系统 SHALL 提供连接状态验证功能。

#### Scenario: 验证连接
- **WHEN** 用户点击验证按钮
- **THEN** 系统测试连接并显示"Validating..."状态

#### Scenario: 显示连接有效
- **WHEN** 连接验证成功
- **THEN** 系统显示"Connection valid"消息

#### Scenario: 显示连接无效
- **WHEN** 连接验证失败
- **THEN** 系统显示"Validation failed"和具体错误信息

---

### Requirement: 凭据健康检查
系统 SHALL 提供凭据健康检查和警告功能。

#### Scenario: 检测凭据问题
- **WHEN** 系统检测到凭据文件损坏、解密失败等问题
- **THEN** 显示警告横幅

#### Scenario: 显示错误信息
- **WHEN** 存在凭据健康问题
- **THEN** 系统显示具体问题类型（文件损坏、跨机器检测等）

#### Scenario: 重新认证
- **WHEN** 用户点击"Re-authenticate"按钮
- **THEN** 系统启动重新认证流程

---

### Requirement: 模型选择
系统 SHALL 提供模型选择功能。

#### Scenario: 显示可用模型
- **WHEN** 连接配置了模型列表
- **THEN** 系统在模型下拉菜单中显示连接定义的模型

#### Scenario: 使用注册表模型
- **WHEN** 连接未定义模型列表
- **THEN** 系统从提供商类型注册表中获取可用模型

#### Scenario: 选择模型
- **WHEN** 用户从下拉菜单选择模型
- **THEN** 系统更新当前连接的默认模型

---

## MODIFIED Requirements

无修改的需求。

---

## REMOVED Requirements

无删除的需求。

---

## 版本历史
- v1.0 - 初始需求提取 (2025-03-03)
