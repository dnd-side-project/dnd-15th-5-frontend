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

const formatPaidAtLabel = (purchaseDate?: string, purchaseTime?: string) => {
  const parsedDate = parsePurchaseDate(purchaseDate);
  if (!parsedDate) return '';

  const hour = Number(purchaseTime?.slice(0, 2));
  const period = Number.isInteger(hour) ? (hour < 12 ? '오전' : '오후') : null;
  const dateLabel = `${parsedDate.year}.${String(parsedDate.month).padStart(2, '0')}.${String(parsedDate.day).padStart(2, '0')}`;

  return period ? `${dateLabel} · ${period}` : dateLabel;
};

/** 소비내역 API 응답을 날짜별 화면 모델로 변환합니다. 유효하지 않은 항목은 제외합니다. */
export const groupConsumptionsByDate = (
  consumptions: readonly ConsumptionResponse[]
): SpendingRecordGroup[] => {
  const groups = new Map<string, SpendingRecordGroup['records'][number][]>();

  consumptions.forEach((consumption) => {
    const parsedDate = parsePurchaseDate(consumption.purchaseDate);
    if (!parsedDate || consumption.id === undefined) return;

    const records = groups.get(consumption.purchaseDate!) ?? [];
    records.push({
      id: String(consumption.id),
      shopName: consumption.placeName?.trim() || '알 수 없는 장소',
      amount: consumption.amount ?? 0,
      paidAtLabel: formatPaidAtLabel(consumption.purchaseDate, consumption.purchaseTime),
      category: consumption.category?.trim() || '기타',
    });
    groups.set(consumption.purchaseDate!, records);
  });

  return [...groups.entries()].map(([dateValue, records]) => {
    const parsedDate = parsePurchaseDate(dateValue)!;
    return {
      dateValue,
      dateLabel: `${parsedDate.day}일 ${KOREAN_WEEKDAYS[parsedDate.date.getDay()]}`,
      records,
    };
  });
};

export const formatSpendingYearMonth = ({ year, month }: YearMonth) =>
  `${year}-${String(month).padStart(2, '0')}`;

/** 현재 월부터 지정한 개수만큼 과거 월 목록을 최신순으로 만듭니다. */
export const createRecentSpendingMonths = (count: number, today = new Date()): YearMonth[] =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });
