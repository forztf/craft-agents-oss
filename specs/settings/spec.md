# 设置模块需求规格说明书

**版本**: 1.0
**生成日期**: 2026-03-03
**文档格式**: OpenSpec
**目标组件**: `apps/electron/src/renderer/pages/settings/`

---

## ADDED Requirements

### Requirement: 1.1.1 - 桌面通知开关
**WHEN** 用户在应用设置页面
**THE SYSTEM SHALL** 提供一个切换开关来启用或禁用桌面通知
**SO THAT** 用户可以控制是否在 AI 完成工作时接收通知

#### Scenario: 用户切换桌面通知开关
- **WHEN** 用户点击桌面通知的切换开关
- **THEN** 系统启用或禁用桌面通知功能
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx`

### Requirement: 1.1.2 - 通知状态持久化
**WHEN** 用户切换桌面通知开关
**THE SYSTEM SHALL** 保存通知设置到系统配置中
**SO THAT** 设置在应用重启后仍然有效

#### Scenario: 保存桌面通知设置
- **WHEN** 用户修改桌面通知状态
- **THEN** 系统将设置存储到应用配置文件
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx`

### Requirement: 1.2.1 - 屏幕唤醒保持
**WHEN** 用户启用"保持屏幕唤醒"选项
**THE SYSTEM SHALL** 在会话运行时防止屏幕关闭
**SO THAT** 长时间运行的任务不会因为屏幕关闭而中断

#### Scenario: 启用保持屏幕唤醒
- **WHEN** 用户开启"保持屏幕唤醒"开关
- **THEN** 系统在会话运行期间阻止屏幕关闭
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx`

### Requirement: 1.2.2 - 电源设置持久化
**WHEN** 用户修改电源设置
**THE SYSTEM SHALL** 保存电源管理设置到系统配置中
**SO THAT** 设置在应用重启后保持不变

#### Scenario: 保存电源管理设置
- **WHEN** 用户修改保持屏幕唤醒设置
- **THEN** 系统将设置持久化存储
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx`

### Requirement: 1.3.1 - 版本显示
**WHEN** 用户访问应用设置
**THE SYSTEM SHALL** 显示当前应用的版本号
**SO THAT** 用户可以知道正在使用的版本

#### Scenario: 查看应用版本
- **WHEN** 用户打开应用设置页面
- **THEN** 系统显示当前应用版本号
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx`

### Requirement: 1.3.2 - 更新检查
**WHEN** 用户点击"检查更新"按钮
**THE SYSTEM SHALL** 连接到更新服务器检查是否有新版本可用
**SO THAT** 用户可以获取最新的功能和修复

#### Scenario: 检查应用更新
- **WHEN** 用户点击"检查更新"按钮
- **THEN** 系统连接更新服务器并检查新版本
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx`

### Requirement: 1.3.3 - 更新提示
**WHEN** 检测到有新版本可用
**THE SYSTEM SHALL** 显示更新按钮和最新版本号
**SO THAT** 用户可以选择更新到最新版本

#### Scenario: 显示可用更新
- **WHEN** 检测到新版本可用
- **THEN** 系统显示更新按钮和最新版本号
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx`

### Requirement: 1.3.4 - 更新安装
**WHEN** 用户点击更新按钮
**THE SYSTEM SHALL** 下载更新并准备安装
**SO THAT** 用户可以升级到新版本

#### Scenario: 下载并准备更新
- **WHEN** 用户点击更新到版本按钮
- **THEN** 系统下载更新包并准备安装
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx`

### Requirement: 1.3.5 - 重启更新
**WHEN** 更新准备就绪
**THE SYSTEM SHALL** 显示"重启以更新"按钮
**SO THAT** 用户可以完成更新安装

#### Scenario: 重启以完成更新
- **WHEN** 更新准备就绪
- **THEN** 系统显示"重启以更新"按钮
> 来源: `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx`

### Requirement: 2.1.1 - 默认连接选择
**WHEN** 配置了多个 AI API 连接
**THE SYSTEM SHALL** 允许用户选择默认连接
**SO THAT** 新聊天会使用指定的连接

#### Scenario: 设置默认 AI 连接
- **WHEN** 用户从连接列表中选择一个连接作为默认
- **THEN** 新聊天会使用选定的连接
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.1.2 - 默认模型选择
**WHEN** 选定的连接支持多个模型
**THE SYSTEM SHALL** 允许用户选择默认模型
**SO THAT** 新聊天会使用指定的模型

#### Scenario: 设置默认 AI 模型
- **WHEN** 用户从模型列表中选择默认模型
- **THEN** 新聊天会使用选定的模型
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.1.3 - 默认思考级别
**WHEN** 用户配置 AI 设置
**THE SYSTEM SHALL** 允许用户选择默认思考级别(深度推理)
**SO THAT** 新聊天会使用指定的推理深度

#### Scenario: 设置默认思考级别
- **WHEN** 用户选择默认思考级别
- **THEN** 新聊天会使用选定的推理深度
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.2.1 - 工作区连接覆盖
**WHEN** 用户为特定工作区配置 AI 设置
**THE SYSTEM SHALL** 允许该工作区覆盖应用默认连接
**SO THAT** 不同工作区可以使用不同的 AI 提供商

#### Scenario: 工作区覆盖默认连接
- **WHEN** 用户为工作区选择特定连接
- **THEN** 该工作区使用指定的连接而非应用默认
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.2.2 - 工作区模型覆盖
**WHEN** 用户为特定工作区配置模型
**THE SYSTEM SHALL** 允许该工作区覆盖应用默认模型
**SO THAT** 不同工作区可以使用适合其任务的模型

#### Scenario: 工作区覆盖默认模型
- **WHEN** 用户为工作区选择特定模型
- **THEN** 该工作区使用指定的模型
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.2.3 - 工作区思考级别覆盖
**WHEN** 用户为特定工作区配置思考级别
**THE SYSTEM SHALL** 允许该工作区覆盖应用默认思考级别
**SO THAT** 不同工作区可以使用不同的推理深度

#### Scenario: 工作区覆盖默认思考级别
- **WHEN** 用户为工作区选择特定思考级别
- **THEN** 该工作区使用指定的推理深度
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.2.4 - 使用全局默认选项
**WHEN** 用户在工作区配置中选择"使用默认"
**THE SYSTEM SHALL** 移除该工作区对此设置的覆盖
**SO THAT** 工作区继承应用默认设置

