import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { getCurrentStatus, getStickerBoard } from '@/features/report/apis/clients';

import ReportPage from './ReportPage';

jest.mock('@/features/report/apis/clients', () => ({
  getCurrentStatus: jest.fn(),
  getStickerBoard: jest.fn(),
}));

const renderReportPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ReportPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  jest.mocked(getCurrentStatus).mockReset();
  jest.mocked(getStickerBoard).mockReset();
  jest.mocked(getCurrentStatus).mockResolvedValue({
    data: {
      date: '2026-11-14',
      monthlyCount: 1,
      weeklyCounts: [1, 0, 0, 0, 0, 0, 0],
      recentDiscoveryMessage: '새로운 동네를 발견했어요',
    },
  });
});

it('스티커 조회만 실패하면 주간 기록과 최근발견을 유지하고 스티커만 재시도한다', async () => {
  jest.mocked(getStickerBoard).mockRejectedValue(new Error('스티커 조회 실패'));
  renderReportPage();

  expect(await screen.findByText('스티커를 불러오지 못했어요')).toBeInTheDocument();
  expect(screen.queryByText('리포트를 불러오지 못했어요')).not.toBeInTheDocument();
  expect(screen.getByRole('list', { name: /소비 기록$/ })).toBeInTheDocument();
  expect(screen.getByText('새로운 동네를 발견했어요')).toBeInTheDocument();
  expect(screen.queryByText('아직 받은 스티커가 없어요')).not.toBeInTheDocument();

  jest.mocked(getStickerBoard).mockResolvedValue({
    data: {
      days: [{ date: '2026-11-14', visuals: [{ imageUrl: 'https://example.com/photo.png' }] }],
    },
  });
  fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));
  await waitFor(() =>
    expect(screen.queryByText('스티커를 불러오지 못했어요')).not.toBeInTheDocument()
  );
  expect(document.querySelector('img[src="https://example.com/photo.png"]')).toBeInTheDocument();
  expect(getCurrentStatus).toHaveBeenCalledTimes(1);
  expect(getStickerBoard).toHaveBeenCalledTimes(2);
});

it('스티커가 로딩 중이어도 주간 기록과 최근발견을 표시한다', async () => {
  jest.mocked(getStickerBoard).mockReturnValue(new Promise(() => {}));
  renderReportPage();

  expect(await screen.findByText('새로운 동네를 발견했어요')).toBeInTheDocument();
  expect(screen.getByRole('list', { name: /소비 기록$/ })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('리포트를 불러오는 중입니다.');
  expect(screen.queryByText('아직 받은 스티커가 없어요')).not.toBeInTheDocument();
});
