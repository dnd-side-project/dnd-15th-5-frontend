export type PreferenceMetricKey = 'area' | 'routine' | 'shop' | 'time';

export type PreferenceMetric = {
  key: PreferenceMetricKey;
  value: number;
};

export type ReportPreference = {
  description: string;
  metrics: readonly PreferenceMetric[];
  tags: readonly string[];
  title: string;
};

export type WeeklyRecord = {
  count?: number;
  date: number;
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