#### Scenario: 工作区恢复使用默认设置
- **WHEN** 用户选择"使用默认"选项
- **THEN** 工作区移除覆盖并继承应用默认设置
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.2.5 - 工作区配置摘要
**WHEN** 工作区配置卡片处于折叠状态
**THE SYSTEM SHALL** 显示当前配置的摘要(连接名、模型、思考级别)
**SO THAT** 用户可以快速查看工作区配置状态

#### Scenario: 显示工作区配置摘要
- **WHEN** 工作区配置卡片处于折叠状态
- **THEN** 系统显示当前配置的摘要信息
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.3.1 - 连接列表显示
**WHEN** 用户访问 AI 设置页面
**THE SYSTEM SHALL** 显示所有配置的 AI API 连接
**SO THAT** 用户可以查看和管理所有连接

#### Scenario: 查看 AI 连接列表
- **WHEN** 用户访问 AI 设置页面
- **THEN** 系统显示所有已配置的连接
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.3.2 - 连接信息显示
**WHEN** 显示连接列表
**THE SYSTEM SHALL** 为每个连接显示名称、提供商类型、认证状态
**SO THAT** 用户可以了解连接的基本信息

#### Scenario: 显示连接详细信息
- **WHEN** 用户查看连接列表
- **THEN** 每个连接显示名称、提供商类型、认证状态
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.3.3 - 默认连接标识
**WHEN** 显示连接列表
**THE SYSTEM SHALL** 为默认连接显示标识标签
**SO THAT** 用户可以快速识别默认连接

#### Scenario: 识别默认连接
- **WHEN** 用户查看连接列表
- **THEN** 默认连接显示标识标签
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.3.4 - 添加新连接
**WHEN** 用户点击"添加连接"按钮
**THE SYSTEM SHALL** 打开全屏 API 设置向导
**SO THAT** 用户可以添加新的 AI 提供商连接

#### Scenario: 添加新的 AI 连接
- **WHEN** 用户点击"+ Add Connection"按钮
- **THEN** 系统打开全屏 API 设置向导
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.3.5 - 编辑现有连接
**WHEN** 用户选择编辑某个连接
**THE SYSTEM SHALL** 打开全屏 API 设置向导并预填充连接信息
**SO THAT** 用户可以修改连接配置

#### Scenario: 编辑现有 AI 连接
- **WHEN** 用户选择连接的编辑选项
- **THEN** 系统打开 API 设置向导并预填充信息
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.3.6 - 设置默认连接
**WHEN** 用户选择"设为默认"选项
**THE SYSTEM SHALL** 将该连接设置为应用默认
**SO THAT** 新聊天会使用此连接

#### Scenario: 设置默认 AI 连接
- **WHEN** 用户选择"设为默认"选项
- **THEN** 该连接成为应用默认连接
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.3.7 - 删除连接
**WHEN** 用户选择删除某个连接
**THE SYSTEM SHALL** 删除该连接(如果是最后一个连接则禁止删除)
**SO THAT** 用户可以移除不需要的连接

#### Scenario: 删除 AI 连接
- **WHEN** 用户选择删除连接选项
- **THEN** 系统删除该连接(至少保留一个)
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.3.8 - 连接验证
**WHEN** 用户选择"验证连接"选项
**THE SYSTEM SHALL** 测试连接的凭证和模型访问权限
**SO THAT** 用户可以确认连接配置正确

#### Scenario: 验证 AI 连接
- **WHEN** 用户选择"验证连接"选项
- **THEN** 系统测试凭证和模型访问权限
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.3.9 - 验证状态显示
**WHEN** 进行连接验证
**THE SYSTEM SHALL** 显示验证中、验证成功或验证失败状态
**SO THAT** 用户了解验证进度和结果

#### Scenario: 显示验证状态
- **WHEN** 进行连接验证
- **THEN** 系统显示验证中/成功/失败状态
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.3.10 - 重新认证
**WHEN** 用户选择"重新认证"选项
**THE SYSTEM SHALL** 打开认证流程(OAuth 或凭证输入)
**SO THAT** 用户可以更新过期的凭证

#### Scenario: 重新认证连接
- **WHEN** 用户选择"重新认证"选项
- **THEN** 系统打开 OAuth 或凭证输入流程
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.4.1 - 凭证问题检测
**WHEN** 系统启动时检测到凭证问题(文件损坏、机器迁移等)
**THE SYSTEM SHALL** 显示警告横幅
**SO THAT** 用户知道需要重新认证

#### Scenario: 检测凭证健康问题
- **WHEN** 系统检测到凭证问题
- **THEN** 显示警告横幅提示用户
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.4.2 - 凭证问题信息
**WHEN** 显示凭证问题警告
**THE SYSTEM SHALL** 显示具体的错误信息和建议操作
**SO THAT** 用户了解问题原因和解决方法

#### Scenario: 显示凭证问题详情
- **WHEN** 显示凭证问题警告
- **THEN** 系统显示错误信息和解决建议
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 2.4.3 - 重新认证引导
**WHEN** 用户点击凭证警告横幅中的"重新认证"按钮
**THE SYSTEM SHALL** 打开默认连接的认证流程
**SO THAT** 用户可以快速修复凭证问题

#### Scenario: 从警告横幅重新认证
- **WHEN** 用户点击警告横幅中的"重新认证"
- **THEN** 系统打开默认连接的认证流程
> 来源: `apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx`

### Requirement: 3.1.1 - 主题模式选择
**WHEN** 用户配置外观设置
**THE SYSTEM SHALL** 提供"系统"、"亮色"、"暗色"三种主题模式选择
**SO THAT** 用户可以根据偏好选择主题

#### Scenario: 选择主题模式
- **WHEN** 用户配置外观设置
- **THEN** 系统提供系统/亮色/暗色三种模式选项
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx`

### Requirement: 3.1.2 - 颜色主题选择
**WHEN** 用户配置外观设置
**THE SYSTEM SHALL** 提供多种预设颜色主题供选择
**SO THAT** 用户可以自定义应用配色

#### Scenario: 选择颜色主题
- **WHEN** 用户配置外观设置
- **THEN** 系统提供多种预设颜色主题
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx`

### Requirement: 3.1.3 - 字体选择
**WHEN** 用户配置外观设置
**THE SYSTEM SHALL** 提供字体选择(如 Inter)
**SO THAT** 用户可以选择喜欢的字体

