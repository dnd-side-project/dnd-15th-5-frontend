import type { ToastType } from './types';

/** 별도 type을 지정하지 않았을 때 적용되는 Toast 상태입니다. */
export const DEFAULT_TOAST_TYPE: ToastType = 'success';

/** 별도 duration을 지정하지 않았을 때 Toast가 노출되는 시간입니다. */
export const DEFAULT_TOAST_DURATION = 3000;

/** 한 화면에 동시에 유지할 수 있는 최대 Toast 개수입니다. */
export const MAX_VISIBLE_TOASTS = 3;
