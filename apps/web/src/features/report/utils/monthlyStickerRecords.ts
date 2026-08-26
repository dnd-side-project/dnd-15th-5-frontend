import type { StickerResponse } from '@/features/report/apis/dto';
import type { MonthlyStickerRecordGroup } from '@/features/report/types';

const DATE_VALUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;
const KOREAN_WEEKDAY_FORMATTER = new Intl.DateTimeFormat('ko-KR', { weekday: 'long' });

export const formatAcquiredDateLabel = (acquiredDate: string) => {
  const match = DATE_VALUE_PATTERN.exec(acquiredDate);

  if (!match) return acquiredDate;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const weekdayLabel = KOREAN_WEEKDAY_FORMATTER.format(date);

  return `${Number(day)}일 ${weekdayLabel}`;
};

/** API 스티커 필드명을 유지한 채 획득일 내림차순으로 묶습니다. */
export const createMonthlyStickerRecordGroups = (
  stickers: readonly StickerResponse[] = []
): MonthlyStickerRecordGroup[] => {
  const monthlyStickersByDate = new Map<string, (StickerResponse & { acquiredDate: string })[]>();
  const sortedStickers = [...stickers]
    .filter((sticker): sticker is StickerResponse & { acquiredDate: string } =>
      Boolean(sticker.acquiredDate)
    )
    .sort((left, right) => right.acquiredDate.localeCompare(left.acquiredDate));

  sortedStickers.forEach((sticker) => {
    const acquiredDate = sticker.acquiredDate.slice(0, 10);
    const monthlyStickers = monthlyStickersByDate.get(acquiredDate) ?? [];

    monthlyStickers.push(sticker);
    monthlyStickersByDate.set(acquiredDate, monthlyStickers);
  });

  return Array.from(monthlyStickersByDate, ([acquiredDate, monthlyStickers]) => ({
    acquiredDate,
    monthlyStickers,
  }));
};
