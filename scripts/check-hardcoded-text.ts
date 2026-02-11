/**
 * i18n Hardcoded Text Checker
 *
 * Detects hardcoded text in source files that needs internationalization.
 * Scans .tsx and .ts files for user-visible strings not wrapped in t().
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, relative, extname } from 'path'
import * as glob from 'glob'

interface HardcodedEntry {
  file: string
  line: number
  column: number
  text: string
  type: 'jsx-text' | 'string-literal' | 'jsx-attribute'
}

interface Report {
  totalFiles: number
  filesWithHardcodedText: number
  totalHardcodedEntries: number
  files: Record<string, HardcodedEntry[]>
}

// Patterns to skip - these are typically NOT user-visible
const SKIP_PATTERNS = [
  // React component names
  /^[A-Z][a-zA-Z0-9]*$/,
  // CSS class names
  /^class(Name)?$/,
  /^className$/,
  // IDs
  /^id$/,
  // Common prop names
  /^(src|href|alt|title|placeholder|aria-.*)$/,
  // Short strings (likely codes or IDs)
  /^[a-z]{1,2}$/,
  // Technical terms
  /^(true|false|null|undefined)$/,
  // File extensions
  /^\.[a-z]+$/,
  // Numbers/sizes
  /^\d+(\.\d+)?(\w+)?$/,
  // CSS values
  /^[\d%a-z-]+$/,
]

// Strings that are already wrapped in t()
const T_FUNCTION_PATTERN = /t\(\s*['"`](.+?)['"`]\s*(?:,\s*\w+\s*)?(?:,\s*\{[^}]*\}\s*)?\)/gs

// JSX text content pattern (between > and <)
const JSX_TEXT_PATTERN = />([^<{]+?)</gs

// String literals in JSX (attributes)
const JSX_STRING_PATTERN = /=(['"`])([^'"`]*?)\1/gs

// String literals in JavaScript (excluding template literals with expressions)
const JS_STRING_PATTERN = /(?:const|let|var|return|=)\s*\w*(?:\s*:\s*)?(['"`])([^'"`]*?)\1/gs

function collectFiles(dir: string, extensions: string[]): string[] {
  const files = glob.sync('**/*.*', {
    cwd: dir,
    absolute: true,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/vendor/**',
      '**/test-results/**',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/__tests__/**',
      '**/playground/**',
    ],
  })

  return files.filter(file => extensions.includes(extname(file)))
}

function isAlreadyTranslated(text: string, content: string): boolean {
  // Check if this exact text is already wrapped in t() somewhere
  const pattern = new RegExp(`t\\(\\s*['"\`]${escapeRegExp(text.trim())}['"\`]\\s*\\)`, 's')
  return pattern.test(content)
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Check if the text is on the same line as a t() function call
function isOnSameLineAsTCall(line: string): boolean {
  return line.includes('t(') || line.includes('useTranslation')
}

// Check if string is in a specific variable assignment or return
function isInVariableAssignmentOrReturn(content: string, index: number): boolean {
  const lines = content.substring(0, index).split('\n')
  const lastLine = lines[lines.length - 1].trim()

  return lastLine.startsWith('const ') ||
         lastLine.startsWith('let ') ||
         lastLine.startsWith('var ') ||
         lastLine.startsWith('return ')
}

function analyzeFile(filePath: string): HardcodedEntry[] {
  const entries: HardcodedEntry[] = []

  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    lines.forEach((line, lineIndex) => {
      const lineNum = lineIndex + 1
      const trimmedLine = line.trim()

      // Skip if line contains t() call (already analyzed)
      if (trimmedLine.includes('t(') || trimmedLine.includes('useTranslation')) {
        return
      }

      // Skip if line is a comment
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
        return
      }

      // Match JSX text content
      const jsxTextMatch = line.matchAll(JSX_TEXT_PATTERN)
      for (const match of jsxTextMatch) {
        const text = match[1]?.trim()
        if (text && text.length > 2 && !isInVariableAssignmentOrReturn(content, match.index || 0)) {
          entries.push({
            file: relative(process.cwd(), filePath),
            line: lineNum,
            column: line.indexOf(match[0]) + 1,
            text,
            type: 'jsx-text'
          })
        }
      }

      // Match string literals
      const stringMatch = line.matchAll(/(['"`])([^'"`]*?)\1/g)
      for (const match of stringMatch) {
        const text = match[2]
        const quote = match[1]

        // Skip if matched inside a t() call
        const beforeMatch = line.substring(0, match.index || 0)
        if (beforeMatch.includes('t(')) {
          continue
        }

        // Skip short strings
        if (!text || text.length <= 2) {
          continue
        }

        // Skip if matches skip pattern
        if (SKIP_PATTERNS.some(pattern => pattern.test(text))) {
          continue
        }

        // Skip if looks like URL or file path
        if (text.includes('://') || text.startsWith('/') || text.includes('\\')) {
          continue
        }

        // Skip if looks like CSS class
        if (text.includes(' ') && text.match(/^[a-z-\s]+$/)) {
          continue
        }

        // Check if already translated
        if (isAlreadyTranslated(text, content)) {
          continue
        }

        // Add to entries
        entries.push({
          file: relative(process.cwd(), filePath),
          line: lineNum,
          column: line.indexOf(match[0]) + 1,
          text,
          type: 'string-literal'
        })
      }
    })
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error)
  }

  return entries
}

function generateReport(entries: HardcodedEntry[]): Report {
  // Group by file
  const filesMap: Record<string, HardcodedEntry[]> = {}

  entries.forEach(entry => {
    if (!filesMap[entry.file]) {
      filesMap[entry.file] = []
    }
    filesMap[entry.file].push(entry)
  })

  return {
    totalFiles: Object.keys(filesMap).length,
    filesWithHardcodedText: Object.keys(filesMap).length,
    totalHardcodedEntries: entries.length,
    files: filesMap
  }
}

function main() {
  const sourceDir = 'apps/electron/src/renderer'
  const extensions = ['.tsx', '.ts']

  console.log('🔍 Scanning for hardcoded text...')
  console.log(`📁 Source directory: ${sourceDir}\n`)

  const files = collectFiles(sourceDir, extensions)
  console.log(`📄 Found ${files.length} source files`)

  const allEntries: HardcodedEntry[] = []

  files.forEach((file, index) => {
    process.stdout.write(`\r⏳ Progress: ${index + 1}/${files.length} (${Math.round(((index + 1) / files.length) * 100)}%)`)
    const entries = analyzeFile(file)
    allEntries.push(...entries)
  })

  process.stdout.write('\n')

  // Filter entries (remove false positives)
  const filteredEntries = allEntries.filter(entry => {
    // Skip very short entries
    if (entry.text.length <= 2) return false

    // Skip entries that look like technical terms
    if (/^[A-Z_]+$/.test(entry.text)) return false

    // Skip entries with only special characters
    if (/^[^\w\s]+$/.test(entry.text)) return false

    return true
  })

  console.log(`\n✅ Found ${filteredEntries.length} potential hardcoded strings\n`)

  const report = generateReport(filteredEntries)

  // Save report
  const reportPath = 'scripts/hardcoded-text-report.json'
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`📊 Report saved to: ${reportPath}\n`)

  // Print summary
  console.log('📋 Summary:')
  console.log(`  Total files analyzed: ${files.length}`)
  console.log(`  Files with issues: ${report.filesWithHardcodedText}`)
  console.log(`  Total hardcoded strings: ${report.totalHardcodedEntries}`)
  console.log('')

  // Print top 10 files with most issues
  const sortedFiles = Object.entries(report.files)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 10)

  console.log('🔴 Top 10 files with most hardcoded text:')
  sortedFiles.forEach(([file, entries], index) => {
    console.log(`  ${index + 1}. ${file} (${entries.length} entries)`)
  })

  console.log(`\n✨ Run 'node scripts/view-report.ts' to view detailed report`)
}

main()
