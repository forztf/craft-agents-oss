# 国际化 (i18n) 自动化改造任务清单

## 1. 静态代码分析优化
- [ ] 优化 `tests/e2e/i18n/static-analyzer.ts`，增加 `IGNORE_PATTERNS` 白名单。
- [ ] 配置 `TRANSLATE_PATTERNS` 以准确识别 `JSXText` 和 `StringLiteral`。
- [ ] 实现生成详细的 JSON 报告，包含文件路径、行号和列号。

## 2. 动态 E2E 测试环境搭建
- [ ] 确保 Playwright 可以在 `NODE_ENV=test` 下启动 Electron 应用。
- [ ] 实现测试启动时的语言配置注入（强制使用 `zh-CN`）。
- [ ] 引入 `shared/routes.ts` 和 `settings-registry.ts` 到测试代码中。

## 3. 自动化巡检 (Crawler) 实现
- [ ] 在 `tests/e2e/i18n/i18n-e2e.spec.ts` 中实现 `navigateAndCheck` 辅助函数。
- [ ] 实现针对 `SETTINGS_PAGES` 的循环遍历测试。
- [ ] 实现针对 `routes.view.sources` 和 `routes.view.skills` 的页面测试。
- [ ] 实现针对主要 UI 区域（Chat, Sidebar, Modals）的自动化导航。

## 4. 智能检测算法实现
- [ ] 实现 `isLikelyHardcodedText` 函数：
    -   检测包含连续英文单词的字符串。
    -   排除常见的专有名词（AI, Claude, GPT 等）。
    -   排除纯数字、符号、URL。
- [ ] 实现 `isMissingTranslationKey` 函数：
    -   检测形如 `namespace.key` 的字符串。
- [ ] 实现 DOM 遍历逻辑：
    -   扫描所有可见文本节点。
    -   检查 `placeholder`, `title`, `aria-label`, `alt` 属性。

## 5. 报告生成与验证
- [ ] 完善 `I18nTestReporter` 类，支持 JSON 和控制台输出。
- [ ] 集成 `npm run test:i18n:full` 命令到 `package.json`。
- [ ] 验证测试能否发现已知漏洞，并生成正确的报告。
