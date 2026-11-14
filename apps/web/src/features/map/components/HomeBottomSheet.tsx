import { useCallback, useEffect, useRef, useState } from 'react';

import { useHomeBottomSheetTabs } from '@/features/map/hooks/useHomeBottomSheetTabs';
import { useHomeSheetTopBoundary } from '@/features/map/hooks/useHomeSheetTopBoundary';
import { useSelectedPlaceExpandTransition } from '@/features/map/hooks/useSelectedPlaceExpandTransition';
import {
  getHomeBottomSheetSnapPoint,
  useHomeBottomSheetStore,
} from '@/features/map/stores/homeBottomSheetStore';
import type { HomeBottomSheetContent } from '@/features/map/stores/homeBottomSheetStore';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { cn } from '@/shared/lib/cn';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import type { BottomSheetSnapPoint } from '@/shared/ui/bottom-sheet';
import { Overlay } from '@/shared/ui/overlay';
import { SegmentedToggle } from '@/shared/ui/segmented-toggle';
import { TOAST_BOTTOM_SHEET_HEIGHT_CSS_VARIABLE } from '@/shared/ui/toast';

import LikedRecommendationSheet from './liked-places/LikedRecommendationSheet';
import ShopRecommendationSheet from './ShopRecommendationSheet';

import type { ReactNode, UIEvent } from 'react';

type HomeBottomSheetProps = {
  onOpenRecommendationSearch?: () => void;
  onSelectedPlaceExpand?: (placeId: string) => void;
  renderFrequentShops: (headerContent: ReactNode) => ReactNode;
  renderSelectedPlace: (placeId: string) => ReactNode;
  renderSpendingHistory: (headerContent: ReactNode) => ReactNode;
};

type BottomSheetPresentation = {
  ariaLabel?: string;
  content: ReactNode;
  contentClassName?: string;
  isModal: boolean;
  key: string;
};

const MODAL_SHEET_SNAP_POINTS = ['hidden', 'medium'] as const;
const HOME_SHEET_SNAP_POINTS = ['hidden', 'medium', 'full'] as const;
const AUTO_EXPAND_SCROLL_THRESHOLD_PX = 32;

type ModalSheetContentProps = {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  onClose: () => void;
};

/** 모달형 시트 콘텐츠를 실제 다이얼로그로 만듭니다. 포커스를 가두고 Escape로 닫을 수 있게 합니다. */
function ModalSheetContent({ ariaLabel, children, className, onClose }: ModalSheetContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, { onEscape: onClose });

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label={ariaLabel}
      aria-modal="true"
      className={className}
    >
      {children}
    </div>
  );
}

/** 홈/추천/선택 장소/좋아요 장소 시트를 구분하는 전환 키입니다. */
function getSheetTransitionKey(activeSheet: HomeBottomSheetContent): string {
  switch (activeSheet.type) {
    case 'likedRecommendation':
      return `likedRecommendation:${activeSheet.recommendationId}`;
    case 'recommendation':
      return 'recommendation';
    case 'selectedPlace':
      return `selectedPlace:${activeSheet.stickerId}`;
    default:
      return 'home';
  }
}

const HIDDEN_CONTENT_CLASSNAME = 'opacity-0 translate-y-2';
const VISIBLE_CONTENT_CLASSNAME = 'opacity-100 translate-y-0';

/**
 * 시트 콘텐츠가 바뀔 때(`transitionKey` 변경) fade + translateY로 부드럽게 전환되는 클래스를
 * 만든다. 시트 외곽(BottomSheet)은 그대로 유지한 채 콘텐츠만 전환해 홈 → 추천 → 선택 장소 전환이
 * 순간적으로 교체되지 않도록 한다. 모션 감소 설정에서는 전환 없이 즉시 표시한다.
 */
function useSheetContentTransitionClassName(transitionKey: string) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  const [previousKey, setPreviousKey] = useState(transitionKey);

  // NOTE: 렌더링 도중 이전 값과 비교해 상태를 맞추는 패턴이다. 이렇게 하면 effect에서 setState를
  // 호출할 때 생기는 추가 렌더링 없이, 콘텐츠가 바뀐 바로 다음 커밋에서 곧장 숨김 상태로 그린다.
  if (transitionKey !== previousKey) {
    setPreviousKey(transitionKey);
    setIsVisible(prefersReducedMotion);
  }

  useEffect(() => {
    if (isVisible) {
      return;
    }

    const animationFrameId = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(animationFrameId);
  }, [isVisible]);

  return cn(
    'transition-[opacity,transform] duration-200 ease-out',
    isVisible ? VISIBLE_CONTENT_CLASSNAME : HIDDEN_CONTENT_CLASSNAME
  );
}

