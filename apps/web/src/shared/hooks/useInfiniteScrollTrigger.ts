import { useEffect, useRef } from 'react';

import type { RefObject } from 'react';

type UseInfiniteScrollTriggerOptions = {
  enabled: boolean;
  onIntersect: () => void | Promise<unknown>;
  rootMargin?: string;
  rootRef?: RefObject<Element | null>;
};

/**
 * 활성화된 동안 감시 요소가 스크롤 영역에 들어오면 다음 페이지 요청을 실행합니다.
 *
 * @param options - 교차 감지 조건입니다.
 * @param options.enabled - 다음 페이지를 요청할 수 있는 상태인지 여부입니다.
 * @param options.onIntersect - 감시 요소가 보일 때 실행할 콜백입니다.
 * @param options.rootMargin - 실제 노출 전에 미리 요청할 여백입니다.
 * @param options.rootRef - 별도 스크롤 컨테이너를 사용할 때 전달하는 참조입니다.
 * @returns 목록 끝에 배치할 감시 요소 참조입니다.
 */
export const useInfiniteScrollTrigger = ({
  enabled,
  onIntersect,
  rootMargin = '120px 0px',
  rootRef,
}: UseInfiniteScrollTriggerOptions) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void onIntersect();
      },
      { root: rootRef?.current ?? null, rootMargin }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [enabled, onIntersect, rootMargin, rootRef]);

  return triggerRef;
};
