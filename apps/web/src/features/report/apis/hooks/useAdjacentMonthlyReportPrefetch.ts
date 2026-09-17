import { useQueries } from '@tanstack/react-query';

import { MONTHLY_REPORT_QUERY_CACHE_OPTIONS } from '@/features/report/apis/cacheOptions';
import { getGetMonthlyReportQueryOptions } from '@/features/report/apis/queries';
import type { MonthlyReportAdjacentCard, MonthlyReportData } from '@/features/report/types';
import { mapMonthlyReportResponse } from '@/features/report/utils/monthlyReport';
import { formatYearMonth } from '@/shared/utils/yearMonth';

/** 양옆 달을 미리 조회하고, 그 응답의 바깥쪽 카드까지 캐러셀에 제공할 수 있게 반환합니다. */
export const useAdjacentMonthlyReportPrefetch = (
  adjacentCards: readonly MonthlyReportAdjacentCard[] | undefined
) => {
  const queries = useQueries({
    queries: (adjacentCards ?? []).map((card) => {
      const month = card.month;

      return getGetMonthlyReportQueryOptions<MonthlyReportData | undefined>(
        { yearMonth: formatYearMonth(month) },
        {
          query: {
            ...MONTHLY_REPORT_QUERY_CACHE_OPTIONS,
            select: ({ data }) => mapMonthlyReportResponse(data, month),
          },
        }
      );
    }),
  });

  return queries.flatMap(({ data }) => (data ? [data] : []));
};
