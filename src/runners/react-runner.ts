import { spawnSync } from "child_process"
import { logger } from "../utils/logger"
import { setupJsdom } from "../utils/setup-jsdom.js"
import { createTemporaryTsconfigForTests } from "../utils/create-tmp-tsconfig.js"
import { TestResult, formatTestResult, parseTapOutput, printSummary } from "../utils/tap-parser"

interface RunOptions {
  coverage?: boolean
  watch?: boolean
  verbose?: boolean
}

/**
 * Runs tests for React components
 */
export async function runReactTests(testFiles: string[], options: RunOptions): Promise<void> {
  logger.info("Running tests with React testing environment")
  const results: TestResult[] = []

  // Set up JSDOM globally
  setupJsdom()

  // Create temporary tsconfig pointing to user tsconfig
  const tempTsconfigPath = createTemporaryTsconfigForTests()
  const runner = "tsx"

  for (const file of testFiles) {
    const args: string[] = ["--tsconfig", tempTsconfigPath]

    if (options.watch) {
      args.push("--watch")
    }

    if (options.verbose) {
      args.push("--test-reporter=spec")
    } else {
      args.push("--test-reporter=tap")
    }

    args.push(file)

    const startTime = Date.now()
    const processResult = spawnSync(runner, args, {
      env: {
        ...process.env,
        NODE_OPTIONS: "--experimental-vm-modules",
      },
      stdio: "pipe",
      shell: true,
      encoding: "utf-8",
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
