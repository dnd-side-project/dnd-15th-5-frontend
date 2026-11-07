import { DeleteIcon, EditIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

import { useSwipeActions } from './useSwipeActions';

import type { ReactNode } from 'react';

type SwipeActionsProps = {
  children: ReactNode;
  label: string;
  onEdit: () => void;
  onDelete: () => void;
};

/** 가로 스와이프로 수정·삭제 버튼을 노출하며 키보드 포커스와 방향키로도 조작할 수 있습니다. */
export default function SwipeActions({ children, label, onEdit, onDelete }: SwipeActionsProps) {
  const { isOpen, offset, translateX, revealProgress, groupProps, contentProps } =
    useSwipeActions();

  return (
    <div
      {...groupProps}
      role="group"
      aria-label={`${label} 기록 관리`}
      className="relative overflow-hidden rounded-08"
    >
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex w-32 items-center gap-2 pl-2 motion-reduce:transform-none!',
          offset === null &&
            'transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'
        )}
        style={{
          opacity: revealProgress,
          transform: `translateX(${(1 - revealProgress) * 12}px) scale(${0.96 + revealProgress * 0.04})`,
        }}
        inert={!isOpen}
      >
        <button
          type="button"
          aria-label={`${label} 기록 수정`}
          onClick={onEdit}
          className="grid size-14 place-items-center rounded-08 bg-primary-500 text-neutral-00 focus-visible:outline-2 focus-visible:outline-primary-700"
        >
          <EditIcon aria-hidden="true" className="size-7 [&_path]:fill-current" />
        </button>
        <button
          type="button"
          aria-label={`${label} 기록 삭제`}
          onClick={onDelete}
          className="grid size-14 place-items-center rounded-08 bg-red text-neutral-00 focus-visible:outline-2 focus-visible:outline-neutral-700"
        >
          <DeleteIcon aria-hidden="true" className="size-6" />
        </button>
      </div>
      <div
        {...contentProps}
        className={cn(
          'relative grid min-h-14 touch-pan-y items-center bg-neutral-00',
          offset === null &&
            'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'
        )}
        style={{ transform: `translateX(${translateX}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
