import { useMonthlyStickerRecordsQuery } from '@/features/report/apis/hooks/useMonthlyStickerRecordsQuery';
import { useGetCurrentStatus } from '@/features/report/apis/queries';
import {
  formatDateYearMonth,
  mapCurrentStatusToReportPageData,
} from '@/features/report/utils/currentReport';

/** 현재 월의 메인 리포트 현황과 화면에 필요한 파생 표시값을 조회합니다. */
export const useCurrentReportQuery = () => {
  const currentDate = new Date();
  const yearMonth = formatDateYearMonth(currentDate);
  const query = useGetCurrentStatus({ yearMonth });
  const stickerQuery = useMonthlyStickerRecordsQuery({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });
  const hasReportError =
    (query.isError && query.data === undefined) ||
    (stickerQuery.isError && stickerQuery.data === undefined);

  return {
    ...query,
    data: mapCurrentStatusToReportPageData(
      query.data?.data,
      yearMonth,
      currentDate,
      (stickerQuery.data ?? []).flatMap(({ stickerImages }) => stickerImages)
    ),
    isPending: query.isPending || stickerQuery.isPending,
    refetch: () => Promise.all([query.refetch(), stickerQuery.refetch()]),
    hasReportError,
  };
};
