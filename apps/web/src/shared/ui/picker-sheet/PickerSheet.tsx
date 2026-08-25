import { useRef } from 'react';

import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { useOutsidePress } from '@/shared/hooks/useOutsidePress';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { cn } from '@/shared/lib/cn';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import type { BottomSheetSnapPoint, BottomSheetSnapPoints } from '@/shared/ui/bottom-sheet';
import { Overlay } from '@/shared/ui/overlay';

import { usePickerSheetTransition } from './usePickerSheetTransition';

import type { ReactNode } from 'react';

type ClosePickerSheet = (afterClose?: () => void) => void;

type PickerSheetRenderProps = {
  close: ClosePickerSheet;
};

type PickerSheetProps = {
  animated?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  children: ReactNode | ((props: PickerSheetRenderProps) => ReactNode);
  contentClassName?: string;
  dialogClassName?: string;
  fitContent?: boolean;
  initialFocusSelector?: string;
  onClose: () => void;
  onSnapPointChange?: (snapPoint: VisibleBottomSheetSnapPoint) => void;
  snapPoint: VisibleBottomSheetSnapPoint;
  snapPoints?: BottomSheetSnapPoints;
};

type VisibleBottomSheetSnapPoint = Exclude<BottomSheetSnapPoint, 'hidden'>;

/** 선택 UI에서 공통으로 사용하는 오버레이·접근성·전환을 포함한 바텀시트 셸입니다. */
export function PickerSheet({
  animated = false,
  ariaLabel,
  ariaLabelledBy,
  children,
  contentClassName,
  dialogClassName,
  fitContent = false,
  initialFocusSelector,
  onClose,
  onSnapPointChange,
  snapPoint,
  snapPoints,
}: PickerSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const { closePickerSheet, isVisible } = usePickerSheetTransition(onClose, animated);

  useScrollLock();
  useOutsidePress(sheetRef, closePickerSheet, isVisible);
  useFocusTrap(sheetRef, { initialFocusSelector, onEscape: closePickerSheet });

  const handleSnapPointChange = (nextSnapPoint: BottomSheetSnapPoint) => {
    if (nextSnapPoint === 'hidden') {
      closePickerSheet();
      return;
    }

    onSnapPointChange?.(nextSnapPoint);
  };

  const content = typeof children === 'function' ? children({ close: closePickerSheet }) : children;

  return (
    <>
      <Overlay
        className={cn(
          animated && 'transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <BottomSheet
        contentClassName={contentClassName}
        fitContent={fitContent}
        onSnapPointChange={handleSnapPointChange}
        rootRef={sheetRef}
        snapPoint={isVisible ? snapPoint : 'hidden'}
        snapPoints={snapPoints}
      >
        <div
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-modal="true"
          className={dialogClassName}
          role="dialog"
        >
          {content}
        </div>
      </BottomSheet>
    </>
  );
}
