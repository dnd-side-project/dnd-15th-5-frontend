/** Toast의 의미와 시각 스타일을 결정하는 상태입니다. */
export type ToastType = 'success' | 'error' | 'info';

/** Toast를 노출할 때 전달하는 옵션입니다. */
export type ShowToastOptions = {
  /** 사용자에게 표시할 메시지입니다. */
  message: string;
  /** Toast 상태입니다. 기본값은 `info`입니다. */
  type?: ToastType;
  /** 자동으로 닫히기까지의 시간(ms)입니다. `0`이면 자동으로 닫히지 않습니다. */
  duration?: number;
};

/** 웹과 React Native에서 동일하게 사용하는 Toast 제어 API입니다. */
export type ToastControls = {
  /** Toast를 추가하고 해당 Toast를 식별하는 ID를 반환합니다. */
  showToast: (options: ShowToastOptions) => string;
  /** ID에 해당하는 Toast를 닫습니다. ID를 생략하면 열린 Toast를 모두 닫습니다. */
  closeToast: (toastId?: string) => void;
};
