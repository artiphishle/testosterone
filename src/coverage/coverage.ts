import { spawnSync } from "child_process"
import { logger } from "../utils/logger"

/**
 * Generates a coverage report using c8
 */
export async function generateCoverageReport(): Promise<void> {
  logger.info("Generating coverage report...")

  // c8 should have already generated the coverage data during test run
  // Just generate the report
  const result = spawnSync("npx", ["c8", "report", "--reporter=text", "--reporter=lcov", "--reporter=html"], {
    stdio: "inherit",
    shell: true,
  })

  if (result.status === 0) {
    logger.success("Coverage report generated")
  } else {
    logger.error("Failed to generate coverage report")
  }
}
