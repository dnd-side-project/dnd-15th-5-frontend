import { ANALYTICS_EVENTS } from './constants';

import type { AnalyticsPropertyValue, NativeAnalyticsEvent } from './types';

const ANALYTICS_EVENT_NAMES = new Set<string>(Object.values(ANALYTICS_EVENTS));

const isAnalyticsPropertyValue = (value: unknown): value is AnalyticsPropertyValue =>
  value === null || ['boolean', 'number', 'string'].includes(typeof value);

/** WebView DOM 이벤트가 허용된 분석 이벤트와 원시 속성만 포함하는지 확인한다. */
export const isNativeAnalyticsEvent = (value: unknown): value is NativeAnalyticsEvent => {
  if (!value || typeof value !== 'object') return false;

  const { eventName, properties } = value as Partial<NativeAnalyticsEvent>;

  if (typeof eventName !== 'string' || !ANALYTICS_EVENT_NAMES.has(eventName)) return false;
  if (properties === undefined) return true;
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return false;

  return Object.values(properties).every(isAnalyticsPropertyValue);
};
