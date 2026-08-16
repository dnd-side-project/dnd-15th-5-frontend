import { Toast as BaseToast } from '@base-ui/react/toast';
import { DEFAULT_TOAST_TYPE } from '@chapchap/shared/toast';
import { useCallback } from 'react';

import type { ShowToastOptions, ToastControls } from '@chapchap/shared/toast';

/**
 * 웹과 앱 WebView에서 Toast를 노출하거나 닫습니다.
 *
 * `ToastProvider` 하위에서만 사용해야 합니다. 오류 Toast는 스크린 리더에 높은
 * 우선순위로 전달하고, 성공·안내 Toast는 현재 안내가 끝난 뒤 전달합니다.
 *
 * @example
 * ```tsx
 * const { showToast } = useToast();
 *
 * showToast({
 *   type: 'success',
 *   message: '방문기록이 생성되었어요!',
 * });
 * ```
 *
 * @returns Toast를 노출하고 닫는 제어 API입니다.
 */
export const useToast = (): ToastControls => {
  const { add, close } = BaseToast.useToastManager();

  const showToast = useCallback(
    ({ message, type = DEFAULT_TOAST_TYPE, duration }: ShowToastOptions) =>
      add({
        description: message,
        // NOTE: 화면 노출 순서가 아닌 스크린 리더 우선순위이다. 오류는 즉시(high), 나머지(low)는 현재 안내가 끝난 뒤 읽는다.
        priority: type === 'error' ? 'high' : 'low',
        timeout: duration,
        type,
      }),
    [add]
  );

  return {
    showToast,
    closeToast: close,
  };
};
