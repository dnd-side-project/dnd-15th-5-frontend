import { Outlet } from 'react-router-dom';

import type { PropsWithChildren } from 'react';

type MobileLayoutProps = PropsWithChildren;

/**
 * 모바일 기준 공통 레이아웃. 최대 너비 480px 프레임 안에 화면을 렌더링하고, 프레임 바깥은 회색 배경으로 채운다.
 */
export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen justify-center bg-layout-bg">
      {/* TODO: 디자인 확정되면 max-w 값 수정 */}
      <div className="min-h-screen w-full max-w-120 bg-white">{children ?? <Outlet />}</div>
    </div>
  );
}
