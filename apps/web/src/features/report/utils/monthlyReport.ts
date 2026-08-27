import {
  MONDAY_FIRST_WEEKDAY_LABELS,
  SPENDING_CATEGORIES,
} from '@chapchap/shared/common/constants';

import type { AdjacentPersonaResponse, MonthlyReportResponse } from '@/features/report/apis/dto';
import {
  REPORT_PERSONA_COPY,
  REPORT_PERSONA_TAGS,
  REPORT_PERSONA_VARIANTS,
  REPORT_TIME_SLOT_EMOJIS,
  REPORT_TIME_SLOT_LABELS,
  REPORT_WEEKDAY_LABELS,
} from '@/features/report/constants';
import type {
  MonthlyReportAdjacentCard,
  MonthlyReportData,
  ReportPreferenceCardVariant,
} from '@/features/report/types';
import { getStickerImageByName } from '@/shared/assets/images/stickers';
import type { YearMonth } from '@/shared/types/yearMonth';
import { addMonth, getMonthDifference, parseYearMonth } from '@/shared/utils/yearMonth';

import type { SpendingCategory } from '@chapchap/shared/common/types';

const SPENDING_CATEGORY_SET = new Set<SpendingCategory>(SPENDING_CATEGORIES);

/** 페르소나 코드 네 자리를 구성하는 소비 성향 축입니다. */
type PersonaAxes = {
  activityRange: 'H' | 'W';
  consumptionRhythm: 'P' | 'F';
  consumptionTime: 'D' | 'M';
  visitStyle: 'R' | 'N';
};

const toSafeNumber = (value?: number) => (Number.isFinite(value) ? Math.max(value ?? 0, 0) : 0);

const toPercentage = (value?: number) => Math.min(toSafeNumber(value), 100);

const toSpendingCategory = (category?: string): SpendingCategory =>
  category && SPENDING_CATEGORY_SET.has(category as SpendingCategory)
    ? (category as SpendingCategory)
    : '기타';

/** 백엔드의 RHDP 형식 코드를 네 가지 소비 성향 축으로 분리합니다. */
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

/** 인접 월의 타입이 없으면 해당 월을 empty 카드로 변환합니다. */
const mapAdjacentPersona = (
  adjacent: AdjacentPersonaResponse | null | undefined,
  fallbackMonth: YearMonth
): MonthlyReportAdjacentCard | undefined => {
  if (adjacent === undefined) return undefined;

  const month = parseYearMonth(adjacent?.yearMonth) ?? fallbackMonth;
  const axes = parsePersonaAxes(adjacent?.type);
  if (!axes) return { isUnavailable: true, month };

  const variant = resolvePersonaVariant(adjacent?.type);
  const copy = REPORT_PERSONA_COPY[variant];

  return {
    description: copy.description,
    isUnavailable: false,
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
): MonthlyReportData | undefined => {
  if (!response) return undefined;
  if (response.reportId === undefined && response.yearMonth === undefined) return undefined;

  const reportMonth = parseYearMonth(response.yearMonth) ?? requestedMonth;
  const adjacentCards = [
    mapAdjacentPersona(response.previous, addMonth(reportMonth, -1)),
    mapAdjacentPersona(response.next, addMonth(reportMonth, 1)),
  ].filter((card): card is MonthlyReportAdjacentCard => Boolean(card));

  // NOTE: 미생성 월도 양옆 카드 탐색에 필요한 메타데이터는 응답되므로 버리지 않습니다.
  if (response.reportId == null) {
    return {
      adjacentCards,
      isUnavailable: true,
      month: reportMonth,
    };
  }

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
    adjacentCards,
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
    weekdaySpending: MONDAY_FIRST_WEEKDAY_LABELS.map((day, index) => ({
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
