import { Toggle as BaseToggle } from '@base-ui/react/toggle';

import { ShopRecommendIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

import { categoryChipVariants } from './categoryChipVariants';

import type { ComponentProps, ReactNode } from 'react';

type BaseToggleProps = Omit<
  ComponentProps<typeof BaseToggle>,
  | 'children'
  | 'className'
  | 'defaultPressed'
  | 'disabled'
  | 'nativeButton'
  | 'onPressedChange'
  | 'pressed'
  | 'render'
>;

type CategoryChipStyleProps =
  | {
      hasRecommendationIcon?: never;
      variant?: 'default';
    }
  | {
      hasRecommendationIcon?: boolean;
      variant: 'compact';
    };

type CategoryChipSelectionProps = {
  onSelectedChange?: (selected: boolean) => void;
} & (
  | {
      defaultSelected?: never;
      selected: boolean;
    }
  | {
      defaultSelected?: boolean;
      selected?: never;
    }
);

type CategoryChipProps = BaseToggleProps &
  CategoryChipStyleProps &
  CategoryChipSelectionProps & {
    children: ReactNode;
    className?: string;
  };

/**
 * 카테고리를 선택하는 공통 Category Chip입니다.
 *
 * Base UI Toggle을 사용해 선택 상태를 `aria-pressed`로 전달합니다.
 * `selected`를 전달하면 controlled 방식으로, `defaultSelected`를 전달하면 uncontrolled 방식으로
 * 사용할 수 있습니다. `compact` variant는 가게 추천이 포함된 한 줄 필터에 사용하며,
 * `hasRecommendationIcon`은 가게 추천 항목에만 아이콘을 표시합니다.
 *
 * @example
 * ```tsx
 * <CategoryChip
 *   selected={selectedCategory === 'cafe'}
 *   onSelectedChange={(selected) => selected && setSelectedCategory('cafe')}
 * >
 *   카페
 * </CategoryChip>
 *
 * <CategoryChip variant="compact" hasRecommendationIcon>가게 추천</CategoryChip>
 * <CategoryChip variant="compact">카페</CategoryChip>
 * ```
 *
 * @param props - Category Chip 속성입니다.
 * @param props.children - Chip에 표시할 텍스트 또는 콘텐츠입니다.
 * @param props.variant - Chip 스타일입니다. 기본값은 `default`입니다.
 * @param props.hasRecommendationIcon - `compact` variant에 가게 추천 아이콘을 표시합니다.
 * @param props.selected - controlled 방식의 선택 상태입니다.
 * @param props.defaultSelected - uncontrolled 방식의 초기 선택 상태입니다.
 * @param props.onSelectedChange - 선택 상태가 바뀔 때 호출됩니다.
 * @param props.className - 스타일을 확장하거나 재정의할 Tailwind CSS 클래스입니다.
 */
export function CategoryChip({
  children,
  className,
  defaultSelected,
  hasRecommendationIcon = false,
  onSelectedChange,
  selected,
  type = 'button',
  variant = 'default',
  ...restProps
}: CategoryChipProps) {
  return (
    <BaseToggle
      {...restProps}
      type={type}
      pressed={selected}
      defaultPressed={defaultSelected}
      onPressedChange={
        onSelectedChange ? (nextSelected) => onSelectedChange(nextSelected) : undefined
      }
      className={cn(categoryChipVariants({ variant }), className)}
    >
      {hasRecommendationIcon && <ShopRecommendIcon aria-hidden="true" />}
      {children}
    </BaseToggle>
  );
}
