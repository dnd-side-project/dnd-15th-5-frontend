import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { optimize } from 'svgo';

import svgoConfig from '../svgo.config.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const writeChanges = process.argv.includes('--write');
const iconDirectories = [
  path.join(repositoryRoot, 'apps/web/src/shared/assets/icons'),
  path.join(repositoryRoot, 'apps/mobile/src/shared/assets/icons'),
  path.join(repositoryRoot, 'packages/shared/assets/icons'),
];

async function getSvgPaths(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return getSvgPaths(entryPath);
      }

      return entry.isFile() && path.extname(entry.name) === '.svg' ? [entryPath] : [];
    })
  );

  return paths.flat();
}

const svgPaths = (await Promise.all(iconDirectories.map(getSvgPaths))).flat();
const unoptimizedPaths = [];
let optimizedCount = 0;

for (const svgPath of svgPaths) {
  const source = await readFile(svgPath, 'utf8');
  const optimized = optimize(source, {
    ...svgoConfig,
    path: svgPath,
  }).data;

  const normalized = `${optimized.trimEnd()}\n`;

  if (source === normalized) {
    continue;
  }

  if (writeChanges) {
    await writeFile(svgPath, normalized);
    optimizedCount += 1;
  } else {
    unoptimizedPaths.push(path.relative(repositoryRoot, svgPath));
  }
}

if (writeChanges) {
  process.stdout.write(
    `SVG 아이콘 ${svgPaths.length}개를 확인하고 ${optimizedCount}개를 최적화했습니다.\n`
  );
} else if (unoptimizedPaths.length > 0) {
  const pathList = unoptimizedPaths.map((svgPath) => `- ${svgPath}`).join('\n');

  process.stderr.write(
    `최적화가 필요한 SVG 아이콘이 있습니다:\n${pathList}\n\npnpm optimize:icons를 실행해 주세요.\n`
  );
  process.exitCode = 1;
} else {
  process.stdout.write(`SVG 아이콘 ${svgPaths.length}개의 최적화 상태를 확인했습니다.\n`);
}
