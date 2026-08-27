import { Toast as BaseToast } from '@base-ui/react/toast';
import {
  DEFAULT_TOAST_DURATION,
  DEFAULT_TOAST_TYPE,
  MAX_VISIBLE_TOASTS,
} from '@chapchap/shared/toast';

import { StatusErrorIcon, StatusSuccessIcon } from '@/shared/assets/icons';

import { TOAST_BOTTOM_SHEET_HEIGHT_CSS_VARIABLE } from './constants';
import { toastVariants } from './toastVariants';

import type { WebToastData } from './types';
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

function ToastList({
  toasts,
}: {
  toasts: ReturnType<typeof BaseToast.useToastManager<WebToastData>>['toasts'];
}) {
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

function ToastViewport({ placement }: { placement: WebToastData['placement'] }) {
  const { toasts } = BaseToast.useToastManager<WebToastData>();
  const visibleToasts = toasts
    .filter(
      (toast) => !toast.limited && (toast.data?.placement ?? 'default') === (placement ?? 'default')
    )
    .slice(0, MAX_VISIBLE_TOASTS);
  const isAboveBottomSheet = placement === 'above-bottom-sheet';

  return (
    <BaseToast.Viewport
      className="toast-list mobile-frame z-toast pointer-events-none fixed right-0 left-0 box-border flex flex-col-reverse px-4 outline-none"
      style={{
        bottom: isAboveBottomSheet
          ? `calc(var(${TOAST_BOTTOM_SHEET_HEIGHT_CSS_VARIABLE}, 0px) + 0.75rem)`
          : 'calc(1.25rem + env(safe-area-inset-bottom))',
      }}
      data-testid={isAboveBottomSheet ? 'toast-viewport-above-bottom-sheet' : 'toast-viewport'}
    >
      <ToastList toasts={visibleToasts} />
    </BaseToast.Viewport>
  );
}

/**
 * 웹과 앱 WebView에서 공통 Toast를 제공하는 전역 Provider입니다.
 *
 * 앱 루트에 한 번 배치하고 하위 컴포넌트에서 `useToast`를 사용합니다.
 * Toast는 자동으로 닫히며 아래 방향 스와이프 또는 `closeToast`로도 닫을 수 있습니다.
 * 배치 위치별로 동시에 노출할 수 있는 개수는 공통 `MAX_VISIBLE_TOASTS` 값을 따릅니다.
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
  // Base UI의 limit은 Provider 전체에 적용되므로, 실제 노출 제한은 각 Viewport에서 배치별로 적용한다.
  return (
    <BaseToast.Provider timeout={duration} limit={Number.MAX_SAFE_INTEGER}>
      {children}
      <BaseToast.Portal>
        <ToastViewport placement="default" />
        <ToastViewport placement="above-bottom-sheet" />
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}
