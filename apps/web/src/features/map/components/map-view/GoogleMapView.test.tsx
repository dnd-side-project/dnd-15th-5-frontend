import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import GoogleMapView from './GoogleMapView';

import type { PropsWithChildren } from 'react';

const requestPosition = jest.fn();
let clickableIcons: boolean | undefined;
let disableDefaultUI: boolean | undefined;

jest.mock('@vis.gl/react-google-maps', () => ({
  Map: ({
    children,
    onClick,
    clickableIcons: nextClickableIcons,
    disableDefaultUI: nextDisableDefaultUI,
  }: PropsWithChildren<{
    onClick?: () => void;
    clickableIcons?: boolean;
    disableDefaultUI?: boolean;
  }>) => {
    clickableIcons = nextClickableIcons;
    disableDefaultUI = nextDisableDefaultUI;

    return (
      <>
        <button type="button" onClick={onClick}>
          지도 영역
        </button>
        {children}
      </>
    );
  },
}));

jest.mock('../../hooks/useCurrentPosition', () => ({
  useCurrentPosition: () => ({
    position: null,
    isLoading: false,
    error: { reason: 'permissionDenied', message: '위치 오류' },
    requestPosition,
  }),
}));

jest.mock('../current-location/CurrentLocationMarker', () => () => null);
jest.mock('../current-location/CurrentLocationCameraController', () => () => null);
jest.mock(
  '../current-location/CurrentLocationButton',
  () =>
    ({
      errorMessage,
      onRequestPosition,
    }: {
      errorMessage: string | null;
      onRequestPosition: () => void;
    }) => (
      <>
        <button type="button" onClick={onRequestPosition}>
          현재 위치 요청
        </button>
        {errorMessage && <p role="status">{errorMessage}</p>}
      </>
    )
);

describe('GoogleMapView', () => {
  beforeEach(() => {
    requestPosition.mockReset();
    clickableIcons = undefined;
    disableDefaultUI = undefined;
  });

  it('Google 기본 UI와 POI 아이콘 클릭을 비활성화한다', () => {
    render(<GoogleMapView />);

    expect(disableDefaultUI).toBe(true);
    expect(clickableIcons).toBe(false);
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
