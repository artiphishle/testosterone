#!/usr/bin/env tsx
import { Command } from "commander"
import { detectProjectType } from "./utils/detect-project.js"
import { findTestFiles } from "./utils/find-test-files.js"
import { runNodeTests } from "./runners/node-runner.js"
import { runReactTests } from "./runners/react-runner.js"
import { generateCoverageReport } from "./coverage/coverage.js"
import { logger } from "./utils/logger.js"

// Read version from package.json
const version = "0.1.0" // Hardcoded for simplicity, you can import from package.json

const program = new Command()

program.name("testosterone").description("A simple testing framework for TypeScript projects").version(version)

program
  .option("-c, --coverage", "Generate coverage report")
  .option("-w, --watch", "Watch for changes")
  .option("--react", "Force React testing mode")
  .option("--node", "Force Node.js testing mode")
  .option("-v, --verbose", "Verbose output")
  .action(async (options) => {
    try {
      logger.info("🧪 Testosterone - TypeScript Testing Framework")

      // Detect project type
      const projectType = options.react ? "react" : options.node ? "node" : await detectProjectType()

      logger.info(`Detected project type: ${projectType}`)

      // Find test files
      const testFiles = await findTestFiles()
      logger.info(`Found ${testFiles.length} test files`)

      if (testFiles.length === 0) {
        logger.error("No test files found. Tests should match *.spec.ts(x) or *.test.ts(x)")
        process.exit(1)
      }

      // Run tests based on project type
      if (projectType === "react" || projectType === "next") {
        await runReactTests(testFiles, options)
      } else {
        await runNodeTests(testFiles, options)
      }

      // Generate coverage report if requested
      if (options.coverage) {
        await generateCoverageReport()
      }

      logger.success("All tests completed successfully!")
    } catch (error) {
      logger.error("Tests failed:", error)
      process.exit(1)
    }
  })

program.parse()
