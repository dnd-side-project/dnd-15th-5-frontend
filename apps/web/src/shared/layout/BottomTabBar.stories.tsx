import { MemoryRouter } from 'react-router-dom';

import BottomTabBar from './BottomTabBar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/BottomTabBar',
  component: BottomTabBar,
  // INFO: NavLink가 현재 경로를 읽을 수 있도록 라우터 컨텍스트로 감싼다.
  // 실제 사용 화면과 같은 모바일 프레임 폭(393px)에서 확인할 수 있게 감싼다.
  decorators: [
    (Story, { parameters }) => (
      <MemoryRouter initialEntries={[parameters.initialPath as string]}>
        <div style={{ width: 393 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof BottomTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** "홈" 탭이 활성 상태입니다. */
export const HomeActive: Story = {
  parameters: { initialPath: '/home' },
};

/** "리포트" 탭이 활성 상태입니다. */
export const ReportActive: Story = {
  parameters: { initialPath: '/report' },
};

/**
 * 하단 탭(홈·리포트) 어디에도 해당하지 않는 경로에 있을 때의 상태입니다.
 * "기록하기"는 탭이 아니라 항상 같은 모양인 액션 버튼이라 활성 표시가 없습니다.
 */
export const NoTabActive: Story = {
  parameters: { initialPath: '/record' },
};
