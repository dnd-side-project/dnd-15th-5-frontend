import { useNavigate } from 'react-router-dom';

import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { SegmentedToggle } from '@/shared/ui/segmented-toggle';

type ReportTabsProps = {
  active: 'frequentShops' | 'history';
};

const ROUTE_BY_TAB = {
  frequentShops: ROUTE_PATHS.frequentShopList,
  history: ROUTE_PATHS.spendingHistory,
} as const;

/** "자주 소비한 곳"과 "소비 기록" 화면을 오가는 탭입니다. */
export default function ReportTabs({ active }: ReportTabsProps) {
  const navigate = useNavigate();

  return (
    <SegmentedToggle
      options={[
        { label: '자주 소비한 곳', value: 'frequentShops' },
        { label: '소비 기록', value: 'history' },
      ]}
      value={active}
      onValueChange={(value) => navigate(ROUTE_BY_TAB[value])}
    />
  );
}
