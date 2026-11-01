import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface CoverageWorkspace {
  reportDirectory: string;
  temporaryDirectory: string;
}

interface CoverageRecord {
  sourceFile: string;
  lines: Map<number, number>;
}

export async function prepareCoverage(workingDirectory: string): Promise<CoverageWorkspace> {
  const reportDirectory = resolve(workingDirectory, 'coverage');
  const temporaryDirectory = resolve(reportDirectory, '.testosterone');

  await rm(reportDirectory, { recursive: true, force: true });
  await mkdir(temporaryDirectory, { recursive: true });

  return { reportDirectory, temporaryDirectory };
}

export async function finalizeCoverage(workspace: CoverageWorkspace): Promise<void> {
  const records = await readCoverageRecords(workspace.temporaryDirectory);

  if (records.length === 0) {
    throw new Error('Bun did not produce LCOV coverage data');
  }

  const lcov = records.map(formatCoverageRecord).join('');
  const lcovPath = resolve(workspace.reportDirectory, 'lcov.info');
  await writeFile(lcovPath, lcov);
  await writeCoverageHtml(workspace.reportDirectory, records);
}

async function readCoverageRecords(temporaryDirectory: string): Promise<CoverageRecord[]> {
  const reports = await Promise.all(
    ['node', 'jsdom'].map(async environment => {
      try {
        return await readFile(resolve(temporaryDirectory, environment, 'lcov.info'), 'utf8');
      } catch {
        return '';
      }
    }),
  );

  return reports
    .flatMap(parseLcov)
    .filter(record => !isExcludedCoverageSource(record.sourceFile));
}

function parseLcov(source: string): CoverageRecord[] {
  return source
    .split('end_of_record')
    .map(block => parseCoverageRecord(block))
    .filter((record): record is CoverageRecord => record !== undefined);
}

function parseCoverageRecord(block: string): CoverageRecord | undefined {
  const sourceFile = block.match(/^SF:(.+)$/m)?.[1];

  if (!sourceFile) {
    return undefined;
  }

  const lines = new Map(
    [...block.matchAll(/^DA:(\d+),(\d+)$/gm)].map(([, line, count]) => [Number(line), Number(count)]),
  );

  return { sourceFile, lines };
}

function isExcludedCoverageSource(sourceFile: string): boolean {
  return sourceFile.split(/[\\/]/u).some(segment => segment === '.ankh' || segment === 'node_modules');
}

function formatCoverageRecord(record: CoverageRecord): string {
  const lines = [...record.lines.entries()]
    .map(([line, count]) => `DA:${line},${count}`)
    .join('\n');
  const coveredLineCount = [...record.lines.values()].filter(count => count > 0).length;

  return `TN:\nSF:${record.sourceFile}\n${lines}\nLF:${record.lines.size}\nLH:${coveredLineCount}\nend_of_record\n`;
}

async function writeCoverageHtml(reportDirectory: string, records: CoverageRecord[]): Promise<void> {
  const pages = await Promise.all(
    records.map(async record => {
      const filename = coverageFilename(record.sourceFile);
      await writeFile(resolve(reportDirectory, filename), await formatCoveragePage(record));
      return { filename, sourceFile: record.sourceFile, lines: record.lines };
    }),
  );
  const navigation = pages
    .map(page => {
      const covered = [...page.lines.values()].filter(count => count > 0).length;
      return `<li><a href="${escapeHtml(page.filename)}">${escapeHtml(page.sourceFile)}</a> ${covered}/${page.lines.size} lines</li>`;
    })
    .join('');

  await writeFile(
    resolve(reportDirectory, 'index.html'),
    `<!doctype html><html><head><meta charset="utf-8"><title>Coverage report</title></head><body><h1>Coverage report</h1><ul>${navigation}</ul></body></html>`,
  );
}

function coverageFilename(sourceFile: string): string {
  const normalizedSource = sourceFile.replaceAll(/[\\/]/gu, '_').replaceAll('..', '_');
  return `${normalizedSource}.html`;
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
