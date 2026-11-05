import { Spinner } from './Spinner';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/Spinner',
  component: Spinner,
  args: { className: 'size-6 text-primary-500' },
  argTypes: { className: { control: 'text' } },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 크기의 진행 표시입니다. Spinner 자체는 장식용이므로 상태 문구와 함께 사용합니다. */
export const Default: Story = {
  render: (args) => (
    <div role="status" aria-label="불러오는 중" className="flex items-center gap-2">
      <Spinner {...args} />
      <span className="text-body-02-regular text-neutral-500">불러오는 중</span>
    </div>
  ),
};

/** 버튼 안에서 쓰는 작은 진행 표시입니다. */
export const Compact: Story = {
  args: { className: 'size-4 text-neutral-00' },
};
