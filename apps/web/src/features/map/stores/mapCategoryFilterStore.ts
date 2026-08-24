import { create } from 'zustand';

import type { HomeCategory } from '../types';

type MapCategoryFilterStore = {
  selectedCategory: HomeCategory | null;
  setSelectedCategory: (category: HomeCategory | null) => void;
};

/** 홈 카테고리 칩과 지도 스티커가 사용하는 선택 상태를 공유합니다. */
export const useMapCategoryFilterStore = create<MapCategoryFilterStore>((set) => ({
  selectedCategory: null,
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
}));
