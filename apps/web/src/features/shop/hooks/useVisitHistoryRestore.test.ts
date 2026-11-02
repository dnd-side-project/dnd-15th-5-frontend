import { renderHook } from '@testing-library/react';

import { useVisitHistoryRestore } from './useVisitHistoryRestore';

type Options = Parameters<typeof useVisitHistoryRestore>[0];

const setup = (overrides: Partial<Options> = {}) => {
  const root = document.createElement('div');
  const header = document.createElement('div');
  jest.spyOn(root, 'getBoundingClientRect').mockReturnValue({ top: 58 } as DOMRect);
  jest.spyOn(header, 'getBoundingClientRect').mockReturnValue({ height: 120 } as DOMRect);
  const options: Options = {
    scrollRootRef: { current: root },
    stickyHeaderRef: { current: header },
    scrollToConsumptionId: 196,
    scrollToDate: '2026-11-01',
    visits: [],
    loadedPageCount: 1,
    hasNextPage: false,
    isLoading: false,
    isError: false,
    isFetchNextPageError: false,
    isFetchingNextPage: false,
    onLoadMore: jest.fn(),
    ...overrides,
  };
  const addRow = (id: number, date = '2026-11-01') => {
    const row = document.createElement('li');
    row.dataset.visitId = String(id);
    row.dataset.visitDate = date;
    jest.spyOn(row, 'getBoundingClientRect').mockReturnValue({ top: 678 } as DOMRect);
    root.append(row);
    return row;
  };
  return { root, options, addRow };
};

it('같은 날짜의 다른 방문을 건너뛰고 고정 헤더 아래로 수정한 ID를 한 번 복원한다', () => {
  const { root, options, addRow } = setup();
  const other = addRow(195);
  jest.spyOn(other, 'getBoundingClientRect').mockReturnValue({ top: 300 } as DOMRect);
  addRow(196);
  const { rerender } = renderHook((props: Options) => useVisitHistoryRestore(props), {
    initialProps: options,
  });
  expect(root.scrollTop).toBe(500);
  root.scrollTop = 900;
  rerender({ ...options, visits: [{ consumptionId: 196 }] });
  expect(root.scrollTop).toBe(900);
});

it('캐시가 없으면 필요한 페이지를 순서대로 읽고 대상이 나오면 추가 조회를 멈춘다', () => {
  const { root, options, addRow } = setup({ hasNextPage: true });
  const { rerender } = renderHook((props: Options) => useVisitHistoryRestore(props), {
    initialProps: options,
  });
  expect(options.onLoadMore).toHaveBeenCalledTimes(1);
  rerender({ ...options, isFetchingNextPage: true });
  expect(options.onLoadMore).toHaveBeenCalledTimes(1);
  rerender({ ...options, loadedPageCount: 2, visits: [{ consumptionId: 195 }] });
  expect(options.onLoadMore).toHaveBeenCalledTimes(2);
  addRow(196);
  rerender({
    ...options,
    loadedPageCount: 3,
    visits: [{ consumptionId: 195 }, { consumptionId: 196 }],
  });
  expect(options.onLoadMore).toHaveBeenCalledTimes(2);
  expect(root.scrollTop).toBe(500);
});

it('빈 중간 페이지 뒤에도 다음 페이지를 읽고 수정한 방문을 복원한다', () => {
  const { root, options, addRow } = setup({ hasNextPage: true });
  const { rerender } = renderHook((props: Options) => useVisitHistoryRestore(props), {
    initialProps: options,
  });
  expect(options.onLoadMore).toHaveBeenCalledTimes(1);
  rerender({ ...options, loadedPageCount: 2 });
  expect(options.onLoadMore).toHaveBeenCalledTimes(2);
  rerender({ ...options, loadedPageCount: 2 });
  expect(options.onLoadMore).toHaveBeenCalledTimes(2);
  addRow(196);
  rerender({ ...options, loadedPageCount: 3, visits: [{ consumptionId: 196 }] });
  expect(root.scrollTop).toBe(500);
  expect(options.onLoadMore).toHaveBeenCalledTimes(2);
});

it.each([{ isError: true }, { isFetchNextPageError: true }, { hasNextPage: false }])(
  '대상이 없거나 조회에 실패해도 무한 조회하지 않는다: %p',
  (overrides) => {
    const { options } = setup({ hasNextPage: true, ...overrides });
    renderHook(() => useVisitHistoryRestore(options));
    expect(options.onLoadMore).not.toHaveBeenCalled();
  }
);

it('기록이 삭제되거나 다른 가게로 옮겨졌으면 마지막 페이지에서 날짜로 복원한다', () => {
  const { root, options, addRow } = setup();
  addRow(195);
  renderHook(() => useVisitHistoryRestore(options));
  expect(root.scrollTop).toBe(500);
});
