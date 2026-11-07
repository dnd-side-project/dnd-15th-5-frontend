import { DEFAULT_TOAST_TYPE } from '@chapchap/shared/toast';
import { cva } from 'class-variance-authority';

/** 공통 CSS와 Base UI의 전환·스와이프 상태를 조합하는 웹 Toast 스타일입니다. */
export const toastVariants = cva(
  [
    'toast-surface pointer-events-auto relative transition-[opacity,transform] duration-200',
    'data-starting-style:translate-y-2 data-starting-style:opacity-0',
    'data-ending-style:translate-y-2 data-ending-style:opacity-0',
    'data-[swipe-direction=down]:translate-y-(--toast-swipe-movement-y)',
    'data-[swipe-direction=left]:translate-x-(--toast-swipe-movement-x)',
    'data-[swipe-direction=right]:translate-x-(--toast-swipe-movement-x)',
  ],
  {
    variants: {
      type: {
        success: 'toast-neutral w-full',
        error: 'toast-neutral w-full',
        info: 'toast-primary w-fit px-7.5',
        'info-neutral': 'toast-neutral w-fit px-7.5',
        like: 'toast-neutral w-fit px-7.5',
      },
    },
    defaultVariants: {
      type: DEFAULT_TOAST_TYPE,
    },
  }
);
