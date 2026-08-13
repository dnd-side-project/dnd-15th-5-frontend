import type { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'icon-primary' | 'icon';
export type ButtonSize = 'xlarge' | 'large' | 'medium' | 'small';

type TextButtonContentProps = {
  variant?: Extract<ButtonVariant, 'primary' | 'secondary'>;
  children: ReactNode;
  'aria-label'?: string;
};

type IconButtonContentProps = {
  variant: Extract<ButtonVariant, 'icon-primary' | 'icon'>;
  children: ReactNode;
  'aria-label': string;
};

export type ButtonContentProps = TextButtonContentProps | IconButtonContentProps;

export type ButtonStyleProps = {
  className?: string;
  size?: ButtonSize;
};
