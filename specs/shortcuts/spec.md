# OpenSpec Requirement Specification: Shortcuts / Actions Module

## ADDED Requirements

### 2.1 Requirement: 快捷键注册机制

**Requirement: 快捷键注册机制**

系统 SHALL 提供统一的快捷键注册机制，允许组件将其操作处理器注册到中央注册表。

**子系统 SHALL:**
- 接受操作ID（`ActionId`）、处理器函数和可选启用条件作为注册参数
- 维护操作ID到处理器列表的映射关系
- 为每个注册返回清理函数，在组件卸载时自动注销处理器

**系统 SHALL:**
- 支持同一操作ID注册多个处理器
- 按注册顺序执行处理器，找到第一个启用的处理器后终止

**系统 SHALL NOT:**
- 允许注册空操作ID或空处理器函数

#### Scenario: 组件注册快捷键处理器
- **WHEN** 组件调用 `useAction('app.newChat', handler, options)`
  - **THEN** 系统将处理器注册到中央注册表
  - **THEN** 返回清理函数供组件卸载时调用

#### Scenario: 多处理器优先级
- **WHEN** 同一操作ID注册了多个处理器
  - **WHEN** 第一个处理器未启用（enabled 返回 false）
    - **THEN** 系统尝试执行下一个启用的处理器
    - **THEN** 找到第一个启用的处理器后终止执行

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/src/renderer/actions/useAction.ts`, `apps/electron/src/renderer/actions/types.ts`

---

### 2.2 Requirement: 跨平台快捷键处理

**Requirement: 跨平台快捷键处理**

系统 SHALL 根据用户操作系统平台自动适配快捷键键位映射和显示符号。

**子系统 SHALL:**
- 检测当前平台类型（`isMac`）
- 将通用修饰键 `mod` 映射为平台特定键位（macOS: ⌘/Cmd，Windows/Linux: Ctrl）
- 将快捷键格式化为平台特定的显示字符串

**系统 SHALL:**
- 支持以下修饰键映射：
  - `mod` → macOS: ⌘，Windows: Ctrl
  - `shift` → macOS: ⇧，Windows: Shift
  - `alt` → macOS: ⌥，Windows: Alt
- 支持特殊键位：
  - `[`、`]`、`,`、`.`、`←`、`→`、`↑`、`↓`
  - `Escape` / `Esc`、`Tab`

#### Scenario: macOS 快捷键显示
- **WHEN** 在 macOS 系统上显示 `mod+n` 快捷键
  - **THEN** 系统显示为 `⌘N`

#### Scenario: Windows 快捷键显示
- **WHEN** 在 Windows 系统上显示 `mod+shift+n` 快捷键
  - **THEN** 系统显示为 `Ctrl+Shift+N`

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/lib/platform.ts`

---

### 2.3 Requirement: 全局键盘事件捕获

**Requirement: 全局键盘事件捕获**

系统 SHALL 在捕获阶段监听全局键盘事件，确保快捷键事件不会被其他事件处理器拦截。

**子系统 SHALL:**
- 在 `window` 对象的 `keydown` 事件上注册捕获阶段监听器
- 对每个键盘事件检查所有已注册操作的快捷键匹配

**系统 SHALL:**
- 匹配快捷键时执行以下检查：
  - 检查当前焦点元素是否为输入元素（INPUT/TEXTAREA 或 contentEditable）
  - 检查输入元素中的文本选择状态
  - 检查操作是否标记为 `inputSafe`
  - 匹配修饰键和主键的组合
- 匹配成功时阻止默认事件和冒泡

#### Scenario: 非输入元素中的快捷键触发
- **WHEN** 用户在聊天显示区域按下 `mod+n`
  - **WHEN** 聊天显示区域不是输入元素
  - **WHEN** `app.newChat` 操作已注册
    - **THEN** 系统触发 `app.newChat` 处理器
    - **THEN** 阻止默认浏览器行为

#### Scenario: 输入元素中的非 inputSafe 快捷键
- **WHEN** 用户在文本输入框中按下 `mod+n`
  - **WHEN** `app.newChat` 操作未标记为 `inputSafe`
    - **THEN** 系统忽略该快捷键
    - **THEN** 允许默认浏览器行为

