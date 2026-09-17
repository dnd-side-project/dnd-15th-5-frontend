import { ANALYTICS_EVENTS } from './constants';
import { isNativeAnalyticsEvent } from './guards';

describe('isNativeAnalyticsEvent', () => {
  it('허용된 이벤트명과 원시 속성을 통과시킨다', () => {
    expect(
      isNativeAnalyticsEvent({
        eventName: ANALYTICS_EVENTS.stepCompleted,
        properties: { screen_name: 'REC_ReceiptScan', duration_seconds: 1.2 },
      })
    ).toBe(true);
  });

  it('알 수 없는 이벤트나 중첩 객체 속성을 거부한다', () => {
    expect(isNativeAnalyticsEvent({ eventName: 'Unknown Event' })).toBe(false);
    expect(
      isNativeAnalyticsEvent({
        eventName: ANALYTICS_EVENTS.screenViewed,
        properties: { private_data: { value: 'hidden' } },
      })
    ).toBe(false);
  });
});
