import { useEffect } from 'react';

import type { RefObject } from 'react';

/**
 * 참조한 요소 바깥에서 포인터 입력이 시작되면 콜백을 실행합니다.
 *
 * `pointerdown`을 사용하므로 마우스·터치·펜 입력을 함께 처리합니다. 모달이나 바텀시트를 바깥
 * 영역을 눌러 닫을 때 사용할 수 있습니다.
 *
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null);
 * useOutsidePress(modalRef, onClose);
 * ```
 *
 * @param targetRef - 내부 입력으로 처리할 요소의 ref입니다.
 * @param onOutsidePress - 참조 요소 바깥에서 입력이 시작될 때 실행할 콜백입니다.
 * @param isEnabled - 바깥 입력 감지 활성화 여부입니다. 기본값은 `true`입니다.
 */
export const useOutsidePress = <ElementType extends HTMLElement>(
  targetRef: RefObject<ElementType | null>,
  onOutsidePress: () => void,
  isEnabled = true
) => {
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || targetRef.current?.contains(target)) {
        return;
      }

      onOutsidePress();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isEnabled, onOutsidePress, targetRef]);
};
