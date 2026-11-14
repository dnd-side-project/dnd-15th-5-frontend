import { act, cleanup, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';

import { RecommendationAccountContext } from '@/features/map/recommendationAccountContext';

import RecommendationAddressHint from './RecommendationAddressHint';

function TestHint({ userId }: { userId: number | null }) {
  return (
    <RecommendationAccountContext value={userId}>
      <RecommendationAddressHint />
    </RecommendationAccountContext>
  );
}

const enterView = () => act(() => jest.advanceTimersByTime(0));

describe('<RecommendationAddressHint />', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 14, 12));
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('처음 진입하면 3초 표시하고 같은 날 재진입하면 숨긴다', () => {
    const { unmount } = render(<TestHint userId={201} />);
    enterView();
    expect(screen.getByRole('status')).toHaveTextContent('추천 받을 주소가 맞나요?');
    act(() => jest.advanceTimersByTime(2_999));
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(1));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    unmount();
    render(<TestHint userId={201} />);
    enterView();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('StrictMode의 초기 cleanup은 표시 이력을 소비하지 않는다', () => {
    const write = jest.spyOn(Storage.prototype, 'setItem');
    render(
      <StrictMode>
        <TestHint userId={202} />
      </StrictMode>
    );
    expect(write).not.toHaveBeenCalled();
    enterView();
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(3_000));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(write).toHaveBeenCalledWith('chapchap:recommendation-address-hint:202', '2026-11-14');
  });

  it('사용자 정보가 백그라운드에서 갱신되어도 안내를 3초 동안 유지한다', () => {
    const { rerender } = render(<TestHint userId={203} />);
    enterView();
    act(() => jest.advanceTimersByTime(1_000));
    rerender(<TestHint userId={203} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(1_999));
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(1));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('표시 전에 이탈하면 소비하지 않고 표시 후 이탈하면 소비한다', () => {
    const first = render(<TestHint userId={204} />);
    first.unmount();
    const second = render(<TestHint userId={204} />);
    enterView();
    expect(screen.getByRole('status')).toBeInTheDocument();
    second.unmount();
    render(<TestHint userId={204} />);
    enterView();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('24시간이 지나지 않아도 로컬 자정 이후 재진입하면 다시 표시한다', () => {
    jest.setSystemTime(new Date(2026, 10, 14, 23, 59));
    const { unmount } = render(<TestHint userId={205} />);
    enterView();
    act(() => jest.advanceTimersByTime(3_000));
    unmount();
    jest.setSystemTime(new Date(2026, 10, 15, 0, 1));
    render(<TestHint userId={205} />);
    enterView();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('사용자마다 별도로 기록하고 ID가 준비될 때까지 기다린다', () => {
    const { rerender } = render(<TestHint userId={null} />);
    enterView();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    rerender(<TestHint userId={101} />);
    enterView();
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(3_000));
    rerender(<TestHint userId={102} />);
    enterView();
    expect(screen.getByRole('status')).toBeInTheDocument();
    rerender(<TestHint userId={101} />);
    enterView();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('이미 저장된 오늘 기록이 있으면 표시하지 않는다', () => {
    window.localStorage.setItem('chapchap:recommendation-address-hint:206', '2026-11-14');
    render(<TestHint userId={206} />);
    enterView();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('저장소 읽기와 쓰기가 실패해도 표시하고 세션 내 중복을 막는다', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const { unmount } = render(<TestHint userId={207} />);
    enterView();
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(3_000));
    unmount();
    render(<TestHint userId={207} />);
    enterView();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
