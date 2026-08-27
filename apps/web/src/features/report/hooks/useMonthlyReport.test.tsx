import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';

import type { MonthlyReport } from '@/features/report/types';

import { useMonthlyReport } from './useMonthlyReport';

let mockMonthlyReportData: MonthlyReport | undefined;
let mockFirstAvailableYearMonth = { year: 2026, month: 4 };

jest.mock('@/shared/ui/toast', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock('@/features/report/apis/hooks/useFirstAvailableYearMonthQuery', () => ({
  useFirstAvailableYearMonthQuery: () => ({ data: mockFirstAvailableYearMonth }),
}));

jest.mock('@/features/report/apis/hooks/useAdjacentMonthlyReportPrefetch', () => ({
  useAdjacentMonthlyReportPrefetch: jest.fn(),
}));

jest.mock('@/features/report/apis/hooks/useMonthlyReportQuery', () => ({
  useMonthlyReportQuery: () => ({
    data: mockMonthlyReportData,
    error: null,
    isError: false,
    isPending: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/shared/utils/yearMonth', () => ({
  ...jest.requireActual('@/shared/utils/yearMonth'),
  getCurrentMonth: () => ({ month: 8, year: 2026 }),
}));

jest.mock('./useReportImageDownload', () => ({
  useReportImageDownload: () => ({
    captureRef: { current: null },
    downloadImage: jest.fn(),
    hasDownloadError: false,
    isDownloading: false,
  }),
}));

function MonthlyReportHarness() {
  const {
    handleMonthPickerOpen,
    handleMonthSelect,
    handleNewerMonth,
    handleOlderMonth,
    isMonthPickerOpen,
    reportCards,
    selectedCardIndex,
    selectedMonth,
  } = useMonthlyReport();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <span>{`${selectedMonth.year}-${selectedMonth.month}`}</span>
      <span>{location.search}</span>
      <span>{isMonthPickerOpen ? '월 선택 열림' : '월 선택 닫힘'}</span>
      <span data-testid="report-card-months">{reportCards.map((card) => card.id).join(',')}</span>
      <span data-testid="selected-card-index">{selectedCardIndex}</span>
      <button onClick={handleMonthPickerOpen} type="button">
        월 선택 열기
      </button>
      <button onClick={() => handleMonthSelect({ year: 2026, month: 5 })} type="button">
        5월 선택
      </button>
      <button onClick={handleOlderMonth} type="button">
        이전 달
      </button>
      <button onClick={handleNewerMonth} type="button">
        다음 달
      </button>
      <button onClick={() => navigate(-1)} type="button">
        브라우저 뒤로가기
      </button>
    </>
  );
}

const renderMonthlyReportHook = (initialEntry: string) => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <MonthlyReportHarness />
    </MemoryRouter>
  );
};

const createMockMonthlyReport = (
  month: MonthlyReport['month'],
  adjacentCards: MonthlyReport['adjacentCards']
): MonthlyReport => ({
  adjacentCards,
  categories: [],
  districts: [],
  month,
  persona: {
    description: '설명',
    metrics: [],
    tags: [],
    title: '골목 발굴러',
    variant: 'alley-explorer',
  },
  shops: [],
  summary: [],
  weekdayInsight: '',
  weekdaySpending: [],
});

