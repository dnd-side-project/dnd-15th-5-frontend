type WebViewNavigationListener = (path: string) => void;

const listeners = new Set<WebViewNavigationListener>();
let pendingPath: string | null = null;

/** 네이티브 화면에서 앱의 메인 WebView를 지정한 내부 경로로 이동시킨다. */
export const requestWebViewNavigation = (path: string) => {
  if (listeners.size === 0) {
    pendingPath = path;
    return;
  }

  listeners.forEach((listener) => listener(path));
};

/** 메인 WebView 이동 요청을 구독하고, 화면이 없을 때 쌓인 요청도 한 번 전달한다. */
export const subscribeWebViewNavigation = (listener: WebViewNavigationListener) => {
  listeners.add(listener);

  if (pendingPath) {
    const path = pendingPath;
    pendingPath = null;
    listener(path);
  }

  return () => {
    listeners.delete(listener);
  };
};
