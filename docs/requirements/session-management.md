# Session Management Requirements

## 模块描述

会话管理模块负责管理 Craft Agents 应用中的所有会话（对话）生命周期。该模块提供了完整的会话创建、浏览、组织、搜索、分享和删除功能。会话是用户与 AI 助手交互的核心单元，每个会话都属于某个工作区，包含消息历史、配置选项和状态标记。用户可以通过会话列表浏览所有对话，使用各种过滤器和标签管理会话，并支持多会话批量操作。

## ADDED Requirements

### Requirement: 会话创建
系统 SHALL 提供在工作区中创建新会话的功能。

#### Scenario: 创建基础会话
- **WHEN** 用户在会话列表中点击"New Chat"按钮
- **THEN** 系统 SHALL 创建一个新会话，使用工作区的默认配置（权限模式、工作目录、模型、思考级别等）
- **THEN** 系统 SHALL 将新会话标记为活动会话
- **THEN** 用户 SHALL 能够立即开始与新会话交互

#### Scenario: 创建带自定义配置的会话
- **WHEN** 用户指定自定义配置（如特定模型、工作目录、权限模式、TODO状态、标签）创建会话
- **THEN** 系统 SHALL 使用指定的配置替代工作区默认值创建会话
- **THEN** 系统 SHALL 将自定义配置持久化存储

#### Scenario: 创建隐藏会话
- **WHEN** 系统需要创建内部使用的小编辑会话（如 EditPopover）
- **THEN** 系统 SHALL 支持创建带 `hidden=true` 标记的会话
- **THEN** 隐藏会话 SHALL 不会显示在会话列表中

#### Scenario: 创建子会话
- **WHEN** 用户在现有会话基础上创建子会话
- **THEN** 系统 SHALL 创建子会话并关联到父会话
- **THEN** 子会话 SHALL 继承父会话的工作区配置
- **THEN** 子会话 SHALL 支持独立的消息历史和状态管理

---

### Requirement: 会话列表浏览
系统 SHALL 提供可视化的会话列表，按时间分组显示所有会话。

#### Scenario: 显示分组会话
- **WHEN** 用户查看会话列表
- **THEN** 系统 SHALL 按"今天"、"昨天"和具体日期（如"Dec 19"或"2024年12月19日"）分组显示会话
- **THEN** 每个日期分组 SHALL 按时间倒序排列会话

#### Scenario: 会话列表分页加载
- **WHEN** 会话数量较多（超过20个）
- **THEN** 系统 SHALL 初始显示前20个会话
- **THEN** 系统 SHALL 在用户滚动时自动加载更多会话（每批20个）

#### Scenario: 会话信息显示
- **WHEN** 会话显示在列表中
- **THEN** 系统 SHALL 显示会话标题（优先显示用户自定义名称，否则使用第一条用户消息内容，或"New chat"）
- **THEN** 系统 SHALL 显示相对时间（如"7m"、"2h"、"3d"、"2w"）
- **THEN** 系统 SHALL 显示会话状态标记（Flag、归档、未读等）

---

### Requirement: 会话搜索
系统 SHALL 提供会话搜索功能，支持模糊匹配和智能过滤。

#### Scenario: 执行会话搜索
- **WHEN** 用户在搜索框输入关键词
- **THEN** 系统 SHALL 在会话标题、消息内容、标签中搜索匹配项
- **THEN** 系统 SHALL 使用模糊匹配算法显示最相关的会话（最多100个结果）

#### Scenario: 搜索结果分层显示
- **WHEN** 搜索返回结果
- **THEN** 系统 SHALL 将结果分为"匹配当前过滤器"和"所有结果"两部分
- **THEN** 系统 SHALL 突出显示匹配的文本内容

#### Scenario: 清除搜索
- **WHEN** 用户清空搜索框或按ESC键
- **THEN** 系统 SHALL 恢复显示之前的过滤列表
- **THEN** 活动的高亮标记 SHALL 被清除

---

### Requirement: 会话过滤
系统 SHALL 提供多种过滤器来帮助用户快速定位特定会话。

#### Scenario: 按Flag过滤
- **WHEN** 用户选择"Flagged"过滤器
- **THEN** 系统 SHALL 仅显示带有 `isFlagged=true` 标记的会话

