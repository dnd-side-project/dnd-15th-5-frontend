import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';

import { useOutsidePress } from './useOutsidePress';

type OutsidePressFixtureProps = {
  onOutsidePress: () => void;
};

function OutsidePressFixture({ onOutsidePress }: OutsidePressFixtureProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  useOutsidePress(targetRef, onOutsidePress);

  return (
    <>
      <div ref={targetRef}>
        <button type="button">내부</button>
      </div>
      <button type="button">외부</button>
    </>
  );
}

describe('useOutsidePress', () => {
  it('참조 요소 바깥의 포인터 입력에만 콜백을 실행한다', () => {
    const onOutsidePress = jest.fn();
    render(<OutsidePressFixture onOutsidePress={onOutsidePress} />);

    fireEvent.pointerDown(screen.getByRole('button', { name: '내부' }));
    expect(onOutsidePress).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByRole('button', { name: '외부' }));
    expect(onOutsidePress).toHaveBeenCalledTimes(1);
  });
});
