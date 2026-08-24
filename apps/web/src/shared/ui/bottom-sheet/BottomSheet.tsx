import { useCallback, useRef } from 'react';

import { cn } from '@/shared/lib/cn';

import { BOTTOM_SHEET_HEIGHT_RATIO, BOTTOM_SHEET_TRANSITION_MS } from './constants';
import { useBottomSheetDrag } from './useBottomSheetDrag';
import { useBottomSheetVisibleHeight } from './useBottomSheetVisibleHeight';

import type { BottomSheetSnapPoint, BottomSheetSnapPoints } from './types';
import type { ReactNode, Ref } from 'react';

const SNAP_POINT_HEIGHT: Record<BottomSheetSnapPoint, string> = {
  full: `${BOTTOM_SHEET_HEIGHT_RATIO.full * 100}dvh`,
  large: `${BOTTOM_SHEET_HEIGHT_RATIO.large * 100}dvh`,
  medium: `${BOTTOM_SHEET_HEIGHT_RATIO.medium * 100}dvh`,
  hidden: `${BOTTOM_SHEET_HEIGHT_RATIO.medium * 100}dvh`,
};

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
  fullTopBoundaryPx?: number;
  onVisibleHeightChange?: (heightPx: number) => void;
};

const assignRef = <T,>(ref: Ref<T> | undefined, value: T | null) => {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
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
 * @param props.fullTopBoundaryPx - `full` 단계에서 시트 상단이 넘어가지 않을 화면 기준 Y 좌표입니다.
 * @param props.onVisibleHeightChange - 드래그·스냅·콘텐츠 변경을 반영한 실제 노출 높이를 알립니다.
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
  fullTopBoundaryPx,
  onVisibleHeightChange,
}: BottomSheetProps) {
  const sheetElementRef = useRef<HTMLDivElement>(null);
  const hasFullTopBoundary = fullTopBoundaryPx !== undefined && fullTopBoundaryPx > 0;

  const getSnapPointHeightPx = (point: BottomSheetSnapPoint) => {
    if (point === 'hidden') {
      return 0;
    }

    if (point === 'full' && hasFullTopBoundary) {
      return Math.max(0, window.innerHeight - fullTopBoundaryPx);
    }

    return window.innerHeight * BOTTOM_SHEET_HEIGHT_RATIO[point];
  };

  const { canDismissFitContent, dragHeightPx, handleClick, handlePointerDown, isDragging } =
    useBottomSheetDrag({
      fitContent,
      getSnapPointHeightPx,
      onHandleClick,
      onSnapPointChange,
      snapPoint,
      snapPoints,
    });
  const isHidden = !isDragging && snapPoint === 'hidden';
  const isHandleInteractive = !fitContent || canDismissFitContent || Boolean(onHandleClick);
  const handleClassName =
    'flex w-full shrink-0 touch-none select-none items-center justify-center py-3';
  const handleBar = <span className="h-1 w-10 rounded-full bg-neutral-300" aria-hidden="true" />;
  const heightAtSnapPoint =
    snapPoint === 'full' && hasFullTopBoundary
      ? `calc(100dvh - ${fullTopBoundaryPx}px)`
      : SNAP_POINT_HEIGHT[snapPoint];
  const handleRootRef = useCallback(
    (element: HTMLDivElement | null) => {
      sheetElementRef.current = element;
      assignRef(rootRef, element);
    },
    [rootRef]
  );

  useBottomSheetVisibleHeight({
    elementRef: sheetElementRef,
    isHidden,
    onVisibleHeightChange,
  });

  return (
    <div
      ref={handleRootRef}
      style={{
        height: isDragging ? `${dragHeightPx}px` : fitContent ? 'auto' : heightAtSnapPoint,
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
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          aria-label="바텀시트 높이 조절"
          className={cn(
            handleClassName,
            'cursor-grab rounded-t-30 outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-inset'
          )}
        >
          {handleBar}
        </button>
      ) : (
        <div className={handleClassName}>{handleBar}</div>
      )}
      <div
        className={cn(
          'px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]',
          fitContent
            ? 'shrink-0 overflow-visible'
            : 'scrollbar-hidden min-h-0 flex-1 overflow-y-auto',
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
