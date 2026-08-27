import type { MonthlyReportPersona, ReportPreferenceCardVariant } from '@/features/report/types';

import type { SpendingCategory } from '@chapchap/shared/common/types';

/**
 * 백엔드의 4축 페르소나 코드를 카드 디자인 유형으로 변환합니다.
 * 코드는 방문 스타일(R/N) → 활동 범위(H/W) → 소비 시간대(D/M) → 소비 리듬(P/F) 순서입니다.
 *
 * - `RHMP`: 골목 야간반장
 * - `NWMF`: 미식 유목민
 * - `RHDP`: 동네 터줏대감
 * - `NHDF`: 골목 발굴러
 */
export const REPORT_PERSONA_VARIANTS = {
  RHMP: 'night-watch',
  NWMF: 'food-nomad',
  RHDP: 'local-regular',
  NHDF: 'alley-explorer',
} as const satisfies Record<string, ReportPreferenceCardVariant>;

/** 페르소나 카드 유형별 프론트 표시 카피입니다. */
export const REPORT_PERSONA_COPY: Record<
  ReportPreferenceCardVariant,
  Pick<MonthlyReportPersona, 'description' | 'tags' | 'title'>
> = {
  'night-watch': {
    title: '골목 야간반장',
    tags: ['야행성', '단골형', '규칙적'],
    description:
      '정해진 동네, 익숙한 가게를 밤에 즐겨 찾는 편이에요. 새로운 곳보다 아는 곳에서 확실한 만족을 얻는 타입이에요.',
  },
  'food-nomad': {
    title: '미식 유목민',
    tags: ['야행성', '신규 탐색형', '즉흥적'],
    description:
      '맛있는 곳이라면 어디든 찾아가요. 한곳에 머물기엔 궁금한 맛집이 너무 많아요. 오늘도 새로운 맛을 찾아 떠나는 타입이에요.',
  },
  'local-regular': {
    title: '동네 터줏대감',
    tags: ['낮 활동파', '단골형', '규칙적'],
    description:
      '익숙한 동네와 단골 가게를 자주 찾아요. 마음에 들면 꾸준히 찾는 편이에요. 사장님이 알아볼지도 모르는 찐 단골 타입이에요.',
  },
  'alley-explorer': {
    title: '골목 발굴러',
    tags: ['낮 활동파', '신규 탐색형', '즉흥적'],
    description:
      '익숙한 동네에서도 새로운 가게를 찾아다녀요. 골목 속 숨은 맛집을 발견하는 재미를 즐겨요. 남들보다 먼저 찜해두는 타입이에요.',
  },
};

/** 페르소나 축 코드별 카드 키워드입니다. */
export const REPORT_PERSONA_TAGS = {
  consumptionTime: { D: '낮 활동파', M: '야행성' },
  visitStyle: { R: '단골형', N: '신규 탐색형' },
  consumptionRhythm: { P: '규칙적', F: '즉흥적' },
} as const;

/** 월간 리포트의 주요 소비 시간대별 이모티콘입니다. */
export const REPORT_TIME_SLOT_EMOJIS: Record<string, string> = {
  오전: '☀️',
  오후: '🌤️',
  저녁: '🌆',
  밤: '🌙',
};

/** 백엔드의 주요 소비 시간대 코드를 한글 표기로 변환합니다. */
export const REPORT_TIME_SLOT_LABELS: Record<string, string> = {
  MORNING: '오전',
  LUNCH: '오후',
  EVENING: '저녁',
  NIGHT: '밤',
};

/** 백엔드의 주요 소비 요일 코드를 한글 축약 표기로 변환합니다. */
export const REPORT_WEEKDAY_LABELS: Record<string, string> = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
};

/** 월간 리포트 카테고리 차트에 사용하는 색상 토큰입니다. */
export const REPORT_CATEGORY_COLOR_CLASS_NAMES: Record<SpendingCategory, string> = {
  카페: 'bg-report-category-cafe',
  음식점: 'bg-report-category-restaurant',
  운동: 'bg-report-category-exercise',
  '편의점/마트': 'bg-report-category-market',
  '취미/놀거리': 'bg-report-category-entertainment',
  '미용/뷰티': 'bg-report-category-beauty',
  기타: 'bg-neutral-500',
};

/** 요일 축약 표기를 접근성 안내에 사용하는 전체 이름으로 변환합니다. */
export const WEEKDAY_FULL_LABELS = {
  월: '월요일',
  화: '화요일',
  수: '수요일',
  목: '목요일',
  금: '금요일',
  토: '토요일',
  일: '일요일',
} as const;
