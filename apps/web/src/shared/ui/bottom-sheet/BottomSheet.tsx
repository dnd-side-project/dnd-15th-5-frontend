import { useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';

import { BOTTOM_SHEET_HEIGHT_RATIO, BOTTOM_SHEET_TRANSITION_MS } from './constants';

import type { PointerEvent as ReactPointerEvent, ReactNode, Ref } from 'react';

export type BottomSheetSnapPoint = 'full' | 'large' | 'medium' | 'hidden';

// NOTE: 이 값보다 적게 움직이면 드래그가 아니라 클릭으로 본다. 클릭은 pointerdown→pointerup을
// 그대로 거치므로, 임계값 없이 매번 onSnapPointChange를 부르면 핸들을 그냥 클릭만 해도
// onHandleClick과 onSnapPointChange가 동시에 호출된다.
const DRAG_THRESHOLD_PX = 4;

const SNAP_POINT_HEIGHT: Record<BottomSheetSnapPoint, string> = {
  full: `${BOTTOM_SHEET_HEIGHT_RATIO.full * 100}dvh`,
  large: `${BOTTOM_SHEET_HEIGHT_RATIO.large * 100}dvh`,
  medium: `${BOTTOM_SHEET_HEIGHT_RATIO.medium * 100}dvh`,
  hidden: `${BOTTOM_SHEET_HEIGHT_RATIO.medium * 100}dvh`,
};

type BottomSheetSnapPoints = readonly [BottomSheetSnapPoint, ...BottomSheetSnapPoint[]];

const DEFAULT_SNAP_POINTS: BottomSheetSnapPoints = ['hidden', 'medium', 'full'];

type BottomSheetProps = {
  snapPoint: BottomSheetSnapPoint;
  snapPoints?: BottomSheetSnapPoints;
  onSnapPointChange?: (snapPoint: BottomSheetSnapPoint) => void;
  onHandleClick?: () => void;
  /** 콘텐츠 높이에 맞추고 내부 스크롤을 사용하지 않습니다. `hidden` 지정 시 아래로 드래그해 닫을 수 있습니다. */
  fitContent?: boolean;
  children: ReactNode;
  contentClassName?: string;
  rootRef?: Ref<HTMLDivElement>;
};

/**
 * 화면 하단에서 올라오는 공통 바텀시트입니다.
 *
 * 높이 단계(`snapPoint`)는 기본적으로 바깥에서 제어합니다(예: 다른 버튼 클릭으로 순환). 핸들을
 * 드래그하면 손가락을 따라 실시간으로 높이가 바뀌고, 손을 떼면 가장 가까운 단계로 스냅되면서
 * `onSnapPointChange`로 알립니다. `fixed` 포지션이라 `mobile-frame` 유틸리티로 모바일 프레임 폭에 맞춰
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
 * @param props.snapPoint - 현재 높이 단계입니다(`full` | `large` | `medium` | `hidden`).
 * @param props.snapPoints - 드래그를 놓았을 때 이동할 수 있는 단계입니다.
 * @param props.onSnapPointChange - 드래그를 놓아 스냅될 때 호출됩니다. 드래그가 끝난 위치와
 * 가장 가까운 단계로 알려줍니다.
 * @param props.onHandleClick - 핸들을 클릭했을 때 호출됩니다. 클릭으로 단계를 순환시키는 등에 사용합니다.
 * @param props.fitContent - `true`이면 콘텐츠 높이에 맞추고 내부 스크롤을 사용하지 않습니다.
 * `snapPoints`에 `hidden`을 명시하면 현재 콘텐츠 높이와 숨김 단계 사이를 드래그할 수 있습니다.
 * 실제 열린 높이는 항상 콘텐츠 크기로 고정되므로 `snapPoint`는 `medium`, `large`, `full` 중
 * 무엇을 넘겨도 결과가 같고, `hidden` 여부만 의미가 있습니다.
 * @param props.children - 바텀시트 안에 표시할 내용입니다.
 * @param props.contentClassName - 콘텐츠 영역에 추가할 스타일입니다.
 * @param props.rootRef - 바텀시트 루트 요소를 참조합니다.
 */
export function BottomSheet({
  snapPoint,
  snapPoints,
  onSnapPointChange,
  onHandleClick,
  fitContent = false,
  children,
  contentClassName,
  rootRef,
}: BottomSheetProps) {
  const [dragHeightPx, setDragHeightPx] = useState<number | null>(null);
  const dragStartRef = useRef<{ pointerY: number; heightPx: number; hasDragged: boolean } | null>(
    null
  );

  const heightAtSnapPointPx = (point: BottomSheetSnapPoint) =>
    point === 'hidden' ? 0 : window.innerHeight * BOTTOM_SHEET_HEIGHT_RATIO[point];

  const resolvedSnapPoints = snapPoints ?? DEFAULT_SNAP_POINTS;
  const canDismissFitContent = fitContent && Boolean(snapPoints?.includes('hidden'));

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (fitContent && !canDismissFitContent) {
      return;
    }

    const sheetElement = event.currentTarget.parentElement;
    const fitContentHeightPx = sheetElement?.getBoundingClientRect().height ?? 0;

    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStartRef.current = {
      pointerY: event.clientY,
      heightPx: fitContent ? fitContentHeightPx : heightAtSnapPointPx(snapPoint),
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

    const fullHeightPx = fitContent ? dragStartRef.current.heightPx : heightAtSnapPointPx('full');
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

    const { hasDragged, heightPx: fitContentHeightPx } = dragStartRef.current;
    dragStartRef.current = null;
    setDragHeightPx(null);

    // NOTE: 실제로 움직인 적 없는 클릭이면 여기서 끝낸다. 뒤이어 브라우저가 발생시키는
    // click 이벤트가 onHandleClick을 부른다.
    if (!hasDragged) {
      return;
    }

    const candidates: [BottomSheetSnapPoint, number][] = resolvedSnapPoints.map((point) => [
      point,
      fitContent && point !== 'hidden' ? fitContentHeightPx : heightAtSnapPointPx(point),
    ]);
    const [nearestSnapPoint] = candidates.reduce((closest, candidate) =>
      Math.abs(candidate[1] - dragHeightPx) < Math.abs(closest[1] - dragHeightPx)
        ? candidate
        : closest
    );

    onSnapPointChange?.(nearestSnapPoint);
  };

  const handlePointerCancel = () => {
    dragStartRef.current = null;
    setDragHeightPx(null);
  };

  const isDragging = dragHeightPx !== null;
  const isHidden = !isDragging && snapPoint === 'hidden';
  const isHandleInteractive = !fitContent || canDismissFitContent || Boolean(onHandleClick);
  const handleClassName = 'flex w-full shrink-0 touch-none items-center justify-center py-3';
  const handleBar = <span className="h-1 w-10 rounded-full bg-neutral-300" aria-hidden="true" />;

  return (
    <div
      ref={rootRef}
      style={{
        height: isDragging
          ? `${dragHeightPx}px`
          : fitContent
            ? 'auto'
            : SNAP_POINT_HEIGHT[snapPoint],
        // NOTE: Tailwind duration 클래스 대신 상수를 그대로 써서, 이 값을 재사용하는
        // 다른 컴포넌트(예: useBottomSheetTransition)와 항상 같은 값을 유지한다.
        transitionDuration: `${BOTTOM_SHEET_TRANSITION_MS}ms`,
      }}
      className={cn(
        'mobile-frame fixed right-0 bottom-0 left-0 z-bottom-sheet flex flex-col rounded-t-30 bg-neutral-00 shadow-sheet',
        !isDragging && 'transition-all ease-out',
        isHidden ? 'translate-y-full' : 'translate-y-0'
      )}
    >
      {isHandleInteractive ? (
        <button
          type="button"
          onClick={onHandleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          aria-label="바텀시트 높이 조절"
          className={cn(
            handleClassName,
            'rounded-t-30 outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-inset'
          )}
        >
          {handleBar}
        </button>
      ) : (
        <div className={handleClassName}>{handleBar}</div>
      )}
      <div
        className={cn(
          'px-4 pb-4',
          fitContent ? 'shrink-0 overflow-visible' : 'min-h-0 flex-1 overflow-y-auto',
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
