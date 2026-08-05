import { Outlet } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';

import type { PropsWithChildren } from 'react';

type MobileLayoutProps = PropsWithChildren<{
  hasPadding?: boolean;
}>;

/**
 * 모바일 기준 공통 레이아웃. 최대 너비 480px 프레임 안에 화면을 렌더링하고, 프레임 바깥은 회색 배경으로 채운다.
 * @param hasPadding 좌우 16px 패딩 적용 여부. 기본값은 true이며, 지도처럼 프레임 전체를 채워야 하는 화면은 false로 설정한다.
 */
export default function MobileLayout({ children, hasPadding = true }: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen justify-center bg-layout-bg">
      {/* TODO: 디자인 확정되면 max-w 값 수정 */}
      <div className={cn('min-h-screen w-full max-w-120 bg-white', hasPadding && 'px-4')}>
        {children ?? <Outlet />}
      </div>
    </div>
  );
}
