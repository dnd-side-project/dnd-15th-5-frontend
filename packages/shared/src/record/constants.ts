import type { SpendingCategory } from '../common/types';

/** 웹 수기 입력과 앱 영수증 입력에서 공통으로 사용하는 소비 카테고리. */
export const RECORD_CATEGORIES = [
  '카페',
  '운동',
  '편의점/마트',
  '취미/놀거리',
  '음식점',
  '미용/뷰티',
  '기타',
] as const satisfies readonly SpendingCategory[];

export type RecordCategory = SpendingCategory;
