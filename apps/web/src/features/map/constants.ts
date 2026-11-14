import { SPENDING_CATEGORIES } from '@chapchap/shared/common/constants';

import type { SpendingCategory } from '@chapchap/shared/common/types';

const HOME_CATEGORY_ORDER: Record<SpendingCategory, number> = {
  '편의점/마트': 0,
  카페: 1,
  운동: 2,
  음식점: 3,
  '취미/놀거리': 4,
  '미용/뷰티': 5,
  쇼핑: 6,
  기타: 7,
};

export const HOME_CATEGORIES = [...SPENDING_CATEGORIES].sort(
  (first, second) => HOME_CATEGORY_ORDER[first] - HOME_CATEGORY_ORDER[second]
);

export const MAP_DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 } as const;
export const MAP_DEFAULT_ZOOM = 13;
export const LOCATION_SELECTION_MAP_ZOOM = 14;
export const SELECTED_PLACE_MAP_ZOOM = 16;
export const RECOMMENDATION_MAP_ZOOM = 15;
