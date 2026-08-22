import { useId } from 'react';

import { EmptyStateImage, ErrorStateImage } from '@/shared/assets/images/state';
import { cn } from '@/shared/lib/cn';
import { Button, LinkButton } from '@/shared/ui/button';

import type { MouseEventHandler } from 'react';
import type { To } from 'react-router-dom';

type StateViewBaseProps = {
  title: string;
  description: string;
  actionLabel: string;
  headingAs: 'h1' | 'h2' | 'h3';
  className?: string;
};

type StateViewProps = StateViewBaseProps & {
  variant: 'empty' | 'error';
} & (
    | {
        onAction: MouseEventHandler<HTMLButtonElement>;
        to?: never;
      }
    | {
        onAction?: never;
        to: To;
      }
  );

type StateViewActionProps = {
  actionLabel: string;
  onAction?: MouseEventHandler<HTMLButtonElement>;
  to?: To;
};

/**
 * 데이터가 없거나 데이터를 불러오지 못한 상태를 안내하는 공통 UI입니다.
 *
 * `empty` 이미지는 피그마의 Luminosity 블렌드 모드를 적용해 흑백으로 표시합니다.
 * 제목과 안내 문구에는 `whitespace-pre-line`을 적용해 문자열의 줄바꿈 문자(`\n`)를
 * 실제 줄바꿈으로 표시하며, `break-keep`으로 한글 단어 중간의 줄바꿈을 방지합니다.
 * 제목은 줄 길이를 균형 있게 배치하고, 안내 문구는 마지막 줄에 단어 하나만 남는 현상을 줄입니다.
 *
 * @example
 * ```tsx
 * <StateView
 *   variant="error"
 *   title="에러가 발생했어요"
 *   description={'잠시 후에\n다시 시도해주세요'}
 *   actionLabel="다시 시도하기"
 *   headingAs="h1"
 *   onAction={handleRetry}
 * />
 * ```
 *
 * @param props - Empty 또는 Error 상태 화면을 구성하는 속성입니다.
 * @param props.variant - `empty`는 기록이 없는 상태를, `error`는 오류가 발생한 상태를 표시합니다.
 * @param props.title - 상태 화면에 표시할 제목입니다. 줄바꿈 문자(`\n`)를 사용할 수 있습니다.
 * @param props.description - 상태 화면에 표시할 안내 문구입니다. 줄바꿈 문자(`\n`)를 사용할 수 있습니다.
 * @param props.actionLabel - 액션 버튼 또는 링크에 표시할 문구입니다.
 * @param props.headingAs - 페이지의 제목 구조에 맞춰 사용할 `h1`, `h2`, `h3` 태그입니다.
 * @param props.onAction - 버튼을 눌렀을 때 실행할 동작입니다. `to`와 함께 사용할 수 없습니다.
 * @param props.to - 링크를 눌렀을 때 이동할 경로입니다. `onAction`과 함께 사용할 수 없습니다.
 * @param props.className - 최상위 `section` 요소에 추가할 클래스입니다.
 */
export function StateView(props: StateViewProps) {
  const { variant, title, description, actionLabel, headingAs: Heading, className } = props;
  const titleId = useId();
  const image = variant === 'empty' ? EmptyStateImage : ErrorStateImage;

  return (
    <section
      aria-labelledby={titleId}
      className={cn('flex w-full flex-col items-center text-center', className)}
    >
      <img
        src={image}
        alt=""
        className={cn('size-30 object-contain', variant === 'empty' && 'mix-blend-luminosity')}
      />

      <Heading
        id={titleId}
        className="mt-2.5 break-keep whitespace-pre-line text-balance text-title-02-semibold text-neutral-900"
      >
        {title}
      </Heading>
      <p className="mt-2 break-keep whitespace-pre-line text-pretty text-body-02-semibold text-neutral-400">
        {description}
      </p>

      <StateViewAction actionLabel={actionLabel} onAction={props.onAction} to={props.to} />
    </section>
  );
}

function StateViewAction({ actionLabel, onAction, to }: StateViewActionProps) {
  const className = 'mt-5 rounded-08';

  if (to !== undefined) {
    return (
      <LinkButton to={to} variant="primary" size="small" className={className}>
        {actionLabel}
      </LinkButton>
    );
  }

  return (
    <Button variant="primary" size="small" className={className} onClick={onAction}>
      {actionLabel}
    </Button>
  );
}
