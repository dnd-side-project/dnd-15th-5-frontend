import { render } from '@testing-library/react';

import { SELECTED_PLACE_MAP_ZOOM } from '../../constants';
import { useMapFocusStore } from '../../stores/mapFocusStore';

import MapFocusController from './MapFocusController';

const moveCamera = jest.fn();
const panBy = jest.fn();

jest.mock('@vis.gl/react-google-maps', () => ({
  useMap: () => ({ moveCamera, panBy }),
}));

describe('MapFocusController', () => {
  beforeEach(() => {
    moveCamera.mockReset();
    panBy.mockReset();
    useMapFocusStore.setState({ focusPosition: null, focusZoom: undefined });
  });

  it('검색 결과 좌표의 핀을 바텀시트 위쪽에 배치하고 요청을 비운다', () => {
    const position = { lat: 37.5665, lng: 126.978 };
    useMapFocusStore.setState({ focusPosition: position });

    render(<MapFocusController />);

    expect(moveCamera).toHaveBeenCalledWith({ center: position });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
    expect(useMapFocusStore.getState().focusPosition).toBeNull();
  });

  it('매장 상세에서 요청한 좌표는 스티커 선택과 같은 줌으로 이동한다', () => {
    const position = { lat: 37.6005, lng: 126.951 };
    useMapFocusStore.getState().setSelectedPlaceFocus(position);

    render(<MapFocusController />);

    expect(moveCamera).toHaveBeenCalledWith({
      center: position,
      zoom: SELECTED_PLACE_MAP_ZOOM,
    });
    expect(panBy).toHaveBeenCalledWith(0, expect.any(Number));
  });
});
