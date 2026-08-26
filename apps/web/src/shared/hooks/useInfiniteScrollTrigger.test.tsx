import { act, render } from '@testing-library/react';

import { useInfiniteScrollTrigger } from './useInfiniteScrollTrigger';

const disconnect = jest.fn();
const observe = jest.fn();
let intersectionCallback: IntersectionObserverCallback;

function InfiniteScrollFixture({
  enabled,
  onIntersect,
}: {
  enabled: boolean;
  onIntersect: () => void;
}) {
  const triggerRef = useInfiniteScrollTrigger({ enabled, onIntersect });

  return <div ref={triggerRef} data-testid="trigger" />;
}

describe('useInfiniteScrollTrigger', () => {
  beforeEach(() => {
    disconnect.mockReset();
    observe.mockReset();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: jest.fn((callback: IntersectionObserverCallback) => {
        intersectionCallback = callback;
        return { disconnect, observe } as unknown as IntersectionObserver;
      }),
    });
  });

  it('활성화된 감시 요소가 보이면 콜백을 실행하고 비활성화 시 감시를 해제한다', () => {
    const onIntersect = jest.fn();
    const { rerender } = render(<InfiniteScrollFixture enabled onIntersect={onIntersect} />);

    expect(observe).toHaveBeenCalledWith(expect.any(HTMLDivElement));

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });
    expect(onIntersect).toHaveBeenCalledTimes(1);

    rerender(<InfiniteScrollFixture enabled={false} onIntersect={onIntersect} />);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
