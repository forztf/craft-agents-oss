#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ===== 配置 =====
const CONFIG = {
  tsxDir: path.join(__dirname, '../apps/electron/src/renderer'),
  localesDir: path.join(__dirname, '../i18n/locales'),
  outputReport: path.join(__dirname, '../i18n-test-report.json'),
  outputFileSummary: path.join(__dirname, '../i18n-hardcoded-text-report.json'),
};

// ===== 工具函数 =====

/**
 * 递归获取目录下所有指定扩展名的文件
 */
function getFiles(dir, extensions = ['.tsx', '.ts'], files = []) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const res = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // 排除 node_modules 和 .next 等目录
        if (
          entry.name !== 'node_modules' &&
          entry.name !== '.next' &&
          entry.name !== 'dist' &&
          entry.name !== 'build'
        ) {
          getFiles(res, extensions, files);
        }
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(res);
      }
    }
  } catch (e) {
    console.warn(`Warning: Cannot read directory ${dir}:`, e.message);
  }

  return files;
}

/**
 * 提取文件中的所有 t() 调用
 */
function extractTranslationKeys(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(CONFIG.tsxDir, filePath);

    // 模式1: t('key') 或 t("key")
    const singleQuotePattern = /t\(['"]([^'"]+)['"]\)/g;
    const singleQuoteMatches = [...content.matchAll(singleQuotePattern)].map(m => ({
      key: m[1],
      type: 'single-quote',
      line: getLineNumber(content, m.index),
    }));

    // 模式2: namespace 和 t('key')
    const namespacePattern = /useTranslation\(['"]([^'"]+)['"]\)/;
    const namespaceMatch = content.match(namespacePattern);
    const namespace = namespaceMatch ? namespaceMatch[1] : null;

    return {
      file: relativePath,
      namespace,
      keys: singleQuoteMatches,
      hasTFunction: singleQuoteMatches.length > 0,
      hardcodedText: detectHardcodedText(content),
    };
  } catch (e) {
    console.warn(`Warning: Cannot read file ${filePath}:`, e.message);
    return {
      file: path.relative(CONFIG.tsxDir, filePath),
      namespace: null,
      keys: [],
      hasTFunction: false,
      hardcodedText: [],
      error: e.message,
    };
  }
}

/**
 * 获取指定位置所在的行号
 */
function getLineNumber(content, index) {
  const lines = content.substring(0, index).split('\n');
  return lines.length;
}

/**
 * 检测硬编码的文本（可能是用户可见的文本）
 */
function detectHardcodedText(content) {
  const hardcodedTexts = [];

  // JSX 标签内的文本内容模式
  const patterns = [
    // 匹配 <Tag>Text</Tag>
    /<\w+[^>]*>([\s\S]*?)<\/\w+>/g,
    // 匹配 className="..." 中的可能文本（较少情况）
    // 匹配 aria-label 或 title 属性中的文本
    /(?:aria-label|title|placeholder|label)=["']([^"']+)["']/g,
  ];

  const lines = content.split('\n');

  lines.forEach((line, lineNum) => {
    // 跳过注释行
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return;
    }

    // 检查是否包含 t() 函数调用
    if (line.includes("t('") || line.includes('t("')) {
      return;
    }

    // 检查 TypeScript/JSX 注释
    if (line.trim().startsWith('{/*') || line.trim().endsWith('*/}') || line.trim().includes('//')) {
      return;
    }

    // 检测用户可见的文本
    // 模式1: <Tag>Text</Tag> 格式
    const jsxTextPattern = />([\p{L}\p{N}\s\-.,!?;:'"()（）【】—…]+)</gu;
    const jsxTextMatches = line.matchAll(jsxTextPattern);

    for (const match of jsxTextMatches) {
      const text = match[1]?.trim();
      // 过滤掉太短的文本和数字
      if (
        text &&
        text.length > 2 &&
        !/^[0-9\s\-.,!?;:'"()（）【】—…]+$/.test(text) &&
        !text.startsWith('{') &&
        !text.includes('className')
      ) {
        hardcodedTexts.push({
          text,
          line: lineNum + 1,
          context: line.trim().substring(0, 80),
        });
      }
    }

    // 模式2: 属性中的文本
    const attrPattern = /(aria-label|title|placeholder|label)=["']([^"']+)["']/g;
    const attrMatches = line.matchAll(attrPattern);

    for (const match of attrMatches) {
      const attrName = match[1];
      const value = match[2];
      if (value && value.length > 2 && !value.startsWith('{')) {
        hardcodedTexts.push({
          text: value,
          line: lineNum + 1,
          type: attrName,
          context: line.trim().substring(0, 80),
        });
      }
    }
  });

  return hardcodedTexts;
}

/**
 * 递归获取 JSON 文件中的所有键
 */
function getJsonKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getJsonKeys(value, fullKey));
    } else {
      keys.push({
        key: fullKey,
        value: value,
      });
    }
  }

  return keys;
}

