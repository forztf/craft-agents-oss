# 会话管理模块需求文档 (Session Management Requirements)

## ADDED Requirements

### Requirement: 会话列表显示
系统 SHALL 提供会话列表显示功能，用于展示用户创建的所有聊天会话。

#### Scenario: 按日期分组显示会话
- **WHEN** 用户进入会话列表视图
- **THEN** 系统按日期将会话分组（今天/昨天/具体日期），并按时间倒序排列

#### Scenario: 显示会话摘要信息
- **WHEN** 会话列表渲染
- **THEN** 每个会话项应显示：会话名称、最后消息时间戳、处理状态、标记状态、未读状态、最后消息角色

---

### Requirement: 会话搜索
系统 SHALL 提供会话搜索功能，允许用户按标题和内容搜索会话。

#### Scenario: 实时搜索会话标题
- **WHEN** 用户在搜索框输入查询文本（至少2个字符）
- **THEN** 系统实时过滤并高亮匹配的会话标题

#### Scenario: 搜索会话内容
- **WHEN** 用户执行搜索
- **THEN** 系统搜索会话内容并显示匹配数量，支持最大100个结果

#### Scenario: 显示搜索状态
- **WHEN** 搜索进行中
- **THEN** 显示"Loading…"提示
- **WHEN** 搜索完成
- **THEN** 显示结果数量（如"15 results"或"100+"）

#### Scenario: 关闭搜索
- **WHEN** 用户点击搜索框的关闭按钮
- **THEN** 清除搜索查询并返回完整会话列表

---

### Requirement: 会话选择与切换
系统 SHALL 提供会话选择和切换功能。

#### Scenario: 点击选择会话
- **WHEN** 用户点击列表中的会话项
- **THEN** 系统加载会话内容并标记为已读

#### Scenario: 键盘导航选择会话
- **WHEN** 用户使用上下箭头键在会话列表中导航
- **THEN** 系统高亮当前焦点会话，按Enter键选择并聚焦聊天输入框

---

### Requirement: 会话创建
系统 SHALL 提供会话创建功能。

#### Scenario: 创建新会话
- **WHEN** 用户通过菜单或快捷键创建新会话
- **THEN** 系统在当前工作区创建新会话，自动命名为"New chat"

---

### Requirement: 会话重命名
系统 SHALL 提供会话重命名功能。

#### Scenario: 通过菜单重命名
- **WHEN** 用户在会话菜单中选择"Rename"
- **THEN** 显示重命名对话框，允许用户编辑会话名称并保存

#### Scenario: 在元数据面板重命名
- **WHEN** 用户在右侧元数据面板编辑会话名称输入框
- **THEN** 系统自动保存（500ms防抖）新名称

---

### Requirement: 会话标记管理
系统 SHALL 提供会话标记管理功能。

#### Scenario: 标记会话
- **WHEN** 用户在会话菜单中选择"Flag"
- **THEN** 系统标记该会话为重要状态，显示标记图标

#### Scenario: 取消标记
- **WHEN** 用户在已标记的会话菜单中选择"Unflag"
- **THEN** 系统移除标记状态

#### Scenario: 筛选标记会话
- **WHEN** 用户导航到"Flagged"视图
- **THEN** 系统仅显示标记为Flag的会话

---

### Requirement: 会话存档管理
系统 SHALL 提供会话存档管理功能。

#### Scenario: 存档会话
- **WHEN** 用户在会话菜单中选择"Archive"
- **THEN** 系统将会话标记为已存档，从常规列表中隐藏

#### Scenario: 取消存档
- **WHEN** 用户在已存档会话菜单中选择"Unarchive"
- **THEN** 系统取消存档状态，恢复到常规列表

#### Scenario: 查看存档会话
- **WHEN** 用户导航到"Archived"视图
- **THEN** 系统仅显示已存档的会话

---

### Requirement: 会话状态管理
系统 SHALL 提供动态状态管理功能。

#### Scenario: 更改会话状态
- **WHEN** 用户在会话菜单的状态子菜单中选择一个状态
- **THEN** 系统更新会话的状态，显示对应的图标和颜色

#### Scenario: 筛选特定状态的会话
- **WHEN** 用户导航到特定状态视图
- **THEN** 系统仅显示该状态下的会话

#### Scenario: 状态动态配置
- **WHEN** 工作区配置定义了自定义状态
- **THEN** 系统在菜单中显示这些动态配置的状态选项

---

### Requirement: 会话标签管理
系统 SHALL 提供会话标签管理功能。

#### Scenario: 添加标签
- **WHEN** 用户在标签子菜单选择一个标签
- **THEN** 系统将该标签添加到会话，显示勾选标记

#### Scenario: 移除标签
- **WHEN** 用户在已应用的标签菜单项上再次点击
- **THEN** 系统移除该标签，隐藏勾选标记

#### Scenario: 层级标签菜单
- **WHEN** 标签配置包含层级结构
- **THEN** 系统渲染嵌套子菜单，父节点显示子树中应用的标签数量

#### Scenario: 筛选标签会话
- **WHEN** 用户导航到特定标签视图
- **THEN** 系统仅显示应用了该标签的会话

---

### Requirement: 会话未读状态管理
系统 SHALL 提供会话未读状态管理功能。

#### Scenario: 检测未读消息
- **WHEN** 会话收到新的最终助手消息且用户未查看该会话
- **THEN** 系统标记会话为未读，显示NEW标记

#### Scenario: 标记已读
- **WHEN** 用户切换到未读会话
- **THEN** 系统移除未读标记

#### Scenario: 标记为未读
- **WHEN** 用户在已读的会话菜单中选择"Mark as Unread"
- **THEN** 系统恢复未读标记

