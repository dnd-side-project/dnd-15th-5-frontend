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

/** 현재 웹 경로가 지도 홈인지 추적해 iOS WebView의 뒤로 가기 제스처를 제어한다. */
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
