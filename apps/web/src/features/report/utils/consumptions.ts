import type { ConsumptionResponse } from '@/features/report/apis/dto';
import type { SpendingRecordGroup } from '@/features/report/types';
import type { YearMonth } from '@/shared/types/yearMonth';

const KOREAN_WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const parsePurchaseDate = (purchaseDate?: string) => {
  if (!purchaseDate) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(purchaseDate);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return { date, day, year, month };
};

export const formatPurchaseDateTimeLabel = (purchaseDate?: string, purchaseTime?: string) => {
  const parsedDate = parsePurchaseDate(purchaseDate);
  if (!parsedDate) return '';

  const hour = Number(purchaseTime?.slice(0, 2));
  const period = Number.isInteger(hour) ? (hour < 12 ? '오전' : '오후') : null;
  const dateLabel = `${parsedDate.year}.${String(parsedDate.month).padStart(2, '0')}.${String(parsedDate.day).padStart(2, '0')}`;

  return period ? `${dateLabel} · ${period}` : dateLabel;
};

export const formatPurchaseDateLabel = (purchaseDate: string) => {
  const parsedDate = parsePurchaseDate(purchaseDate);

  return parsedDate
    ? `${parsedDate.day}일 ${KOREAN_WEEKDAYS[parsedDate.date.getDay()]}`
    : purchaseDate;
};

/** API 소비내역의 필드명을 유지한 채 구매일별로 묶습니다. 유효하지 않은 항목은 제외합니다. */
export const groupConsumptionsByDate = (
  consumptions: readonly ConsumptionResponse[]
): SpendingRecordGroup[] => {
  const groups = new Map<string, SpendingRecordGroup['consumptions'][number][]>();

  consumptions.forEach((consumption) => {
    const purchaseDate = consumption.purchaseDate;
    if (!purchaseDate || consumption.id === undefined) return;

    const parsedDate = parsePurchaseDate(purchaseDate);
    if (!parsedDate) return;

    const consumptionsForDate = groups.get(purchaseDate) ?? [];
    consumptionsForDate.push(
      consumption as ConsumptionResponse & { id: number; purchaseDate: string }
    );
    groups.set(purchaseDate, consumptionsForDate);
  });

  return [...groups.entries()].map(([purchaseDate, consumptionsForDate]) => ({
    consumptions: consumptionsForDate,
    purchaseDate,
  }));
};

export const formatSpendingYearMonth = ({ year, month }: YearMonth) =>
  `${year}-${String(month).padStart(2, '0')}`;

/** 현재 월부터 지정한 개수만큼 과거 월 목록을 최신순으로 만듭니다. */
export const createRecentSpendingMonths = (count: number, today = new Date()): YearMonth[] =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });
