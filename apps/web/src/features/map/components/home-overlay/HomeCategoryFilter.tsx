import { useEffect } from 'react';

import { CategoryChip } from '@/shared/ui/category-chip';

import { useVisitedPlaceStickersQuery } from '../../apis/hooks/useVisitedPlaceStickersQuery';
import { HOME_CATEGORIES } from '../../constants';
import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';
import { useMapCategoryFilterStore } from '../../stores/mapCategoryFilterStore';

/** 지도 홈 상단에 한 줄로 표시하는 가게 추천·카테고리 칩입니다. */
export default function HomeCategoryFilter() {
  const { isSuccess, stickers } = useVisitedPlaceStickersQuery();
  const visibleCategories = isSuccess
    ? HOME_CATEGORIES.filter((category) =>
        stickers.some(({ place }) => place.category === category)
      )
    : HOME_CATEGORIES;
  const selectedCategory = useMapCategoryFilterStore((state) => state.selectedCategory);
  const setSelectedCategory = useMapCategoryFilterStore((state) => state.setSelectedCategory);
  const activeSheetType = useHomeBottomSheetStore((state) => state.activeSheet.type);
  const showHome = useHomeBottomSheetStore((state) => state.showHome);
  const showRecommendation = useHomeBottomSheetStore((state) => state.showRecommendation);

  useEffect(() => {
    if (isSuccess && selectedCategory && !visibleCategories.includes(selectedCategory)) {
      setSelectedCategory(null);
    }
  }, [isSuccess, selectedCategory, setSelectedCategory, visibleCategories]);

  const handleRecommendationSelection = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedCategory(null);
      showRecommendation();
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
      className="scrollbar-hidden overflow-x-auto px-4 py-1.5"
    >
      <div className="flex w-max flex-nowrap gap-2">
        <CategoryChip
          variant="compact"
          hasRecommendationIcon
          selected={activeSheetType === 'recommendation'}
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
