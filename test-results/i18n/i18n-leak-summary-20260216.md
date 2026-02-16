# i18n 漏翻译补漏总结

- 基线报告: test-results/i18n/hard-zh-20260216-195507.json
- 当前扫描: test-results/i18n/scan-current.json
- 子任务清单: test-results/i18n/i18n-subtasks.csv
- 页面漏译地图: test-results/i18n/page-zh-map.json

## 总览

- 总页面/部件数: 2
- 初始硬编码中文数: 4
- 修复数: 4
- 当前漏译数: 0
- 误报数: 0
- 脚本耗时: 0s

## 固化建议

- MR 门禁执行: bun run test:i18n:full
- 每周定期执行: npm run i18n:audit + bun run test:i18n:zh-leak
- 规则沉淀: scripts/i18n/rules.json 统一维护白名单与阈值