/**
 * 递归加载所有 JSON 文件
 */
function loadLocaleFiles(dir, files = {}, currentPath = '') {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const res = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const relativePath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
        loadLocaleFiles(res, files, relativePath);
      } else if (entry.name.endsWith('.json')) {
        const namespace = currentPath ? `${currentPath}/${entry.name.replace('.json', '')}` : entry.name.replace('.json', '');
        const content = JSON.parse(fs.readFileSync(res, 'utf8'));
        files[namespace] = {
          file: path.relative(CONFIG.localesDir, res),
          keys: getJsonKeys(content),
          raw: content,
        };
      }
    }
  } catch (e) {
    console.warn(`Warning: Cannot read directory ${dir}:`, e.message);
  }

  return files;
}

/**
 * 分析并生成报告
 */
function generateReport(tsxFiles, enLocaleFiles, zhLocaleFiles) {
  const report = {
    summary: {
      totalFiles: tsxFiles.length,
      filesWithTFunction: 0,
      filesWithIssues: 0,
      totalTranslationKeys: 0,
      totalHardcodedText: 0,
      issues: {
        missing: 0,
        unused: 0,
        mismatch: 0,
        hardcoded: 0,
      },
      localeFiles: {
        en: Object.keys(enLocaleFiles).length,
        zh: Object.keys(zhLocaleFiles).length,
      },
    },
    details: [],
    missingKeysOverall: [],
    unusedKeysOverall: [],
    namespaceMismatches: [],
    hardcodedTextOverall: [],
  };

  // 构建所有可用的翻译键集合（来自 EN）
  const allAvailableKeys = new Map();
  for (const [namespace, data] of Object.entries(enLocaleFiles)) {
    for (const { key, value } of data.keys) {
      allAvailableKeys.set(`${namespace}:${key}`, {
        namespace,
        key,
        value,
        file: data.file,
      });
    }
  }

  // 收集代码中实际使用的键
  const usedKeys = new Map();

  tsxFiles.forEach(fileData => {
    if (!fileData.hasTFunction) return;

    report.summary.filesWithTFunction++;

    const fileIssues = {
      file: fileData.file,
      namespace: fileData.namespace,
      issues: [],
      missingKeys: [],
      unusedKeys: null, // 会在后面计算
      hardcodedText: fileData.hardcodedText,
    };

    fileData.keys.forEach(({ key, type, line }) => {
      const fullKey = fileData.namespace ? `${fileData.namespace}:${key}` : key;
      usedKeys.set(fullKey, {
        file: fileData.file,
        line,
        namespace: fileData.namespace,
        key,
      });

      // 检查键是否在资源文件中存在
      const keyInfo = allAvailableKeys.get(fullKey);
      if (!keyInfo) {
        // 尝试不使用 namespace 的查找
        const keyWithoutNamespace = allAvailableKeys.get(key);

        if (keyWithoutNamespace) {
          fileIssues.issues.push({
            type: 'namespace_mismatch',
            severity: 'warning',
            message: `Key '${key}' used in code with namespace '${fileData.namespace}' but exists in namespace '${keyWithoutNamespace.namespace}'`,
            key,
            line,
            expectedNamespace: keyWithoutNamespace.namespace,
            actualNamespace: fileData.namespace,
          });
          report.summary.issues.mismatch++;
          report.namespaceMismatches.push({
            file: fileData.file,
            key,
            line,
            expectedNamespace: keyWithoutNamespace.namespace,
            actualNamespace: fileData.namespace,
          });
        } else {
          fileIssues.issues.push({
            type: 'missing',
            severity: 'error',
            message: `Translation key '${key}' not found in locale files`,
            key,
            line,
            usedNamespace: fileData.namespace,
          });
          report.summary.issues.missing++;
          report.missingKeysOverall.push({
            file: fileData.file,
            key,
            line,
            usedNamespace: fileData.namespace,
          });
        }
      }
    });

    // 硬编码文本
    if (fileData.hardcodedText.length > 0) {
      report.summary.issues.hardcoded += fileData.hardcodedText.length;
      report.summary.totalHardcodedText += fileData.hardcodedText.length;
      report.hardcodedTextOverall.push(
        ...fileData.hardcodedText.map(text => ({
          file: fileData.file,
          ...text,
        }))
      );
    }

    if (fileIssues.issues.length > 0 || fileData.hardcodedText.length > 0) {
      report.summary.filesWithIssues++;
      fileIssues.totalIssues = fileIssues.issues.length + fileData.hardcodedText.length;
      report.details.push(fileIssues);
    }

    report.summary.totalTranslationKeys += fileData.keys.length;
  });

  // 检查未使用的键
  for (const [fullKey, keyInfo] of allAvailableKeys.entries()) {
    if (!usedKeys.has(fullKey)) {
      report.summary.issues.unused++;
      report.unusedKeysOverall.push({
        namespace: keyInfo.namespace,
        key: keyInfo.key,
        value: keyInfo.value,
        file: keyInfo.file,
      });
    }
  }

  return report;
}

