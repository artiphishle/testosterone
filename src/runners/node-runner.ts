import { spawnSync } from "child_process"
import { logger } from "../utils/logger"
import { TestResult, formatTestResult, parseTapOutput, printSummary } from "../utils/tap-parser"

interface RunOptions {
  coverage?: boolean
  watch?: boolean
  verbose?: boolean
}

/**
 * Runs tests using Node.js test runner
 */
export async function runNodeTests(testFiles: string[], options: RunOptions): Promise<void> {
  logger.info("Running tests with Node.js test runner")
  const results: TestResult[] = []

  for (const file of testFiles) {
    const runner = options.coverage ? "npx" : "tsx"
    const baseArgs = options.coverage
      ? ["c8", "--reporter=text", "--reporter=lcov", "--reporter=html", "tsx"]
      : []

    const testArgs = [file]
    testArgs.push("--test-reporter=tap")

    const args = [...baseArgs, ...testArgs]

    const startTime = Date.now()
    const processResult = spawnSync(runner, args, {
      shell: true,
      encoding: "utf-8",
      stdio: "pipe",
      env: {
        ...process.env,
        NODE_OPTIONS: "--experimental-vm-modules",
      },
    })
    const duration = Date.now() - startTime

    if (processResult.error) {
      logger.error(`❌ ${file} (Error)`)
      logger.error(processResult.error.stack || processResult.error.message)
      results.push({ success: false, suiteName: file, duration: 0 })
      continue
    }

    const tapOutput = processResult.stdout?.toString() ?? ""
    const testResult = parseTapOutput(tapOutput, file)

    if (testResult.duration === 0) {
      testResult.duration = duration
    }

    results.push(testResult)

    logger.info(formatTestResult(testResult))

    if (!testResult.success) {
      if (tapOutput) {
        logger.info(tapOutput)
      }
      if (processResult.stderr) {
        logger.error(processResult.stderr.toString())
      }
    }
  }

  printSummary(results)

  if (results.some((r) => !r.success)) {
    process.exit(1)
  }
}
