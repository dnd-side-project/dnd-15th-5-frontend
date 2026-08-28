import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * 시스템의 모션 감소(접근성) 설정 여부를 구독합니다.
 *
 * 기록 기능의 바텀시트 애니메이션을 생략할 때 사용합니다.
 */
export const useReducedMotion = () => {
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          setIsReducedMotionEnabled(enabled);
        }
      })
      .catch(() => {
        if (isMounted) {
          // 접근성 설정을 확인할 수 없을 때는 애니메이션을 생략하는 쪽으로 안전하게 처리한다.
          setIsReducedMotionEnabled(true);
        }
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReducedMotionEnabled
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return isReducedMotionEnabled;
};
