import { router, useLocalSearchParams } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/shared/ui/back-button';

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
      <BackButton
        onPress={() => router.back()}
        style={{ marginTop: insets.top + 12 }}
        className="px-5 py-3"
      />

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
