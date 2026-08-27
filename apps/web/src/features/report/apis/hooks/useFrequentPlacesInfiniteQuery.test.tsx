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
  beforeEach(() => {
    mockedGetFrequentPlaces.mockReset();
  });

  it('필터와 응답의 다음 커서를 요청에 전달하고 소비내역과 같은 캐시 정책을 사용한다', async () => {
    mockedGetFrequentPlaces
      .mockResolvedValueOnce({
        data: {
          places: [{ rank: 1, placeId: 31, placeName: '차곡 카페', visitCount: 5 }],
          hasNext: true,
          nextCursorVisitCount: 5,
          nextCursorPlaceId: 31,
          nextCursorRank: 1,
        },
      })
      .mockResolvedValueOnce({
        data: {
          places: [{ rank: 2, placeId: 18, placeName: '차곡 식당', visitCount: 4 }],
          hasNext: false,
        },
      });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const queryParams = {
      category: ['카페'],
      period: GetFrequentPlacesPeriod.ALL_TIME,
    };
    const { result } = renderHook(() => useFrequentPlacesInfiniteQuery(queryParams), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const frequentPlacesQuery = queryClient.getQueryCache().find({
      queryKey: ['/consumptions/places/rank', 'infinite', { ...queryParams, size: 15 }],
    });
    const cacheOptions = frequentPlacesQuery?.options as
      { gcTime?: number; refetchOnWindowFocus?: boolean; staleTime?: number } | undefined;

    expect(cacheOptions?.staleTime).toBe(10 * 60 * 1000);
    expect(cacheOptions?.gcTime).toBe(30 * 60 * 1000);
    expect(cacheOptions?.refetchOnWindowFocus).toBe(true);
    expect(mockedGetFrequentPlaces).toHaveBeenNthCalledWith(
      1,
      { category: ['카페'], period: GetFrequentPlacesPeriod.ALL_TIME, size: 15 },
      undefined,
      expect.any(AbortSignal)
    );

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(mockedGetFrequentPlaces).toHaveBeenNthCalledWith(
      2,
      {
        category: ['카페'],
        period: GetFrequentPlacesPeriod.ALL_TIME,
        size: 15,
        cursorVisitCount: 5,
        cursorPlaceId: 31,
        cursorRank: 1,
      },
      undefined,
      expect.any(AbortSignal)
    );
  });

  it('size를 지정하면 요청과 캐시 키에 해당 값을 사용한다', async () => {
    mockedGetFrequentPlaces.mockResolvedValueOnce({
      data: { places: [], hasNext: false },
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const queryParams = { period: GetFrequentPlacesPeriod.THIS_MONTH, size: 7 };
    const { result } = renderHook(() => useFrequentPlacesInfiniteQuery(queryParams), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedGetFrequentPlaces).toHaveBeenCalledWith(
      { period: GetFrequentPlacesPeriod.THIS_MONTH, size: 7 },
      undefined,
      expect.any(AbortSignal)
    );
    expect(
      queryClient.getQueryCache().find({
        queryKey: ['/consumptions/places/rank', 'infinite', queryParams],
      })
    ).toBeDefined();
  });
});
