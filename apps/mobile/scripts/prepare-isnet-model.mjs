import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { copyFile, mkdir, rename, rm, stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { ISNET_ORIGINAL_MODEL as model } from '../../../packages/shared/src/record/isnetModel.ts';

const directory = new URL('../modules/chapchap-isnet/models/', import.meta.url);
const destination = new URL(model.filename, directory);
const temporary = new URL(model.filename + '.download', directory);
const isValid = async (file) => {
  try {
    if ((await stat(file)).size !== model.bytes) return false;
    const hash = createHash(model.checksum.algorithm);
    for await (const chunk of createReadStream(file)) hash.update(chunk);
    return hash.digest('hex') === model.checksum.value;
  } catch {
    return false;
  }
};

await mkdir(directory, { recursive: true });
if (await isValid(destination)) {
  process.stdout.write('네이티브 ISNet 모델 준비 완료 (로컬 파일 재사용)\n');
} else {
  try {
    const existing = new URL('../../web/public/models/' + model.filename, import.meta.url);
    if (await isValid(existing)) {
      await copyFile(existing, temporary);
    } else {
      process.stdout.write('앱에 포함할 ISNet 모델을 다운로드합니다 (170MiB)\n');
      const response = await fetch(model.url, { signal: AbortSignal.timeout(180_000) });
      if (!response.ok || !response.body)
        throw new Error(`ISNet download failed: ${response.status}`);
      await pipeline(Readable.fromWeb(response.body), createWriteStream(temporary));
    }
    if (!(await isValid(temporary))) throw new Error('ISNet model checksum mismatch');
    await rename(temporary, destination);
    process.stdout.write('네이티브 ISNet 모델 준비 완료\n');
  } finally {
    await rm(temporary, { force: true });
  }
}
