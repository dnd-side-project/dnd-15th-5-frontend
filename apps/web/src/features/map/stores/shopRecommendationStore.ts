import { create } from 'zustand';

import type { HomeCategory } from '../types';

type ShopRecommendationStore = {
  activeRecommendationId: string | null;
  selectedCategory: HomeCategory | null;
  listScrollTop: number;
  setSelectedCategory: (category: HomeCategory | null) => void;
  setListScrollTop: (scrollTop: number) => void;
  setActiveRecommendation: (recommendationId: string | null) => void;
};

/** 추천 목록의 필터·스크롤과 선택한 가게를 지도 및 상세 시트와 공유합니다. */
export const useShopRecommendationStore = create<ShopRecommendationStore>((set) => ({
  activeRecommendationId: null,
  selectedCategory: null,
  listScrollTop: 0,
  setSelectedCategory: (selectedCategory) =>
    set({ selectedCategory, listScrollTop: 0, activeRecommendationId: null }),
  setListScrollTop: (listScrollTop) =>
    set((state) => (state.listScrollTop === listScrollTop ? state : { listScrollTop })),
  setActiveRecommendation: (activeRecommendationId) =>
    set((state) =>
      state.activeRecommendationId === activeRecommendationId ? state : { activeRecommendationId }
    ),
}));
