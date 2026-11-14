import * as env from '@/shared/lib/env';

import { getGooglePlacePhotoUrl } from './getGooglePlacePhotoUrl';

const STORAGE_KEY = 'chapchap_google_places_photo_usage';

describe('getGooglePlacePhotoUrl', () => {
  const getURI = jest.fn(() => 'https://example.com/photo.jpg');
  const photo = { getURI } as unknown as google.maps.places.Photo;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-14T14:59:59Z'));
    jest.replaceProperty(env, 'IS_PRODUCTION', true);
    localStorage.clear();
    getURI.mockClear();
    let queue = Promise.resolve();
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: {
        request: jest.fn((_name: string, callback: () => unknown) => {
          const result = queue.then(callback);
          queue = result.then(
            () => undefined,
            () => undefined
          );
          return result;
        }),
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    Reflect.deleteProperty(navigator, 'locks');
  });

  it('동시 요청도 100건까지만 사진 URL을 생성한다', async () => {
    const urls = await Promise.all(
      Array.from({ length: 105 }, () => getGooglePlacePhotoUrl(photo, 128))
    );

    expect(getURI).toHaveBeenCalledTimes(100);
    expect(urls.filter(Boolean)).toHaveLength(100);
    expect(urls.slice(100)).toEqual(Array(5).fill(null));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      date: '2026-11-14',
      count: 100,
    });
  });

  it('이전에 저장된 사용량에서 이어서 차감한다', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: '2026-11-14', count: 99 }));

    expect(await getGooglePlacePhotoUrl(photo, 128)).toBe('https://example.com/photo.jpg');
    expect(await getGooglePlacePhotoUrl(photo, 128)).toBeNull();
    expect(getURI).toHaveBeenCalledTimes(1);
    expect(getURI).toHaveBeenCalledWith({ maxWidth: 128 });
  });

  it('한국 시간 자정에 사용량을 초기화한다', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: '2026-11-14', count: 100 }));
    expect(await getGooglePlacePhotoUrl(photo, 128)).toBeNull();

    jest.setSystemTime(new Date('2026-11-14T15:00:00Z'));
    expect(await getGooglePlacePhotoUrl(photo, 128)).toBe('https://example.com/photo.jpg');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      date: '2026-11-15',
      count: 1,
    });
  });

  it('개발 환경에서는 할당량을 적용하지 않는다', async () => {
    jest.replaceProperty(env, 'IS_PRODUCTION', false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: '2026-11-14', count: 100 }));

    expect(await getGooglePlacePhotoUrl(photo, 128)).toBe('https://example.com/photo.jpg');
    expect(navigator.locks.request).not.toHaveBeenCalled();
  });

  it.each(['invalid json', '{}', '{"date":"2026-11-14","count":-1}'])(
    '손상된 사용량이면 사진을 요청하지 않는다: %s',
    async (value) => {
      localStorage.setItem(STORAGE_KEY, value);

      expect(await getGooglePlacePhotoUrl(photo, 128)).toBeNull();
      expect(getURI).not.toHaveBeenCalled();
    }
  );

  it.each(['getItem', 'setItem'] as const)('저장소 %s 실패 시 사진을 생략한다', async (method) => {
    jest.spyOn(Storage.prototype, method).mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(await getGooglePlacePhotoUrl(photo, 128)).toBeNull();
    expect(getURI).not.toHaveBeenCalled();
  });

  it('탭 간 잠금을 사용할 수 없으면 사진을 요청하지 않는다', async () => {
    Reflect.deleteProperty(navigator, 'locks');

    expect(await getGooglePlacePhotoUrl(photo, 128)).toBeNull();
    expect(getURI).not.toHaveBeenCalled();
  });

  it('사진 URL 생성에 실패해도 사용량을 되돌리지 않는다', async () => {
    getURI.mockImplementationOnce(() => {
      throw new Error('photo failed');
    });

    expect(await getGooglePlacePhotoUrl(photo, 128)).toBeNull();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).count).toBe(1);
  });
});
