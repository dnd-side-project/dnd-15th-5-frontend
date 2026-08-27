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

export type MonthlyReportAdjacentCard = MonthlyReportPersona & {
  month: YearMonth;
};

export type MonthlyReport = {
  adjacentCards: readonly MonthlyReportAdjacentCard[];
  categories: readonly { category: SpendingCategory; percentage: number }[];
  districts: readonly { name: string; visits: number }[];
  month: YearMonth;
  persona: MonthlyReportPersona;
  shops: readonly {
    id: string | null;
    months: number;
    name: string;
    rank: 1 | 2 | 3;
    stickerImages: readonly string[];
    visits: number;
  }[];
  summary: readonly { label: string; value: number }[];
  weekdayInsight: string;
  weekdaySpending: readonly {
    count: number;
    day: '월' | '화' | '수' | '목' | '금' | '토' | '일';
  }[];
};

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
