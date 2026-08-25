import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MonthlyStickerRecordList from './MonthlyStickerRecordList';

const mockUseMonthlyStickerRecordsQuery = jest.fn();
const mockRefetch = jest.fn();

jest.mock('@/features/report/apis/hooks/useMonthlyStickerRecordsQuery', () => ({
  useMonthlyStickerRecordsQuery: (month: unknown) => mockUseMonthlyStickerRecordsQuery(month),
}));

describe('MonthlyStickerRecordList', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-25T12:00:00+09:00'));
  });

  beforeEach(() => {
    mockRefetch.mockReset();
    mockUseMonthlyStickerRecordsQuery.mockImplementation(() => ({
      data: [],
      isError: false,
      isPending: false,
      refetch: mockRefetch,
    }));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const renderMonthlyStickerRecordList = () =>
    render(
      <MemoryRouter>
        <MonthlyStickerRecordList />
      </MemoryRouter>
    );

  it('이전 달로 이동하면 해당 월을 조회한다', () => {
    renderMonthlyStickerRecordList();

    fireEvent.click(screen.getByRole('button', { name: '이전 달 보기' }));

    expect(screen.getByRole('heading', { name: '7월에 쌓인 기록' })).toBeInTheDocument();
    expect(mockUseMonthlyStickerRecordsQuery).toHaveBeenLastCalledWith({ month: 7, year: 2026 });
  });

  it('월을 누르면 월 선택 시트를 열고 선택한 월을 조회한다', () => {
    renderMonthlyStickerRecordList();

    fireEvent.click(screen.getByRole('button', { name: '월 선택' }));

    expect(screen.getByRole('dialog', { name: '월 선택하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026년 8월' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    fireEvent.click(screen.getByRole('button', { name: '2026년 7월' }));

    expect(screen.queryByRole('dialog', { name: '월 선택하기' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '7월에 쌓인 기록' })).toBeInTheDocument();
    expect(mockUseMonthlyStickerRecordsQuery).toHaveBeenLastCalledWith({ month: 7, year: 2026 });
  });

  it('조회 중에는 로딩 상태를 표시한다', () => {
    mockUseMonthlyStickerRecordsQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isPending: true,
      refetch: mockRefetch,
    });

    renderMonthlyStickerRecordList();

    expect(screen.getByRole('status')).toHaveTextContent('기록을 불러오는 중이에요');
  });

  it('조회 실패 시 재시도할 수 있다', () => {
    mockUseMonthlyStickerRecordsQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
      refetch: mockRefetch,
    });

    renderMonthlyStickerRecordList();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도하기' }));

    expect(screen.getByRole('heading', { name: '기록을 불러오지 못했어요' })).toBeInTheDocument();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
