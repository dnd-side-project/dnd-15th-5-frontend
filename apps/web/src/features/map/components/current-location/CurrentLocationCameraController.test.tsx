import { render } from '@testing-library/react';

import CurrentLocationCameraController from './CurrentLocationCameraController';

const panTo = jest.fn();
let map: { panTo: typeof panTo } | null = { panTo };

jest.mock('@vis.gl/react-google-maps', () => ({
  useMap: () => map,
}));

describe('<CurrentLocationCameraController />', () => {
  beforeEach(() => {
    panTo.mockReset();
    map = { panTo };
  });

  it('현재 위치가 없으면 지도 중심을 이동하지 않는다', () => {
    render(<CurrentLocationCameraController position={null} />);

    expect(panTo).not.toHaveBeenCalled();
  });

  it('현재 위치가 확인되면 지도 중심을 해당 좌표로 이동한다', () => {
    const position = { lat: 37.5665, lng: 126.978 };
    const { rerender } = render(<CurrentLocationCameraController position={null} />);

    rerender(<CurrentLocationCameraController position={position} />);

    expect(panTo).toHaveBeenCalledWith(position);
  });

  it('최초 이동 후 위치가 바뀌어도 지도 중심을 다시 이동하지 않는다', () => {
    const initialPosition = { lat: 37.5665, lng: 126.978 };
    const nextPosition = { lat: 35.1796, lng: 129.0756 };
    const { rerender } = render(<CurrentLocationCameraController position={initialPosition} />);

    rerender(<CurrentLocationCameraController position={nextPosition} />);

    expect(panTo).toHaveBeenCalledTimes(1);
    expect(panTo).toHaveBeenCalledWith(initialPosition);
  });
});