> 来源: `apps/electron/src/renderer/actions/registry.tsx`

---

### 2.4 Requirement: 输入安全模式

**Requirement: 输入安全模式**

系统 SHALL 支持 `inputSafe` 标记，允许特定快捷键在用户输入文本时仍能触发。

**子系统 SHALL:**
- 在操作定义中提供 `inputSafe` 布尔属性
- 在快捷键匹配时检查 `inputSafe` 属性

**系统 SHALL:**
- 对于 `inputSafe` 的 Escape 快捷键：
  - 尊重浏览器的文本选择清除行为
  - 在文本选择存在时不触发操作
- 对于其他 `inputSafe` 快捷键：
  - 直接触发操作处理器
  - 阻止默认浏览器行为

#### Scenario: Escape 停止处理
- **WHEN** 用户在聊天输入框中选中文本
  - **WHEN** 按下 Escape 键
    - **THEN** 系统清除文本选择
    - **THEN** 不触发 `chat.stopProcessing` 操作
- **WHEN** 用户第二次按下 Escape 键
  - **WHEN** 没有文本选择存在
    - **THEN** 系统触发 `chat.stopProcessing` 操作

#### Scenario: Tab 切换权限模式
- **WHEN** 用户在聊天输入框中键入时按下 `Shift+Tab`
  - **WHEN** `chat.cyclePermissionMode` 操作标记为 `inputSafe`
    - **THEN** 系统触发权限模式切换
    - **THEN** 不阻止输入框内的 Tab 行为

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/src/renderer/actions/definitions.ts`, `apps/electron/src/renderer/actions/types.ts`

---

### 2.5 Requirement: 操作启用条件

**Requirement: 操作启用条件**

系统 SHALL 允许为每个操作处理器指定动态启用条件。

**子系统 SHALL:**
- 接受 `enabled()` 函数作为可选参数
- 在匹配快捷键后调用 `enabled()` 函数检查是否启用

**系统 SHALL:**
- 仅执行已启用的处理器
- 当处理器未启用时尝试执行下一个处理器（如果有）

#### Scenario: 区域性快捷键
- **WHEN** 会话列表组件注册 `sessionList.selectAll` 操作
  - **WHEN** 启用条件检查焦点是否在会话列表区域
  - **WHEN** 用户焦点不在会话列表时按下 `mod+a`
    - **THEN** 系统不触发该操作处理器
    - **THEN** 尝试查找其他启用的处理器

> 来源: `apps/electron/src/renderer/actions/useAction.ts`, `apps/electron/src/renderer/actions/types.ts`

---

### 2.6 Requirement: 用户快捷键覆盖

**Requirement: 用户快捷键覆盖**

系统 SHALL 支持用户自定义快捷键覆盖默认快捷键（架构预留）。

**子系统 SHALL:**
- 在注册表中维护 `userOverrides` 映射
- 在获取快捷键时优先检查用户覆盖

**系统 SHALL:**
- 允许用户将快捷键设置为 `null` 以禁用操作
- 允许用户将快捷键设置为自定义组合键

#### Scenario: 用户自定义快捷键
- **WHEN** 用户将 `app.newChat` 的快捷键从 `mod+n` 改为 `mod+shift+n`
  - **WHEN** 系统存储用户覆盖
    - **THEN** 用户按下 `mod+shift+n` 时触发 `app.newChat`
    - **THEN** 原 `mod+n` 快捷键不再绑定该操作

#### Scenario: 禁用快捷键
- **WHEN** 用户将键盘快捷键对话框的快捷键设置为 `null`
  - **THEN** `app.keyboardShortcuts` 操作不再响应任何快捷键
  - **THEN** 用户只能通过菜单或其他方式打开对话框

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/src/renderer/actions/types.ts`

---

### 2.7 Requirement: 快捷键显示

**Requirement: 快捷键显示**

系统 SHALL 提供格式化的快捷键显示字符串，用于 UI 元素中的快捷键提示。

