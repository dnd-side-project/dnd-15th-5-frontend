import { act, renderHook } from '@testing-library/react';

import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('처음에는 초기값을 그대로 반환한다', () => {
    const { result } = renderHook(() => useDebouncedValue('카페', 400));

    expect(result.current).toBe('카페');
  });

  it('지연 시간이 지나기 전에는 이전 값을 유지한다', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: '카' },
    });

    rerender({ value: '카페' });
    act(() => {
      jest.advanceTimersByTime(399);
    });

    expect(result.current).toBe('카');
  });

  it('지연 시간이 지나면 최신 값으로 갱신된다', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: '카' },
    });

    rerender({ value: '카페' });
    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(result.current).toBe('카페');
  });

  it('지연 시간 안에 값이 여러 번 바뀌면 마지막 값만 반영한다', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: '카' },
    });

    rerender({ value: '카페' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    rerender({ value: '카페 신논현' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('카');

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('카페 신논현');
  });
});
