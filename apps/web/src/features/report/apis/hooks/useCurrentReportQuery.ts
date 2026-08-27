import { useGetCurrentStatus } from '@/features/report/apis/queries';
import {
  formatDateYearMonth,
  mapCurrentStatusToReportPageData,
} from '@/features/report/utils/currentReport';

/** 현재 월의 메인 리포트 현황과 화면에 필요한 파생 표시값을 조회합니다. */
export const useCurrentReportQuery = () => {
  const currentDate = new Date();
  const yearMonth = formatDateYearMonth(currentDate);
  const query = useGetCurrentStatus(
    { yearMonth },
    {
      query: {
        select: ({ data }) => mapCurrentStatusToReportPageData(data, yearMonth, currentDate),
      },
    }
  );
  const hasReportError = query.isError && query.data === undefined;

  return {
    ...query,
    data: query.data ?? mapCurrentStatusToReportPageData(undefined, yearMonth, currentDate),
    hasReportError,
  };
};
