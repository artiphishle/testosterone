import { glob } from "glob"

/**
 * Finds all test files in the project
 */
export async function findTestFiles(): Promise<string[]> {
  // Find all .spec.ts, .spec.tsx, .test.ts, and .test.tsx files
  const files = await glob(["**/*.spec.ts", "**/*.spec.tsx", "**/*.test.ts", "**/*.test.tsx"], {
    ignore: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/coverage/**", "**/.*/**"],
    cwd: process.cwd(),
    absolute: true,
  })

  return files
}
