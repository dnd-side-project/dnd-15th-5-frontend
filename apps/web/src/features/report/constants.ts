import type { SpendingCategory } from '@chapchap/shared/common/types';

/** 월간 리포트 카테고리 차트에 사용하는 색상 토큰입니다. */
export const REPORT_CATEGORY_COLOR_CLASS_NAMES: Record<SpendingCategory, string> = {
  카페: 'bg-report-category-cafe',
  음식점: 'bg-report-category-restaurant',
  운동: 'bg-report-category-exercise',
  '편의점/마트': 'bg-report-category-market',
  '취미/놀거리': 'bg-report-category-entertainment',
  '미용/뷰티': 'bg-report-category-beauty',
  기타: 'bg-neutral-300',
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
