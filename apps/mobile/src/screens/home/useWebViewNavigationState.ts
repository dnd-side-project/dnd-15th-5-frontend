import { useCallback, useState } from 'react';

const MAP_HOME_PATH = '/home';

const isMapHomePathname = (pathname: string) => pathname.replace(/\/+$/, '') === MAP_HOME_PATH;

const getPathname = (url: string | undefined) => {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
};

/** 지도 홈의 edge-to-edge 표시와 iOS WebView 뒤로 가기 제스처를 위해 현재 경로를 추적한다. */
export function useWebViewNavigationState(initialUrl: string | undefined) {
  const [isMapHome, setIsMapHome] = useState(() => {
    const pathname = getPathname(initialUrl);

    return pathname ? isMapHomePathname(pathname) : false;
  });

  const handleNavigationStateChange = useCallback((url: string) => {
    const pathname = getPathname(url);

    if (pathname) {
      setIsMapHome(isMapHomePathname(pathname));
    }
  }, []);

  const handleRouteChange = useCallback((pathname: string) => {
    setIsMapHome(isMapHomePathname(pathname));
  }, []);

  return { handleNavigationStateChange, handleRouteChange, isMapHome };
}
