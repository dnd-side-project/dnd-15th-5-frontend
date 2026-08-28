import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * 시스템의 모션 감소(접근성) 설정 여부를 구독합니다.
 *
 * 기록 기능의 바텀시트 애니메이션을 생략할 때 사용합니다.
 */
export const useReducedMotion = () => {
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          setIsReducedMotionEnabled(enabled);
        }
      })
      .catch(() => undefined);

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
