import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { usePlaceVisitsInfiniteQuery } from '@/features/shop/apis/hooks/usePlaceVisitsInfiniteQuery';
import { useGetPlaceDetail } from '@/features/shop/apis/queries';
import {
  getRecordCategoryFromLocationState,
  getRecordShopFromLocationState,
} from '@/shared/utils/recordNavigation';

import ShopDetail from './ShopDetail';

jest.mock('@/features/shop/apis/queries', () => ({
  useGetPlaceDetail: jest.fn(),
}));

jest.mock('@/features/shop/apis/hooks/usePlaceVisitsInfiniteQuery', () => ({
  usePlaceVisitsInfiniteQuery: jest.fn(),
}));

const mockedUseGetPlaceDetail = jest.mocked(useGetPlaceDetail);
const mockedUsePlaceVisitsInfiniteQuery = jest.mocked(usePlaceVisitsInfiniteQuery);
const recordShop = {
  id: 'ChIJ-twosome-101',
  name: '지도 마커의 가게명',
  address: '',
  photoUrl: null,
  latitude: 37.506481,
  longitude: 127.024551,
};

function RecordLocationProbe() {
  const location = useLocation();
  const shop = getRecordShopFromLocationState(location.state);
  const category = getRecordCategoryFromLocationState(location.state);

  return <p>{shop ? `${shop.id}|${shop.name}|${shop.address}|${category}` : '선택 가게 없음'}</p>;
}

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
            { itemName: '커피', receivedAt: '2026-08-19' },
            { itemName: '도넛', receivedAt: '2026-08-17' },
            { itemName: '다트', receivedAt: '2026-08-15' },
          ],
          stickerSummary: [
            { itemName: '눈', count: 3 },
            { itemName: '따봉', count: 2 },
            { itemName: '왕관', count: 1 },
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

  afterEach(() => {
    jest.useRealTimers();
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
  });

  it('소비 기록 추가 링크를 제공하고 지도 버튼 동작을 바깥으로 전달한다', async () => {
    const user = userEvent.setup();
    const onViewOnMap = jest.fn();
    render(
      <MemoryRouter initialEntries={['/home/shop/101']}>
        <Routes>
          <Route
            path="/home/shop/:shopId"
            element={
              <ShopDetail
                placeId={101}
                recordShop={recordShop}
                headerContent={null}
                onViewOnMap={onViewOnMap}
              />
            }
          />
          <Route path="/record" element={<RecordLocationProbe />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: '소비 기록 추가' })).toHaveAttribute('href', '/record');
    await user.click(screen.getByRole('button', { name: '지도에서 가게 보기' }));

    expect(onViewOnMap).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('link', { name: '소비 기록 추가' }));
    expect(
      screen.getByText('ChIJ-twosome-101|투썸플레이스|서울특별시 강남구 봉은사로 125 1층|카페')
    ).toBeInTheDocument();
  });

  it('불러오는 동안 뒤로 가기 버튼과 함께 레이아웃을 닮은 스켈레톤을 보여준다', () => {
    mockedUseGetPlaceDetail.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useGetPlaceDetail>);

    render(
      <MemoryRouter>
        <ShopDetail
          placeId={101}
          headerContent={<button type="button">뒤로 가기</button>}
          onViewOnMap={jest.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('status', { name: '가게 상세 불러오는 중' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '뒤로 가기' })).toBeInTheDocument();
  });

  it('최근 5개 대신 summary에 집계된 스티커를 개수만큼 모두 표시한다', () => {
    render(
      <MemoryRouter>
        <ShopDetail placeId={101} headerContent={null} onViewOnMap={jest.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('획득한 스티커').querySelectorAll('img')).toHaveLength(6);
  });
});
