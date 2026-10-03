import { spawn } from 'node:child_process';

import type { ProcessExecutionResult, RunnerPlan } from '../../types/testExecution.js';

const FORWARDED_SIGNALS: readonly NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

/*** Execute one runner plan without a shell and forward termination signals in watch mode. */
export async function executeProcessAsync(plan: RunnerPlan): Promise<ProcessExecutionResult> {
  const startedAt = performance.now();

  return await new Promise((resolve, reject) => {
    const child = spawn(plan.command, [...plan.args], {
      cwd: plan.cwd,
      env: plan.env,
      shell: false,
      stdio: 'inherit',
    });

    const signalHandlers = new Map<NodeJS.Signals, () => void>();

    if (plan.watch) {
      for (const signal of FORWARDED_SIGNALS) {
        const handler = () => {
          if (!child.killed) child.kill(signal);
        };
        signalHandlers.set(signal, handler);
        process.once(signal, handler);
      }
    }

    const cleanup = () => {
      for (const [signal, handler] of signalHandlers) process.off(signal, handler);
    };

    child.once('error', (error) => {
      cleanup();
      reject(error);
    });

    child.once('close', (code, signal) => {
      cleanup();
      resolve({
        durationMs: performance.now() - startedAt,
        exitCode: code ?? 1,
        signal,
      });
    });
  });
}
