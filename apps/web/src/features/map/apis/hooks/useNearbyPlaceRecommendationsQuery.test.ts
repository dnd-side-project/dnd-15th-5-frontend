import { act, renderHook } from '@testing-library/react';

import { useGetNearbyPlaces } from '@/features/map/apis/queries';
import { useMapViewportStore } from '@/features/map/stores/mapViewportStore';

import { useNearbyPlaceRecommendationsQuery } from './useNearbyPlaceRecommendationsQuery';

jest.mock('@/features/map/apis/queries', () => ({
  useGetNearbyPlaces: jest.fn(),
}));

const mockedUseGetNearbyPlaces = jest.mocked(useGetNearbyPlaces);

describe('useNearbyPlaceRecommendationsQuery', () => {
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
