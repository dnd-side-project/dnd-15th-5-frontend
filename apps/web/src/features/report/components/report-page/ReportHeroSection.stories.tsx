import { MemoryRouter } from 'react-router-dom';

import ReportHeroSection from './ReportHeroSection';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Report/ReportHeroSection',
  component: ReportHeroSection,
  args: {
    monthLabel: '9월',
    to: '/report/monthly',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-[375px] py-4">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof ReportHeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 180px 높이의 월간 기록 리포트 배너입니다. */
export const CurrentReport: Story = {
  render: () => <ReportHeroSection variant="current" monthLabel="9월" to="/report/monthly" />,
};

/** 120px 높이의 지난달 리포트 링크 배너입니다. */
export const PreviousReport: Story = {
  args: {
    variant: 'previous',
    to: '/report/monthly',
  },
};
