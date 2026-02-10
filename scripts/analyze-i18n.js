/**
 * i18n 自动化检查与修复工具
 *
 * 功能:
 * 1. 检测 TSX 文件中未使用 t() 函数的硬编码文本
 * 2. 检测资源文件中未使用的键
 * 3. 检测资源文件中缺失的键
 * 4. 自动生成修复建议和修复脚本
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ============================================
// 配置
// ============================================

const CONFIG = {
  // 要扫描的源代码目录
  sourceDirs: [
    'apps/electron/src/renderer/pages',
    'apps/electron/src/renderer/components',
  ],
  // 本地化资源目录
  i18nDir: path.join(PROJECT_ROOT, 'i18n', 'locales'),
  // 要检查的语言
  languages: ['en', 'zh-CN'],
  // 要生成的修复文件
  outputDir: path.join(PROJECT_ROOT, 'scripts', 'i18n-reports'),
};

// 文本模式 - 用于检测需要翻译的文本
const TEXT_PATTERNS = [
  // 在 JSX 中的文本内容 (简单的 >文本< )
  />([^<>{]+)</g,
  // 属性值中的纯文本
  /(?:title|placeholder|label|aria-label|alt)=["']([^"']+)["']/g,
];

// 不需要翻译的模式 (排除)
const EXCLUDE_PATTERNS = [
  // 变量引用
  /\{[^}]+\}/,
  // CSS 类名
  /^[\w\s-]*class[\w\s-]*$/i,
  // 单词或空格
  /^[\w\s.,!?]+$/,
  // 数字
  /^\d+$/,
  // 路径
  /^[\w\-./]+$/,
  // HTML 标签属性
  /^(?:title|placeholder|style|className|class|data-[\w-]+)$/i,
  // 单个字符
  /^.{0,1}$/,
  // 包含 $ 或 { (即变量)
  /[${}]/,
  // 特殊符号
  /^[→←↑↓]+$/,
  /[\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\uFF00-\uFFEF]+$/, // 各种符号
  // 只有空白字符
  /^\s*$/,
];

// 根据文件路径推断 namespace
function getNamespaceFromFilePath(filePath) {
  const relativePath = path.relative(path.join(PROJECT_ROOT, 'apps', 'electron', 'src', 'renderer'), filePath);
  const ext = path.extname(relativePath);
  return relativePath.slice(0, -ext.length);
}

// ============================================
// 工具函数
// ============================================

// 递归获取所有文件
function getAllFiles(dir, extensions = ['.tsx', '.ts']) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

// 加载 JSON 资源文件
function loadTranslationResources() {
  const resources = {};

  for (const lang of CONFIG.languages) {
    resources[lang] = {};
    const langDir = path.join(CONFIG.i18nDir, lang);
    if (!fs.existsSync(langDir)) continue;

    const files = getAllFiles(langDir, ['.json']);
    for (const file of files) {
      const relativePath = path.relative(langDir, file);
      const namespace = relativePath.slice(0, -path.extname(relativePath).length);
      try {
        resources[lang][namespace] = JSON.parse(fs.readFileSync(file, 'utf-8'));
      } catch (err) {
        console.warn(`警告: 无法加载 ${lang}/${namespace}:`, err.message);
      }
    }
  }
  return resources;
}

// 从 TSX 文件中提取所有使用的翻译键
function extractTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set();

  // 匹配 t('key') 或 t("key") 的调用
  const tCallPattern = /t\(["'`]([^"'`]+)["'`]\)/g;
  let match;
  while ((match = tCallPattern.exec(content)) !== null) {
    keys.add(match[1]);
  }

  // 匹配 t(`key`) 模板字符串 (处理变量插值)
  const tTemplatePattern = /t`([^`]+)`/g;
  while ((match = tTemplatePattern.exec(content)) !== null) {
    // 提取模板字符串中的静态部分
    const parts = match[1].split(/\$\{[^}]+\}/);
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed && !trimmed.startsWith('$')) {
        keys.add(trimmed);
      }
    }
  }

  // 匹配 namespace: { t } 部分中的 namespace
  const namespacePattern = /useTranslation\(["'`]([^"'`]+)["'`]\)/g;
  let namespaces = new Set();
  while ((match = namespacePattern.exec(content)) !== null) {
    namespaces.add(match[1]);
  }

  return { keys: Array.from(keys), namespaces: Array.from(namespaces) };
}

// 检测文件中可能的硬编码文本
function detectHardcodedText(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const namespace = getNamespaceFromFilePath(filePath);
  const { keys: usedKeys } = extractTranslationKeys(filePath);

  // 加载对应的翻译资源
  const resourcePath = path.join(CONFIG.i18nDir, 'en', namespace + '.json');
  const resource = fs.existsSync(resourcePath) ? JSON.parse(fs.readFileSync(resourcePath, 'utf-8')) : {};

  const hardcoded = [];

  // 检查每行
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // 跳过注释行
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      continue;
    }

    // 跳过已经在使用 t() 的行
    if (line.includes('t(') || line.includes('t`')) {
      continue;
    }

    // 提取可能需要翻译的文本
    for (const pattern of TEXT_PATTERNS) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(line)) !== null) {
        const text = match[1]?.trim();
        if (!text) continue;

        // 检查是否应该排除
        let shouldExclude = false;
        for (const excludePattern of EXCLUDE_PATTERNS) {
          if (excludePattern.test(text)) {
            shouldExclude = true;
            break;
          }
        }

        if (!shouldExclude && text.length > 1) {
          // 检查是否已存在于资源中
          const existsInResource = resource.hasOwnProperty(text);

          hardcoded.push({
            line: lineNumber,
            text,
            originalLine: line.trim(),
            existsInResource,
            suggestedKey: existsInResource ? text : null,
          });
        }
      }
    }
  }

  return { namespace, hardcoded, usedKeys };
}

// ============================================
// 分析功能
// ============================================

/**
 * 检测硬编码文本
 */
