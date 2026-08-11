import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CurrentLocationButton from './CurrentLocationButton';

import type { PropsWithChildren } from 'react';

const panTo = jest.fn();
const requestPosition = jest.fn();
let map: { panTo: typeof panTo } | null = { panTo };
let nativeApp = false;

jest.mock('@vis.gl/react-google-maps', () => ({
  ControlPosition: { RIGHT_BOTTOM: 9 },
  MapControl: ({ children }: PropsWithChildren) => <>{children}</>,
  useMap: () => map,
}));

jest.mock('@/shared/lib/bridge', () => ({
  isNativeApp: () => nativeApp,
}));

describe('<CurrentLocationButton />', () => {
  beforeEach(() => {
    panTo.mockReset();
    requestPosition.mockReset();
    map = { panTo };
    nativeApp = false;
  });

  it('현재 위치가 없으면 버튼을 눌러 위치를 다시 요청한다', async () => {
    const user = userEvent.setup();
    render(
      <CurrentLocationButton
        position={null}
        isLoading={false}
        error={null}
        isGeolocationSupported
        showError={false}
        onRequestPosition={requestPosition}
      />
    );

    await user.click(screen.getByRole('button', { name: '현재 위치로 이동' }));

    expect(requestPosition).toHaveBeenCalledTimes(1);
  });

  it('버튼을 누르면 줌 변경 없이 현재 위치로 지도 중심을 이동한다', async () => {
    const user = userEvent.setup();
    const position = { lat: 37.5665, lng: 126.978 };
    render(
      <CurrentLocationButton
        position={position}
        isLoading={false}
        error={null}
        isGeolocationSupported
        showError={false}
        onRequestPosition={requestPosition}
      />
    );

    await user.click(screen.getByRole('button', { name: '현재 위치로 이동' }));

    expect(panTo).toHaveBeenCalledWith(position);
    expect(requestPosition).not.toHaveBeenCalled();
  });

  it('위치를 조회하는 동안 버튼을 비활성화한다', () => {
    render(
      <CurrentLocationButton
        position={null}
        isLoading
        error={null}
        isGeolocationSupported
        showError={false}
        onRequestPosition={requestPosition}
      />
    );

    expect(screen.getByRole('button', { name: '현재 위치로 이동' })).toBeDisabled();
  });

  it('최초 위치 권한 요청이 거부돼도 바로 안내를 보여주지 않는다', () => {
    const permissionDenied = { code: 1, message: '권한 거부' } as GeolocationPositionError;
    render(
      <CurrentLocationButton
        position={null}
        isLoading={false}
        error={permissionDenied}
        isGeolocationSupported
        showError={false}
        onRequestPosition={requestPosition}
      />
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('웹에서 재요청하면 브라우저 권한 설정 안내를 보여준다', () => {
    const permissionDenied = { code: 1, message: '권한 거부' } as GeolocationPositionError;
    render(
      <CurrentLocationButton
        position={null}
        isLoading={false}
        error={permissionDenied}
        isGeolocationSupported
        showError
        onRequestPosition={requestPosition}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      '브라우저 설정에서 위치 권한을 허용해주세요.'
    );
  });

  it('앱에서 재요청하면 기기 권한 설정 안내를 보여준다', () => {
    const permissionDenied = { code: 1, message: '권한 거부' } as GeolocationPositionError;
    nativeApp = true;
    render(
      <CurrentLocationButton
        position={null}
        isLoading={false}
        error={permissionDenied}
        isGeolocationSupported
        showError
        onRequestPosition={requestPosition}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('기기 설정에서 위치 권한을 허용해주세요.');
  });
});
