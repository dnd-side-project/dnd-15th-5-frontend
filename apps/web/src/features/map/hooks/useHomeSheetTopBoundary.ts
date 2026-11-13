import { useLayoutEffect, useRef, useState } from 'react';

const TOP_SAFE_AREA_TO_SHEET_GAP_PX = 12;

/** 상태바의 Safe Area 아래에 여백을 둔 홈 시트의 최대 확장 경계를 계산합니다. */
export const useHomeSheetTopBoundary = () => {
  const topSafeAreaRef = useRef<HTMLDivElement>(null);
  const [fullTopBoundaryPx, setFullTopBoundaryPx] = useState(TOP_SAFE_AREA_TO_SHEET_GAP_PX);

  useLayoutEffect(() => {
    const topSafeArea = topSafeAreaRef.current;
    if (!topSafeArea) return;

    const updateBoundary = () => {
      setFullTopBoundaryPx(
        topSafeArea.getBoundingClientRect().height + TOP_SAFE_AREA_TO_SHEET_GAP_PX
      );
    };

    updateBoundary();
    window.addEventListener('resize', updateBoundary);
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateBoundary);
    observer?.observe(topSafeArea);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateBoundary);
    };
  }, []);

  return { topSafeAreaRef, fullTopBoundaryPx };
};