#### Scenario: 选择应用字体
- **WHEN** 用户配置外观设置
- **THEN** 系统提供字体选择
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx`

### Requirement: 3.2.1 - 为每个工作区设置主题
**WHEN** 配置了多个工作区
**THE SYSTEM SHALL** 允许为每个工作区单独设置颜色主题
**SO THAT** 不同工作区可以有不同的视觉标识

#### Scenario: 为工作区设置单独主题
- **WHEN** 用户配置多个工作区
- **THEN** 每个工作区可以有独立的颜色主题
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx`

### Requirement: 3.2.2 - 工作区主题显示
**WHEN** 显示工作区主题列表
**THE SYSTEM SHALL** 显示工作区图标、名称和当前主题
**SO THAT** 用户可以方便地管理主题

#### Scenario: 显示工作区主题列表
- **WHEN** 用户查看工作区主题
- **THEN** 系统显示图标、名称和当前主题
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx`

### Requirement: 3.2.3 - 使用默认主题选项
**WHEN** 用户为工作区选择"使用默认"
**THE SYSTEM SHALL** 移除工作区的主题覆盖
**SO THAT** 工作区继承应用默认主题

#### Scenario: 工作区恢复使用默认主题
- **WHEN** 用户选择"使用默认"
- **THEN** 工作区恢复使用应用默认主题
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx`

### Requirement: 3.3.1 - 工具图标表格显示
**WHEN** 用户访问工具图标设置
**THE SYSTEM SHALL** 显示所有工具图标及其对应的 CLI 命令
**SO THAT** 用户可以查看命令到图标的映射关系

#### Scenario: 查看工具图标映射
- **WHEN** 用户访问工具图标设置
- **THEN** 系统显示所有工具图标和 CLI 命令映射
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx`

### Requirement: 3.3.2 - 工具图标搜索
**WHEN** 工具图标列表很长
**THE SYSTEM SHALL** 提供搜索功能来过滤工具
**SO THAT** 用户可以快速找到特定工具

#### Scenario: 搜索工具图标
- **WHEN** 用户搜索工具图标
- **THEN** 系统过滤并显示匹配的工具
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx`

### Requirement: 3.3.3 - 编辑工具图标
**WHEN** 用户点击"编辑"按钮
**THE SYSTEM SHALL** 打开工具图标配置文件的编辑界面
**SO THAT** 用户可以自定义命令到图标的映射

#### Scenario: 编辑工具图标映射
- **WHEN** 用户点击"编辑"按钮
- **THEN** 系统打开工具图标配置文件编辑界面
> 来源: `apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx`

### Requirement: 4.1.1 - 自动大写
**WHEN** 用户在聊天输入框中输入文本
**THE SYSTEM SHALL** 在自动大写启用时自动将句子首字母大写
**SO THAT** 用户不需要手动大写

#### Scenario: 自动大写句子首字母
- **WHEN** 用户输入文本且自动大写启用
- **THEN** 系统自动大写句子首字母
> 来源: `apps/electron/src/renderer/pages/settings/InputSettingsPage.tsx`

### Requirement: 4.1.2 - 拼写检查
**WHEN** 用户在聊天输入框中输入文本
**THE SYSTEM SHALL** 在拼写检查启用时标记拼写错误
**SO THAT** 用户可以识别并修正拼写错误

#### Scenario: 拼写检查提示
- **WHEN** 用户输入文本且拼写检查启用
- **THEN** 系统标记拼写错误
> 来源: `apps/electron/src/renderer/pages/settings/InputSettingsPage.tsx`

### Requirement: 4.2.1 - Enter 发送
**WHEN** 用户选择"Enter"作为发送消息快捷键
**THE SYSTEM SHALL** 按 Enter 键发送消息，按 Shift+Enter 换行
**SO THAT** 用户可以快速发送消息

#### Scenario: 使用 Enter 发送消息
- **WHEN** 用户选择 Enter 作为发送快捷键
- **THEN** Enter 发送消息，Shift+Enter 换行
> 来源: `apps/electron/src/renderer/pages/settings/InputSettingsPage.tsx`

### Requirement: 4.2.2 - Cmd+Enter 发送
**WHEN** 用户选择"Cmd+Enter"(Mac)或"Ctrl+Enter"(Windows/Linux)作为发送快捷键
**THE SYSTEM SHALL** 按 Cmd+Enter/Ctrl+Enter 键发送消息，按 Enter 换行
**SO THAT** 用户可以方便地输入多行文本

#### Scenario: 使用 Cmd+Enter 发送消息
- **WHEN** 用户选择 Cmd+Enter 作为发送快捷键
- **THEN** Cmd+Enter 发送消息，Enter 换行
> 来源: `apps/electron/src/renderer/pages/settings/InputSettingsPage.tsx`

### Requirement: 5.1.1 - 工作区名称显示
**WHEN** 用户访问工作区设置
**THE SYSTEM SHALL** 显示当前工作区名称
**SO THAT** 用户知道正在配置哪个工作区

#### Scenario: 显示工作区名称
- **WHEN** 用户访问工作区设置
- **THEN** 系统显示当前工作区名称
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.1.2 - 编辑工作区名称
**WHEN** 用户点击"编辑"按钮
**THE SYSTEM SHALL** 打开对话框允许用户修改工作区名称
**SO THAT** 用户可以重命名工作区

#### Scenario: 重命名工作区
- **WHEN** 用户点击"编辑"按钮
- **THEN** 系统打开重命名对话框
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.1.3 - 工作区图标显示
**WHEN** 用户访问工作区设置
**THE SYSTEM SHALL** 显示当前工作区图标
**SO THAT** 用户可以识别工作区

#### Scenario: 显示工作区图标
- **WHEN** 用户访问工作区设置
- **THEN** 系统显示当前工作区图标
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.1.4 - 更改工作区图标
**WHEN** 用户点击"更改"按钮并选择图片文件
**THE SYSTEM SHALL** 上传并设置新图标(支持 PNG、JPG、SVG、WebP、GIF)
**SO THAT** 用户可以自定义工作区图标

#### Scenario: 上传工作区图标
- **WHEN** 用户选择图片文件(支持 PNG、JPG、SVG、WebP、GIF)
- **THEN** 系统上传并设置新图标
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.1.5 - 图标上传状态
**WHEN** 正在上传图标
**THE SYSTEM SHALL** 显示上传进度或加载指示器
**SO THAT** 用户知道上传正在进行

#### Scenario: 显示图标上传状态
- **WHEN** 正在上传图标
- **THEN** 系统显示加载指示器
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.1.6 - 空工作区状态
**WHEN** 没有选择工作区
**THE SYSTEM SHALL** 显示"未选择工作区"提示
**SO THAT** 用户知道需要先选择工作区

