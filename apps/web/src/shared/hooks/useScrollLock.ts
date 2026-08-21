import { useEffect } from 'react';

let scrollLockCount = 0;
let originalBodyOverflow = '';

/**
 * 활성화된 동안 `body` 스크롤을 잠급니다.
 *
 * 여러 컴포넌트가 동시에 사용해도 모든 잠금이 해제된 뒤에만 기존 `overflow` 값을 복원합니다.
 * 모달이나 바텀시트가 열린 동안 배경 화면의 스크롤을 막을 때 사용합니다.
 *
 * @example
 * ```tsx
 * useScrollLock(isModalOpen);
 * ```
 *
 * @param isLocked - 스크롤 잠금 활성화 여부입니다. 기본값은 `true`입니다.
 */
export const useScrollLock = (isLocked = true) => {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    if (scrollLockCount === 0) {
      originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    scrollLockCount += 1;

    return () => {
      scrollLockCount -= 1;
      if (scrollLockCount === 0) {
        document.body.style.overflow = originalBodyOverflow;
      }
    };
  }, [isLocked]);
};
