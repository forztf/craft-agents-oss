/**
 * i18n 测试环境安装脚本
 *
 * 运行: bun run tests/e2e/setup-i18n-tests.ts
 */

import { $ } from 'bun'

console.log('🚀 安装 i18n 测试环境...')

// 安装 Playwright
console.log('\n📦 安装 @playwright/test...')
await $`bun add -d @playwright/test`

// 安装 Electron Playwright 支持
console.log('\n📦 安装 playwright-electron 支持...')

// 创建测试结果目录
console.log('\n📁 创建测试结果目录...')
await $`mkdir -p test-results/html`

console.log('\n✅ 测试环境安装完成!')
console.log('\n运行测试:')
console.log('  npx playwright test --project=electron')
console.log('\n生成报告:')
console.log('  npx playwright show-report test-results/html')