#### Scenario: 显示空工作区状态
- **WHEN** 没有选择工作区
- **THEN** 系统显示"未选择工作区"提示
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.2.1 - 默认权限模式
**WHEN** 用户配置工作区权限
**THE SYSTEM SHALL** 提供三种权限模式: Safe(只读，不允许修改)、Ask(在执行前提示)、Allow-all(完全自主执行)
**SO THAT** 用户可以控制 AI 的操作权限

#### Scenario: 选择默认权限模式
- **WHEN** 用户配置工作区权限
- **THEN** 系统提供 Safe/Ask/Allow-all 三种模式
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.2.2 - 权限模式持久化
**WHEN** 用户更改权限模式
**THE SYSTEM SHALL** 保存设置到工作区配置
**SO THAT** 设置在工作区会话间保持一致

#### Scenario: 保存权限模式设置
- **WHEN** 用户更改权限模式
- **THEN** 系统保存设置到工作区配置
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.3.1 - 启用/禁用模式
**WHEN** 用户配置模式循环
**THE SYSTEM SHALL** 允许选择哪些权限模式在 Shift+Tab 循环中包含
**SO THAT** 用户可以自定义快捷键循环的模式集合

#### Scenario: 配置模式循环
- **WHEN** 用户启用或禁用某个模式
- **THEN** 该模式被包含或排除在 Shift+Tab 循环中
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.3.2 - 最少模式限制
**WHEN** 用户尝试禁用模式以保留少于2个模式
**THE SYSTEM SHALL** 显示错误提示"至少需要2个模式"
**SO THAT** 用户知道模式循环不能少于2个模式

#### Scenario: 验证模式数量
- **WHEN** 用户尝试禁用模式导致少于2个模式
- **THEN** 系统显示错误提示
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.3.3 - 模式说明
**WHEN** 显示模式循环选项
**THE SYSTEM SHALL** 为每个模式显示描述
**SO THAT** 用户了解每个模式的作用

#### Scenario: 显示模式描述
- **WHEN** 显示模式循环选项
- **THEN** 系统显示每个模式的描述
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.4.1 - 默认工作目录
**WHEN** 用户配置工作区设置
**THE SYSTEM SHALL** 允许设置默认工作目录路径
**SO THAT** AI 操作默认在该目录中执行

#### Scenario: 设置默认工作目录
- **WHEN** 用户配置工作区设置
- **THEN** 系统允许设置默认工作目录路径
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.4.2 - 更改工作目录
**WHEN** 用户点击"更改..."按钮
**THE SYSTEM SHALL** 打开文件夹选择对话框
**SO THAT** 用户可以选择新的工作目录

#### Scenario: 更改默认工作目录
- **WHEN** 用户点击"更改..."按钮
- **THEN** 系统打开文件夹选择对话框
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.4.3 - 清除工作目录
**WHEN** 用户点击"清除"按钮
**THE SYSTEM SHALL** 移除默认工作目录设置
**SO THAT** AI 会使用会话文件夹作为工作目录

#### Scenario: 清除默认工作目录
- **WHEN** 用户点击"清除"按钮
- **THEN** 系统移除默认工作目录设置
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 5.4.4 - 本地 MCP 服务器
**WHEN** 用户配置高级设置
**THE SYSTEM SHALL** 提供切换开关来启用或禁用本地 MCP(Model Context Protocol)服务器
**SO THAT** 用户可以控制 stdio 子进程服务器的可用性

#### Scenario: 启用/禁用本地 MCP 服务器
- **WHEN** 用户切换本地 MCP 服务器开关
- **THEN** 系统启用或禁用 stdio 子进程服务器
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 6.1.1 - 权限介绍
**WHEN** 用户访问权限设置
**THE SYSTEM SHALL** 显示权限模块的介绍说明
**SO THAT** 用户了解权限控制的作用和价值

#### Scenario: 显示权限模块介绍
- **WHEN** 用户访问权限设置
- **THEN** 系统显示权限模块介绍说明
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx`

### Requirement: 6.1.2 - 文档链接
**WHEN** 显示权限介绍
**THE SYSTEM SHALL** 提供文档链接"了解更多"
**SO THAT** 用户可以获取详细的权限配置说明

#### Scenario: 提供权限文档链接
- **WHEN** 显示权限介绍
- **THEN** 系统提供文档链接"了解更多"
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx`

### Requirement: 6.2.1 - 默认权限表格
**WHEN** 访问默认权限部分
**THE SYSTEM SHALL** 显示应用级别的默认权限规则表格
**SO THAT** 用户可以查看 Explore 模式允许的操作

#### Scenario: 显示默认权限表格
- **WHEN** 访问默认权限部分
- **THEN** 系统显示应用级别默认权限规则表格
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx`

### Requirement: 6.2.2 - 权限类型显示
**WHEN** 显示权限表格
**THE SYSTEM SHALL** 显示以下类型权限: Bash(允许的 bash 命令模式)、MCP(允许的 MCP 工具模式)、API(允许的 API 端点)、Tool(允许的写路径)
**SO THAT** 用户可以了解所有权限类别

#### Scenario: 显示权限类型
- **WHEN** 显示权限表格
- **THEN** 系统显示 Bash/MCP/API/Tool 权限类型
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx`

### Requirement: 6.2.3 - 权限模式搜索
**WHEN** 权限列表很长
**THE SYSTEM SHALL** 提供搜索功能来过滤权限规则
**SO THAT** 用户可以快速找到特定权限

#### Scenario: 搜索权限规则
- **WHEN** 用户搜索权限
- **THEN** 系统过滤并显示匹配的权限规则
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx`

### Requirement: 6.2.4 - 编辑默认权限
**WHEN** 用户点击"编辑"按钮
**THE SYSTEM SHALL** 打开默认权限配置文件的编辑界面
**SO THAT** 用户可以自定义默认权限规则

#### Scenario: 编辑默认权限
- **WHEN** 用户点击"编辑"按钮
- **THEN** 系统打开默认权限配置文件编辑界面
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx`

### Requirement: 6.2.5 - 权限文件路径显示
**WHEN** 没有默认权限配置
**THE SYSTEM SHALL** 显示默认权限文件路径 `~/.craft-agent/permissions/default.json`
**SO THAT** 用户知道在哪里创建权限文件

