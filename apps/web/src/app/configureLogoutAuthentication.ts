import { logoutApp, logoutWeb } from '@/features/auth/apis/clients';
import { unregisterDeviceToken } from '@/features/notification/apis/clients';
import { configureLogoutAuthentication as configureSharedLogoutAuthentication } from '@/shared/apis';

/** 생성된 인증·알림 API를 공통 로그아웃 흐름에 연결합니다. */
export const configureLogoutAuthentication = () =>
  configureSharedLogoutAuthentication({
    logoutApp: async (refreshToken) => {
      await logoutApp({ refreshToken });
    },
    logoutWeb: async () => {
      await logoutWeb();
    },
    unregisterDeviceToken: async () => {
      await unregisterDeviceToken();
    },
  });
