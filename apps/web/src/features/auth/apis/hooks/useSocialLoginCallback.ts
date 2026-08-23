import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useExchangeSocialLoginCode } from '@/features/auth/apis/mutations';
import { AUTH_FLOW_ERROR_CODE, AuthFlowError } from '@/features/auth/errors';
import { consumeOAuthCallback } from '@/features/auth/utils/oauthSession';
import { resolveAuthenticationResult } from '@/features/auth/utils/resolveAuthenticationResult';
import { setNativeRefreshToken } from '@/shared/apis/nativeAuthToken';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { isNativeApp } from '@/shared/lib/bridge';
import { useAuthStore } from '@/shared/stores/authStore';

/** OAuth 콜백을 한 번만 교환하고 인증 결과에 맞는 화면으로 이동합니다. */
export const useSocialLoginCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasStarted = useRef(false);
  const [callbackError, setCallbackError] = useState<Error | null>(null);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setSignupToken = useAuthStore((state) => state.setSignupToken);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  const exchangeMutation = useExchangeSocialLoginCode({
    mutation: {
      onSuccess: async (response) => {
        try {
          const result = resolveAuthenticationResult(response.data);

          if (result.type === 'termsAgreementRequired') {
            setInitialized(true);
            setSignupToken(result.signupToken);
            navigate(ROUTE_PATHS.agreement, { replace: true });
            return;
          }

          if (isNativeApp()) {
            const refreshToken = response.data?.refreshToken;

            if (!refreshToken) {
              throw new AuthFlowError(AUTH_FLOW_ERROR_CODE.INVALID_AUTH_RESPONSE);
            }

            await setNativeRefreshToken(refreshToken);
          }

          setInitialized(true);
          setAccessToken(result.accessToken);
          navigate(ROUTE_PATHS.home, { replace: true });
        } catch (error) {
          setCallbackError(
            error instanceof Error ? error : new Error('로그인 결과를 처리하지 못했습니다.')
          );
        }
      },
      onError: (error) => {
        setCallbackError(
          error instanceof Error ? error : new Error('로그인 코드를 교환하지 못했습니다.')
        );
      },
    },
  });
  const { isIdle, isPending, mutate } = exchangeMutation;

  useEffect(() => {
    if (hasStarted.current) return;

    hasStarted.current = true;

    try {
      const credentials = consumeOAuthCallback(searchParams);
      mutate({ data: credentials });
    } catch (error) {
      const callbackProcessingError =
        error instanceof Error ? error : new Error('로그인 콜백을 처리하지 못했습니다.');

      queueMicrotask(() => setCallbackError(callbackProcessingError));
    }
  }, [mutate, searchParams]);

  return {
    error: callbackError,
    isLoading: callbackError === null && (isIdle || isPending),
  };
};
