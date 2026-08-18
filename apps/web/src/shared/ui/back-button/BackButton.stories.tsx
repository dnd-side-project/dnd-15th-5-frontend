import { fn } from 'storybook/test';

import { BackButton } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/BackButton',
  component: BackButton,
  args: {
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'light'],
    },
  },
} satisfies Meta<typeof BackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="w-94 bg-neutral-00 px-5 py-6">
        <Story />
      </div>
    ),
  ],
};

export const Light: Story = {
  args: {
    variant: 'light',
  },
  decorators: [
    (Story) => (
      <div className="w-94 bg-neutral-700 px-5 py-6">
        <Story />
      </div>
    ),
  ],
};
