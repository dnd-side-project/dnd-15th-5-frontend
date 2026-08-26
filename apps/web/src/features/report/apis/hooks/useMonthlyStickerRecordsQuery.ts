import { useGetCurrentStatus } from '@/features/report/apis/queries';
import { createMonthlyStickerRecordGroups } from '@/features/report/utils/monthlyStickerRecords';
import type { YearMonth } from '@/shared/types/yearMonth';
import { formatYearMonth } from '@/shared/utils/yearMonth';

/** 선택한 월의 누적 스티커를 조회하고 날짜별 화면 데이터로 가공합니다. */
export const useMonthlyStickerRecordsQuery = (month: YearMonth) =>
  useGetCurrentStatus(
    { yearMonth: formatYearMonth(month) },
    {
      query: {
        select: (response) => createMonthlyStickerRecordGroups(response.data?.monthlyStickers),
      },
    }
  );
