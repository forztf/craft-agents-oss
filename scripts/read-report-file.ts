import { readFileSync } from 'fs'
import { join } from 'path'

const reportPath = join(process.cwd(), 'test-results/hardcoded-strings-analysis.json')
const targetFile = process.argv[2]

try {
  const content = readFileSync(reportPath, 'utf-8')
  const report = JSON.parse(content)
  
  // Find the key that ends with the target file
  const fileKey = Object.keys(report.files).find(key => key.endsWith(targetFile))
  
  if (fileKey) {
    console.log(`Found issues in ${fileKey}:`)
    console.log(JSON.stringify(report.files[fileKey], null, 2))
  } else {
    console.log(`No issues found for ${targetFile}`)
  }
} catch (e) {
  console.error(e)
}
