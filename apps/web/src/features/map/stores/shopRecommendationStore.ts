import { create } from 'zustand';

type ShopRecommendationStore = {
  activeRecommendationId: string | null;
  likedRecommendationIds: string[];
  setActiveRecommendation: (recommendationId: string) => void;
  toggleLikedRecommendation: (recommendationId: string) => void;
};

/** 추천 캐러셀 선택과 좋아요 상태를 추천 카드·지도 마커에 공유합니다. */
export const useShopRecommendationStore = create<ShopRecommendationStore>((set) => ({
  activeRecommendationId: null,
  likedRecommendationIds: [],
  setActiveRecommendation: (activeRecommendationId) =>
    set((state) =>
      state.activeRecommendationId === activeRecommendationId ? state : { activeRecommendationId }
    ),
  toggleLikedRecommendation: (recommendationId) =>
    set((state) => {
      const isLiked = state.likedRecommendationIds.includes(recommendationId);
      return {
        likedRecommendationIds: isLiked
          ? state.likedRecommendationIds.filter((id) => id !== recommendationId)
          : [...state.likedRecommendationIds, recommendationId],
      };
    }),
}));
