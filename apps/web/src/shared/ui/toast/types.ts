import type { ShowToastOptions, ToastControls } from '@chapchap/shared/toast';

export type WebToastPlacement = 'default' | 'above-bottom-sheet';

export type WebShowToastOptions = ShowToastOptions & {
  /** 기본 하단 또는 현재 바텀시트 바로 위 중 Toast 위치를 정합니다. */
  placement?: WebToastPlacement;
};

export type WebToastControls = Omit<ToastControls, 'showToast'> & {
  showToast: (options: WebShowToastOptions) => string;
};

export type WebToastData = {
  placement?: WebToastPlacement;
};
