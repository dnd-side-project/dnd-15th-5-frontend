import { logoutAuthentication } from './logoutAuthentication';

type LogoutAuthenticationDependencies = NonNullable<Parameters<typeof logoutAuthentication>[0]>;

const createDependencies = (
  overrides: Partial<LogoutAuthenticationDependencies> = {}
): LogoutAuthenticationDependencies => ({
  clearAuthenticationTokens: jest.fn(async () => undefined),
  getNativeRefreshToken: jest.fn(async () => 'refresh-token'),
  isNativeApp: jest.fn(() => false),
  logoutApp: jest.fn(async () => undefined),
  logoutWeb: jest.fn(async () => undefined),
  ...overrides,
});

describe('logoutAuthentication', () => {
  it('웹 Refresh Token을 폐기하고 인증 정보를 정리한다', async () => {
    const dependencies = createDependencies();

    await logoutAuthentication(dependencies);

    expect(dependencies.logoutWeb).toHaveBeenCalledTimes(1);
    expect(dependencies.logoutApp).not.toHaveBeenCalled();
    expect(dependencies.clearAuthenticationTokens).toHaveBeenCalledTimes(1);
  });

  it('앱은 SecureStore의 Refresh Token을 서버 폐기 요청에 사용한다', async () => {
    const dependencies = createDependencies({ isNativeApp: jest.fn(() => true) });

    await logoutAuthentication(dependencies);

    expect(dependencies.logoutApp).toHaveBeenCalledWith('refresh-token');
    expect(dependencies.logoutWeb).not.toHaveBeenCalled();
    expect(dependencies.clearAuthenticationTokens).toHaveBeenCalledTimes(1);
  });
});
