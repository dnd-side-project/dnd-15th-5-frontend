import { MemoryRouter } from 'react-router-dom';
import { fn } from 'storybook/test';

import TermsAgreementForm from './TermsAgreementForm';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Features/Auth/TermsAgreementForm',
  component: TermsAgreementForm,
  args: {
    onSubmit: fn(),
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="flex min-h-dvh w-94 flex-col bg-neutral-00 px-5">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof TermsAgreementForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
