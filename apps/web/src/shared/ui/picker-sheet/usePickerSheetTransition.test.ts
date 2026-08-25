import { act, renderHook } from '@testing-library/react';

import { BOTTOM_SHEET_TRANSITION_MS } from '@/shared/ui/bottom-sheet';

import { usePickerSheetTransition } from './usePickerSheetTransition';

describe('usePickerSheetTransition', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('마운트 다음 프레임에 표시 상태가 된다', () => {
    const { result } = renderHook(() => usePickerSheetTransition(jest.fn(), true));

    expect(result.current.isVisible).toBe(false);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('닫는 도중 다시 닫아도 onClose는 한 번만 호출된다', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => usePickerSheetTransition(onClose, true));

    act(() => {
      jest.runOnlyPendingTimers();
      result.current.closePickerSheet();
      result.current.closePickerSheet();
      jest.advanceTimersByTime(BOTTOM_SHEET_TRANSITION_MS);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('닫기 완료 콜백을 전달하면 onClose 대신 해당 콜백을 호출한다', () => {
    const onClose = jest.fn();
    const afterClose = jest.fn();
    const { result } = renderHook(() => usePickerSheetTransition(onClose, true));

    act(() => {
      jest.runOnlyPendingTimers();
      result.current.closePickerSheet(afterClose);
      jest.advanceTimersByTime(BOTTOM_SHEET_TRANSITION_MS);
    });

    expect(afterClose).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
