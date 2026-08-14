import { act, renderHook } from '@testing-library/react';

import { isNativeApp, requestToNative } from '@/shared/lib/bridge';

import { useOpenReceiptCamera } from './useOpenReceiptCamera';

jest.mock('@/shared/lib/bridge', () => ({
  isNativeApp: jest.fn(),
  requestToNative: jest.fn(),
}));

const mockIsNativeApp = jest.mocked(isNativeApp);
const mockRequestToNative = jest.mocked(requestToNative);

describe('useOpenReceiptCamera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('마운트되면 네이티브 카메라 화면을 여는 요청을 보낸다', async () => {
    mockIsNativeApp.mockReturnValue(true);
    mockRequestToNative.mockResolvedValue({ opened: true });

    const { result } = renderHook(() => useOpenReceiptCamera());

    await act(() => Promise.resolve());

    expect(mockRequestToNative).toHaveBeenCalledWith('captureReceipt', {});
    expect(result.current.state).toEqual({ status: 'opened' });
  });

  it('일반 브라우저에서는 네이티브 요청 없이 오류 상태가 된다', async () => {
    mockIsNativeApp.mockReturnValue(false);

    const { result } = renderHook(() => useOpenReceiptCamera());

    await act(() => Promise.resolve());

    expect(result.current.state).toEqual({
      status: 'error',
      message: '앱에서만 영수증을 촬영할 수 있습니다',
    });
    expect(mockRequestToNative).not.toHaveBeenCalled();
  });

  it('카메라 화면을 열지 못하면 오류 메시지를 상태에 담는다', async () => {
    mockIsNativeApp.mockReturnValue(true);
    mockRequestToNative.mockRejectedValue(new Error('카메라 권한이 필요합니다'));

    const { result } = renderHook(() => useOpenReceiptCamera());

    await act(() => Promise.resolve());

    expect(result.current.state).toEqual({
      status: 'error',
      message: '카메라 권한이 필요합니다',
    });
  });

  it('retry를 호출하면 요청을 다시 보낸다', async () => {
    mockIsNativeApp.mockReturnValue(true);
    mockRequestToNative.mockRejectedValue(new Error('카메라 권한이 필요합니다'));

    const { result } = renderHook(() => useOpenReceiptCamera());
    await act(() => Promise.resolve());

    mockRequestToNative.mockResolvedValue({ opened: true });
    await act(async () => {
      result.current.retry();
      await Promise.resolve();
    });

    expect(mockRequestToNative).toHaveBeenCalledTimes(2);
    expect(result.current.state).toEqual({ status: 'opened' });
  });
});
