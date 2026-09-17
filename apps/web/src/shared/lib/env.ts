export const IS_DEVELOPMENT = import.meta.env.DEV;
export const APP_ENVIRONMENT = import.meta.env.MODE;
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const KAKAO_JAVASCRIPT_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;
export const MIXPANEL_PROJECT_TOKEN = import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN;

const sessionReplayPercent = Number(import.meta.env.VITE_MIXPANEL_SESSION_REPLAY_PERCENT);
export const MIXPANEL_SESSION_REPLAY_PERCENT = Number.isFinite(sessionReplayPercent)
  ? Math.min(100, Math.max(0, sessionReplayPercent))
  : 0;

// 'DEMO_MAP_ID'는 Google이 개발용으로 예약해둔 값으로, 실제 Map ID 없이도 지도 스타일링이 동작한다
export const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