**子系统 SHALL:**
- 提供 `getHotkeyDisplay(actionId)` 函数
- 根据 `userOverrides` 和 `defaultHotkey` 计算实际快捷键
- 格式化为平台特定的显示字符串

**系统 SHALL:**
- Mac 平台使用连接符号格式（如 `⌘⇧N`）
- Windows/Linux 使用加号分隔格式（如 `Ctrl+Shift+N`）

#### Scenario: 工具提示中的快捷键
- **WHEN** 组件调用 `useHotkeyLabel('app.newChat')`
  - **THEN** 系统返回平台特定的快捷键字符串
  - **THEN** Mac 返回 `⌘N`
  - **THEN** Windows 返回 `Ctrl+N`

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/src/renderer/actions/useHotkeyLabel.ts`

---

### 2.8 Requirement: 国际化标签

**Requirement: 国际化标签**

系统 SHALL 支持操作标签和描述的国际化。

**子系统 SHALL:**
- 提供使用 i18n 的标签 getter 函数
- 使用 `actions/definitions` 命名空间翻译标签和描述

**系统 SHALL:**
- 返回当前语言环境下的翻译文本
- 提供标签、描述和快捷键显示信息

#### Scenario: 中英文标签显示
- **WHEN** 当前语言为 `zh-CN`
  - **THEN** 操作标签显示为中文翻译（如"新建聊天"）
  - **THEN** 描述显示为中文翻译
- **WHEN** 当前语言为 `en`
  - **THEN** 操作标签显示为英文原文（如"New Chat"）
  - **THEN** 描述显示为英文原文

> 来源: `apps/electron/src/renderer/actions/useHotkeyLabel.ts`, `apps/electron/src/contexts/I18nContext.tsx`

---

### 3.1 Requirement: 键盘快捷键对话框

**Requirement: 键盘快捷键对话框**

系统 SHALL 提供键盘快捷键参考对话框，按分类显示所有已注册的操作快捷键。

**子系统 SHALL:**
- 使用模态对话框组件显示快捷键列表
- 按操作分类分组显示（General、Navigation、View、Session List、Chat）
- 显示操作标签和对应的快捷键组合

**系统 SHALL:**
- 格式化快捷键显示为键盘按键样式（kbd 标签）
- 在 macOS 上使用符号连接格式
- 在 Windows/Linux 上使用加号分隔格式
- 支持对话框通过快捷键（如 `CMD+W`）关闭

#### Scenario: 打开快捷键对话框
- **WHEN** 用户按下 `mod+/` 快捷键
  - **OR** 用户从菜单选择"键盘快捷键"选项
    - **THEN** 系统打开快捷键对话框
    - **THEN** 按分类显示所有快捷键
    - **THEN** 显示操作标签和对应的快捷键组合

#### Scenario: 阅读快捷键列表
- **WHEN** 用户浏览快捷键对话框
  - **THEN** 对话框按分类组织内容
  - **THEN** 每个分类显示分类标题
  - **THEN** 每个操作占一行，左侧显示标签，右侧显示快捷键
  - **THEN** 快捷键使用键盘按键样式显示

> 来源: `apps/electron/src/renderer/components/KeyboardShortcutsDialog.tsx`, `apps/electron/src/renderer/actions/definitions.ts`

---

### 3.2 Requirement: 快捷键设置页面

**Requirement: 快捷键设置页面**

系统 SHALL 提供快捷键设置页面，作为查看快捷键参考的主要入口。

**子系统 SHALL:**
- 显示与对话框相同的快捷键内容
- 使用页面导航结构而非模态对话框
- 支持页面内滚动浏览所有快捷键

**系统 SHALL:**
- 提供搜索功能筛选快捷键（可选）
- 保持与快捷键对话框同步的内容更新

#### Scenario: 通过设置页面查看快捷键
- **WHEN** 用户导航到设置页面的"快捷键"选项
  - **THEN** 系统显示快捷键列表页面
  - **THEN** 用户可以滚动浏览所有快捷键
  - **THEN** 快捷键显示格式与对话框一致

> 来源: `apps/electron/src/renderer/pages/ShortcutsPage.tsx`, `apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx`

---

### 3.3 Requirement: 组件特定快捷键

**Requirement: 组件特定快捷键**

系统 SHALL 在快捷键参考中显示组件级别的快捷键，这些快捷键不是全局操作。

**子系统 SHALL:**
- 在快捷键对话框和设置页面中显示组件特定快捷键
- 分类显示：List Navigation（列表导航）、Session List（会话列表）、Agent Tree（代理树）、Chat Input（聊天输入）

**系统 SHALL:**
- 支持这些快捷键的国际化显示
- 使用与全局操作一致的显示格式

#### Scenario: 会话列表快捷键
- **WHEN** 用户查看会话列表分类的快捷键
  - **THEN** 系统显示以下快捷键：
    - `Enter`: 聚焦聊天输入
    - `Right-click`: 打开上下文菜单
    - （可选：`Delete`: 删除会话，`R`: 重命名会话）

> 来源: `apps/electron/src/renderer/components/KeyboardShortcutsDialog.tsx`, `apps/electron/src/renderer/pages/ShortcutsPage.tsx`

---

### 4.1 Requirement: 通用操作

**Requirement: 通用操作**

系统 SHALL 定义以下通用操作：

| 操作ID | 标签 | 快捷键 | 描述 |
|--------|------|--------|------|
| `app.newChat` | New Chat | `mod+n` | Create a new chat session |
| `app.settings` | Settings | `mod+,` | Open application settings |
| `app.toggleTheme` | Toggle Theme | `mod+shift+a` | Switch between light and dark mode |
| `app.search` | Search | `mod+f` | Open search panel |
| `app.keyboardShortcuts` | Keyboard Shortcuts | `mod+/` | Show keyboard shortcuts reference |
| `app.newWindow` | New Window | `mod+shift+n` | Open a new window |
| `app.quit` | Quit | `mod+q` | Quit the application |

**系统 SHALL:**
- 为每个操作提供可翻译的标签和描述
- 设置默认快捷键
- 分配到 `General` 分类

> 来源: `apps/electron/src/renderer/actions/definitions.ts`

---

### 4.2 Requirement: 导航操作

**Requirement: 导航操作**

系统 SHALL 定义以下导航操作：

| 操作ID | 标签 | 快捷键 | 描述 |
|--------|------|--------|------|
| `nav.focusSidebar` | Focus Sidebar | `mod+1` | 聚焦侧边栏 |
| `nav.focusSessionList` | Focus Session List | `mod+2` | 聚焦会话列表 |
| `nav.focusChat` | Focus Chat | `mod+3` | 聚焦聊天区域 |
| `nav.nextZone` | Focus Next Zone | `Tab` | 聚焦下一区域 |
| `nav.goBack` | Go Back | `mod+[` | Navigate to previous session |
| `nav.goForward` | Go Forward | `mod+]` | Navigate to next session |
| `nav.goBackAlt` | Go Back | `mod+left` | Navigate to previous session (arrow key) |
| `nav.goForwardAlt` | Go Forward | `mod+right` | Navigate to next session (arrow key) |

**系统 SHALL:**
- 分配所有导航操作到 `Navigation` 分类
- 支持多种导航方式（括号键、方向键）

> 来源: `apps/electron/src/renderer/actions/definitions.ts`

---

### 4.3 Requirement: 视图操作

**Requirement: 视图操作**

系统 SHALL 定义以下视图操作：

| 操作ID | 标签 | 快捷键 | 描述 |
|--------|------|--------|------|
| `view.toggleSidebar` | Toggle Sidebar | `mod+b` | 切换侧边栏显示/隐藏 |
| `view.toggleFocusMode` | Toggle Focus Mode | `mod+.` | 隐藏两个侧边栏以进行无干扰工作 |

**系统 SHALL:**
- 分配所有视图操作到 `View` 分类
- `toggleFocusMode` 提供描述说明功能

> 来源: `apps/electron/src/renderer/actions/definitions.ts`

---

### 4.4 Requirement: 会话列表操作

**Requirement: 会话列表操作**

系统 SHALL 定义以下会话列表操作：

| 操作ID | 标签 | 快捷键 | 作用域 | inputSafe |
|--------|------|--------|--------|-----------|
| `sessionList.selectAll` | Select All Sessions | `mod+a` | `session-list` | false |
| `sessionList.clearSelection` | Clear Selection | `Escape` | `session-list` | true |

**系统 SHALL:**
- 分配所有会话列表操作到 `Session List` 分类
- 设置 `session-list` 作用域
- `clearSelection` 标记为 `inputSafe`

> 来源: `apps/electron/src/renderer/actions/definitions.ts`, `apps/electron/src/renderer/actions/types.ts`

---

### 4.5 Requirement: 聊天操作

**Requirement: 聊天操作**

系统 SHALL 定义以下聊天操作：

| 操作ID | 标签 | 快捷键 | 作用域 | inputSafe |
|--------|------|--------|--------|-----------|
| `chat.stopProcessing` | Stop Processing | `Escape` | `chat` | true |
| `chat.cyclePermissionMode` | Cycle Permission Mode | `shift+tab` | `chat` | false |
| `chat.nextSearchMatch` | Next Search Match | `mod+g` | `chat` | true |
| `chat.prevSearchMatch` | Previous Search Match | `mod+shift+g` | `chat` | true |

**系统 SHALL:**
- 分配所有聊天操作到 `Chat` 分类
- 设置 `chat` 作用域
- `stopProcessing`、`nextSearchMatch`、`prevSearchMatch` 标记为 `inputSafe`
- `stopProcessing` 提供描述说明需要双按触发

> 来源: `apps/electron/src/renderer/actions/definitions.ts`, `apps/electron/src/renderer/actions/types.ts`

---

### 5.1 Requirement: TypeScript 类型安全

**Requirement: TypeScript 类型安全**

系统 SHALL 使用 TypeScript 提供完整的类型安全。

**子系统 SHALL:**
- 定义 `ActionDefinition` 接口包含所有操作属性
- 定义 `ActionScope` 类型作为作用域联合类型
- 定义 `ActionHandler` 接口包含处理器和启用条件
- 从操作定义衍生类型安全的 `ActionId` 类型

**系统 SHALL:**
- 确保所有快捷键字符串都符合预期格式
- 防止拼写错误的操作ID

> 来源: `apps/electron/src/renderer/actions/types.ts`, `apps/electron/src/renderer/actions/definitions.ts`

---

### 5.2 Requirement: React Hook 集成

**Requirement: React Hook 集成**

系统 SHALL 提供 React Hook 以简化组件中的快捷键管理。

**子系统 SHALL:**
- 提供 `useAction` hook 用于注册操作处理器
- 提供 `useActionRegistry` hook 用于访问注册表
- 提供 `useHotkeyLabel` hook 获取快捷键显示字符串
- 提供 `useActionLabel` hook 获取操作完整信息

**系统 SHALL:**
- 支持依赖数组参数以响应状态变化
- 确保处理器引用在组件重新渲染时保持最新

> 来源: `apps/electron/src/renderer/actions/useAction.ts`, `apps/electron/src/renderer/actions/useHotkeyLabel.ts`, `apps/electron/src/renderer/actions/registry.tsx`

---

### 5.3 Requirement: 事件捕获性能

**Requirement: 事件捕获性能**

系统 SHALL 优化键盘事件处理的性能。

**系统 SHALL:**
- 使用高效的快捷键匹配算法
- 优先检查 `inputSafe` 和焦点元素以快速跳过不相关事件
- 避免在键盘事件处理中执行耗时操作

> 来源: `apps/electron/src/renderer/actions/registry.tsx`

---

### 6.1 Requirement: 响应性

**Requirement: 响应性**

系统 SHALL 确保快捷键响应时间小于 50ms。

#### Scenario: 快捷键响应
- **WHEN** 用户按下已注册快捷键
  - **THEN** 系统在 50ms 内触发对应操作

> 来源: `apps/electron/src/renderer/actions/registry.tsx`

---

### 6.2 Requirement: 可靠性

**Requirement: 可靠性**

系统 SHALL 确保快捷键处理的可靠性。

**系统 SHALL:**
- 正确处理操作处理器卸载
- 清理不再需要的键盘事件监听器
- 避免内存泄漏

#### Scenario: 组件卸载
- **WHEN** 注册快捷键的组件被卸载
  - **THEN** 系统自动清理对应的处理器
  - **THEN** 移除键盘事件监听器

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/src/renderer/actions/useAction.ts`

