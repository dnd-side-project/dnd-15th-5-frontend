import { render } from '@testing-library/react';

import { mockGoogleMapsIdleEvent } from '../../googleMapsEventMock';
import { getFocusedMarkerVerticalOffset } from '../../utils/focusMapOnPosition';

import CurrentLocationCameraController from './CurrentLocationCameraController';

const moveCamera = jest.fn();
const panBy = jest.fn();
let map: { moveCamera: typeof moveCamera; panBy: typeof panBy } | null = { moveCamera, panBy };

jest.mock('@vis.gl/react-google-maps', () => ({
  useMap: () => map,
}));

describe('<CurrentLocationCameraController />', () => {
  beforeEach(() => {
    moveCamera.mockReset();
    panBy.mockReset();
    map = { moveCamera, panBy };
    mockGoogleMapsIdleEvent();
  });

  it('현재 위치가 없으면 지도 중심을 이동하지 않는다', () => {
    render(<CurrentLocationCameraController isAutomaticPanEnabled position={null} />);

    expect(moveCamera).not.toHaveBeenCalled();
  });

  it('현재 위치가 확인되면 지도 중심을 해당 좌표로 이동하고 바텀시트 높이만큼 오프셋을 적용한다', () => {
    const position = { lat: 37.5665, lng: 126.978 };
    const { rerender } = render(
      <CurrentLocationCameraController isAutomaticPanEnabled position={null} />
    );

    rerender(<CurrentLocationCameraController isAutomaticPanEnabled position={position} />);

    expect(moveCamera).toHaveBeenCalledWith({ center: position });
    expect(panBy).toHaveBeenCalledWith(0, getFocusedMarkerVerticalOffset());
  });

  it('최초 이동 후 위치가 바뀌어도 지도 중심을 다시 이동하지 않는다', () => {
    const initialPosition = { lat: 37.5665, lng: 126.978 };
    const nextPosition = { lat: 35.1796, lng: 129.0756 };
    const { rerender } = render(
      <CurrentLocationCameraController isAutomaticPanEnabled position={initialPosition} />
    );

    rerender(<CurrentLocationCameraController isAutomaticPanEnabled position={nextPosition} />);

    expect(moveCamera).toHaveBeenCalledTimes(1);
    expect(moveCamera).toHaveBeenCalledWith({ center: initialPosition });
  });

  it('다른 장소를 포커스한 채 진입하면 현재 위치 자동 이동을 이후에도 실행하지 않는다', () => {
    const position = { lat: 37.5665, lng: 126.978 };
    const { rerender } = render(
      <CurrentLocationCameraController isAutomaticPanEnabled={false} position={position} />
    );

    rerender(<CurrentLocationCameraController isAutomaticPanEnabled position={position} />);

    expect(moveCamera).not.toHaveBeenCalled();
  });
});
