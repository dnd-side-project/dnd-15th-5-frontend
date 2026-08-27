import { keepPreviousData } from '@tanstack/react-query';

import { useGetMonthlyReport } from '@/features/report/apis/queries';
import { mapMonthlyReportResponse } from '@/features/report/utils/monthlyReport';
import type { YearMonth } from '@/shared/types/yearMonth';
import { formatYearMonth } from '@/shared/utils/yearMonth';

export const MONTHLY_REPORT_CACHE_TIME = Number.POSITIVE_INFINITY;

/** 선택한 연월의 월간 리포트를 조회하고 상세 화면 표시 모델로 변환합니다. */
export const useMonthlyReportQuery = (month: YearMonth) =>
  useGetMonthlyReport(
    { yearMonth: formatYearMonth(month) },
    {
      query: {
        gcTime: MONTHLY_REPORT_CACHE_TIME,
        placeholderData: keepPreviousData,
        select: ({ data }) => mapMonthlyReportResponse(data, month),
        staleTime: MONTHLY_REPORT_CACHE_TIME,
      },
    }
  );
