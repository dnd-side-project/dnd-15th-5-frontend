import type { SpendingCategory } from '@chapchap/shared/common/types';

export type PreferenceMetricKey = 'area' | 'routine' | 'shop' | 'time';

export type PreferenceMetric = {
  key: PreferenceMetricKey;
  value: number;
};

export type ReportPreferenceCardVariant =
  'alley-explorer' | 'food-nomad' | 'local-regular' | 'night-watch';

export type ReportPreference = {
  description: string;
  metrics: readonly PreferenceMetric[];
  tags: readonly string[];
  title: string;
  variant: ReportPreferenceCardVariant;
};

export type WeeklyRecord = {
  count?: number;
  date: number;
  dateValue: string;
  day: string;
  isFuture?: boolean;
  isToday?: boolean;
};

export type ReportPageMockData = {
  monthLabel: string;
  monthlyAdditionalStickerCount: number;
  monthlyRecordCount: number;
  monthlyStickerImages: readonly string[];
  recentDiscovery: readonly [string, string] | null;
  weeklyPeriodLabel: string;
  weeklyRecords: readonly WeeklyRecord[];
};

export type SpendingMonth = {
  month: number;
  year: number;
};

export type SpendingRecord = {
  amount: number;
  category: string;
  id: string;
  paidAtLabel: string;
  shopName: string;
};

export type SpendingRecordGroup = {
  dateLabel: string;
  dateValue: string;
  records: readonly SpendingRecord[];
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
