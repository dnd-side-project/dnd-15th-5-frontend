import { requestToNative } from '@/shared/lib/bridge';

import { assertNativeStickerBackground } from './nativeStickerCapabilities';

jest.mock('@/shared/lib/bridge', () => ({ requestToNative: jest.fn() }));
it.each([undefined, false])(
  '네이티브 기능이 없는 기존 앱은 바로 재빌드를 안내한다 (%s)',
  async (supported) => {
    jest.mocked(requestToNative).mockResolvedValueOnce({
      platform: 'ios',
      receivedAt: 0,
      nativeStickerBackground: supported,
    });
    await expect(assertNativeStickerBackground()).rejects.toThrow('새 개발 빌드');
  }
);
it('새 네이티브 모듈이 있는 앱은 통과한다', async () => {
  jest
    .mocked(requestToNative)
    .mockResolvedValueOnce({ platform: 'ios', receivedAt: 0, nativeStickerBackground: true });
  await expect(assertNativeStickerBackground()).resolves.toBeUndefined();
});
