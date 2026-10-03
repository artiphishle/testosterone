import { spawn } from 'node:child_process';

import type { ProcessExecutionResult, RunnerPlan } from './contracts';

const FORWARDED_SIGNALS: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

export function executeProcess(plan: RunnerPlan): Promise<ProcessExecutionResult> {
  const startedAt = performance.now();

  return new Promise((resolve, reject) => {
    const child = spawn(plan.command, plan.args, {
      cwd: process.cwd(),
      env: plan.env,
      shell: false,
      stdio: 'inherit',
    });

    const signalHandlers = new Map<NodeJS.Signals, () => void>();

    if (plan.watch) {
      for (const signal of FORWARDED_SIGNALS) {
        const handler = () => {
          if (!child.killed) {
            child.kill(signal);
          }
        };

        signalHandlers.set(signal, handler);
        process.once(signal, handler);
      }
    }

    const cleanup = () => {
      for (const [signal, handler] of signalHandlers) {
        process.off(signal, handler);
      }
    };

    child.once('error', error => {
      cleanup();
      reject(error);
    });

    child.once('close', (code, signal) => {
      cleanup();
      resolve({
        exitCode: code ?? 1,
        signal,
        durationMs: performance.now() - startedAt,
      });
    });
  });
}
