import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeftIcon } from '@/shared/assets/icons';

/**
 * 촬영한 영수증을 확인하는 화면.
 *
 * TODO: OCR 인식 결과로 폼을 자동으로 채우는 화면을 구현한다. 지금은 촬영이 정상적으로
 * 다음 화면까지 이어지는지 확인하기 위한 자리표시자다.
 */
export default function ReceiptConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { uri } = useLocalSearchParams<{ uri: string }>();

  return (
    <View className="flex-1 bg-neutral-00">
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="이전 화면으로 돌아가기"
        style={{ marginTop: insets.top + 12 }}
        className="px-5 py-3"
      >
        {/* NOTE: react-native-svg 컴포넌트라 색은 className이 아닌 color prop으로 지정한다. #1f1f1f = neutral-700 */}
        <ChevronLeftIcon width={10} height={18} color="#1f1f1f" />
      </Pressable>

      <View className="flex-1 items-center justify-center px-6">
        {uri && (
          <Image source={{ uri }} className="aspect-3/4 w-full rounded-16" resizeMode="contain" />
        )}
        <Text className="mt-4 text-center font-pretendard-medium text-body-01-medium text-neutral-600">
          촬영 완료. OCR 확인 화면은 추후 구현됩니다.
        </Text>
      </View>
    </View>
  );
}
