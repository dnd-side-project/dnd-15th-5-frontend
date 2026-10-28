import { fn } from 'storybook/test';

import PageHeader from './PageHeader';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/PageHeader',
  component: PageHeader,
  args: {
    title: '좋아요',
    onBack: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-96 border border-neutral-200 bg-neutral-00">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 뒤로가기 버튼과 제목을 표시합니다. */
export const BackAndTitle: Story = {};

/** 뒤로가기 버튼만 표시합니다. */
export const BackOnly: Story = {
  args: {
    title: undefined,
  },
};

/** 제목만 표시합니다. */
export const TitleOnly: Story = {
  args: {
    onBack: undefined,
  },
};

/** 뒤로가기, 제목, 닫기 버튼을 함께 표시합니다. */
export const BackTitleAndClose: Story = {
  args: {
    onClose: fn(),
    closeButtonLabel: '기록 닫고 홈으로 이동',
  },
};

/** 닫기 버튼만 표시합니다. */
export const CloseOnly: Story = {
  args: {
    title: undefined,
    onBack: undefined,
    onClose: fn(),
  },
};
