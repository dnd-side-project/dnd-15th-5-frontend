import { act, fireEvent, render, screen } from '@testing-library/react';

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
        isFetchNextPageError={false}
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
        isError={false}
        isFetchNextPageError
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={jest.fn()}
        onRetry={jest.fn()}
        scrollRootRef={{ current: document.createElement('div') }}
      />
    );

    expect(globalThis.IntersectionObserver).not.toHaveBeenCalled();
  });

  it('첫 페이지가 이미 있으면 다음 페이지 요청이 실패해도 기존 목록은 유지하고 하단에서 재시도할 수 있다', () => {
    const onLoadMore = jest.fn();
    render(
      <VisitHistoryList
        visits={[{ visitedAt: '2026-08-23', amount: 23_000 }]}
        isLoading={false}
        isError={false}
        isFetchNextPageError
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={onLoadMore}
        onRetry={jest.fn()}
        scrollRootRef={{ current: document.createElement('div') }}
      />
    );

    expect(screen.getByText('8월 23일')).toBeInTheDocument();
    expect(screen.queryByText('방문 기록을 불러오지 못했어요.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
