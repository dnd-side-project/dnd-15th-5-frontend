import { useEffect } from 'react';
import { matchPath, Outlet, useLocation } from 'react-router-dom';

import { ROUTE_PATHS, ROUTE_PATTERNS } from '@/shared/constants/routePaths';
import { notifyNative } from '@/shared/lib/bridge';
import { cn } from '@/shared/lib/cn';

import type { PropsWithChildren } from 'react';

type MobileLayoutProps = PropsWithChildren;

/**
 * 모든 웹 라우트를 최대 480px 모바일 프레임 안에 렌더링하는 최상위 레이아웃입니다.
 *
 * 지도 홈과 매장 상세는 각각 바텀시트·내부 스크롤 영역에서 하단 Safe Area를 처리합니다.
 * 나머지 경로에는 프레임이 `pb-safe-bottom`을 적용합니다. 경로가 바뀌면 모바일 WebView가
 * edge-to-edge와 뒤로 가기 상태를 동기화할 수 있도록 `routeChanged` 이벤트를 전송합니다.
 */
export default function MobileLayout({ children }: MobileLayoutProps) {
  const { pathname } = useLocation();
  const isShopDetail = Boolean(matchPath(ROUTE_PATTERNS.shopDetail, pathname));
  const isSharedReport = Boolean(matchPath(ROUTE_PATTERNS.sharedReport, pathname));
  const usesOwnBottomSafeArea = pathname === ROUTE_PATHS.home || isShopDetail || isSharedReport;

  useEffect(() => {
    // 모바일은 이 경로를 기준으로 /home에만 edge-to-edge를 적용한다.
    // 일반 브라우저에서는 ReactNativeWebView가 없어 전송 없이 종료된다.
    notifyNative('routeChanged', { pathname });
  }, [pathname]);

  return (
    <div className="flex min-h-screen justify-center bg-neutral-100">
      <div
        className={cn(
          'mobile-frame min-h-screen bg-neutral-00',
          !usesOwnBottomSafeArea && 'pb-safe-bottom'
        )}
      >
        {children ?? <Outlet />}
      </div>
    </div>
  );
}
