import { WEEKDAY_FULL_LABELS } from '@/features/report/constants';
import type { MonthlyReportWeekdaySpending } from '@/features/report/types';
import { getRelativeBarHeightPercentage } from '@/features/report/utils/reportChart';

import ReportChartTooltip from './ReportChartTooltip';
import ReportSectionTitle from './ReportSectionTitle';

type WeekdaySpendingChartProps = {
  insight: string;
  items: readonly MonthlyReportWeekdaySpending[];
};

/** 요일별 소비 금액을 상대 높이의 막대 차트로 표시합니다. */
export default function WeekdaySpendingChart({ insight, items }: WeekdaySpendingChartProps) {
  const maximumCount = Math.max(...items.map((item) => item.count), 0);

  return (
    <section>
      <ReportSectionTitle title="요일별 소비" />
      <ul aria-label="요일별 소비 금액" className="mt-3 grid h-29.25 grid-cols-7 gap-1">
        {items.map((item, index) => {
          const isHighlighted = maximumCount > 0 && item.count === maximumCount;
          const barHeightPercentage = getRelativeBarHeightPercentage(item.count, maximumCount);
          const formattedCount = `${item.count}회`;

          return (
            <li className="flex min-w-0 flex-col items-center gap-1" key={item.day}>
              <button
                aria-label={`${WEEKDAY_FULL_LABELS[item.day]} 소비 ${formattedCount}`}
                className="group relative flex min-h-0 w-full flex-1 items-end justify-center focus-visible:outline-none"
                type="button"
              >
                <span
                  aria-hidden
                  className={`w-full max-w-11.25 rounded-lg ${isHighlighted ? 'bg-primary-500' : 'bg-neutral-200'} group-focus-visible:ring-2 group-focus-visible:ring-neutral-900`}
                  style={{ height: `${barHeightPercentage}%` }}
                />
                <ReportChartTooltip
                  alignment={index === 0 ? 'start' : index === items.length - 1 ? 'end' : 'center'}
                >
                  {formattedCount}
                </ReportChartTooltip>
              </button>
              <span
                className={
                  isHighlighted
                    ? 'text-body-02-semibold text-neutral-900'
                    : 'text-body-02-medium text-neutral-400'
                }
              >
                {item.day}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-7 rounded-lg bg-primary-50 py-2 text-center text-body-02-medium text-primary-500">
        {insight}
      </p>
    </section>
  );
}
