# i18n 全量页面改造计划 (Phase 1: Pages)

针对 `apps/electron/src/renderer/pages` 目录下的所有页面及其子目录进行国际化改造。此阶段涉及 15 个文件。

## 改造原则
1.  **Hooks**: 在每个页面组件中引入 `useTranslation`。
2.  **Namespace**: 使用对应的路径作为 namespace（例如 `pages/settings/AppearanceSettingsPage`）。
3.  **替换**: 将 JSX 中的硬编码文本替换为 `t('Raw String')`。
4.  **Key**: 优先使用英文原文作为 Key，与生成的 JSON 文件保持一致。

## 待改造文件清单 & Namespace

### 核心页面 (Core Pages)
1.  **[apps/electron/src/renderer/pages/ChatPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/ChatPage.tsx)**
    -   Namespace: `pages/ChatPage`
2.  **[apps/electron/src/renderer/pages/PreferencesPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/PreferencesPage.tsx)**
    -   Namespace: `pages/PreferencesPage`
3.  **[apps/electron/src/renderer/pages/ShortcutsPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/ShortcutsPage.tsx)**
    -   Namespace: `pages/ShortcutsPage`
4.  **[apps/electron/src/renderer/pages/SkillInfoPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/SkillInfoPage.tsx)**
    -   Namespace: `pages/SkillInfoPage`
5.  **[apps/electron/src/renderer/pages/SourceInfoPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/SourceInfoPage.tsx)**
    -   Namespace: `pages/SourceInfoPage`

### 设置页面 (Settings Pages)
6.  **[apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/settings/AiSettingsPage.tsx)**
    -   Namespace: `pages/settings/AiSettingsPage`
7.  **[apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx)**
    -   Namespace: `pages/settings/AppSettingsPage`
8.  **[apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/settings/AppearanceSettingsPage.tsx)**
    -   Namespace: `pages/settings/AppearanceSettingsPage`
9.  **[apps/electron/src/renderer/pages/settings/InputSettingsPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/settings/InputSettingsPage.tsx)**
    -   Namespace: `pages/settings/InputSettingsPage`
10. **[apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/settings/LabelsSettingsPage.tsx)**
    -   Namespace: `pages/settings/LabelsSettingsPage`
11. **[apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/settings/PermissionsSettingsPage.tsx)**
    -   Namespace: `pages/settings/PermissionsSettingsPage`
12. **[apps/electron/src/renderer/pages/settings/PreferencesPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/settings/PreferencesPage.tsx)**
    -   Namespace: `pages/settings/PreferencesPage`
    -   *注：此前已进行 Language 下拉框改造，需继续替换剩余硬编码*
13. **[apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/settings/SettingsNavigator.tsx)**
    -   Namespace: `pages/settings/SettingsNavigator`
14. **[apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/settings/ShortcutsPage.tsx)**
    -   Namespace: `pages/settings/ShortcutsPage`
15. **[apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx](file:///c:/code/AI/craft-agents-i18n/apps/electron/src/renderer/pages/settings/WorkspaceSettingsPage.tsx)**
    -   Namespace: `pages/settings/WorkspaceSettingsPage`

## 验证计划
-   完成全部修改后，执行 `bun run electron:build:renderer` 验证构建。
-   手动抽查 `Settings` 页面下的各个子页面，确保中文切换正常。
-   注意检查 `PreferencesPage` 的两个版本是否都正确应用了翻译。
