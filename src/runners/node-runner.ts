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

  const args = [
    "--test",
    "--require=ts-node/register",
    ...(options.verbose ? ["--test-reporter=spec"] : ["--test-reporter=tap"]),
    ...testFiles,
  ]

  if (options.coverage) {
    // Use c8 for coverage when requested
    const c8Args = ["c8", "--reporter=text", "--reporter=lcov", "--reporter=html", "node", ...args]

    const result = spawnSync("npx", c8Args, {
      stdio: "inherit",
      shell: true,
    })

    if (result.status !== 0) {
      throw new Error("Tests failed")
    }
  } else {
    const result = spawnSync("node", args, {
      stdio: "inherit",
      shell: true,
    })

    if (result.status !== 0) {
      throw new Error("Tests failed")
    }
  }
}
