import { useCallback, useState } from 'react';

const MAP_HOME_PATH = '/home';
const RECOMMENDATION_MAP_PATH = '/home/recommendation/map';
const MONTHLY_REPORT_PATH = '/report/monthly-report';

const normalizePathname = (pathname: string) => pathname.replace(/\/+$/, '') || '/';

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

/**
 * 전체 문서 이동과 웹 SPA의 `routeChanged` 이벤트로 현재 화면과 뒤로가기 가능 여부를 추적합니다.
 *
 * URL 파싱에 실패한 전체 문서 이동은 기존 상태를 유지하고, SPA 경로는 끝의 슬래시를 제거한 뒤
 * 화면별 경로와 정확히 일치하는지 판단합니다. Android 하드웨어 뒤로
 * 가기가 앱을 불필요하게 가로채지 않도록 WebView가 보고한 실제 뒤로 가기 가능 여부도 함께
 * 관리합니다.
 *
 * @param initialUrl - WebView가 최초로 여는 전체 URL입니다.
 * @returns 전체 문서·SPA 경로 변경 핸들러, WebView 뒤로 가기 가능 여부와 경로별 상태를 반환합니다.
 */
export function useWebViewNavigationState(initialUrl: string | undefined) {
  const [canGoBack, setCanGoBack] = useState(false);
  const [pathname, setPathname] = useState(() => getPathname(initialUrl));
  const normalizedPathname = pathname ? normalizePathname(pathname) : null;
  const isMapHome = normalizedPathname === MAP_HOME_PATH;
  const isMonthlyReport = normalizedPathname === MONTHLY_REPORT_PATH;

  const updatePathState = useCallback((pathname: string) => {
    setPathname(pathname);
  }, []);

  const handleNavigationStateChange = useCallback(
    (url: string, nextCanGoBack: boolean) => {
      setCanGoBack(nextCanGoBack);

      const nextPathname = getPathname(url);

      if (nextPathname) {
        updatePathState(nextPathname);
      }
    },
    [updatePathState]
  );

  const handleRouteChange = useCallback(
    (nextPathname: string) => {
      updatePathState(nextPathname);
    },
    [updatePathState]
  );

  return {
    canGoBack,
    handleNavigationStateChange,
    handleRouteChange,
    isMapHome,
    isMapEdgeToEdge: isMapHome || normalizedPathname === RECOMMENDATION_MAP_PATH,
    isMonthlyReport,
  };
}
