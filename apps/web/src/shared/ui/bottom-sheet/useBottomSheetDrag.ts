import { useEffect, useRef, useState } from 'react';

import type { BottomSheetSnapPoint, BottomSheetSnapPoints } from './types';
import type { PointerEvent as ReactPointerEvent } from 'react';

// NOTE: 클릭 과정에서도 pointerdown과 pointerup이 발생하므로, 이 값보다 적게 움직이면
// 드래그로 처리하지 않는다.
const DRAG_THRESHOLD_PX = 4;
const DEFAULT_SNAP_POINTS: BottomSheetSnapPoints = ['hidden', 'medium', 'full'];

type DragStart = {
  pointerId: number;
  pointerY: number;
  heightPx: number;
  hasDragged: boolean;
};

type UseBottomSheetDragOptions = {
  fitContent: boolean;
  getSnapPointHeightPx: (snapPoint: BottomSheetSnapPoint) => number;
  onHandleClick?: () => void;
  onSnapPointChange?: (snapPoint: BottomSheetSnapPoint) => void;
  snapPoint: BottomSheetSnapPoint;
  snapPoints?: BottomSheetSnapPoints;
};

/**
 * 바텀시트 핸들의 포인터 추적과 가장 가까운 스냅 포인트 계산을 담당합니다.
 *
 * 핸들 밖으로 포인터가 이동해도 드래그가 끊기지 않도록 동작 중에는 `window`에 리스너를 붙이고
 * 종료·취소·언마운트 시 제거합니다. iOS WebView가 드래그 직후 추가로 발생시키는 click은 한 번
 * 무시해 `onHandleClick`과 스냅 변경이 중복 실행되지 않게 합니다.
 *
 * @param options.fitContent - 콘텐츠 높이 고정 모드 여부입니다.
 * @param options.getSnapPointHeightPx - 각 스냅 포인트를 현재 뷰포트의 픽셀 높이로 변환합니다.
 * @param options.snapPoints - 드래그 종료 시 선택할 수 있는 단계입니다.
 */
export const useBottomSheetDrag = ({
  fitContent,
  getSnapPointHeightPx,
  onHandleClick,
  onSnapPointChange,
  snapPoint,
  snapPoints,
}: UseBottomSheetDragOptions) => {
  const [dragHeightPx, setDragHeightPx] = useState<number | null>(null);
  const dragStartRef = useRef<DragStart | null>(null);
  const dragHeightRef = useRef<number | null>(null);
  const removeDragListenersRef = useRef<() => void>(() => undefined);
  const shouldIgnoreHandleClickRef = useRef(false);
  const ignoreClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolvedSnapPoints = snapPoints ?? DEFAULT_SNAP_POINTS;
  const canDismissFitContent = fitContent && Boolean(snapPoints?.includes('hidden'));

  useEffect(
    () => () => {
      removeDragListenersRef.current();
      if (ignoreClickTimeoutRef.current) {
        clearTimeout(ignoreClickTimeoutRef.current);
      }
    },
    []
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (fitContent && !canDismissFitContent) {
      return;
    }

    const fitContentHeightPx =
      event.currentTarget.parentElement?.getBoundingClientRect().height ?? 0;

    removeDragListenersRef.current();
    dragStartRef.current = {
      pointerId: event.pointerId,
      pointerY: event.clientY,
      heightPx: fitContent ? fitContentHeightPx : getSnapPointHeightPx(snapPoint),
      hasDragged: false,
    };
    dragHeightRef.current = dragStartRef.current.heightPx;
    setDragHeightPx(dragStartRef.current.heightPx);

    const removeDragListeners = () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerCancel);
    };

    const finishDrag = (pointerEvent: PointerEvent, isCancelled: boolean) => {
      const dragStart = dragStartRef.current;
      const finalHeightPx = dragHeightRef.current;
      if (!dragStart || pointerEvent.pointerId !== dragStart.pointerId) {
        return;
      }

      removeDragListeners();
      removeDragListenersRef.current = () => undefined;
      dragStartRef.current = null;
      dragHeightRef.current = null;
      setDragHeightPx(null);

      if (isCancelled || !dragStart.hasDragged || finalHeightPx === null) {
        return;
      }

      // NOTE: iOS WebView가 드래그 직후 발생시키는 click으로 한 단계 더 이동하지 않게 한다.
      shouldIgnoreHandleClickRef.current = true;
      ignoreClickTimeoutRef.current = setTimeout(() => {
        shouldIgnoreHandleClickRef.current = false;
        ignoreClickTimeoutRef.current = null;
      }, 0);

      const candidates: [BottomSheetSnapPoint, number][] = resolvedSnapPoints.map((point) => [
        point,
        fitContent && point !== 'hidden' ? dragStart.heightPx : getSnapPointHeightPx(point),
      ]);
      const [nearestSnapPoint] = candidates.reduce((closest, candidate) =>
        Math.abs(candidate[1] - finalHeightPx) < Math.abs(closest[1] - finalHeightPx)
          ? candidate
          : closest
      );

      onSnapPointChange?.(nearestSnapPoint);
    };

    function handleWindowPointerMove(pointerEvent: PointerEvent) {
      const dragStart = dragStartRef.current;
      if (!dragStart || pointerEvent.pointerId !== dragStart.pointerId) {
        return;
      }

      pointerEvent.preventDefault();
      const draggedUpBy = dragStart.pointerY - pointerEvent.clientY;
      if (Math.abs(draggedUpBy) >= DRAG_THRESHOLD_PX) {
        dragStart.hasDragged = true;
      }

      const fullHeightPx = fitContent ? dragStart.heightPx : getSnapPointHeightPx('full');
      const nextHeightPx = Math.min(fullHeightPx, Math.max(0, dragStart.heightPx + draggedUpBy));
      dragHeightRef.current = nextHeightPx;
      setDragHeightPx(nextHeightPx);
    }

    function handleWindowPointerUp(pointerEvent: PointerEvent) {
      finishDrag(pointerEvent, false);
    }

    function handleWindowPointerCancel(pointerEvent: PointerEvent) {
      finishDrag(pointerEvent, true);
    }

    removeDragListenersRef.current = removeDragListeners;
    window.addEventListener('pointermove', handleWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerCancel);
  };

  const handleClick = () => {
    if (shouldIgnoreHandleClickRef.current) {
      shouldIgnoreHandleClickRef.current = false;
      return;
    }

    onHandleClick?.();
  };

  return {
    canDismissFitContent,
    dragHeightPx,
    handleClick,
    handlePointerDown,
    isDragging: dragHeightPx !== null,
  };
};