---

### 6.3 Requirement: 可维护性

**Requirement: 可维护性**

系统 SHALL 提供易于维护的操作定义结构。

**系统 SHALL:**
- 在 `actions/definitions.ts` 中集中定义所有操作
- 提供按分类分组操作的工具函数
- 提供获取操作列表和分类映射的工具函数

#### Scenario: 添加新操作
- **WHEN** 开发者需要添加新操作
  - **THEN** 在 `actions/definitions.ts` 中添加操作定义
  - **THEN** 使用 `useAction` hook 注册处理器
  - **THEN** 无需修改其他快捷键处理代码

> 来源: `apps/electron/src/renderer/actions/definitions.ts`, `apps/electron/src/renderer/actions/useAction.ts`

---

### 7.1 Requirement: 快捷键冲突

**Requirement: 快捷键冲突**

系统 SHALL 处理多个操作使用相同快捷键的情况。

**系统 SHALL:**
- 按定义顺序或注册顺序执行操作
- 找到第一个启用的处理器后停止
- 允许同一快捷键在不同作用域中有不同行为（通过 `enabled` 条件）

> 来源: `apps/electron/src/renderer/actions/registry.tsx`, `apps/electron/src/renderer/actions/useAction.ts`

---

### 7.2 Requirement: 浏览器快捷键冲突

