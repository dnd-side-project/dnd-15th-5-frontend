import type { ConsumptionResponse, StickerResponse } from '@/features/report/apis/dto';
import type { YearMonth } from '@/shared/types/yearMonth';

import type { SpendingCategory } from '@chapchap/shared/common/types';

export type ReportPreferenceCardVariant =
  'alley-explorer' | 'food-nomad' | 'local-regular' | 'night-watch';

export type ReportPreferenceMetric = {
  leftLabel: string;
  rightLabel: string;
  value: number;
};

export type MonthlyReportPersona = {
  description: string;
  metrics: readonly ReportPreferenceMetric[];
  tags: readonly string[];
  title: string;
  variant: ReportPreferenceCardVariant;
};

export type MonthlyReportAdjacentCard =
  | (MonthlyReportPersona & {
      isUnavailable: false;
      month: YearMonth;
    })
  | {
      isUnavailable: true;
      month: YearMonth;
    };

export type MonthlyReportPreferenceCard = MonthlyReportAdjacentCard & { id: string };

export type MonthlyReportCategory = {
  category: SpendingCategory;
  percentage: number;
};

export type MonthlyReportDistrict = {
  name: string;
  visits: number;
};

export type MonthlyReportShop = {
  id: string | null;
  months: number;
  name: string;
  rank: 1 | 2 | 3;
  stickerImages: readonly string[];
  visits: number;
};

export type MonthlyReportSummaryItem = {
  label: string;
  value: number;
};

export type MonthlyReportWeekdaySpending = {
  count: number;
  day: '월' | '화' | '수' | '목' | '금' | '토' | '일';
};

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

export type WeeklyRecord = {
  count?: number;
  date: number;
  dateValue: string;
  day: string;
  isFuture?: boolean;
  isToday?: boolean;
};

export type MonthlyStickerRecordGroup = {
  acquiredDate: string;
  monthlyStickers: readonly (StickerResponse & { acquiredDate: string })[];
};

export type SpendingRecordGroup = {
  consumptions: readonly (ConsumptionResponse & { id: number; purchaseDate: string })[];
  purchaseDate: string;
};

export type FrequentShop = {
  category: SpendingCategory;
  district: string;
  id: string;
  monthlyVisitCount: number;
  name: string;
  thumbnailSrc: string | null;
  totalVisitCount: number;
};

export type FrequentShopPeriod = 'currentMonth' | 'all';