function analyzeHardcodedText() {
  console.log('\n=== 检测硬编码文本 ===\n');

  const results = [];
  const sourceFiles = [];

  // 收集所有源文件
  for (const dir of CONFIG.sourceDirs) {
    const fullPath = path.join(PROJECT_ROOT, dir);
    sourceFiles.push(...getAllFiles(fullPath));
  }

  console.log(`扫描 ${sourceFiles.length} 个文件...\n`);

  for (const file of sourceFiles) {
    const { namespace, hardcoded, usedKeys } = detectHardcodedText(file);
    const relativePath = path.relative(PROJECT_ROOT, file);

    if (hardcoded.length > 0) {
      console.log(`\n${relativePath} (namespace: ${namespace})`);
      for (const item of hardcoded) {
        const status = item.existsInResource ? '[存在资源]' : '[需要添加]';
        console.log(`  行 ${item.line}: ${status}`);
        console.log(`    文本: "${item.text}"`);
        if (item.suggestedKey) {
          console.log(`    建议使用: t('${item.suggestedKey}')`);
        } else {
          console.log(`    建议: 添加到 ${namespace}.json 并使用 t('${item.text}')`);
        }
      }

      results.push({
        file: relativePath,
        namespace,
        hardcoded,
        usedKeys,
      });
    }
  }

  return results;
}

/**
 * 检测未使用的翻译键
 */
function analyzeUnusedKeys(resources) {
  console.log('\n=== 检测未使用的翻译键 ===\n');

  const sourceFiles = [];
  for (const dir of CONFIG.sourceDirs) {
    const fullPath = path.join(PROJECT_ROOT, dir);
    sourceFiles.push(...getAllFiles(fullPath));
  }

  // 收集所有使用的键映射到 namespace
  const usedKeysMap = new Map();

  for (const file of sourceFiles) {
    const { keys, namespaces } = extractTranslationKeys(file);
    const namespace = namespaces[0] || getNamespaceFromFilePath(file);

    if (!usedKeysMap.has(namespace)) {
      usedKeysMap.set(namespace, new Set());
    }
    for (const key of keys) {
      usedKeysMap.get(namespace).add(key);
    }
  }

  // 检查每个 namespace 中未使用的键
  const enResources = resources['en'] || {};
  const unusedResults = [];

  for (const [namespace, keys] of Object.entries(enResources)) {
    const usedKeys = usedKeysMap.get(namespace) || new Set();
    const unusedKeys = Object.keys(keys).filter(key => !usedKeys.has(key));

    if (unusedKeys.length > 0) {
      console.log(`\n${namespace}.json`);
      for (const key of unusedKeys) {
        console.log(`  未使用: "${key}" -> "${keys[key]}"`);
      }
      unusedResults.push({
        namespace,
        unusedKeys,
        totalKeys: Object.keys(keys).length,
      });
    }
  }

  return unusedResults;
}

