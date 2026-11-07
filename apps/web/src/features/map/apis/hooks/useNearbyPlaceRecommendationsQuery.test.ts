import { act, renderHook } from '@testing-library/react';

import { useGetNearbyPlaces } from '@/features/map/apis/queries';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { useMapViewportStore } from '@/features/map/stores/mapViewportStore';

import { useNearbyPlaceRecommendationsQuery } from './useNearbyPlaceRecommendationsQuery';

jest.mock('@/features/map/apis/queries', () => ({
  useGetNearbyPlaces: jest.fn(),
}));

const mockedUseGetNearbyPlaces = jest.mocked(useGetNearbyPlaces);

const categoryPlace = { placeId: 2, name: '카테고리 가게', latitude: 37.5, longitude: 127 };
const popularPlace = { ...categoryPlace, placeId: 1, name: '전체 인기 가게' };

describe('useNearbyPlaceRecommendationsQuery', () => {
  beforeEach(() => {
    useLocationSelectionStore.getState().resetSelection();
    useMapViewportStore.setState({ center: { lat: 37.559334, lng: 126.990298 } });
    mockedUseGetNearbyPlaces.mockReset();
  });

  it('위치를 확정하기 전에는 현재 지도 중심에서 반경 1.5km 추천을 요청한다', () => {
    mockedUseGetNearbyPlaces.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useGetNearbyPlaces>);

    renderHook(() => useNearbyPlaceRecommendationsQuery());

    expect(mockedUseGetNearbyPlaces).toHaveBeenLastCalledWith({
      lat: 37.559334,
      lng: 126.990298,
      radiusMeters: 1_500,
    });
  });

  it('선택한 좌표를 확정하면 해당 위치 중심으로 추천을 요청한다', () => {
    mockedUseGetNearbyPlaces.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useGetNearbyPlaces>);

    const { rerender } = renderHook(() => useNearbyPlaceRecommendationsQuery());

    act(() => {
      useLocationSelectionStore.getState().setConfirmedPosition({ lat: 37.545, lng: 127.056 });
    });
    rerender();

    expect(mockedUseGetNearbyPlaces).toHaveBeenLastCalledWith({
      lat: 37.545,
      lng: 127.056,
      radiusMeters: 1_500,
    });
  });

  it.each([
    { allPlaces: [], expectedId: '2', label: '전체 목록이 비어 있으면 카테고리 목록을 사용한다' },
    { allPlaces: [popularPlace], expectedId: '1', label: '전체 목록이 있으면 우선 사용한다' },
  ])('$label', ({ allPlaces, expectedId }) => {
    mockedUseGetNearbyPlaces.mockReturnValue({
      data: { data: { allPlaces, categoryPlaces: [{ places: [categoryPlace] }] } },
    } as ReturnType<typeof useGetNearbyPlaces>);

    const { result } = renderHook(() => useNearbyPlaceRecommendationsQuery());

    expect(result.current.recommendations.map(({ id }) => id)).toEqual([expectedId]);
  });
});
