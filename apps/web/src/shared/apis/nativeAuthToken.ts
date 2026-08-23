import { requestToNative } from '@/shared/lib/bridge';

/** 네이티브 보안 저장소의 앱 Refresh Token을 조회합니다. */
export const getNativeRefreshToken = async () => {
  const result = await requestToNative('getRefreshToken', {});

  return result.refreshToken;
};

/** 재발급으로 회전된 앱 Refresh Token을 네이티브 보안 저장소에 저장합니다. */
export const setNativeRefreshToken = async (refreshToken: string) => {
  await requestToNative('saveRefreshToken', { refreshToken });
};

/** 네이티브 보안 저장소의 앱 Refresh Token을 제거합니다. */
export const clearNativeRefreshToken = async () => {
  await requestToNative('clearRefreshToken', {});
};
