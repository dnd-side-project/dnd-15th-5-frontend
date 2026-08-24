import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { logoutAuthentication } from '@/shared/apis';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { useToast } from '@/shared/ui/toast';

const LOGOUT_ERROR_MESSAGE = '로그아웃하지 못했습니다. 다시 시도해 주세요.';

/** 현재 로그인 환경의 Refresh Token을 폐기하고 로그인 화면으로 이동합니다. */
export const useLogout = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);

    try {
      await logoutAuthentication();
      navigate(ROUTE_PATHS.login, { replace: true });
    } catch {
      showToast({ type: 'error', message: LOGOUT_ERROR_MESSAGE });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, logout };
};
