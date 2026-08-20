import LottieView from 'lottie-react-native';
import { Image, StyleSheet, Text, View } from 'react-native';

import receiptScanAnimation from '@/shared/assets/animations/receipt-scan-blue.json';

type ReceiptScanLoadingProps = {
  imageUri: string;
};

/** 촬영 이미지를 전체 화면에 표시하고 영수증 스캔 진행 상태를 애니메이션으로 알린다. */
export default function ReceiptScanLoading({ imageUri }: ReceiptScanLoadingProps) {
  return (
    <View
      testID="receipt-scan-loading"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="영수증 인식 중"
      className="flex-1 items-center justify-center overflow-hidden bg-neutral-900"
    >
      <Image
        testID="receipt-scan-image"
        source={{ uri: imageUri }}
        resizeMode="cover"
        className="absolute inset-0 h-full w-full"
      />
      <View pointerEvents="none" className="absolute inset-0 bg-neutral-900/50" />

      <LottieView
        testID="receipt-scan-animation"
        source={receiptScanAnimation}
        autoPlay
        loop
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" className="absolute inset-x-0 bottom-28 items-center px-6">
        <Text className="mt-5 font-pretendard-semibold text-heading-02-semibold text-neutral-00">
          영수증을 인식하고 있어요
        </Text>
      </View>
    </View>
  );
}
