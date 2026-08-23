import { StartClient } from '@/features/auth/apis/dto';
import { isNativeApp } from '@/shared/lib/bridge';

const LOCAL_WEB_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

/** 현재 실행 환경에 맞는 백엔드 인증 클라이언트 유형을 반환합니다. */
export const getOAuthClientType = (hostname = window.location.hostname) => {
  if (isNativeApp()) return StartClient.APP;

  return LOCAL_WEB_HOSTNAMES.has(hostname) ? StartClient.WEB_LOCAL : StartClient.WEB;
};
