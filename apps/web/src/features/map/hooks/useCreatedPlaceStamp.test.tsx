import { act, renderHook } from '@testing-library/react';

import { useMapPlaceStampStore } from '@/features/map/stores/mapPlaceStampStore';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

import { useCreatedPlaceStamp } from './useCreatedPlaceStamp';

jest.mock('@/shared/hooks/usePrefersReducedMotion');

beforeEach(() => {
  useMapPlaceStampStore.setState(useMapPlaceStampStore.getInitialState());
  jest.mocked(usePrefersReducedMotion).mockReturnValue(false);
});

it('해당 핀이 준비됐을 때 한 번 재생하고 재렌더링·재마운트 시 반복하지 않는다', () => {
  useMapPlaceStampStore.getState().requestPlaceStamp('place');
  const { result, rerender, unmount } = renderHook(
    ({ ready }) => useCreatedPlaceStamp('place', ready),
    { initialProps: { ready: false } }
  );
  expect(result.current.isPlaying).toBe(false);
  expect(useMapPlaceStampStore.getState().stampRequest).not.toBeNull();
  rerender({ ready: true });
  expect(result.current.isPlaying).toBe(true);
  expect(useMapPlaceStampStore.getState().stampRequest).toBeNull();
  const key = result.current.animationKey;
  rerender({ ready: true });
  expect(result.current.animationKey).toBe(key);
  act(() => result.current.onAnimationEnd());
  rerender({ ready: true });
  expect(result.current.isPlaying).toBe(false);
  act(() => useMapPlaceStampStore.getState().requestPlaceStamp('place'));
  expect(result.current.isPlaying).toBe(true);
  expect(result.current.animationKey).not.toBe(key);
  unmount();
  const remounted = renderHook(() => useCreatedPlaceStamp('place'));
  expect(remounted.result.current.isPlaying).toBe(false);
});

it('다른 장소의 핀은 요청을 소비하지 않는다', () => {
  useMapPlaceStampStore.getState().requestPlaceStamp('place');
  const { result } = renderHook(() => useCreatedPlaceStamp('other'));
  expect(result.current.isPlaying).toBe(false);
  expect(useMapPlaceStampStore.getState().stampRequest?.placeId).toBe('place');
});

it('모션 감소 설정에서는 요청을 소비하되 모션은 생략한다', () => {
  jest.mocked(usePrefersReducedMotion).mockReturnValue(true);
  useMapPlaceStampStore.getState().requestPlaceStamp('place');
  const { result } = renderHook(() => useCreatedPlaceStamp('place'));
  expect(result.current.isPlaying).toBe(false);
  expect(useMapPlaceStampStore.getState().stampRequest).toBeNull();
});
