import { logoutApp, logoutWeb } from '@/features/auth/apis/clients';
import { unregisterDeviceToken } from '@/features/notification/apis/clients';
import { configureLogoutAuthentication as configureSharedLogoutAuthentication } from '@/shared/apis';
import type { LogoutServerDependencies } from '@/shared/apis/logoutAuthentication';

import { configureLogoutAuthentication } from './configureLogoutAuthentication';

jest.mock('@/features/auth/apis/clients', () => ({
  logoutApp: jest.fn(),
  logoutWeb: jest.fn(),
}));
jest.mock('@/features/notification/apis/clients', () => ({ unregisterDeviceToken: jest.fn() }));
jest.mock('@/features/notification/hooks/pushTokenSyncLifecycle', () => ({
  stopPushTokenSyncAndDrain: jest.fn(),
}));
jest.mock('@/shared/apis', () => ({ configureLogoutAuthentication: jest.fn() }));

const mockConfigureSharedLogoutAuthentication = jest.mocked(configureSharedLogoutAuthentication);

describe('configureLogoutAuthentication', () => {
  it('생성된 로그아웃 API를 공통 로그아웃 흐름에 연결한다', async () => {
    configureLogoutAuthentication();
    const dependencies = mockConfigureSharedLogoutAuthentication.mock
      .calls[0]?.[0] as LogoutServerDependencies;

    await dependencies.logoutApp('refresh-token');
    await dependencies.logoutWeb();
    await dependencies.stopPushTokenSyncAndDrain();
    await dependencies.unregisterDeviceToken();

    expect(logoutApp).toHaveBeenCalledWith({ refreshToken: 'refresh-token' });
    expect(logoutWeb).toHaveBeenCalledWith();
    expect(unregisterDeviceToken).toHaveBeenCalledWith();
    expect(dependencies.stopPushTokenSyncAndDrain).toBeDefined();
  });
});
