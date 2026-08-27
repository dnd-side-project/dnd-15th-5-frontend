import { renderHook } from '@testing-library/react';

import { useGetVisitedPlaceMarkers } from '@/features/map/apis/queries';

import { useVisitedPlaceStickersQuery } from './useVisitedPlaceStickersQuery';

jest.mock('@/features/map/apis/queries', () => ({
  useGetVisitedPlaceMarkers: jest.fn(),
}));

const mockedUseGetVisitedPlaceMarkers = jest.mocked(useGetVisitedPlaceMarkers);

describe('useVisitedPlaceStickersQuery', () => {
  it('응답이 없는 로딩·오류 상태를 0곳으로 바꾸지 않는다', () => {
    mockedUseGetVisitedPlaceMarkers.mockReturnValue({
      data: undefined,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useGetVisitedPlaceMarkers>);

    const { result } = renderHook(() => useVisitedPlaceStickersQuery());

    expect(result.current.monthlyPlaceCount).toBeUndefined();
  });

  it('성공 응답에서 월간 장소 수가 생략되면 빈 결과인 0곳으로 제공한다', () => {
    mockedUseGetVisitedPlaceMarkers.mockReturnValue({
      data: { data: { places: [] } },
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useGetVisitedPlaceMarkers>);

    const { result } = renderHook(() => useVisitedPlaceStickersQuery());

    expect(result.current.monthlyPlaceCount).toBe(0);
  });
});
