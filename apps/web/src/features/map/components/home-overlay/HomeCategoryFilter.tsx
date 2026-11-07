import { useEffect } from 'react';

import { CategoryChip } from '@/shared/ui/category-chip';

import { useVisitedPlaceStickersQuery } from '../../apis/hooks/useVisitedPlaceStickersQuery';
import { HOME_CATEGORIES } from '../../constants';
import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';
import { useLocationSelectionStore } from '../../stores/locationSelectionStore';
import { useMapCategoryFilterStore } from '../../stores/mapCategoryFilterStore';

type HomeCategoryFilterProps = {
  onOpenRecommendationSearch: () => void;
};

/** 지도 홈 상단에 한 줄로 표시하는 가게 추천·카테고리 칩입니다. */
export default function HomeCategoryFilter({
  onOpenRecommendationSearch,
}: HomeCategoryFilterProps) {
  const { isSuccess, stickers } = useVisitedPlaceStickersQuery();
  const visibleCategories = isSuccess
    ? HOME_CATEGORIES.filter((category) =>
        stickers.some(({ place }) => place.category === category)
      )
    : HOME_CATEGORIES;
  const selectedCategory = useMapCategoryFilterStore((state) => state.selectedCategory);
  const setSelectedCategory = useMapCategoryFilterStore((state) => state.setSelectedCategory);
  const showHome = useHomeBottomSheetStore((state) => state.showHome);
  const resetLocationSelection = useLocationSelectionStore((state) => state.resetSelection);

  useEffect(() => {
    if (isSuccess && selectedCategory && !visibleCategories.includes(selectedCategory)) {
      setSelectedCategory(null);
    }
  }, [isSuccess, selectedCategory, setSelectedCategory, visibleCategories]);

  const handleRecommendationSelection = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedCategory(null);
      resetLocationSelection();
      showHome();
      onOpenRecommendationSearch();
      return;
    }

    showHome();
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
        <CategoryChip
          variant="compact"
          hasRecommendationIcon
          selected={false}
          onSelectedChange={handleRecommendationSelection}
        >
          가게 추천
        </CategoryChip>

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
