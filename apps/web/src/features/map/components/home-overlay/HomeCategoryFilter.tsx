import { CategoryChip } from '@/shared/ui/category-chip';

import { HOME_CATEGORIES } from '../../constants';
import { useHomeBottomSheetStore } from '../../stores/homeBottomSheetStore';
import { useMapCategoryFilterStore } from '../../stores/mapCategoryFilterStore';

/** 지도 홈 상단에 한 줄로 표시하는 가게 추천·카테고리 칩입니다. */
export default function HomeCategoryFilter() {
  const selectedCategory = useMapCategoryFilterStore((state) => state.selectedCategory);
  const setSelectedCategory = useMapCategoryFilterStore((state) => state.setSelectedCategory);
  const activeSheetType = useHomeBottomSheetStore((state) => state.activeSheet.type);
  const showHome = useHomeBottomSheetStore((state) => state.showHome);
  const showRecommendation = useHomeBottomSheetStore((state) => state.showRecommendation);

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
      className="scrollbar-hidden overflow-x-auto px-4"
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

        {HOME_CATEGORIES.map((category) => (
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
