import type { ANALYTICS_EVENTS } from './constants';

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsPropertyValue = boolean | number | string | null;

export type NativeAnalyticsEvent = {
  eventName: AnalyticsEventName;
  properties?: Record<string, AnalyticsPropertyValue>;
};
