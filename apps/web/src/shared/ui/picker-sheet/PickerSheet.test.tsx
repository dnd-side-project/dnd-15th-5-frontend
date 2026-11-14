import { act, fireEvent, render, screen } from '@testing-library/react';

import { PickerSheet } from './PickerSheet';

describe('PickerSheet', () => {
  it('애니메이션 시트가 표시된 뒤 초기 포커스를 설정하고 닫을 때 복원한다', () => {
    let openFrame: FrameRequestCallback | undefined;
    const animationFrameSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        openFrame = callback;
        return 1;
      });
    const outsideButton = document.createElement('button');
    document.body.append(outsideButton);
    outsideButton.focus();
    const { unmount } = render(
      <PickerSheet
        animated
        ariaLabel="선택"
        initialFocusSelector="[data-initial]"
        onClose={jest.fn()}
        snapPoint="medium"
      >
        <button type="button">첫 번째</button>
        <button type="button" data-initial>
          초기 포커스
        </button>
        <button type="button">마지막</button>
      </PickerSheet>
    );
    try {
      expect(screen.queryByRole('dialog', { name: '선택' })).not.toBeInTheDocument();
      expect(outsideButton).toHaveFocus();
      act(() => openFrame?.(0));
      expect(screen.getByRole('button', { name: '초기 포커스' })).toHaveFocus();

      outsideButton.focus();
      fireEvent.keyDown(window, { key: 'Tab' });
      expect(screen.getByRole('button', { name: '바텀시트 높이 조절' })).toHaveFocus();
      outsideButton.focus();
      fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
      expect(screen.getByRole('button', { name: '마지막' })).toHaveFocus();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog', { name: '선택' })).not.toBeInTheDocument();
      expect(outsideButton).toHaveFocus();
    } finally {
      unmount();
      outsideButton.remove();
      animationFrameSpy.mockRestore();
    }
  });
});
