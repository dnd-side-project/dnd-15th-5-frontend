import { BlueLocationPinIcon } from '@/shared/assets/icons';

import { Chip } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/Chip',
  component: Chip,
  argTypes: {
    children: {
      control: 'text',
    },
  },
  args: {
    children: '카페',
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 아이콘 없이 텍스트만 있는 상태입니다(카테고리 등). */
export const Default: Story = {};

/** 위치 아이콘과 함께 쓰는 상태입니다(지역 등). */
export const WithIcon: Story = {
  args: {
    icon: BlueLocationPinIcon,
    children: '용산구',
  },
};

export const LongLabel: Story = {
  args: {
    children: '스페셜티 커피 전문점',
  },
};

/** 실제 사용처처럼 아이콘 있는 칩과 없는 칩을 나란히 놓은 예시입니다. */
export const Group: Story = {
  render: () => (
    <div className="flex gap-2">
      <Chip icon={BlueLocationPinIcon}>용산구</Chip>
      <Chip>카페</Chip>
    </div>
  ),
};
