import axios, { AxiosError, AxiosHeaders } from 'axios';

import { useAuthStore } from '@/shared/stores/authStore';

import { attachAuthInterceptors, isAuthRetryExcludedRequest } from './authInterceptors';

import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

type AuthInterceptorDependencies = Parameters<typeof attachAuthInterceptors>[1];

const createResponse = (
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown = {}
): AxiosResponse => ({
  config,
  data,
  headers: new AxiosHeaders(),
  status,
  statusText: status === 200 ? 'OK' : 'Unauthorized',
});

const rejectUnauthorized = (config: InternalAxiosRequestConfig) =>
  Promise.reject(
    new AxiosError(
      'Unauthorized',
      'ERR_BAD_REQUEST',
      config,
      undefined,
      createResponse(config, 401)
    )
  );

const createDependencies = (
  overrides: Partial<AuthInterceptorDependencies> = {}
): AuthInterceptorDependencies => ({
  isNativeApp: jest.fn(() => false),
  refreshWeb: jest.fn(async () => ({ data: { accessToken: 'refreshed-access-token' } })),
  refreshApp: jest.fn(async () => ({
    data: {
      accessToken: 'refreshed-access-token',
      refreshToken: 'rotated-refresh-token',
    },
  })),
  getNativeRefreshToken: jest.fn(async () => 'app-refresh-token'),
  setNativeRefreshToken: jest.fn(async () => undefined),
  clearNativeRefreshToken: jest.fn(async () => undefined),
  redirectToLogin: jest.fn(),
  ...overrides,
});

describe('authInterceptors', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      signupToken: null,
      isInitialized: true,
      isAuthenticated: false,
    });
  });

  it('일반 API 요청에 Access Token을 추가한다', async () => {
    useAuthStore.getState().setAccessToken('access-token');
    const instance = axios.create({
      adapter: async (config) => createResponse(config, 200),
    });
    const dependencies = createDependencies();
    const detach = attachAuthInterceptors(instance, dependencies);

    const response = await instance.get('/shops');

    expect(response.config.headers.get('Authorization')).toBe('Bearer access-token');
    detach();
  });

  it('약관 동의 요청에는 Signup Token을 추가한다', async () => {
    useAuthStore.getState().setSignupToken('signup-token');
    const instance = axios.create({
      adapter: async (config) => createResponse(config, 200),
    });
    const dependencies = createDependencies();
    const detach = attachAuthInterceptors(instance, dependencies);

    const response = await instance.post('/auth/signup/terms');

    expect(response.config.headers.get('Authorization')).toBe('Bearer signup-token');
    detach();
  });

  it('인증 발급·교환·로그아웃 요청에는 토큰을 추가하거나 401 재시도를 하지 않는다', async () => {
    useAuthStore.getState().setAccessToken('access-token');
    const instance = axios.create({ adapter: rejectUnauthorized });
    const dependencies = createDependencies();
    const detach = attachAuthInterceptors(instance, dependencies);

    await expect(instance.post('/auth/social/exchange')).rejects.toBeInstanceOf(AxiosError);

    expect(dependencies.refreshWeb).not.toHaveBeenCalled();
    expect(isAuthRetryExcludedRequest('/api/auth/signup/terms')).toBe(true);
    expect(isAuthRetryExcludedRequest('/api/auth/logout/web?source=test')).toBe(true);
    detach();
  });

  it('동시에 발생한 여러 401 응답은 웹 토큰을 한 번만 재발급하고 모두 재시도한다', async () => {
    useAuthStore.getState().setAccessToken('expired-access-token');
    let resolveRefresh: ((response: { data: { accessToken: string } }) => void) | undefined;
    const refreshWeb = jest.fn(
      () =>
        new Promise<{ data: { accessToken: string } }>((resolve) => {
          resolveRefresh = resolve;
        })
    );
    const instance = axios.create({
      adapter: async (config) => {
        if (config.headers.get('Authorization') !== 'Bearer refreshed-access-token') {
          return rejectUnauthorized(config);
        }

        return createResponse(config, 200);
      },
    });
    const dependencies = createDependencies({ refreshWeb });
    const detach = attachAuthInterceptors(instance, dependencies);

    const requests = Promise.all([instance.get('/shops'), instance.get('/reports')]);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(refreshWeb).toHaveBeenCalledTimes(1);

    resolveRefresh?.({ data: { accessToken: 'refreshed-access-token' } });
    await expect(requests).resolves.toHaveLength(2);
    expect(refreshWeb).toHaveBeenCalledTimes(1);
    detach();
  });

  it('재발급 완료 후 늦게 도착한 기존 토큰의 401은 추가 재발급 없이 재시도한다', async () => {
    useAuthStore.getState().setAccessToken('expired-access-token');
    let releaseLateUnauthorized: (() => void) | undefined;
    const waitForLateUnauthorized = new Promise<void>((resolve) => {
      releaseLateUnauthorized = resolve;
    });
    const instance = axios.create({
      adapter: async (config) => {
        const authorization = config.headers.get('Authorization');

        if (authorization === 'Bearer refreshed-access-token') {
          return createResponse(config, 200);
        }

        if (config.url === '/late') {
          await waitForLateUnauthorized;
        }

        return rejectUnauthorized(config);
      },
    });
    const dependencies = createDependencies();
    const detach = attachAuthInterceptors(instance, dependencies);

    const firstRequest = instance.get('/first');
    const lateRequest = instance.get('/late');

    await expect(firstRequest).resolves.toHaveProperty('status', 200);
    releaseLateUnauthorized?.();
    await expect(lateRequest).resolves.toHaveProperty('status', 200);

    expect(dependencies.refreshWeb).toHaveBeenCalledTimes(1);
    detach();
  });

  it('앱에서는 네이티브 Refresh Token으로 재발급하고 회전된 토큰을 저장한다', async () => {
    useAuthStore.getState().setAccessToken('expired-access-token');
    const instance = axios.create({
      adapter: async (config) => {
        if (config.headers.get('Authorization') !== 'Bearer refreshed-access-token') {
          return rejectUnauthorized(config);
        }

        return createResponse(config, 200);
      },
    });
    const dependencies = createDependencies({ isNativeApp: jest.fn(() => true) });
    const detach = attachAuthInterceptors(instance, dependencies);

    await instance.get('/shops');

    expect(dependencies.getNativeRefreshToken).toHaveBeenCalledTimes(1);
    expect(dependencies.refreshApp).toHaveBeenCalledWith('app-refresh-token');
    expect(dependencies.setNativeRefreshToken).toHaveBeenCalledWith('rotated-refresh-token');
    expect(dependencies.refreshWeb).not.toHaveBeenCalled();
    detach();
  });

  it('재발급 실패 시 토큰을 정리하고 로그인 화면으로 이동한다', async () => {
    useAuthStore.getState().setAccessToken('expired-access-token');
    const instance = axios.create({ adapter: rejectUnauthorized });
    const dependencies = createDependencies({
      isNativeApp: jest.fn(() => true),
      refreshApp: jest.fn(async () => {
        throw new Error('Refresh failed');
      }),
    });
    const detach = attachAuthInterceptors(instance, dependencies);

    await expect(instance.get('/shops')).rejects.toThrow('Refresh failed');

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(dependencies.clearNativeRefreshToken).toHaveBeenCalledTimes(1);
    expect(dependencies.redirectToLogin).toHaveBeenCalledTimes(1);
    detach();
  });
});
