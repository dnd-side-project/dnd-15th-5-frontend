import type { MonthlyReportResponse } from '@/features/report/apis/dto';
import type { MonthlyReport, ReportPreferenceCardVariant } from '@/features/report/types';
import { getStickerImageByName } from '@/shared/assets/images/stickers';
import type { YearMonth } from '@/shared/types/yearMonth';
import { getMonthDifference, parseYearMonth } from '@/shared/utils/yearMonth';

import type { SpendingCategory } from '@chapchap/shared/common/types';

const CATEGORY_NAMES = new Set<SpendingCategory>([
  '카페',
  '운동',
  '편의점/마트',
  '취미/놀거리',
  '음식점',
  '미용/뷰티',
  '기타',
]);
const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const;
const PERSONA_VARIANTS: Record<string, ReportPreferenceCardVariant> = {
  ALLEY_EXPLORER: 'alley-explorer',
  EXPLORER: 'alley-explorer',
  FOOD_NOMAD: 'food-nomad',
  NOMAD: 'food-nomad',
  LOCAL_REGULAR: 'local-regular',
  REGULAR: 'local-regular',
  NIGHT_WATCH: 'night-watch',
  NIGHT_WATCHER: 'night-watch',
};

const toSafeNumber = (value?: number) => (Number.isFinite(value) ? Math.max(value ?? 0, 0) : 0);

const toPercentage = (value?: number) => Math.min(toSafeNumber(value), 100);

const toSpendingCategory = (category?: string): SpendingCategory =>
  category && CATEGORY_NAMES.has(category as SpendingCategory)
    ? (category as SpendingCategory)
    : '기타';

const resolvePersonaVariant = (type?: string, typeName?: string): ReportPreferenceCardVariant => {
  const normalizedType = type?.trim().toUpperCase().replaceAll('-', '_');
  if (normalizedType && PERSONA_VARIANTS[normalizedType]) return PERSONA_VARIANTS[normalizedType];

  if (typeName?.includes('유목')) return 'food-nomad';
  if (typeName?.includes('터줏대감')) return 'local-regular';
  if (typeName?.includes('야간')) return 'night-watch';
  return 'alley-explorer';
};

const calculateKnownMonthCount = (firstVisitedDate: string | undefined, reportMonth: YearMonth) => {
  const firstVisitedMonth = parseYearMonth(firstVisitedDate?.slice(0, 7));
  if (!firstVisitedMonth) return 1;

  return Math.max(getMonthDifference(reportMonth, firstVisitedMonth) + 1, 1);
};

const createWeekdayInsight = (peakDayOfWeek?: string, peakTimeSlot?: string) => {
  const day = peakDayOfWeek?.trim();
  const time = peakTimeSlot?.trim();
  if (!day && !time) return '요일별 소비 패턴을 확인해 보세요';

  const dayLabel = day ? (day.endsWith('요일') ? day : `${day}요일`) : '';
  return `${[dayLabel, time].filter(Boolean).join(' ')}에 가장 많이 소비했어요`;
};

/** 월간 리포트 API 응답을 상세 화면에서 사용하는 안전한 표시 모델로 변환합니다. */
export const mapMonthlyReportResponse = (
  response: MonthlyReportResponse | undefined,
  requestedMonth: YearMonth
): MonthlyReport | undefined => {
  if (response?.reportId === undefined) return undefined;

  const reportMonth = parseYearMonth(response.yearMonth) ?? requestedMonth;
  const categoryPercentages = new Map<SpendingCategory, number>();
  response.categoryStats?.forEach(({ category, percentage }) => {
    const categoryName = toSpendingCategory(category);
    categoryPercentages.set(
      categoryName,
      (categoryPercentages.get(categoryName) ?? 0) + toPercentage(percentage)
    );
  });

  const scores = response.persona?.scores;
  const persona = response.persona;

  return {
    month: reportMonth,
    persona: {
      description: '',
      metrics: [
        {
          leftLabel: '신규 탐색형',
          rightLabel: '단골 반복형',
          value: toPercentage(scores?.scoreExploration),
        },
        {
          leftLabel: '동네 확장형',
          rightLabel: '동네 집중형',
          value: toPercentage(scores?.scoreTownExpansion),
        },
        {
          leftLabel: '낮소비형',
          rightLabel: '밤소비형',
          value: toPercentage(scores?.scoreDaytime),
        },
        {
          leftLabel: '즉흥형',
          rightLabel: '규칙형',
          value: toPercentage(scores?.scoreImpulsive),
        },
      ],
      tags: persona?.keywords?.filter(Boolean) ?? [],
      title: persona?.typeName?.trim() || '나의 소비 취향',
      variant: resolvePersonaVariant(persona?.type, persona?.typeName),
    },
    summary: [
      { label: '방문 횟수', value: toSafeNumber(response.summary?.totalVisitCount) },
      { label: '동네 갯수', value: toSafeNumber(response.summary?.newTownCount) },
      { label: '새 가게 수', value: toSafeNumber(response.summary?.newPlaceCount) },
    ],
    shops: (response.placeRanks ?? []).flatMap((shop, index) => {
      const rank = shop.rank ?? index + 1;
      const name = shop.placeName?.trim();
      if (!name || rank < 1 || rank > 3) return [];

      return [
        {
          id: `${rank}-${name}`,
          months: calculateKnownMonthCount(shop.firstVisitedDate, reportMonth),
          name,
          rank: rank as 1 | 2 | 3,
          stickerImages: (shop.stickerNames ?? []).flatMap((stickerName) => {
            const image = getStickerImageByName(stickerName);
            return image ? [image] : [];
          }),
          visits: toSafeNumber(shop.visitCount),
        },
      ];
    }),
    districts: (response.townRanks ?? []).flatMap((district) => {
      const name = district.townName?.trim();
      return name ? [{ name, visits: toSafeNumber(district.visitCount) }] : [];
    }),
    categories: [...categoryPercentages].map(([category, percentage]) => ({
      category,
      percentage: Math.min(percentage, 100),
    })),
    weekdaySpending: WEEKDAY_LABELS.map((day, index) => ({
      day,
      count: toSafeNumber(
        response.timePattern?.dayOfWeekPattern?.find(({ dayOfWeek }) => dayOfWeek === index + 1)
          ?.visitCount
      ),
    })),
    weekdayInsight: createWeekdayInsight(
      response.timePattern?.peakDayOfWeek,
      response.timePattern?.peakTimeSlot
    ),
  };
};
