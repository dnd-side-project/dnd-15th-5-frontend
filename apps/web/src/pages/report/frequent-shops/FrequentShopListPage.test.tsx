import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { GetFrequentPlacesPeriod } from '@/features/report/apis/dto';
import { useFrequentPlacesInfiniteQuery } from '@/features/report/apis/hooks/useFrequentPlacesInfiniteQuery';

import FrequentShopListPage from './FrequentShopListPage';

jest.mock('@/features/report/apis/hooks/useFrequentPlacesInfiniteQuery', () => ({
  useFrequentPlacesInfiniteQuery: jest.fn(),
}));

const mockedUseFrequentPlacesInfiniteQuery = jest.mocked(useFrequentPlacesInfiniteQuery);

function LocationSearch() {
  const { search } = useLocation();

  return <output aria-label="현재 검색 파라미터">{search}</output>;
}

describe('<FrequentShopListPage />', () => {
  beforeEach(() => {
    mockedUseFrequentPlacesInfiniteQuery.mockReturnValue({
      data: undefined,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isError: false,
      isFetchNextPageError: false,
      isFetchingNextPage: false,
      isPending: true,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useFrequentPlacesInfiniteQuery>);
  });

  it('기간 필터를 변경하면 현재 URL과 조회 기간을 갱신하고 뒤로 가기는 이전 페이지로 이동한다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter
        initialEntries={['/report', '/report/frequent-shops?period=all']}
        initialIndex={1}
      >
        <Routes>
          <Route path="/report" element={<div>리포트 페이지</div>} />
          <Route
            path="/report/frequent-shops"
            element={
              <>
                <FrequentShopListPage />
                <LocationSearch />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(mockedUseFrequentPlacesInfiniteQuery).toHaveBeenLastCalledWith({
      category: undefined,
      period: GetFrequentPlacesPeriod.ALL_TIME,
    });

    await user.click(screen.getByRole('button', { name: '기간 필터' }));
    await user.click(screen.getByRole('button', { name: '이번달' }));

    expect(screen.getByRole('status', { name: '현재 검색 파라미터' })).toHaveTextContent(
      '?period=currentMonth'
    );
    expect(mockedUseFrequentPlacesInfiniteQuery).toHaveBeenLastCalledWith({
      category: undefined,
      period: GetFrequentPlacesPeriod.THIS_MONTH,
    });

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen.getByText('리포트 페이지')).toBeInTheDocument();
  });
});
