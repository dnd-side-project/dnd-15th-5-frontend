import { useCallback, useState } from 'react';

import type { Edge } from 'react-native-safe-area-context';

const MAP_HOME_PATH = '/home';
// 지도 홈은 WebView가 시스템 영역까지 채우고, 다른 웹 화면은 네 방향 안전 영역 안에 둔다.
const EDGE_TO_EDGE_EDGES: Edge[] = [];
const SAFE_AREA_EDGES: Edge[] = ['top', 'right', 'bottom', 'left'];

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

/** WebView의 현재 경로에 맞춰 지도 홈에서만 Safe Area를 제거한다. */
export function useWebViewSafeArea(initialUrl: string | undefined) {
  const [isMapHome, setIsMapHome] = useState(() => {
    const pathname = getPathname(initialUrl);

    return pathname ? isMapHomePathname(pathname) : false;
  });

  const handleNavigationStateChange = useCallback((url: string) => {
    // 전체 문서 이동 등 웹 이벤트가 전달되지 않는 경우를 위한 보조 동기화다.
    const pathname = getPathname(url);

    if (pathname) {
      setIsMapHome(isMapHomePathname(pathname));
    }
  }, []);

  const handleRouteChange = useCallback((pathname: string) => {
    // React Router의 SPA 이동은 웹이 보내는 routeChanged 이벤트로 동기화한다.
    setIsMapHome(isMapHomePathname(pathname));
  }, []);

  return {
    edges: isMapHome ? EDGE_TO_EDGE_EDGES : SAFE_AREA_EDGES,
    handleNavigationStateChange,
    handleRouteChange,
  };
}
