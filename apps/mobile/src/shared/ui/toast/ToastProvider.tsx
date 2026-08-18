import {
  DEFAULT_TOAST_DURATION,
  DEFAULT_TOAST_TYPE,
  MAX_VISIBLE_TOASTS,
} from '@chapchap/shared/toast';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusErrorIcon, StatusSuccessIcon } from '@/shared/assets/icons';

import type { ShowToastOptions, ToastControls, ToastType } from '@chapchap/shared/toast';
import type { PropsWithChildren } from 'react';

type NativeToast = Required<Pick<ShowToastOptions, 'message' | 'type'>> & {
  id: string;
};

type ToastProviderProps = PropsWithChildren<{
  /** 하위 Toast의 기본 노출 시간(ms)입니다. `0`이면 자동으로 닫히지 않습니다. */
  duration?: number;
}>;

const ToastContext = createContext<ToastControls | null>(null);

const TOAST_BOTTOM_OFFSET = 20;

let toastSequence = 0;

const toastIcons: Record<ToastType, typeof StatusSuccessIcon | null> = {
  success: StatusSuccessIcon,
  error: StatusErrorIcon,
  info: null,
};

const toastSurfaceClasses: Record<ToastType, string> = {
  success: 'toast-default',
  error: 'toast-default',
  info: 'toast-info',
};

function ToastIcon({ type }: { type: ToastType }) {
  const Icon = toastIcons[type];

  return Icon ? <Icon width={20} height={20} /> : null;
}

/**
 * React Native 화면에서 공통 Toast를 제공하는 전역 Provider입니다.
 *
 * 앱 루트에 한 번 배치합니다. Toast는 자동으로 닫히며 사용자가 Toast를 누르거나
 * `closeToast`를 호출해 직접 닫을 수도 있습니다. WebView 내부 화면은 이 Provider가
 * 아니라 웹의 `ToastProvider`를 사용합니다.
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <Stack />
 * </ToastProvider>
 * ```
 *
 * @param props - Provider 속성입니다.
 * @param props.children - Toast API를 사용할 React Native 화면 트리입니다.
 * @param props.duration - Toast의 기본 노출 시간(ms)입니다.
 */
export function ToastProvider({ children, duration = DEFAULT_TOAST_DURATION }: ToastProviderProps) {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<NativeToast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const closeToast = useCallback((toastId?: string) => {
    setToasts((currentToasts) =>
      toastId ? currentToasts.filter((toast) => toast.id !== toastId) : []
    );

    if (toastId) {
      clearTimeout(timers.current.get(toastId));
      timers.current.delete(toastId);
      return;
    }

    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  const showToast = useCallback(
    ({
      message,
      type = DEFAULT_TOAST_TYPE,
      duration: itemDuration = duration,
    }: ShowToastOptions) => {
      const toastId = `toast-${++toastSequence}`;
      setToasts((currentToasts) => [
        ...currentToasts.slice(-(MAX_VISIBLE_TOASTS - 1)),
        { id: toastId, message, type },
      ]);

      if (itemDuration > 0) {
        timers.current.set(
          toastId,
          setTimeout(() => closeToast(toastId), itemDuration)
        );
      }

      return toastId;
    },
    [closeToast, duration]
  );

  useEffect(() => {
    const visibleToastIds = new Set(toasts.map((toast) => toast.id));

    timers.current.forEach((timer, toastId) => {
      if (!visibleToastIds.has(toastId)) {
        clearTimeout(timer);
        timers.current.delete(toastId);
      }
    });
  }, [toasts]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, closeToast }}>
      {children}
      <View
        testID="toast-viewport"
        pointerEvents="box-none"
        className="z-toast absolute right-4 left-4"
        style={{ bottom: insets.bottom + TOAST_BOTTOM_OFFSET }}
      >
        <View className="toast-list self-center">
          {toasts.map((toast) => (
            <Pressable
              key={toast.id}
              accessibilityRole="button"
              accessibilityLabel={`${toast.message}. 알림 닫기`}
              accessibilityLiveRegion={toast.type === 'error' ? 'assertive' : 'polite'}
              onPress={() => closeToast(toast.id)}
              className={`toast-surface toast-content ${toastSurfaceClasses[toast.type]}`}
            >
              <ToastIcon type={toast.type} />
              <Text className="toast-text shrink text-center font-pretendard-regular">
                {toast.message}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ToastContext.Provider>
  );
}

/**
 * React Native 화면에서 Toast를 노출하거나 닫습니다.
 *
 * `ToastProvider` 하위에서만 사용해야 합니다.
 *
 * @example
 * ```tsx
 * const { showToast } = useToast();
 *
 * showToast({
 *   type: 'error',
 *   message: '다시 시도해 주세요.',
 * });
 * ```
 *
 * @returns Toast를 노출하고 닫는 제어 API입니다.
 * @throws `ToastProvider` 외부에서 호출하면 오류를 던집니다.
 */
export const useToast = (): ToastControls => {
  const toastControls = useContext(ToastContext);

  if (!toastControls) {
    throw new Error('useToast는 ToastProvider 하위에서 사용해야 합니다');
  }

  return toastControls;
};