#### Scenario: 显示权限文件路径
- **WHEN** 没有默认权限配置
- **THEN** 系统显示默认权限文件路径
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx`

### Requirement: 6.3.1 - 自定义权限表格
**WHEN** 访问工作区权限部分
**THE SYSTEM SHALL** 显示工作区级别的自定义权限规则
**SO THAT** 用户可以查看工作区特有的权限规则

#### Scenario: 显示工作区自定义权限
- **WHEN** 访问工作区权限部分
- **THEN** 系统显示工作区级别自定义权限规则
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx`

### Requirement: 6.3.2 - 编辑自定义权限
**WHEN** 用户点击"编辑"按钮
**THE SYSTEM SHALL** 打开工作区权限文件的编辑界面
**SO THAT** 用户可以添加工作区特定的权限规则

#### Scenario: 编辑工作区自定义权限
- **WHEN** 用户点击"编辑"按钮
- **THEN** 系统打开工作区权限文件编辑界面
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx`

### Requirement: 6.3.3 - 权限规则扩展
**WHEN** 用户配置自定义权限
**THE SYSTEM SHALL** 允许规则扩展默认权限(添加额外允许的操作或阻止的工具)
**SO THAT** 工作区可以有更宽松或更严格的权限控制

#### Scenario: 扩展默认权限规则
- **WHEN** 用户配置自定义权限
- **THEN** 规则扩展默认权限
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx`

### Requirement: 6.4.1 - 配置变化检测
**WHEN** 默认权限配置文件发生变化
**THE SYSTEM SHALL** 自动重新加载权限配置
**SO THAT** 权限设置变化立即生效

#### Scenario: 自动重新加载权限配置
- **WHEN** 默认权限配置文件发生变化
- **THEN** 系统自动重新加载权限配置
> 来源: `apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx`

### Requirement: 7.1.1 - 标签功能说明
**WHEN** 用户访问标签设置
**THE SYSTEM SHALL** 显示标签功能的详细介绍
**SO THAT** 用户了解如何使用标签组织会话

#### Scenario: 显示标签功能介绍
- **WHEN** 用户访问标签设置
- **THEN** 系统显示标签功能详细介绍
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.1.2 - 标签值类型说明
**WHEN** 显示标签介绍
**THE SYSTEM SHALL** 说明标签可以携带值(文本、数字、日期)
**SO THAT** 用户了解标签的元数据功能

#### Scenario: 说明标签值类型
- **WHEN** 显示标签介绍
- **THEN** 系统说明标签可以携带值
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.1.3 - 自动应用规则说明
**WHEN** 显示标签介绍
**THE SYSTEM SHALL** 正则表达式自动应用标签的规则和示例
**SO THAT** 用户了解如何配置自动标签

#### Scenario: 说明自动应用标签规则
- **WHEN** 显示标签介绍
- **THEN** 系统说明正则表达式自动应用标签规则
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.1.4 - 文档链接
**WHEN** 显示标签介绍
**THE SYSTEM SHALL** 提供文档链接
**SO THAT** 用户可以获取详细的标签配置指南

#### Scenario: 提供标签文档链接
- **WHEN** 显示标签介绍
- **THEN** 系统提供文档链接
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.2.1 - 标签树形表格
**WHEN** 访问标签层次结构部分
**THE SYSTEM SHALL** 显示所有标签的树形表格(支持展开/折叠)
**SO THAT** 用户可以查看和浏览标签层次结构

#### Scenario: 显示标签树形表格
- **WHEN** 访问标签层次结构部分
- **THEN** 系统显示所有标签的树形表格
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.2.2 - 标签信息显示
**WHEN** 显示标签表格
**THE SYSTEM SHALL** 显示每个标签的名称、颜色、值类型、父标签
**SO THAT** 用户可以了解标签的完整信息

#### Scenario: 显示标签详细信息
- **WHEN** 显示标签表格
- **THEN** 系统显示每个标签的名称、颜色、值类型、父标签
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.2.3 - 标签搜索
**WHEN** 标签列表很长
**THE SYSTEM SHALL** 提供搜索功能来过滤标签
**SO THAT** 用户可以快速找到特定标签

#### Scenario: 搜索标签
- **WHEN** 用户搜索标签
- **THEN** 系统过滤并显示匹配的标签
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.2.4 - 编辑标签配置
**WHEN** 用户点击"编辑"按钮
**THE SYSTEM SHALL** 打开标签配置文件的编辑界面
**SO THAT** 用户可以使用 AI 辅助编辑标签结构

#### Scenario: 编辑标签配置
- **WHEN** 用户点击"编辑"按钮
- **THEN** 系统打开标签配置文件编辑界面
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.2.5 - 直接编辑配置文件
**WHEN** 用户点击"编辑文件"按钮
**THE SYSTEM SHALL** 在系统编辑器中打开 `labels/config.json`
**SO THAT** 用户可以直接编辑标签配置

#### Scenario: 直接编辑标签配置文件
- **WHEN** 用户点击"编辑文件"按钮
- **THEN** 系统在系统编辑器中打开标签配置文件
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.2.6 - 空标签状态
**WHEN** 没有配置标签
**THE SYSTEM SHALL** 显示提示信息和配置文件路径
**SO THAT** 用户知道如何创建标签

#### Scenario: 显示空标签状态
- **WHEN** 没有配置标签
- **THEN** 系统显示提示信息和配置文件路径
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.3.1 - 自动规则表格
**WHEN** 访问自动应用规则部分
**THE SYSTEM SHALL** 显示所有自动应用规则的表格
**SO THAT** 用户可以查看所有配置的正则表达式规则

#### Scenario: 显示自动应用规则表格
- **WHEN** 访问自动应用规则部分
- **THEN** 系统显示所有自动应用规则的表格
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.3.2 - 规则信息显示
**WHEN** 显示自动规则表格
**THE SYSTEM SHALL** 显示每个规则的正则表达式模式和匹配时应用的标签
**SO THAT** 用户可以了解规则的配置

#### Scenario: 显示规则详细信息
- **WHEN** 显示自动规则表格
- **THEN** 系统显示每个规则的正则表达式和标签
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.3.3 - 规则搜索
**WHEN** 自动规则列表很长
**THE SYSTEM SHALL** 提供搜索功能来过滤规则
**SO THAT** 用户可以快速找到特定规则

#### Scenario: 搜索自动规则
- **WHEN** 用户搜索自动规则
- **THEN** 系统过滤并显示匹配的规则
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.3.4 - 编辑自动规则
**WHEN** 用户点击"编辑"按钮
**THE SYSTEM SHALL** 打开规则配置文件的编辑界面
**SO THAT** 用户可以添加或修改自动标签规则

