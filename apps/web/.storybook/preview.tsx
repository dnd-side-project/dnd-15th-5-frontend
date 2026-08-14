/// <reference types="vite/client" />

import '@/app/styles/index.css';

import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-120 px-4">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'neutral-100',
      options: {
        'neutral-100': {
          name: 'Neutral 100',
          value: '#f5f5f5',
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
