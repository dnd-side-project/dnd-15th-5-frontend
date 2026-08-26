import type { SpendingCategory } from '@chapchap/shared/common/types';

export type ReportPreferenceCardVariant =
  'alley-explorer' | 'food-nomad' | 'local-regular' | 'night-watch';

export type WeeklyRecord = {
  count?: number;
  date: number;
  dateValue: string;
  day: string;
  isFuture?: boolean;
  isToday?: boolean;
};

export type MonthlyStickerRecordGroup = {
  dateLabel: string;
  dateValue: string;
  stickerImages: readonly string[];
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
  name: string;
  rank: number;
  thumbnailSrc: string | null;
  visitCount: number;
};

export type FrequentShopPeriod = 'currentMonth' | 'all';
