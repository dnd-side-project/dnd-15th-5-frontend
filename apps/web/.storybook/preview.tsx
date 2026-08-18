/// <reference types="vite/client" />

import '@/app/styles/index.css';

import './preview.css';

import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      // INFO: fixed 포지션으로 자기 폭을 직접 계산하는 컴포넌트(BottomSheet 등)는
      // 이 모바일 프레임 폭 제약을 또 씌우면 실제 계산과 어긋나 보인다.
      // `parameters.layout: 'fullscreen'`인 스토리는 감싸지 않는다.
      if (context.parameters.layout === 'fullscreen') {
        return <Story />;
      }

      return (
        <div className="flex w-full items-center justify-center">
          <div className="w-full max-w-120 px-4">
            <Story />
          </div>
        </div>
      );
    },
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
