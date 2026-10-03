import { TEST_COMMAND_CATEGORY, TEST_RUN_SUMMARY } from '../../constants/test.js';
import { findTestFilesAsync } from '../../features/test-execution/findTestFilesAsync.js';
import { runTestSuiteAsync } from '../../features/test-execution/runTestSuiteAsync.js';
import type { TestCommandContext, TestCommandRunResult } from '../../types/cli.js';
import type { RunTestOptions } from '../../types/testExecution.js';

interface TestCommandServices {
  readonly findTestFilesAsync: typeof findTestFilesAsync;
  readonly runTestSuiteAsync: typeof runTestSuiteAsync;
}

type ParseRunArgumentsResult =
  | { readonly kind: 'help' }
  | { readonly kind: 'run'; readonly options: RunTestOptions };

/*** Execute the public test run command for both Ankh and the standalone CLI. */
export async function runTestCommandAsync(
  argv: readonly string[],
  context: TestCommandContext,
  serviceOverrides: Partial<TestCommandServices> = {},
): Promise<TestCommandRunResult> {
  const services = createTestCommandServices(serviceOverrides);

  try {
    const parsed = parseRunArguments(argv, context.cwd);
    if (parsed.kind === 'help') {
      context.writeStdout(renderRunHelp());
      return { exitCode: 0 };
    }

    const files = await services.findTestFilesAsync(context.cwd);
    if (files.length === 0) {
      context.writeStderr('No test files found. Expected *.spec.ts(x) or *.test.ts(x).\n');
      return { exitCode: 1 };
    }

    context.writeStdout(`Running ${files.length} test file(s).\n`);
    const result = await services.runTestSuiteAsync(files, parsed.options);
    const seconds = (result.durationMs / 1000).toFixed(2);
    const environmentSummary = `${result.jsdomFileCount} jsdom / ${result.fileCount - result.jsdomFileCount} node`;

    context.writeStdout(
      `Suite ${result.success ? 'passed' : 'failed'} in ${seconds}s (${environmentSummary}).\n`,
    );

    return { exitCode: result.exitCode };
  } catch (error) {
    context.writeStderr(`Failed to run tests: ${getErrorMessage(error)}\n`);
    return { exitCode: 1 };
  }
}

/*** Merge optional command-service overrides with the production implementations. */
function createTestCommandServices(
  overrides: Partial<TestCommandServices>,
): TestCommandServices {
  return {
    findTestFilesAsync: overrides.findTestFilesAsync ?? findTestFilesAsync,
    runTestSuiteAsync: overrides.runTestSuiteAsync ?? runTestSuiteAsync,
  };
}

/*** Parse command-line flags into the runner's immutable option contract. */
function parseRunArguments(
  argv: readonly string[],
  cwd: string,
): ParseRunArgumentsResult {
  return parseRunTokens(argv, { cwd });
}

/*** Parse the remaining command tokens without mutable parser state. */
function parseRunTokens(
  argv: readonly string[],
  options: RunTestOptions,
): ParseRunArgumentsResult {
  const [token, ...rest] = argv;
  if (token === undefined) return { kind: 'run', options };
  if (token === '--help' || token === '-h' || token === 'help') return { kind: 'help' };

  if (token === '--coverage' || token === '-c') {
    return parseRunTokens(rest, { ...options, coverage: true });
  }

  if (token === '--watch' || token === '-w') {
    return parseRunTokens(rest, { ...options, watch: true });
  }

  if (token === '--verbose' || token === '-v') {
    return parseRunTokens(rest, { ...options, verbose: true });
  }

  if (token === '--react') {
    if (options.environment === 'node') throw new Error('--react and --node cannot be combined');
    return parseRunTokens(rest, { ...options, environment: 'jsdom' });
  }

  if (token === '--node') {
    if (options.environment === 'jsdom') throw new Error('--react and --node cannot be combined');
    return parseRunTokens(rest, { ...options, environment: 'node' });
  }

  if (token.startsWith('--concurrency=')) {
    return parseRunTokens(rest, {
      ...options,
      concurrency: parseConcurrency(token.slice('--concurrency='.length)),
    });
  }

  if (token === '--concurrency') {
    const [value, ...afterValue] = rest;
    if (value === undefined) throw new Error('--concurrency requires a positive integer');
    return parseRunTokens(afterValue, {
      ...options,
      concurrency: parseConcurrency(value),
    });
  }

  throw new Error(`Unknown test run argument: ${token}`);
}

/*** Validate one concurrency CLI value. */
function parseConcurrency(value: string): number {
  const concurrency = Number(value);
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error('--concurrency requires a positive integer');
  }
  return concurrency;
}

/*** Render help for the shared run command. */
function renderRunHelp(): string {
  return [
    TEST_RUN_SUMMARY,
    '',
    'Usage:',
    `  ankh ${TEST_COMMAND_CATEGORY} run [options]`,
    '  ankhorage-test run [options]',
    '',
    'Options:',
    '  -c, --coverage             Generate text, LCOV and HTML coverage once around the suite',
    '  -w, --watch                Keep the native Node suite in watch mode',
    '      --react                Force JSDOM for every test file',
    '      --node                 Force Node for every test file',
    '      --concurrency <count>  Set native Node test concurrency',
    '  -v, --verbose              Use the spec reporter instead of the compact dot reporter',
    '',
  ].join('\n');
}

/*** Convert an unknown thrown value into stable command output. */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
