import { useEffect, useRef, useState } from 'react';

import { BOTTOM_SHEET_PULL_THRESHOLD_PX } from './constants';

import type { BottomSheetSnapPoint, BottomSheetSnapPoints } from './types';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

// NOTE: 클릭 과정에서도 pointerdown과 pointerup이 발생하므로, 이 값보다 적게 움직이면
// 드래그로 처리하지 않는다.
const DRAG_THRESHOLD_PX = 4;
const DEFAULT_SNAP_POINTS: BottomSheetSnapPoints = ['hidden', 'medium', 'full'];

type DragStart = {
  pointerId: number;
  pointerX: number;
  fromContent: boolean;
  pointerY: number;
  heightPx: number;
  hasDragged: boolean;
  draggedUpBy: number;
};

type SnapPointCandidate = readonly [point: BottomSheetSnapPoint, heightPx: number];

type GetDragSnapPointParams = {
  candidates: readonly SnapPointCandidate[];
  snapPoint: BottomSheetSnapPoint;
  startHeightPx: number;
  finalHeightPx: number;
  draggedUpBy: number;
  fitContent: boolean;
};

/** 종료 높이와 당긴 방향으로 다음 단계를 결정하며, DOM이나 이벤트 상태를 변경하지 않습니다. */
const getDragSnapPoint = ({
  candidates,
  snapPoint,
  startHeightPx,
  finalHeightPx,
  draggedUpBy,
  fitContent,
}: GetDragSnapPointParams): BottomSheetSnapPoint => {
  const [nearestSnapPoint] = candidates.reduce((closest, candidate) => {
    const candidateDistance = Math.abs(candidate[1] - finalHeightPx);
    const closestDistance = Math.abs(closest[1] - finalHeightPx);
    return candidateDistance < closestDistance ||
      (candidateDistance === closestDistance && candidate[0] === snapPoint)
      ? candidate
      : closest;
  });

  if (
    fitContent ||
    nearestSnapPoint !== snapPoint ||
    Math.abs(draggedUpBy) <= BOTTOM_SHEET_PULL_THRESHOLD_PX
  ) {
    return nearestSnapPoint;
  }

  const direction = Math.sign(draggedUpBy);
  const [adjacentCandidate] = candidates
    .filter(([, height]) => (height - startHeightPx) * direction > 0)
    .sort((left, right) => Math.abs(left[1] - startHeightPx) - Math.abs(right[1] - startHeightPx));

  return adjacentCandidate?.[0] ?? nearestSnapPoint;
};

type UseBottomSheetDragOptions = {
  fitContent: boolean;
  getSnapPointHeightPx: (snapPoint: BottomSheetSnapPoint) => number;
  onHandleClick?: () => void;
  onExpand?: () => void;
  onSnapPointChange?: (snapPoint: BottomSheetSnapPoint) => void;
  sheetElementRef: RefObject<HTMLDivElement | null>;
  snapPoint: BottomSheetSnapPoint;
  snapPoints?: BottomSheetSnapPoints;
};

/**
 * 바텀시트 핸들의 포인터·키보드 조작과 스냅 포인트 계산을 담당합니다.
 * 64px 넘게 당긴 경우에는 가장 가까운 높이가 현재 단계여도 당긴 방향으로 한 단계 이동합니다.
 *
 * 핸들 밖으로 포인터가 이동해도 드래그가 끊기지 않도록 동작 중에는 `window`에 리스너를 붙이고
 * 종료·취소·언마운트 시 제거합니다. iOS WebView가 드래그 직후 추가로 발생시키는 click은 한 번
 * 무시해 `onHandleClick`과 스냅 변경이 중복 실행되지 않게 합니다.
 *
 * 드래그 중 실시간 높이는 React 상태가 아니라 `sheetElementRef`에 직접(rAF로 묶어) 반영합니다.
 * 렌더링되는 높이 값(`isDragging`이 true인 동안 고정되는 드래그 시작 높이)은 드래그 도중 바뀌지
 * 않으므로, React가 같은 값을 다시 써서 이 직접 반영을 덮어쓰지 않습니다.
 *
 * @param options.fitContent - 콘텐츠 높이 고정 모드 여부입니다.
 * @param options.getSnapPointHeightPx - 각 스냅 포인트를 현재 뷰포트의 픽셀 높이로 변환합니다.
 * @param options.sheetElementRef - 드래그 중 높이를 직접 반영할 시트 루트 요소입니다.
 * @param options.snapPoints - 드래그 종료·키보드 조작 시 선택할 수 있는 단계입니다.
 * @param options.onExpand - 콘텐츠 맞춤 시트를 위로 64px 넘게 당기고 놓았을 때 실행합니다.
 */
