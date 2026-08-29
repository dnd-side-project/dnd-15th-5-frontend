import { act, renderHook } from '@testing-library/react';

import { mockGoogleMapsIdleEvent } from '@/features/map/googleMapsEventMock';

import { useFocusMapOnPosition } from './useFocusMapOnPosition';

const createMap = () =>
  ({
    getProjection: jest.fn(() => null),
    getZoom: jest.fn(() => 15),
    moveCamera: jest.fn(),
    panBy: jest.fn(),
  }) as unknown as google.maps.Map;

describe('useFocusMapOnPosition', () => {
  it('연속 요청·지도 교체·언마운트 때 아직 대기 중인 idle 보정을 취소한다', () => {
    const { addListenerOnce, removeListener } = mockGoogleMapsIdleEvent();
    const listenerHandles = Array.from({ length: 3 }, () => ({ remove: jest.fn() }));
    addListenerOnce
      .mockReturnValueOnce(listenerHandles[0]!)
      .mockReturnValueOnce(listenerHandles[1]!)
      .mockReturnValueOnce(listenerHandles[2]!);
    const firstMap = createMap();
    const secondMap = createMap();
    const { result, rerender, unmount } = renderHook(
      ({ map }: { map: google.maps.Map }) => useFocusMapOnPosition(map),
      { initialProps: { map: firstMap } }
    );

    act(() => result.current({ lat: 37.5665, lng: 126.978 }));
    act(() => result.current({ lat: 37.57, lng: 126.98 }));

    expect(removeListener).toHaveBeenCalledWith(listenerHandles[0]);

    rerender({ map: secondMap });
    expect(removeListener).toHaveBeenCalledWith(listenerHandles[1]);

    act(() => result.current({ lat: 37.58, lng: 126.99 }));
    unmount();

    expect(removeListener).toHaveBeenCalledWith(listenerHandles[2]);
  });
});
