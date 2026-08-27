import type {
  MonthlyReportAdjacentCard,
  MonthlyReportData,
  MonthlyReportPreferenceCard,
} from '@/features/report/types';
import type { YearMonth } from '@/shared/types/yearMonth';
import { formatYearMonth, isSameMonth } from '@/shared/utils/yearMonth';

type CreateMonthlyReportCarouselCardsOptions = {
  reportData: MonthlyReportData | undefined;
  selectableMonths: readonly YearMonth[];
  selectedMonth: YearMonth;
};

/** 현재 리포트와 양옆 카드 응답을 월별 캐러셀 카드 목록으로 정규화합니다. */
export const createMonthlyReportCarouselCards = ({
  reportData,
  selectableMonths,
  selectedMonth,
}: CreateMonthlyReportCarouselCardsOptions): MonthlyReportPreferenceCard[] => {
  if (!reportData) return [];

  const selectedYearMonth = formatYearMonth(selectedMonth);
  const cardsByYearMonth = new Map<string, MonthlyReportAdjacentCard>();
  const reportCards: MonthlyReportAdjacentCard[] = [
    ...reportData.adjacentCards,
    'isUnavailable' in reportData
      ? { isUnavailable: true, month: reportData.month }
      : { ...reportData.persona, isUnavailable: false, month: reportData.month },
  ];

  reportCards.forEach((card) => cardsByYearMonth.set(formatYearMonth(card.month), card));

  if (!cardsByYearMonth.has(selectedYearMonth)) {
    cardsByYearMonth.set(selectedYearMonth, { isUnavailable: true, month: selectedMonth });
  }

  return Array.from(cardsByYearMonth, ([id, card]) => ({ ...card, id }))
    .filter((card) =>
      selectableMonths.some((selectableMonth) => isSameMonth(selectableMonth, card.month))
    )
    .sort((left, right) => left.id.localeCompare(right.id));
};
