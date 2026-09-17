import { ANALYTICS_EVENTS } from '@chapchap/shared/analytics';
import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { trackNativeAnalyticsEvent } from './nativeAnalytics';
import { useNativeScreenAnalytics } from './useNativeScreenAnalytics';

type FocusEffect = () => void | (() => void);
type AppStateChangeHandler = Parameters<typeof AppState.addEventListener>[1];

let focusEffect: FocusEffect | undefined;
let appStateChangeHandler: AppStateChangeHandler | undefined;
const removeAppStateHandler = jest.fn();

jest.mock('expo-router', () => ({
  useFocusEffect: (effect: FocusEffect) => {
    focusEffect = effect;
  },
}));
jest.mock('./nativeAnalytics', () => ({ trackNativeAnalyticsEvent: jest.fn() }));

const mockedTrackNativeAnalyticsEvent = jest.mocked(trackNativeAnalyticsEvent);

describe('useNativeScreenAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    focusEffect = undefined;
    appStateChangeHandler = undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_eventName, handler) => {
      appStateChangeHandler = handler;
      return { remove: removeAppStateHandler };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('화면 진입과 포커스 이탈 시 체류시간을 수집한다', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000);

    await renderHook(() =>
      useNativeScreenAnalytics({ screenName: 'REC_ReceiptScan', screenPath: '/camera' })
    );

    let cleanup: void | (() => void);
    await act(async () => {
      cleanup = focusEffect?.();
    });
    expect(mockedTrackNativeAnalyticsEvent).toHaveBeenNthCalledWith(
      1,
      ANALYTICS_EVENTS.screenViewed,
      {
        screen_name: 'REC_ReceiptScan',
        screen_path: '/camera',
        entry_reason: 'route_entered',
      }
    );

    now.mockReturnValue(2_500);
    await act(async () => cleanup?.());

    expect(mockedTrackNativeAnalyticsEvent).toHaveBeenNthCalledWith(
      2,
      ANALYTICS_EVENTS.screenExited,
      {
        screen_name: 'REC_ReceiptScan',
        screen_path: '/camera',
        duration_seconds: 1.5,
        exit_reason: 'focus_lost',
      }
    );
    expect(removeAppStateHandler).toHaveBeenCalledTimes(1);
  });

  it('백그라운드 이탈과 활성 복귀를 각각 한 번 수집한다', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    await renderHook(() =>
      useNativeScreenAnalytics({ screenName: 'REC_ReceiptConfirm', screenPath: '/receipt-confirm' })
    );
    await act(async () => {
      focusEffect?.();
    });
    mockedTrackNativeAnalyticsEvent.mockClear();

    await act(async () => {
      appStateChangeHandler?.('background');
      appStateChangeHandler?.('background');
      appStateChangeHandler?.('active');
    });

    expect(mockedTrackNativeAnalyticsEvent).toHaveBeenCalledTimes(2);
    expect(mockedTrackNativeAnalyticsEvent).toHaveBeenNthCalledWith(
      1,
      ANALYTICS_EVENTS.screenExited,
      expect.objectContaining({ exit_reason: 'app_backgrounded' })
    );
    expect(mockedTrackNativeAnalyticsEvent).toHaveBeenNthCalledWith(
      2,
      ANALYTICS_EVENTS.screenViewed,
      expect.objectContaining({ entry_reason: 'visibility_restored' })
    );
  });
});
