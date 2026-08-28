import { createYearMonthPath, ROUTE_PATHS } from '@/shared/constants/routePaths';
import type { YearMonth } from '@/shared/types/yearMonth';
import { StateView } from '@/shared/ui/state-view';
import { formatYearMonth } from '@/shared/utils/yearMonth';

type MonthlyRecordEmptyStateProps = {
  isPastMonth: boolean;
  selectedMonth: YearMonth;
};

/** 선택한 월의 기록 유무에 맞는 안내와 기록 작성 경로를 보여줍니다. */
export default function MonthlyRecordEmptyState({
  isPastMonth,
  selectedMonth,
}: MonthlyRecordEmptyStateProps) {
  const actionPath = isPastMonth
    ? createYearMonthPath(ROUTE_PATHS.record, formatYearMonth(selectedMonth))
    : ROUTE_PATHS.record;

  return (
    <StateView
      actionLabel={isPastMonth ? `${selectedMonth.month}월 기록 추가하기` : '소비 기록 작성하기'}
      className="my-auto"
      description={
        isPastMonth
          ? `지난 소비를 기록하면 ${selectedMonth.month}월 소비 내역을 보여드릴게요.`
          : '소비 기록을 작성하면 이번 달 소비 내역을 보여드릴게요.'
      }
      headingAs="h2"
      title={isPastMonth ? `${selectedMonth.month}월에는 기록이 없어요` : '아직 기록이 없어요'}
      to={actionPath}
      variant="empty"
    />
  );
}
