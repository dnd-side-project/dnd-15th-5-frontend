import { ANALYTICS_EVENTS, NATIVE_ANALYTICS_EVENT } from '@chapchap/shared/analytics';

import { createNativeAnalyticsScript } from './createNativeAnalyticsScript';

describe('createNativeAnalyticsScript', () => {
  it('네이티브 분석 이벤트를 WebView DOM 이벤트로 만든다', () => {
    const script = createNativeAnalyticsScript({
      eventName: ANALYTICS_EVENTS.screenViewed,
      properties: { screen_name: 'REC_ReceiptScan' },
    });

    expect(script).toContain(`new CustomEvent(${JSON.stringify(NATIVE_ANALYTICS_EVENT)}`);
    expect(script).toContain('"screen_name":"REC_ReceiptScan"');
    expect(script.endsWith('true;')).toBe(true);
  });
});