#### Scenario: 按Todo状态过滤
- **WHEN** 用户选择特定Todo状态（如"In Progress"、"Done"）
- **THEN** 系统 SHALL 仅显示该状态的会话
- **THEN** 状态图标 SHALL 使用对应颜色显示

#### Scenario: 按标签过滤
- **WHEN** 用户选择特定标签（如"bug"、"priority::3"）
- **THEN** 系统 SHALL 仅显示带有该标签的会话
- **THEN** 系统 SHALL 支持标签值的精确匹配

#### Scenario: 按视图过滤
- **WHEN** 用户选择自定义视图
- **THEN** 系统 SHALL 仅显示匹配视图配置的会话
- **THEN** 系统 SHALL 支持视图的布尔逻辑组合（AND/OR/NOT）

#### Scenario: 按归档状态过滤
- **WHEN** 用户选择"Archived"过滤器
- **THEN** 系统 SHALL 仅显示已被归档的会话

#### Scenario: 组合过滤
- **WHEN** 用户同时应用多个过滤器（如状态+标签）
- **THEN** 系统 SHALL 过滤显示同时满足所有条件的会话
- **THEN** 系统 SHALL 在过滤器标签上显示排除的会话数量

---

### Requirement: 会话选择与导航
系统 SHALL 提供灵活的会话选择机制，支持单选和多选操作。

#### Scenario: 单选会话
- **WHEN** 用户点击会话列表中的某一个会话
- **THEN** 系统 SHALL 将该会话设置为活动会话
- **THEN** 系统 SHALL 在右侧面板显示会话详情

#### Scenario: 多选会话（Cmd/Ctrl+Click）
- **WHEN** 用户按住Cmd或Ctrl键点击多个会话
- **THEN** 系统 SHALL 将所有点击的会话添加到选择集合
- **THEN** 系统 SHALL 在每个选定项上显示复选标记

#### Scenario: 范围选择（Shift+Click）
- **WHEN** 用户按住Shift键点击另一个会话
- **THEN** 系统 SHALL 选择从当前活动会话到目标会话之间的所有会话
- **THEN** 系统 SHALL 使用锚点（anchor）和目标索引确定选择范围

#### Scenario: 全选会话
- **WHEN** 用户使用Cmd+A全选快捷键
- **THEN** 系统 SHALL 选择当前列表中的所有可见会话

#### Scenario: 取消多选
- **WHEN** 用户在多选模式下点击单个会话
- **THEN** 系统 SHALL 清除多选状态，仅保留该会话为活动会话

---

### Requirement: 会话删除
系统 SHALL 提供会话删除功能，支持单个删除和级联删除。

#### Scenario: 删除单个会话
- **WHEN** 用户选择会话菜单中的"Delete"选项
- **THEN** 系统 SHALL 请求用户确认删除操作
- **THEN** 系统 SHALL 删除会话及其所有消息数据
- **THEN** 系统 SHALL 从存储中移除会话文件夹
- **THEN** 系统 SHALL 从列表中移除该会话

#### Scenario: 级联删除会话家族
- **WHEN** 用户删除一个有子会话的父会话
- **THEN** 系统 SHALL 删除父会话及其所有子会话
- **THEN** 系统 SHALL 返回删除的会话总数
- **THEN** 系统 SHALL 更新所有相关子会话的状态

#### Scenario: 批量删除会话
- **WHEN** 用户选中多个会话并触发删除操作
- **THEN** 系统 SHALL 批量删除所有选定会话
- **THEN** 系统 SHALL 在删除完成后更新会话列表

#### Scenario: 删除不存在的会话
- **WHEN** 用户尝试访问已删除的会话ID
- **THEN** 系统 SHALL 显示"This session no longer exists"提示
- **THEN** 系统 SHALL 自动导航到会话列表视图

---

### Requirement: 会话重命名
系统 SHALL 提供会话重命名功能，支持手动输入和AI自动生成。

#### Scenario: 手动重命名
- **WHEN** 用户从会话菜单选择"Rename"或点击标题
- **THEN** 系统 SHALL 打开重命名对话框
- **THEN** 系统 SHALL 预填充当前会话标题
- **WHEN** 用户输入新名称并提交
- **THEN** 系统 SHALL 更新会话的 `name` 字段并持久化
- **THEN** 系统 SHALL 在所有窗口同步更新标题显示

