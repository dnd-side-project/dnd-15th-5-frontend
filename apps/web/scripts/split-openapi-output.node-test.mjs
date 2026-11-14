import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import ts from 'typescript';

const execFileAsync = promisify(execFile);
const scriptPath = fileURLToPath(new URL('./split-openapi-output.mjs', import.meta.url));

test('생성된 일반·Suspense 쿼리 옵션에서 기본 키와 사용자 지정 키를 보존한다', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'chapchap-openapi-'));
  const apiDirectory = path.join(directory, 'src/features/report/apis');

  try {
    await mkdir(apiDirectory, { recursive: true });
    const functionNames = [
      'getReportQueryOptions',
      'getReportSuspenseQueryOptions',
      'getEnabledReportQueryOptions',
      'getEnabledReportSuspenseQueryOptions',
    ];
    const functions = functionNames.map(
      (name, index) => `
export const ${name} = (queryOptions?: { queryKey?: string[]; queryFn?: () => string; enabled?: boolean }) => {
  const queryKey = queryOptions?.queryKey ?? ['/reports'];
  const queryFn = () => 'default';
  return ${index === 0 ? '{ queryKey, queryFn, ...queryOptions }' : `{\n    queryKey,\n    queryFn,\n    ${index >= 2 ? 'enabled: true,\n    ' : ''}...queryOptions${index >= 2 ? ',' : ''}\n  }`};
};`
    );
    await writeFile(path.join(apiDirectory, 'swagger.ts'), functions.join('\n'));
    await execFileAsync(process.execPath, [scriptPath, 'report'], { cwd: directory });
    const source = await readFile(path.join(apiDirectory, 'queries.ts'), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext },
    });
    const generated = await import(
      `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
    );

    for (const name of functionNames) {
      const createOptions = generated[name];
      assert.deepEqual(createOptions().queryKey, ['/reports']);
      assert.deepEqual(createOptions({ queryKey: undefined }).queryKey, ['/reports']);
      const customKey = ['/custom'];
      const customQueryFn = () => 'custom';
      const options = createOptions({ queryKey: customKey, queryFn: customQueryFn });
      assert.equal(options.queryKey, customKey);
      assert.equal(options.queryFn, customQueryFn);
      if (name.startsWith('getEnabled')) {
        assert.equal(createOptions({ queryKey: undefined }).enabled, true);
        const disabledOptions = createOptions({ queryKey: undefined, enabled: false });
        assert.deepEqual(disabledOptions.queryKey, ['/reports']);
        assert.equal(disabledOptions.enabled, false);
      }
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
