import { SPENDING_CATEGORIES } from '../common/constants';

import type { SpendingCategory } from '../common/types';

/** 웹 수기 입력과 앱 영수증 입력에서 공통으로 사용하는 소비 카테고리. */
export const RECORD_CATEGORIES = SPENDING_CATEGORIES;

/** 웹·앱 기록 플로우의 작성 중단 확인 다이얼로그 문구. */
export const RECORD_EXIT_CONFIRM_TEXT = {
  title: '기록 작성을 그만둘까요?',
  description: '입력한 내용은 저장되지 않아요.',
  exit: '나가기',
  continue: '계속 작성하기',
} as const;

/** 네이티브 영수증 기록 완료 뒤 웹 지도 홈으로 전달하는 장소 쿼리 키입니다. */
export const CREATED_CONSUMPTION_QUERY_KEYS = {
  placeName: 'createdPlaceName',
  latitude: 'createdPlaceLat',
  longitude: 'createdPlaceLng',
} as const;

export type RecordCategory = SpendingCategory;
