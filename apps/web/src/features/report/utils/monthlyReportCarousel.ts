import type {
  MonthlyReportAdjacentCard,
  MonthlyReportData,
  MonthlyReportPreferenceCard,
} from '@/features/report/types';
import type { YearMonth } from '@/shared/types/yearMonth';
import { formatYearMonth, isSameMonth } from '@/shared/utils/yearMonth';

type CreateMonthlyReportCarouselCardsOptions = {
  adjacentReportData?: readonly MonthlyReportData[];
  reportData: MonthlyReportData | undefined;
  selectableMonths: readonly YearMonth[];
  selectedMonth: YearMonth;
};

/** 현재 리포트와 API가 제공한 모든 인접 카드를 월별 캐러셀 목록으로 정규화합니다. */
export const createMonthlyReportCarouselCards = ({
  adjacentReportData = [],
  reportData,
  selectableMonths,
  selectedMonth,
}: CreateMonthlyReportCarouselCardsOptions): MonthlyReportPreferenceCard[] => {
  if (!reportData) return [];

  const selectedYearMonth = formatYearMonth(selectedMonth);
  const cardsByYearMonth = new Map<string, MonthlyReportAdjacentCard>();
  const monthlyReports = [reportData, ...adjacentReportData];
  const reportCards: MonthlyReportAdjacentCard[] = [
    ...monthlyReports.flatMap((monthlyReport) => monthlyReport.adjacentCards),
    ...monthlyReports.map((monthlyReport) =>
      'isUnavailable' in monthlyReport
        ? { isUnavailable: true as const, month: monthlyReport.month }
        : {
            ...monthlyReport.persona,
            isUnavailable: false as const,
            month: monthlyReport.month,
          }
    ),
  ];

  reportCards.forEach((card) => {
    const yearMonth = formatYearMonth(card.month);
    const existingCard = cardsByYearMonth.get(yearMonth);

    if (existingCard && !existingCard.isUnavailable && card.isUnavailable) return;

    cardsByYearMonth.set(yearMonth, card);
  });

  if (!cardsByYearMonth.has(selectedYearMonth)) {
    cardsByYearMonth.set(selectedYearMonth, { isUnavailable: true, month: selectedMonth });
  }

  return Array.from(cardsByYearMonth, ([id, card]) => ({ ...card, id }))
    .filter((card) =>
      selectableMonths.some((selectableMonth) => isSameMonth(selectableMonth, card.month))
    )
    .sort((left, right) => left.id.localeCompare(right.id));
};
