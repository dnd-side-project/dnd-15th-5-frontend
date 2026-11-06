import { act, renderHook } from '@testing-library/react';

import { useGetNearbyPlaces } from '@/features/map/apis/queries';
import { useMapViewportStore } from '@/features/map/stores/mapViewportStore';

import { useNearbyPlaceRecommendationsQuery } from './useNearbyPlaceRecommendationsQuery';

jest.mock('@/features/map/apis/queries', () => ({
  useGetNearbyPlaces: jest.fn(),
}));

const mockedUseGetNearbyPlaces = jest.mocked(useGetNearbyPlaces);

describe('useNearbyPlaceRecommendationsQuery', () => {
  it('카테고리별 추천과 전체 추천을 중복 없이 기존 지도 모델로 변환한다', () => {
    const place = { placeId: 101, name: '카페', latitude: 37.5, longitude: 127 };
    mockedUseGetNearbyPlaces.mockReturnValue({
      data: {
        data: {
          categoryPlaces: [{ category: '카페', places: [place] }],
          allPlaces: [
            { ...place, liked: true },
            { ...place, placeId: 102 },
          ],
        },
      },
    } as unknown as ReturnType<typeof useGetNearbyPlaces>);

    const { result } = renderHook(() => useNearbyPlaceRecommendationsQuery());
    expect(result.current.recommendations.map(({ id, reason }) => ({ id, reason }))).toEqual([
      { id: '101', reason: '카테고리별 인기 가게' },
      { id: '102', reason: '내 동네에서 많이 방문한 곳' },
    ]);
    expect(result.current.recommendations[0]?.isLiked).toBe(true);
  });
  it('지도 위치와 무관하게 토크히어 좌표로 반경 1km 추천을 요청한다', () => {
    mockedUseGetNearbyPlaces.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useGetNearbyPlaces>);

    const { rerender } = renderHook(() => useNearbyPlaceRecommendationsQuery());

    act(() => {
      useMapViewportStore.getState().setCenter({ lat: 35.1796, lng: 129.0756 });
    });
    rerender();

    expect(mockedUseGetNearbyPlaces).toHaveBeenLastCalledWith({
      lat: 37.4896386,
      lng: 126.9759403,
      radiusMeters: 1_000,
    });
  });
});
