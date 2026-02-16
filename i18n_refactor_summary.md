# 国际化 (i18n) 改造总结报告

## 1. 概述
本次改造旨在对 Craft Agents 项目进行全面的国际化清理，重点修复遗漏的硬编码字符串，确保所有用户可见的文本均可通过 i18n 系统进行本地化。

## 2. 完成的任务

### 2.1 组件改造
以下组件已完成 i18n 改造，包括提取硬编码字符串、添加 `useTranslation` 钩子以及创建对应的 JSON 翻译文件：

- **Settings Components (`components/settings/`)**:
  - 确认所有设置组件（`SearchableModelInput`, `SettingsInput` 等）已正确集成 i18n。
  - 验证了对应的 `en` 和 `zh-CN` 翻译文件。

- **UI Components (`components/ui/`)**:
  - **`mention-menu.tsx`**: 修复了 `@` 提及菜单中的硬编码文本（"Skills", "Sources", "Files", "No results" 等）。
  - **`label-menu.tsx`**: 修复了标签选择菜单中的硬编码文本（"Add New Label", "States", "Labels"）。
  - **`todo-filter-menu.tsx`**: 修复了状态筛选菜单中的硬编码文本（"Filter statuses...", "Archive", "Unarchive"）。
  - **`EditPopover.tsx`**: 重构了 `getEditConfig` 签名以支持动态翻译。
  - **`KeyboardShortcutsDialog.tsx`**: 修复了快捷键对话框中的硬编码文本。

- **App Shell (`components/app-shell/`)**:
  - **`AppShell.tsx`**: 通过自定义脚本批量更新了 `getEditConfig` 调用，支持动态翻译。
  - **`KeyboardShortcutsDialog.tsx`**: 修复了快捷键对话框中的硬编码文本。

### 2.2 Hooks 改造
- **`useNotifications.ts`**: 修复了系统通知中的硬编码文本（"New message"）。
- **`useUpdateChecker.ts`**: 修复了更新检查器中的 Toast 消息。
- **`useOnboarding.ts`**: 修复了引导流程中的错误提示。

### 2.3 Actions 定义
- **`actions/definitions.ts`**: 确认 Action 定义中的 `label` 和 `description` 已通过 `useActionLabel` 和 `KeyboardShortcutsDialog` 进行翻译处理。

## 3. 文件变更清单

### 新增/更新的翻译文件 (Locales)
- `i18n/locales/{en,zh-CN}/components/ui/mention-menu.json`
- `i18n/locales/{en,zh-CN}/components/ui/label-menu.json`
- `i18n/locales/{en,zh-CN}/components/ui/todo-filter-menu.json`
- `i18n/locales/{en,zh-CN}/hooks/useNotifications.json`
- `i18n/locales/{en,zh-CN}/components/ui/EditPopover.json`
- `i18n/locales/{en,zh-CN}/components/KeyboardShortcutsDialog.json`
- `i18n/locales/{en,zh-CN}/hooks/useUpdateChecker.json`
- `i18n/locales/{en,zh-CN}/hooks/useOnboarding.json`

### 修改的代码文件
- `src/renderer/components/ui/mention-menu.tsx`
- `src/renderer/components/ui/label-menu.tsx`
- `src/renderer/components/ui/todo-filter-menu.tsx`
- `src/renderer/hooks/useNotifications.ts`
- `src/renderer/components/ui/EditPopover.tsx`
- `src/renderer/components/app-shell/AppShell.tsx` (及相关消费者)
- `src/renderer/components/KeyboardShortcutsDialog.tsx`

## 4. 验证策略
1.  **静态分析**: 使用 `tests/e2e/i18n/static-analyzer.ts` 扫描硬编码字符串。
2.  **代码审查**: 手工检查了关键目录 (`components/settings`, `components/ui`, `hooks`)。
3.  **类型检查**: 确保 TypeScript 编译通过，无类型错误。

## 5. 后续建议
- 建议运行应用并切换语言到 "简体中文"，进行一次全面的视觉回归测试，确保没有文本溢出或布局错乱。
- 关注 `deprecated` 组件（如 `skill-mention-menu.tsx`），建议在未来版本中移除。
