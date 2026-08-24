import type { SpendingCategory } from '@chapchap/shared/common/types';

/** 월간 리포트 카테고리 차트에 사용하는 색상 토큰입니다. */
export const REPORT_CATEGORY_COLOR_CLASS_NAMES: Record<SpendingCategory, string> = {
  카페: 'bg-primary-500',
  음식점: 'bg-primary-300',
  운동: 'bg-primary-100',
  '편의점/마트': 'bg-primary-600',
  '취미/놀거리': 'bg-primary-400',
  '미용/뷰티': 'bg-primary-200',
  기타: 'bg-neutral-300',
};

export const WEEKDAY_FULL_LABELS = {
  월: '월요일',
  화: '화요일',
  수: '수요일',
  목: '목요일',
  금: '금요일',
  토: '토요일',
  일: '일요일',
} as const;
