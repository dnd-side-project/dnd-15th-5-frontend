import { loadCachedIsnetModel } from './isnetModelCache';

const makeResponse = (bytes: Uint8Array): Response =>
  ({
    ok: true,
    body: {
      getReader: () => {
        let isRead = false;
        return {
          read: async () => {
            if (isRead) return { done: true, value: undefined };
            isRead = true;
            return { done: false, value: bytes };
          },
          cancel: async () => {},
          releaseLock: () => {},
        };
      },
    },
  }) as unknown as Response;
let entries: Map<string, Response>;
let cache: Cache;
let cacheStorage: CacheStorage;
let fetcher: jest.Mock;
const originalResponse = globalThis.Response;
const options = {
  url: 'https://example.test/models/model.onnx',
  bytes: 4,
  version: 'v1',
  onProgress: jest.fn(),
};
beforeEach(() => {
  entries = new Map();
  cache = {
    match: jest.fn(async (key: string) => entries.get(key)),
    put: jest.fn(async (key: string, response: Response) => {
      entries.set(key, response);
    }),
    delete: jest.fn(async (key: string) => entries.delete(key)),
  } as unknown as Cache;
  cacheStorage = { open: jest.fn().mockResolvedValue(cache) } as unknown as CacheStorage;
  fetcher = jest.fn().mockImplementation(async () => makeResponse(new Uint8Array([1, 2, 3, 4])));
  globalThis.Response = jest.fn((bytes: Uint8Array) =>
    makeResponse(bytes)
  ) as unknown as typeof Response;
});
afterEach(() => {
  globalThis.Response = originalResponse;
});

it('캐시가 있으면 다음 준비에서는 네트워크 요청을 생략한다', async () => {
  const request = { ...options, cacheStorage, fetcher };
  expect(await loadCachedIsnetModel(request)).toEqual(new Uint8Array([1, 2, 3, 4]));
  expect(await loadCachedIsnetModel(request)).toEqual(new Uint8Array([1, 2, 3, 4]));
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it('모델 버전이 바뀌면 이전 캐시를 사용하지 않는다', async () => {
  await loadCachedIsnetModel({ ...options, cacheStorage, fetcher });
  await loadCachedIsnetModel({ ...options, version: 'v2', cacheStorage, fetcher });
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it('손상되거나 잘린 캐시는 지우고 네트워크 모델로 복구한다', async () => {
  const key = options.url + '?isnet-version=v1';
  entries.set(key, makeResponse(new Uint8Array([1, 2])));
  expect(await loadCachedIsnetModel({ ...options, cacheStorage, fetcher })).toHaveLength(4);
  expect(cache.delete).toHaveBeenCalledWith(key);
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it('캐시 저장 공간이 부족해도 이미 읽은 모델을 반환한다', async () => {
  jest.mocked(cache.put).mockRejectedValue(new Error('quota exceeded'));
  expect(await loadCachedIsnetModel({ ...options, cacheStorage, fetcher })).toHaveLength(4);
});

it('캐시 API가 없거나 차단되어도 직접 다운로드한다', async () => {
  await expect(loadCachedIsnetModel({ ...options, fetcher })).resolves.toHaveLength(4);
  const blocked = {
    open: jest.fn().mockRejectedValue(new Error('blocked')),
  } as unknown as CacheStorage;
  await expect(
    loadCachedIsnetModel({ ...options, cacheStorage: blocked, fetcher })
  ).resolves.toHaveLength(4);
});

it('다운로드가 불완전하면 캐시에 저장하지 않는다', async () => {
  fetcher.mockResolvedValue(makeResponse(new Uint8Array([1, 2])));
  await expect(loadCachedIsnetModel({ ...options, cacheStorage, fetcher })).rejects.toThrow(
    '준비되지'
  );
  expect(cache.put).not.toHaveBeenCalled();
});

it('디스크 캐시 쓰기가 끝나기 전에도 모델을 반환한다', async () => {
  jest.mocked(cache.put).mockImplementation(() => new Promise(() => {}));
  await expect(loadCachedIsnetModel({ ...options, cacheStorage, fetcher })).resolves.toHaveLength(
    4
  );
});
