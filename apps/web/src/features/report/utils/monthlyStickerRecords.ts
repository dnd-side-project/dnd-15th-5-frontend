import type { DayVisualsResponse } from '@/features/report/apis/dto';
import type { MonthlyStickerRecordGroup } from '@/features/report/types';
import { getStickerImage } from '@/shared/assets/images/stickers';

const DATE_VALUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;
const KOREAN_WEEKDAY_FORMATTER = new Intl.DateTimeFormat('ko-KR', { weekday: 'long' });

export const formatStickerDateLabel = (dateValue: string) => {
  const match = DATE_VALUE_PATTERN.exec(dateValue);

  if (!match) return dateValue;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const weekdayLabel = KOREAN_WEEKDAY_FORMATTER.format(date);

  return `${Number(day)}일 ${weekdayLabel}`;
};

/** 스티커보드의 응답 순서를 유지하며 사진과 이모지의 표시 데이터를 만듭니다. */
export const mapStickerBoardToRecordGroups = (
  days: readonly DayVisualsResponse[] = []
): MonthlyStickerRecordGroup[] => {
  const imagesByDate = new Map<string, string[]>();

  days.forEach(({ date, visuals }) => {
    if (!date) return;

    const stickerImages = (visuals ?? []).flatMap(({ stickerName, imageId, imageUrl }) => {
      const image = getStickerImage({ itemName: stickerName, imageId, imageUrl });
      return image ? [image] : [];
    });
    if (stickerImages.length === 0) return;

    imagesByDate.set(date, [...(imagesByDate.get(date) ?? []), ...stickerImages]);
  });

  return Array.from(imagesByDate, ([date, stickerImages]) => ({ date, stickerImages }));
};
