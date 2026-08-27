import { act, renderHook } from '@testing-library/react';
import { domToBlob } from 'modern-screenshot';

import { isNativeApp, requestToNative } from '@/shared/lib/bridge';
import { useToast } from '@/shared/ui/toast';

import { useReportImageDownload } from './useReportImageDownload';

jest.mock('modern-screenshot', () => ({ domToBlob: jest.fn() }));
jest.mock('@/shared/lib/bridge', () => ({
  isNativeApp: jest.fn(),
  requestToNative: jest.fn(),
}));
jest.mock('@/shared/ui/toast', () => ({ useToast: jest.fn() }));

const mockDomToBlob = jest.mocked(domToBlob);
const mockIsNativeApp = jest.mocked(isNativeApp);
const mockRequestToNative = jest.mocked(requestToNative);
const mockUseToast = jest.mocked(useToast);
const mockCreateObjectUrl = jest.fn(() => 'blob:report-image');
const mockRevokeObjectUrl = jest.fn();
const mockShowToast = jest.fn();

const renderDownloadHook = () => {
  const hook = renderHook(() => useReportImageDownload('리포트.png'));
  hook.result.current.captureRef.current = document.createElement('div');

  return hook;
};

describe('useReportImageDownload', () => {
  beforeAll(() => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: mockCreateObjectUrl,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: mockRevokeObjectUrl,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockDomToBlob.mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
    mockIsNativeApp.mockReturnValue(false);
    mockRequestToNative.mockResolvedValue({ saved: true });
    mockUseToast.mockReturnValue({ showToast: mockShowToast } as never);
  });

  it('일반 브라우저에서는 캡처한 PNG를 파일로 다운로드한다', async () => {
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation();
    const { result } = renderDownloadHook();

    await act(() => result.current.downloadImage());

    expect(mockDomToBlob).toHaveBeenCalledWith(result.current.captureRef.current, { scale: 2 });
    expect(mockCreateObjectUrl).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(mockRequestToNative).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith({
      message: '이미지가 저장되었어요.',
      type: 'success',
    });
    clickSpy.mockRestore();
  });

  it('앱 WebView에서는 PNG를 Base64로 변환해 네이티브 저장을 요청한다', async () => {
    mockIsNativeApp.mockReturnValue(true);
    const { result } = renderDownloadHook();

    await act(() => result.current.downloadImage());

    expect(mockRequestToNative).toHaveBeenCalledWith('saveImage', {
      base64: 'cG5n',
      fileName: '리포트.png',
    });
    expect(mockCreateObjectUrl).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith({
      message: '이미지가 저장되었어요.',
      type: 'success',
    });
  });

  it('이미지 생성에 실패하면 오류 상태를 설정하고 진행 상태를 해제한다', async () => {
    mockDomToBlob.mockRejectedValue(new Error('캡처 실패'));
    const { result } = renderDownloadHook();

    await act(() => result.current.downloadImage());

    expect(result.current.hasDownloadError).toBe(true);
    expect(result.current.isDownloading).toBe(false);
    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it('네이티브 사진 저장에 실패하면 오류 상태를 설정한다', async () => {
    mockIsNativeApp.mockReturnValue(true);
    mockRequestToNative.mockRejectedValue(new Error('사진 저장 권한이 필요합니다'));
    const { result } = renderDownloadHook();

    await act(() => result.current.downloadImage());

    expect(result.current.hasDownloadError).toBe(true);
    expect(result.current.isDownloading).toBe(false);
    expect(mockShowToast).not.toHaveBeenCalled();
  });
});
