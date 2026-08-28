import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useExchangeSocialLoginCode } from '@/features/auth/apis/mutations';
import { AUTH_FLOW_ERROR_CODE, AuthFlowError } from '@/features/auth/errors';
import { reloadToAuthPath } from '@/features/auth/utils/authCallbackNavigation';
import { resolveAuthCallback } from '@/features/auth/utils/resolveAuthCallback';
import { resolveAuthenticationResult } from '@/features/auth/utils/resolveAuthenticationResult';
import {
  clearAuthenticationTokens,
  persistAuthenticationTokens,
} from '@/shared/apis/authTokenLifecycle';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { useAuthStore } from '@/shared/stores/authStore';
import { useToast } from '@/shared/ui/toast';

/** OAuth 콜백을 한 번만 교환하고 인증 결과에 맞는 화면으로 이동합니다. */
export const useSocialLoginCallback = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const hasStarted = useRef(false);
  const [callbackError, setCallbackError] = useState<Error | null>(null);
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

          await persistAuthenticationTokens({
            accessToken: result.accessToken,
            refreshToken: response.data?.refreshToken,
          });
          setInitialized(true);
          navigate(ROUTE_PATHS.home, { replace: true });
        } catch {
          await clearAuthenticationTokens();
          setCallbackError(new AuthFlowError(AUTH_FLOW_ERROR_CODE.INVALID_AUTH_RESPONSE));
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
      const result = resolveAuthCallback(searchParams);

      if (result.type === 'oauthCancelled') {
        navigate(ROUTE_PATHS.login, { replace: true });
        return;
      }

      if (result.type === 'withdrawalCancelled') {
        reloadToAuthPath(ROUTE_PATHS.myPage);
        return;
      }

      if (result.type === 'withdrawalSuccess') {
        void clearAuthenticationTokens().then(() => {
          queryClient.clear();
          showToast({ type: 'success', message: '회원 탈퇴가 완료되었습니다.' });
          navigate(ROUTE_PATHS.login, { replace: true });
        });
        return;
      }

      mutate({ data: result.credentials });
    } catch (error) {
      const callbackProcessingError =
        error instanceof Error ? error : new Error('로그인 콜백을 처리하지 못했습니다.');

      queueMicrotask(() => setCallbackError(callbackProcessingError));
    }
  }, [mutate, navigate, queryClient, searchParams, showToast]);

  return {
    error: callbackError,
    isLoading: callbackError === null && (isIdle || isPending),
  };
};
