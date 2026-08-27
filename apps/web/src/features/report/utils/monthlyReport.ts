import type { MonthlyReportResponse } from '@/features/report/apis/dto';
import {
  REPORT_PERSONA_COPY,
  REPORT_PERSONA_TAGS,
  REPORT_PERSONA_VARIANTS,
  REPORT_TIME_SLOT_EMOJIS,
  REPORT_TIME_SLOT_LABELS,
  REPORT_WEEKDAY_LABELS,
} from '@/features/report/constants';
import type {
  MonthlyReport,
  MonthlyReportAdjacentCard,
  ReportPreferenceCardVariant,
} from '@/features/report/types';
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
type PersonaAxes = {
  activityRange: 'H' | 'W';
  consumptionRhythm: 'P' | 'F';
  consumptionTime: 'D' | 'M';
  visitStyle: 'R' | 'N';
};

const toSafeNumber = (value?: number) => (Number.isFinite(value) ? Math.max(value ?? 0, 0) : 0);

const toPercentage = (value?: number) => Math.min(toSafeNumber(value), 100);

const toSpendingCategory = (category?: string): SpendingCategory =>
  category && CATEGORY_NAMES.has(category as SpendingCategory)
    ? (category as SpendingCategory)
    : '기타';

const parsePersonaAxes = (type?: string): PersonaAxes | null => {
  const normalizedType = type?.trim().toUpperCase();
  const match = normalizedType?.match(/^([RN])([HW])([DM])([PF])$/);
  if (!match) return null;

  return {
    visitStyle: match[1] as PersonaAxes['visitStyle'],
    activityRange: match[2] as PersonaAxes['activityRange'],
    consumptionTime: match[3] as PersonaAxes['consumptionTime'],
    consumptionRhythm: match[4] as PersonaAxes['consumptionRhythm'],
  };
};

const resolvePersonaVariant = (type?: string): ReportPreferenceCardVariant => {
  const normalizedType = type?.trim().toUpperCase();
  if (normalizedType && normalizedType in REPORT_PERSONA_VARIANTS) {
    return REPORT_PERSONA_VARIANTS[normalizedType as keyof typeof REPORT_PERSONA_VARIANTS];
  }

  return 'alley-explorer';
};

const createPersonaTags = (axes: PersonaAxes | null, fallbackTags?: readonly string[]) => {
  if (!axes) return fallbackTags?.filter(Boolean) ?? [];

  return [
    REPORT_PERSONA_TAGS.consumptionTime[axes.consumptionTime],
    REPORT_PERSONA_TAGS.visitStyle[axes.visitStyle],
    REPORT_PERSONA_TAGS.consumptionRhythm[axes.consumptionRhythm],
  ];
};

const mapAdjacentPersona = (
  yearMonth: string | undefined,
  type: string | undefined
): MonthlyReportAdjacentCard | undefined => {
  const month = parseYearMonth(yearMonth);
  const axes = parsePersonaAxes(type);
  if (!month || !axes) return undefined;

  const variant = resolvePersonaVariant(type);
  const copy = REPORT_PERSONA_COPY[variant];

  return {
    description: copy.description,
    metrics: [],
    month,
    tags: createPersonaTags(axes, copy.tags),
    title: copy.title,
    variant,
  };
};

const calculateKnownMonthCount = (firstVisitedDate: string | undefined, reportMonth: YearMonth) => {
  const firstVisitedMonth = parseYearMonth(firstVisitedDate?.slice(0, 7));
  if (!firstVisitedMonth) return 1;

  return Math.max(getMonthDifference(reportMonth, firstVisitedMonth) + 1, 1);
};

const createWeekdayInsight = (peakDayOfWeek?: string, peakTimeSlot?: string) => {
  const rawDay = peakDayOfWeek?.trim();
  const rawTime = peakTimeSlot?.trim();
  const day = rawDay ? (REPORT_WEEKDAY_LABELS[rawDay.toUpperCase()] ?? rawDay) : undefined;
  const time = rawTime ? (REPORT_TIME_SLOT_LABELS[rawTime.toUpperCase()] ?? rawTime) : undefined;
  if (!day && !time) return '요일별 소비 패턴을 확인해 보세요';

  const dayLabel = day ? (day.endsWith('요일') ? day : `${day}요일`) : '';
  const emoji = time ? REPORT_TIME_SLOT_EMOJIS[time] : undefined;
  return `당신의 소비는 ${[dayLabel, time].filter(Boolean).join(' ')}에 깨어나요${emoji ? ` ${emoji}` : ''}`;
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
  const personaAxes = parsePersonaAxes(persona?.type);
  const personaVariant = resolvePersonaVariant(persona?.type);
  const personaCopy = REPORT_PERSONA_COPY[personaVariant];

  return {
    adjacentCards: [
      mapAdjacentPersona(response.previous?.yearMonth, response.previous?.type),
      mapAdjacentPersona(response.next?.yearMonth, response.next?.type),
    ].filter((card): card is MonthlyReportAdjacentCard => Boolean(card)),
    month: reportMonth,
    persona: {
      description: personaCopy.description,
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
      tags: createPersonaTags(personaAxes, persona?.keywords ?? personaCopy.tags),
      title: personaCopy.title,
      variant: personaVariant,
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
          id: shop.placeId === undefined ? null : String(shop.placeId),
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
