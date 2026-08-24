import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';

import CurrentLocationButton from './CurrentLocationButton';

import type { PropsWithChildren } from 'react';

const panTo = jest.fn();
const requestPosition = jest.fn();
let map: { panTo: typeof panTo } | null = { panTo };

jest.mock('@vis.gl/react-google-maps', () => ({
  ControlPosition: { RIGHT_BOTTOM: 9 },
  MapControl: ({ children }: PropsWithChildren) => <>{children}</>,
  useMap: () => map,
}));

describe('<CurrentLocationButton />', () => {
  beforeEach(() => {
    panTo.mockReset();
    requestPosition.mockReset();
    map = { panTo };
    useHomeBottomSheetStore.setState({ visibleHeightPx: 0 });
  });

  it('현재 바텀시트의 실제 높이만큼 위에 같은 간격으로 배치한다', () => {
    useHomeBottomSheetStore.setState({ visibleHeightPx: 320 });
    render(
      <CurrentLocationButton
        position={null}
        isLoading={false}
        errorMessage={null}
        onRequestPosition={requestPosition}
      />
    );

    const buttonContainer = screen.getByRole('button', { name: '현재 위치로 이동' }).parentElement
      ?.parentElement as HTMLElement;

    expect(buttonContainer).toHaveStyle({
      bottom: 'max(calc(320px + 0.75rem), calc(6.5rem + env(safe-area-inset-bottom)))',
    });
  });

  it('바텀시트가 내려가도 하단 탭바 아래로 이동하지 않는다', () => {
    render(
      <CurrentLocationButton
        position={null}
        isLoading={false}
        errorMessage={null}
        onRequestPosition={requestPosition}
      />
    );

    const buttonContainer = screen.getByRole('button', { name: '현재 위치로 이동' }).parentElement
      ?.parentElement as HTMLElement;

    expect(buttonContainer).toHaveStyle({
      bottom: 'max(calc(0px + 0.75rem), calc(6.5rem + env(safe-area-inset-bottom)))',
    });
  });

  it('현재 위치가 없으면 버튼을 눌러 위치를 다시 요청한다', async () => {
    const user = userEvent.setup();
    render(
      <CurrentLocationButton
        position={null}
        isLoading={false}
        errorMessage={null}
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
        errorMessage={null}
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
        errorMessage={null}
        onRequestPosition={requestPosition}
      />
    );

    expect(screen.getByRole('button', { name: '현재 위치로 이동' })).toBeDisabled();
  });

  it('오류 메시지가 전달되지 않으면 안내를 보여주지 않는다', () => {
    render(
      <CurrentLocationButton
        position={null}
        isLoading={false}
        errorMessage={null}
        onRequestPosition={requestPosition}
      />
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('전달된 오류 메시지를 보여준다', () => {
    render(
      <CurrentLocationButton
        position={null}
        isLoading={false}
        errorMessage="브라우저 설정에서 위치 권한을 허용해주세요."
        onRequestPosition={requestPosition}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      '브라우저 설정에서 위치 권한을 허용해주세요.'
    );
  });
});
