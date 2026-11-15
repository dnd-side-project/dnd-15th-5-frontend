import { Outlet, useLocation } from 'react-router-dom';

import { getHomeBottomSheetSnapPoint, useHomeBottomSheetStore } from '@/features/map';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { BottomTabBar } from '@/shared/layout/bottom-tab-bar';
import { isNativeApp } from '@/shared/lib/bridge';
import { cn } from '@/shared/lib/cn';

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
  const activeSheetType = useHomeBottomSheetStore((state) => state.activeSheet.type);
  const isHomeModalSheetVisible =
    location.pathname === ROUTE_PATHS.home && activeSheetType !== 'home';

  const handleHomeClick = () => {
    // NOTE: 홈으로 복귀할 때 숨겨진 시트만 다시 열고, 열린 시트의 높이는 유지한다.
    if (location.pathname === ROUTE_PATHS.home) {
      advanceHomeBottomSheet();
    } else {
      const { stepIndex, setSnapPoint } = useHomeBottomSheetStore.getState();
      if (getHomeBottomSheetSnapPoint(stepIndex) === 'hidden') {
        setSnapPoint('medium');
      }
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col',
        isNativeApp() ? '[--bottom-tab-bar-gap:0px]' : '[--bottom-tab-bar-gap:32px]'
      )}
    >
      <div className="flex-1">
        <Outlet />
      </div>
      {!isHomeModalSheetVisible && <BottomTabBar onHomeClick={handleHomeClick} />}
    </div>
  );
}