#### Scenario: 编辑自动规则
- **WHEN** 用户点击"编辑"按钮
- **THEN** 系统打开规则配置文件编辑界面
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 7.3.5 - 空规则状态
**WHEN** 没有配置自动规则
**THE SYSTEM SHALL** 显示提示信息
**SO THAT** 用户知道可以配置自动规则

#### Scenario: 显示空规则状态
- **WHEN** 没有配置自动规则
- **THEN** 系统显示提示信息
> 来源: `apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx`

### Requirement: 8.1.1 - 类别分组显示
**WHEN** 用户访问快捷键页面
**THE SYSTEM SHALL** 按类别(如编辑、视图等)显示全局快捷键
**SO THAT** 用户可以方便地浏览不同功能的快捷键

#### Scenario: 按类别显示快捷键
- **WHEN** 用户访问快捷键页面
- **THEN** 系统按类别显示全局快捷键
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx`

### Requirement: 8.1.2 - 快捷键信息显示
**WHEN** 显示快捷键列表
**THE SYSTEM SHALL** 为每个快捷键显示功能和对应的键盘组合
**SO THAT** 用户可以了解每个快捷键的作用

#### Scenario: 显示快捷键信息
- **WHEN** 显示快捷键列表
- **THEN** 系统显示功能和键盘组合
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx`

### Requirement: 8.1.3 - 平台适配显示
**WHEN** 显示快捷键
**THE SYSTEM SHALL** 根据当前平台(Mac/Windows/Linux)显示相应的快捷键符号
**SO THAT** 用户可以看到符合其平台的快捷键表示

#### Scenario: 显示平台适配快捷键
- **WHEN** 显示快捷键
- **THEN** 系统显示当前平台相应的快捷键符号
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx`

### Requirement: 8.2.1 - 列表导航快捷键
**WHEN** 显示快捷键列表
**THE SYSTEM SHALL** 显示列表导航相关快捷键: 上下箭头(在列表中导航)、Home(跳转到第一项)、End(跳转到最后一项)
**SO THAT** 用户可以使用键盘在列表中快速导航

#### Scenario: 显示列表导航快捷键
- **WHEN** 显示快捷键列表
- **THEN** 系统显示列表导航相关快捷键
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx`

### Requirement: 8.2.2 - 会话列表快捷键
**WHEN** 显示快捷键列表
**THE SYSTEM SHALL** 显示会话列表快捷键: Enter(聚焦聊天输入框)、右键点击(打开上下文菜单)
**SO THAT** 用户可以快速操作会话列表

#### Scenario: 显示会话列表快捷键
- **WHEN** 显示快捷键列表
- **THEN** 系统显示会话列表快捷键
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx`

### Requirement: 8.2.3 - 代理树快捷键
**WHEN** 显示快捷键列表
**THE SYSTEM SHALL** 显示代理树快捷键: 左箭头(折叠文件夹)、右箭头(展开文件夹)
**SO THAT** 用户可以浏览代理的层次结构

#### Scenario: 显示代理树快捷键
- **WHEN** 显示快捷键列表
- **THEN** 系统显示代理树快捷键
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx`

### Requirement: 8.2.4 - 聊天输入快捷键
**WHEN** 显示快捷键列表
**THE SYSTEM SHALL** 显示聊天输入快捷键: Enter(发送消息)、Shift+Enter(新建行)、Esc(关闭对话框/失去焦点)
**SO THAT** 用户可以高效地输入和管理消息

#### Scenario: 显示聊天输入快捷键
- **WHEN** 显示快捷键列表
- **THEN** 系统显示聊天输入快捷键
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx`

### Requirement: 8.3.1 - 内联显示
**WHEn** 在用户界面中显示快捷键
**THE SYSTEM SHALL** 使用键帽样式(Kbd 组件)显示快捷键
**SO THAT** 用户可以清楚地识别快捷键键位

#### Scenario: 键帽样式显示快捷键
- **WHEn** 在用户界面中显示快捷键
- **THEN** 系统使用键帽样式显示快捷键
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx`

### Requirement: 8.3.2 - 悬停效果
**WHEn** 用户悬停在快捷键行上
**THE SYSTEM SHALL** 显示虚线分隔符
**SO THAT** 用户可以更清楚地看到快捷键和描述的分离

#### Scenario: 快捷键行悬停效果
- **WHEn** 用户悬停在快捷键行上
- **THEN** 系统显示虚线分隔符
> 来源: `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx`

### Requirement: 9.1.1 - 姓名输入
**WHEN** 用户配置偏好设置
**THE SYSTEM SHALL** 提供姓名输入字段
**SO THAT** AI 可以个性化与用户的交互

#### Scenario: 输入用户姓名
- **WHEN** 用户配置偏好设置
- **THEN** 系统提供姓名输入字段
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 9.1.2 - 时区设置
**WHEN** 用户配置偏好设置
**THE SYSTEM SHALL** 提供时区输入字段(如 America/New_York)
**SO THAT** AI 可以了解用户的时间偏好

#### Scenario: 设置用户时区
- **WHEN** 用户配置偏好设置
- **THEN** 系统提供时区输入字段
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 9.1.3 - 语言设置
**WHEN** 用户配置偏好设置
**THE SYSTEM SHALL** 提供语言输入字段
**SO THAT** AI 可以了解用户的语言偏好

#### Scenario: 设置用户语言
- **WHEN** 用户配置偏好设置
- **THEN** 系统提供语言输入字段
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 9.2.1 - 城市输入
**WHEN** 用户配置偏好设置
**THE SYSTEM SHALL** 提供城市输入字段(如纽约)
**SO THAT** AI 可以了解用户所在的城市

#### Scenario: 输入用户城市
- **WHEN** 用户配置偏好设置
- **THEN** 系统提供城市输入字段
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 9.2.2 - 国家输入
**WHEN** 用户配置偏好设置
**THE SYSTEM SHALL** 提供国家输入字段(如美国)
**SO THAT** AI 可以了解用户所在的国家

#### Scenario: 输入用户国家
- **WHEN** 用户配置偏好设置
- **THEN** 系统提供国家输入字段
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 9.3.1 - 自由文本备注
**WHEN** 用户配置偏好设置
**THE SYSTEM SHALL** 提供多行文本区域用于输入额外信息
**SO THAT** 用户可以分享任何他们希望 AI 知道的信息

#### Scenario: 输入用户备注
- **WHEN** 用户配置偏好设置
- **THEN** 系统提供多行文本区域
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 9.3.2 - 备注持久化
**WHEN** 用户保存偏好设置
**THE SYSTEM SHALL** 将备注信息保存到用户偏好文件
**SO THAT** AI 可以在后续会话中访问这些信息

