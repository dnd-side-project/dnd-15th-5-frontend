import { Outlet } from 'react-router-dom';

/** 일반 페이지의 기본 여백과 기기 Safe Area를 적용한다. */
export default function PaddedLayout() {
  return (
    <div className="box-border h-dvh overflow-y-auto pt-[env(safe-area-inset-top)] pr-[max(1rem,env(safe-area-inset-right))] pb-[env(safe-area-inset-bottom)] pl-[max(1rem,env(safe-area-inset-left))]">
      <Outlet />
    </div>
  );
}
