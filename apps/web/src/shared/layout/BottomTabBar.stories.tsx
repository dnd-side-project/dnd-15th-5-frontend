import { MemoryRouter } from 'react-router-dom';
import { LiquidGlassScene } from 'simple-liquid-glass/backdrop';

import BottomTabBar from './BottomTabBar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/BottomTabBar',
  component: BottomTabBar,
  parameters: { layout: 'fullscreen' },
  // INFO: 스크롤에 따라 캡슐 아래의 배경과 굴절이 바뀌는지 확인한다.
  decorators: [
    (Story, { parameters }) => (
      <MemoryRouter initialEntries={[parameters.initialPath as string]}>
        <LiquidGlassScene className="mobile-frame min-h-screen bg-neutral-50">
          <section className="space-y-4 px-5 pt-10 pb-32">
            <h1 className="text-heading-01-bold text-neutral-700">우리 동네 소비 기록</h1>
            <p className="text-body-02-regular text-neutral-500">
              아래로 스크롤해 유리 캡슐을 통과하는 배경을 확인해 보세요.
            </p>
            {Array.from({ length: 12 }, (_, index) => (
              <article
                key={index}
                className="flex h-36 items-center gap-5 rounded-30 bg-neutral-00 p-5"
              >
                <div className="size-20 shrink-0 rounded-full bg-linear-to-br from-primary-500 to-primary-300" />
                <div className="space-y-2 text-neutral-700">
                  <h2 className="text-label-01-medium font-bold">동네 가게 {index + 1}</h2>
                  <p className="text-label-01-medium text-neutral-500">오늘의 소중한 기록</p>
                </div>
              </article>
            ))}
          </section>
          <Story />
        </LiquidGlassScene>
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
