import { act, fireEvent, render, screen } from '@testing-library/react';

import { ToastProvider, useToast } from '.';

function ToastFixture() {
  const { closeToast, showToast } = useToast();

  return (
    <>
      <button
        onClick={() => showToast({ message: '저장되었어요', type: 'success', duration: 1000 })}
      >
        열기
      </button>
      <button onClick={() => closeToast()}>닫기</button>
    </>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('Toast를 노출하고 지정한 시간이 지나면 닫는다', () => {
    render(
      <ToastProvider>
        <ToastFixture />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: '열기' }));
    expect(screen.getByText('저장되었어요')).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(1200));
    expect(screen.queryByText('저장되었어요')).not.toBeInTheDocument();
  });

  it('closeToast로 열린 Toast를 닫는다', () => {
    render(
      <ToastProvider duration={0}>
        <ToastFixture />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: '열기' }));
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    act(() => jest.runAllTimers());

    expect(screen.queryByText('저장되었어요')).not.toBeInTheDocument();
  });
});