**Requirement: 浏览器快捷键冲突**

系统 SHALL 谨慎处理与浏览器原生快捷键的冲突。

**系统 SHALL:**
- 优先保留关键浏览器快捷键（如 `mod+C`、`mod+V`）
- 在必要时阻止浏览器默认行为
- 在输入控件中优先保留文本编辑快捷键

> 来源: `apps/electron/src/renderer/actions/registry.tsx`

---

### 8.1 Requirement: 快捷键功能测试

**Requirement: 快捷键功能测试**

系统 SHALL 通过自动化测试验证快捷键功能。

**测试 SHALL 包括:**
- 快捷键注册和注销
- 跨平台快捷键映射
- 输入安全模式
- 启用条件检查
- 用户快捷键覆盖

> 来源: `apps/electron/src/renderer/actions/`, 测试目录 (待实现)

---

### 8.2 Requirement: 键盘事件模拟测试

**Requirement: 键盘事件模拟测试**

系统 SHALL 支持通过模拟键盘事件进行自动化测试。

**测试 SHALL 包括:**
- 模拟按键组合（修饰键 + 主键）
- 验证事件是否被正确拦截
- 验证处理器是否被正确调用

> 来源: `apps/electron/src/renderer/actions/`, 测试目录 (待实现)

---

### 9.1 Requirement: 注册错误处理

**Requirement: 注册错误处理**

系统 SHALL 提供清晰的错误信息以帮助调试注册问题。

**系统 SHALL:**
- 在注册空操作ID或空处理器时抛出错误
- 在使用未注册的操作ID时提供类型检查错误

> 来源: `apps/electron/src/renderer/actions/useAction.ts`, `apps/electron/src/renderer/actions/registry.tsx`

---

### 10.1 Requirement: 自定义快捷键编辑器

**Requirement: 自定义快捷键编辑器**

系统 SHALL 为用户快捷键覆盖功能提供 UI 编辑器（待实现）。

**子系统 SHALL:**
- 提供快捷键录制界面
- 显示快捷键冲突提示
- 支持快捷键重置到默认值

> 来源: 架构预留，待实现 UI 组件

---

## MODIFIED Requirements

（暂无修改的需求）

---

## REMOVED Requirements

（暂无移除的需求）
