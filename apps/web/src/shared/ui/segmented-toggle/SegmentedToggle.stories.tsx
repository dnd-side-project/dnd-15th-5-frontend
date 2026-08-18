import { useState } from 'react';
import { fn } from 'storybook/test';

import { SegmentedToggle } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const OPTIONS = [
  { label: '자주 소비한 곳', value: 'frequentShops' },
  { label: '소비 기록', value: 'history' },
] as const;

type OptionValue = (typeof OPTIONS)[number]['value'];

const meta = {
  title: 'Shared/SegmentedToggle',
  component: SegmentedToggle,
  // INFO: SegmentedToggle은 w-full이라 부모 폭을 그대로 채운다. Storybook docs의 inline
  // 미리보기 영역이 내용 크기만큼만 줄어드는 형태라, 실제 사용 폭(모바일 프레임 360px)을
  // 가늠할 수 있게 폭이 있는 컨테이너로 감싼다.
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    options: OPTIONS,
    value: 'frequentShops',
    onValueChange: fn(),
  },
} satisfies Meta<typeof SegmentedToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 클릭할 때마다 선택 상태가 실제로 바뀌는 인터랙션 예시입니다. */
function SegmentedToggleExample({
  initialValue,
  className,
}: {
  initialValue: OptionValue;
  className?: string;
}) {
  const [value, setValue] = useState<OptionValue>(initialValue);

  return (
    <SegmentedToggle
      options={OPTIONS}
      value={value}
      onValueChange={setValue}
      className={className}
    />
  );
}

/** 첫 번째 옵션("자주 소비한 곳")이 선택된 상태로 시작합니다. */
export const Default: Story = {
  render: () => <SegmentedToggleExample initialValue="frequentShops" />,
};

/** 두 번째 옵션("소비 기록")이 선택된 상태로 시작합니다. */
export const SecondOptionActive: Story = {
  render: () => <SegmentedToggleExample initialValue="history" />,
};

/** className으로 바깥 여백 등 레이아웃을 확장하는 예시입니다. */
export const WithCustomClassName: Story = {
  render: (args) => (
    <SegmentedToggleExample initialValue="frequentShops" className={args.className} />
  ),
  args: {
    className: 'mx-4 bg-primary-50',
  },
};
