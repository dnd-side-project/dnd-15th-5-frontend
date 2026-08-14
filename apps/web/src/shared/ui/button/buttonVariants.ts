import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center border-0',
    'transition-colors outline-none select-none',
    'focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1',
  ],
  {
    variants: {
      variant: {
        primary: [
          'rounded-full bg-primary-500 px-6 text-body-01-semibold text-neutral-00',
          'hover:bg-primary-600 active:bg-primary-700',
          'data-disabled:bg-neutral-400',
        ],
        secondary: [
          'gap-2 rounded-16 border border-neutral-300 bg-neutral-00 text-body-01-medium text-neutral-600',
          'hover:bg-neutral-50 active:bg-neutral-100',
          'data-disabled:border-neutral-300 data-disabled:bg-neutral-100 data-disabled:text-neutral-400',
        ],
        'icon-primary': [
          'aspect-square rounded-full bg-primary-500 text-neutral-00 [&_svg]:size-6',
          'hover:bg-primary-600 active:bg-primary-700',
          'data-disabled:bg-neutral-400',
        ],
        icon: [
          'bg-transparent text-neutral-600',
          'data-disabled:bg-transparent data-disabled:text-neutral-400',
        ],
      },
      size: {
        large: 'h-13.5', //54px
        medium: 'h-11.5', //46px
        small: 'h-10 px-4', //40px
        icon: 'size-7.5 [&_svg]:size-full', //30px
      },
    },
    compoundVariants: [
      {
        variant: ['primary', 'secondary'],
        size: ['large', 'medium'],
        className: 'w-full',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'large',
    },
  }
);
