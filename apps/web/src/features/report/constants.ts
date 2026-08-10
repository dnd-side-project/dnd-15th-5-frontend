import type { PreferenceMetricKey } from './types';

export const PREFERENCE_METRIC_LABELS: Record<
  PreferenceMetricKey,
  { leftLabel: string; rightLabel: string }
> = {
  shop: { leftLabel: '신규 탐색형', rightLabel: '단골 반복형' },
  area: { leftLabel: '동네 확장형', rightLabel: '동네 집중형' },
  time: { leftLabel: '낮소비형', rightLabel: '밤소비형' },
  routine: { leftLabel: '즉흥형', rightLabel: '규칙형' },
};
