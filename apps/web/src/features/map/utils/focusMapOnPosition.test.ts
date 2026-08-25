import { focusMapOnPosition, getFocusedMarkerVerticalOffset } from './focusMapOnPosition';

describe('focusMapOnPosition', () => {
  it('핀 좌표로 이동한 뒤 medium 바텀시트 높이의 절반만큼 지도를 아래로 이동한다', () => {
    const moveCamera = jest.fn();
    const panBy = jest.fn();
    const map = { moveCamera, panBy } as unknown as google.maps.Map;
    const position = { lat: 37.5665, lng: 126.978 };

    focusMapOnPosition(map, position, 16);

    expect(moveCamera).toHaveBeenCalledWith({ center: position, zoom: 16 });
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
});
