import { Toast as BaseToast } from '@base-ui/react/toast';
import {
  DEFAULT_TOAST_DURATION,
  DEFAULT_TOAST_TYPE,
  MAX_VISIBLE_TOASTS,
} from '@chapchap/shared/toast';

import { StatusErrorIcon, StatusSuccessIcon } from '@/shared/assets/icons';

import { toastVariants } from './toastVariants';

import type { ToastType } from '@chapchap/shared/toast';
import type { PropsWithChildren } from 'react';

type ToastProviderProps = PropsWithChildren<{
  /** 하위 Toast의 기본 노출 시간(ms)입니다. `0`이면 자동으로 닫히지 않습니다. */
  duration?: number;
}>;

const toastIcons: Record<ToastType, typeof StatusSuccessIcon | null> = {
  success: StatusSuccessIcon,
  error: StatusErrorIcon,
  info: null,
};

function ToastIcon({ type }: { type: ToastType }) {
  const Icon = toastIcons[type];

  return Icon ? <Icon className="size-5 shrink-0" aria-hidden="true" /> : null;
}

function ToastList() {
  const { toasts } = BaseToast.useToastManager();

  return toasts
    .filter((toast) => !toast.limited)
    .map((toast) => {
      const type = (toast.type ?? DEFAULT_TOAST_TYPE) as ToastType;

      return (
        <BaseToast.Root key={toast.id} toast={toast} className={toastVariants({ type })}>
          <BaseToast.Content className="toast-content min-w-0 flex-1">
            <ToastIcon type={type} />
            <BaseToast.Description className="toast-text min-w-0 text-center wrap-break-word" />
          </BaseToast.Content>
        </BaseToast.Root>
      );
    });
}

/**
 * 웹과 앱 WebView에서 공통 Toast를 제공하는 전역 Provider입니다.
 *
 * 앱 루트에 한 번 배치하고 하위 컴포넌트에서 `useToast`를 사용합니다.
 * Toast는 자동으로 닫히며 아래 방향 스와이프 또는 `closeToast`로도 닫을 수 있습니다.
 * 동시에 노출할 수 있는 개수는 공통 `MAX_VISIBLE_TOASTS` 값을 따릅니다.
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 *
 * @param props - Provider 속성입니다.
 * @param props.children - Toast API를 사용할 애플리케이션 트리입니다.
 * @param props.duration - Toast의 기본 노출 시간(ms)입니다.
 */
export function ToastProvider({ children, duration = DEFAULT_TOAST_DURATION }: ToastProviderProps) {
  return (
    <BaseToast.Provider timeout={duration} limit={MAX_VISIBLE_TOASTS}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport
          className="toast-list mobile-frame z-toast pointer-events-none fixed right-0 left-0 box-border flex flex-col-reverse px-4 outline-none"
          style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
          data-testid="toast-viewport"
        >
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}