describe('useMonthlyReport', () => {
  beforeEach(() => {
    mockFirstAvailableYearMonth = { year: 2026, month: 4 };
    mockMonthlyReportData = undefined;
  });

  it('URL의 yearMonth에 해당하는 리포트를 선택한다', () => {
    renderMonthlyReportHook('/report/monthly-report?yearMonth=2026-05');

    expect(screen.getByText('2026-5')).toBeInTheDocument();
    expect(screen.getByText('?yearMonth=2026-05')).toBeInTheDocument();
  });

  it('yearMonth가 없거나 유효하지 않으면 최신 리포트 월로 URL을 교정한다', async () => {
    renderMonthlyReportHook('/report/monthly-report?yearMonth=invalid');

    expect(screen.getByText('2026-7')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('?yearMonth=2026-07')).toBeInTheDocument();
    });
  });

  it('월 이동 시 선택 월을 URL에 반영한다', async () => {
    const user = userEvent.setup();
    renderMonthlyReportHook('/report/monthly-report?yearMonth=2026-07');

    await user.click(screen.getByRole('button', { name: '이전 달' }));

    expect(screen.getByText('2026-6')).toBeInTheDocument();
    expect(screen.getByText('?yearMonth=2026-06')).toBeInTheDocument();
  });

  it('월 선택 시트를 열고 선택한 리포트 월을 URL에 반영한다', async () => {
    const user = userEvent.setup();
    renderMonthlyReportHook('/report/monthly-report?yearMonth=2026-07');

    await user.click(screen.getByRole('button', { name: '월 선택 열기' }));
    expect(screen.getByText('월 선택 열림')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '5월 선택' }));

    expect(screen.getByText('2026-5')).toBeInTheDocument();
    expect(screen.getByText('?yearMonth=2026-05')).toBeInTheDocument();
    expect(screen.getByText('월 선택 닫힘')).toBeInTheDocument();
  });

  it('브라우저 탐색으로 URL이 바뀌면 해당 월 리포트로 동기화한다', async () => {
    const user = userEvent.setup();
    renderMonthlyReportHook('/report/monthly-report?yearMonth=2026-07');

    await user.click(screen.getByRole('button', { name: '이전 달' }));
    expect(screen.getByText('2026-6')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '브라우저 뒤로가기' }));

    expect(screen.getByText('2026-7')).toBeInTheDocument();
    expect(screen.getByText('?yearMonth=2026-07')).toBeInTheDocument();
  });

  it('조회 가능한 범위를 벗어난 인접 empty 카드는 제외한다', () => {
    mockMonthlyReportData = createMockMonthlyReport({ month: 7, year: 2026 }, [
      { isUnavailable: true, month: { month: 6, year: 2026 } },
      { isUnavailable: true, month: { month: 8, year: 2026 } },
    ]);

    renderMonthlyReportHook('/report/monthly-report?yearMonth=2026-07');

    expect(screen.getByTestId('report-card-months')).toHaveTextContent('2026-06,2026-07');
    expect(screen.getByTestId('report-card-months')).not.toHaveTextContent('2026-08');
  });

  it('최초 리포트보다 이전인 empty 카드는 제외한다', () => {
    mockFirstAvailableYearMonth = { year: 2026, month: 5 };
    mockMonthlyReportData = createMockMonthlyReport({ month: 5, year: 2026 }, [
      { isUnavailable: true, month: { month: 4, year: 2026 } },
      { isUnavailable: true, month: { month: 6, year: 2026 } },
    ]);

    renderMonthlyReportHook('/report/monthly-report?yearMonth=2026-05');

    expect(screen.getByTestId('report-card-months')).toHaveTextContent('2026-05,2026-06');
    expect(screen.getByTestId('report-card-months')).not.toHaveTextContent('2026-04');
  });

  it('인접 카드 응답보다 빠르게 이동해도 선택 월 카드를 유지한다', async () => {
    const user = userEvent.setup();
    mockMonthlyReportData = createMockMonthlyReport({ month: 5, year: 2026 }, [
      {
        description: '설명',
        isUnavailable: false,
        metrics: [],
        month: { month: 6, year: 2026 },
        tags: [],
        title: '골목 발굴러',
        variant: 'alley-explorer',
      },
    ]);

    renderMonthlyReportHook('/report/monthly-report?yearMonth=2026-05');

    await user.click(screen.getByRole('button', { name: '다음 달' }));
    await user.click(screen.getByRole('button', { name: '다음 달' }));

    expect(screen.getByTestId('report-card-months')).toHaveTextContent('2026-05,2026-06,2026-07');
    expect(screen.getByTestId('selected-card-index')).toHaveTextContent('2');
  });
});
