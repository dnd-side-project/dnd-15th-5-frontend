import { useState } from 'react';
import { fn } from 'storybook/test';

import { Button } from '@/shared/ui/button';

import { PickerSheet } from './PickerSheet';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/PickerSheet',
  component: PickerSheet,
  parameters: {
    layout: 'fullscreen',
    docs: { story: { inline: false, iframeHeight: 700 } },
  },
  args: {
    animated: false,
    ariaLabelledBy: 'picker-sheet-title',
    snapPoint: 'medium',
    children: null,
    onClose: fn(),
  },
} satisfies Meta<typeof PickerSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 제목과 선택 항목을 담는 기본 선택 시트입니다. 바깥을 누르거나 Escape로 닫을 수 있습니다. */
export const Default: Story = {
  render: function PickerSheetStory(args) {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div className="min-h-dvh bg-neutral-100 p-4">
        <Button onClick={() => setIsOpen(true)}>선택창 열기</Button>
        {isOpen && (
          <PickerSheet
            {...args}
            onClose={() => {
              setIsOpen(false);
              args.onClose();
            }}
          >
            <div className="space-y-4 p-4">
              <h2 id="picker-sheet-title" className="text-title-02-semibold text-neutral-700">
                방문 장소 선택
              </h2>
              <Button variant="secondary" size="medium" onClick={() => setIsOpen(false)}>
                선택 완료
              </Button>
            </div>
          </PickerSheet>
        )}
      </div>
    );
  },
};

/** 드래그 가능한 높이 단계를 제한하는 예시입니다. */
export const FitContent: Story = {
  args: { fitContent: true, snapPoints: ['hidden', 'medium'] as const },
  render: (args) => (
    <div className="min-h-dvh bg-neutral-100">
      <PickerSheet {...args}>
        <div className="p-4">
          <h2 id="picker-sheet-title" className="text-title-02-semibold text-neutral-700">
            기간 선택
          </h2>
          <p className="mt-2 text-body-02-regular text-neutral-500">콘텐츠 높이에 맞춘 시트</p>
        </div>
      </PickerSheet>
    </div>
  ),
};
