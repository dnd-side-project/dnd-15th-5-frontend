import { createWriteStream } from 'node:fs';
import { rm } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as delay } from 'node:timers/promises';

const MAX_DOWNLOAD_ATTEMPTS = 3;

/** 서버의 재시도 시각과 429 제한 해제 시간을 지수형 대기 시간에 반영합니다. */
const getRetryDelay = (response, attempt) => {
  const retryAfter = response?.headers.get('Retry-After')?.trim();
  const retryAfterMs = retryAfter
    ? /^\d+(?:\.\d+)?$/.test(retryAfter)
      ? Number(retryAfter) * 1000
      : Date.parse(retryAfter) - Date.now()
    : 0;
  const resetTimes =
    response?.status === 429
      ? [
          ...(response.headers.get('RateLimit') ?? '').matchAll(
            /(?:^|[;,])\s*t\s*=\s*(\d+(?:\.\d+)?)(?=\s*(?:[;,]|$))/g
          ),
        ].map((match) => Number(match[1]) * 1000)
      : [];

  return Math.max(
    1000 * 2 ** (attempt - 1),
    Number.isFinite(retryAfterMs) ? retryAfterMs : 0,
    ...resetTimes.filter(Number.isFinite)
  );
};

/** 응답 본문 저장까지 재시도하고, 실패한 시도의 임시 파일은 다음 요청 전에 제거합니다. */
export const downloadModelFile = async (
  model,
  temporary,
  { fetchResponse = fetch, wait = delay } = {}
) => {
  for (let attempt = 1; attempt <= MAX_DOWNLOAD_ATTEMPTS; attempt += 1) {
    let response;
    try {
      response = await fetchResponse(model.url);
      if (!response.ok || !response.body) {
        throw new Error('모델 다운로드 실패: HTTP ' + response.status);
      }
      await pipeline(Readable.fromWeb(response.body), createWriteStream(temporary));
      return;
    } catch (error) {
      await response?.body?.cancel().catch(() => {});
      await rm(temporary, { force: true });
      if (
        attempt === MAX_DOWNLOAD_ATTEMPTS ||
        (response && !response.ok && response.status !== 429 && response.status < 500)
      ) {
        throw error;
      }

      process.stderr.write(
        `${model.filename} 다운로드 재시도 (${attempt + 1}/${MAX_DOWNLOAD_ATTEMPTS}): ${error.message}\n`
      );
      await wait(getRetryDelay(response, attempt));
    }
  }
};
