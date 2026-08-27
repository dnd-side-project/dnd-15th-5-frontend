import type { YearMonth } from '@/shared/types/yearMonth';
import { StateView } from '@/shared/ui/state-view';

type MonthlyReportEmptyStateProps = {
  selectedMonth: YearMonth;
};

/** 정기 생성 시점에 만들어지지 않은 월간 리포트를 안내합니다. */
export default function MonthlyReportEmptyState({ selectedMonth }: MonthlyReportEmptyStateProps) {
  return (
    <StateView
      className="my-auto"
      description="월간 리포트는 매월 1일에 생성돼요."
      headingAs="h2"
      title={`${selectedMonth.month}월 리포트가 생성되지 않았어요`}
      variant="empty"
    />
  );
}
