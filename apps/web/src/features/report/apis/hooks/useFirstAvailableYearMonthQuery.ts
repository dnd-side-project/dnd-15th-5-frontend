import { useGetCurrentStatus } from '@/features/report/apis/queries';
import { formatYearMonth, getCurrentMonth, parseYearMonth } from '@/shared/utils/yearMonth';

/** 현재 리포트 현황에서 사용자별 최초 조회 가능 연월을 조회합니다. */
export const useFirstAvailableYearMonthQuery = () => {
  const currentMonth = getCurrentMonth();

  return useGetCurrentStatus(
    { yearMonth: formatYearMonth(currentMonth) },
    {
      query: {
        select: ({ data }) => parseYearMonth(data?.firstAvailableYearMonth),
      },
    }
  );
};
