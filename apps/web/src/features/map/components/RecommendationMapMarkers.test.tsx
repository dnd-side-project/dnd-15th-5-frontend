import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useNearbyPlaceRecommendationsQuery } from '../apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useVisitedPlaceStickersQuery } from '../apis/hooks/useVisitedPlaceStickersQuery';
import { mockGoogleMapsIdleEvent } from '../googleMapsEventMock';
import { useHomeBottomSheetStore } from '../stores/homeBottomSheetStore';
import { useLocationSelectionStore } from '../stores/locationSelectionStore';
import { useMapCategoryFilterStore } from '../stores/mapCategoryFilterStore';
import { useMapPlaceStampStore } from '../stores/mapPlaceStampStore';
import { useShopRecommendationStore } from '../stores/shopRecommendationStore';
import { TEST_SHOP_RECOMMENDATIONS } from '../testFixtures';
import { getFocusedMarkerVerticalOffset } from '../utils/focusMapOnPosition';

import RecommendationMapMarkers from './RecommendationMapMarkers';

import type { PropsWithChildren, SVGProps } from 'react';

const moveCamera = jest.fn();
const panBy = jest.fn();

jest.mock('../apis/hooks/useNearbyPlaceRecommendationsQuery');
jest.mock('../apis/hooks/useVisitedPlaceStickersQuery');

jest.mock('@/shared/assets/icons', () => ({
  ShoppingPinActiveIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="shopping-active" {...props} />
  ),
  ShoppingPinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="shopping-default" {...props} />
  ),
  BeautyPinActiveIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="beauty-active" {...props} />
  ),
  BeautyPinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="beauty-default" {...props} />
  ),
  ExercisePinActiveIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="exercise-active" {...props} />
  ),
  ExercisePinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="exercise-default" {...props} />
  ),
  MarketPinActiveIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="market-active" {...props} />
  ),
  MarketPinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="market-default" {...props} />
  ),
  OtherPinActiveIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="other-active" {...props} />
  ),
  OtherPinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="other-default" {...props} />
  ),
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
  LikedPlacePinActiveIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="like-active" {...props} />
  ),
  LikedPlacePinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="like-default" {...props} />
  ),
  RestaurantPinActiveIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="restaurant-active" {...props} />
  ),
  RestaurantPinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="restaurant-default" {...props} />
  ),
  RecommendationLocationPinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg data-marker-icon="recommendation-fallback" {...props} />
  ),
}));

const mockedUseNearbyPlaceRecommendationsQuery = jest.mocked(useNearbyPlaceRecommendationsQuery);
const mockedUseVisitedPlaceStickersQuery = jest.mocked(useVisitedPlaceStickersQuery);

jest.mock('@vis.gl/react-google-maps', () => ({
  AdvancedMarker: ({
    children,
    onClick,
    title,
    anchorTop,
  }: PropsWithChildren<{ onClick?: () => void; title?: string; anchorTop?: string }>) => (
    <button type="button" aria-label={title} data-anchor-top={anchorTop} onClick={onClick}>
      {children}
    </button>
  ),
  useMap: () => ({ moveCamera, panBy }),
}));

