import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { MOCK_MAP_STICKERS } from '../../mockData';
import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';
import { useShopRecommendationStore } from '../../stores/shopRecommendationStore';
import HomeCategoryFilter from '../home-overlay/HomeCategoryFilter';
import HomeBottomSheet from '../HomeBottomSheet';

import MapStickers from './MapStickers';

import type { PropsWithChildren } from 'react';

const moveCamera = jest.fn();
const panBy = jest.fn();

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
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
    useShopRecommendationStore.setState({
      activeRecommendationId: null,
      likedRecommendationIds: [],
    });
  });

  it('스티커를 선택하면 해당 좌표로 지도를 이동하고 70px로 확대한다', async () => {
    const user = userEvent.setup();
    render(<MapStickers />);

    const sticker = MOCK_MAP_STICKERS[0];
    const stickerButton = screen.getByRole('button', { name: `${sticker.label} 스티커` });
    const stickerImage = stickerButton.querySelector('img');

    expect(stickerImage).toHaveClass('size-12.5');

    await user.click(stickerButton);

    expect(moveCamera).toHaveBeenCalledWith({ center: sticker.position, zoom: 16 });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'selectedPlace',
      stickerId: sticker.id,
    });
    expect(stickerButton).toHaveAccessibleName(`${sticker.label} 스티커, 선택됨`);
    expect(stickerImage).toHaveClass('size-17.5');
  });

  it('다른 스티커를 선택하면 이전 스티커를 기본 크기로 되돌린다', async () => {
    const user = userEvent.setup();
    render(<MapStickers />);

    const firstSticker = screen.getByRole('button', {
      name: `${MOCK_MAP_STICKERS[0].label} 스티커`,
    });
    const secondSticker = screen.getByRole('button', {
      name: `${MOCK_MAP_STICKERS[1].label} 스티커`,
    });

    await user.click(firstSticker);
    await user.click(secondSticker);

    expect(firstSticker).toHaveAccessibleName(`${MOCK_MAP_STICKERS[0].label} 스티커`);
    expect(firstSticker.querySelector('img')).toHaveClass('size-12.5');
    expect(secondSticker).toHaveAccessibleName(`${MOCK_MAP_STICKERS[1].label} 스티커, 선택됨`);
    expect(secondSticker.querySelector('img')).toHaveClass('size-17.5');
  });

  it('스티커 클릭으로 홈 탭 시트를 해당 장소 상세 시트로 교체한다', async () => {
    const user = userEvent.setup();
    const sticker = MOCK_MAP_STICKERS[0];
    render(
      <MemoryRouter>
        <MapStickers />
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
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
    const sticker = MOCK_MAP_STICKERS[0];
    render(
      <MemoryRouter>
        <HomeCategoryFilter />
        <MapStickers />
        <HomeBottomSheet
          renderFrequentShops={(headerContent) => <div>{headerContent}</div>}
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
