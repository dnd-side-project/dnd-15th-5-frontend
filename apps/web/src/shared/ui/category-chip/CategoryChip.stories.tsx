import { useState } from 'react';
import { fn } from 'storybook/test';

import { CategoryChip } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const CATEGORIES = [
  { label: '카페', value: 'cafe' },
  { label: '운동', value: 'exercise' },
  { label: '편의점/마트', value: 'convenience-store' },
  { label: '취미/놀거리', value: 'entertainment' },
  { label: '음식점', value: 'restaurant' },
  { label: '미용/뷰티', value: 'beauty' },
  { label: '기타', value: 'etc' },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]['value'];
type RecommendedCategoryValue = CategoryValue | 'recommendation';

const meta = {
  title: 'Shared/CategoryChip',
  component: CategoryChip,
  args: {
    children: '카페',
    onSelectedChange: fn(),
  },
  argTypes: {
    children: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['default', 'compact'],
    },
    hasRecommendationIcon: {
      control: 'boolean',
    },
    selected: {
      control: 'boolean',
    },
    defaultSelected: {
      control: 'boolean',
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof CategoryChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    selected: true,
  },
};

export const Recommended: Story = {
  args: {
    children: '가게 추천',
    hasRecommendationIcon: true,
    variant: 'compact',
  },
};

export const RecommendedSelected: Story = {
  args: {
    children: '가게 추천',
    selected: true,
    hasRecommendationIcon: true,
    variant: 'compact',
  },
};

export const CategoryFilter: Story = {
  args: {
    children: '카페',
  },
  render: function CategoryFilterStory() {
    const [selectedCategory, setSelectedCategory] = useState<CategoryValue>('cafe');

    return (
      <div role="group" aria-label="카테고리 필터" className="flex w-full max-w-88 flex-wrap gap-2">
        {CATEGORIES.map(({ label, value }) => (
          <CategoryChip
            key={value}
            selected={selectedCategory === value}
            onSelectedChange={(selected) => selected && setSelectedCategory(value)}
          >
            {label}
          </CategoryChip>
        ))}
      </div>
    );
  },
};

export const RecommendedCategoryFilter: Story = {
  args: {
    children: '가게 추천',
  },
  render: function RecommendedCategoryFilterStory() {
    const [selectedFilter, setSelectedFilter] =
      useState<RecommendedCategoryValue>('recommendation');

    return (
      <div className="scrollbar-hidden w-full max-w-88 overflow-x-auto">
        <div
          role="group"
          aria-label="가게 추천 포함 카테고리 필터"
          className="flex w-max flex-nowrap gap-2"
        >
          <CategoryChip
            variant="compact"
            hasRecommendationIcon
            selected={selectedFilter === 'recommendation'}
            onSelectedChange={(selected) => selected && setSelectedFilter('recommendation')}
          >
            가게 추천
          </CategoryChip>

          {CATEGORIES.map(({ label, value }) => (
            <CategoryChip
              key={value}
              variant="compact"
              selected={selectedFilter === value}
              onSelectedChange={(selected) => selected && setSelectedFilter(value)}
            >
              {label}
            </CategoryChip>
          ))}
        </div>
      </div>
    );
  },
};