describe('RecommendationMapMarkers', () => {
  it('기록한 장소가 좋아요 핀이면 같은 모션을 한 번만 재생한다', () => {
    const recommendation = { ...TEST_SHOP_RECOMMENDATIONS[0]!, isLiked: true };
    mockedUseNearbyPlaceRecommendationsQuery.mockReturnValue({
      recommendations: [],
    } as unknown as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      likedRecommendations: [recommendation],
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
    useMapPlaceStampStore.getState().requestPlaceStamp(recommendation.id);
    const { rerender } = render(<RecommendationMapMarkers />);
    const marker = screen.getByRole('button', { name: `${recommendation.place.name} 추천 마커` });
    const icon = marker.firstElementChild!;
    expect(icon).toHaveClass('map-place-stamp');
    expect(useMapPlaceStampStore.getState().stampRequest).toBeNull();
    fireEvent.animationEnd(icon);
    expect(icon).not.toHaveClass('map-place-stamp', 'recommendation-marker-icon');
    rerender(<RecommendationMapMarkers />);
    expect(marker.firstElementChild).toBe(icon);
    expect(icon).not.toHaveClass('map-place-stamp');
    fireEvent.click(marker);
    expect(marker.firstElementChild).toHaveClass('recommendation-marker-icon');
    expect(marker.firstElementChild).not.toHaveClass('map-place-stamp');
    act(() => useHomeBottomSheetStore.getState().showHome());
    expect(marker.firstElementChild).toHaveClass('recommendation-marker-icon');
    expect(useMapPlaceStampStore.getState().stampRequest).toBeNull();
  });

  beforeEach(() => {
    useMapPlaceStampStore.setState(useMapPlaceStampStore.getInitialState());
    moveCamera.mockReset();
    panBy.mockReset();
    mockGoogleMapsIdleEvent();
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
    useMapCategoryFilterStore.setState({ selectedCategory: null });
    useLocationSelectionStore.setState({ confirmedPosition: { lat: 37.5665, lng: 126.978 } });
    useShopRecommendationStore.setState({
      activeRecommendationId: null,
      selectedCategory: null,
      listScrollTop: 0,
    });
    mockedUseNearbyPlaceRecommendationsQuery.mockReturnValue({
      recommendations: TEST_SHOP_RECOMMENDATIONS,
    } as unknown as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      likedRecommendations: [],
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
  });

  it('추천 가게는 각 카테고리 핀을 표시한다', () => {
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
      screen.getByRole('button', { name: '추천 운동 시설 추천 마커' }).firstElementChild
    ).toHaveAttribute('data-marker-icon', 'exercise-default');
  });

  it.each(['recommendation', 'recommendationPlace'] as const)(
    '확정한 동네가 없으면 %s 화면에서 캐시된 추천 마커를 표시하지 않는다',
    (sheetType) => {
      const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
      useLocationSelectionStore.setState({ confirmedPosition: null });
      if (sheetType === 'recommendationPlace') {
        useHomeBottomSheetStore.getState().showRecommendationPlace(recommendation.id);
      } else {
        useHomeBottomSheetStore.getState().showRecommendation();
      }

      render(<RecommendationMapMarkers />);

      expect(mockedUseNearbyPlaceRecommendationsQuery).toHaveBeenLastCalledWith(false);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    }
  );

  it('가게 추천 탭을 활성화하지 않으면 추천 마커를 표시하지 않는다', () => {
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;

    render(<RecommendationMapMarkers />);

    expect(
      screen.queryByRole('button', { name: `${recommendation.place.name} 추천 마커` })
    ).not.toBeInTheDocument();
  });

  it.each([
    ['운동', 'exercise'],
    ['편의점/마트', 'market'],
    ['미용/뷰티', 'beauty'],
    ['기타', 'other'],
    ['쇼핑', 'shopping'],
  ] as const)('%s 핀을 선택하면 해당 선택 핀과 상세 시트를 표시한다', async (category, icon) => {
    const user = userEvent.setup();
    const recommendation = {
      ...TEST_SHOP_RECOMMENDATIONS[0]!,
      isLiked: false,
      place: {
        ...TEST_SHOP_RECOMMENDATIONS[0]!.place,
        category,
      },
    };
    mockedUseNearbyPlaceRecommendationsQuery.mockReturnValue({
      recommendations: [recommendation],
    } as unknown as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    useHomeBottomSheetStore.getState().showRecommendation();

    render(<RecommendationMapMarkers />);

    const marker = screen.getByRole('button', {
      name: `${recommendation.place.name} 추천 마커`,
    });
    expect(marker.firstElementChild).toHaveAttribute('data-marker-icon', `${icon}-default`);
    expect(marker.firstElementChild).toHaveAttribute('data-state', 'default');
    await user.click(marker);

    expect(marker).toHaveAccessibleName(`${recommendation.place.name} 추천 마커, 선택됨`);
    expect(marker.firstElementChild).toHaveAttribute('data-marker-icon', `${icon}-active`);
    expect(marker.firstElementChild).toHaveAttribute('data-state', 'active');
    expect(moveCamera).toHaveBeenCalledWith({ center: recommendation.position, zoom: 15 });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
    expect(useShopRecommendationStore.getState().activeRecommendationId).toBe(recommendation.id);
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'recommendationPlace',
      recommendationId: recommendation.id,
    });
  });

  it('추천 목록과 상세는 무관한 좋아요 마커를 제외하고 추천 전용 카테고리 필터를 적용한다', async () => {
    const user = userEvent.setup();
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    const unrelatedLikedRecommendation = {
      ...recommendation,
      id: 'unrelated-liked',
      isLiked: true,
      place: { ...recommendation.place, id: 'unrelated-place', name: '목록 밖 관심 카페' },
    };
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      likedRecommendations: [unrelatedLikedRecommendation],
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
    useMapCategoryFilterStore.setState({ selectedCategory: '음식점' });
    useShopRecommendationStore.setState({ selectedCategory: '카페' });
    useHomeBottomSheetStore.getState().showRecommendation();

    render(<RecommendationMapMarkers />);

    const marker = screen.getByRole('button', {
      name: `${recommendation.place.name} 추천 마커`,
    });
    expect(screen.getAllByRole('button')).toHaveLength(
      TEST_SHOP_RECOMMENDATIONS.filter(({ place }) => place.category === '카페').length
    );
    expect(
      screen.queryByRole('button', { name: '목록 밖 관심 카페 추천 마커' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '플레이 다트펍 추천 마커' })
    ).not.toBeInTheDocument();
    await user.click(marker);
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'recommendationPlace',
      recommendationId: recommendation.id,
    });
    expect(
      screen.queryByRole('button', { name: '목록 밖 관심 카페 추천 마커' })
    ).not.toBeInTheDocument();

    act(() => useShopRecommendationStore.getState().setSelectedCategory('취미/놀거리'));
    expect(
      screen.queryByRole('button', { name: `${recommendation.place.name} 추천 마커, 선택됨` })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '플레이 다트펍 추천 마커' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(
      TEST_SHOP_RECOMMENDATIONS.filter(({ place }) => place.category === '취미/놀거리').length
    );
  });

  it('추천 목록에서 선택한 가게를 활성 카테고리 핀으로 표시한다', () => {
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
    expect(marker).toHaveAttribute('data-anchor-top', '-58px');
    expect(moveCamera).toHaveBeenCalledWith({ center: recommendation.position, zoom: 15 });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it('상세로 직접 진입하고 추천 응답이 늦게 도착해도 선택한 가게를 포커스한다', () => {
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    useHomeBottomSheetStore.getState().showRecommendationPlace(recommendation.id);
    mockedUseNearbyPlaceRecommendationsQuery.mockReturnValue({
      recommendations: [],
    } as unknown as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    const { rerender } = render(<RecommendationMapMarkers />);
    expect(moveCamera).not.toHaveBeenCalled();

    mockedUseNearbyPlaceRecommendationsQuery.mockReturnValue({
      recommendations: [recommendation],
    } as unknown as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    rerender(<RecommendationMapMarkers />);
    expect(moveCamera).toHaveBeenCalledTimes(1);
    expect(moveCamera).toHaveBeenCalledWith({ center: recommendation.position, zoom: 15 });
    rerender(<RecommendationMapMarkers />);
    expect(moveCamera).toHaveBeenCalledTimes(1);
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

  it('같은 추천을 보는 중에도 바텀시트 실측 높이가 바뀌면 지도를 다시 보정한다', () => {
    const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;
    useHomeBottomSheetStore.getState().showRecommendation();
    useShopRecommendationStore.setState({ activeRecommendationId: recommendation.id });

    render(<RecommendationMapMarkers />);

    expect(moveCamera).toHaveBeenCalledTimes(1);
    moveCamera.mockClear();
    panBy.mockClear();

    const tallerSheetHeightPx = window.innerHeight;
    act(() => {
      useHomeBottomSheetStore.setState({ visibleHeightPx: tallerSheetHeightPx });
    });

    expect(moveCamera).toHaveBeenCalledTimes(1);
    expect(moveCamera).toHaveBeenCalledWith({ center: recommendation.position, zoom: 15 });
    expect(panBy).toHaveBeenCalledWith(0, getFocusedMarkerVerticalOffset(tallerSheetHeightPx));
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
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'recommendationPlace',
      recommendationId: recommendation.id,
    });
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
    expect(marker.firstElementChild).toHaveAttribute('data-marker-icon', 'like-default');
    expect(marker.firstElementChild).not.toHaveClass('opacity-60');
    expect(marker.firstElementChild).toHaveAttribute('data-state', 'default');

    await user.click(marker);

    expect(moveCamera).toHaveBeenCalledWith({ center: recommendation.position, zoom: 15 });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
    expect(useShopRecommendationStore.getState().activeRecommendationId).toBe(recommendation.id);
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'recommendationPlace',
      recommendationId: recommendation.id,
    });
    expect(marker).toHaveAccessibleName(`${recommendation.place.name} 추천 마커, 선택됨`);
    expect(marker.firstElementChild).toHaveAttribute('data-state', 'active');
    expect(marker.firstElementChild).toHaveAttribute('data-marker-icon', 'like-active');
    expect(marker.firstElementChild).toHaveClass('h-18', 'w-14');
    expect(marker.firstElementChild).not.toHaveClass('opacity-100');
  });

  it('주변 추천과 카테고리가 달라도 방문 장소 응답 기준으로 선택 마커를 표시한다', () => {
    const recommendation = {
      ...TEST_SHOP_RECOMMENDATIONS[0]!,
      isLiked: true,
      place: { ...TEST_SHOP_RECOMMENDATIONS[0]!.place, category: '기타' as const },
    };
    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      likedRecommendations: [recommendation],
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
    useMapCategoryFilterStore.setState({ selectedCategory: '기타' });
    useHomeBottomSheetStore.getState().showLikedRecommendation(recommendation.id);

    render(<RecommendationMapMarkers />);

    expect(
      screen.getByRole('button', {
        name: `${recommendation.place.name} 추천 마커, 선택됨`,
      }).firstElementChild
    ).toHaveAttribute('data-marker-icon', 'like-active');
  });

  it('방문 장소 응답을 받은 뒤 기록 없이 좋아요한 장소도 선택 마커로 표시한다', async () => {
    const user = userEvent.setup();
    const recommendation = { ...TEST_SHOP_RECOMMENDATIONS[0]!, isLiked: true, visitCount: 0 };
    mockedUseNearbyPlaceRecommendationsQuery.mockReturnValue({
      recommendations: [],
    } as unknown as ReturnType<typeof useNearbyPlaceRecommendationsQuery>);
    useMapCategoryFilterStore.setState({ selectedCategory: recommendation.place.category });
    useHomeBottomSheetStore.getState().showLikedRecommendation(recommendation.id);

    const { rerender } = render(<RecommendationMapMarkers />);
    expect(
      screen.queryByRole('button', {
        name: `${recommendation.place.name} 추천 마커, 선택됨`,
      })
    ).not.toBeInTheDocument();

    mockedUseVisitedPlaceStickersQuery.mockReturnValue({
      likedRecommendations: [recommendation],
    } as unknown as ReturnType<typeof useVisitedPlaceStickersQuery>);
    rerender(<RecommendationMapMarkers />);

    const marker = screen.getByRole('button', {
      name: `${recommendation.place.name} 추천 마커, 선택됨`,
    });
    expect(marker.firstElementChild).toHaveAttribute('data-marker-icon', 'like-active');
    await user.click(marker);
    expect(moveCamera).toHaveBeenLastCalledWith(
      expect.objectContaining({ center: recommendation.position })
    );
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'likedRecommendation',
      recommendationId: recommendation.id,
    });
  });
});
