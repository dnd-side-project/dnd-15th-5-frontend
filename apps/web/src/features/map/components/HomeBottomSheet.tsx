import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

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
import { SegmentedToggle } from '@/shared/ui/segmented-toggle';
import { TOAST_BOTTOM_SHEET_HEIGHT_CSS_VARIABLE } from '@/shared/ui/toast';

import LikedRecommendationSheet from './LikedRecommendationSheet';
import ShopRecommendationSheet from './ShopRecommendationSheet';

import type { ReactNode } from 'react';

type TabValue = 'frequentShops' | 'history';

type HomeBottomSheetProps = {
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
const TOP_ACTION_TO_SHEET_GAP_PX = 12;

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
 * 가장 가까운 단계로 스냅됩니다. 지도 스티커를 선택하면 탭 대신 해당 장소의 요약을 표시합니다.
 * 최대 단계는 상단 마이페이지 버튼 아래의 측정된 경계를 넘지 않으며, 실제 노출 높이를 스토어에
 * 기록해 현재 위치 버튼이 모든 시트에서 핸들과 같은 간격을 유지하도록 합니다. 핸들은 키보드로도
 * 조작할 수 있고(홈 시트는 단계 순환, 모달형 시트는 닫기), 모달형 시트는 포커스를 가두고 Escape로
 * 닫을 수 있는 실제 다이얼로그로 동작합니다.
 *
 * @param props - 홈 바텀시트 속성입니다.
 * @param props.renderFrequentShops - 세그먼트 토글과 자주 소비한 곳을 하나의 sticky 헤더로 조립합니다.
 * @param props.renderSelectedPlace - 선택한 장소 ID로 상세 요약을 조립합니다.
 * @param props.renderSpendingHistory - 세그먼트 토글과 소비내역을 하나의 sticky 헤더로 조립합니다.
 */
export default function HomeBottomSheet({
  renderFrequentShops,
  renderSelectedPlace,
  renderSpendingHistory,
}: HomeBottomSheetProps) {
  const stepIndex = useHomeBottomSheetStore((state) => state.stepIndex);
  const setSnapPoint = useHomeBottomSheetStore((state) => state.setSnapPoint);
  const advance = useHomeBottomSheetStore((state) => state.advance);
  const activeSheet = useHomeBottomSheetStore((state) => state.activeSheet);
  const showHome = useHomeBottomSheetStore((state) => state.showHome);
  const topActionBottomPx = useHomeBottomSheetStore((state) => state.topActionBottomPx);
  const setVisibleHeight = useHomeBottomSheetStore((state) => state.setVisibleHeight);
  const snapPoint = getHomeBottomSheetSnapPoint(stepIndex);
  const [tab, setTab] = useState<TabValue>('frequentShops');
  const contentRootRef = useRef<HTMLDivElement>(null);
  const scrollPositionsRef = useRef<Record<TabValue, number>>({
    frequentShops: 0,
    history: 0,
  });
  const shouldRestoreFocusRef = useRef(false);

  const handleVisibleHeightChange = useCallback(
    (heightPx: number) => {
      setVisibleHeight(heightPx);
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

  useLayoutEffect(() => {
    const scrollContainer = contentRootRef.current?.parentElement;
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollPositionsRef.current[tab];
    }

    if (!shouldRestoreFocusRef.current) {
      return;
    }

    shouldRestoreFocusRef.current = false;
    contentRootRef.current
      ?.querySelector<HTMLElement>('[data-active-tab-panel="true"] [data-pressed]')
      ?.focus();
  }, [activeSheet, tab]);

  const handleTabChange = (nextTab: TabValue) => {
    const scrollContainer = contentRootRef.current?.parentElement;
    if (scrollContainer) {
      scrollPositionsRef.current[tab] = scrollContainer.scrollTop;
    }

    shouldRestoreFocusRef.current = true;
    setTab(nextTab);
  };

  const renderSegmentedToggle = () => (
    <SegmentedToggle
      options={[
        { label: '자주 소비한 곳', value: 'frequentShops' },
        { label: '소비 기록', value: 'history' },
      ]}
      value={tab}
      onValueChange={handleTabChange}
    />
  );

  const handleModalSheetSnapPointChange = (nextSnapPoint: BottomSheetSnapPoint) => {
    if (nextSnapPoint === 'hidden') {
      showHome();
    }
  };

  const contentTransitionClassName = useSheetContentTransitionClassName(
    getSheetTransitionKey(activeSheet)
  );

  const homeSheetContent = (
    <div ref={contentRootRef} className={contentTransitionClassName}>
      <div
        data-active-tab-panel={tab === 'frequentShops' ? 'true' : undefined}
        aria-hidden={tab !== 'frequentShops'}
        className={cn('min-h-0 flex-1 flex-col', tab === 'frequentShops' ? 'flex' : 'hidden')}
      >
        {renderFrequentShops(renderSegmentedToggle())}
      </div>

      <div
        data-active-tab-panel={tab === 'history' ? 'true' : undefined}
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
      content: <ShopRecommendationSheet />,
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
  const fullTopBoundaryPx =
    isHomeSheet && topActionBottomPx > 0
      ? topActionBottomPx + TOP_ACTION_TO_SHEET_GAP_PX
      : undefined;

  return (
    <BottomSheet
      snapPoint={isHomeSheet ? snapPoint : 'medium'}
      snapPoints={isHomeSheet ? undefined : MODAL_SHEET_SNAP_POINTS}
      onSnapPointChange={isHomeSheet ? setSnapPoint : handleModalSheetSnapPointChange}
      onHandleClick={isHomeSheet ? advance : showHome}
      fitContent={!isHomeSheet}
      contentClassName={sheetPresentation.contentClassName}
      fullTopBoundaryPx={fullTopBoundaryPx}
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
  );
}
