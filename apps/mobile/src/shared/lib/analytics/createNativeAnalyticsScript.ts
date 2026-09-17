import { NATIVE_ANALYTICS_EVENT } from '@chapchap/shared/analytics';

import type { NativeAnalyticsEvent } from '@chapchap/shared/analytics';

/** 분석 payload를 WebView의 DOM 이벤트로 안전하게 직렬화한다. */
export const createNativeAnalyticsScript = (event: NativeAnalyticsEvent) => {
  const serializedEvent = JSON.stringify(event).replaceAll('<', '\\u003c');

  return `window.dispatchEvent(new CustomEvent(${JSON.stringify(NATIVE_ANALYTICS_EVENT)}, { detail: ${serializedEvent} })); true;`;
};
