import { useState } from 'react';

import { AuthFlowError } from '@/features/auth/errors';
import { startSocialLogin } from '@/features/auth/utils/startSocialLogin';
import { useToast } from '@/shared/ui/toast';

import type { SocialLoginProvider } from '@chapchap/shared/bridge';

const SOCIAL_LOGIN_START_ERROR_MESSAGE: Record<SocialLoginProvider, string> = {
  kakao: '카카오 로그인을 시작하지 못했습니다. 다시 시도해 주세요.',
  google: '구글 로그인을 시작하지 못했습니다. 다시 시도해 주세요.',
};

/** OAuth 로그인을 시작하고 제공자별 이동 실패 상태를 관리합니다. */
export const useSocialLogin = (provider: SocialLoginProvider) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    setIsLoading(true);

    try {
      await startSocialLogin(provider);
    } catch (error) {
      setIsLoading(false);
      showToast({
        type: 'error',
        message:
          error instanceof AuthFlowError
            ? error.message
            : SOCIAL_LOGIN_START_ERROR_MESSAGE[provider],
      });
    }
  };

  return { login, isLoading };
};
