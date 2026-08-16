import { useRef, useState } from 'react';

import { BOTTOM_SHEET_HEIGHT_RATIO } from './constants';

import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';

export type BottomSheetSnapPoint = 'full' | 'medium' | 'hidden';

// NOTE: 이 값보다 적게 움직이면 드래그가 아니라 클릭으로 본다. 클릭은 pointerdown→pointerup을
// 그대로 거치므로, 임계값 없이 매번 onSnapPointChange를 부르면 핸들을 그냥 클릭만 해도
// onHandleClick과 onSnapPointChange가 동시에 호출된다.
const DRAG_THRESHOLD_PX = 4;

const SNAP_POINT_HEIGHT: Record<BottomSheetSnapPoint, string> = {
  full: `${BOTTOM_SHEET_HEIGHT_RATIO.full * 100}dvh`,
  medium: `${BOTTOM_SHEET_HEIGHT_RATIO.medium * 100}dvh`,
  hidden: `${BOTTOM_SHEET_HEIGHT_RATIO.medium * 100}dvh`,
};

type BottomSheetProps = {
  snapPoint: BottomSheetSnapPoint;
  onSnapPointChange?: (snapPoint: BottomSheetSnapPoint) => void;
  onHandleClick?: () => void;
  children: ReactNode;
};

/**
 * 화면 하단에서 올라오는 공통 바텀시트입니다.
 *
 * 높이 단계(`snapPoint`)는 기본적으로 바깥에서 제어합니다(예: 다른 버튼 클릭으로 순환). 핸들을
 * 드래그하면 손가락을 따라 실시간으로 높이가 바뀌고, 손을 떼면 가장 가까운 단계로 스냅되면서
 * `onSnapPointChange`로 알립니다. `fixed` 포지션이라 모바일 프레임 폭(`max-w-120`)에 맞춰
 * 가운데 정렬됩니다.
 *
 * @example
 * ```tsx
 * import { useState } from 'react';
 * import { BottomSheet } from '@/shared/ui/bottom-sheet';
 * import type { BottomSheetSnapPoint } from '@/shared/ui/bottom-sheet';
 *
 * const [snapPoint, setSnapPoint] = useState<BottomSheetSnapPoint>('medium');
 *
 * <BottomSheet snapPoint={snapPoint} onSnapPointChange={setSnapPoint}>
 *   <p>바텀시트 내용</p>
 * </BottomSheet>
 * ```
 *
 * @param props - 바텀시트 속성입니다.
 * @param props.snapPoint - 현재 높이 단계입니다(`full` | `medium` | `hidden`).
 * @param props.onSnapPointChange - 드래그를 놓아 스냅될 때 호출됩니다. 드래그가 끝난 위치와
 * 가장 가까운 단계로 알려줍니다.
 * @param props.onHandleClick - 핸들을 클릭했을 때 호출됩니다. 클릭으로 단계를 순환시키는 등에 사용합니다.
 * @param props.children - 바텀시트 안에 표시할 내용입니다.
 */
export function BottomSheet({
  snapPoint,
  onSnapPointChange,
  onHandleClick,
  children,
}: BottomSheetProps) {
  const [dragHeightPx, setDragHeightPx] = useState<number | null>(null);
  const dragStartRef = useRef<{ pointerY: number; heightPx: number; hasDragged: boolean } | null>(
    null
  );

  const heightAtSnapPointPx = (point: BottomSheetSnapPoint) =>
    point === 'hidden' ? 0 : window.innerHeight * BOTTOM_SHEET_HEIGHT_RATIO[point];

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStartRef.current = {
      pointerY: event.clientY,
      heightPx: heightAtSnapPointPx(snapPoint),
      hasDragged: false,
    };
    setDragHeightPx(dragStartRef.current.heightPx);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragStartRef.current) {
      return;
    }

    const draggedUpBy = dragStartRef.current.pointerY - event.clientY;
    if (Math.abs(draggedUpBy) >= DRAG_THRESHOLD_PX) {
      dragStartRef.current.hasDragged = true;
    }

    const fullHeightPx = heightAtSnapPointPx('full');
    const nextHeightPx = Math.min(
      fullHeightPx,
      Math.max(0, dragStartRef.current.heightPx + draggedUpBy)
    );
    setDragHeightPx(nextHeightPx);
  };

  const handlePointerUp = () => {
    if (dragHeightPx === null || !dragStartRef.current) {
      return;
    }

    const hasDragged = dragStartRef.current.hasDragged;
    dragStartRef.current = null;
    setDragHeightPx(null);

    // NOTE: 실제로 움직인 적 없는 클릭이면 여기서 끝낸다. 뒤이어 브라우저가 발생시키는
    // click 이벤트가 onHandleClick을 부른다.
    if (!hasDragged) {
      return;
    }

    const candidates: [BottomSheetSnapPoint, number][] = [
      ['hidden', heightAtSnapPointPx('hidden')],
      ['medium', heightAtSnapPointPx('medium')],
      ['full', heightAtSnapPointPx('full')],
    ];
    const [nearestSnapPoint] = candidates.reduce((closest, candidate) =>
      Math.abs(candidate[1] - dragHeightPx) < Math.abs(closest[1] - dragHeightPx)
        ? candidate
        : closest
    );

    onSnapPointChange?.(nearestSnapPoint);
  };

  const isDragging = dragHeightPx !== null;
  const isHidden = !isDragging && snapPoint === 'hidden';

  return (
    <div
      style={{ height: isDragging ? `${dragHeightPx}px` : SNAP_POINT_HEIGHT[snapPoint] }}
      className={`fixed right-0 bottom-0 left-0 z-20 mx-auto flex max-w-120 flex-col rounded-t-30 bg-neutral-00 shadow-sheet ${
        isDragging ? '' : 'transition-all duration-300 ease-out'
      } ${isHidden ? 'translate-y-full' : 'translate-y-0'}`}
    >
      <button
        type="button"
        onClick={onHandleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-label="바텀시트 높이 조절"
        className="flex w-full shrink-0 touch-none items-center justify-center py-3"
      >
        <span className="h-1 w-10 rounded-full bg-neutral-300" aria-hidden="true" />
      </button>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
    </div>
  );
}
