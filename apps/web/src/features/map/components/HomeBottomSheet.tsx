import { useState } from 'react';

import {
  getHomeBottomSheetSnapPoint,
  useHomeBottomSheetStore,
} from '@/features/map/stores/homeBottomSheetStore';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { SegmentedToggle } from '@/shared/ui/segmented-toggle';

type TabValue = 'frequentShops' | 'history';

/**
 * 홈 화면 지도 위에 뜨는 바텀시트입니다.
 *
 * 높이 단계는 `useHomeBottomSheetStore`가 갖고 있습니다. 하단 탭바의 "홈" 버튼을 누르면 정해진
 * 순서(중간 → 최대 → 중간 → 숨김)로 바뀌고, 핸들을 드래그하면 손가락을 따라 자유롭게 움직이다가
 * 가장 가까운 단계로 스냅됩니다.
 */
export default function HomeBottomSheet() {
  const stepIndex = useHomeBottomSheetStore((state) => state.stepIndex);
  const setSnapPoint = useHomeBottomSheetStore((state) => state.setSnapPoint);
  const snapPoint = getHomeBottomSheetSnapPoint(stepIndex);
  const [tab, setTab] = useState<TabValue>('frequentShops');

  return (
    <BottomSheet snapPoint={snapPoint} onSnapPointChange={setSnapPoint}>
      <SegmentedToggle
        options={[
          { label: '자주 소비한 곳', value: 'frequentShops' },
          { label: '소비 기록', value: 'history' },
        ]}
        value={tab}
        onValueChange={setTab}
      />
    </BottomSheet>
  );
}
