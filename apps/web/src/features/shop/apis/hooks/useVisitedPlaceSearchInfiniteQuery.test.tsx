import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { searchVisitedPlaces } from '@/features/shop/apis/clients';

import { useVisitedPlaceSearchInfiniteQuery } from './useVisitedPlaceSearchInfiniteQuery';

import type { PropsWithChildren } from 'react';

jest.mock('@/features/shop/apis/clients', () => ({
  searchVisitedPlaces: jest.fn(),
}));

const mockedSearchVisitedPlaces = jest.mocked(searchVisitedPlaces);

describe('useVisitedPlaceSearchInfiniteQuery', () => {
  it('다음 검색 커서를 같은 키워드 요청에 전달한다', async () => {
    mockedSearchVisitedPlaces
      .mockResolvedValueOnce({ data: { places: [], hasNext: true, nextCursor: 'next-place' } })
      .mockResolvedValueOnce({ data: { places: [], hasNext: false, nextCursor: null } });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useVisitedPlaceSearchInfiniteQuery(' 투썸 '), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedSearchVisitedPlaces).toHaveBeenNthCalledWith(
      1,
      { keyword: '투썸', cursor: undefined, size: 5 },
      undefined,
      expect.any(AbortSignal)
    );

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(mockedSearchVisitedPlaces).toHaveBeenNthCalledWith(
      2,
      { keyword: '투썸', cursor: 'next-place', size: 5 },
      undefined,
      expect.any(AbortSignal)
    );
  });
});
