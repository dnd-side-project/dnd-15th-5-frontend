import { Camera } from 'expo-camera';
import { router } from 'expo-router';

import { finishReceiptScan, isReceiptScanActive, scanReceipt } from './scanReceipt';

jest.mock('expo-camera', () => ({ Camera: { requestCameraPermissionsAsync: jest.fn() } }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
const getId = () => {
  const target = jest.mocked(router.push).mock.calls[0][0];
  if (
    typeof target !== 'object' ||
    !('params' in target) ||
    !target.params ||
    !('scanId' in target.params) ||
    typeof target.params.scanId !== 'string'
  )
    throw new Error('영수증 카메라 요청 ID가 없습니다.');
  return target.params.scanId;
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(Camera.requestCameraPermissionsAsync).mockResolvedValue({ granted: true } as never);
});
it('영수증 카메라에 요청 ID를 전달하고 인식 결과를 반환한다', async () => {
  const request = scanReceipt();
  await Promise.resolve();
  const id = getId();
  expect(router.push).toHaveBeenCalledWith({ pathname: '/camera', params: { scanId: id } });
  const receipt = {
    receiptImageId: 15,
    purchaseDate: null,
    purchaseTime: null,
    amount: 33000,
    shop: null,
  };
  finishReceiptScan(id, { status: 'success', receipt });
  await expect(request).resolves.toEqual({ status: 'success', receipt });
  expect(isReceiptScanActive(id)).toBe(false);
});
it('중복 요청과 이전 요청의 늦은 결과를 차단한다', async () => {
  const request = scanReceipt();
  await Promise.resolve();
  const id = getId();
  await expect(scanReceipt()).rejects.toThrow('이미');
  finishReceiptScan('old-id', { status: 'cancelled' });
  expect(isReceiptScanActive(id)).toBe(true);
  finishReceiptScan(id, { status: 'cancelled' });
  await expect(request).resolves.toEqual({ status: 'cancelled' });
});
it('권한 거부는 카메라를 열지 않고 반환한다', async () => {
  jest.mocked(Camera.requestCameraPermissionsAsync).mockResolvedValue({ granted: false } as never);
  await expect(scanReceipt()).resolves.toEqual({ status: 'permissionDenied' });
  expect(router.push).not.toHaveBeenCalled();
});
it('시간이 지나면 요청을 취소하고 새 촬영을 허용한다', async () => {
  jest.useFakeTimers();
  const request = scanReceipt();
  await Promise.resolve();
  jest.advanceTimersByTime(4 * 60_000);
  await expect(request).resolves.toEqual({ status: 'cancelled' });
  expect(isReceiptScanActive(getId())).toBe(false);
  jest.useRealTimers();
});
