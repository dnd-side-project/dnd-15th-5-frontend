import { act, fireEvent, render, screen } from '@testing-library/react';
import { useLayoutEffect } from 'react';

import { useSelectedPlaceExpandTransition } from './useSelectedPlaceExpandTransition';

type TransitionHarnessProps = {
  placeId: string;
  onExpanded: (placeId: string) => void;
  onLayoutCommit?: () => void;
};

function TransitionHarness({ placeId, onExpanded, onLayoutCommit }: TransitionHarnessProps) {
  const { sheetRef, expandSelectedPlace } = useSelectedPlaceExpandTransition({
    placeId,
    onExpanded,
  });
  useLayoutEffect(() => {
    onLayoutCommit?.();
  }, [placeId, onLayoutCommit]);

  return (
    <div ref={sheetRef}>
      <button onClick={expandSelectedPlace}>상세 열기</button>
    </div>
  );
}

const setup = () => {
  const onExpanded = jest.fn();
  const view = render(<TransitionHarness placeId="place-01" onExpanded={onExpanded} />);
  const sheet = view.container.firstElementChild as HTMLDivElement;
  const animation = {
    onfinish: null as (() => void) | null,
    oncancel: null as (() => void) | null,
    cancel: jest.fn(),
  };
  sheet.animate = jest.fn(() => animation as unknown as Animation);
  jest.spyOn(sheet, 'getBoundingClientRect').mockReturnValue({ height: 200 } as DOMRect);

  return { ...view, onExpanded, animation };
};

it('새 장소의 커밋 중 이전 애니메이션이 끝나도 이전 상세로 이동하지 않는다', () => {
  const { rerender, onExpanded, animation } = setup();
  fireEvent.click(screen.getByRole('button', { name: '상세 열기' }));
  expect(animation.onfinish).not.toBeNull();

  const finishDuringCommit = jest.fn(() => animation.onfinish?.());
  rerender(
    <TransitionHarness
      placeId="place-02"
      onExpanded={onExpanded}
      onLayoutCommit={finishDuringCommit}
    />
  );

  expect(finishDuringCommit).toHaveBeenCalled();
  expect(onExpanded).not.toHaveBeenCalled();
  expect(animation.cancel).toHaveBeenCalledTimes(1);
  expect(animation.onfinish).toBeNull();
  expect(animation.oncancel).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: '상세 열기' }));
  act(() => animation.onfinish?.());
  expect(onExpanded).toHaveBeenCalledWith('place-02');
  expect(onExpanded).toHaveBeenCalledTimes(1);
});

it('언마운트 전에 예약된 완료 콜백이 나중에 실행돼도 상세로 이동하지 않는다', () => {
  const { unmount, onExpanded, animation } = setup();
  fireEvent.click(screen.getByRole('button', { name: '상세 열기' }));
  const pendingFinish = animation.onfinish;

  unmount();
  act(() => pendingFinish?.());

  expect(animation.cancel).toHaveBeenCalledTimes(1);
  expect(onExpanded).not.toHaveBeenCalled();
});
