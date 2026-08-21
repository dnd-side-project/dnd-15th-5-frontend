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
  records: readonly SpendingRecord[];
};
