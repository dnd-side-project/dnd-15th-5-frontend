import { MemoryRouter } from 'react-router-dom';
import { fn } from 'storybook/test';

import { StateView } from './StateView';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MouseEventHandler } from 'react';
import type { To } from 'react-router-dom';

const meta = {
  title: 'Shared/StateView',
  component: StateView,
  args: {
    actionLabel: '소비 기록 작성하기',
    description: '소비 기록을 작성해보세요.\n빈 공간이 채워질 거예요.',
    headingAs: 'h2',
    onAction: fn(),
    title: '아직 기록이 없어요',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof StateView>;

export default meta;

type StateViewStoryArgs = {
  variant: 'empty' | 'error';
  title: string;
  description: string;
  actionLabel: string;
  headingAs: 'h1' | 'h2' | 'h3';
  onAction?: MouseEventHandler<HTMLButtonElement>;
  to?: To;
};

type Story = StoryObj<StateViewStoryArgs>;

export const Empty: Story = {
  args: {
    variant: 'empty',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    actionLabel: '다시 시도하기',
    description: '잠시 후에\n다시 시도해주세요',
    title: '에러가 발생했어요',
  },
};

export const ErrorHome: Story = {
  args: {
    variant: 'error',
    actionLabel: '홈으로 가기',
    description: '요청하신 화면을 불러오지 못했어요.',
    onAction: undefined,
    title: '에러가 발생했어요',
    to: '/home',
  },
};
