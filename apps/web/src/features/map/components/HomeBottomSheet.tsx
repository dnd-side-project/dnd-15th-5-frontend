import { useLayoutEffect, useRef, useState } from 'react';

import {
  getHomeBottomSheetSnapPoint,
  useHomeBottomSheetStore,
} from '@/features/map/stores/homeBottomSheetStore';
import { cn } from '@/shared/lib/cn';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { SegmentedToggle } from '@/shared/ui/segmented-toggle';

import type { ReactNode } from 'react';

type TabValue = 'frequentShops' | 'history';

type HomeBottomSheetProps = {
  renderSpendingHistory: (headerContent: ReactNode) => ReactNode;
};

/**
 * 홈 화면 지도 위에 뜨는 바텀시트입니다.
 *
 * 높이 단계는 `useHomeBottomSheetStore`가 갖고 있습니다. 하단 탭바의 "홈" 버튼을 누르면 정해진
 * 순서(중간 → 최대 → 중간 → 숨김)로 바뀌고, 핸들을 드래그하면 손가락을 따라 자유롭게 움직이다가
 * 가장 가까운 단계로 스냅됩니다.
 *
 * @param props - 홈 바텀시트 속성입니다.
 * @param props.renderSpendingHistory - 세그먼트 토글과 소비내역을 하나의 sticky 헤더로 조립합니다.
 */
export default function HomeBottomSheet({ renderSpendingHistory }: HomeBottomSheetProps) {
  const stepIndex = useHomeBottomSheetStore((state) => state.stepIndex);
  const setSnapPoint = useHomeBottomSheetStore((state) => state.setSnapPoint);
  const snapPoint = getHomeBottomSheetSnapPoint(stepIndex);
  const [tab, setTab] = useState<TabValue>('frequentShops');
  const contentRootRef = useRef<HTMLDivElement>(null);
  const scrollPositionsRef = useRef<Record<TabValue, number>>({
    frequentShops: 0,
    history: 0,
  });
  const shouldRestoreFocusRef = useRef(false);

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
  }, [tab]);

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

  return (
    <BottomSheet snapPoint={snapPoint} onSnapPointChange={setSnapPoint}>
      <div ref={contentRootRef} className="contents">
        {tab === 'frequentShops' && (
          <div
            data-active-tab-panel="true"
            className="sticky top-0 z-sticky-header bg-neutral-00 pt-4"
          >
            {renderSegmentedToggle()}
          </div>
        )}

        <div
          data-active-tab-panel={tab === 'history' ? 'true' : undefined}
          aria-hidden={tab !== 'history'}
          className={cn('min-h-0 flex-1 flex-col', tab === 'history' ? 'flex' : 'hidden')}
        >
          {renderSpendingHistory(renderSegmentedToggle())}
        </div>
      </div>
    </BottomSheet>
  );
}
