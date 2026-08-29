import MarkdownPolicyContent from './MarkdownPolicyContent';
import { PRIVACY_POLICY_CONTENT } from './privacyPolicyContent';
import { TERMS_OF_SERVICE_CONTENT } from './termsOfServiceContent';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Features/Auth/MarkdownPolicyContent',
  component: MarkdownPolicyContent,
  decorators: [
    (Story) => (
      <div className="mx-auto w-94 bg-neutral-00 px-5 py-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MarkdownPolicyContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrivacyPolicy: Story = {
  args: {
    content: PRIVACY_POLICY_CONTENT,
  },
};

export const TermsOfService: Story = {
  args: {
    content: TERMS_OF_SERVICE_CONTENT,
  },
};
