import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useNearbyPlaceRecommendationsQuery } from '../../apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useTogglePlaceLikeMutation } from '../../apis/hooks/useTogglePlaceLikeMutation';
import { useVisitedPlaceStickersQuery } from '../../apis/hooks/useVisitedPlaceStickersQuery';
import { mockGoogleMapsIdleEvent } from '../../googleMapsEventMock';
import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';
import { useMapCategoryFilterStore } from '../../stores/mapCategoryFilterStore';
import { useShopRecommendationStore } from '../../stores/shopRecommendationStore';
import { TEST_MAP_STICKERS, TEST_SHOP_RECOMMENDATIONS } from '../../testFixtures';
import HomeCategoryFilter from '../home-overlay/HomeCategoryFilter';
import HomeBottomSheet from '../HomeBottomSheet';

import MapStickers from './MapStickers';

import type { PropsWithChildren } from 'react';

const moveCamera = jest.fn();
const panBy = jest.fn();

jest.mock('../../apis/hooks/useNearbyPlaceRecommendationsQuery');
jest.mock('../../apis/hooks/useVisitedPlaceStickersQuery');
jest.mock('../../apis/hooks/useTogglePlaceLikeMutation');

const mockedUseNearbyPlaceRecommendationsQuery = jest.mocked(useNearbyPlaceRecommendationsQuery);
const mockedUseVisitedPlaceStickersQuery = jest.mocked(useVisitedPlaceStickersQuery);
const mockedUseTogglePlaceLikeMutation = jest.mocked(useTogglePlaceLikeMutation);

jest.mock('@vis.gl/react-google-maps', () => ({
  AdvancedMarker: ({
    children,
    onClick,
    title,
  }: PropsWithChildren<{ onClick?: () => void; title?: string }>) => (
    <button type="button" aria-label={title} onClick={onClick}>
      {children}
    </button>
  ),
  useMap: () => ({ moveCamera, panBy }),
}));

describe('MapStickers', () => {
  beforeEach(() => {
    moveCamera.mockReset();
    panBy.mockReset();
    mockGoogleMapsIdleEvent();
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
    useMapCategoryFilterStore.setState({ selectedCategory: null });
    useShopRecommendationStore.setState({
      activeRecommendationId: null,
    });
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      stickers: TEST_MAP_STICKERS,
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
    mockedUseNearbyPlaceRecommendationsQuery.mockReturnValue({
      recommendations: TEST_SHOP_RECOMMENDATIONS,
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    mockedUseTogglePlaceLikeMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useTogglePlaceLikeMutation>);
  });

  it('카테고리를 선택하면 관련된 지도 스티커만 표시한다', async () => {
    const user = userEvent.setup();
    const cafeSticker = TEST_MAP_STICKERS.find(({ place }) => place.category === '카페');
    const hobbySticker = TEST_MAP_STICKERS.find(({ place }) => place.category === '취미/놀거리');
    expect(cafeSticker).toBeDefined();
    expect(hobbySticker).toBeDefined();

    render(
      <>
        <HomeCategoryFilter />
        <MapStickers />
      </>
    );

    expect(
      screen.getByRole('button', { name: `${cafeSticker?.label} 스티커` })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `${hobbySticker?.label} 스티커` })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '카페' }));

    expect(
      screen.getByRole('button', { name: `${cafeSticker?.label} 스티커` })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: `${hobbySticker?.label} 스티커` })
    ).not.toBeInTheDocument();
  });

  it('스티커를 선택하면 해당 좌표로 지도를 이동하고 70px로 확대한다', async () => {
    const user = userEvent.setup();
    render(<MapStickers />);

    const sticker = TEST_MAP_STICKERS[0]!;
    const stickerButton = screen.getByRole('button', { name: `${sticker.label} 스티커` });
    const stickerImage = stickerButton.querySelector('img');

    expect(stickerImage).toHaveClass('size-17.5', 'scale-[0.7143]');

    await user.click(stickerButton);

    expect(moveCamera).toHaveBeenCalledWith({ center: sticker.position, zoom: 16 });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'selectedPlace',
      stickerId: sticker.id,
    });
    expect(stickerButton).toHaveAccessibleName(`${sticker.label} 스티커, 선택됨`);
    expect(stickerImage).toHaveClass('size-17.5', 'scale-100');
  });

  it('다른 스티커를 선택하면 이전 스티커를 기본 크기로 되돌린다', async () => {
    const user = userEvent.setup();
    render(<MapStickers />);

    const firstSticker = screen.getByRole('button', {
      name: `${TEST_MAP_STICKERS[0]!.label} 스티커`,
    });
    const secondSticker = screen.getByRole('button', {
      name: `${TEST_MAP_STICKERS[1]!.label} 스티커`,
    });

    await user.click(firstSticker);
    await user.click(secondSticker);

    expect(firstSticker).toHaveAccessibleName(`${TEST_MAP_STICKERS[0]!.label} 스티커`);
    expect(firstSticker.querySelector('img')).toHaveClass('scale-[0.7143]');
    expect(secondSticker).toHaveAccessibleName(`${TEST_MAP_STICKERS[1]!.label} 스티커, 선택됨`);
    expect(secondSticker.querySelector('img')).toHaveClass('scale-100');
  });

  it('스티커 클릭으로 홈 탭 시트를 해당 장소 상세 시트로 교체한다', async () => {
    const user = userEvent.setup();
    const sticker = TEST_MAP_STICKERS[0]!;
    render(
      <MemoryRouter>
        <MapStickers />
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
          renderSelectedPlace={() => <h2>{sticker.place.name}</h2>}
          renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: '자주 소비한 곳' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: `${sticker.label} 스티커` }));

    expect(screen.getByRole('heading', { name: sticker.place.name })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '자주 소비한 곳' })).not.toBeInTheDocument();
  });

  it('추천 시트가 열려 있어도 스티커를 누르면 추천 칩을 해제하고 장소 상세 시트 하나만 표시한다', async () => {
    const user = userEvent.setup();
    const sticker = TEST_MAP_STICKERS[0]!;
    render(
      <MemoryRouter>
        <HomeCategoryFilter />
        <MapStickers />
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
          renderSelectedPlace={() => <h2>{sticker.place.name}</h2>}
          renderSpendingHistory={(headerContent) => <div>{headerContent}</div>}
        />
      </MemoryRouter>
    );

    const recommendationChip = screen.getByRole('button', { name: '가게 추천' });
    await user.click(recommendationChip);

    expect(recommendationChip).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { level: 1, name: '가게 추천' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: `${sticker.label} 스티커` }));

    expect(recommendationChip).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('heading', { level: 1, name: '가게 추천' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: sticker.place.name })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '바텀시트 높이 조절' })).toHaveLength(1);
  });
});
