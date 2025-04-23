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
      shell: true,
      encoding: "utf-8",
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_OPTIONS: "--experimental-vm-modules",
      },
    })

    if (result.error) {
      throw new Error(`❌ Error running test: ${file}\n${result.error}`)
    }

    const lines = result.stdout?.toString().split("\n") ?? []
    const suiteName = lines.find((l) => l.startsWith("▶ ["))?.match(/\[([^\]]+)\]/)?.[1] ?? file
    const suiteLines = lines.filter((line) =>
      line.trim().startsWith("✔") || line.trim().startsWith("✖")
    )

    logger.info(`\n[${suiteName}]:`)
    suiteLines.forEach((line) => logger.info(line.trim()))

    if (result.status !== 0) {
      throw new Error(`❌ Test failed in file: ${file}`)
    }
  }

  logger.success("✅ All Node.js tests completed successfully!")
}
