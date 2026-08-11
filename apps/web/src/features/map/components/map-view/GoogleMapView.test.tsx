import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import GoogleMapView from './GoogleMapView';

import type { PropsWithChildren } from 'react';

const requestPosition = jest.fn();

jest.mock('@vis.gl/react-google-maps', () => ({
  Map: ({ children, onClick }: PropsWithChildren<{ onClick?: () => void }>) => (
    <>
      <button type="button" onClick={onClick}>
        지도 영역
      </button>
      {children}
    </>
  ),
}));

jest.mock('../../hooks/useCurrentPosition', () => ({
  useCurrentPosition: () => ({
    position: null,
    isLoading: false,
    error: { code: 1, message: '권한 거부' },
    isGeolocationSupported: true,
    requestPosition,
  }),
}));

jest.mock('../current-location/CurrentLocationMarker', () => () => null);
jest.mock('../current-location/CurrentLocationCameraController', () => () => null);
jest.mock(
  '../current-location/CurrentLocationButton',
  () =>
    ({ showError, onRequestPosition }: { showError: boolean; onRequestPosition: () => void }) => (
      <>
        <button type="button" onClick={onRequestPosition}>
          현재 위치 요청
        </button>
        {showError && <p role="status">위치 오류</p>}
      </>
    )
);

describe('GoogleMapView', () => {
  beforeEach(() => {
    requestPosition.mockReset();
  });

  it('현재 위치 오류 안내가 표시된 상태에서 지도를 누르면 안내를 숨긴다', async () => {
    const user = userEvent.setup();
    render(<GoogleMapView />);

    await user.click(screen.getByRole('button', { name: '현재 위치 요청' }));
    expect(screen.getByRole('status')).toHaveTextContent('위치 오류');

    await user.click(screen.getByRole('button', { name: '지도 영역' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
