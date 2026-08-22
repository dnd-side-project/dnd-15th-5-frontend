import { useEffect } from 'react';

import type { RefObject } from 'react';

const FOCUSABLE_ELEMENT_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type UseFocusTrapOptions = {
  initialFocusSelector?: string;
  onEscape?: () => void;
};

/**
 * 컨테이너 안에서 키보드 포커스를 순환시키고 해제 시 기존 포커스를 복원합니다.
 *
 * @param containerRef - 포커스를 가둘 컨테이너 요소의 ref입니다.
 * @param options - 초기 포커스 선택자와 Escape 키 동작입니다.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  { initialFocusSelector, onEscape }: UseFocusTrapOptions = {}
) {
  useEffect(() => {
    const container = containerRef.current;
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const getFocusableElements = () =>
      container
        ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR))
        : [];

    const initialFocusElement =
      (initialFocusSelector ? container?.querySelector<HTMLElement>(initialFocusSelector) : null) ??
      getFocusableElements()[0];
    initialFocusElement?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape?.();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements();
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements.at(-1);

      if (!firstFocusableElement || !lastFocusableElement) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [containerRef, initialFocusSelector, onEscape]);
}
