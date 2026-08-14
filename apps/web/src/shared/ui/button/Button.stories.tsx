import { fn } from 'storybook/test';

import { AddIcon, ChevronLeftIcon, ShareIcon } from '@/shared/assets/icons';

import { Button } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/Button',
  component: Button,
  args: {
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'icon-primary', 'icon'],
    },
    size: {
      control: 'select',
      options: ['large', 'medium', 'small', 'icon'],
    },
    children: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: '상세보기',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '카카오톡으로 공유하기',
    size: 'medium',
  },
};

export const SecondaryWithIcon: Story = {
  args: {
    variant: 'secondary',
    size: 'medium',
    children: (
      <>
        <ShareIcon aria-hidden="true" />
        이미지 저장
      </>
    ),
  },
};

export const IconPrimary: Story = {
  args: {
    variant: 'icon-primary',
    'aria-label': '기록 추가',
    children: <AddIcon aria-hidden="true" />,
  },
};

export const Icon: Story = {
  args: {
    variant: 'icon',
    size: 'icon',
    'aria-label': '뒤로 가기',
    children: <ChevronLeftIcon aria-hidden="true" />,
  },
};

export const Disabled: Story = {
  args: {
    children: '다음으로',
    disabled: true,
  },
};
