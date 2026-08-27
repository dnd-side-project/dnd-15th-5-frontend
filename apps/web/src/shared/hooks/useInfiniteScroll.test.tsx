import { act, render, screen } from '@testing-library/react';

import { useInfiniteScroll } from './useInfiniteScroll';

type InfiniteScrollFixtureProps = {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoadMoreError?: boolean;
  onLoadMore: () => void;
};

function InfiniteScrollFixture({
  hasNextPage,
  isFetchingNextPage = false,
  isLoadMoreError,
  onLoadMore,
}: InfiniteScrollFixtureProps) {
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    isLoadMoreError,
    onLoadMore,
  });

  return <div ref={loadMoreRef} data-testid="load-more-trigger" />;
}

describe('useInfiniteScroll', () => {
  const observe = jest.fn();
  const disconnect = jest.fn();
  let intersectionCallback: IntersectionObserverCallback;

  beforeEach(() => {
    observe.mockReset();
    disconnect.mockReset();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: jest.fn((callback: IntersectionObserverCallback) => {
        intersectionCallback = callback;

        return { disconnect, observe };
      }),
    });
  });

  it('다음 페이지가 있고 대기 중이면 감지 요소 진입 시 추가 조회한다', () => {
    const onLoadMore = jest.fn();
    render(<InfiniteScrollFixture hasNextPage onLoadMore={onLoadMore} />);

    expect(observe).toHaveBeenCalledWith(screen.getByTestId('load-more-trigger'));

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it.each([
    { hasNextPage: false, isFetchingNextPage: false, isLoadMoreError: false },
    { hasNextPage: true, isFetchingNextPage: true, isLoadMoreError: false },
    { hasNextPage: true, isFetchingNextPage: false, isLoadMoreError: true },
  ])('추가 조회할 수 없는 상태에서는 감지하지 않는다: %o', (props) => {
    render(<InfiniteScrollFixture {...props} onLoadMore={jest.fn()} />);

    expect(observe).not.toHaveBeenCalled();
  });
});
