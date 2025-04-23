import chalk from "chalk"

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(chalk.blue("ℹ"), chalk.blue(message), ...args)
  },

  success: (message: string, ...args: any[]) => {
    console.log(chalk.green("✓"), chalk.green(message), ...args)
  },

  warning: (message: string, ...args: any[]) => {
    console.log(chalk.yellow("⚠"), chalk.yellow(message), ...args)
  },

  error: (message: string, ...args: any[]) => {
    console.log(chalk.red("✗"), chalk.red(message), ...args)
  },

  test: {
    start: (name: string) => {
      console.log(chalk.cyan("▶"), chalk.cyan(name))
    },

    pass: (name: string, duration?: number) => {
      const durationText = duration ? chalk.gray(`(${duration}ms)`) : ""
      console.log(chalk.green("  ✓"), name, durationText)
    },

    fail: (name: string, error: Error) => {
      console.log(chalk.red("  ✗"), name)
      console.log(chalk.red("    ", error.message))
    },

    skip: (name: string) => {
      console.log(chalk.yellow("  -"), chalk.gray(name), chalk.yellow("(skipped)"))
    },
  },
}