#### Scenario: AI自动生成标题
- **WHEN** 用户从菜单选择"Regenerate Title"
- **THEN** 系统 SHALL 分析最近的用户消息
- **THEN** 系统 SHALL 使用AI模型生成简洁的会话标题
- **THEN** 系统 SHALL 显示闪烁效果表示正在生成
- **THEN** 系统 SHALL 在生成完成后更新标题并显示成功提示

#### Scenario: 标题回退逻辑
- **WHEN** 系统显示会话标题
- **THEN** 系统 SHALL 按"用户自定义名称 > 第一条用户消息 > preview字段 > 'New chat'"的优先级选择显示

#### Scenario: 重命名为空或与原名称相同
- **WHEN** 用户提交空名称或与原始名称相同
- **THEN** 系统 SHALL 拒绝更新并保持原名称不变

---

### Requirement: 会话状态管理
系统 SHALL 提供多种状态标记来帮助用户组织和管理会话。

#### Scenario: Flag标记会话
- **WHEN** 用户点击"Flag"按钮或菜单项
- **THEN** 系统 SHALL 将 `isFlagged` 设置为 `true`
- **THEN** 系统 SHALL 在会话列表中显示Flag图标
- **THEN** 系统 SHALL 同步更新到所有窗口

#### Scenario: 取消Flag标记
- **WHEN** Flag会话的用户点击"Unflag"
- **THEN** 系统 SHALL 将 `isFlagged` 设置为 `false`
- **THEN** 系统 SHALL 移除Flag图标显示

#### Scenario: 归档会话
- **WHEN** 用户点击"Archive"菜单项
- **THEN** 系统 SHALL 将 `isArchived` 设置为 `true`
- **THEN** 系统 SHALL 记录归档时间戳 `archivedAt`
- **THEN** 系统 SHALL 将会话从默认列表中移除
- **THEN** 系统 SHALL 通过"Archived"过滤器可以重新查看

#### Scenario: 取消归档
- **WHEN** 用户在归档列表中点击"Unarchive"
- **THEN** 系统 SHALL 将 `isArchived` 设置为 `false`
- **THEN** 系统 SHALL 清除 `archivedAt` 时间戳
- **THEN** 系统 SHALL 将会话恢复到默认列表中

#### Scenario: 修改Todo状态
- **WHEN** 用户从"Status"子菜单中选择状态
- **THEN** 系统 SHALL 更新 `todoState` 字段为所选状态值
- **THEN** 系统 SHALL 在列表中显示对应的状态图标和颜色

---

### Requirement: 标签系统
系统 SHALL 提供灵活的标签系统，支持层级结构和标签值。

#### Scenario: 添加标签
- **WHEN** 用户从"Labels"子菜单选择标签
- **THEN** 系统 SHALL 将标签ID添加到会话的 `labels` 数组中
- **THEN** 系统 SHALL 在会话列表和菜单中显示标签数量

#### Scenario: 移除标签
- **WHEN** 用户点击已应用的标签
- **THEN** 系统 SHALL 从 `labels` 数组中移除该标签
- **THEN** 系统 SHALL 移除标签值关联的条目（处理 valued labels）

#### Scenario: 标签层级显示
- **WHEN** 标签配置包含子标签
- **THEN** 系统 SHALL 在子菜单中显示层级结构
- **THEN** 父菜单项 SHALL 显示子树中已应用的标签数量

#### Scenario: 标签值支持
- **WHEN** 标签支持值（如"priority::3"）
- **THEN** 系统 SHALL 支持完整的"标签ID::值"格式
- **THEN** 系统 SHALL 使用 `extractLabelId` 提取标签ID进行匹配

---

### Requirement: 未读状态跟踪
系统 SHALL 跟踪会话的未读状态，帮助用户识别新消息。

#### Scenario: 设置未读标记
- **WHEN** 辅助消息完成且用户不在查看该会话
- **THEN** 系统 SHALL 设置 `hasUnread` 为 `true`
- **THEN** 系统 SHALL 更新 `lastFinalMessageId` 标记最后消息位置

