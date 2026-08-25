import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'chapchap.auth.refreshToken';

/** 앱 Refresh Token을 OS 보안 저장소에서 조회합니다. */
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

/** 앱 Refresh Token을 OS 보안 저장소에 저장합니다. */
export const setRefreshToken = (refreshToken: string) =>
  SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

/** 로그아웃 또는 재발급 실패 시 앱 Refresh Token을 제거합니다. */
export const clearRefreshToken = () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
