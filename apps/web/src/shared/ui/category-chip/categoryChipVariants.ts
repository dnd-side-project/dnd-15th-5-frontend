import { cva } from 'class-variance-authority';

export const categoryChipVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full',
    'bg-neutral-00 text-neutral-700 outline-none select-none',
    'transition-[color,background-color,border-color,transform] duration-150 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none',
    'hover:not-data-pressed:bg-neutral-50',
    'focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1',
    'data-pressed:bg-primary-500 data-pressed:text-neutral-00',
    'data-pressed:hover:bg-primary-600',
  ],
  {
    variants: {
      variant: {
        default: [
          'border border-neutral-300 px-4 py-2 text-body-02-regular',
          'data-pressed:border-primary-500',
          'data-pressed:hover:border-primary-600',
        ],
        compact: [
          'gap-[1.5px] border-0 px-3.5 py-2 text-body-02-medium shadow-home-overlay',
          '[&_svg]:size-3.5 [&_svg]:text-primary-700',
          'data-pressed:[&_svg]:text-neutral-00',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
