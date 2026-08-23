import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';

import GoogleMapView from './GoogleMapView';

import type { PropsWithChildren } from 'react';

const requestPosition = jest.fn();
let clickableIcons: boolean | undefined;
let disableDefaultUI: boolean | undefined;
let mockIsAutomaticPanEnabled: boolean | undefined;

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
  useMap: () => null,
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
jest.mock(
  '../current-location/CurrentLocationCameraController',
  () =>
    ({ isAutomaticPanEnabled }: { isAutomaticPanEnabled: boolean }) => {
      mockIsAutomaticPanEnabled = isAutomaticPanEnabled;
      return null;
    }
);
jest.mock('../RecommendationMapMarkers', () => () => null);
jest.mock('../stickers/MapStickers', () => () => null);
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
    mockIsAutomaticPanEnabled = undefined;
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' }, stepIndex: 0 });
  });

  it('Google 기본 UI와 POI 아이콘 클릭을 비활성화한다', () => {
    render(<GoogleMapView />);

    expect(disableDefaultUI).toBe(true);
    expect(clickableIcons).toBe(false);
  });

  it('선택한 장소로 진입하면 현재 위치 자동 카메라 이동을 비활성화한다', () => {
    useHomeBottomSheetStore.getState().showSelectedPlace('cafe-coffee');

    render(<GoogleMapView />);

    expect(mockIsAutomaticPanEnabled).toBe(false);
  });

  it('현재 위치 오류 안내가 표시된 상태에서 지도를 누르면 안내를 숨긴다', async () => {
    const user = userEvent.setup();
    render(<GoogleMapView />);

    await user.click(screen.getByRole('button', { name: '현재 위치 요청' }));
    expect(screen.getByRole('status')).toHaveTextContent('위치 오류');

    await user.click(screen.getByRole('button', { name: '지도 영역' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('지도 빈 영역을 누르면 선택한 스티커를 해제한다', async () => {
    const user = userEvent.setup();
    useHomeBottomSheetStore.getState().showSelectedPlace('cafe-coffee');
    render(<GoogleMapView />);

    await user.click(screen.getByRole('button', { name: '지도 영역' }));

    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'home' });
  });

  it('지도 빈 영역을 누르면 선택한 좋아요 마커도 해제한다', async () => {
    const user = userEvent.setup();
    useHomeBottomSheetStore.getState().showLikedRecommendation('recommendation-twosome');
    render(<GoogleMapView />);

    await user.click(screen.getByRole('button', { name: '지도 영역' }));

    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({ type: 'home' });
  });
});
