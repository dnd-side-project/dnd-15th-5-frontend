import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MonthlyStickerRecordList from './MonthlyStickerRecordList';

const mockUseMonthlyStickerRecordsQuery = jest.fn();
const mockRefetch = jest.fn();

jest.mock('@/features/report/apis/hooks/useMonthlyStickerRecordsQuery', () => ({
  useMonthlyStickerRecordsQuery: (month: unknown) => mockUseMonthlyStickerRecordsQuery(month),
}));

const CURRENT_MONTH_GROUPS = [
  {
    dateLabel: '23일 금요일',
    dateValue: '2026-08-23',
    stickerImages: ['sticker-01.png'],
  },
  {
    dateLabel: '21일 수요일',
    dateValue: '2026-08-21',
    stickerImages: Array.from({ length: 13 }, (_, index) => `sticker-${index + 2}.png`),
  },
];

describe('MonthlyStickerRecordList', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-25T12:00:00+09:00'));
  });

  beforeEach(() => {
    mockRefetch.mockReset();
    mockUseMonthlyStickerRecordsQuery.mockImplementation(({ month }: { month: number }) => ({
      data: month === 8 ? CURRENT_MONTH_GROUPS : [],
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

  it('현재 월의 스티커를 날짜별로 5열 슬롯에 표시한다', () => {
    const { container } = renderMonthlyStickerRecordList();

    expect(screen.getByRole('heading', { name: '8월에 쌓인 기록' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '23일 금요일' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '21일 수요일' })).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(14);
    expect(screen.getAllByRole('listitem')).toHaveLength(20);
    expect(screen.getAllByLabelText('빈 스티커 자리')).toHaveLength(6);
  });

  it('기록이 없는 이전 달로 이동하면 빈 상태를 표시한다', () => {
    renderMonthlyStickerRecordList();

    fireEvent.click(screen.getByRole('button', { name: '이전 달 보기' }));

    expect(screen.getByRole('heading', { name: '7월에 쌓인 기록' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '7월에는 기록이 없어요' })).toBeInTheDocument();
    expect(screen.getByText('지난 소비를 기록하면 빈 공간이 채워질 거예요.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '7월 기록 추가하기' })).toHaveAttribute(
      'href',
      '/record?yearMonth=2026-07'
    );
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
