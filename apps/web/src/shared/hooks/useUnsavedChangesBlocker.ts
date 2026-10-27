import { useRef } from 'react';
import { useBlocker } from 'react-router-dom';

/** 변경 사항이 있을 때 라우트 이동을 막고, 확인 후 진행하거나 취소할 수 있게 합니다. */
export const useUnsavedChangesBlocker = (hasUnsavedChanges: boolean) => {
  const allowNavigationRef = useRef(false);
  const blocker = useBlocker(() => hasUnsavedChanges && !allowNavigationRef.current);

  return {
    isBlocked: blocker.state === 'blocked',
    proceed: () => {
      if (blocker.state === 'blocked') blocker.proceed();
    },
    reset: () => {
      if (blocker.state === 'blocked') blocker.reset();
    },
    allowNextNavigation: () => {
      allowNavigationRef.current = true;
    },
  };
};
