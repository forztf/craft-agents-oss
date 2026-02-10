/**
 * I18n 完整检查和修复 Agent Team
 *
 * 这个脚本使用多个 Agent 并行协作来处理国际化改造：
 * 1. ExtractAgent - 扫描代码提取硬编码字符串
 * 2. CompareAgent - 对比资源文件找出遗漏
 * 3. FixAgent - 自动应用翻译修复代码
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================
// 工具函数
// ============================================

function runCommand(cmd, args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const process = spawn(cmd, args, { cwd, shell: true });
    let stdout = '';
    let stderr = '';

    process.stdout?.on('data', (data) => stdout += data.toString());
    process.stderr?.on('data', (data) => stderr += data.toString());

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed: ${stderr}`));
      }
    });
  });
}

// ============================================
// 1. ExtractAgent - 扫描代码提取硬编码字符串
// ============================================

class ExtractAgent {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.extractResults = new Map();
  }

  /**
   * 扫描 TSX 文件提取硬编码字符串
   */
  async scanFiles() {
    console.log('\n[ExtractAgent] 开始扫描代码文件...');

    // 扫描所有待改造的文件
    const filesToScan = [
      'apps/electron/src/renderer/pages/**/*.tsx',
      'apps/electron/src/renderer/components/app-shell/*.tsx',
      'apps/electron/src/renderer/components/app-shell/**/*.tsx'
    ];

    for (const pattern of filesToScan) {
      await this.scanPattern(pattern);
    }

    console.log(`[ExtractAgent] 扫描完成，共处理 ${this.extractResults.size} 个文件`);
    return this.extractResults;
  }

  async scanPattern(pattern) {
    // 使用 rg (ripgrep) 查找所有 TSX 文件
    const files = await this.findTsxFiles(pattern);

    for (const filePath of files) {
      const hardcodedTexts = await this.extractHardcodedFrom(filePath);
      if (hardcodedTexts.length > 0) {
        this.extractResults.set(filePath, hardcodedTexts);
      }
    }
  }

  async findTsxFiles(pattern) {
    const files = [];
    const dir = path.join(this.projectRoot, pattern.split('/').slice(0, -1).join('/'));
    const glob = pattern.split('/').pop();

    // 简单的 glob 实现
    const walkDir = (dirPath, results = []) => {
      if (!fs.existsSync(dirPath)) return results;

      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath, results);
        } else if (fullPath.endsWith('.tsx')) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const targetDir = pattern.startsWith('apps/')
      ? path.join(this.projectRoot, 'apps/electron/src/renderer')
      : this.projectRoot;

    const subPath = pattern.replace('apps/electron/src/renderer/', '').replace('**/*.tsx', '');
    if (subPath) {
      const searchDir = path.join(targetDir, subPath);
      if (fs.existsSync(searchDir)) {
        return walkDir(searchDir);
      }
    }

    return walkDir(targetDir);
  }

  /**
   * 从单个文件提取硬编码字符串
   */
  async extractHardcodedFrom(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hardcodedTexts = [];

    // 正则模式匹配：
    // 1. JSX 中的文本内容: <Tag>Text</Tag>
    // 2. 对象属性值: { key: "Value" }
    // 3. 字符串字面量（排除已翻译的）
    const patterns = [
      // 匹配 JSX 中的纯文本内容（不在表达式内）
      />([^<{`]+\s*[^<{`]+)</g,

      // 匹配模板字符串中的文本（非动态部分）
      /`([^${}`]+)`/g,

      // 匹配普通字符串（不在 t() 调用中）
      /"([^"]+)"/g,

      // 匹配单引号字符串
      /'([^']+)'/g,

      // 匹配 children 属性中的文本
      /children:\s*\{?\s*"([^"]+)"/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        let text = match[1];

        // 过滤掉：
        // - 空白或过短的文本
        // - 已经使用 t() 的
        // - HTML/JSX 标签
        // - CSS 类名
        // - 变量名
        // - 技术术语
        if (this._shouldSkip(text, content, match.index)) {
          continue;
        }

        hardcodedTexts.push({
          text: text.trim(),
          position: match.index,
          pattern: pattern.toString(),
        });
      }
    }

    // 去重
    const uniqueTexts = [];
    const seenTexts = new Set();

    for (const item of hardcodedTexts) {
      const key = `${item.text}_${item.position}`;
      if (!seenTexts.has(key)) {
        seenTexts.add(key);
        uniqueTexts.push(item);
      }
    }

    return uniqueTexts;
  }

  _shouldSkip(text, content, position) {
    // 跳过空白
    if (!text || text.trim().length < 2) {
      return true;
    }

    const trimmed = text.trim();

    // 跳过已翻译的（在 t('...') 或 t("...") 中）
    const beforeText = content.substring(Math.max(0, position - 20), position);
    const afterText = content.substring(position, position + text.length + 20);

    if (beforeText.includes("t('") || beforeText.includes('t("')) {
      return true;
    }

    // 跳过 HTML 标签和 JSX
    if (trimmed.startsWith('<') || trimmed.includes('<') || trimmed.includes('{')) {
      return true;
    }

    // 跳过看起来像 CSS 类名、ID 等
    if (/^[a-z][a-z0-9\-_]*$/.test(trimmed) && !this._isNaturalLanguage(trimmed)) {
      return true;
    }

    // 跳过技术术语和变量
    const technicalTerms = ['className', 'disabled', 'type', 'value', 'onChange', 'onClick', ...Object.keys({})];
    if (technicalTerms.includes(trimmed)) {
      return true;
    }

    return false;
  }

  _isNaturalLanguage(text) {
    // 检查是否看起来像自然语言
    // 中文或带空格的英文
    return /[\u4e00-\u9fa5]/.test(text) || text.includes(' ');
  }
}

// ============================================
// 2. CompareAgent - 对比资源文件
// ============================================

class CompareAgent {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.resourceCache = new Map();
    this.missingTranslations = new Map();
  }

  /**
   * 加载所有资源文件
   */
  async loadResources() {
    console.log('\n[CompareAgent] 加载资源文件...');

    const localesPath = path.join(this.projectRoot, 'i18n/locales');
    const enPath = path.join(localesPath, 'en');
    const zhPath = path.join(localesPath, 'zh-CN');

    await this._loadLocale(enPath, 'en');
    await this._loadLocale(zhPath, 'zh-CN');

    console.log(`[CompareAgent] 资源文件加载完成，共 ${this.resourceCache.size} 个文件`);
  }

  async _loadLocale(localePath, locale) {
    const loadDir = (dirPath, basePath = '') => {
      if (!fs.existsSync(dirPath)) return;

      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.join(basePath, entry.name).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          loadDir(fullPath, relativePath);
        } else if (entry.name.endsWith('.json')) {
          const key = `${locale}/${relativePath}`;
          this.resourceCache.set(key, JSON.parse(fs.readFileSync(fullPath, 'utf-8')));
        }
      }
    };

    loadDir(localePath);
  }

  /**
   * 对比检查，找出遗漏的翻译
   */
  async compare(extractResults) {
    console.log('\n[CompareAgent] 开始对比分析...');

    for (const [filePath, texts] of extractResults) {
      const relativePath = path.relative(this.projectRoot, filePath).replace(/\\/g, '/');
      const namespace = this._resolveNamespace(relativePath);

      const missing = [];
      const resources = this.resourceCache.get(`en/${namespace}.json`) || {};

      for (const { text } of texts) {
        // 检查是否在资源文件中
        const inResources = Object.values(resources).some(v => v === text);

        // 检查代码中是否已经使用 t()
        const codeContent = fs.readFileSync(filePath, 'utf-8');
        const isTranslated = codeContent.includes(`t('${text}')`) ||
                           codeContent.includes(`t("${text}")`) ||
                           codeContent.match(new RegExp(`t\\(\\s*['"]${this._escapeRegex(text)}['"]\\s*\\)`));

        if (!inResources && !isTranslated) {
          missing.push({
            text,
            namespace,
            reason: inResources ? 'missing_in_code' : 'missing_in_both',
          });
        }
      }

      if (missing.length > 0) {
        this.missingTranslations.set(filePath, missing);
      }
    }

    console.log(`[CompareAgent] 对比完成，发现 ${this.missingTranslations.size} 个文件存在问题`);
    return this.missingTranslations;
  }

  _resolveNamespace(filePath) {
    // 将文件路径转换为 namespace
    // apps/electron/src/renderer/pages/PreferencesPage.tsx -> pages/PreferencesPage
    if (filePath.includes('/pages/')) {
      const pagePath = filePath.substring(filePath.indexOf('/pages/') + 7);
      return `pages/${pagePath.replace('.tsx', '')}`;
    }
    if (filePath.includes('/components/')) {
      const componentPath = filePath.substring(filePath.indexOf('/components/') + 12);
      return `components/${componentPath.replace('.tsx', '')}`;
    }
    return filePath.replace('.tsx', '');
  }

  _escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 生成修复报告
   */
  generateReport() {
    console.log('\n========== 修复报告 ==========\n');

    let totalMissing = 0;

    for (const [filePath, missing] of this.missingTranslations) {
      console.log(`\n文件: ${path.relative(this.projectRoot, filePath)}`);
      console.log(`遗漏数量: ${missing.length}`);

      for (const item of missing) {
        console.log(`  - "${item.text}"`);
        console.log(`    命名空间: ${item.namespace}`);
        console.log(`    原因: ${item.reason}`);
        totalMissing++;
      }
    }

    console.log(`\n总计: ${totalMissing} 处遗漏翻译`);
    console.log('================================\n');
  }
}

