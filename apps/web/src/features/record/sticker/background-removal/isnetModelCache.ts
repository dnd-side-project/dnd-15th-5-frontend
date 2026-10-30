const CACHE_NAME = 'chapchap-isnet-models-v1';

type ModelRequest = {
  url: string;
  bytes: number;
  version: string;
  onProgress: (current: number, total: number) => void;
  cacheStorage?: CacheStorage;
  fetcher?: typeof fetch;
};

const readModel = async (
  response: Response,
  expectedBytes: number,
  onProgress: ModelRequest['onProgress']
) => {
  if (!response.ok || !response.body) throw new Error('배경 제거 데이터를 불러오지 못했어요.');
  const reader = response.body.getReader();
  const bytes = new Uint8Array(expectedBytes);
  let current = 0;
  let lastPercent = -1;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (current + value.length > bytes.length)
        throw new Error('배경 제거 데이터 크기가 올바르지 않아요.');
      bytes.set(value, current);
      current += value.length;
      const percent = Math.floor((current / expectedBytes) * 100);
      if (percent !== lastPercent) {
        onProgress(current, expectedBytes);
        lastPercent = percent;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  if (current !== expectedBytes) throw new Error('배경 제거 데이터가 준비되지 않았어요.');
  return bytes;
};

/** 모델 버전별로 검증한 파일만 캐시하며 저장소 미지원·용량 부족은 추론을 막지 않습니다. */
export const loadCachedIsnetModel = async ({
  url,
  bytes,
  version,
  onProgress,
  cacheStorage,
  fetcher = fetch,
}: ModelRequest) => {
  const cacheKey = new URL(url);
  cacheKey.searchParams.set('isnet-version', version);
  let cache: Cache | undefined;
  try {
    cache = await cacheStorage?.open(CACHE_NAME);
    const cached = await cache?.match(cacheKey.href);
    if (cached) {
      try {
        return await readModel(cached, bytes, onProgress);
      } catch {
        await cache?.delete(cacheKey.href);
      }
    }
  } catch {
    cache = undefined;
  }
  const result = await readModel(await fetcher(url), bytes, onProgress);
  try {
    // NOTE: 디스크 캐시 쓰기를 기다리지 않고 모델 초기화·워밍업을 시작합니다.
    void cache
      ?.put(
        cacheKey.href,
        new Response(result, { headers: { 'Content-Type': 'application/octet-stream' } })
      )
      .catch(() => {});
  } catch {
    // NOTE: 캐시 저장에 실패해도 이미 읽은 모델로 배경 제거를 계속합니다.
  }
  return result;
};
