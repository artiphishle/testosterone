import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface CoverageWorkspace {
  reportDirectory: string;
  temporaryDirectory: string;
}

interface CoverageRecord {
  sourceFile: string;
  lines: Map<number, number>;
  functions: Map<string, CoverageFunction>;
  branches: Map<string, CoverageBranch>;
}

interface CoverageFunction {
  line: number;
  name: string;
  hits: number;
}

interface CoverageBranch {
  line: number;
  block: number;
  branch: number;
  taken: number | undefined;
}

export async function prepareCoverage(workingDirectory: string): Promise<CoverageWorkspace> {
  const reportDirectory = resolve(workingDirectory, 'coverage');
  const temporaryDirectory = resolve(reportDirectory, '.testosterone');
  await rm(reportDirectory, { recursive: true, force: true });
  await mkdir(temporaryDirectory, { recursive: true });
  return { reportDirectory, temporaryDirectory };
}

export async function finalizeCoverage(
  workspace: CoverageWorkspace,
  expectedEnvironments: readonly string[],
): Promise<void> {
  const records = await readCoverageRecords(workspace.temporaryDirectory, expectedEnvironments);
  if (records.length === 0) throw new Error('Bun did not produce LCOV coverage data');
  await writeFile(resolve(workspace.reportDirectory, 'lcov.info'), records.map(formatCoverageRecord).join(''));
  await writeCoverageHtml(workspace.reportDirectory, records);
}

async function readCoverageRecords(
  temporaryDirectory: string,
  expectedEnvironments: readonly string[],
): Promise<CoverageRecord[]> {
  const reports = await Promise.all(
    expectedEnvironments.map(async environment => {
      try {
        const records = parseLcov(
          await readFile(resolve(temporaryDirectory, environment, 'lcov.info'), 'utf8'),
        ).filter(record => !isExcludedCoverageSource(record.sourceFile));
        if (records.length === 0) throw new Error(`Bun did not produce usable LCOV coverage data for ${environment}`);
        return records;
      } catch (error) {
        if (error instanceof Error && error.message.includes('usable LCOV')) throw error;
        throw new Error(`Bun did not produce usable LCOV coverage data for ${environment}`, { cause: error });
      }
    }),
  );
  return mergeCoverageRecords(reports.flat());
}

function parseLcov(source: string): CoverageRecord[] {
  return source.split('end_of_record').map(parseCoverageRecord).filter((record): record is CoverageRecord => record !== undefined);
}

function parseCoverageRecord(block: string): CoverageRecord | undefined {
  const sourceFile = block.match(/^SF:(.+)$/m)?.[1];
  if (!sourceFile) return undefined;
  const lines = new Map([...block.matchAll(/^DA:(\d+),(\d+)$/gm)].map(([, line, count]) => [Number(line), Number(count)]));
  const functions = new Map<string, CoverageFunction>();
  for (const [, line, name] of block.matchAll(/^FN:(\d+),(.+)$/gm)) functions.set(name, { line: Number(line), name, hits: 0 });
  for (const [, hits, name] of block.matchAll(/^FNDA:(\d+),(.+)$/gm)) {
    const existing = functions.get(name);
    functions.set(name, { line: existing?.line ?? 0, name, hits: Number(hits) });
  }
  const branches = new Map<string, CoverageBranch>();
  for (const [, line, blockNumber, branch, taken] of block.matchAll(/^BRDA:(\d+),(\d+),(\d+),(-|\d+)$/gm)) {
    const key = `${line}:${blockNumber}:${branch}`;
    branches.set(key, { line: Number(line), block: Number(blockNumber), branch: Number(branch), taken: taken === '-' ? undefined : Number(taken) });
  }
  return { sourceFile, lines, functions, branches };
}

