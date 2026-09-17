export const ANALYTICS_EVENTS = {
  screenViewed: 'Screen Viewed',
  screenExited: 'Screen Exited',
  stepAttempted: 'Step Attempted',
  stepCompleted: 'Step Completed',
  uiStateViewed: 'UI State Viewed',
  utTaskCompleted: 'UT Task Completed',
} as const;

/** 네이티브 화면에서 만든 분석 이벤트를 메인 WebView에 전달하는 DOM 이벤트 이름. */
export const NATIVE_ANALYTICS_EVENT = 'chapchap:native-analytics';
