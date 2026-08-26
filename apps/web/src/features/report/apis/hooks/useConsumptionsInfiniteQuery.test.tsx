import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { getConsumptions } from '@/features/report/apis/clients';

import { useConsumptionsInfiniteQuery } from './useConsumptionsInfiniteQuery';

import type { PropsWithChildren } from 'react';

jest.mock('@/features/report/apis/clients', () => ({
  getConsumptions: jest.fn(),
}));

const mockedGetConsumptions = jest.mocked(getConsumptions);

describe('useConsumptionsInfiniteQuery', () => {
  beforeEach(() => {
    mockedGetConsumptions.mockReset();
  });

  it('선택한 월과 응답의 다음 커서를 소비내역 요청에 전달한다', async () => {
    mockedGetConsumptions
      .mockResolvedValueOnce({
        data: {
          consumptions: [{ id: 1, purchaseDate: '2026-08-23' }],
          hasNext: true,
          nextCursorPurchaseDate: '2026-08-23',
          nextCursorPurchaseTime: '12:30:00',
          nextCursorId: 7,
        },
      })
      .mockResolvedValueOnce({
        data: {
          consumptions: [{ id: 2, purchaseDate: '2026-08-21' }],
          hasNext: false,
        },
      });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useConsumptionsInfiniteQuery('2026-08'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const consumptionQuery = queryClient.getQueryCache().find({
      queryKey: ['/consumptions', 'infinite', { yearMonth: '2026-08' }],
    });
    const cacheOptions = consumptionQuery?.options as
      { gcTime?: number; staleTime?: number } | undefined;

    expect(cacheOptions?.staleTime).toBe(5 * 60 * 1000);
    expect(cacheOptions?.gcTime).toBe(30 * 60 * 1000);
    expect(mockedGetConsumptions).toHaveBeenNthCalledWith(
      1,
      { yearMonth: '2026-08', size: 15 },
      undefined,
      expect.any(AbortSignal)
    );

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(mockedGetConsumptions).toHaveBeenNthCalledWith(
      2,
      {
        yearMonth: '2026-08',
        size: 15,
        cursorPurchaseDate: '2026-08-23',
        cursorPurchaseTime: '12:30:00',
        cursorId: 7,
      },
      undefined,
      expect.any(AbortSignal)
    );
  });
});
