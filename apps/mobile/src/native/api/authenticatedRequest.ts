import {
  clearRefreshToken,
  getRefreshToken,
  setRefreshToken,
} from '@/native/auth/authTokenStorage';

import { clearAccessToken, getAccessToken, setAccessToken } from './accessTokenMemory';

type ApiResponse<TData> = {
  code?: string;
  message?: string;
  data?: TData;
};

type AuthenticationResponse = {
  accessToken?: string | null;
  refreshToken?: string | null;
};

type AuthenticatedRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

const API_REQUEST_ERROR_MESSAGE = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
let refreshRequest: Promise<string> | null = null;

/** 백엔드가 반환한 상태와 오류 코드를 보존하는 네이티브 API 오류. */
export class NativeApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string
  ) {
    super(message);
    this.name = 'NativeApiError';
  }
}

const createApiUrl = (path: string) => {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new NativeApiError('API 주소가 설정되지 않았습니다.');
  }

  return `${apiBaseUrl.replace(/\/$/u, '')}/${path.replace(/^\//u, '')}`;
};

const parseApiResponse = async <TData>(response: Response) => {
  try {
    return (await response.json()) as ApiResponse<TData>;
  } catch {
    return null;
  }
};

const refreshAccessToken = async () => {
  if (refreshRequest) {
    return refreshRequest;
  }

  refreshRequest = (async () => {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      throw new NativeApiError('로그인 정보가 없습니다. 다시 로그인해 주세요.', 401);
    }

    const response = await fetch(createApiUrl('/auth/token/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const body = await parseApiResponse<AuthenticationResponse>(response);
    const nextAccessToken = body?.data?.accessToken;
    const nextRefreshToken = body?.data?.refreshToken;

    if (!response.ok || !nextAccessToken || !nextRefreshToken) {
      throw new NativeApiError(
        body?.message || '로그인 정보가 만료되었습니다. 다시 로그인해 주세요.',
        response.status,
        body?.code
      );
    }

    await setRefreshToken(nextRefreshToken);
    setAccessToken(nextAccessToken);

    return nextAccessToken;
  })()
    .catch(async (error: unknown) => {
      clearAccessToken();
      await clearRefreshToken();
      throw error;
    })
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
};

const requestWithToken = (
  url: string,
  accessToken: string,
  { headers, ...options }: AuthenticatedRequestOptions
) =>
  fetch(url, {
    ...options,
    headers: {
      ...headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

/**
 * 네이티브 화면에서 인증이 필요한 ChapChap API를 호출한다.
 *
 * Access Token은 메모리에만 보관하고, 없거나 401이면 SecureStore의 Refresh Token으로
 * 한 번 재발급한 뒤 요청을 다시 시도한다.
 */
export const authenticatedRequest = async <TData>(
  path: string,
  options: AuthenticatedRequestOptions = {}
): Promise<TData> => {
  const url = createApiUrl(path);
  const requestAccessToken = getAccessToken() ?? (await refreshAccessToken());
  let response = await requestWithToken(url, requestAccessToken, options);

  if (response.status === 401) {
    const currentAccessToken = getAccessToken();
    const retryAccessToken =
      currentAccessToken && currentAccessToken !== requestAccessToken
        ? currentAccessToken
        : await refreshAccessToken();

    response = await requestWithToken(url, retryAccessToken, options);
  }

  const body = await parseApiResponse<TData>(response);

  if (!response.ok) {
    throw new NativeApiError(
      body?.message || API_REQUEST_ERROR_MESSAGE,
      response.status,
      body?.code
    );
  }

  if (body?.data === undefined) {
    throw new NativeApiError(API_REQUEST_ERROR_MESSAGE, response.status, body?.code);
  }

  return body.data;
};
