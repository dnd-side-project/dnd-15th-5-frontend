import { Pressable } from 'react-native';

import { ChevronLeftIcon } from '@/shared/assets/icons';

import type { PressableProps } from 'react-native';

type BackButtonProps = {
  /** 버튼을 눌렀을 때 실행할 뒤로 가기 동작입니다. */
  onPress: NonNullable<PressableProps['onPress']>;
  /** 어두운 배경에서는 `light`를 사용합니다. */
  variant?: 'default' | 'light';
  className?: string;
  style?: PressableProps['style'];
  accessibilityLabel?: string;
};

/**
 * 네이티브 화면에서 이전 화면으로 이동할 때 사용하는 공통 아이콘 버튼입니다.
 *
 * Expo Router에 의존하지 않으므로 사용하는 화면에서 `router.back()` 등의 이동 동작을 전달합니다.
 */
export function BackButton({
  onPress,
  variant = 'default',
  className,
  style,
  accessibilityLabel = '이전 화면으로 돌아가기',
}: BackButtonProps) {
  const color = variant === 'light' ? '#ffffff' : '#1f1f1f';

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={className}
      style={style}
    >
      {/* NOTE: react-native-svg는 부모의 텍스트 색상을 상속하지 않아 디자인 토큰과 같은 색상을 직접 전달한다. */}
      <ChevronLeftIcon width={24} height={24} color={color} />
    </Pressable>
  );
}
