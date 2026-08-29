import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { useGetPlaceDetail } from '@/features/shop/apis/queries';
import {
  getRecordCategoryFromLocationState,
  getRecordShopFromLocationState,
} from '@/shared/utils/recordNavigation';

import SelectedPlaceSheet from './SelectedPlaceSheet';

jest.mock('@/features/shop/apis/queries');

const mockedUseGetPlaceDetail = jest.mocked(useGetPlaceDetail);
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

describe('SelectedPlaceSheet', () => {
  it('유효하지 않은 장소 ID에서는 로딩 대신 오류 안내를 표시한다', () => {
    mockedUseGetPlaceDetail.mockReturnValue({
      isPending: true,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useGetPlaceDetail>);

    render(
      <MemoryRouter>
        <SelectedPlaceSheet placeId="invalid" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: '가게 정보를 찾을 수 없어요' })).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: '가게 요약 불러오는 중' })).not.toBeInTheDocument();
  });

  it('장소 상세 응답으로 선택 장소 요약과 상호작용 가능한 최근 스티커를 표시한다', () => {
    mockedUseGetPlaceDetail.mockReturnValue({
      data: {
        data: {
          placeId: 101,
          placeName: '투썸플레이스',
          category: '카페',
          address: '서울특별시 강남구 봉은사로 125 1층',
          isRegular: true,
          recentStickers: [{ itemName: '커피' }],
        },
      },
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useGetPlaceDetail>);

    render(
      <MemoryRouter>
        <SelectedPlaceSheet placeId="101" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: '투썸플레이스' })).toBeInTheDocument();
    expect(screen.getByText('나의 단골')).toBeInTheDocument();
    expect(screen.getByText('서울특별시 강남구 봉은사로 125 1층')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1번째 스티커 붙이기' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '상세보기' })).toHaveAttribute(
      'href',
      '/home/shop/101'
    );
  });

  it('+ 버튼으로 이동할 때 지도 좌표와 최신 매장 상세 정보를 기록 화면에 전달한다', async () => {
    const user = userEvent.setup();
    mockedUseGetPlaceDetail.mockReturnValue({
      data: {
        data: {
          placeId: 101,
          placeName: '투썸플레이스',
          category: '카페',
          address: '서울특별시 강남구 봉은사로 125 1층',
        },
      },
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useGetPlaceDetail>);

    render(
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route
            path="/home"
            element={<SelectedPlaceSheet placeId="101" recordShop={recordShop} />}
          />
          <Route path="/record" element={<RecordLocationProbe />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('link', { name: '투썸플레이스 소비 기록 추가' }));

    expect(
      screen.getByText('ChIJ-twosome-101|투썸플레이스|서울특별시 강남구 봉은사로 125 1층|카페')
    ).toBeInTheDocument();
  });
});
