import { StoreImageFallback } from './StoreImageFallback';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/StoreImageFallback',
  component: StoreImageFallback,
  args: { className: 'h-32 w-56 rounded-16' },
  argTypes: {
    ariaLabel: { control: 'text' },
    className: { control: 'text' },
    iconClassName: { control: 'text' },
  },
} satisfies Meta<typeof StoreImageFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 매장 이미지가 없을 때 사용할 기본 표시입니다. */
export const Decorative: Story = {};

/** 이미지 대체 콘텐츠 자체를 설명해야 할 때 접근성 이름을 전달합니다. */
export const Accessible: Story = {
  args: { ariaLabel: '투썸플레이스 사진을 불러올 수 없음' },
};
