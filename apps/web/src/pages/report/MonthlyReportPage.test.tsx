import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useMonthlyReport } from '@/features/report';
import type { YearMonth } from '@/shared/types/yearMonth';

import MonthlyReportPage from './MonthlyReportPage';

jest.mock('@/features/my-page', () => ({
  useGetMyAccount: () => ({ data: undefined }),
}));

jest.mock('@/features/report', () => ({
  CategoryChart: () => null,
  MonthlyReportDetailsSkeleton: () => null,
  MonthlyReportHeader: ({
    onMonthSelect,
    selectedMonth,
  }: {
    onMonthSelect: (month: YearMonth) => void;
    selectedMonth: YearMonth;
  }) => (
    <>
      <span data-testid="displayed-month">{`${selectedMonth.year}-${selectedMonth.month}`}</span>
      <button onClick={() => onMonthSelect({ month: 5, year: 2026 })} type="button">
        5월 선택
      </button>
    </>
  ),
  MonthlyReportUnavailableCard: () => null,
  ReportActivitySummary: () => null,
  ReportMyPlace: () => null,
  ReportPreferenceSection: ({
    onCardPreview,
    onCardSelect,
  }: {
    onCardPreview: (index: number) => void;
    onCardSelect: (index: number) => void;
  }) => (
    <>
      <button onClick={() => onCardPreview(1)} type="button">
        6월 미리보기
      </button>
      <button onClick={() => onCardSelect(1)} type="button">
        6월 카드 확정
      </button>
    </>
  ),
  ReportShareSheet: () => null,
  ReportTopShops: () => null,
  WeekdaySpendingChart: () => null,
  useKakaoReportShare: () => ({
    isKakaoShareReady: false,
    isPreparingKakaoShare: false,
    isSharing: false,
    shareToKakao: jest.fn(),
  }),
  useMonthlyReport: jest.fn(),
}));

const mockedUseMonthlyReport = jest.mocked(useMonthlyReport);
const mockSelectReportCard = jest.fn();
const mockSelectMonth = jest.fn();
let mockSelectedMonth: YearMonth;

const createMonthlyReportState = () =>
  ({
    captureRef: { current: null },
    downloadImage: jest.fn(),
    handleCardTransitionChange: jest.fn(),
    handleCurrentReportSelect: jest.fn(),
    handleMonthPickerClose: jest.fn(),
    handleMonthPickerOpen: jest.fn(),
    handleMonthSelect: mockSelectMonth,
    handleNewerMonth: jest.fn(),
    handleOlderMonth: jest.fn(),
    handlePreferenceCardFlip: jest.fn(),
    handleReportCardSelect: mockSelectReportCard,
    handleShareSheetClose: jest.fn(),
    handleShareSheetOpen: jest.fn(),
    hasNewerMonth: true,
    hasOlderMonth: true,
    hasReportError: false,
    isCardFlipped: false,
    isDownloading: false,
    isMonthPickerOpen: false,
    isPending: false,
    isReportContentLoading: false,
    isShareSheetOpen: false,
    refetch: jest.fn(),
    report: undefined,
    reportCards: [
      { id: '2026-05', isUnavailable: true, month: { month: 5, year: 2026 } },
      { id: '2026-06', isUnavailable: true, month: { month: 6, year: 2026 } },
    ],
    selectableMonths: [
      { month: 6, year: 2026 },
      { month: 5, year: 2026 },
    ],
    selectedCardIndex: mockSelectedMonth.month === 5 ? 0 : 1,
    selectedMonth: mockSelectedMonth,
  }) as ReturnType<typeof useMonthlyReport>;

describe('<MonthlyReportPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectedMonth = { month: 5, year: 2026 };
    mockedUseMonthlyReport.mockImplementation(createMonthlyReportState);
    mockSelectReportCard.mockImplementation(() => {
      mockSelectedMonth = { month: 6, year: 2026 };
    });
    mockSelectMonth.mockImplementation((month: YearMonth) => {
      mockSelectedMonth = month;
    });
  });

  it('카드 확정 후 이전 기준 월로 돌아와도 종료된 미리보기 월을 표시하지 않는다', async () => {
    const user = userEvent.setup();
    const view = render(
      <MemoryRouter>
        <MonthlyReportPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '6월 미리보기' }));
    expect(screen.getByTestId('displayed-month')).toHaveTextContent('2026-6');

    await user.click(screen.getByRole('button', { name: '6월 카드 확정' }));
    view.rerender(
      <MemoryRouter>
        <MonthlyReportPage />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: '5월 선택' }));
    view.rerender(
      <MemoryRouter>
        <MonthlyReportPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('displayed-month')).toHaveTextContent('2026-5');
  });
});