function mergeCoverageRecords(records: readonly CoverageRecord[]): CoverageRecord[] {
  const merged = new Map<string, CoverageRecord>();
  for (const record of records) {
    const target = merged.get(record.sourceFile) ?? { sourceFile: record.sourceFile, lines: new Map<number, number>(), functions: new Map<string, CoverageFunction>(), branches: new Map<string, CoverageBranch>() };
    merged.set(record.sourceFile, target);
    for (const [line, count] of record.lines) target.lines.set(line, (target.lines.get(line) ?? 0) + count);
    for (const [name, coverageFunction] of record.functions) {
      const existing = target.functions.get(name);
      target.functions.set(name, { ...coverageFunction, line: coverageFunction.line || existing?.line || 0, hits: (existing?.hits ?? 0) + coverageFunction.hits });
    }
    for (const [key, coverageBranch] of record.branches) {
      const existing = target.branches.get(key);
      target.branches.set(key, { ...coverageBranch, taken: coverageBranch.taken === undefined && existing?.taken === undefined ? undefined : (existing?.taken ?? 0) + (coverageBranch.taken ?? 0) });
    }
  }
  return [...merged.values()];
}

function isExcludedCoverageSource(sourceFile: string): boolean {
  return sourceFile.split(/[\\/]/u).some(segment => segment === '.ankh' || segment === 'node_modules');
}

function formatCoverageRecord(record: CoverageRecord): string {
  const lines = [...record.lines.entries()];
  const functions = [...record.functions.values()];
  const branches = [...record.branches.values()];
  const coveredLineCount = lines.filter(([, count]) => count > 0).length;
  const coveredFunctionCount = functions.filter(coverageFunction => coverageFunction.hits > 0).length;
  const coveredBranchCount = branches.filter(coverageBranch => (coverageBranch.taken ?? 0) > 0).length;
  return ['TN:', `SF:${record.sourceFile}`, ...functions.map(coverageFunction => `FN:${coverageFunction.line},${coverageFunction.name}`), ...functions.map(coverageFunction => `FNDA:${coverageFunction.hits},${coverageFunction.name}`), `FNF:${functions.length}`, `FNH:${coveredFunctionCount}`, ...branches.map(coverageBranch => `BRDA:${coverageBranch.line},${coverageBranch.block},${coverageBranch.branch},${coverageBranch.taken ?? '-'}`), `BRF:${branches.length}`, `BRH:${coveredBranchCount}`, ...lines.map(([line, count]) => `DA:${line},${count}`), `LF:${lines.length}`, `LH:${coveredLineCount}`, 'end_of_record', ''].join('\n');
}

async function writeCoverageHtml(reportDirectory: string, records: CoverageRecord[]): Promise<void> {
  const pages = await Promise.all(records.map(async record => {
    const filename = coverageFilename(record.sourceFile);
    await writeFile(resolve(reportDirectory, filename), await formatCoveragePage(record));
    return { filename, sourceFile: record.sourceFile, lines: record.lines };
  }));
  const navigation = pages.map(page => {
    const covered = [...page.lines.values()].filter(count => count > 0).length;
    return `<li><a href="${escapeHtml(page.filename)}">${escapeHtml(page.sourceFile)}</a> ${covered}/${page.lines.size} lines</li>`;
  }).join('');
  await writeFile(resolve(reportDirectory, 'index.html'), `<!doctype html><html><head><meta charset="utf-8"><title>Coverage report</title></head><body><h1>Coverage report</h1><ul>${navigation}</ul></body></html>`);
}

function coverageFilename(sourceFile: string): string {
  return `${sourceFile.replaceAll(/[\\/]/gu, '_').replaceAll('..', '_')}.html`;
}

async function formatCoveragePage(record: CoverageRecord): Promise<string> {
  const source = await readFile(record.sourceFile, 'utf8');
  const annotatedLines = source.split('\n').map((line, index) => {
    const count = record.lines.get(index + 1);
    const state = count === undefined ? 'none' : count > 0 ? 'covered' : 'uncovered';
    return `<tr class="${state}"><td>${index + 1}</td><td>${count ?? ''}</td><td><code>${escapeHtml(line)}</code></td></tr>`;
  });
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(record.sourceFile)}</title><style>.covered{background:#dfd}.uncovered{background:#fdd}td{padding:0 8px;vertical-align:top}code{white-space:pre}</style></head><body><p><a href="index.html">Coverage report</a></p><h1>${escapeHtml(record.sourceFile)}</h1><table>${annotatedLines.join('')}</table></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
