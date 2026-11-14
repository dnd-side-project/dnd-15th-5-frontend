import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { getCurrentStatus, getStickerBoard } from '@/features/report/apis/clients';

import { useCurrentReportQuery } from './useCurrentReportQuery';

import type { PropsWithChildren } from 'react';

jest.mock('@/features/report/apis/clients', () => ({
  getCurrentStatus: jest.fn(),
  getStickerBoard: jest.fn(),
}));

const mockedGetCurrentStatus = jest.mocked(getCurrentStatus);

describe('useCurrentReportQuery', () => {
  beforeEach(() => {
    mockedGetCurrentStatus.mockReset();
    jest.mocked(getStickerBoard).mockReset();
    jest.mocked(getStickerBoard).mockResolvedValue({ data: { days: [] } });
  });

  it('최초 리포트 조회에 실패하면 화면 에러 상태를 반환한다', async () => {
    mockedGetCurrentStatus.mockRejectedValue(new Error('리포트 조회 실패'));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCurrentReportQuery(), { wrapper });

    await waitFor(() => expect(result.current.hasReportError).toBe(true));
    expect(result.current.data.monthlyCount).toBe(0);
  });

  const createWrapper = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it('스티커보드의 사진과 이모지를 메인 요약에 함께 표시하고 초과 개수를 계산한다', async () => {
    jest.mocked(getCurrentStatus).mockResolvedValue({
      data: { monthlyCount: 7 },
    });
    jest.mocked(getStickerBoard).mockResolvedValue({
      data: {
        days: [
          {
            date: '2026-11-01',
            visuals: [
              { stickerName: '커피' },
              ...Array.from({ length: 6 }, (_, index) => ({
                imageId: index + 1,
                imageUrl: `https://example.com/${index}.png`,
              })),
            ],
          },
        ],
      },
    });
    const { result } = renderHook(() => useCurrentReportQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.hasReportError).toBe(false);
    expect(result.current.data.monthlyStickerImages).toHaveLength(5);
    expect(result.current.data.monthlyStickerImages[1]).toBe('https://example.com/0.png');
    expect(result.current.data.monthlyAdditionalStickerCount).toBe(2);
    expect(result.current.data.monthlyCount).toBe(7);
  });

  it('스티커보드 조회 실패를 오류로 표시하고 재시도 시 두 API를 갱신한다', async () => {
    jest.mocked(getCurrentStatus).mockResolvedValue({ data: { monthlyCount: 1 } });
    jest.mocked(getStickerBoard).mockRejectedValue(new Error('사진 조회 실패'));
    const { result } = renderHook(() => useCurrentReportQuery(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.hasReportError).toBe(true));
    jest.mocked(getStickerBoard).mockResolvedValue({ data: { days: [] } });
    await result.current.refetch();
    await waitFor(() => expect(result.current.hasReportError).toBe(false));
    expect(getCurrentStatus).toHaveBeenCalledTimes(2);
    expect(getStickerBoard).toHaveBeenCalledTimes(2);
  });
});
