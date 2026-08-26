import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { getFrequentPlaces } from '@/features/report/apis/clients';
import { GetFrequentPlacesPeriod } from '@/features/report/apis/dto';

import { useFrequentPlacesInfiniteQuery } from './useFrequentPlacesInfiniteQuery';

import type { PropsWithChildren } from 'react';

jest.mock('@/features/report/apis/clients', () => ({
  getFrequentPlaces: jest.fn(),
}));

const mockedGetFrequentPlaces = jest.mocked(getFrequentPlaces);

describe('useFrequentPlacesInfiniteQuery', () => {
  it('기간·카테고리와 다음 순위 커서를 함께 전달한다', async () => {
    mockedGetFrequentPlaces
      .mockResolvedValueOnce({
        data: {
          places: [],
          hasNext: true,
          nextCursorVisitCount: 7,
          nextCursorPlaceId: 101,
          nextCursorRank: 8,
        },
      })
      .mockResolvedValueOnce({ data: { places: [], hasNext: false } });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const filter = {
      period: GetFrequentPlacesPeriod.THIS_MONTH,
      category: ['카페'],
    };
    const { result } = renderHook(() => useFrequentPlacesInfiniteQuery(filter), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGetFrequentPlaces).toHaveBeenNthCalledWith(
      1,
      { ...filter, size: 20 },
      undefined,
      expect.any(AbortSignal)
    );

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(mockedGetFrequentPlaces).toHaveBeenNthCalledWith(
      2,
      {
        ...filter,
        size: 20,
        cursorVisitCount: 7,
        cursorPlaceId: 101,
        cursorRank: 8,
      },
      undefined,
      expect.any(AbortSignal)
    );
  });
});