/**
 * 홈 화면 지도 위에 뜨는 바텀시트입니다.
 *
 * 높이 단계는 `useHomeBottomSheetStore`가 갖고 있습니다. 하단 탭바의 "홈" 버튼을 누르면 정해진
 * 순서(중간 → 최대 → 중간 → 숨김)로 바뀌고, 핸들을 드래그하면 손가락을 따라 자유롭게 움직이다가
 * 가까운 단계로 스냅됩니다. 64px 넘게 당기면 당긴 방향으로 최소 한 단계 이동합니다.
 * 지도 스티커를 선택하면 탭 대신 해당 장소의 요약을 표시합니다.
 * 최대 단계에서는 상태바 아래에 12px 여백을 남기고 검색·알림·프로필 영역을 덮습니다.
 * 위에 남은 지도 배경에는 딤을 적용합니다.
 * 실제 노출 높이를 스토어에 기록해 현재 위치 버튼이 모든 시트에서 핸들과 같은 간격을 유지하도록
 * 합니다. 핸들은 키보드로도 조작할 수 있고(홈 시트는 단계 순환, 모달형 시트는 닫기), 모달형
 * 시트는 포커스를 가두고 Escape로 닫을 수 있는 실제 다이얼로그로 동작합니다.
 *
 * @param props - 홈 바텀시트 속성입니다.
 * @param props.renderFrequentShops - 세그먼트 토글과 자주 소비한 곳을 하나의 sticky 헤더로 조립합니다.
 * @param props.renderSelectedPlace - 선택한 장소 ID로 상세 요약을 조립합니다.
 * @param props.onSelectedPlaceExpand - 선택한 가게 시트를 위로 올렸을 때 상세 화면 이동을 요청합니다.
 * @param props.onOpenRecommendationSearch - 추천 결과가 없을 때 동네 검색을 다시 엽니다.
 * @param props.renderSpendingHistory - 세그먼트 토글과 소비내역을 하나의 sticky 헤더로 조립합니다.
 */
