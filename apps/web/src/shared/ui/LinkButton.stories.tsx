import { MemoryRouter } from 'react-router-dom';

import { AddIcon } from '@/shared/assets/icons';

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
      options: ['xlarge', 'large', 'medium', 'small'],
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

export const IconPrimary: Story = {
  args: {
    to: '/record',
    variant: 'icon-primary',
    'aria-label': '기록 추가',
    children: <AddIcon aria-hidden="true" />,
  },
};
