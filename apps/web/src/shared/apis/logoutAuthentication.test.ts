import { performLogoutAuthentication } from './logoutAuthentication';

type LogoutAuthenticationDependencies = NonNullable<
  Parameters<typeof performLogoutAuthentication>[0]
>;

const createDependencies = (
  overrides: Partial<LogoutAuthenticationDependencies> = {}
): LogoutAuthenticationDependencies => ({
  captureException: jest.fn(),
  clearAuthenticationTokens: jest.fn(async () => undefined),
  getNativeRefreshToken: jest.fn(async () => 'refresh-token'),
  isNativeApp: jest.fn(() => false),
  logoutApp: jest.fn(async () => undefined),
  logoutWeb: jest.fn(async () => undefined),
  unregisterDeviceToken: jest.fn(async () => undefined),
  ...overrides,
});

describe('logoutAuthentication', () => {
  it('웹 Refresh Token을 폐기하고 인증 정보를 정리한다', async () => {
    const dependencies = createDependencies();

    await performLogoutAuthentication(dependencies);

    expect(dependencies.logoutWeb).toHaveBeenCalledTimes(1);
    expect(dependencies.logoutApp).not.toHaveBeenCalled();
    expect(dependencies.unregisterDeviceToken).not.toHaveBeenCalled();
    expect(dependencies.clearAuthenticationTokens).toHaveBeenCalledTimes(1);
  });

  it('앱은 SecureStore의 Refresh Token을 서버 폐기 요청에 사용한다', async () => {
    const dependencies = createDependencies({ isNativeApp: jest.fn(() => true) });

    await performLogoutAuthentication(dependencies);

    expect(dependencies.logoutApp).toHaveBeenCalledWith('refresh-token');
    expect(dependencies.unregisterDeviceToken).toHaveBeenCalledTimes(1);
    expect(dependencies.logoutWeb).not.toHaveBeenCalled();
    expect(dependencies.clearAuthenticationTokens).toHaveBeenCalledTimes(1);
  });

  it('디바이스 토큰 삭제가 실패해도 로그아웃과 로컬 인증 정리를 계속한다', async () => {
    const unregisterError = new Error('unregister failed');
    const dependencies = createDependencies({
      isNativeApp: jest.fn(() => true),
      unregisterDeviceToken: jest.fn(async () => Promise.reject(unregisterError)),
    });

    await expect(performLogoutAuthentication(dependencies)).resolves.toBeUndefined();

    expect(dependencies.logoutApp).toHaveBeenCalledWith('refresh-token');
    expect(dependencies.captureException).toHaveBeenCalledWith(unregisterError);
    expect(dependencies.clearAuthenticationTokens).toHaveBeenCalledTimes(1);
  });

  it('Refresh Token 조회가 실패해도 디바이스 토큰 삭제와 로컬 인증 정리를 계속한다', async () => {
    const refreshTokenError = new Error('refresh token failed');
    const dependencies = createDependencies({
      isNativeApp: jest.fn(() => true),
      getNativeRefreshToken: jest.fn(async () => Promise.reject(refreshTokenError)),
    });

    await expect(performLogoutAuthentication(dependencies)).resolves.toBeUndefined();

    expect(dependencies.unregisterDeviceToken).toHaveBeenCalledTimes(1);
    expect(dependencies.logoutApp).not.toHaveBeenCalled();
    expect(dependencies.captureException).toHaveBeenCalledWith(refreshTokenError);
    expect(dependencies.clearAuthenticationTokens).toHaveBeenCalledTimes(1);
  });

  it('웹 로그아웃 요청이 실패해도 로컬 인증 정리를 수행한다', async () => {
    const logoutError = new Error('logout failed');
    const dependencies = createDependencies({
      logoutWeb: jest.fn(async () => Promise.reject(logoutError)),
    });

    await expect(performLogoutAuthentication(dependencies)).resolves.toBeUndefined();

    expect(dependencies.captureException).toHaveBeenCalledWith(logoutError);
    expect(dependencies.clearAuthenticationTokens).toHaveBeenCalledTimes(1);
  });
});
