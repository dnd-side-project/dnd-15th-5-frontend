import type { SpendingCategory } from './types';

/** 기록과 리포트에서 공통으로 사용하는 소비 카테고리. */
export const SPENDING_CATEGORIES = [
  '카페',
  '음식점',
  '편의점/마트',
  '취미/놀거리',
  '운동',
  '미용/뷰티',
  '기타',
] as const satisfies readonly SpendingCategory[];

/** 달력처럼 일요일부터 표시하는 한국어 요일 라벨. */
export const SUNDAY_FIRST_WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 리포트 차트처럼 월요일부터 표시하는 한국어 요일 라벨. */
export const MONDAY_FIRST_WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const;
