import type { NativeAnalyticsEvent } from '@chapchap/shared/analytics';

type NativeAnalyticsListener = (event: NativeAnalyticsEvent) => void;

const listeners = new Set<NativeAnalyticsListener>();
const pendingEvents: NativeAnalyticsEvent[] = [];
let isWebViewReady = false;

const flushPendingEvents = () => {
  if (!isWebViewReady || listeners.size === 0) return;

  const events = pendingEvents.splice(0);
  events.forEach((event) => listeners.forEach((listener) => listener(event)));
};

/** 네이티브 화면 이벤트를 동일 사용자 세션을 가진 메인 WebView의 Mixpanel로 전달한다. */
export const trackNativeAnalyticsEvent = (
  eventName: NativeAnalyticsEvent['eventName'],
  properties?: NativeAnalyticsEvent['properties']
) => {
  const event = { eventName, properties };

  if (!isWebViewReady || listeners.size === 0) {
    pendingEvents.push(event);
    return;
  }

  listeners.forEach((listener) => listener(event));
};

/** 메인 WebView에 이벤트를 주입할 리스너를 등록한다. */
export const subscribeNativeAnalytics = (listener: NativeAnalyticsListener) => {
  listeners.add(listener);
  flushPendingEvents();

  return () => {
    listeners.delete(listener);
  };
};

/** 웹 문서가 분석 수신 리스너를 등록한 뒤 대기 이벤트를 순서대로 전달한다. */
export const markNativeAnalyticsReady = () => {
  isWebViewReady = true;
  flushPendingEvents();
};

/** WebView가 새 문서를 로드하는 동안 이벤트를 다시 큐에 보관한다. */
export const markNativeAnalyticsNotReady = () => {
  isWebViewReady = false;
};

/** 테스트 간 모듈 상태가 공유되지 않도록 초기화한다. */
export const resetNativeAnalyticsForTest = () => {
  listeners.clear();
  pendingEvents.splice(0);
  isWebViewReady = false;
};
