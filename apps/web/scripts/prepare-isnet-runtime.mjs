import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { ISNET_MODELS } from '../src/features/record/sticker/isnetModels.ts';

const require = createRequire(import.meta.url);
const runtimeDirectory = dirname(require.resolve('onnxruntime-web'));
const destination = new URL('../public/isnet-runtime/', import.meta.url);
const files = Object.values(ISNET_MODELS).flatMap((model) => [
  model.runtime,
  model.wasmModule,
  model.wasmBinary,
]);

await mkdir(destination, { recursive: true });
for (const file of new Set(files)) {
  await copyFile(join(runtimeDirectory, file), new URL(file, destination));
}
await copyFile(
  new URL('../public/models/ONNXRUNTIME-LICENSE.txt', import.meta.url),
  new URL('LICENSE.txt', destination)
);
process.stdout.write('IS-Net WebGPU·WASM 런타임 준비 완료\n');