export default function HomeBottomSheet({
  onOpenRecommendationSearch,
  onSelectedPlaceExpand,
  renderFrequentShops,
  renderSelectedPlace,
  renderSpendingHistory,
}: HomeBottomSheetProps) {
  const stepIndex = useHomeBottomSheetStore((state) => state.stepIndex);
  const setSnapPoint = useHomeBottomSheetStore((state) => state.setSnapPoint);
  const advance = useHomeBottomSheetStore((state) => state.advance);
  const activeSheet = useHomeBottomSheetStore((state) => state.activeSheet);
  const showHome = useHomeBottomSheetStore((state) => state.showHome);
  const setVisibleHeight = useHomeBottomSheetStore((state) => state.setVisibleHeight);
  const snapPoint = getHomeBottomSheetSnapPoint(stepIndex);
  const { topSafeAreaRef, fullTopBoundaryPx } = useHomeSheetTopBoundary();
  const isHomeSheetHidden = activeSheet.type === 'home' && snapPoint === 'hidden';
  const {
    tab,
    contentRootRef,
    handleTabChange,
    handleContentScroll,
    handleContentTouchStart,
    handleContentTouchMove,
    handleContentWheel,
    handleContentKeyDown,
  } = useHomeBottomSheetTabs(activeSheet.type === 'home' && !isHomeSheetHidden);

  const handleVisibleHeightChange = useCallback(
    (heightPx: number) => {
      setVisibleHeight(heightPx);
      if (heightPx === 0) {
        document.documentElement.style.removeProperty(TOAST_BOTTOM_SHEET_HEIGHT_CSS_VARIABLE);
        return;
      }

      document.documentElement.style.setProperty(
        TOAST_BOTTOM_SHEET_HEIGHT_CSS_VARIABLE,
        `${heightPx}px`
      );
    },
    [setVisibleHeight]
  );

  useEffect(
    () => () => {
      document.documentElement.style.removeProperty(TOAST_BOTTOM_SHEET_HEIGHT_CSS_VARIABLE);
      setVisibleHeight(0);
    },
    [setVisibleHeight]
  );

  const renderSegmentedToggle = () => (
    <div className="pb-2">
      <SegmentedToggle
        options={[
          { label: '자주 소비한 곳', value: 'frequentShops' },
          { label: '소비 기록', value: 'history' },
        ]}
        value={tab}
        onValueChange={handleTabChange}
      />
    </div>
  );

  const handleModalSheetSnapPointChange = (nextSnapPoint: BottomSheetSnapPoint) => {
    if (nextSnapPoint === 'hidden') {
      showHome();
    }
  };

  const handleHomeSheetContentScroll = (event: UIEvent<HTMLDivElement>) => {
    const shouldAutoExpand = handleContentScroll(event);
    if (
      shouldAutoExpand &&
      snapPoint === 'medium' &&
      event.currentTarget.scrollTop > AUTO_EXPAND_SCROLL_THRESHOLD_PX
    ) {
      setSnapPoint('full');
    }
  };

  const handleHomeSheetContentPullDown = () => {
    setSnapPoint(snapPoint === 'full' ? 'medium' : 'hidden');
  };

  const { sheetRef, expandSelectedPlace } = useSelectedPlaceExpandTransition({
    placeId: activeSheet.type === 'selectedPlace' ? activeSheet.stickerId : undefined,
    onExpanded: onSelectedPlaceExpand,
  });
  const handleSelectedPlaceExpand =
    activeSheet.type === 'selectedPlace' && onSelectedPlaceExpand ? expandSelectedPlace : undefined;

  const contentTransitionClassName = useSheetContentTransitionClassName(
    getSheetTransitionKey(activeSheet)
  );

  const homeSheetContent = (
    <div
      ref={contentRootRef}
      onTouchStartCapture={handleContentTouchStart}
      onTouchMoveCapture={handleContentTouchMove}
      onWheelCapture={handleContentWheel}
      onKeyDown={handleContentKeyDown}
      className={cn('flex min-h-full flex-col bg-neutral-00', contentTransitionClassName)}
    >
      <div
        data-active-tab-panel={!isHomeSheetHidden && tab === 'frequentShops' ? 'true' : undefined}
        hidden={tab !== 'frequentShops'}
        aria-hidden={tab !== 'frequentShops'}
        className={cn('min-h-0 flex-1 flex-col', tab === 'frequentShops' ? 'flex' : 'hidden')}
      >
        {renderFrequentShops(renderSegmentedToggle())}
      </div>

      <div
        data-active-tab-panel={!isHomeSheetHidden && tab === 'history' ? 'true' : undefined}
        hidden={tab !== 'history'}
        aria-hidden={tab !== 'history'}
        className={cn('min-h-0 flex-1 flex-col', tab === 'history' ? 'flex' : 'hidden')}
      >
        {renderSpendingHistory(renderSegmentedToggle())}
      </div>
    </div>
  );
  let sheetPresentation: BottomSheetPresentation = {
    content: homeSheetContent,
    isModal: false,
    key: 'home',
  };

  if (activeSheet.type === 'likedRecommendation') {
    sheetPresentation = {
      ariaLabel: '좋아요 가게 정보',
      content: <LikedRecommendationSheet recommendationId={activeSheet.recommendationId} />,
      contentClassName: 'pb-6',
      isModal: true,
      key: getSheetTransitionKey(activeSheet),
    };
  } else if (activeSheet.type === 'recommendation') {
    sheetPresentation = {
      ariaLabel: '가게 추천',
      content: <ShopRecommendationSheet onOpenRecommendationSearch={onOpenRecommendationSearch} />,
      contentClassName: 'pt-2 pb-10',
      isModal: true,
      key: getSheetTransitionKey(activeSheet),
    };
  } else if (activeSheet.type === 'selectedPlace') {
    sheetPresentation = {
      ariaLabel: '선택한 가게 정보',
      content: renderSelectedPlace(activeSheet.stickerId),
      contentClassName: 'pb-6',
      isModal: true,
      key: getSheetTransitionKey(activeSheet),
    };
  }

  const isHomeSheet = !sheetPresentation.isModal;

  return (
    <>
      <div
        ref={topSafeAreaRef}
        aria-hidden="true"
        className="pointer-events-none invisible fixed top-0 h-[env(safe-area-inset-top)] w-0"
      />
      {isHomeSheet && snapPoint === 'full' && <Overlay />}
      <BottomSheet
        rootRef={sheetRef}
        snapPoint={isHomeSheet ? snapPoint : 'medium'}
        snapPoints={isHomeSheet ? HOME_SHEET_SNAP_POINTS : MODAL_SHEET_SNAP_POINTS}
        onSnapPointChange={isHomeSheet ? setSnapPoint : handleModalSheetSnapPointChange}
        onHandleClick={isHomeSheet ? advance : showHome}
        fitContent={!isHomeSheet}
        onExpand={handleSelectedPlaceExpand}
        contentClassName={sheetPresentation.contentClassName}
        fullTopBoundaryPx={isHomeSheet ? fullTopBoundaryPx : undefined}
        onContentPullDown={
          isHomeSheet && !isHomeSheetHidden ? handleHomeSheetContentPullDown : undefined
        }
        onContentScroll={
          isHomeSheet && !isHomeSheetHidden ? handleHomeSheetContentScroll : undefined
        }
        onVisibleHeightChange={handleVisibleHeightChange}
      >
        {sheetPresentation.isModal ? (
          <ModalSheetContent
            key={sheetPresentation.key}
            ariaLabel={sheetPresentation.ariaLabel ?? '가게 정보'}
            className={contentTransitionClassName}
            onClose={showHome}
          >
            {sheetPresentation.content}
          </ModalSheetContent>
        ) : (
          sheetPresentation.content
        )}
      </BottomSheet>
    </>
  );
}
