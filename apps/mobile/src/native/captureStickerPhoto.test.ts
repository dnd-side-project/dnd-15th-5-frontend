import { Camera } from 'expo-camera';
import { router } from 'expo-router';

import {
  captureStickerPhoto,
  finishStickerCapture,
  isStickerCaptureActive,
} from './captureStickerPhoto';

jest.mock('expo-camera', () => ({ Camera: { requestCameraPermissionsAsync: jest.fn() } }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
const permission = jest.mocked(Camera.requestCameraPermissionsAsync);
const getCaptureId = () => {
  const route = jest.mocked(router.push).mock.calls[0][0];
  if (typeof route === 'string' || !route.params || typeof route.params.captureId !== 'string')
    throw new Error('촬영 요청 없음');
  return route.params.captureId;
};

beforeEach(() => {
  jest.clearAllMocks();
  permission.mockResolvedValue({ granted: true } as never);
});

it('권한 거부 시 화면을 열지 않는다', async () => {
  permission.mockResolvedValue({ granted: false } as never);
  await expect(captureStickerPhoto()).resolves.toEqual({ status: 'permissionDenied' });
  expect(router.push).not.toHaveBeenCalled();
});
it('전용 화면의 촬영 결과를 브릿지에 반환한다', async () => {
  const request = captureStickerPhoto();
  await Promise.resolve();
  const id = getCaptureId();
  expect(isStickerCaptureActive(id)).toBe(true);
  expect(router.push).toHaveBeenCalledWith({
    pathname: '/sticker-camera',
    params: { captureId: id },
  });
  finishStickerCapture(id, { status: 'success', base64: 'cGhvdG8=', mimeType: 'image/jpeg' });
  await expect(request).resolves.toMatchObject({ status: 'success' });
  expect(isStickerCaptureActive(id)).toBe(false);
});
it('중복 촬영 요청을 거절하고 닫으면 취소한다', async () => {
  const request = captureStickerPhoto();
  await Promise.resolve();
  await expect(captureStickerPhoto()).rejects.toThrow('이미');
  finishStickerCapture(getCaptureId(), { status: 'cancelled' });
  await expect(request).resolves.toEqual({ status: 'cancelled' });
});
it('이전 화면의 늦은 완료는 새 촬영을 완료시키지 않는다', async () => {
  const request = captureStickerPhoto();
  await Promise.resolve();
  const id = getCaptureId();
  finishStickerCapture('old-id', { status: 'cancelled' });
  expect(isStickerCaptureActive(id)).toBe(true);
  finishStickerCapture(id, { status: 'cancelled' });
  await request;
});
it('시간이 지나면 대기 요청을 해제한다', async () => {
  jest.useFakeTimers();
  const request = captureStickerPhoto();
  await Promise.resolve();
  jest.advanceTimersByTime(4 * 60_000);
  await expect(request).resolves.toEqual({ status: 'cancelled' });
  jest.useRealTimers();
});
