import { useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

import { RouteHistoryContext } from '@/shared/lib/routeHistoryContext';

import type { PropsWithChildren } from 'react';

/** 현재 라우터에서 실제로 방문한 이력만 추적해 안전한 뒤로 가기 대상을 제공합니다. */
export default function RouteHistoryProvider({ children }: PropsWithChildren) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [history, setHistory] = useState(() => ({ entries: [location], index: 0 }));
  if (history.entries[history.index]?.key !== location.key) {
    setHistory((current) => {
      if (current.entries[current.index]?.key === location.key) return current;
      if (navigationType === 'PUSH') {
        return {
          entries: [...current.entries.slice(0, current.index + 1), location],
          index: current.index + 1,
        };
      }
      if (navigationType === 'REPLACE') {
        return {
          entries: current.entries.map((entry, index) =>
            index === current.index ? location : entry
          ),
          index: current.index,
        };
      }
      const index = current.entries.findIndex((entry) => entry.key === location.key);
      return index >= 0 ? { ...current, index } : { entries: [location], index: 0 };
    });
  }
  const previous =
    history.entries[history.index]?.key === location.key
      ? (history.entries[history.index - 1] ?? null)
      : null;
  return <RouteHistoryContext value={previous}>{children}</RouteHistoryContext>;
}
