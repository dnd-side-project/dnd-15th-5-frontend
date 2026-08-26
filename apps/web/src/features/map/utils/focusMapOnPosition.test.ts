import { mockGoogleMapsIdleEvent } from '../googleMapsEventMock';

import { focusMapOnPosition, getFocusedMarkerVerticalOffset } from './focusMapOnPosition';

class FakeLatLng {
  lat: number;
  lng: number;

  constructor(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }
}

class FakePoint {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

let mocks: ReturnType<typeof mockGoogleMapsIdleEvent>;

beforeEach(() => {
  mocks = mockGoogleMapsIdleEvent();
  const globalGoogle = (globalThis as unknown as { google: { maps: Record<string, unknown> } })
    .google;
  globalGoogle.maps.LatLng = FakeLatLng;
  globalGoogle.maps.Point = FakePoint;
});

describe('focusMapOnPosition', () => {
  it('핀 좌표로 이동한 뒤 medium 바텀시트 높이의 절반만큼 지도를 아래로 이동한다', () => {
    const moveCamera = jest.fn();
    const panBy = jest.fn();
    const map = { moveCamera, panBy } as unknown as google.maps.Map;
    const position = { lat: 37.5665, lng: 126.978 };

    focusMapOnPosition(map, position, 16);

    expect(moveCamera).toHaveBeenCalledWith({ center: position, zoom: 16 });
    expect(mocks.addListenerOnce).toHaveBeenCalledWith(map, 'idle', expect.any(Function));
    expect(panBy).toHaveBeenCalledWith(0, getFocusedMarkerVerticalOffset());
  });

  it('줌을 전달하지 않으면 현재 줌을 유지한 채 좌표와 오프셋만 적용한다', () => {
    const moveCamera = jest.fn();
    const panBy = jest.fn();
    const map = { moveCamera, panBy } as unknown as google.maps.Map;
    const position = { lat: 37.5665, lng: 126.978 };

    focusMapOnPosition(map, position);

    expect(moveCamera).toHaveBeenCalledWith({ center: position });
    expect(panBy).toHaveBeenCalledWith(0, getFocusedMarkerVerticalOffset());
  });

  it('지도가 안정되기(idle) 전에는 오프셋을 적용하지 않는다', () => {
    const moveCamera = jest.fn();
    const panBy = jest.fn();
    const map = { moveCamera, panBy } as unknown as google.maps.Map;
    let idleCallback: (() => void) | undefined;
    mocks.addListenerOnce.mockImplementationOnce((_target, _eventName, callback: () => void) => {
      idleCallback = callback;
      return mocks.listenerHandle;
    });

    focusMapOnPosition(map, { lat: 37.5665, lng: 126.978 });

    expect(panBy).not.toHaveBeenCalled();
    idleCallback?.();
    expect(panBy).toHaveBeenCalledWith(0, getFocusedMarkerVerticalOffset());
  });

  it('반환된 취소 함수를 호출하면 대기 중인 idle 리스너를 제거한다', () => {
    const moveCamera = jest.fn();
    const panBy = jest.fn();
    const map = { moveCamera, panBy } as unknown as google.maps.Map;

    const cancelPendingOffset = focusMapOnPosition(map, { lat: 37.5665, lng: 126.978 });
    cancelPendingOffset();

    expect(mocks.removeListener).toHaveBeenCalledWith(mocks.listenerHandle);
  });

  it('지도 투영이 준비되어 있으면 idle을 기다리지 않고 오프셋까지 반영한 좌표로 한 번에 이동한다', () => {
    const moveCamera = jest.fn();
    const panBy = jest.fn();
    const worldPoint = new FakePoint(100, 200);
    const offsetLatLng = new FakeLatLng(37.6, 126.9);
    const fromLatLngToPoint = jest.fn(() => worldPoint);
    const fromPointToLatLng = jest.fn((_point: FakePoint) => offsetLatLng);
    const map = {
      moveCamera,
      panBy,
      getProjection: () => ({ fromLatLngToPoint, fromPointToLatLng }),
      getZoom: () => 16,
    } as unknown as google.maps.Map;
    const position = { lat: 37.5665, lng: 126.978 };

    focusMapOnPosition(map, position, 16);

    expect(fromLatLngToPoint).toHaveBeenCalledWith(new FakeLatLng(position.lat, position.lng));
    const [offsetWorldPoint] = fromPointToLatLng.mock.calls[0]!;
    expect(offsetWorldPoint.x).toBe(worldPoint.x);
    expect(offsetWorldPoint.y).toBeCloseTo(
      worldPoint.y + getFocusedMarkerVerticalOffset() / 2 ** 16
    );
    expect(moveCamera).toHaveBeenCalledWith({ center: offsetLatLng, zoom: 16 });
    expect(mocks.addListenerOnce).not.toHaveBeenCalled();
    expect(panBy).not.toHaveBeenCalled();
  });

  it('줌을 전달하지 않아도 투영이 준비돼 있으면 현재 줌 기준으로 오프셋을 미리 계산한다', () => {
    const moveCamera = jest.fn();
    const panBy = jest.fn();
    const worldPoint = new FakePoint(100, 200);
    const offsetLatLng = new FakeLatLng(37.6, 126.9);
    const fromLatLngToPoint = jest.fn(() => worldPoint);
    const fromPointToLatLng = jest.fn((_point: FakePoint) => offsetLatLng);
    const map = {
      moveCamera,
      panBy,
      getProjection: () => ({ fromLatLngToPoint, fromPointToLatLng }),
      getZoom: () => 14,
    } as unknown as google.maps.Map;

    focusMapOnPosition(map, { lat: 37.5665, lng: 126.978 });

    const [offsetWorldPoint] = fromPointToLatLng.mock.calls[0]!;
    expect(offsetWorldPoint.y).toBeCloseTo(
      worldPoint.y + getFocusedMarkerVerticalOffset() / 2 ** 14
    );
    expect(moveCamera).toHaveBeenCalledWith({ center: offsetLatLng });
    expect(mocks.addListenerOnce).not.toHaveBeenCalled();
  });
});
