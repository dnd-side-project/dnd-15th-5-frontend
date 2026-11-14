import { useLayoutEffect } from 'react';

import type { RefObject } from 'react';

/**
 * 경로나 단계 등 resetKey가 바뀌면 스크롤을 즉시 맨 위로 초기화합니다.
 * scrollContainerRef를 생략하면 window를 사용하며, 전달한 ref가 비어 있으면 초기화하지 않습니다.
 */
export const useScrollToTop = (
  resetKey: string | number,
  scrollContainerRef?: RefObject<HTMLElement | null>
) => {
  useLayoutEffect(() => {
    if (scrollContainerRef) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      return;
    }

    window.scrollTo(0, 0);
  }, [resetKey, scrollContainerRef]);
};
