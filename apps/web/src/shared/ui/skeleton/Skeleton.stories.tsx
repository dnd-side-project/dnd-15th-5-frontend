import { Skeleton } from './Skeleton';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/Skeleton',
  component: Skeleton,
  args: { className: 'h-5 w-48' },
  argTypes: { as: { control: false } },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 콘텐츠가 로드될 때까지 공간을 유지하는 기본 스켈레톤입니다. */
export const Default: Story = {};

/** 카드 형태의 이미지와 여러 줄 텍스트를 조합하는 예시입니다. */
export const ContentPlaceholder: Story = {
  render: () => (
    <div className="flex w-80 gap-3">
      <Skeleton className="size-20 shrink-0 rounded-12" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  ),
};

/** 문장 안의 짧은 영역에 사용할 수 있는 span 요소입니다. */
export const Inline: Story = {
  render: () => (
    <p className="text-body-01-regular text-neutral-700">
      <Skeleton as="span" className="inline-block h-4 w-24 align-middle" /> 불러오는 중입니다.
    </p>
  ),
};
