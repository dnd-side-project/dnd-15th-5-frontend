import { NATIVE_PAGE_BACK_EVENT } from '@chapchap/shared/bridge';
import { useEffect } from 'react';
import { matchPath, Outlet, useLocation } from 'react-router-dom';

import AnalyticsIdentity from '@/app/providers/AnalyticsIdentity';
import AnalyticsTracker from '@/app/providers/AnalyticsTracker';
import MapSessionBoundary from '@/app/providers/MapSessionBoundary';
import ScrollToTop from '@/app/routes/ScrollToTop';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { ROUTE_PATHS, ROUTE_PATTERNS } from '@/shared/constants/routePaths';
import RouteHistoryProvider from '@/shared/layout/RouteHistoryProvider';
import { notifyNative } from '@/shared/lib/bridge';
import { cn } from '@/shared/lib/cn';

import type { PropsWithChildren } from 'react';

type MobileLayoutProps = PropsWithChildren;

/**
 * 모든 웹 라우트를 최대 480px 모바일 프레임 안에 렌더링하는 최상위 레이아웃입니다.
 *
 * 지도 홈·매장 상세·공유 리포트는 각 화면이 하단 Safe Area를 처리합니다.
 * 나머지 경로에는 프레임이 `pb-safe-bottom`을 적용합니다. 경로가 바뀌면 모바일 WebView가
 * edge-to-edge와 뒤로 가기 상태를 동기화할 수 있도록 `routeChanged` 이벤트를 전송합니다.
 */
export default function MobileLayout({ children }: MobileLayoutProps) {
  const { pathname } = useLocation();
  const activeSheetType = useHomeBottomSheetStore((state) => state.activeSheet.type);
  const canGoBackInPage =
    pathname === ROUTE_PATHS.home &&
    (activeSheetType === 'recommendation' || activeSheetType === 'recommendationPlace');
  const isEditRecord = Boolean(matchPath(ROUTE_PATTERNS.editRecord, pathname));
  const isShopDetail = Boolean(matchPath(ROUTE_PATTERNS.shopDetail, pathname));
  const isSharedReport = Boolean(matchPath(ROUTE_PATTERNS.sharedReport, pathname));
  const usesOwnBottomSafeArea =
    pathname === ROUTE_PATHS.home ||
    pathname === ROUTE_PATHS.homeRecommendationMap ||
    pathname === ROUTE_PATHS.record ||
    isEditRecord ||
    isShopDetail ||
    isSharedReport;

  useEffect(() => {
    // 모바일은 현재 경로를 기준으로 지도 화면의 edge-to-edge와 뒤로가기를 처리합니다.
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

      <div className="flex min-h-screen justify-center bg-neutral-100">
        <div
          className={cn(
            'mobile-frame min-h-screen bg-neutral-00',
            !usesOwnBottomSafeArea && 'pb-safe-bottom'
          )}
        >
          <MapSessionBoundary>{children ?? <Outlet />}</MapSessionBoundary>
        </div>
      </div>
    </RouteHistoryProvider>
  );
}
