import { render } from '@testing-library/react';
import { StrictMode } from 'react';

import { SELECTED_PLACE_MAP_ZOOM } from '../../constants';
import { useMapFocusStore } from '../../stores/mapFocusStore';

import MapFocusController from './MapFocusController';

const moveCamera = jest.fn();
const panBy = jest.fn();

jest.mock('@vis.gl/react-google-maps', () => ({
  useMap: () => ({ moveCamera, panBy }),
}));

type IdleHandle = { callback: () => void };
let idleListeners: IdleHandle[] = [];
const addListenerOnce = jest.fn((_target: unknown, _eventName: string, callback: () => void) => {
  const handle: IdleHandle = { callback };
  idleListeners.push(handle);
  return handle;
});
const removeListener = jest.fn((handle: IdleHandle) => {
  idleListeners = idleListeners.filter((listener) => listener !== handle);
});
const fireIdle = () => {
  idleListeners.forEach((listener) => listener.callback());
  idleListeners = [];
};

describe('MapFocusController', () => {
  beforeEach(() => {
    moveCamera.mockReset();
    panBy.mockReset();
    addListenerOnce.mockClear();
    removeListener.mockClear();
    idleListeners = [];
    useMapFocusStore.setState({ focusPosition: null, focusZoom: undefined });
    (globalThis as { google?: unknown }).google = {
      maps: { event: { addListenerOnce, removeListener } },
    };
  });

  it('검색 결과 좌표의 핀을 바텀시트 위쪽에 배치하고 요청을 비운다', () => {
    const position = { lat: 37.5665, lng: 126.978 };
    useMapFocusStore.setState({ focusPosition: position });

    render(<MapFocusController />);
    fireIdle();

    expect(moveCamera).toHaveBeenCalledWith({ center: position });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
    expect(useMapFocusStore.getState().focusPosition).toBeNull();
  });

  it('매장 상세에서 요청한 좌표는 스티커 선택과 같은 줌으로 이동한다', () => {
    const position = { lat: 37.6005, lng: 126.951 };
    useMapFocusStore.getState().setSelectedPlaceFocus(position);

    render(<MapFocusController />);
    fireIdle();

    expect(moveCamera).toHaveBeenCalledWith({
      center: position,
      zoom: SELECTED_PLACE_MAP_ZOOM,
    });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it('StrictMode에서 effect가 두 번 실행돼도 바텀시트 오프셋은 한 번만 적용한다', () => {
    const position = { lat: 37.5665, lng: 126.978 };
    useMapFocusStore.setState({ focusPosition: position });

    render(
      <StrictMode>
        <MapFocusController />
      </StrictMode>
    );
    fireIdle();

    expect(panBy).toHaveBeenCalledTimes(1);
  });
});
