import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useNearbyPlaceRecommendationsQuery } from '../apis/hooks/useNearbyPlaceRecommendationsQuery';
import { mockGoogleMapsIdleEvent } from '../googleMapsEventMock';
import { useHomeBottomSheetStore } from '../stores/homeBottomSheetStore';
import { useShopRecommendationStore } from '../stores/shopRecommendationStore';
import { TEST_SHOP_RECOMMENDATIONS } from '../testFixtures';
import { getFocusedMarkerVerticalOffset } from '../utils/focusMapOnPosition';

import RecommendationMapMarkers from './RecommendationMapMarkers';

import type { PropsWithChildren, SVGProps } from 'react';

const moveCamera = jest.fn();
const panBy = jest.fn();

jest.mock('../apis/hooks/useNearbyPlaceRecommendationsQuery');

jest.mock('@/shared/assets/icons', () => ({
  CafePinActiveIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="cafe-active" {...props} />
  ),
  CafePinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="cafe-default" {...props} />
  ),
  HobbyPinActiveIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="hobby-active" {...props} />
  ),
  HobbyPinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="hobby-default" {...props} />
  ),
  LikePinActiveIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="like-active" {...props} />
  ),
  LikePinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="like-default" {...props} />
  ),
  RestaurantPinActiveIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="restaurant-active" {...props} />
  ),
  RestaurantPinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="restaurant-default" {...props} />
  ),
}));