export const useBottomSheetDrag = ({
  fitContent,
  getSnapPointHeightPx,
  onHandleClick,
  onExpand,
  onSnapPointChange,
  sheetElementRef,
  snapPoint,
  snapPoints,
}: UseBottomSheetDragOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartHeightPx, setDragStartHeightPx] = useState<number | null>(null);
  const dragStartRef = useRef<DragStart | null>(null);
  const dragHeightRef = useRef<number | null>(null);
  const pendingHeightRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const removeDragListenersRef = useRef<() => void>(() => undefined);
  const shouldIgnoreHandleClickRef = useRef(false);
  const resolvedSnapPoints = snapPoints ?? DEFAULT_SNAP_POINTS;
  const canDismissFitContent = fitContent && Boolean(snapPoints?.includes('hidden'));

  const cancelPendingHeightFlush = () => {
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    pendingHeightRef.current = null;
  };

  const flushHeight = () => {
    rafIdRef.current = null;
    const sheetElement = sheetElementRef.current;
    if (sheetElement && pendingHeightRef.current !== null) {
      sheetElement.style.height = `${pendingHeightRef.current}px`;
    }
  };

  const scheduleHeightUpdate = (heightPx: number) => {
    pendingHeightRef.current = heightPx;
    if (rafIdRef.current === null) {
      rafIdRef.current = window.requestAnimationFrame(flushHeight);
    }
  };

  useEffect(
    () => () => {
      removeDragListenersRef.current();
      cancelPendingHeightFlush();
    },
    []
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>, fromContent = false) => {
    if (event.button > 0 || event.isPrimary === false) return;
    shouldIgnoreHandleClickRef.current = false;
    if (fitContent && !canDismissFitContent && !onExpand) {
      return;
    }

    const fitContentHeightPx = sheetElementRef.current?.getBoundingClientRect().height ?? 0;
    const startHeightPx = fitContent ? fitContentHeightPx : getSnapPointHeightPx(snapPoint);

    removeDragListenersRef.current();
    dragStartRef.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX,
      fromContent,
      pointerY: event.clientY,
      heightPx: startHeightPx,
      hasDragged: false,
      draggedUpBy: 0,
    };
    dragHeightRef.current = startHeightPx;
    if (!fromContent) {
      setDragStartHeightPx(startHeightPx);
      setIsDragging(true);
    }

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
      cancelPendingHeightFlush();
      dragStartRef.current = null;
      dragHeightRef.current = null;
      setDragStartHeightPx(null);
      setIsDragging(false);

      if (isCancelled || !dragStart.hasDragged || finalHeightPx === null) {
        return;
      }

      // NOTE: iOS WebView가 드래그 직후 발생시키는 click으로 한 단계 더 이동하지 않게 한다.
      shouldIgnoreHandleClickRef.current = true;

      // 핸들과 본문 모두 같은 거리 기준으로 닫고, 짧은 드래그는 원래 단계로 복귀한다.
      if (canDismissFitContent && dragStart.draggedUpBy < 0) {
        onSnapPointChange?.(
          dragStart.draggedUpBy < -BOTTOM_SHEET_PULL_THRESHOLD_PX ? 'hidden' : snapPoint
        );
        return;
      }

      if (fitContent && dragStart.draggedUpBy > BOTTOM_SHEET_PULL_THRESHOLD_PX && onExpand) {
        onExpand();
        return;
      }

      const candidates: SnapPointCandidate[] = resolvedSnapPoints.map((point) => [
        point,
        fitContent && point !== 'hidden' ? dragStart.heightPx : getSnapPointHeightPx(point),
      ]);
      const nextSnapPoint = getDragSnapPoint({
        candidates,
        snapPoint,
        startHeightPx: dragStart.heightPx,
        finalHeightPx,
        draggedUpBy: dragStart.draggedUpBy,
        fitContent,
      });
      onSnapPointChange?.(nextSnapPoint);
    };

    function handleWindowPointerMove(pointerEvent: PointerEvent) {
      const dragStart = dragStartRef.current;
      if (!dragStart || pointerEvent.pointerId !== dragStart.pointerId) {
        return;
      }

      const draggedUpBy = dragStart.pointerY - pointerEvent.clientY;
      if (dragStart.fromContent && !dragStart.hasDragged) {
        const horizontalDistance = Math.abs(pointerEvent.clientX - dragStart.pointerX);
        if (horizontalDistance >= DRAG_THRESHOLD_PX && horizontalDistance > Math.abs(draggedUpBy)) {
          finishDrag(pointerEvent, true);
          return;
        }
        if (Math.abs(draggedUpBy) < DRAG_THRESHOLD_PX) return;
        setDragStartHeightPx(dragStart.heightPx);
        setIsDragging(true);
      }
      pointerEvent.preventDefault();
      dragStart.draggedUpBy = draggedUpBy;
      if (Math.abs(draggedUpBy) >= DRAG_THRESHOLD_PX) {
        dragStart.hasDragged = true;
      }

      const fullHeightPx = fitContent
        ? Math.max(dragStart.heightPx, onExpand ? getSnapPointHeightPx('full') : dragStart.heightPx)
        : getSnapPointHeightPx('full');
      const minimumHeightPx = fitContent
        ? canDismissFitContent
          ? 0
          : dragStart.heightPx
        : Math.min(...resolvedSnapPoints.map(getSnapPointHeightPx));
      const nextHeightPx = Math.min(
        fullHeightPx,
        Math.max(minimumHeightPx, dragStart.heightPx + draggedUpBy)
      );
      dragHeightRef.current = nextHeightPx;
      scheduleHeightUpdate(nextHeightPx);
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

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    // NOTE: detail 0은 키보드·보조기술의 클릭이므로 드래그 후에도 허용한다.
    if (shouldIgnoreHandleClickRef.current && event.detail > 0) {
      shouldIgnoreHandleClickRef.current = false;
      event.preventDefault();
      return;
    }

    shouldIgnoreHandleClickRef.current = false;
    onHandleClick?.();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (fitContent) {
      if (event.key === 'ArrowUp' && onExpand) {
        event.preventDefault();
        onExpand();
      }
      return;
    }

    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();
    const currentIndex = resolvedSnapPoints.indexOf(snapPoint);
    const baseIndex = currentIndex === -1 ? 0 : currentIndex;
    const direction = event.key === 'ArrowUp' ? 1 : -1;
    const nextIndex = Math.min(Math.max(baseIndex + direction, 0), resolvedSnapPoints.length - 1);
    const nextSnapPoint = resolvedSnapPoints[nextIndex];

    if (nextSnapPoint && nextSnapPoint !== snapPoint) {
      onSnapPointChange?.(nextSnapPoint);
    }
  };

  return {
    handleContentPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!canDismissFitContent) return;
      if (
        event.target instanceof Element &&
        event.target.closest('input, textarea, select, [contenteditable="true"]')
      )
        return;
      handlePointerDown(event, true);
    },
    handleContentClickCapture: (event: ReactMouseEvent<HTMLDivElement>) => {
      if (shouldIgnoreHandleClickRef.current && event.detail > 0) {
        shouldIgnoreHandleClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
      }
    },
    canDismissFitContent,
    dragStartHeightPx,
    handleClick,
    handleKeyDown,
    handlePointerDown,
    isDragging,
  };
};
