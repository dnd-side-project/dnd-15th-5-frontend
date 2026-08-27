import type { MonthlyReport } from '@/features/report/types';

import { createMonthlyReportCarouselCards } from './monthlyReportCarousel';

const report: MonthlyReport = {
  adjacentCards: [
    { isUnavailable: true, month: { month: 5, year: 2026 } },
    { isUnavailable: true, month: { month: 7, year: 2026 } },
  ],
  categories: [],
  districts: [],
  month: { month: 6, year: 2026 },
  persona: {
    description: '설명',
    metrics: [],
    tags: [],
    title: '제목',
    variant: 'alley-explorer',
  },
  shops: [],
  summary: [],
  weekdayInsight: '',
  weekdaySpending: [],
};

describe('createMonthlyReportCarouselCards', () => {
  it('선택 가능한 범위 안의 카드를 과거부터 최신 순서로 만든다', () => {
    const cards = createMonthlyReportCarouselCards({
      report,
      selectableMonths: [
        { month: 7, year: 2026 },
        { month: 6, year: 2026 },
        { month: 5, year: 2026 },
      ],
      selectedMonth: { month: 6, year: 2026 },
    });

    expect(cards.map(({ id }) => id)).toEqual(['2026-05', '2026-06', '2026-07']);
    expect(cards[1]?.isUnavailable).toBe(false);
  });

  it('응답에 선택한 달 카드가 없으면 빈 카드를 추가한다', () => {
    const cards = createMonthlyReportCarouselCards({
      report,
      selectableMonths: [{ month: 7, year: 2026 }],
      selectedMonth: { month: 7, year: 2026 },
    });

    expect(cards).toEqual([
      { id: '2026-07', isUnavailable: true, month: { month: 7, year: 2026 } },
    ]);
  });

  it('리포트가 없으면 카드도 만들지 않는다', () => {
    expect(
      createMonthlyReportCarouselCards({
        report: undefined,
        selectableMonths: [{ month: 7, year: 2026 }],
        selectedMonth: { month: 7, year: 2026 },
      })
    ).toEqual([]);
  });
});
