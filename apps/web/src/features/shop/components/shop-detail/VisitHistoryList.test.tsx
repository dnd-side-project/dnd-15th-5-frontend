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

  it('방문 날짜로 액션 이름을 구분하고 수정·삭제에 해당 행의 ID를 전달한다', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 27));
    try {
      const onEditRecord = jest.fn();
      const onDeleteRecord = jest.fn();
      render(
        <VisitHistoryList
          visits={[
            { consumptionId: 1, visitedAt: '2026-08-23T12:00:00' },
            { consumptionId: 2, visitedAt: '2026-08-22T12:00:00' },
          ]}
          placeName="테스트 카페"
          onEditRecord={onEditRecord}
          onDeleteRecord={onDeleteRecord}
          isLoading={false}
          isError={false}
          isFetchNextPageError={false}
          hasNextPage={false}
          isFetchingNextPage={false}
          onLoadMore={jest.fn()}
          onRetry={jest.fn()}
          scrollRootRef={{ current: null }}
        />
      );
      fireEvent.keyDown(screen.getByRole('group', { name: '테스트 카페 8월 23일 기록 관리' }), {
        key: 'ArrowLeft',
      });
      fireEvent.click(screen.getByRole('button', { name: '테스트 카페 8월 23일 기록 수정' }));
      fireEvent.keyDown(screen.getByRole('group', { name: '테스트 카페 8월 22일 기록 관리' }), {
        key: 'ArrowLeft',
      });
      fireEvent.click(screen.getByRole('button', { name: '테스트 카페 8월 22일 기록 삭제' }));
      expect(onEditRecord).toHaveBeenCalledWith(1, '2026-08-23');
      expect(onDeleteRecord).toHaveBeenCalledWith(2);
    } finally {
      jest.useRealTimers();
    }
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
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 27));

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

    expect(screen.getByText('8월 23일')).not.toHaveAttribute('datetime');
    expect(screen.queryByText('방문 기록을 불러오지 못했어요.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('올해가 아닌 방문 기록에는 연도를 함께 표시한다', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 27));

    render(
      <VisitHistoryList
        visits={[{ visitedAt: '2025-08-23', amount: 23_000 }]}
        isLoading={false}
        isError={false}
        isFetchNextPageError={false}
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={jest.fn()}
        onRetry={jest.fn()}
        scrollRootRef={{ current: document.createElement('div') }}
      />
    );

    expect(screen.getByText('2025년 8월 23일')).toBeInTheDocument();

    jest.useRealTimers();
  });
  it('각 방문 기록 ID를 스티커 렌더러에 전달한다', () => {
    const renderVisitSticker = jest.fn((id: number) => (
      <img alt={`기록 ${id} 스티커`} src={`sticker-${id}.png`} />
    ));
    render(
      <VisitHistoryList
        visits={[
          { consumptionId: 1, visitedAt: '2026-08-23', amount: 5000 },
          { consumptionId: 2, visitedAt: '2026-08-22', amount: 6000 },
        ]}
        placeName="테스트 카페"
        renderVisitSticker={renderVisitSticker}
        isLoading={false}
        isError={false}
        isFetchNextPageError={false}
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={jest.fn()}
        onRetry={jest.fn()}
        scrollRootRef={{ current: null }}
      />
    );
    expect(renderVisitSticker).toHaveBeenCalledWith(1);
    expect(renderVisitSticker).toHaveBeenCalledWith(2);
    expect(screen.getByAltText('기록 1 스티커')).toHaveAttribute('src', 'sticker-1.png');
    expect(screen.getByAltText('기록 2 스티커')).toHaveAttribute('src', 'sticker-2.png');
  });
});
