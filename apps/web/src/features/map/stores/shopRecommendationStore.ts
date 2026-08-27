import { create } from 'zustand';

type ShopRecommendationStore = {
  activeRecommendationId: string | null;
  setActiveRecommendation: (recommendationId: string) => void;
};

/** 추천 캐러셀에서 선택한 가게를 추천 카드와 지도 마커에 공유합니다. */
export const useShopRecommendationStore = create<ShopRecommendationStore>((set) => ({
  activeRecommendationId: null,
  setActiveRecommendation: (activeRecommendationId) =>
    set((state) =>
      state.activeRecommendationId === activeRecommendationId ? state : { activeRecommendationId }
    ),
}));
