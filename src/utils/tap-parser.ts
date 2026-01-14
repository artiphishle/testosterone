import { logger } from "./logger"

export interface TestResult {
  success: boolean
  suiteName: string
  duration: number
}

export function parseTapOutput(tapOutput: string, suiteName: string): TestResult {
  const lines = tapOutput.split("\n")
  const notOkLine = lines.find((line) => line.startsWith("not ok "))
  const durationLine = lines.find((line) => line.trim().startsWith("duration_ms:"))

  const success = !notOkLine
  const duration = durationLine ? parseFloat(durationLine.split(":")[1]) : 0

  return {
    success,
    suiteName,
    duration,
  }
}

export function formatTestResult(result: TestResult) {
  const icon = result.success ? "✅" : "❌"
  return `${icon} ${result.suiteName} (${result.duration.toFixed(2)}ms)`
}

export function printSummary(results: TestResult[]) {
  const passed = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length
  const total = results.length
  const totalDuration = results.reduce((acc, r) => acc + r.duration, 0)

  logger.info("\n--- Test Summary ---")
  logger.info(`Total Tests: ${total}`)
  logger.success(`Passed: ${passed}`)
  logger.error(`Failed: ${failed}`)
  logger.info(`Total Duration: ${totalDuration.toFixed(2)}ms`)
  logger.info("--------------------")
}
