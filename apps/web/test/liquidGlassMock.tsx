import type { ComponentProps } from 'react';

type GlassWrapperProps = Pick<ComponentProps<'div'>, 'children' | 'className' | 'style'>;

/** 광학 렌더러 대신 자식과 레이아웃을 유지하는 Jest용 DOM 래퍼입니다. */
export function LiquidGlass({ children, className, style }: GlassWrapperProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

/** Scene의 자식을 동일한 DOM 트리에 유지합니다. */
export function LiquidGlassScene({ children, className, style }: GlassWrapperProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
