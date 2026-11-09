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

/** 추가 행동이 필요 없는 빈 상태입니다. */
export const EmptyWithoutAction: Story = {
  args: {
    variant: 'empty',
    title: '아직 좋아요한 가게가 없어요',
    description: '가게에 좋아요를 누르고 나만의 목록을 만들어보세요.',
    actionLabel: undefined,
    onAction: undefined,
    to: undefined,
  },
};

/** 목적지 이동이 필요한 빈 상태는 액션 링크를 사용합니다. */
export const EmptyWithLink: Story = {
  args: {
    variant: 'empty',
    title: '주변에 추천 가게가 없어요',
    description: '지도를 움직여 다른 곳을 살펴보세요.',
    actionLabel: '지도 홈으로',
    onAction: undefined,
    to: '/home',
  },
};
