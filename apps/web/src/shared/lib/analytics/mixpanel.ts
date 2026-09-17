import { ANALYTICS_EVENTS } from '@chapchap/shared/analytics';
import mixpanel from 'mixpanel-browser';

import {
  APP_ENVIRONMENT,
  IS_DEVELOPMENT,
  MIXPANEL_PROJECT_TOKEN,
  MIXPANEL_SESSION_REPLAY_PERCENT,
} from '@/shared/lib/env';

import { getOrCreateAnalyticsDeviceId } from './deviceIdentity';

import type { AnalyticsEventName } from '@chapchap/shared/analytics';
import type { Dict, RequestOptions } from 'mixpanel-browser';

export { ANALYTICS_EVENTS };

let isInitialized = false;

const registerDefaultProperties = () => {
  mixpanel.register({
    app: 'web',
    analytics_environment: APP_ENVIRONMENT,
    device_id: getOrCreateAnalyticsDeviceId(),
  });
};

/** 프로젝트 토큰이 있는 환경에서만 개인정보 보호 설정과 함께 Mixpanel을 시작합니다. */
export const initializeAnalytics = () => {
  if (isInitialized || !MIXPANEL_PROJECT_TOKEN) return;

  mixpanel.init(MIXPANEL_PROJECT_TOKEN, {
    autocapture: {
      click: true,
      input: false,
      pageview: false,
      rage_click: false,
      dead_click: false,
      scroll: false,
      submit: false,
      capture_text_content: false,
      capture_extra_attrs: ['data-analytics-id'],
    },
    debug: IS_DEVELOPMENT,
    persistence: 'localStorage',
    record_block_selector: 'video, canvas, [data-mp-block]',
    record_canvas: false,
    record_console: false,
    record_heatmap_data: MIXPANEL_SESSION_REPLAY_PERCENT > 0,
    record_mask_all_inputs: true,
    record_mask_all_text: false,
    record_mask_text_selector: '[data-mp-mask]',
    record_network: false,
    record_sessions_percent: MIXPANEL_SESSION_REPLAY_PERCENT,
    track_pageview: false,
  });

  registerDefaultProperties();
  isInitialized = true;
};

/** 로그인 계정의 서버 식별자를 Mixpanel distinct_id로 연결합니다. */
export const identifyAnalyticsUser = (userId: number) => {
  if (!isInitialized) return;
  mixpanel.identify(String(userId));
};

/** 로그아웃·인증 만료 시 이전 계정 식별자를 제거하고 기본 속성을 복원합니다. */
export const resetAnalyticsUser = () => {
  if (!isInitialized) return;
  mixpanel.reset();
  registerDefaultProperties();
};

export const trackAnalyticsEvent = (
  eventName: AnalyticsEventName,
  properties?: Dict,
  options?: RequestOptions
) => {
  if (!isInitialized) return;
  mixpanel.track(eventName, properties, options);
};

export const trackUtTaskCompleted = (targetScreen: string, properties?: Dict) => {
  trackAnalyticsEvent(ANALYTICS_EVENTS.utTaskCompleted, {
    target_screen: targetScreen,
    ...properties,
  });
};

/** 테스트에서 초기화 여부가 다음 테스트로 새지 않게 되돌립니다. */
export const resetAnalyticsForTest = () => {
  isInitialized = false;
};
