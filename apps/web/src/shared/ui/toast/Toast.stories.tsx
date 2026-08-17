import { DEFAULT_TOAST_DURATION } from '@chapchap/shared/toast';
import { useEffect, useRef } from 'react';

import { Button } from '@/shared/ui/button';

import { ToastProvider, useToast } from '.';

import type { ToastType } from '@chapchap/shared/toast';
import type { Meta, StoryObj } from '@storybook/react-vite';

const messages: Record<ToastType, string> = {
  success: '첫번째 방문기록이 생성되었어요!',
  error: '오류가 발생했어요. 다시 시도해 주세요.',
  info: '주요정보를 중앙에 배치시켜 촬영해주세요',
};

function ToastPreview({ types }: { types: ToastType[] }) {
  const { showToast } = useToast();
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) {
      return;
    }

    hasShown.current = true;
    types.forEach((type) => showToast({ message: messages[type], type }));
  }, [showToast, types]);

  return <div className="h-56" />;
}

function InteractivePreview() {
  const { closeToast, showToast } = useToast();
  const latestToastId = useRef<string | undefined>(undefined);

  const handleShowToast = (type: ToastType) => {
    latestToastId.current = showToast({ message: messages[type], type });
  };

  return (
    <div className="flex flex-col gap-3 py-12">
      <Button size="small" onClick={() => handleShowToast('success')}>
        성공 Toast 열기
      </Button>
      <Button size="small" onClick={() => handleShowToast('error')}>
        오류 Toast 열기
      </Button>
      <Button size="small" onClick={() => handleShowToast('info')}>
        안내 Toast 열기
      </Button>
      <Button variant="secondary" size="small" onClick={() => closeToast(latestToastId.current)}>
        최근 Toast 닫기
      </Button>
    </div>
  );
}

const meta = {
  title: 'Shared/Toast',
  component: ToastProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '웹과 WebView에서 공통으로 사용하는 Toast Provider입니다. 앱 루트에 한 번 배치하고 하위 컴포넌트에서 `useToast`로 Toast를 노출하거나 닫습니다.',
      },
      story: {
        height: '280px',
        inline: false,
      },
    },
  },
  argTypes: {
    children: {
      table: { disable: true },
    },
    duration: {
      control: { min: 0, step: 100, type: 'number' },
      description: 'Toast가 자동으로 닫히기까지의 시간(ms)입니다. 0이면 자동으로 닫히지 않습니다.',
      table: {
        defaultValue: { summary: String(DEFAULT_TOAST_DURATION) },
        type: { summary: 'number' },
      },
    },
  },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllStates: Story = {
  render: () => (
    <ToastProvider duration={0}>
      <ToastPreview types={['success', 'error', 'info']} />
    </ToastProvider>
  ),
};

export const Success: Story = {
  render: () => (
    <ToastProvider duration={0}>
      <ToastPreview types={['success']} />
    </ToastProvider>
  ),
};

export const Error: Story = {
  render: () => (
    <ToastProvider duration={0}>
      <ToastPreview types={['error']} />
    </ToastProvider>
  ),
};

export const Info: Story = {
  render: () => (
    <ToastProvider duration={0}>
      <ToastPreview types={['info']} />
    </ToastProvider>
  ),
};

export const Interactive: Story = {
  render: () => (
    <ToastProvider>
      <InteractivePreview />
    </ToastProvider>
  ),
};
