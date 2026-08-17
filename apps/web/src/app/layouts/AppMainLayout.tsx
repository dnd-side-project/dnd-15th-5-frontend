import { Outlet, useLocation } from 'react-router-dom';

import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import BottomTabBar from '@/shared/layout/BottomTabBar';

/**
 * 홈·기록하기·리포트 탭 이동이 필요한 화면에 하단 탭바를 함께 렌더링합니다.
 *
 * `BottomTabBar`(`shared/layout`)는 `features`를 import할 수 없으므로, 홈 화면 바텀시트 상태
 * (`features/map`)와 탭바를 여기서 연결합니다. 이 조합 책임 때문에 `shared/layout`이 아니라
 * `app/layouts`에 둡니다.
 */
export default function AppMainLayout() {
  const location = useLocation();
  const advanceHomeBottomSheet = useHomeBottomSheetStore((state) => state.advance);

  const handleHomeClick = () => {
    // NOTE: 다른 화면에서 홈으로 처음 들어올 때는 순환시키지 않는다. 이미 홈 화면을 보고 있는
    // 상태에서 다시 누를 때만 다음 단계로 넘어간다.
    if (location.pathname === ROUTE_PATHS.home) {
      advanceHomeBottomSheet();
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <BottomTabBar onHomeClick={handleHomeClick} />
    </div>
  );
}