#### Scenario: 清除未读标记
- **WHEN** 用户查看会话且窗口处于焦点状态
- **THEN** 系统 SHALL 设置 `hasUnread` 为 `false`
- **THEN** 系统 SHALL 更新 `lastReadMessageId` 为当前最后消息ID

#### Scenario: 手动标记为未读
- **WHEN** 用户从菜单选择"Mark as Unread"
- **THEN** 系统 SHALL 将 `hasUnread` 设置为 `true`
- **THEN** 系统 SHALL 在会话列表中显示NEW标记

---

### Requirement: 会话分享
系统 SHALL 支持将会话分享到在线查看器。

#### Scenario: 创建分享链接
- **WHEN** 用户点击"Share"按钮
- **THEN** 系统 SHALL 将会话上传到云端查看器服务
- **THEN** 系统 SHALL 生成可访问的分享URL
- **THEN** 系统 SHALL 复制URL到剪贴板并显示成功提示
- **THEN** 系统 SHALL 在界面中显示共享图标（云朵填充）

#### Scenario: 查看已分享的会话
- **WHEN** 会话已分享且用户查看"Shared"菜单
- **THEN** 系统 SHALL 显示子菜单项："Open in Browser"、"Copy Link"、"Update Share"、"Stop Sharing"

#### Scenario: 更新分享内容
- **WHEN** 会话有新消息后用户点击"Update Share"
- **THEN** 系统 SHALL 将最新的消息内容同步到云端查看器
- **THEN** 系统 SHALL 显示更新成功的提示

#### Scenario: 停止分享
- **WHEN** 用户点击"Stop Sharing"
- **THEN** 系统 SHALL 向云端发送撤销分享请求
- **THEN** 系统 SHALL 清除本地的 `sharedUrl` 和 `sharedId` 字段
- **THEN** 系统 SHALL 移除共享图标显示

#### Scenario: 在浏览器中打开
- **WHEN** 用户点击"Open in Browser"
- **THEN** 系统 SHALL 使用默认浏览器打开分享链接

#### Scenario: 在新窗口中打开
- **WHEN** 用户点击"Open in New Window"
- **THEN** 系统 SHALL 在新的Electron窗口中打开会话
- **THEN** 新窗口 SHALL 加载相同的会话视图

---

### Requirement: 会话文件操作
系统 SHALL 提供访问和管理会话磁盘存储的功能。

#### Scenario: 在Finder/文件管理器中查看
- **WHEN** 用户点击"View in Finder"
- **THEN** 系统 SHALL 在系统文件管理器中打开会话文件夹
- **THEN** 用户 SHALL 能够查看和操作会话文件

#### Scenario: 复制会话路径
- **WHEN** 用户点击"Copy Path"
- **THEN** 系统 SHALL 将会话文件夹的绝对路径复制到剪贴板
- **THEN** 系统 SHALL 显示路径复制成功的提示

---

### Requirement: 会话配置管理
系统 SHALL 支持会话级别的配置选项，用于控制AI行为。

#### Scenario: 设置工作目录
- **WHEN** 用户在工作目录输入中选择路径
- **THEN** 系统 SHALL 更新会话的 `workingDirectory` 字段
- **THEN** 系统 SHALL 持久化配置并在后续消息中生效

#### Scenario: 更换LLM模型
- **WHEN** 用户从模型下拉菜单选择新模型
- **THEN** 系统 SHALL 更新会话的 `model` 字段
- **THEN** 系统 SHALL 持久化模型选择

#### Scenario: 更换LLM连接（仅首条消息前）
- **WHEN** 用户在会话未发送任何消息前更换LLM连接
- **THEN** 系统 SHALL 更新 `llmConnection` 字段
- **THEN** 系统 SHALL 刷新AI能力（如工具可用性）

#### Scenario: 首条消息后禁止更换连接
- **WHEN** 用户在已有消息的会话中尝试更换LLM连接
- **THEN** 系统 SHALL 拒绝操作
- **THEN** 系统 SHALL 显示错误提示"Cannot change connection after session has started"

#### Scenario: 设置权限模式
- **WHEN** 用户更换权限模式（safe/ask/allow-all）
- **THEN** 系统 SHALL 更新 `permissionMode` 字段
- **THEN** 系统 SHALL 影响后续工具调用的自动批准逻辑

