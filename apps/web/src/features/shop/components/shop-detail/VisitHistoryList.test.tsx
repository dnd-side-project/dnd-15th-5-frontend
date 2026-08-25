import { act, render } from '@testing-library/react';

import VisitHistoryList from './VisitHistoryList';

import type { RefObject } from 'react';

describe('VisitHistoryList', () => {
  const observe = jest.fn();
  const disconnect = jest.fn();
  let intersectionCallback: IntersectionObserverCallback;

  beforeEach(() => {
    observe.mockReset();
    disconnect.mockReset();
    intersectionCallback = jest.fn();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: jest.fn((callback: IntersectionObserverCallback) => {
        intersectionCallback = callback;
        return { observe, disconnect, unobserve: jest.fn(), takeRecords: jest.fn() };
      }),
    });
  });

  it('목록 끝 감지 요소가 보이면 다음 방문 기록을 요청한다', () => {
    const onLoadMore = jest.fn();
    const scrollRootRef = { current: document.createElement('div') } as RefObject<HTMLElement>;
    render(
      <VisitHistoryList
        visits={[{ visitedAt: '2026-08-23', amount: 23_000 }]}
        isLoading={false}
        isError={false}
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={onLoadMore}
        onRetry={jest.fn()}
        scrollRootRef={scrollRootRef}
      />
    );

    expect(observe).toHaveBeenCalledTimes(1);
    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('다음 페이지 요청이 실패한 상태에서는 목록 끝을 관찰하지 않는다', () => {
    render(
      <VisitHistoryList
        visits={[{ visitedAt: '2026-08-23', amount: 23_000 }]}
        isLoading={false}
        isError
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={jest.fn()}
        onRetry={jest.fn()}
        scrollRootRef={{ current: document.createElement('div') }}
      />
    );

    expect(globalThis.IntersectionObserver).not.toHaveBeenCalled();
  });
});
