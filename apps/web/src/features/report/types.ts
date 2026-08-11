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
