import { useState } from 'react';
import { fn } from 'storybook/test';

import { BottomSheet } from '.';

import type { BottomSheetSnapPoint } from '.';
import type { Meta, StoryObj } from '@storybook/react-vite';

const SNAP_SEQUENCE: readonly BottomSheetSnapPoint[] = ['medium', 'full', 'medium', 'hidden'];

const meta = {
  title: 'Shared/BottomSheet',
  component: BottomSheet,
  // INFO: BottomSheet는 fixed 포지션이라 뷰포트 기준으로 뜬다. 캔버스에서 위치를 가늠할 수 있게
  // 배경이 있는 전체 높이 컨테이너로 감싼다.
  decorators: [
    (Story) => (
      <div style={{ height: '100dvh', background: '#eeeeee' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    // INFO: fixed 포지션이 전역 모바일 프레임 데코레이터(mobile-frame)에 또 갇히면 폭 계산이
    // 어긋나 보인다. fullscreen으로 그 데코레이터를 건너뛴다(.storybook/preview.tsx 참고).
    layout: 'fullscreen',
    // INFO: Docs 페이지 안에 그대로 끼워 넣으면(inline) fixed·dvh 계산이 문서 페이지 기준으로
    // 잘못 잡힌다. 이 컴포넌트 예시는 독립된 iframe에서 렌더링하도록 지정한다.
    docs: {
      story: {
        inline: false,
        iframeHeight: 700,
      },
    },
  },
  argTypes: {
    snapPoint: {
      control: 'select',
      options: ['medium', 'full', 'hidden'],
    },
  },
  args: {
    snapPoint: 'medium',
    onSnapPointChange: fn(),
    onHandleClick: fn(),
    children: <p>바텀시트 내용</p>,
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 정해진 높이 하나를 고정으로 보여줍니다. 실제 단계 전환은 이 컴포넌트를 쓰는 쪽에서 제어합니다. */
export const Medium: Story = {};

export const Full: Story = {
  args: { snapPoint: 'full' },
};

export const Hidden: Story = {
  args: { snapPoint: 'hidden' },
};

/** 실제 사용처(하단 탭바의 홈 버튼)처럼 클릭할 때마다 중간 → 최대 → 중간 → 숨김 순서로 도는 예시입니다. */
export const ClickToCycleExample: Story = {
  render: () => {
    function BottomSheetExample() {
      const [stepIndex, setStepIndex] = useState(0);
      const snapPoint = SNAP_SEQUENCE[stepIndex % SNAP_SEQUENCE.length];

      return (
        <BottomSheet
          snapPoint={snapPoint}
          onSnapPointChange={(nextSnapPoint) => {
            const nextIndex = SNAP_SEQUENCE.indexOf(nextSnapPoint);
            setStepIndex(nextIndex === -1 ? 0 : nextIndex);
          }}
        >
          <p>바텀시트 내용 — 위 버튼 대신 핸들을 직접 드래그해서 옮겨보세요</p>
          <button type="button" onClick={() => setStepIndex((prev) => prev + 1)}>
            (홈 버튼 대역) 다음 단계로
          </button>
        </BottomSheet>
      );
    }

    return <BottomSheetExample />;
  },
};
