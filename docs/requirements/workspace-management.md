# 工作区管理模块需求文档 (Workspace Management Requirements)

## ADDED Requirements

### Requirement: 工作区切换
系统 SHALL 提供工作区切换功能，允许用户在多个工作区之间快速切换。

#### Scenario: 显示当前工作区
- **WHEN** 用户查看侧边栏
- **THEN** 显示当前活动工作区的头像和名称

#### Scenario: 切换工作区
- **WHEN** 用户点击工作区切换器并选择另一个工作区
- **THEN** 系统加载该工作区，更新当前会话列表和配置

#### Scenario: 标识活动工作区
- **WHEN** 工作区列表展开
- **THEN** 系统在当前活动工作区旁显示勾选标记

#### Scenario: 侧边栏折叠模式
- **WHEN** 侧边栏处于折叠状态
- **THEN** 工作区切换器仅显示头像（图标模式）

---

### Requirement: 新窗口打开工作区
系统 SHALL 提供在新窗口打开工作区的功能。

#### Scenario: Cmd/Ctrl+Click 在新窗口打开
- **WHEN** 用户按住Cmd或Ctrl键点击工作区菜单项
- **THEN** 系统在新窗口中打开该工作区

#### Scenario: 点击外部链接按钮
- **WHEN** 用户悬停在非活动工作区并点击外部链接图标
- **THEN** 系统在新窗口中打开该工作区

---

### Requirement: 工作区创建向导
系统 SHALL 提供全屏工作区创建向导。

#### Scenario: 显示创建向导
- **WHEN** 用户点击"Add Workspace..."按钮
- **THEN** 系统显示全屏创建覆盖层，包含Dithering动画背景

#### Scenario: 关闭创建向导
- **WHEN** 用户点击关闭按钮或按ESC键
- **THEN** 系统关闭创建覆盖层返回主界面（除非正在创建中）

#### Scenario: 防止创建中关闭
- **WHEN** 工作区正在创建中
- **THEN** 用户无法关闭创建覆盖层，关闭按钮禁用

---

### Requirement: 工作区创建方式选择
系统 SHALL 提供两种工作区创建方式供用户选择。

#### Scenario: 选择"Create new"
- **WHEN** 用户点击"Create new"卡片
- **THEN** 系统进入创建新工作区步骤

#### Scenario: 选择"Open folder"
- **WHEN** 用户点击"Open folder"卡片
- **THEN** 系统进入打开现有文件夹步骤

#### Scenario: 返回选择步骤
- **WHEN** 用户在创建步骤点击"Back"按钮
- **THEN** 系统返回初始选择步骤

---

### Requirement: 创建新工作区
系统 SHALL 提供创建新工作区的功能。

#### Scenario: 输入工作区名称
- **WHEN** 用户在工作区名称输入框输入文本
- **THEN** 系统实时生成slug并验证唯一性

#### Scenario: 验证名称唯一性
- **WHEN** 用户输入的工作区名称已存在
- **THEN** 系统显示错误提示"A workspace named "{slug}" already exists"

#### Scenario: 选择默认位置
- **WHEN** 用户选择"Default location"
- **THEN** 系统显示路径为"~/.craft-agent/workspaces/{slug}"

#### Scenario: 选择自定义位置
- **WHEN** 用户选择"Choose a location"并点击Browse
- **THEN** 系统打开文件夹选择对话框，用户选择后显示完整路径

#### Scenario: 创建工作区
- **WHEN** 用户点击"Create"按钮且输入有效
- **THEN** 系统在工作区路径创建新工作区，显示成功提示并自动切换

#### Scenario: 创建中状态
- **WHEN** 工作区正在创建
- **THEN** 按钮显示"Creating..."并禁用其他操作

---

### Requirement: 打开现有文件夹作为工作区
系统 SHALL 提供将现有文件夹作为工作区打开的功能。

#### Scenario: 浏览文件夹
- **WHEN** 用户点击"Browse"按钮
- **THEN** 系统打开文件夹选择对话框

#### Scenario: 自动填充名称
- **WHEN** 用户选择文件夹后
- **THEN** 系统自动将文件夹名填充为工作区名称

#### Scenario: 修改工作区名称
- **WHEN** 用户编辑工作区名称输入框
- **THEN** 系统允许自定义名称（不同于文件夹名）

#### Scenario: 打开工作区
- **WHEN** 用户点击"Open"按钮且已选择文件夹和名称
- **THEN** 系统将该文件夹作为工作区加载，显示成功提示

#### Scenario: 打开中状态
- **WHEN** 工作区正在打开
- **THEN** 按钮显示"Opening..."并禁用其他操作

---

### Requirement: 工作区图标显示
系统 SHALL 提供工作区图标显示功能。

#### Scenario: 显示本地图标
- **WHEN** 工作区配置了本地图标文件
- **THEN** 系统通过IPC读取文件并显示

#### Scenario: 显示远程图标
- **WHEN** 工作区配置了远程图标URL（http/https）
- **THEN** 系统直接使用该URL显示图标

#### Scenario: 无图标时显示首字母
- **WHEN** 工作区无图标或图标加载失败
- **THEN** 系统显示工作区名称首字母的圆形头像

#### Scenario: 图标缓存
- **WHEN** 工作区图标URL未变化
- **THEN** 系统使用缓存避免重复加载

---

### Requirement: 工作区配置管理
系统 SHALL 提供工作区配置的动态管理。

#### Scenario: 动态状态配置
- **WHEN** 工作区配置文件定义了自定义状态
- **THEN** 系统加载并显示这些状态选项

#### Scenario: 动态标签配置
- **WHEN** 工作区配置文件定义了自定义标签结构
- **THEN** 系统加载并显示层级标签菜单

#### Scenario: 动态视图配置
- **WHEN** 工作区配置文件定义了自定义视图
- **THEN** 系统加载并显示这些视图选项

---

## MODIFIED Requirements

无修改的需求。

---

## REMOVED Requirements

无删除的需求。

---

## 版本历史
- v1.0 - 初始需求提取 (2025-03-03)
