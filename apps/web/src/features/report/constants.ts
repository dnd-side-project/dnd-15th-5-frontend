import type { PreferenceMetricKey } from './types';

/** 저장용 리포트 이미지를 선명하게 생성하기 위한 캡처 배율. */
export const REPORT_IMAGE_CAPTURE_SCALE = 2;

/** 브라우저가 다운로드를 시작한 뒤 blob URL을 해제하기까지 기다리는 시간(ms). */
export const REPORT_IMAGE_URL_REVOKE_DELAY_MS = 1_000;

export const PREFERENCE_METRIC_LABELS: Record<
  PreferenceMetricKey,
  { leftLabel: string; rightLabel: string }
> = {
  shop: { leftLabel: '신규 탐색형', rightLabel: '단골 반복형' },
  area: { leftLabel: '동네 확장형', rightLabel: '동네 집중형' },
  time: { leftLabel: '낮소비형', rightLabel: '밤소비형' },
  routine: { leftLabel: '즉흥형', rightLabel: '규칙형' },
};
