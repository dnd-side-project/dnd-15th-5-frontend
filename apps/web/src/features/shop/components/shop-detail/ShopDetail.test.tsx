import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { usePlaceVisitsInfiniteQuery } from '@/features/shop/apis/hooks/usePlaceVisitsInfiniteQuery';
import { useGetPlaceDetail } from '@/features/shop/apis/queries';

import ShopDetail from './ShopDetail';

jest.mock('@/features/shop/apis/queries', () => ({
  useGetPlaceDetail: jest.fn(),
}));

jest.mock('@/features/shop/apis/hooks/usePlaceVisitsInfiniteQuery', () => ({
  usePlaceVisitsInfiniteQuery: jest.fn(),
}));

const mockedUseGetPlaceDetail = jest.mocked(useGetPlaceDetail);
const mockedUsePlaceVisitsInfiniteQuery = jest.mocked(usePlaceVisitsInfiniteQuery);

describe('ShopDetail', () => {
  beforeEach(() => {
    mockedUseGetPlaceDetail.mockReturnValue({
      data: {
        data: {
          placeId: 101,
          placeName: '투썸플레이스',
          category: '카페',
          address: '서울특별시 강남구 봉은사로 125 1층',
          isRegular: true,
          stats: {
            firstVisitedDate: '2026-08-01',
            monthlyVisitCount: 3,
            totalVisitCount: 8,
          },
          recentStickers: [
            { itemName: '감자튀김', receivedAt: '2026-08-23' },
            { itemName: '피자', receivedAt: '2026-08-21' },
          ],
        },
      },
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useGetPlaceDetail>);
    mockedUsePlaceVisitsInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          {
            data: {
              visits: [
                { visitedAt: '2026-08-23', amount: 23_000 },
                { visitedAt: '2026-08-21', amount: 18_000 },
              ],
              hasNext: false,
            },
          },
        ],
        pageParams: [{}],
      },
      isPending: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePlaceVisitsInfiniteQuery>);
  });

  it('매장 정보는 고정 영역에 두고 주소 아래를 방문 기록 스크롤 영역으로 표시한다', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 27));

    render(
      <MemoryRouter>
        <ShopDetail
          placeId={101}
          headerContent={<button type="button">뒤로 가기</button>}
          onViewOnMap={jest.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: '투썸플레이스' })).toBeInTheDocument();
    expect(screen.getByText('나의 단골')).toBeInTheDocument();
    expect(screen.getByText('카페')).toBeInTheDocument();
    expect(screen.getByText('|')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('서울특별시 강남구 봉은사로 125 1층')).toBeInTheDocument();

    const scrollRegion = screen.getByRole('region', { name: '방문 요약과 방문 기록' });
    expect(scrollRegion.closest('article')).toHaveClass('h-dvh');
    expect(scrollRegion).toHaveClass('overflow-y-auto', 'pb-safe-bottom');
    const visitTitle = within(scrollRegion).getByRole('heading', {
      name: '총 8번 방문하셨네요!',
    });
    const visitCount = visitTitle.querySelector('span');
    expect(visitCount).not.toBeNull();
    expect(visitCount).toHaveClass('text-primary-500');
    expect(within(scrollRegion).getByText('3주일 전')).toBeInTheDocument();
    expect(within(scrollRegion).getByText('8월 23일')).toBeInTheDocument();
    expect(within(scrollRegion).getByText('23,000원')).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('소비 기록 추가 링크를 제공하고 지도 버튼 동작을 바깥으로 전달한다', async () => {
    const user = userEvent.setup();
    const onViewOnMap = jest.fn();
    render(
      <MemoryRouter>
        <ShopDetail placeId={101} headerContent={null} onViewOnMap={onViewOnMap} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: '소비 기록 추가' })).toHaveAttribute('href', '/record');
    await user.click(screen.getByRole('button', { name: '지도에서 가게 보기' }));

    expect(onViewOnMap).toHaveBeenCalledTimes(1);
  });
});
