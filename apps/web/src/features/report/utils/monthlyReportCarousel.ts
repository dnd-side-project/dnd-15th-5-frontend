import type {
  MonthlyReport,
  MonthlyReportAdjacentCard,
  MonthlyReportPreferenceCard,
} from '@/features/report/types';
import type { YearMonth } from '@/shared/types/yearMonth';
import { formatYearMonth, isSameMonth } from '@/shared/utils/yearMonth';

type CreateMonthlyReportCarouselCardsOptions = {
  report: MonthlyReport | undefined;
  selectableMonths: readonly YearMonth[];
  selectedMonth: YearMonth;
};

/** 현재 리포트와 양옆 카드 응답을 월별 캐러셀 카드 목록으로 정규화합니다. */
export const createMonthlyReportCarouselCards = ({
  report,
  selectableMonths,
  selectedMonth,
}: CreateMonthlyReportCarouselCardsOptions): MonthlyReportPreferenceCard[] => {
  if (!report) return [];

  const selectedYearMonth = formatYearMonth(selectedMonth);
  const cardsByYearMonth = new Map<string, MonthlyReportAdjacentCard>();
  const reportCards: MonthlyReportAdjacentCard[] = [
    ...report.adjacentCards,
    { ...report.persona, isUnavailable: false, month: report.month },
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
