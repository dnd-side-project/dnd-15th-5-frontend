import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';

import { useFocusTrap } from './useFocusTrap';

type TestDialogProps = {
  onEscape?: () => void;
};

function TestDialog({ onEscape }: TestDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, { initialFocusSelector: '[data-initial]', onEscape });

  return (
    <div ref={containerRef}>
      <button type="button">첫 번째</button>
      <button type="button" data-initial>
        초기 포커스
      </button>
      <button type="button">마지막</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('초기 요소에 포커스하고 Tab 포커스를 컨테이너 안에서 순환시킨다', () => {
    render(<TestDialog />);

    expect(screen.getByRole('button', { name: '초기 포커스' })).toHaveFocus();

    screen.getByRole('button', { name: '마지막' }).focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(screen.getByRole('button', { name: '첫 번째' })).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: '마지막' })).toHaveFocus();
  });

  it('Escape 동작을 실행하고 해제 시 기존 포커스를 복원한다', () => {
    const onEscape = jest.fn();
    const outsideButton = document.createElement('button');
    document.body.append(outsideButton);
    outsideButton.focus();

    const { unmount } = render(<TestDialog onEscape={onEscape} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);

    unmount();
    expect(outsideButton).toHaveFocus();
    outsideButton.remove();
  });
});
