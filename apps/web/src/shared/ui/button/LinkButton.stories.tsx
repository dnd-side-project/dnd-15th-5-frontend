import { MemoryRouter } from 'react-router-dom';

import { AddIcon, NavigationHomeIcon } from '@/shared/assets/icons';

import { LinkButton } from './LinkButton';

import type { LinkButtonProps } from './LinkButton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/LinkButton',
  component: LinkButton,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    to: {
      control: 'text',
    },
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
    replace: {
      control: 'boolean',
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<LinkButtonProps>;

export default meta;
type Story = StoryObj<LinkButtonProps>;

export const Primary: Story = {
  args: {
    to: '/record',
    children: '기록하러 가기',
  },
};

export const Secondary: Story = {
  args: {
    to: '/my-page/likes',
    variant: 'secondary',
    size: 'medium',
    children: '좋아요 목록 보기',
  },
};

export const Compact: Story = {
  args: {
    to: '/record',
    size: 'small',
    children: '기록하기',
  },
};

export const IconPrimary: Story = {
  args: {
    to: '/record',
    variant: 'icon-primary',
    'aria-label': '기록 추가',
    children: <AddIcon aria-hidden="true" />,
  },
};

export const Icon: Story = {
  args: {
    to: '/home',
    variant: 'icon',
    size: 'icon',
    'aria-label': '홈으로 이동',
    children: <NavigationHomeIcon aria-hidden="true" />,
  },
};

/** 외부 URL은 새 탭으로 열고 링크 목적을 접근성 이름에 포함합니다. */
export const External: Story = {
  args: {
    to: 'https://maps.google.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    'aria-label': 'Google 지도에서 열기',
    variant: 'secondary',
    size: 'medium',
    children: (
      <>
        Google 지도에서 열기
        <span aria-hidden="true">↗</span>
      </>
    ),
  },
};
