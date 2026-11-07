import { create } from 'zustand';

import type { HomeCategory } from '../types';

type MapCategoryFilterStore = {
  selectedCategory: HomeCategory | null;
  setSelectedCategory: (category: HomeCategory | null) => void;
};

/** 홈 카테고리 칩, 방문 스티커, 좋아요 마커가 공유하는 선택 상태입니다. */
export const useMapCategoryFilterStore = create<MapCategoryFilterStore>((set) => ({
  selectedCategory: null,
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
}));
