import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MOCK_SHOP_RECOMMENDATIONS } from '../mockData';
import { useHomeBottomSheetStore } from '../stores/homeBottomSheetStore';
import { useShopRecommendationStore } from '../stores/shopRecommendationStore';

import RecommendationMapMarkers from './RecommendationMapMarkers';

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

describe('RecommendationMapMarkers', () => {
  beforeEach(() => {
    moveCamera.mockReset();
    panBy.mockReset();
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
    useShopRecommendationStore.setState({
      activeRecommendationId: null,
      likedRecommendationIds: [],
    });
  });

  it('캐러셀에서 선택했더라도 좋아요하지 않은 가게는 마커를 표시하지 않는다', () => {
    const recommendation = MOCK_SHOP_RECOMMENDATIONS[0];
    useHomeBottomSheetStore.getState().showRecommendation();
    useShopRecommendationStore.setState({ activeRecommendationId: recommendation.id });

    render(<RecommendationMapMarkers />);

    expect(
      screen.queryByRole('button', { name: `${recommendation.place.name} 추천 마커` })
    ).not.toBeInTheDocument();
    expect(moveCamera).toHaveBeenCalledWith({ center: recommendation.position, zoom: 15 });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it('좋아요 마커를 누르면 active 아이콘으로 바꾸고 선택한 가게를 공유한다', async () => {
    const user = userEvent.setup();
    const recommendation = MOCK_SHOP_RECOMMENDATIONS[1];
    useShopRecommendationStore.setState({ likedRecommendationIds: [recommendation.id] });

    render(<RecommendationMapMarkers />);

    const marker = screen.getByRole('button', {
      name: `${recommendation.place.name} 추천 마커`,
    });
    expect(marker.firstElementChild).toHaveClass('size-10');
    expect(marker.firstElementChild).not.toHaveClass('opacity-60');
    expect(marker.firstElementChild).toHaveAttribute('data-state', 'default');

    await user.click(marker);

    expect(moveCamera).toHaveBeenCalledWith({ center: recommendation.position, zoom: 15 });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
    expect(useShopRecommendationStore.getState().activeRecommendationId).toBe(recommendation.id);
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'likedRecommendation',
      recommendationId: recommendation.id,
    });
    expect(marker).toHaveAccessibleName(`${recommendation.place.name} 추천 마커, 선택됨`);
    expect(marker.firstElementChild).toHaveAttribute('data-state', 'active');
    expect(marker.firstElementChild).toHaveClass('size-11');
    expect(marker.firstElementChild).not.toHaveClass('opacity-100');
  });
});
