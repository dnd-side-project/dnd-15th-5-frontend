import type { ConsumptionResponse, StickerResponse } from '@/features/report/apis/dto';
import type { YearMonth } from '@/shared/types/yearMonth';

import type { SpendingCategory } from '@chapchap/shared/common/types';

/** 취향 카드에 적용할 시각 디자인 유형입니다. */
export type ReportPreferenceCardVariant =
  'alley-explorer' | 'food-nomad' | 'local-regular' | 'night-watch';

/** 소비 성향의 양극 라벨과 사용자 점수입니다. */
export type ReportPreferenceMetric = {
  leftLabel: string;
  rightLabel: string;
  value: number;
};

/** 월간 리포트의 소비 성향 카드 내용입니다. */
export type MonthlyReportPersona = {
  description: string;
  metrics: readonly ReportPreferenceMetric[];
  tags: readonly string[];
  title: string;
  variant: ReportPreferenceCardVariant;
};

/** 양옆 달에 표시할 페르소나 카드 또는 empty 카드입니다. */
export type MonthlyReportAdjacentCard =
  | (MonthlyReportPersona & {
      isUnavailable: false;
      month: YearMonth;
    })
  | {
      isUnavailable: true;
      month: YearMonth;
    };

/** 캐러셀 식별자가 추가된 월별 취향 카드입니다. */
export type MonthlyReportPreferenceCard = MonthlyReportAdjacentCard & { id: string };

/** 카테고리별 월간 소비 비율입니다. */
export type MonthlyReportCategory = {
  category: SpendingCategory;
  percentage: number;
};

/** 월간 방문이 많았던 동네와 방문 횟수입니다. */
export type MonthlyReportDistrict = {
  name: string;
  visits: number;
};

/** 월간 방문 순위에 포함된 가게 정보입니다. */
export type MonthlyReportShop = {
  id: string | null;
  months: number;
  name: string;
  rank: 1 | 2 | 3;
  stickerImages: readonly string[];
  visits: number;
};

/** 월간 활동 요약에 표시할 수치입니다. */
export type MonthlyReportSummaryItem = {
  label: string;
  value: number;
};

/** 요일별 월간 방문 횟수입니다. */
export type MonthlyReportWeekdaySpending = {
  count: number;
  day: '월' | '화' | '수' | '목' | '금' | '토' | '일';
};

/** 생성된 월간 리포트의 전체 화면 데이터입니다. */
export type MonthlyReport = {
  adjacentCards: readonly MonthlyReportAdjacentCard[];
  categories: readonly MonthlyReportCategory[];
  districts: readonly MonthlyReportDistrict[];
  month: YearMonth;
  persona: MonthlyReportPersona;
  shops: readonly MonthlyReportShop[];
  summary: readonly MonthlyReportSummaryItem[];
  weekdayInsight: string;
  weekdaySpending: readonly MonthlyReportWeekdaySpending[];
};

/** 리포트가 없는 달의 현재 월과 양옆 카드 데이터입니다. */
export type MonthlyReportUnavailable = {
  adjacentCards: readonly MonthlyReportAdjacentCard[];
  isUnavailable: true;
  month: YearMonth;
};

/** 월간 리포트 API에서 만들 수 있는 생성·미생성 화면 데이터입니다. */
export type MonthlyReportData = MonthlyReport | MonthlyReportUnavailable;

/** 주간 캘린더의 날짜별 기록 상태입니다. */
export type WeeklyRecord = {
  count?: number;
  date: number;
  dateValue: string;
  day: string;
  isFuture?: boolean;
  isToday?: boolean;
};

/** 같은 날짜에 획득한 월간 스티커 묶음입니다. */
export type MonthlyStickerRecordGroup = {
  acquiredDate: string;
  monthlyStickers: readonly (StickerResponse & { acquiredDate: string })[];
};

/** 같은 구매일에 속한 소비 기록 묶음입니다. */
export type SpendingRecordGroup = {
  consumptions: readonly (ConsumptionResponse & { id: number; purchaseDate: string })[];
  purchaseDate: string;
};

/** 단골 가게 목록에 표시할 방문 요약 정보입니다. */
export type FrequentShop = {
  category: SpendingCategory;
  district: string;
  id: string;
  monthlyVisitCount: number;
  name: string;
  thumbnailSrc: string | null;
  totalVisitCount: number;
};

/** 단골 가게 집계 기간 필터입니다. */
export type FrequentShopPeriod = 'currentMonth' | 'all';