---

### Requirement: 会话删除
系统 SHALL 提供会话删除功能。

#### Scenario: 删除会话
- **WHEN** 用户在会话菜单中选择"Delete"
- **THEN** 显示确认对话框，用户确认后永久删除会话

---

### Requirement: 会话分享功能
系统 SHALL 提供会话分享功能。

#### Scenario: 分享到查看器
- **WHEN** 用户选择"Share"
- **THEN** 系统生成分享链接并复制到剪贴板，显示成功提示

#### Scenario: 打开分享链接
- **WHEN** 会话已分享，用户选择"Open in Browser"
- **THEN** 系统在浏览器中打开分享URL

#### Scenario: 复制分享链接
- **WHEN** 会话已分享，用户选择"Copy Link"
- **THEN** 系统将分享URL复制到剪贴板

#### Scenario: 更新分享
- **WHEN** 会话已分享，用户选择"Update Share"
- **THEN** 系统更新分享内容，显示成功提示

#### Scenario: 停止分享
- **WHEN** 会话已分享，用户选择"Stop Sharing"
- **THEN** 系统撤销分享并显示成功提示

---

### Requirement: 会话文件操作
系统 SHALL 提供会话文件位置相关功能。

#### Scenario: 在Finder中显示
- **WHEN** 用户选择"View in Finder"
- **THEN** 系统打开文件管理器并定位到会话文件位置

#### Scenario: 复制文件路径
- **WHEN** 用户选择"Copy Path"
- **THEN** 系统将会话文件路径复制到剪贴板

---

### Requirement: 新窗口打开会话
系统 SHALL 提供在新窗口打开会话的功能。

#### Scenario: 在新窗口打开
- **WHEN** 用户选择"Open in New Window"
- **THEN** 系统在独立的浏览器窗口中打开该会话

---

### Requirement: 会话标题重新生成
系统 SHALL 提供AI驱动的会话标题重新生成功能。

#### Scenario: 重新生成标题
- **WHEN** 用户选择"Regenerate Title"
- **THEN** 系统基于最近消息生成新标题并更新显示

---

### Requirement: 会话列表分页
系统 SHALL 提供会话列表分页功能以优化性能。

#### Scenario: 初始加载
- **WHEN** 会话列表首次渲染
- **THEN** 系统显示前20个会话

#### Scenario: 滚动加载更多
- **WHEN** 用户滚动到列表底部
- **THEN** 系统批量加载20个更多会话

---

### Requirement: 会话元数据面板
系统 SHALL 提供会话元数据编辑面板。

#### Scenario: 显示会话信息
- **WHEN** 用户打开右侧元数据面板
- **THEN** 显示会话名称、备注信息和会话文件列表

#### Scenario: 编辑会话备注
- **WHEN** 用户在备注区域输入文本
- **THEN** 系统自动保存（500ms防抖）备注内容

#### Scenario: 调整面板大小
- **WHEN** 用户拖动中间的水平调整手柄
- **THEN** 系统调整元数据区域和文件区域的分割比例，并记住用户偏好

#### Scenario: 未选择会话
- **WHEN** 右侧面板打开但未选择任何会话
- **THEN** 显示"No session selected"提示信息

---

### Requirement: 会话多选功能
系统 SHALL 提供会话多选功能。

#### Scenario: 进入多选模式
- **WHEN** 用户按住Cmd/Ctrl键点击会话项
- **THEN** 系统进入多选模式，显示复选框并允许批量选择会话

#### Scenario: 范围选择
- **WHEN** 用户按住Shift键点击会话项
- **THEN** 系统选择从上一个选中项到当前点击项之间的所有会话

#### Scenario: 退出多选模式
- **WHEN** 用户点击已选中的单个会话
- **THEN** 系统取消其他选择，切换到单选模式

---

### Requirement: 会话二级筛选功能
系统 SHALL 提供会话二级筛选功能（状态和标签筛选）。

#### Scenario: 应用状态筛选
- **WHEN** 用户在当前视图上点击状态筛选芯片
- **THEN** 系统仅显示符合该状态的会话（include模式）

#### Scenario: 排除状态筛选
- **WHEN** 用户切换筛选模式为exclude
- **THEN** 系统隐藏符合该状态的会话

#### Scenario: 应用标签筛选
- **WHEN** 用户在当前视图上点击标签筛选芯片
- **THEN** 系统仅显示应用了该标签的会话

#### Scenario: 组合筛选
- **WHEN** 用户同时应用多个状态和标签筛选
- **THEN** 系统仅显示同时满足所有筛选条件的会话

---

### Requirement: 会话搜索内容高亮
系统 SHALL 提供会话搜索时的内容高亮功能。

#### Scenario: 高亮搜索匹配
- **WHEN** 用户搜索会话内容
- **THEN** 系统在ChatDisplay中高亮显示匹配文本

#### Scenario: 显示匹配数量
- **WHEN** 会话内容有搜索匹配
- **THEN** 系统在会话项上显示匹配数量徽章

#### Scenario: 导航搜索匹配
- **WHEN** 系统处于搜索模式
- **THEN** 用户可以使用快捷键在不同匹配间导航

---

## MODIFIED Requirements

### Requirement: 会话时间戳格式
#### Scenario: 多语言时间显示
- **WHEN** 系统语言设置为英文或中文
- **THEN** 系统显示对应的相对时间格式（如"2h ago"/"2小时前", "Today"/"今天"）

---

## REMOVED Requirements

无删除的需求。

---

## 版本历史
- v1.0 - 初始需求提取 (2025-03-03)
