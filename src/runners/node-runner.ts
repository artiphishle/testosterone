import { spawnSync } from "child_process"
import { logger } from "../utils/logger"

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

  const runner = options.coverage ? "npx" : "tsx"
  const baseArgs = options.coverage
    ? ["c8", "--reporter=text", "--reporter=lcov", "--reporter=html", "tsx"]
    : []

  const testArgs = [...testFiles]

  // Verbose reporting
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
    throw new Error("Tests failed")
  }
}
