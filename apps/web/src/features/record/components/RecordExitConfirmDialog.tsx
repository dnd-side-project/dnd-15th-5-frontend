import { RECORD_EXIT_CONFIRM_TEXT } from '@chapchap/shared/record';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

type RecordExitConfirmDialogProps = {
  onExit: () => void;
  onContinue: () => void;
};

/** 작성 중인 기록을 버릴지 확인하는 웹 다이얼로그. */
export default function RecordExitConfirmDialog({
  onExit,
  onContinue,
}: RecordExitConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(prefersReducedMotion);

  useFocusTrap(dialogRef, {
    initialFocusSelector: '[data-action="continue"]',
    onEscape: onContinue,
  });
  useScrollLock();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const animationFrameId = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(animationFrameId);
  }, [prefersReducedMotion]);

  return createPortal(
    <div
      className={cn(
        'mobile-frame fixed inset-0 z-dialog flex items-center justify-center bg-neutral-900/30 px-4 transition-opacity duration-200',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-exit-title"
        aria-describedby="record-exit-description"
        className={cn(
          'w-full max-w-[361px] rounded-30 bg-neutral-00 px-4 pt-8 pb-4 transition-[opacity,transform] duration-200',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
      >
        <h2 id="record-exit-title" className="text-center text-title-01-bold text-neutral-700">
          {RECORD_EXIT_CONFIRM_TEXT.title}
        </h2>
        <p
          id="record-exit-description"
          className="mt-2 text-center text-body-01-regular text-neutral-500"
        >
          {RECORD_EXIT_CONFIRM_TEXT.description}
        </p>

        <div className="mt-8 flex gap-3">
          <Button
            variant="secondary"
            size="medium"
            onClick={onExit}
            className="h-12 w-0 min-w-0 flex-1 rounded-full border-0 bg-neutral-300 text-body-01-medium text-neutral-600 hover:bg-neutral-400 active:bg-neutral-400"
          >
            {RECORD_EXIT_CONFIRM_TEXT.exit}
          </Button>
          <Button
            data-action="continue"
            variant="secondary"
            size="medium"
            onClick={onContinue}
            className="h-12 w-0 min-w-0 flex-1 rounded-full border-0 bg-primary-500 text-body-01-medium text-neutral-00 hover:bg-primary-600 active:bg-primary-700"
          >
            {RECORD_EXIT_CONFIRM_TEXT.continue}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