/**
 * 检测缺失的翻译键
 */
function analyzeMissingTranslations(resources) {
  console.log('\n=== 检测缺失的翻译键 ===\n');

  const enResources = resources['en'] || {};
  const zhResources = resources['zh-CN'] || {};
  const missingResults = [];

  for (const [namespace, enKeys] of Object.entries(enResources)) {
    const zhKeys = zhResources[namespace] || {};
    const missingKeys = Object.keys(enKeys).filter(key => !zhKeys.hasOwnProperty(key));

    if (missingKeys.length > 0) {
      console.log(`\n${namespace}.json - 缺失中文翻译:`);
      for (const key of missingKeys) {
        console.log(`  "${key}"`);
      }
      missingResults.push({
        namespace,
        missingKeys,
      });
    }
  }

  return missingResults;
}

/**
 * 检测空值或空字符串的翻译
 */
function analyzeEmptyTranslations(resources) {
  console.log('\n=== 检测空值翻译 ===\n');

  const zhResources = resources['zh-CN'] || {};
  const emptyResults = [];

  for (const [namespace, keys] of Object.entries(zhResources)) {
    const emptyKeys = Object.keys(keys).filter(key => {
      const value = keys[key];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (emptyKeys.length > 0) {
      console.log(`\n${namespace}.json - 空值翻译:`);
      for (const key of emptyKeys) {
        console.log(`  "${key}"`);
      }
      emptyResults.push({
        namespace,
        emptyKeys,
      });
    }
  }

  return emptyResults;
}

// ============================================
// 生成修复脚本
// ============================================

function generateFixScript(results) {
  const outputDir = CONFIG.outputDir;
  fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const scriptPath = path.join(outputDir, `fix-i18n-${timestamp}.js`);

  let script = `/**
 * 自动生成的 i18n 修复脚本
 * 生成时间: ${new Date().toISOString()}
 *
 * 使用方法:
 *   node ${path.basename(scriptPath)}
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve('${PROJECT_ROOT}');

`;

  // 添加缺失的翻译键
  script += `// ============================================\n`;
  script += `// 1. 添加缺失的中文翻译\n`;
  script += `// ============================================\n\n`;

  const resources = loadTranslationResources();
  const zhResources = resources['zh-CN'] || {};
  const enResources = resources['en'] || {};

  for (const [namespace, enKeys] of Object.entries(enResources)) {
    const zhKeys = zhResources[namespace] || {};
    const missingKeys = Object.keys(enKeys).filter(key => !zhKeys.hasOwnProperty(key));

    if (missingKeys.length > 0) {
      const filePath = path.join(CONFIG.i18nDir, 'zh-CN', namespace + '.json');
      script += `// 修复 ${namespace}.json\n`;
      script += `(function() {\n`;
      script += `  const filePath = path.join(ROOT_DIR, 'i18n', 'locales', 'zh-CN', '${namespace}.json');\n`;
      script += `  if (!fs.existsSync(filePath)) {\n`;
      script += `    console.log('⚠️ 文件不存在:', filePath);\n`;
      script += `    return;\n`;
      script += `  }\n`;
      script += `  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));\n`;

      for (const key of missingKeys) {
        script += `  content['${key.replace(/'/g, "\\'"]}'] = '${enKeys[key].replace(/'/g, "\\'")}'; // TODO: 需要翻译\n`;
      }

      script += `  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\\n');\n`;
      script += `  console.log('✓ 已修复: ${namespace}.json');\n`;
      script += `})();\n\n`;
    }
  }

  script += `\nconsole.log('\\n修复完成!');\n`;

  fs.writeFileSync(scriptPath, script, 'utf-8');
  console.log(`\n修复脚本已生成: ${scriptPath}`);

  return scriptPath;
}

function generateReport(results) {
  const outputDir = CONFIG.outputDir;
  fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const reportPath = path.join(outputDir, `i18n-report-${timestamp}.md`);

  let report = `# i18n 分析报告\n\n`;
  report += `生成时间: ${new Date().toISOString()}\n\n`;

  const { hardcoded, unused, missing, empty } = results;

  // 硬编码文本
  report += `## 1. 硬编码文本 (需修复)\n\n`;
  if (hardcoded.length === 0) {
    report += `✓ 未发现硬编码文本\n\n`;
  } else {
    report += `共发现 ${hardcoded.length} 个文件包含硬编码文本:\n\n`;
    for (const item of hardcoded) {
      report += `### ${item.file}\n`;
      report += `**Namespace:** \`${item.namespace}\`\n\n`;
      for (const h of item.hardcoded) {
        report += `- 行 ${h.line}: \`${h.text}\`\n`;
        if (h.existsInResource) {
          report += `  - 建议使用: \`t('${h.suggestedKey}')\`\n`;
        } else {
          report += `  - 需要添加到资源文件\n`;
        }
      }
      report += `\n`;
    }
  }

  // 未使用的键
  report += `## 2. 未使用的翻译键\n\n`;
  if (unused.length === 0) {
    report += `✓ 所有翻译键都在使用中\n\n`;
  } else {
    report += `共发现 ${unused.length} 个 namespace 包含未使用的键:\n\n`;
    for (const item of unused) {
      report += `### ${item.namespace}.json\n`;
      report += `${item.unusedKeys.length}/${item.totalKeys} 键未使用:\n`;
      for (const key of item.unusedKeys) {
        report += `- \`${key}\`\n`;
      }
      report += `\n`;
    }
  }

  // 缺失的翻译
  report += `## 3. 缺失的中文翻译\n\n`;
  if (missing.length === 0) {
    report += `✓ 所有英文翻译都有对应的中文翻译\n\n`;
  } else {
    report += `共发现 ${missing.length} 个 namespace 缺失翻译:\n\n`;
    for (const item of missing) {
      report += `### ${item.namespace}.json\n`;
      report += `缺失 ${item.missingKeys.length} 个键:\n`;
      for (const key of item.missingKeys) {
        report += `- \`${key}\`\n`;
      }
      report += `\n`;
    }
  }

  // 空值翻译
  report += `## 4. 空值翻译 (需修复)\n\n`;
  if (empty.length === 0) {
    report += `✓ 无空值翻译\n\n`;
  } else {
    report += `共发现 ${empty.length} 个 namespace 包含空值翻译:\n\n`;
    for (const item of empty) {
      report += `### ${item.namespace}.json\n`;
      report += `${item.emptyKeys.length} 个空值:\n`;
      for (const key of item.emptyKeys) {
        report += `- \`${key}\`\n`;
      }
      report += `\n`;
    }
  }

  report += `---\n\n`;
  report += `## 统计汇总\n\n`;
  report += `
| 项目 | 数量 |
|------|------|
| 包含硬编码文本的文件 | ${hardcoded.length} |
| 包含未使用键的 namespace | ${unused.length} |
| 缺失翻译的 namespace | ${missing.length} |
| 包含空值翻译的 namespace | ${empty.length} |
`;

  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n报告已生成: ${reportPath}`);

  return reportPath;
}

// ============================================
// 主函数
// ============================================

async function main() {
  console.log('i18n 自动化检查与修复工具');
  console.log('='.repeat(50));

  // 加载资源
  console.log('\n加载翻译资源...');
  const resources = loadTranslationResources();
  const totalEN = Object.keys(resources['en'] || {}).length;
  const totalZH = Object.keys(resources['zh-CN'] || {}).length;
  console.log(`  英文资源: ${totalEN} 个 namespace`);
  console.log(`  中文资源: ${totalZH} 个 namespace`);

  // 执行各项检查
  const hardcodedResults = analyzeHardcodedText();
  const unusedResults = analyzeUnusedKeys(resources);
  const missingResults = analyzeMissingTranslations(resources);
  const emptyResults = analyzeEmptyTranslations(resources);

  // 生成报告
  const reportPath = generateReport({
    hardcoded: hardcodedResults,
    unused: unusedResults,
    missing: missingResults,
    empty: emptyResults,
  });

  // 生成修复脚本
  const scriptPath = generateFixScript({
    hardcoded: hardcodedResults,
    unused: unusedResults,
    missing: missingResults,
    empty: emptyResults,
  });

  console.log('\n' + '='.repeat(50));
  console.log('检查完成!');
  console.log(`\n修复脚本: ${scriptPath}`);
  console.log(`详细报告: ${reportPath}`);
  console.log('\n执行以下命令应用修复:');
  console.log(`  node ${scriptPath}`);
}

// 运行主函数
main().catch(err => {
  console.error('错误:', err);
  process.exit(1);
});
