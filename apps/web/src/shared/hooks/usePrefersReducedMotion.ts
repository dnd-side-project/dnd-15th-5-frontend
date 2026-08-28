import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// NOTE: jsdom 등 matchMedia를 지원하지 않는 환경에서는 모션 감소를 선호하지 않는 것으로 본다.
const getPrefersReducedMotion = () => window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false;

/**
 * 시스템의 모션 감소 설정 여부를 구독합니다.
 *
 * 바텀시트·시트 전환 등에서 활성화 시 전환 애니메이션을 생략할 때 사용합니다.
 */
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);

  useEffect(() => {
    const mediaQueryList = window.matchMedia?.(REDUCED_MOTION_QUERY);
    if (!mediaQueryList) {
      return;
    }

    const handleChange = () => setPrefersReducedMotion(mediaQueryList.matches);

    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};
