import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { logoutAuthentication } from '@/shared/apis';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

/** 현재 로그인 환경의 Refresh Token을 폐기하고 로그인 화면으로 이동합니다. */
export const useLogout = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);

    try {
      await logoutAuthentication();
      navigate(ROUTE_PATHS.login, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, logout };
};
