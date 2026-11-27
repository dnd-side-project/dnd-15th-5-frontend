import { NATIVE_PAGE_BACK_EVENT } from '@chapchap/shared/bridge';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import AnalyticsIdentity from '@/app/providers/AnalyticsIdentity';
import AnalyticsTracker from '@/app/providers/AnalyticsTracker';
import MapSessionBoundary from '@/app/providers/MapSessionBoundary';
import ScrollToTop from '@/app/routes/ScrollToTop';
import SearchEngineMetadata from '@/app/routes/SearchEngineMetadata';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import PageFrame from '@/shared/layout/page-frame';
import { notifyNative } from '@/shared/lib/bridge';
import RouteHistoryProvider from '@/shared/lib/route-history';

import { getPageSafeArea } from './getPageSafeArea';

import type { PropsWithChildren } from 'react';

type MobileLayoutProps = PropsWithChildren;

/**
 * 모든 웹 라우트를 최대 480px 모바일 프레임 안에 렌더링하는 최상위 레이아웃입니다.
 *
 * 상단 Safe Area는 프레임에서 확보하고, 지도·기록 등 자체 여백이 있는 화면은 제외합니다.
 * 고정 화면과 뷰포트 높이도 같은 `--page-safe-area-top`을 사용합니다.
 * 하단 여백을 직접 처리하지 않는 화면에는 `pb-safe-bottom`을 적용합니다.
 * `routeChanged`는 네이티브의 뒤로 가기 상태를 동기화합니다.
 */
export default function MobileLayout({ children }: MobileLayoutProps) {
  const { pathname } = useLocation();
  const activeSheetType = useHomeBottomSheetStore((state) => state.activeSheet.type);
  const canGoBackInPage =
    pathname === ROUTE_PATHS.home &&
    (activeSheetType === 'recommendation' || activeSheetType === 'recommendationPlace');
  const safeArea = getPageSafeArea(pathname);

  useEffect(() => {
    // 모바일은 현재 경로를 기준으로 뒤로 가기를 처리합니다.
    // 일반 브라우저에서는 ReactNativeWebView가 없어 전송 없이 종료된다.
    notifyNative('routeChanged', {
      pathname,
      ...(canGoBackInPage ? { canGoBackInPage: true } : {}),
    });
  }, [pathname, canGoBackInPage]);

  useEffect(() => {
    if (pathname !== ROUTE_PATHS.home) return;
    const handlePageBack = () => {
      const store = useHomeBottomSheetStore.getState();
      if (store.activeSheet.type === 'recommendationPlace') store.showRecommendation();
      else if (store.activeSheet.type === 'recommendation') store.showHome();
    };
    window.addEventListener(NATIVE_PAGE_BACK_EVENT, handlePageBack);
    return () => window.removeEventListener(NATIVE_PAGE_BACK_EVENT, handlePageBack);
  }, [pathname]);

  return (
    <RouteHistoryProvider>
      <AnalyticsIdentity />
      <AnalyticsTracker />
      <ScrollToTop />
      <SearchEngineMetadata />

      <PageFrame {...safeArea}>
        <MapSessionBoundary>{children ?? <Outlet />}</MapSessionBoundary>
      </PageFrame>
    </RouteHistoryProvider>
  );
}