#### Scenario: 保存用户备注
- **WHEN** 用户保存偏好设置
- **THEN** 系统将备注保存到偏好文件
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 9.4.1 - 加载偏好设置
**WHEN** 用户访问偏好页面
**THE SYSTEM SHALL** 从 `~/.craft-agent/preferences.json` 加载用户偏好
**SO THAT** 用户可以查看和编辑现有偏好

#### Scenario: 加载用户偏好
- **WHEN** 用户访问偏好页面
- **THEN** 系统从偏好文件加载用户偏好
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 9.4.2 - 保存偏好设置
**WHEN** 用户点击"保存"按钮
**THE SYSTEM SHALL** 将偏好设置写入用户偏好文件
**SO THAT** 设置会保留到下次会话

#### Scenario: 保存用户偏好
- **WHEN** 用户点击"保存"按钮
- **THEN** 系统将偏好设置写入偏好文件
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 9.4.3 - 撤销更改
**WHEN** 用户点击"还原"按钮
**THE SYSTEM SHALL** 将表单恢复到上次保存的状态
**SO THAT** 用户可以撤销未保存的更改

#### Scenario: 还原偏好设置
- **WHEN** 用户点击"还原"按钮
- **THEN** 系统将表单恢复到上次保存的状态
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 9.4.4 - 脏状态指示
**WHEN** 用户修改了任何表单字段
**THE SYSTEM SHALL** 启用"保存"和"还原"按钮
**SO THAT** 用户知道有未保存的更改

#### Scenario: 显示未保存更改提示
- **WHEN** 用户修改了任何表单字段
- **THEN** 系统启用"保存"和"还原"按钮
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 9.4.5 - 保存成功反馈
**WHEN** 偏好设置保存成功
**THE SYSTEM SHALL** 显示检查标记图标并在2秒后消失
**SO THAT** 用户知道保存操作成功完成

#### Scenario: 显示保存成功反馈
- **WHEN** 偏好设置保存成功
- **THEN** 系统显示检查标记图标2秒后消失
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 9.4.6 - 在文件管理器中打开
**WHEN** 用户点击"在 Finder 中打开"按钮
**THE SYSTEM SHALL** 在系统文件管理器中打开偏好文件所在的文件夹
**SO THAT** 用户可以直接访问偏好文件

#### Scenario: 在文件管理器中打开偏好文件
- **WHEN** 用户点击"在 Finder 中打开"按钮
- **THEN** 系统在系统文件管理器中打开偏好文件所在文件夹
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 10.1.1 - 设置页面显示
**WHEN** 用户打开设置面板
**THE SYSTEM SHALL** 在侧边栏显示所有设置页面的列表
**SO THAT** 用户可以方便地导航到不同的设置页面

#### Scenario: 显示设置页面列表
- **WHEN** 用户打开设置面板
- **THEN** 系统在侧边栏显示所有设置页面的列表
> 来源: `apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx`

### Requirement: 10.1.2 - 页面图标和描述
**WHEN** 显示设置页面列表
**THE SYSTEM SHALL** 为每个页面显示图标、标签和简短描述
**SO THAT** 用户可以快速识别各个设置页面

#### Scenario: 显示页面图标和描述
- **WHEN** 显示设置页面列表
- **THEN** 系统显示每个页面的图标、标签和描述
> 来源: `apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx`

### Requirement: 10.1.3 - 选中状态指示
**WHEN** 某个设置页面被选中
**THE SYSTEM SHALL** 高亮显示该页面并使用不同背景色
**SO THAT** 用户知道当前正在查看哪个页面

#### Scenario: 高亮显示选中页面
- **WHEN** 某个设置页面被选中
- **THEN** 系统高亮显示该页面
> 来源: `apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx`

### Requirement: 10.1.4 - 悬停效果
**WHEN** 用户悬停在设置页面项上
**THE SYSTEM SHALL** 显示悬停背景色
**SO THAT** 用户知道该页面可以点击

#### Scenario: 显示悬停效果
- **WHEN** 用户悬停在设置页面项上
- **THEN** 系统显示悬停背景色
> 来源: `apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx`

### Requirement: 10.2.1 - 更多选项菜单
**WHEN** 用户悬停在设置页面项上
**THE SYSTEM SHALL** 显示"..."菜单按钮
**SO THAT** 用户可以访问额外的选项

#### Scenario: 显示更多选项菜单
- **WHEN** 用户悬停在设置页面项上
- **THEN** 系统显示"..."菜单按钮
> 来源: `apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx`

### Requirement: 10.2.2 - 在新窗口中打开
**WHEN** 用户点击"在新窗口中打开"选项
**THE SYSTEM SHALL** 在新的应用窗口中打开选定的设置页面
**SO THAT** 用户可以同时在多个窗口中查看不同的设置页面

#### Scenario: 在新窗口中打开设置页面
- **WHEN** 用户点击"在新窗口中打开"选项
- **THEN** 系统在新的应用窗口中打开选定的设置页面
> 来源: `apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx`

### Requirement: 11.1.1 - 应用配置存储
**WHEN** 用户保存应用级别设置
**THE SYSTEM SHALL** 将设置存储到应用配置位置
**SO THAT** 设置在所有工作区间共享

#### Scenario: 保存应用级别配置
- **WHEN** 用户保存应用级别设置
- **THEN** 系统将设置存储到应用配置位置
> 来源: `apps/electron/src/renderer/pages/settings/` (通用)

### Requirement: 11.1.2 - 设备同步
**WHEN** 用户在不同设备上登录
**THE SYSTEM SHALL** (未来)支持跨设备同步应用设置
**SO THAT** 用户在不同设备上有统一的设置体验

#### Scenario: 跨设备同步应用设置
- **WHEN** 用户在不同设备上登录
- **THEN** 系统(未来)支持跨设备同步应用设置
> 来源: `apps/electron/src/renderer/pages/settings/` (通用)

### Requirement: 11.2.1 - 工作区配置存储
**WHEN** 用户保存工作区级别设置
**THE SYSTEM SHALL** 将设置存储到工作区的配置文件(如 `workspace.json`)
**SO THAT** 设置在工作区会话间保持一致

#### Scenario: 保存工作区配置
- **WHEN** 用户保存工作区级别设置
- **THEN** 系统将设置存储到工作区的配置文件
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 11.2.2 - 配置文件位置
**WHEN** 存储工作区配置
**THE SYSTEM SHALL** 使用工作区根目录作为配置文件的基准路径
**SO THAT** 配置与工作区数据一起存储

