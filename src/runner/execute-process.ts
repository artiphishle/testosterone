import { spawn } from 'node:child_process';

import type { ProcessExecutionResult, RunnerPlan } from './contracts';

export function executeProcess(plan: RunnerPlan): Promise<ProcessExecutionResult> {
  const startedAt = performance.now();

  return new Promise((resolve, reject) => {
    const child = spawn(plan.command, plan.args, {
      cwd: process.cwd(),
      env: plan.env,
      shell: false,
      stdio: 'inherit',
    });

    child.once('error', reject);
    child.once('close', (code, signal) => {
      resolve({
        exitCode: code ?? 1,
        signal,
        durationMs: performance.now() - startedAt,
      });
    });
  });
}
