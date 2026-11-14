import { renderHook } from '@testing-library/react';
import { createRef } from 'react';

import { useScrollToTop } from './useScrollToTop';

describe('useScrollToTop', () => {
  it('변경 기준이 바뀔 때만 문서 스크롤을 초기화한다', () => {
    const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    try {
      const { rerender } = renderHook(({ path }) => useScrollToTop(path), {
        initialProps: { path: '/home' },
      });

      expect(scrollTo).toHaveBeenCalledWith(0, 0);
      scrollTo.mockClear();
      rerender({ path: '/home' });
      expect(scrollTo).not.toHaveBeenCalled();
      rerender({ path: '/report' });
      expect(scrollTo).toHaveBeenCalledTimes(1);
      expect(scrollTo).toHaveBeenCalledWith(0, 0);
    } finally {
      scrollTo.mockRestore();
    }
  });

  it('전달한 컨테이너가 아직 없으면 문서 스크롤을 변경하지 않는다', () => {
    const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    try {
      const ref = createRef<HTMLElement>();
      renderHook(() => useScrollToTop(0, ref));
      expect(scrollTo).not.toHaveBeenCalled();
    } finally {
      scrollTo.mockRestore();
    }
  });
});
