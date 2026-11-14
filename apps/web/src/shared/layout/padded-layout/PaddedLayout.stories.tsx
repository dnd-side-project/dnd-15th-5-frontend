import { MemoryRouter, Route, Routes } from 'react-router-dom';

import PaddedLayout from './PaddedLayout';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/Layout/PaddedLayout',
  component: PaddedLayout,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PaddedLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 좌우 16px 여백을 적용하는 라우트 레이아웃입니다. 화면 전체 배경은 자식 페이지가 담당합니다. */
export const Default: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<PaddedLayout />}>
          <Route
            index
            element={
              <main className="min-h-dvh bg-neutral-00">
                <div className="rounded-12 border border-dashed border-primary-400 bg-primary-50 p-4 text-body-02-regular text-neutral-700">
                  이 콘텐츠의 좌우에 16px 패딩이 적용됩니다.
                </div>
              </main>
            }
          />
        </Route>
      </Routes>
    </MemoryRouter>
  ),
};
