import type { ConsumptionResponse, StickerResponse } from '@/features/report/apis/dto';

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
  acquiredDate: string;
  monthlyStickers: readonly (StickerResponse & { acquiredDate: string })[];
};

export type SpendingRecordGroup = {
  consumptions: readonly (ConsumptionResponse & { id: number; purchaseDate: string })[];
  purchaseDate: string;
};

export type FrequentShopPeriod = 'currentMonth' | 'all';
