import { useAggregateMonthlyReportMutation } from '@/features/report/apis/hooks/useAggregateMonthlyReportMutation';
import { IS_DEVELOPMENT } from '@/shared/lib/env';
import type { YearMonth } from '@/shared/types/yearMonth';
import { Button } from '@/shared/ui/button';

type MonthlyReportEmptyStateProps = {
  selectedMonth: YearMonth;
};

/** 정기 생성 시점에 만들어지지 않은 월간 리포트를 안내합니다. */
export default function MonthlyReportEmptyState({ selectedMonth }: MonthlyReportEmptyStateProps) {
  const { aggregateMonthlyReport, isAggregatingMonthlyReport } =
    useAggregateMonthlyReportMutation(selectedMonth);

  if (!IS_DEVELOPMENT) return null;

  return (
    <Button
      className="mt-5 w-fit rounded-08"
      isLoading={isAggregatingMonthlyReport}
      onClick={() => aggregateMonthlyReport()}
      size="small"
      variant="secondary"
    >
      개발용 리포트 생성
    </Button>
  );
}
