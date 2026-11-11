import { useEffect } from 'react';

import { ShopRecommendIcon } from '@/shared/assets/icons';
import { CategoryChip, categoryChipVariants } from '@/shared/ui/category-chip';

import { useVisitedPlaceStickersQuery } from '../../apis/hooks/useVisitedPlaceStickersQuery';
import { HOME_CATEGORIES } from '../../constants';
import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';
import { useMapCategoryFilterStore } from '../../stores/mapCategoryFilterStore';

type HomeCategoryFilterProps = {
  onOpenRecommendationSearch: () => void;
};

/** 지도 홈 상단에 가게 추천과 방문·좋아요 장소의 카테고리 칩을 표시합니다. */
export default function HomeCategoryFilter({
  onOpenRecommendationSearch,
}: HomeCategoryFilterProps) {
  const { isSuccess, stickers, likedRecommendations = [] } = useVisitedPlaceStickersQuery();
  const activeSheet = useHomeBottomSheetStore((state) => state.activeSheet);
  const selectedLikedPlaceCategory =
    activeSheet.type === 'likedRecommendation'
      ? activeSheet.fallbackRecommendation?.place.category
      : undefined;
  const visibleCategories = isSuccess
    ? HOME_CATEGORIES.filter(
        (category) =>
          stickers.some(({ place }) => place.category === category) ||
          likedRecommendations.some(({ place }) => place.category === category) ||
          selectedLikedPlaceCategory === category
      )
    : HOME_CATEGORIES;
  const selectedCategory = useMapCategoryFilterStore((state) => state.selectedCategory);
  const setSelectedCategory = useMapCategoryFilterStore((state) => state.setSelectedCategory);
  const showHome = useHomeBottomSheetStore((state) => state.showHome);

  useEffect(() => {
    if (isSuccess && selectedCategory && !visibleCategories.includes(selectedCategory)) {
      setSelectedCategory(null);
    }
  }, [isSuccess, selectedCategory, setSelectedCategory, visibleCategories]);

  const handleOpenRecommendationSearch = () => {
    setSelectedCategory(null);
    showHome();
    onOpenRecommendationSearch();
  };

  const handleCategorySelection = (
    category: (typeof HOME_CATEGORIES)[number],
    isSelected: boolean
  ) => {
    setSelectedCategory(isSelected ? category : null);
    showHome();
  };

  return (
    <div
      role="group"
      aria-label="가게 추천 및 카테고리 필터"
      className="overflow-x-auto px-4 py-1.5"
    >
      <div className="flex w-max flex-nowrap gap-2">
        <button
          type="button"
          className={categoryChipVariants({ variant: 'compact' })}
          onClick={handleOpenRecommendationSearch}
        >
          <ShopRecommendIcon aria-hidden="true" />
          가게 추천
        </button>

        {visibleCategories.map((category) => (
          <CategoryChip
            key={category}
            variant="compact"
            selected={selectedCategory === category}
            onSelectedChange={(isSelected) => handleCategorySelection(category, isSelected)}
          >
            {category}
          </CategoryChip>
        ))}
      </div>
    </div>
  );
}
