import { act, renderHook } from '@testing-library/react';

import { useIssueShareLink } from '@/features/report/apis/mutations';
import { captureReportImageBlob, createImageFileList } from '@/features/report/utils/reportImage';
import { getKakaoSdk } from '@/shared/lib/kakao';
import { useToast } from '@/shared/ui/toast';

import { useKakaoReportShare } from './useKakaoReportShare';

jest.mock('@/features/report/apis/mutations', () => ({ useIssueShareLink: jest.fn() }));
jest.mock('@/features/report/utils/reportImage', () => ({
  captureReportImageBlob: jest.fn(),
  createImageFileList: jest.fn(),
}));
jest.mock('@/shared/lib/kakao', () => ({
  getKakaoSdk: jest.fn(),
  isKakaoShareCancelled: (error: unknown) =>
    error instanceof Error && error.message.includes('cancel'),
}));
jest.mock('@/shared/ui/toast', () => ({ useToast: jest.fn() }));

const mockedUseIssueShareLink = jest.mocked(useIssueShareLink);
const mockedCaptureReportImageBlob = jest.mocked(captureReportImageBlob);
const mockedCreateImageFileList = jest.mocked(createImageFileList);
const mockedGetKakaoSdk = jest.mocked(getKakaoSdk);
const mockedUseToast = jest.mocked(useToast);

describe('useKakaoReportShare', () => {
  const mutateAsync = jest.fn();
  const sendDefault = jest.fn();
  const uploadImage = jest.fn();
  const showToast = jest.fn();
  const captureRef = { current: document.createElement('div') };
  const imageBlob = new Blob(['image'], { type: 'image/png' });
  const imageFiles = {} as FileList;

  beforeEach(() => {
    mutateAsync.mockReset();
    sendDefault.mockReset();
    uploadImage.mockReset();
    showToast.mockReset();
    mockedUseIssueShareLink.mockReturnValue({ mutateAsync } as never);
    mockedCaptureReportImageBlob.mockResolvedValue(imageBlob);
    mockedCreateImageFileList.mockReturnValue(imageFiles);
    uploadImage.mockResolvedValue({
      infos: { original: { height: 750, url: 'https://kakao.example.com/card.png', width: 540 } },
    });
    mockedGetKakaoSdk.mockReturnValue({ Share: { sendDefault, uploadImage } } as never);
    mockedUseToast.mockReturnValue({ showToast } as never);
  });

  it('발급한 토큰과 선택 월로 공유 페이지 URL을 만들어 Kakao에 전달한다', async () => {
    mutateAsync.mockResolvedValue({ data: { shareToken: 'share-token' } });
    sendDefault.mockResolvedValue(undefined);
    const onShared = jest.fn();
    const { result } = renderHook(() =>
      useKakaoReportShare({
        captureRef,
        nickname: '이앤더',
        onShared,
        selectedMonth: { year: 2026, month: 8 },
      })
    );

    await act(() => result.current.shareToKakao());

    expect(mutateAsync).toHaveBeenCalledWith({ params: { yearMonth: '2026-08' } });
    expect(mockedCaptureReportImageBlob).toHaveBeenCalledWith(captureRef.current);
    expect(uploadImage).toHaveBeenCalledWith({ file: imageFiles });
    expect(sendDefault).toHaveBeenCalledWith({
      objectType: 'feed',
      content: {
        title: '자주 가는 곳들이 이앤더님을 설명한다면? 👀',
        description: '8월의 방문 기록이 찾아낸 결과를 확인해보세요.',
        imageUrl: 'https://kakao.example.com/card.png',
        imageWidth: 540,
        imageHeight: 750,
        link: {
          mobileWebUrl: 'http://localhost/share/share-token?yearMonth=2026-08',
          webUrl: 'http://localhost/share/share-token?yearMonth=2026-08',
        },
      },
      buttonTitle: '취향 해설 보기',
    });
    expect(onShared).toHaveBeenCalledTimes(1);
  });

  it('공유 취소에는 오류 토스트를 표시하지 않는다', async () => {
    mutateAsync.mockResolvedValue({ data: { shareToken: 'share-token' } });
    sendDefault.mockRejectedValue(new Error('cancel'));
    const { result } = renderHook(() =>
      useKakaoReportShare({
        captureRef,
        nickname: '이앤더',
        selectedMonth: { year: 2026, month: 8 },
      })
    );

    await act(() => result.current.shareToKakao());

    expect(showToast).not.toHaveBeenCalled();
  });

  it('링크 발급이나 SDK 호출 실패를 오류 토스트로 안내한다', async () => {
    mutateAsync.mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() =>
      useKakaoReportShare({
        captureRef,
        nickname: '이앤더',
        selectedMonth: { year: 2026, month: 8 },
      })
    );

    await act(() => result.current.shareToKakao());

    expect(showToast).toHaveBeenCalledWith({
      message: '카카오톡 공유에 실패했어요. 다시 시도해 주세요.',
      type: 'error',
    });
  });
});
