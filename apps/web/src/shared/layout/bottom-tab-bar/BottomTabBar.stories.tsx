import { useState } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { LiquidGlassScene } from 'simple-liquid-glass/backdrop';

import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import {
  StoryPlaceList,
  StoryRecordBackground,
  StoryReportBackground,
} from '@/shared/layout/storybook/StoryContentPreview';
import { StoryMapBackdrop, StoryMapToolbar } from '@/shared/layout/storybook/StoryMapPreview';
import { STORY_PLACES } from '@/shared/layout/storybook/storyPreviewData';

import BottomTabBar from './BottomTabBar';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

type BottomTabBarPreviewProps = { children: ReactNode };

/** 탭을 눌러 지도·리포트·기록 배경 사이를 이동하고 실제 배경 위의 Glass를 확인합니다. */
function BottomTabBarPreview({ children }: BottomTabBarPreviewProps) {
  const { pathname } = useLocation();
  const [category, setCategory] = useState<string | null>(null);

  return (
    <LiquidGlassScene className="mobile-frame min-h-screen bg-neutral-50">
      {pathname.startsWith(ROUTE_PATHS.report) ? (
        <StoryReportBackground />
      ) : pathname.startsWith(ROUTE_PATHS.record) ? (
        <StoryRecordBackground />
      ) : (
        <>
          <section className="relative h-dvh">
            <StoryMapBackdrop category={category} />
            <StoryMapToolbar category={category} onCategoryChange={setCategory} />
            <div className="absolute right-5 bottom-32 left-5 rounded-30 bg-neutral-00/90 p-5 shadow-home-overlay">
              <p className="text-caption-01-medium text-primary-500">11월의 동네 기록</p>
              <h1 className="mt-1 text-title-01-bold text-neutral-700">발걸음이 모인 곳</h1>
              <p className="mt-1 text-body-02-medium text-neutral-500">
                {STORY_PLACES.length}곳에 쌓인 나의 취향을 만나보세요
              </p>
            </div>
          </section>
          <section className="bg-neutral-00 px-5 pt-8">
            <h2 className="mb-2 text-title-01-bold text-neutral-700">자주 소비한 곳</h2>
            <StoryPlaceList />
          </section>
        </>
      )}
      {children}
    </LiquidGlassScene>
  );
}

const meta = {
  title: 'Shared/BottomTabBar',
  component: BottomTabBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, iframeHeight: 800 },
      description: {
        component:
          '지도·리포트·기록 배경에서 하단 네비게이션을 확인합니다. 탭 이동과 스크롤에 따라 유리 뒤의 콘텐츠가 바뀝니다.',
      },
    },
  },
  decorators: [
    (Story, { parameters }) => (
      <MemoryRouter initialEntries={[parameters.initialPath as string]}>
        <BottomTabBarPreview>
          <Story />
        </BottomTabBarPreview>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof BottomTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** "홈" 탭이 활성 상태입니다. */
export const HomeActive: Story = {
  parameters: { initialPath: ROUTE_PATHS.home },
};

/** "리포트" 탭이 활성 상태입니다. */
export const ReportActive: Story = {
  parameters: { initialPath: ROUTE_PATHS.report },
};

/**
 * 하단 탭(홈·리포트) 어디에도 해당하지 않는 경로에 있을 때의 상태입니다.
 * "기록하기"는 탭이 아니라 항상 같은 모양인 액션 버튼이라 활성 표시가 없습니다.
 */
export const NoTabActive: Story = {
  parameters: { initialPath: ROUTE_PATHS.record },
};
