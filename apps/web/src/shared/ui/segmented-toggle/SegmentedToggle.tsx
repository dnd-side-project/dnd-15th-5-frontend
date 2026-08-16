import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';

import { cn } from '@/shared/lib/cn';

type SegmentedToggleOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type SegmentedToggleProps<TValue extends string> = {
  options: readonly [SegmentedToggleOption<TValue>, SegmentedToggleOption<TValue>];
  value: TValue;
  onValueChange: (value: TValue) => void;
  className?: string;
};

/**
 * 두 옵션 중 하나를 고르는 공통 세그먼트 토글입니다.
 *
 * Base UI의 ToggleGroup을 사용해 한 번에 하나만 선택되도록 강제하고, 키보드 방향키 이동을 지원합니다.
 *
 * @example
 * ```tsx
 * <SegmentedToggle
 *   options={[
 *     { label: '자주 소비한 곳', value: 'frequentShops' },
 *     { label: '소비 기록', value: 'history' },
 *   ]}
 *   value={activeTab}
 *   onValueChange={setActiveTab}
 * />
 * ```
 *
 * @param props - 토글 속성입니다.
 * @param props.options - 정확히 두 개의 옵션입니다. 각 옵션은 `label`과 `value`를 가집니다.
 * @param props.value - 현재 선택된 옵션의 값입니다.
 * @param props.onValueChange - 다른 옵션을 선택했을 때 호출됩니다. 이미 선택된 옵션을 다시 눌러도
 * 호출되지 않습니다.
 * @param props.className - 바깥 컨테이너를 확장하거나 재정의할 Tailwind CSS 클래스입니다.
 */
export function SegmentedToggle<TValue extends string>({
  options,
  value,
  onValueChange,
  className,
}: SegmentedToggleProps<TValue>) {
  const isSecondActive = value === options[1].value;

  return (
    <ToggleGroup
      value={[value]}
      onValueChange={([nextValue]: TValue[]) => {
        if (nextValue !== undefined) {
          onValueChange(nextValue);
        }
      }}
      className={cn('relative flex w-full rounded-30 bg-neutral-100 p-1', className)}
    >
      {/* NOTE: 옵션마다 배경을 따로 칠하면 색만 바뀌어서, 배경을 별도 요소로 분리해
          옆으로 미끄러지듯 이동하는 효과를 낸다. */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-30 bg-neutral-00 transition-transform duration-200 ${
          isSecondActive ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          className="relative z-10 flex-1 rounded-30 py-2.5 text-center text-body-02-semibold text-neutral-400 transition-colors duration-200 data-pressed:text-neutral-900"
        >
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