/**
 * 运行编译检查
 */
function checkBuild() {
  console.log('\n🔍 Running build check...');
  const buildReport = {
    status: 'success',
    errors: [],
    warnings: [],
  };

  try {
    // 尝试运行 tsc 检查类型
    execSync('npx tsc --noEmit', {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
    console.log('✅ TypeScript compilation check passed');
  } catch (e) {
    const errorOutput = e.stdout?.toString() || e.stderr?.toString() || e.message || '';
    console.log('❌ TypeScript compilation check failed');

    // 解析错误信息
    const errorLines = errorOutput.split('\n');
    buildReport.status = 'failed';

    errorLines.forEach(line => {
      if (line.includes('error TS')) {
        buildReport.errors.push(line.trim());
      } else if (line.includes('warning TS')) {
        buildReport.warnings.push(line.trim());
      }
    });
  }

  return buildReport;
}

/**
 * 生成硬编码文本报告
 */
function generateHardcodedTextReport(report) {
  const hardcodedReport = {
    summary: {
      totalFiles: report.summary.totalFiles,
      filesWithHardcodedText: report.hardcodedTextOverall.length > 0
        ? new Set(report.hardcodedTextOverall.map(item => item.file)).size
        : 0,
      totalHardcodedOccurrences: report.hardcodedTextOverall.length,
    },
    byFile: {},
  };

  // 按文件分组
  report.hardcodedTextOverall.forEach(item => {
    if (!hardcodedReport.byFile[item.file]) {
      hardcodedReport.byFile[item.file] = [];
    }
    hardcodedReport.byFile[item.file].push({
      text: item.text,
      line: item.line,
      type: item.type,
      context: item.context,
    });
  });

  return hardcodedReport;
}

/**
 * 打印报告摘要
 */
function printSummary(report) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 I18N TEST REPORT SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n📁 Files Scanned: ${report.summary.totalFiles}`);
  console.log(`✅ Files with t() function: ${report.summary.filesWithTFunction}`);
  console.log(`⚠️  Files with Issues: ${report.summary.filesWithIssues}`);
  console.log(`\n🔑 Translation Keys Found: ${report.summary.totalTranslationKeys}`);
  console.log(`📝 Hardcoded Text Found: ${report.summary.totalHardcodedText}`);

  console.log('\n' + '-'.repeat(80));
  console.log('Issues Found:');
  console.log(`  ❌ Missing Keys: ${report.summary.issues.missing}`);
  console.log(`  ⚠️  Unused Keys: ${report.summary.issues.unused}`);
  console.log(`  🔧 Namespace Mismatches: ${report.summary.issues.mismatch}`);
  console.log(`  📝 Hardcoded Text: ${report.summary.issues.hardcoded}`);

  console.log(`\n📚 Locale Files (EN): ${report.summary.localeFiles.en}`);
  console.log(`📚 Locale Files (ZH): ${report.summary.localeFiles.zh}`);

  if (report.details.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('Files with Issues (Top 10):');
    console.log('-'.repeat(80));

    report.details.slice(0, 10).forEach(detail => {
      console.log(`\n📄 ${detail.file}`);
      if (detail.namespace) {
        console.log(`   Namespace: ${detail.namespace}`);
      }
      console.log(`   Issues: ${detail.totalIssues}`);

      detail.issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : '⚠️';
        console.log(`   ${icon} Line ${issue.line}: ${issue.message}`);
      });

      if (detail.hardcodedText.length > 0) {
        console.log(`   📝 Hardcoded Text (${detail.hardcodedText.length} occurrences):`);
        detail.hardcodedText.slice(0, 3).forEach(ht => {
          console.log(`      Line ${ht.line}: "${ht.text.substring(0, 50)}${ht.text.length > 50 ? '...' : ''}"`);
        });
        if (detail.hardcodedText.length > 3) {
          console.log(`      ... and ${detail.hardcodedText.length - 3} more`);
        }
      }
    });

    if (report.details.length > 10) {
      console.log(`\n   ... and ${report.details.length - 10} more files with issues`);
    }
  }

  if (report.unusedKeysOverall.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('Unused Keys (Top 10):');
    console.log('-'.repeat(80));

    report.unusedKeysOverall.slice(0, 10).forEach(item => {
      console.log(`   ${item.namespace}:${item.key} = "${item.value}"`);
      console.log(`      File: ${item.file}`);
    });

    if (report.unusedKeysOverall.length > 10) {
      console.log(`   ... and ${report.unusedKeysOverall.length - 10} more unused keys`);
    }
  }

  console.log('\n' + '='.repeat(80));
}

// ===== 主函数 =====

async function main() {
  console.log('🚀 Starting I18N Test...\n');

  // 1. 扫描所有 TSX/TS 文件
  console.log('📂 Scanning TSX/TS files...');
  const tsxFiles = getFiles(CONFIG.tsxDir, ['.tsx', '.ts']);
  console.log(`   Found ${tsxFiles.length} files\n`);

  // 2. 提取翻译键
  console.log('🔍 Extracting translation keys...');
  const fileAnalysis = tsxFiles
    .map(extractTranslationKeys)
    .filter(f => f.hasTFunction || f.hardcodedText.length > 0);
  console.log(
    `   Found ${fileAnalysis.filter(f => f.hasTFunction).length} files with t() function`,
    `and ${fileAnalysis.filter(f => f.hardcodedText.length > 0).length} files with hardcoded text\n`
  );

  // 3. 加载资源文件
  console.log('📚 Loading locale files...');
  const enLocaleDir = path.join(CONFIG.localesDir, 'en');
  const zhLocaleDir = path.join(CONFIG.localesDir, 'zh-CN');

  const enLocaleFiles = loadLocaleFiles(enLocaleDir);
  const zhLocaleFiles = loadLocaleFiles(zhLocaleDir);

  console.log(`   EN locale files: ${Object.keys(enLocaleFiles).length}`);
  console.log(`   ZH locale files: ${Object.keys(zhLocaleFiles).length}\n`);

  // 4. 生成报告
  console.log('📊 Generating report...');
  const report = generateReport(fileAnalysis, enLocaleFiles, zhLocaleFiles);

  // 5. 检查编译
  console.log('🔨 Checking compilation...');
  const buildReport = checkBuild();

  // 6. 生成硬编码文本报告
  const hardcodedTextReport = generateHardcodedTextReport(report);

  // 7. 添加构建信息到报告
  report.build = buildReport;

  // 8. 保存报告
  console.log('💾 Saving reports...');
  fs.writeFileSync(CONFIG.outputReport, JSON.stringify(report, null, 2), 'utf8');
  console.log(`   Main report saved to: ${CONFIG.outputReport}`);

  fs.writeFileSync(CONFIG.outputFileSummary, JSON.stringify(hardcodedTextReport, null, 2), 'utf8');
  console.log(`   Hardcoded text report saved to: ${CONFIG.outputFileSummary}`);

  // 9. 打印摘要
  printSummary(report);

  console.log(`\n✨ Test completed! Full report saved to ${CONFIG.outputReport}\n`);

  // 返回退出码
  const hasErrors =
    report.summary.issues.missing > 0 ||
    buildReport.status === 'failed';

  process.exit(hasErrors ? 1 : 0);
}

// 运行主函数
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});