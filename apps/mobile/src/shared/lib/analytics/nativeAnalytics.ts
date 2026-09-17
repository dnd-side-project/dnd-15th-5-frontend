import type { NativeAnalyticsEvent } from '@chapchap/shared/analytics';

type NativeAnalyticsListener = (event: NativeAnalyticsEvent) => void;

const listeners = new Set<NativeAnalyticsListener>();
const pendingEvents: NativeAnalyticsEvent[] = [];

/** 네이티브 화면 이벤트를 동일 사용자 세션을 가진 메인 WebView의 Mixpanel로 전달한다. */
export const trackNativeAnalyticsEvent = (
  eventName: NativeAnalyticsEvent['eventName'],
  properties?: NativeAnalyticsEvent['properties']
) => {
  const event = { eventName, properties };

  if (listeners.size === 0) {
    pendingEvents.push(event);
    return;
  }

  listeners.forEach((listener) => listener(event));
};

/** 메인 WebView가 준비되기 전에 쌓인 이벤트까지 순서대로 전달한다. */
export const subscribeNativeAnalytics = (listener: NativeAnalyticsListener) => {
  listeners.add(listener);
  pendingEvents.splice(0).forEach(listener);

  return () => {
    listeners.delete(listener);
  };
};
