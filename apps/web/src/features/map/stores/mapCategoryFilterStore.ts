import { create } from 'zustand';

import type { HomeCategoryFilterValue } from '../types';

type MapCategoryFilterStore = {
  selected: HomeCategoryFilterValue | null;
  setSelected: (value: HomeCategoryFilterValue | null) => void;
};

/**
 * 홈 화면 카테고리 필터(`HomeCategoryFilter`)에서 고른 값을 지도 스티커 목록(`MapStickers`)과
 * 공유한다. 두 컴포넌트가 형제 관계라 상위에서 prop으로 내려줄 수 없어 zustand로 연결한다.
 */
export const useMapCategoryFilterStore = create<MapCategoryFilterStore>((set) => ({
  selected: null,
  setSelected: (value) => set({ selected: value }),
}));
