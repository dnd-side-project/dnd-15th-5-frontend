import { act, renderHook } from '@testing-library/react';

import { BOTTOM_SHEET_TRANSITION_MS } from '@/shared/ui/bottom-sheet';

import { useBottomSheetTransition } from './useBottomSheetTransition';

describe('useBottomSheetTransition', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('마운트 다음 프레임에 표시 상태가 된다', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useBottomSheetTransition(onClose));

    expect(result.current.isVisible).toBe(false);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('열려 있는 동안 배경 스크롤을 잠그고, 언마운트되면 원래 값으로 되돌린다', () => {
    document.body.style.overflow = 'auto';

    const { unmount } = renderHook(() => useBottomSheetTransition(jest.fn()));

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('auto');
  });

  it('Escape 키를 누르면 표시 상태를 먼저 끄고, 전환 시간이 지난 뒤 onClose를 호출한다', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useBottomSheetTransition(onClose));

    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(result.current.isVisible).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.isVisible).toBe(false);
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(BOTTOM_SHEET_TRANSITION_MS);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('닫는 도중 다시 닫아도 onClose는 한 번만 호출된다', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useBottomSheetTransition(onClose));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    act(() => {
      result.current.closeBottomSheet();
      result.current.closeBottomSheet();
    });

    act(() => {
      jest.advanceTimersByTime(BOTTOM_SHEET_TRANSITION_MS);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closeBottomSheet에 콜백을 전달하면 onClose 대신 그 콜백을 호출한다', () => {
    const onClose = jest.fn();
    const afterClose = jest.fn();
    const { result } = renderHook(() => useBottomSheetTransition(onClose));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    act(() => {
      result.current.closeBottomSheet(afterClose);
    });

    act(() => {
      jest.advanceTimersByTime(BOTTOM_SHEET_TRANSITION_MS);
    });

    expect(afterClose).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
