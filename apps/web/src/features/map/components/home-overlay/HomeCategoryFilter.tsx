import { CategoryChip } from '@/shared/ui/category-chip';

import { HOME_CATEGORIES } from '../../constants';
import { useMapCategoryFilterStore } from '../../stores/mapCategoryFilterStore';

/**
 * 지도 홈 상단에 뜨는 가게 추천·카테고리 필터입니다.
 *
 * 한 줄로 가로 스크롤되며, 선택한 카테고리는 `useMapCategoryFilterStore`를 통해 지도 스티커
 * 목록 조회(`MapStickers`)에 전달됩니다.
 */
export default function HomeCategoryFilter() {
  const selected = useMapCategoryFilterStore((state) => state.selected);
  const setSelected = useMapCategoryFilterStore((state) => state.setSelected);

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
          selected={selected === 'recommendation'}
          onSelectedChange={(isSelected) => isSelected && setSelected('recommendation')}
        >
          가게 추천
        </CategoryChip>

        {HOME_CATEGORIES.map((category) => (
          <CategoryChip
            key={category}
            variant="compact"
            selected={selected === category}
            onSelectedChange={(isSelected) => isSelected && setSelected(category)}
          >
            {category}
          </CategoryChip>
        ))}
      </div>
    </div>
  );
}
