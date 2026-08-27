import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useGetPlaceDetail } from '@/features/shop/apis/queries';

import SelectedPlaceSheet from './SelectedPlaceSheet';

jest.mock('@/features/shop/apis/queries');

const mockedUseGetPlaceDetail = jest.mocked(useGetPlaceDetail);

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

  it('장소 상세 응답으로 선택 장소 요약과 이동 링크를 표시한다', () => {
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
    expect(screen.getByRole('link', { name: '상세보기' })).toHaveAttribute(
      'href',
      '/home/shop/101'
    );
  });
});
