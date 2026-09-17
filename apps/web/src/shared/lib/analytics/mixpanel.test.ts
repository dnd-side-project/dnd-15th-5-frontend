import mixpanel from 'mixpanel-browser';

import {
  ANALYTICS_EVENTS,
  identifyAnalyticsUser,
  initializeAnalytics,
  resetAnalyticsUser,
  resetAnalyticsForTest,
  trackAnalyticsEvent,
  trackUtTaskCompleted,
} from './mixpanel';

jest.mock('mixpanel-browser', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    identify: jest.fn(),
    register: jest.fn(),
    reset: jest.fn(),
    track: jest.fn(),
  },
}));
jest.mock('@/shared/lib/env', () => ({
  APP_ENVIRONMENT: 'test',
  IS_DEVELOPMENT: false,
  MIXPANEL_PROJECT_TOKEN: 'test-project-token',
  MIXPANEL_SESSION_REPLAY_PERCENT: 100,
}));
jest.mock('./deviceIdentity', () => ({
  getOrCreateAnalyticsDeviceId: () => 'test-device-id',
}));

const mockedMixpanel = jest.mocked(mixpanel);

describe('Mixpanel analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAnalyticsForTest();
  });

  it('클릭과 Replay를 개인정보 보호 설정으로 초기화한다', () => {
    initializeAnalytics();

    expect(mockedMixpanel.init).toHaveBeenCalledWith(
      'test-project-token',
      expect.objectContaining({
        autocapture: expect.objectContaining({
          click: true,
          input: false,
          capture_text_content: false,
          capture_extra_attrs: ['data-analytics-id'],
        }),
        record_block_selector: 'video, canvas, [data-mp-block]',
        record_heatmap_data: true,
        record_mask_all_inputs: true,
        record_mask_all_text: false,
        record_mask_text_selector: '[data-mp-mask]',
        record_network: false,
        record_sessions_percent: 100,
      })
    );
    expect(mockedMixpanel.register).toHaveBeenCalledWith({
      app: 'web',
      analytics_environment: 'test',
      device_id: 'test-device-id',
    });
  });

  it('초기화 뒤 표준 이벤트와 UT 완료 이벤트를 전송한다', () => {
    initializeAnalytics();

    trackAnalyticsEvent(ANALYTICS_EVENTS.screenViewed, { screen_name: 'MAP_Main' });
    trackUtTaskCompleted('REP02');

    expect(mockedMixpanel.track).toHaveBeenNthCalledWith(
      1,
      ANALYTICS_EVENTS.screenViewed,
      { screen_name: 'MAP_Main' },
      undefined
    );
    expect(mockedMixpanel.track).toHaveBeenNthCalledWith(
      2,
      ANALYTICS_EVENTS.utTaskCompleted,
      { target_screen: 'REP02' },
      undefined
    );
  });

  it('로그인 사용자를 서버 userId로 식별한다', () => {
    initializeAnalytics();

    identifyAnalyticsUser(123);

    expect(mockedMixpanel.identify).toHaveBeenCalledWith('123');
  });

  it('사용자 식별을 초기화한 뒤 공통 이벤트 속성을 다시 등록한다', () => {
    initializeAnalytics();
    mockedMixpanel.register.mockClear();

    resetAnalyticsUser();

    expect(mockedMixpanel.reset).toHaveBeenCalledTimes(1);
    expect(mockedMixpanel.register).toHaveBeenCalledWith({
      app: 'web',
      analytics_environment: 'test',
      device_id: 'test-device-id',
    });
  });
});
