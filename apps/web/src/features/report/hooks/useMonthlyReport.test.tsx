import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';

import { useMonthlyReport } from './useMonthlyReport';

jest.mock('@/shared/ui/toast', () => ({
  useToast: () => ({ showToast: jest.fn() }),
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
  const { handleOlderMonth, selectedMonth } = useMonthlyReport();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <span>{`${selectedMonth.year}-${selectedMonth.month}`}</span>
      <span>{location.search}</span>
      <button onClick={handleOlderMonth} type="button">
        이전 달
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

describe('useMonthlyReport', () => {
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

  it('브라우저 탐색으로 URL이 바뀌면 해당 월 리포트로 동기화한다', async () => {
    const user = userEvent.setup();
    renderMonthlyReportHook('/report/monthly-report?yearMonth=2026-07');

    await user.click(screen.getByRole('button', { name: '이전 달' }));
    expect(screen.getByText('2026-6')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '브라우저 뒤로가기' }));

    expect(screen.getByText('2026-7')).toBeInTheDocument();
    expect(screen.getByText('?yearMonth=2026-07')).toBeInTheDocument();
  });
});
