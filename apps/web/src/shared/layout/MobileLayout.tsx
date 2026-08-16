import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { notifyNative } from '@/shared/lib/bridge';

import type { PropsWithChildren } from 'react';

type MobileLayoutProps = PropsWithChildren;

/**
 * 모바일 기준 공통 레이아웃. 최대 너비 480px 프레임 안에 화면을 렌더링하고, 프레임 바깥은 회색 배경으로 채운다.
 */
export default function MobileLayout({ children }: MobileLayoutProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    // 모바일은 이 경로를 기준으로 /home에만 edge-to-edge를 적용한다.
    // 일반 브라우저에서는 ReactNativeWebView가 없어 전송 없이 종료된다.
    notifyNative('routeChanged', { pathname });
  }, [pathname]);

  return (
    <div className="flex min-h-screen justify-center bg-neutral-100">
      {/* TODO: 디자인 확정되면 max-w 값 수정 */}
      <div className="min-h-screen w-full max-w-120 bg-neutral-00">{children ?? <Outlet />}</div>
    </div>
  );
}
