# 国际化 (i18n) 自动化验收清单

## 1. 环境准备
- [ ] 确保 `playwright` 已正确安装并配置。
- [ ] 确保 `NODE_ENV=test` 时应用能正常启动且加载 Mock 数据。
- [ ] 确保测试环境能加载 `zh-CN` 语言配置。

## 2. 静态分析
- [ ] `npm run test:i18n` 脚本能正确扫描所有 `.tsx` 和 `.ts` 文件。
- [ ] 静态分析能发现明显的硬编码字符串。
- [ ] 静态分析报告不包含大量的误报（如代码变量名）。

## 3. 动态 E2E 测试
- [ ] `npm run test:i18n:full` 能自动启动 Electron 应用。
- [ ] 测试能自动跳转到聊天主页、侧边栏、插件列表。
- [ ] 测试能自动遍历所有设置子页面 (App, AI, Appearance 等)。
- [ ] 测试能在 `zh-CN` 环境下检测出未翻译的英文句子。
- [ ] 测试能检测出丢失的 Key (如 `pages.home.title`)。
- [ ] 测试能检测出 HTML 属性 (`placeholder`, `title`, `aria-label`) 中的硬编码。

## 4. 报告与反馈
- [ ] 测试完成后生成 `test-results/i18n-report.json`。
- [ ] 控制台输出包含失败用例的摘要。
- [ ] 报告中包含文件路径、行号或 UI 选择器，方便定位。
