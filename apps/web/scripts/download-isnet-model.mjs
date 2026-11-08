import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { access, mkdir, rename, rm, stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as delay } from 'node:timers/promises';

import { ISNET_MODELS } from '../src/features/record/sticker/background-removal/isnetModels.ts';

const directory = new URL('../public/models/', import.meta.url);
const maxDownloadAttempts = 3;

const fetchModel = async (model) => {
  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(model.url).catch((error) => {
      if (attempt === maxDownloadAttempts) throw error;
      return undefined;
    });

    if (response?.ok && response.body) return response.body;

    if (
      response &&
      (attempt === maxDownloadAttempts || (response.status !== 429 && response.status < 500))
    ) {
      throw new Error('모델 다운로드 실패: HTTP ' + response.status);
    }

    await response?.body?.cancel();
    console.warn(
      `${model.filename} 다운로드 재시도 (${attempt + 1}/${maxDownloadAttempts}, ${response ? `HTTP ${response.status}` : '네트워크 오류'})`
    );
    await delay(1000 * 2 ** (attempt - 1));
  }
};

const checksum = async (path, algorithm) => {
  const hash = createHash(algorithm);
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
};

const downloadModel = async (model) => {
  const destination = new URL(model.filename, directory);
  const temporary = new URL(model.filename + '.download', directory);
  const exists = await access(destination).then(
    () => true,
    () => false
  );
  if (exists && (await checksum(destination, model.checksum.algorithm)) === model.checksum.value) {
    process.stdout.write(model.filename + ' 준비 완료 (로컬 파일 재사용)\n');
    return;
  }
  process.stdout.write(
    model.filename + ' 다운로드 (' + Math.round(model.bytes / 1024 / 1024) + 'MiB)\n'
  );
  try {
    const body = await fetchModel(model);
    await pipeline(Readable.fromWeb(body), createWriteStream(temporary));
    if (
      (await stat(temporary)).size !== model.bytes ||
      (await checksum(temporary, model.checksum.algorithm)) !== model.checksum.value
    ) {
      throw new Error(model.filename + ' 크기 또는 체크섬이 일치하지 않습니다.');
    }
    await rename(temporary, destination);
    process.stdout.write(model.filename + ' 준비 완료\n');
  } finally {
    await rm(temporary, { force: true });
  }
};

await mkdir(directory, { recursive: true });
for (const model of Object.values(ISNET_MODELS)) await downloadModel(model);
