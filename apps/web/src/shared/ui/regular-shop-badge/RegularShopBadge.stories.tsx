import { RegularShopBadge } from './RegularShopBadge';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/RegularShopBadge',
  component: RegularShopBadge,
} satisfies Meta<typeof RegularShopBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 단골로 등록한 매장을 표시하는 배지입니다. */
export const Default: Story = {};

/** 매장명과 나란히 배치했을 때의 사용 예시입니다. */
export const WithShopName: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <strong className="text-body-01-semibold text-neutral-700">투썸플레이스 강남점</strong>
      <RegularShopBadge />
    </div>
  ),
};
