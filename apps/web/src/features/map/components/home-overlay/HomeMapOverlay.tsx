import { useLayoutEffect, useRef } from 'react';

import {
  selectIsHomeSheetFullyExpanded,
  useHomeBottomSheetStore,
} from '@/features/map/stores/homeBottomSheetStore';
import { CloseIcon, ChevronLeftIcon } from '@/shared/assets/icons';

import HomeCategoryFilter from './HomeCategoryFilter';
import HomeTopBar from './HomeTopBar';

import type { ReactNode } from 'react';

type HomeMapOverlayProps = {
  hasUnreadNotification: boolean;
  profileAvatar?: ReactNode;
};

/**
 * 지도 홈에서 지도 위에 떠 있는 UI 전체(검색, 바로가기, 카테고리 필터)입니다.
 *
 * 바텀시트와 독립적으로 화면 최상단에 고정됩니다. 빈 공간은 지도 제스처가 그대로 통과하도록
 * `pointer-events-none`을 두고, 실제 UI가 있는 영역에만 `pointer-events-auto`로 되돌립니다.
 * 홈 시트가 최대 확장되면 상단 UI 전체를 숨기고 카테고리 선택 상태와 가로 스크롤 위치는 유지합니다.
 */
export default function HomeMapOverlay({
  hasUnreadNotification,
  profileAvatar,
}: HomeMapOverlayProps) {
  const isHomeSheetFullyExpanded = useHomeBottomSheetStore(selectIsHomeSheetFullyExpanded);
  const activeSheet = useHomeBottomSheetStore((state) => state.activeSheet);
  const showHome = useHomeBottomSheetStore((state) => state.showHome);
  const showRecommendation = useHomeBottomSheetStore((state) => state.showRecommendation);
  const setTopActionBottom = useHomeBottomSheetStore((state) => state.setTopActionBottom);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const closeButton = closeButtonRef.current;
    if (!closeButton) return;
    const updateBoundary = () => setTopActionBottom(closeButton.getBoundingClientRect().bottom);
    updateBoundary();
    window.addEventListener('resize', updateBoundary);
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateBoundary);
    observer?.observe(closeButton);
    return () => {
      window.removeEventListener('resize', updateBoundary);
      observer?.disconnect();
    };
  }, [activeSheet.type, setTopActionBottom]);
  if (activeSheet.type === 'recommendation' || activeSheet.type === 'recommendationPlace') {
    return (
      <div className="mobile-frame pointer-events-none fixed inset-x-0 top-0 z-map-control flex justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div>
          {activeSheet.type === 'recommendationPlace' && (
            <button
              type="button"
              aria-label="추천 목록으로 돌아가기"
              onClick={showRecommendation}
              className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-neutral-00 shadow-home-overlay"
            >
              <ChevronLeftIcon aria-hidden="true" className="h-4.5 w-2.5" />
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label="가게 추천 닫기"
          ref={closeButtonRef}
          onClick={showHome}
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-neutral-00 shadow-home-overlay"
        >
          <CloseIcon aria-hidden="true" className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      hidden={isHomeSheetFullyExpanded}
      className="pointer-events-none fixed top-0 right-0 left-0 z-map-control mx-auto flex max-w-120 flex-col pt-[env(safe-area-inset-top)]"
    >
      <div className="pointer-events-auto">
        <HomeTopBar hasUnreadNotification={hasUnreadNotification} profileAvatar={profileAvatar} />
      </div>
      <div className="pointer-events-auto">
        <HomeCategoryFilter />
      </div>
    </div>
  );
}