const mockedUseNearbyPlaceRecommendationsQuery = jest.mocked(useNearbyPlaceRecommendationsQuery);

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
    mockGoogleMapsIdleEvent();
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
    useShopRecommendationStore.setState({
      activeRecommendationId: null,
    });
    mockedUseNearbyPlaceRecommendationsQuery.mockReturnValue({
      recommendations: TEST_SHOP_RECOMMENDATIONS,
    } as unknown as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
  });

  it('좋아요하지 않은 추천 가게는 지원하는 카테고리만 마커를 표시한다', () => {
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    const restaurantRecommendation = {
      ...recommendation,
      id: 'restaurant-recommendation',
      place: {
        ...recommendation.place,
        id: 'restaurant-place',
        name: '추천 음식점',
        category: '음식점' as const,
      },
    };
    const unsupportedRecommendation = {
      ...recommendation,
      id: 'unsupported-recommendation',
      place: {
        ...recommendation.place,
        id: 'unsupported-place',
        name: '추천 운동 시설',
        category: '운동' as const,
      },
    };
    mockedUseNearbyPlaceRecommendationsQuery.mockReturnValue({
      recommendations: [
        ...TEST_SHOP_RECOMMENDATIONS,
        restaurantRecommendation,
        unsupportedRecommendation,
      ],
    } as unknown as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    useHomeBottomSheetStore.getState().showRecommendation();

    render(<RecommendationMapMarkers />);

    expect(
      screen.getByRole('button', { name: `${recommendation.place.name} 추천 마커` })
        .firstElementChild
    ).toHaveAttribute('data-marker-icon', 'cafe-default');
    expect(
      screen.getByRole('button', { name: '추천 음식점 추천 마커' }).firstElementChild
    ).toHaveAttribute('data-marker-icon', 'restaurant-default');
    expect(
      screen.getByRole('button', { name: '플레이 다트펍 3 추천 마커' }).firstElementChild
    ).toHaveAttribute('data-marker-icon', 'hobby-default');
    expect(
      screen.getByRole('button', { name: '플레이 다트펍 추천 마커' }).firstElementChild
    ).toHaveAttribute('data-marker-icon', 'like-default');
    expect(
      screen.queryByRole('button', { name: '추천 운동 시설 추천 마커' })
    ).not.toBeInTheDocument();
  });

  it('가게 추천 탭을 활성화하지 않으면 추천 마커를 표시하지 않는다', () => {
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;

    render(<RecommendationMapMarkers />);

    expect(
      screen.queryByRole('button', { name: `${recommendation.place.name} 추천 마커` })
    ).not.toBeInTheDocument();
  });

  it('추천 캐러셀에서 선택한 가게를 활성 카테고리 핀으로 표시한다', () => {
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    useHomeBottomSheetStore.getState().showRecommendation();
    useShopRecommendationStore.setState({ activeRecommendationId: recommendation.id });

    render(<RecommendationMapMarkers />);

    const marker = screen.getByRole('button', {
      name: `${recommendation.place.name} 추천 마커, 선택됨`,
    });
    expect(marker.firstElementChild).toHaveAttribute('data-marker-icon', 'cafe-active');
    expect(marker.firstElementChild).toHaveClass('h-18', 'w-14');
    expect(marker.firstElementChild).toHaveAttribute('data-state', 'active');
    expect(moveCamera).toHaveBeenCalledWith({ center: recommendation.position, zoom: 15 });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it('지도 이동으로 추천 목록이 갱신돼도 같은 카드를 다시 포커스하지 않고 다음 카드 선택 시 포커스한다', () => {
    const firstRecommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    const nextRecommendation = TEST_SHOP_RECOMMENDATIONS[1]!;
    useHomeBottomSheetStore.getState().showRecommendation();
    useShopRecommendationStore.setState({ activeRecommendationId: firstRecommendation.id });

    const { rerender } = render(<RecommendationMapMarkers />);

    expect(moveCamera).toHaveBeenCalledTimes(1);
    moveCamera.mockClear();
    panBy.mockClear();

    mockedUseNearbyPlaceRecommendationsQuery.mockReturnValue({
      recommendations: TEST_SHOP_RECOMMENDATIONS.slice(1),
    } as unknown as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    rerender(<RecommendationMapMarkers />);

    expect(moveCamera).not.toHaveBeenCalled();

    act(() => {
      useShopRecommendationStore.getState().setActiveRecommendation(nextRecommendation.id);
    });

    expect(moveCamera).toHaveBeenCalledTimes(1);
    expect(moveCamera).toHaveBeenCalledWith({
      center: nextRecommendation.position,
      zoom: 15,
    });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it('카테고리 마커를 누르면 추천 시트를 열고 선택한 가게를 공유한다', async () => {
    const user = userEvent.setup();
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    useHomeBottomSheetStore.getState().showRecommendation();

    render(<RecommendationMapMarkers />);

    const marker = screen.getByRole('button', {
      name: `${recommendation.place.name} 추천 마커`,
    });
    expect(marker.firstElementChild).toHaveClass('size-9');
    expect(marker.firstElementChild).toHaveAttribute('data-marker-icon', 'cafe-default');

    await user.click(marker);

    expect(useShopRecommendationStore.getState().activeRecommendationId).toBe(recommendation.id);
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'recommendation' });
    expect(marker).toHaveAccessibleName(`${recommendation.place.name} 추천 마커, 선택됨`);
    expect(marker.firstElementChild).toHaveAttribute('data-marker-icon', 'cafe-active');
    expect(marker.firstElementChild).toHaveClass('h-18', 'w-14');
  });

  it('바텀시트 실측 높이가 medium 비율보다 크면 그 높이를 기준으로 지도를 보정한다', async () => {
    const user = userEvent.setup();
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    const tallCarouselSheetHeightPx = window.innerHeight;
    useHomeBottomSheetStore.getState().showRecommendation();
    useHomeBottomSheetStore.setState({ visibleHeightPx: tallCarouselSheetHeightPx });

    render(<RecommendationMapMarkers />);

    const marker = screen.getByRole('button', {
      name: `${recommendation.place.name} 추천 마커`,
    });
    await user.click(marker);

    expect(panBy).toHaveBeenCalledWith(
      0,
      getFocusedMarkerVerticalOffset(tallCarouselSheetHeightPx)
    );
    expect(getFocusedMarkerVerticalOffset(tallCarouselSheetHeightPx)).toBeGreaterThan(
      getFocusedMarkerVerticalOffset()
    );
  });

  it('좋아요 마커를 누르면 active 아이콘으로 바꾸고 선택한 가게를 공유한다', async () => {
    const user = userEvent.setup();
    const recommendation = TEST_SHOP_RECOMMENDATIONS[1]!;
    useHomeBottomSheetStore.getState().showRecommendation();

    render(<RecommendationMapMarkers />);

    const marker = screen.getByRole('button', {
      name: `${recommendation.place.name} 추천 마커`,
    });
    expect(marker.firstElementChild).toHaveClass('size-14');
    expect(marker.firstElementChild).toHaveAttribute('data-marker-icon', 'like-default');
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
    expect(marker.firstElementChild).toHaveAttribute('data-marker-icon', 'like-active');
    expect(marker.firstElementChild).toHaveClass('h-18', 'w-14');
    expect(marker.firstElementChild).not.toHaveClass('opacity-100');
  });
});
