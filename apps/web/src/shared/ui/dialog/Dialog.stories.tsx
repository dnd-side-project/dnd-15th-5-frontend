import { fn } from 'storybook/test';

import { Button } from '@/shared/ui/button';

import { Dialog } from './Dialog';
import { DialogActionButton } from './DialogActionButton';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/Dialog',
  component: Dialog,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        iframeHeight: 600,
      },
    },
  },
  args: {
    open: true,
    onOpenChange: fn(),
    title: '수정을 그만할까요?',
    description: '지금까지 수정한 내용은 저장되지 않아요.',
    actions: (
      <>
        <DialogActionButton tone="neutral" onClick={fn()}>
          그만하기
        </DialogActionButton>
        <DialogActionButton tone="primary" onClick={fn()}>
          계속 수정하기
        </DialogActionButton>
      </>
    ),
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 공통 제목·설명과 중립/주요 액션 버튼을 사용하는 기본 다이얼로그입니다. */
export const WithActions: Story = {};

/** 액션 영역에 임의의 버튼을 넣어 문의하기처럼 구성이 다른 다이얼로그를 만들 수 있습니다. */
export const CustomActions: Story = {
  args: {
    title: '문의하기',
    description: '궁금한 점이나 불편한 점을 이메일로 보내주세요.',
    actionsClassName: 'mt-6',
    children: (
      <p className="mt-5 rounded-12 bg-neutral-100 px-4 py-3 text-center text-body-01-medium text-neutral-700">
        contact@chapchap.kr
      </p>
    ),
    actions: (
      <>
        <Button
          variant="secondary"
          size="medium"
          onClick={fn()}
          className="h-12 flex-1 rounded-full"
        >
          주소 복사
        </Button>
        <Button variant="primary" size="medium" onClick={fn()} className="h-12 flex-1 rounded-full">
          메일 앱 열기
        </Button>
      </>
    ),
  },
};
