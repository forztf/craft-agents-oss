#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取测试报告
const reportPath = path.join(__dirname, '../i18n-test-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// 汇总错误类型
const errorTypes = {
  falsePositives: [], // 假阳性（被误判为错误的代码）
  realMissing: [],    // 真正缺失的翻译
  hardcodedUi: [],    // 需要国际化的硬编码UI文本
  irrelevantKeys: [], // 无关的键（如JS关键字）
};

// 处理缺失的键
report.missingKeysOverall.forEach(item => {
  const { key, file, line, usedNamespace } = item;

  // 过滤掉明显的误判
  if (
    key === '/' ||
    key === '+' ||
    key === '-' ||
    key === ',' ||
    key === ':' ||
    key === '.' ||
    key === 'sessionId' ||
    key === 'focused' ||
    key.startsWith('./') ||
    key.startsWith('../') ||
    key.includes('import') ||
    key.includes('craft:') ||
    key === 'mark'
  ) {
    errorTypes.falsePositives.push({
      key,
      file,
      line,
      reason: 'Not a translation key',
    });
  } else if (file.endsWith('.ts') && !file.endsWith('.tsx')) {
    // TypeScript 类型定义文件中的 t() 调用可能是误判
    errorTypes.falsePositives.push({
      key,
      file,
      line,
      reason: 'Type definition file',
    });
  } else {
    errorTypes.realMissing.push(item);
  }
});

// 处理硬编码文本
report.hardcodedTextOverall.forEach(item => {
  const { text, file, line, type, context } = item;

  // 过滤掉不相关的文本
  if (
    text === 'Partial' ||
    text === 'Promise' ||
    text === 'Map' ||
    text === '(prev' ||
    text.startsWith('${') ||
    text.includes('=>') ||
    text.startsWith('/')
  ) {
    errorTypes.irrelevantKeys.push({
      text,
      file,
      line,
      reason: 'Type关键字或代码片段',
    });
  } else if (
    text === '502 Bad Gateway' ||
    text.includes('error:')
  ) {
    errorTypes.irrelevantKeys.push({
      text,
      file,
      line,
      reason: '错误信息文本',
    });
  } else {
    errorTypes.hardcodedUi.push({
      text,
      file,
      line,
      type: type || 'content',
      context,
    });
  }
});

// 生成汇总报告
const summary = {
  title: 'I18N 测试汇总报告',
  scanDate: new Date().toISOString(),
  stats: report.summary,
  analysis: {
    falsePositives: errorTypes.falsePositives.length,
    realMissing: errorTypes.realMissing.length,
    hardcodedUi: errorTypes.hardcodedUi.length,
    irrelevantKeys: errorTypes.irrelevantKeys.length,
  },
  details: {
    realMissing: errorTypes.realMissing.slice(0, 20), // 只显示前20个
    hardcodedUi: errorTypes.hardcodedUi.slice(0, 30),   // 只显示前30个
    hardcodedUiByFile: {},
  },
  unusedKeysSummary: {
    total: report.unusedKeysOverall.length,
    sample: report.unusedKeysOverall.slice(0, 15), // 只显示前15个
  },
};

// 按文件汇总硬编码UI文本
errorTypes.hardcodedUi.forEach(item => {
  if (!summary.details.hardcodedUiByFile[item.file]) {
    summary.details.hardcodedUiByFile[item.file] = [];
  }
  summary.details.hardcodedUiByFile[item.file].push({
    line: item.line,
    text: item.text,
    type: item.type,
  });
});

// 保存报告
const outputPath = path.join(__dirname, '../i18n-summary-report.json');
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf8');

// 打印终端友好的汇总
console.log('\n' + '═'.repeat(80));
console.log('📊 I18N 测试汇总报告');
console.log('═'.repeat(80));

console.log('\n📈 总体统计');
console.log('─'.repeat(80));
console.log(`扫描文件总数: ${report.summary.totalFiles}`);
console.log(`使用 t() 函数的文件: ${report.summary.filesWithTFunction}`);
console.log(`存在问题文件: ${report.summary.filesWithIssues}`);
console.log(`翻译调用总数: ${report.summary.totalTranslationKeys}`);
console.log(`硬编码文本数: ${report.summary.totalHardcodedText}`);

console.log('\n🔍 问题分析（去重后）');
console.log('─'.repeat(80));
console.log(`✓ 假阳性（误判）: ${errorTypes.falsePositives}`);
console.log(`✗ 真正缺失的翻译: ${errorTypes.realMissing}`);
console.log(`📝 需要国际化的UI文本: ${errorTypes.hardcodedUi}`);
console.log(`□ 无关的技术文档/注释: ${errorTypes.irrelevantKeys}`);

console.log('\n⚠️  问题分布');
console.log('─'.repeat(80));
console.log(`原始报告统计:`);
console.log(`  - 缺失的键: ${report.summary.issues.missing}`);
console.log(`  - 未使用的键: ${report.summary.issues.unused}`);
console.log(`  - 命名空间不匹配: ${report.summary.issues.mismatch}`);
console.log(`  - 硬编码文本: ${report.summary.issues.hardcoded}`);

console.log('\n📄 需要国际化的硬编码文本（按文件）');
console.log('─'.repeat(80));
Object.entries(summary.details.hardcodedUiByFile).forEach(([file, items]) => {
  console.log(`\n${file} (${items.length} 项):`);
  items.slice(0, 5).forEach(item => {
    console.log(`  Line ${item.line}: "${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}"` +
               `${item.type ? ` [${item.type}]` : ''}`);
  });
  if (items.length > 5) {
    console.log(`  ... 还有 ${items.length - 5} 项`);
  }
});

console.log('\n🔑 真正缺失的翻译键');
console.log('─'.repeat(80));
if (errorTypes.realMissing.length === 0) {
  console.log('✅ 没有真正的缺失翻译！');
} else {
  errorTypes.realMissing.slice(0, 10).forEach(item => {
    console.log(`  ${item.file}:${item.line}`);
    console.log(`    缺失: "${item.key}"`);
    console.log(`    命名空间: ${item.usedNamespace || '无'}`);
  });
  if (errorTypes.realMissing.length > 10) {
    console.log(`  ... 还有 ${errorTypes.realMissing.length - 10} 项缺失翻译`);
  }
}

console.log('\n🗑️  未使用的翻译键（示例）');
console.log('─'.repeat(80));
if (report.unusedKeysOverall.length === 0) {
  console.log('✅ 所有翻译键都在使用中！');
} else {
  console.log(`⚠️  共 ${report.unusedKeysOverall.length} 个未使用的键`);
  console.log('前 15 个示例:');
  report.unusedKeysOverall.slice(0, 15).forEach(item => {
    console.log(`  ${item.namespace}:${item.key} = "${item.value}"`);
  });
  console.log(`  ... 还有 ${report.unusedKeysOverall.length - 15} 个未使用的键`);
}

console.log('\n' + '═'.repeat(80));
console.log(`✨ 汇总报告已保存到: ${outputPath}`);
console.log('═'.repeat(80));

// 评估整体质量
const qualityScore = {
  excellent: errorTypes.realMissing.length === 0 && errorTypes.hardcodedUi.length < 10,
  good: errorTypes.realMissing.length < 5 && errorTypes.hardcodedUi.length < 30,
  fair: errorTypes.realMissing.length < 20 && errorTypes.hardcodedUi.length < 50,
  poor: errorTypes.realMissing.length >= 20 || errorTypes.hardcodedUi.length >= 50,
};

console.log('\n🎯 国际化质量评估');
console.log('─'.repeat(80));

const quality = qualityScore.excellent ? '优秀' :
                qualityScore.good ? '良好' :
                qualityScore.fair ? '一般' : '需要改进';

console.log(`评级: ${quality}`);

if (quality === '优秀') {
  console.log('💡 建议: 国际化实现非常完善，继续保持！');
} else if (quality === '良好') {
  console.log('💡 建议: 少量硬编码文本需要国际化，整体效果很好。');
} else if (quality === '一般') {
  console.log('💡 建议: 部分UI文本尚未国际化，建议逐步改进。');
} else {
  console.log('💡 建议: 需要加强国际化工作，优先处理缺失的翻译键。');
}

console.log('\n' + '═'.repeat(80) + '\n');