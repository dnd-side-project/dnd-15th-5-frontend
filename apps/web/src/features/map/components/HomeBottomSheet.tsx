import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  getHomeBottomSheetSnapPoint,
  useHomeBottomSheetStore,
} from '@/features/map/stores/homeBottomSheetStore';
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
  content: ReactNode;
  contentClassName?: string;
  isModal: boolean;
  key: string;
};

const MODAL_SHEET_SNAP_POINTS = ['hidden', 'medium'] as const;
const TOP_ACTION_TO_SHEET_GAP_PX = 12;

/**
 * 홈 화면 지도 위에 뜨는 바텀시트입니다.
 *
 * 높이 단계는 `useHomeBottomSheetStore`가 갖고 있습니다. 하단 탭바의 "홈" 버튼을 누르면 정해진
 * 순서(중간 → 최대 → 중간 → 숨김)로 바뀌고, 핸들을 드래그하면 손가락을 따라 자유롭게 움직이다가
 * 가장 가까운 단계로 스냅됩니다. 지도 스티커를 선택하면 탭 대신 해당 장소의 요약을 표시합니다.
 * 최대 단계는 상단 마이페이지 버튼 아래의 측정된 경계를 넘지 않으며, 실제 노출 높이를 스토어에
 * 기록해 현재 위치 버튼이 모든 시트에서 핸들과 같은 간격을 유지하도록 합니다.
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

  const homeSheetContent = (
    <div ref={contentRootRef} className="contents">
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
      content: <LikedRecommendationSheet recommendationId={activeSheet.recommendationId} />,
      contentClassName: 'pb-6',
      isModal: true,
      key: `likedRecommendation:${activeSheet.recommendationId}`,
    };
  } else if (activeSheet.type === 'recommendation') {
    sheetPresentation = {
      content: <ShopRecommendationSheet />,
      contentClassName: 'pt-2 pb-10',
      isModal: true,
      key: 'recommendation',
    };
  } else if (activeSheet.type === 'selectedPlace') {
    sheetPresentation = {
      content: renderSelectedPlace(activeSheet.stickerId),
      contentClassName: 'pb-6',
      isModal: true,
      key: `selectedPlace:${activeSheet.stickerId}`,
    };
  }

  const isHomeSheet = !sheetPresentation.isModal;
  const fullTopBoundaryPx =
    isHomeSheet && topActionBottomPx > 0
      ? topActionBottomPx + TOP_ACTION_TO_SHEET_GAP_PX
      : undefined;

  return (
    <BottomSheet
      key={sheetPresentation.key}
      snapPoint={isHomeSheet ? snapPoint : 'medium'}
      snapPoints={isHomeSheet ? undefined : MODAL_SHEET_SNAP_POINTS}
      onSnapPointChange={isHomeSheet ? setSnapPoint : handleModalSheetSnapPointChange}
      fitContent={!isHomeSheet}
      contentClassName={sheetPresentation.contentClassName}
      fullTopBoundaryPx={fullTopBoundaryPx}
      onVisibleHeightChange={handleVisibleHeightChange}
    >
      {sheetPresentation.content}
    </BottomSheet>
  );
}
