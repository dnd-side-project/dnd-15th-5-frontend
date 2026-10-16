import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const runtimeDirectory = dirname(require.resolve('onnxruntime-web'));
const destination = new URL('../public/imgly-runtime/', import.meta.url);

await mkdir(destination, { recursive: true });
for (const file of ['ort.wasm.min.mjs', 'ort.webgpu.min.mjs']) {
  await copyFile(join(runtimeDirectory, file), new URL(file, destination));
}
await copyFile(
  new URL('../public/ONNXRUNTIME-LICENSE.txt', import.meta.url),
  new URL('LICENSE.txt', destination)
);
process.stdout.write('IMG.LY용 ONNX 런타임 원본 모듈 준비 완료\n');
