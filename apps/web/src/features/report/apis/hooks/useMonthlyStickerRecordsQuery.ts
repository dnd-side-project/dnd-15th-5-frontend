import type { StickerResponse } from '@/features/report/apis/dto';
import { useGetCurrentStatus } from '@/features/report/apis/queries';
import type { MonthlyStickerRecordGroup } from '@/features/report/types';
import { getStickerImageByName } from '@/shared/assets/images/stickers';
import type { YearMonth } from '@/shared/types/yearMonth';
import { formatYearMonth } from '@/shared/utils/yearMonth';

const DATE_VALUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;
const KOREAN_WEEKDAY_FORMATTER = new Intl.DateTimeFormat('ko-KR', { weekday: 'long' });

const formatDateLabel = (dateValue: string) => {
  const match = DATE_VALUE_PATTERN.exec(dateValue);

  if (!match) return dateValue;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const weekdayLabel = KOREAN_WEEKDAY_FORMATTER.format(date);

  return `${Number(day)}일 ${weekdayLabel}`;
};

/** API 스티커 목록을 획득일 내림차순의 화면 표시 그룹으로 변환합니다. */
export const createMonthlyStickerRecordGroups = (
  stickers: readonly StickerResponse[] = []
): MonthlyStickerRecordGroup[] => {
  const stickerImagesByDate = new Map<string, string[]>();
  const sortedStickers = [...stickers]
    .filter((sticker): sticker is StickerResponse & { acquiredDate: string } =>
      Boolean(sticker.acquiredDate)
    )
    .sort((left, right) => right.acquiredDate.localeCompare(left.acquiredDate));

  sortedStickers.forEach(({ acquiredDate, itemName }) => {
    const dateValue = acquiredDate.slice(0, 10);
    const stickerImages = stickerImagesByDate.get(dateValue) ?? [];

    stickerImages.push(getStickerImageByName(itemName));
    stickerImagesByDate.set(dateValue, stickerImages);
  });

  return Array.from(stickerImagesByDate, ([dateValue, stickerImages]) => ({
    dateLabel: formatDateLabel(dateValue),
    dateValue,
    stickerImages,
  }));
};

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
