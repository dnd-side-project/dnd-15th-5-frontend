import { useNavigate } from 'react-router-dom';

import type {
  ApiResponseAuthenticationResponse,
  TermsAgreementRequest,
} from '@/features/auth/apis/dto';
import { useAgree } from '@/features/auth/apis/mutations';
import { resolveAuthenticationResult } from '@/features/auth/utils/resolveAuthenticationResult';
import {
  clearAuthenticationTokens,
  persistAuthenticationTokens,
} from '@/shared/apis/authTokenLifecycle';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { useAuthStore } from '@/shared/stores/authStore';
import { useToast } from '@/shared/ui/toast';

const TERMS_AGREEMENT_ERROR_MESSAGE = '약관 동의를 완료하지 못했습니다. 다시 시도해 주세요.';
const MISSING_SIGNUP_TOKEN_MESSAGE = '가입 인증 정보가 만료되었습니다. 다시 로그인해 주세요.';
const AUTHENTICATION_PROCESSING_ERROR_MESSAGE =
  '로그인 정보를 저장하지 못했습니다. 다시 로그인해 주세요.';

/** Signup Token으로 약관 동의를 제출하고 완료된 인증 정보를 저장합니다. */
export const useTermsAgreement = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const signupToken = useAuthStore((state) => state.signupToken);

  const handleAuthenticationSuccess = async (response: ApiResponseAuthenticationResponse) => {
    try {
      const result = resolveAuthenticationResult(response.data);

      if (result.type !== 'authenticated') {
        throw new Error(AUTHENTICATION_PROCESSING_ERROR_MESSAGE);
      }

      await persistAuthenticationTokens({
        accessToken: result.accessToken,
        refreshToken: response.data?.refreshToken,
      });
      navigate(ROUTE_PATHS.onboarding, { replace: true });
    } catch {
      await clearAuthenticationTokens();
      showToast({ type: 'error', message: AUTHENTICATION_PROCESSING_ERROR_MESSAGE });
      navigate(ROUTE_PATHS.login, { replace: true });
    }
  };

  const agreementMutation = useAgree({
    mutation: {
      onSuccess: handleAuthenticationSuccess,
      onError: () => {
        showToast({ type: 'error', message: TERMS_AGREEMENT_ERROR_MESSAGE });
      },
    },
  });

  const submitTermsAgreement = (agreement: TermsAgreementRequest) => {
    if (!signupToken) {
      showToast({ type: 'error', message: MISSING_SIGNUP_TOKEN_MESSAGE });
      navigate(ROUTE_PATHS.login, { replace: true });
      return;
    }

    agreementMutation.mutate({ data: agreement });
  };

  return {
    submitTermsAgreement,
    isLoading: agreementMutation.isPending,
  };
};
