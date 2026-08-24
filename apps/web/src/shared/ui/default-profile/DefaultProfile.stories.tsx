import { DefaultProfile } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/DefaultProfile',
  component: DefaultProfile,
  args: {
    className: 'size-25',
  },
  argTypes: {
    className: {
      control: 'text',
      description: '프로필의 너비와 높이를 지정하는 Tailwind CSS 클래스',
    },
  },
} satisfies Meta<typeof DefaultProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 마이페이지에서 사용하는 100px 기본 프로필입니다. */
export const Default: Story = {};

/** 여러 화면에서 사용할 수 있는 크기별 예시입니다. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <div className="flex flex-col items-center gap-2">
        <DefaultProfile className="size-10" />
        <span className="text-caption-01-regular text-neutral-500">40px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DefaultProfile className="size-16" />
        <span className="text-caption-01-regular text-neutral-500">64px</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DefaultProfile className="size-25" />
        <span className="text-caption-01-regular text-neutral-500">100px</span>
      </div>
    </div>
  ),
};