#### Scenario: 设置思考级别
- **WHEN** 用户调整思考级别（off/think/max）
- **THEN** 系统 SHALL 更新 `thinkingLevel` 字段
- **THEN** 系统 SHALL 影响 AI推理的详细程度

---

### Requirement: 会话数据持久化
系统 SHALL 确保所有会话数据安全持久化。

#### Scenario: 自动保存会话
- **WHEN** 会话状态发生变化（如消息添加、配置更新）
- **THEN** 系统 SHALL 自动将会话数据写入磁盘
- **THEN** 系统 SHALL 使用队列批处理写入操作以优化性能

#### Scenario: 延迟加载消息
- **WHEN** 用户查看大量会话
- **THEN** 系统 SHALL 仅加载会话元数据（从JSONL头部）
- **THEN** 系统 SHALL 在用户打开会话时才加载完整消息历史

#### Scenario: 恢复未完成的会话
- **WHEN** 应用重启
- **THEN** 系统 SHALL 从磁盘加载所有保存的会话
- **THEN** 系统 SHALL 恢复会话的草稿输入内容

#### Scenario: 跨窗口同步
- **WHEN** 会话在主进程更新时
- **THEN** 系统 SHALL 通过IPC事件通知所有渲染进程窗口
- **THEN** 所有窗口 SHALL 同步更新会话状态

---

### Requirement: 性能优化
系统 SHALL 优化会话管理性能以处理大量会话。

#### Scenario: 懒加载会话列表
- **WHEN** 应用启动
- **THEN** 系统 SHALL 首先仅加载会话元数据（不包括消息）
- **THEN** 系统 SHALL 延迟加载消息直到用户打开会话

#### Scenario: 批量操作优化
- **WHEN** 用户执行批量操作（如删除多个会话）
- **THEN** 系统 SHALL 批量处理以提高效率
- **THEN** 系统 SHALL 在完成后统一更新UI

#### Scenario: 会话切换性能
- **WHEN** 用户切换活动会话
- **THEN** 系统 SHALL 在100ms内完成基本渲染
- **THEN** 系统 SHALL 先显示骨架屏再加载实际内容

---

### Requirement: 快捷键支持
系统 SHALL 提供键盘快捷键以提高操作效率。

#### Scenario: 会话导航
- **WHEN** 用户按上下箭头键
- **THEN** 系统 SHALL 移动焦点到上一个/下一个会话

#### Scenario: 打开会话
- **WHEN** 用户按空格键或回车键
- **THEN** 系统 SHALL 打开当前活动会话

#### Scenario: 上下文菜单
- **WHEN** 用户右键点击会话
- **THEN** 系统 SHALL 显示会话操作菜单

---

### Requirement: 会话级Token跟踪
系统 SHALL 跟踪会话的Token使用情况。

#### Scenario: 显示Token统计
- **WHEN** 会话有消息生成完成时
- **THEN** 系统 SHALL 收集并显示Token使用量（inputTokens、outputTokens、totalTokens、contextTokens）
- **THEN** 系统 SHALL 计算并显示成本（costUsd）

#### Scenario: 显示缓存统计
- **WHEN** 模型支持提示缓存
- **THEN** 系统 SHALL 显示缓存读取和缓存创建Token数量
- **THEN** 系统 SHALL 显示上下文窗口大小（contextWindow）

---

### Requirement: 会话子会话管理
系统 SHALL 支持从父会话创建子会话。

#### Scenario: 创建子会话
- **WHEN** 用户从现有会话创建新会话（如EditPopover编辑操作）
- **THEN** 系统 SHALL 创建新会话并设置 `parentSessionId`
- **THEN** 子会话 SHALL 可以独立管理其消息和状态

#### Scenario: 获取会话家族
- **WHEN** 系统需要获取父会话的所有子会话
- **THEN** 系统 SHALL 返回所有 `parentSessionId` 为该父会话ID的子会话列表

#### Scenario: 调整子会话顺序
- **WHEN** 用户手动重新排序子会话
- **THEN** 系统 SHALL 更新每个子会话的 `siblingOrder` 字段
- **THEN** 系统 SHALL 按更新后的顺序显示子会话

---

## MODIFIED Requirements

初版整理，暂无。

## REMOVED Requirements

初版整理，暂无。
