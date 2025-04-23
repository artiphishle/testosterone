import { spawnSync } from "child_process"
import { logger } from "../utils/logger.js"
import { setupJsdom } from "../utils/setup-jsdom.js"

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

  // Set up JSDOM environment for all tests
  setupJsdom()

  // Run each test file individually for better isolation + clearer output
  for (const file of testFiles) {
    logger.info(`▶ Running test file: ${file}`)

    const runner = options.coverage ? "npx" : "tsx"
    const baseArgs = options.coverage
      ? ["c8", "--reporter=text", "--reporter=lcov", "--reporter=html", "tsx"]
      : []

    const testArgs = [file]

    if (options.verbose) {
      testArgs.push("--test-reporter=spec")
    } else {
      testArgs.push("--test-reporter=tap")
    }

    const args = [...baseArgs, ...testArgs]

    const result = spawnSync(runner, args, {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        NODE_OPTIONS: "--experimental-vm-modules",
      },
    })

    if (result.status !== 0) {
      throw new Error(`❌ Test failed in file: ${file}`)
    }
  }

  logger.success("✅ All React tests completed successfully!")
}