#### Scenario: 使用工作区目录存储配置
- **WHEN** 存储工作区配置
- **THEN** 系统使用工作区根目录作为配置文件的基准路径
> 来源: `apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx`

### Requirement: 11.3.1 - 偏好文件格式
**WHEN** 保存用户偏好
**THE SYSTEM SHALL** 使用 JSON 格式存储偏好设置
**SO THAT** 偏好设置易于读取和编辑

#### Scenario: 使用 JSON 格式存储偏好
- **WHEN** 保存用户偏好
- **THEN** 系统使用 JSON 格式存储偏好设置
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 11.3.2 - 偏好文件更新时间戳
**WHEN** 保存用户偏好
**THE SYSTEM SHALL** 添加 `updatedAt` 时间戳字段
**SO THAT** 可以追踪偏好设置的修改时间

#### Scenario: 添加更新时间戳
- **WHEN** 保存用户偏好
- **THEN** 系统添加 `updatedAt` 时间戳字段
> 来源: `apps/electron/src/renderer/pages/settings/PreferencesPage.tsx`

### Requirement: 12.1.1 - 键盘导航
**WHEN** 用户使用键盘导航设置页面
**THE SYSTEM SHALL** 支持完整的键盘操作(Tab、箭头键、Enter、Esc)
**SO THAT** 键盘用户可以高效地使用设置功能

#### Scenario: 使用键盘导航设置
- **WHEN** 用户使用键盘导航设置页面
- **THEN** 系统支持完整的键盘操作
> 来源: `apps/electron/src/renderer/pages/settings/` (通用)

### Requirement: 12.1.2 - 屏幕阅读器支持
**WHEN** 屏幕阅读器读取设置页面
**THE SYSTEM SHALL** 为所有交互元素提供适当的 ARIA 标签
**SO THAT** 视障碍用户可以使用设置功能

#### Scenario: 屏幕阅读器读取设置
- **WHEN** 屏幕阅读器读取设置页面
- **THEN** 系统为交互元素提供适当的 ARIA 标签
> 来源: `apps/electron/src/renderer/pages/settings/` (通用)

### Requirement: 12.1.3 - 对比度
**WHEN** 显示设置页面
**THE SYSTEM SHALL** 确保文本和背景之间有足够的对比度
**SO THAT** 视力较弱的用户可以清楚地阅读设置内容

#### Scenario: 确保足够的对比度
- **WHEN** 显示设置页面
- **THEN** 系统确保文本和背景之间有足够的对比度
> 来源: `apps/electron/src/renderer/pages/settings/` (通用)

### Requirement: 12.2.1 - 多语言标签
**WHEN** 应用在不同语言环境下运行
**THE SYSTEM SHALL** 显示相应语言的设置页面标签和描述
**SO THAT** 母语用户可以轻松理解和使用设置功能

#### Scenario: 显示多语言标签
- **WHEN** 应用在不同语言环境下运行
- **THEN** 系统显示相应语言的设置页面标签和描述
> 来源: `apps/electron/src/renderer/pages/settings/` (通用)

### Requirement: 12.2.2 - 平台特定文本
**WHEN** 应用在不同操作系统上运行
**THE SYSTEM SHALL** 使用平台特定的文本(如 Mac 用 Cmd，Windows 用 Ctrl)
**SO THAT** 用户看到符合其平台的快捷键说明

#### Scenario: 显示平台特定文本
- **WHEN** 应用在不同操作系统上运行
- **THEN** 系统使用平台特定的文本
> 来源: `apps/electron/src/renderer/pages/settings/` (通用)

---

## MODIFIED Requirements

*(无修改的需求)*

---

## REMOVED Requirements

*(无移除的需求)*

---

## 附录 A: 设置页面索引

| 页面ID | 页面名称 | 描述 | 组件文件 |
|--------|---------|------|----------|
| app | App | 通知和更新 | AppSettingsPage.tsx |
| ai | AI | 模型、思考、连接 | AiSettingsPage.tsx |
| appearance | Appearance | 主题、字体、工具图标 | AppearanceSettingsPage.tsx |
| input | Input | 发送键、拼写检查 | InputSettingsPage.tsx |
| workspace | Workspace | 名称、图标、工作目录 | WorkspaceSettingsPage.tsx |
| permissions | Permissions | Explore 模式规则 | PermissionsSettingsPage.tsx |
| labels | Labels | 管理会话标签 | LabelsSettingsPage.tsx |
| shortcuts | Shortcuts | 键盘快捷键 | ShortcutsPage.tsx |
| preferences | Preferences | 用户偏好 | PreferencesPage.tsx |

---

## 附录 B: 配置文件位置

| 配置类型 | 存储位置 | 说明 |
|---------|---------|------|
| 应用配置 | Electron 应用数据目录 | 应用级别设置(通知、主题等) |
| AI 连接 | 应用配置目录 | LLM 连接和凭证 |
| 用户偏好 | `~/.craft-agent/preferences.json` | 用户个人信息和备注 |
| 默认权限 | `~/.craft-agent/permissions/default.json` | Explore 模式默认权限 |
| 工作区配置 | `{workspace}/workspace.json` | 工作区特定设置 |
| 标签配置 | `{workspace}/labels/config.json` | 标签层次和自动规则 |
| 工作区权限 | `{workspace}/permissions.json` | 工作区自定义权限 |
| 工具图标 | `~/.craft-agent/tool-icons/tool-icons.json` | CLI 命令图标映射 |

---

## 附录 C: 权限模式详解

| 模式 | 英文名 | 描述 |
|------|--------|------|
| Safe | 只读模式 | AI 只能读取和研究，不允许任何修改 |
| Ask | 询问模式 | AI 在执行操作前会提示用户确认 |
| Allow-all | 执行模式 | AI 可以完全自主执行操作 |

---

## 附录 D: 思考级别

思考级别控制 AI 推理的深度，从快速简洁到深入详细。用户可以根据任务复杂度选择合适的级别。

---

## 变更历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 1.0 | 2026-03-03 | 初始版本，从 EARS 格式转换为 OpenSpec 格式 |

---

## 文档元数据

- **创建日期**: 2026-03-03
- **最后更新**: 2026-03-03
- **文档格式**: OpenSpec
- **源格式**: EARS (Easy Approach to Requirements Syntax)
- **目标组件**: `apps/electron/src/renderer/pages/settings/`
