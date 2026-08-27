import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { getPlaceVisits } from '@/features/shop/apis/clients';

import { usePlaceVisitsInfiniteQuery } from './usePlaceVisitsInfiniteQuery';

import type { PropsWithChildren } from 'react';

jest.mock('@/features/shop/apis/clients', () => ({
  getPlaceVisits: jest.fn(),
}));

const mockedGetPlaceVisits = jest.mocked(getPlaceVisits);

describe('usePlaceVisitsInfiniteQuery', () => {
  beforeEach(() => {
    mockedGetPlaceVisits.mockReset();
  });

  it('응답의 다음 커서를 다음 방문 기록 요청에 전달한다', async () => {
    mockedGetPlaceVisits
      .mockResolvedValueOnce({
        data: {
          visits: [{ visitedAt: '2026-08-23', amount: 23_000 }],
          hasNext: true,
          nextCursorPurchaseDate: '2026-08-23',
          nextCursorPurchaseTime: '12:30:00',
          nextCursorId: 7,
        },
      })
      .mockResolvedValueOnce({
        data: {
          visits: [{ visitedAt: '2026-08-21', amount: 18_000 }],
          hasNext: false,
        },
      });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => usePlaceVisitsInfiniteQuery(101), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGetPlaceVisits).toHaveBeenNthCalledWith(
      1,
      101,
      { size: 20 },
      undefined,
      expect.any(AbortSignal)
    );

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(mockedGetPlaceVisits).toHaveBeenNthCalledWith(
      2,
      101,
      {
        size: 20,
        cursorPurchaseDate: '2026-08-23',
        cursorPurchaseTime: '12:30:00',
        cursorId: 7,
      },
      undefined,
      expect.any(AbortSignal)
    );
  });
});
