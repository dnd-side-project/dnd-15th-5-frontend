import type { SPENDING_CATEGORIES } from './constants';

/** 소비 기록과 리포트에서 공통으로 사용하는 소비 카테고리입니다. */
export type SpendingCategory = (typeof SPENDING_CATEGORIES)[number];
