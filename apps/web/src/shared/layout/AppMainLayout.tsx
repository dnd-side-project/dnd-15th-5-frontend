import { Outlet } from 'react-router-dom';

import BottomTabBar from './BottomTabBar';

/** 홈·기록하기·리포트 탭 이동이 필요한 화면에 하단 탭바를 함께 렌더링합니다. */
export default function AppMainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
}
