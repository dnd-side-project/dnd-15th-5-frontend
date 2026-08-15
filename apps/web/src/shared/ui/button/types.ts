import type { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'icon-primary' | 'icon';
export type ButtonSize = 'large' | 'medium' | 'small' | 'icon';

type TextButtonSize = Exclude<ButtonSize, 'icon'>;

type TextButtonContentProps = {
  variant?: Extract<ButtonVariant, 'primary' | 'secondary'>;
  size?: TextButtonSize;
  children: ReactNode;
  'aria-label'?: string;
};

type IconPrimaryButtonContentProps = {
  variant: Extract<ButtonVariant, 'icon-primary'>;
  size?: TextButtonSize;
  children: ReactNode;
  'aria-label': string;
};

type IconButtonContentProps = {
  variant: Extract<ButtonVariant, 'icon'>;
  size?: Extract<ButtonSize, 'icon'>;
  children: ReactNode;
  'aria-label': string;
};

export type ButtonContentProps =
  TextButtonContentProps | IconPrimaryButtonContentProps | IconButtonContentProps;

export type ButtonStyleProps = {
  className?: string;
};