// ============================================
// 3. FixAgent - 自动修复代码
// ============================================

class FixAgent {
  constructor(projectRoot, missingTranslations) {
    this.projectRoot = projectRoot;
    this.missingTranslations = missingTranslations;
    this.fixes = [];
  }

  /**
   * 应用修复
   */
  async applyFixes(dryRun = true) {
    console.log('\n[FixAgent] 开始应用修复...');

    for (const [filePath, missing] of this.missingTranslations) {
      const result = await this.fixFile(filePath, missing, dryRun);
      if (result) {
        this.fixes.push(result);
      }
    }

    console.log(`[FixAgent] 修复完成，共 ${this.fixes.length} 个文件`);

    if (dryRun) {
      console.log('\n[FixAgent] *** Dry Run 模式，未实际修改文件 ***');
    }

    return this.fixes;
  }

  async fixFile(filePath, missingItems, dryRun) {
    const content = fs.readFileSync(filePath, 'utf-8');
    let modified = content;
    let appliedFixes = 0;

    for (const item of missingItems) {
      // 查找硬编码文本位置
      const regex = new RegExp(this._escapeForRegex(item.text), 'g');

      // 生成 t() 调用
      const replacement = `{t('${item.text.replace(/'/g, "\\'")}')}`;

      // 检查上下文，确保是 JSX 文本
      let match;
      while ((match = regex.exec(content)) !== null) {
        const position = match.index;
        const beforeAndAfter = content.substring(Math.max(0, position - 30), position + item.text.length + 30);

        // 检查是否在 JSX 内容中
        const isJSXContent = />[^{]*$/.test(beforeAndAfter.substring(0, 30)) ||
                            /[<][^{]{0,20}$/.test(beforeAndAfter);

        if (isJSXContent) {
          modified = modified.replace(item.text, replacement);
          appliedFixes++;
          break; // 每个文本只替换一次
        }
      }
    }

    if (appliedFixes > 0) {
      const relativePath = path.relative(this.projectRoot, filePath);
      const result = {
        file: relativePath,
        filePath,
        fixes: appliedFixes,
      };

      if (!dryRun) {
        // 确保包含 useTranslation hook
        if (!content.includes("useTranslation")) {
          modified = this._addImport(modified, "useTranslation", "@/contexts/I18nContext");
        }
        if (!content.includes("const { t } = useTranslation")) {
          modified = this._addHook(modified);
        }

        fs.writeFileSync(filePath, modified, 'utf-8');
        console.log(`  ✓ ${relativePath} - ${appliedFixes} 处修复`);
      } else {
        console.log(`  [DRYRUN] ${relativePath} - ${appliedFixes} 处修复`);
      }

      return result;
    }

    return null;
  }

  _escapeForRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _addImport(content, importName, importPath) {
    // 查找 import 语句块
    const importRegex = /import\s+[^;]+;?\s*(\n|$)/g;
    const imports = content.match(importRegex) || [];

    // 检查是否已经导入
    if (content.includes(`import {.*${importName}.*} from`) || content.includes(`import ${importName} from`)) {
      return content;
    }

    // 找到第一个 import，在之前添加
    const lastImport = imports[imports.length - 1];
    if (lastImport) {
      const insertPos = content.indexOf(lastImport) + lastImport.length;
      return content.slice(0, insertPos) + `\nimport { ${importName} } from '${importPath}';` + content.slice(insertPos);
    }

    return content;
  }

  _addHook(content) {
    // 在组件函数开始处添加 const { t } = useTranslation(...)
    const componentRegex = /^(export\s+(default\s+)?function\s+\w+|\w+:\s*React\.FC)/m;
    const match = componentRegex.exec(content);

    if (match) {
      const insertPos = content.indexOf('{', match.index) + 1;
      const namespace = this._guessNamespace(content);

      const hookLine = `\n  const { t } = useTranslation('${namespace}');\n`;
      return content.slice(0, insertPos) + hookLine + content.slice(insertPos);
    }

    return content;
  }

  _guessNamespace(content) {
    // 根据 import 语句或组件名称猜测 namespace
    if (content.includes('/pages/')) {
      const match = content.match(/pages\/(\w+)/);
      if (match) return `pages/${match[1]}`;
    }
    if (content.includes('/components/')) {
      const match = content.match(/components\/(\w+)/);
      if (match) return `components/${match[1]}`;
    }
    return 'common';
  }
}

// ============================================
// Agent Team 协调器
// ============================================

class I18nAgentTeam {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.extractAgent = new ExtractAgent(projectRoot);
    this.compareAgent = new CompareAgent(projectRoot);
    this.fixAgent = null;
  }

  async run(dryRun = true) {
    console.log('========================================================');
    console.log(' I18n Agent Team - 国际化检查和修复系统');
    console.log('========================================================\n');

    const startTime = Date.now();

    try {
      // 阶段 1: 资源分析
      await this.compareAgent.loadResources();

      // 阶段 2: 代码扫描
      const extractResults = await this.extractAgent.scanFiles();

      // 阶段 3: 对比检查
      const missingTranslations = await this.compareAgent.compare(extractResults);

      // 生成报告
      this.compareAgent.generateReport();

      if (missingTranslations.size === 0) {
        console.log('\n✅ 完美！没有发现遗漏的翻译。');
        return;
      }

      // 阶段 4: 应用修复
      this.fixAgent = new FixAgent(this.projectRoot, missingTranslations);
      await this.fixAgent.applyFixes(dryRun);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n✅ 完成！耗时 ${duration} 秒`);

    } catch (error) {
      console.error('\n❌ 执行失败:', error);
      throw error;
    }
  }
}

// ============================================
// 主程序入口
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');
  const projectRoot = path.resolve(__dirname, '..');

  console.log(`项目根目录: ${projectRoot}`);
  console.log(`模式: ${dryRun ? 'Dry Run（预览）' : 'Apply（实际修改）'}`);

  const team = new I18nAgentTeam(projectRoot);
  await team.run(dryRun);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { I18nAgentTeam, ExtractAgent, CompareAgent, FixAgent };
