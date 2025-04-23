import fs from "node:fs/promises"
import path from "node:path"

type ProjectType = "node" | "react" | "next" | "unknown"

/**
 * Detects the type of project in the current directory
 */
export async function detectProjectType(): Promise<ProjectType> {
  try {
    // Check if package.json exists
    const packageJsonPath = path.join(process.cwd(), "package.json")
    const packageJsonExists = await fileExists(packageJsonPath)

    if (!packageJsonExists) {
      return "node" // Default to node if no package.json
    }

    // Read package.json
    const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8")
    const packageJson = JSON.parse(packageJsonContent)
    const dependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    }

    // Check for Next.js
    if (dependencies["next"]) {
      return "next"
    }

    // Check for React
    if (dependencies["react"] && dependencies["react-dom"]) {
      return "react"
    }

    // Default to Node.js
    return "node"
  } catch (error) {
    console.error("Error detecting project type:", error)
    return "node" // Default to node on error
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}
