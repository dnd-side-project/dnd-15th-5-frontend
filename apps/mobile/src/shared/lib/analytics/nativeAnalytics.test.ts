import { ANALYTICS_EVENTS } from '@chapchap/shared/analytics';

import {
  markNativeAnalyticsNotReady,
  markNativeAnalyticsReady,
  resetNativeAnalyticsForTest,
  subscribeNativeAnalytics,
  trackNativeAnalyticsEvent,
} from './nativeAnalytics';

describe('nativeAnalytics', () => {
  beforeEach(() => resetNativeAnalyticsForTest());
  afterEach(() => resetNativeAnalyticsForTest());

  it('WebView 준비 전 이벤트를 보관하고 준비 신호 뒤에 전달한다', () => {
    const listener = jest.fn();
    subscribeNativeAnalytics(listener);

    trackNativeAnalyticsEvent(ANALYTICS_EVENTS.stepCompleted, { screen_name: 'REC_ReceiptScan' });
    expect(listener).not.toHaveBeenCalled();

    markNativeAnalyticsReady();
    expect(listener).toHaveBeenCalledWith({
      eventName: ANALYTICS_EVENTS.stepCompleted,
      properties: { screen_name: 'REC_ReceiptScan' },
    });
  });

  it('새 문서를 로드하는 동안 발생한 이벤트도 다음 준비 신호까지 보관한다', () => {
    const listener = jest.fn();
    subscribeNativeAnalytics(listener);
    markNativeAnalyticsReady();
    markNativeAnalyticsNotReady();

    trackNativeAnalyticsEvent(ANALYTICS_EVENTS.stepAttempted, { attempt_number: 1 });
    expect(listener).not.toHaveBeenCalled();

    markNativeAnalyticsReady();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
