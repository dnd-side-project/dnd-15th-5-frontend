export const IS_DEVELOPMENT = import.meta.env.DEV;
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const KAKAO_JAVASCRIPT_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

// 'DEMO_MAP_ID'는 Google이 개발용으로 예약해둔 값으로, 실제 Map ID 없이도 지도 스타일링이 동작한다
export const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
