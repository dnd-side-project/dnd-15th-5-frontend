import { useNavigate } from 'react-router-dom';

import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { useUnsavedChangesBlocker } from '@/shared/hooks/useUnsavedChangesBlocker';

/** 프로필 수정 중 변경 사항이 있을 때 화면 이탈을 확인합니다. */
export const useProfileEditNavigationGuard = (hasChanges: boolean) => {
  const navigate = useNavigate();
  const navigationBlocker = useUnsavedChangesBlocker(hasChanges);

  const handleBack = () => navigate(-1);

  const navigateToMyPage = () => {
    navigationBlocker.allowNextNavigation();
    navigate(ROUTE_PATHS.myPage, { replace: true });
  };

  return {
    handleBack,
    handleContinueEditing: navigationBlocker.reset,
    handleDiscardChanges: navigationBlocker.proceed,
    isCancelDialogOpen: navigationBlocker.isBlocked,
    navigateToMyPage,
  };
};
