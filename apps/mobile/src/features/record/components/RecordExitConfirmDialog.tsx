import { RECORD_EXIT_CONFIRM_TEXT, IMAGE_CHANGE_EXIT_CONFIRM_TEXT } from '@chapchap/shared/record';
import { Modal, Pressable, Text, View } from 'react-native';

type RecordExitConfirmDialogProps = {
  mode?: 'record' | 'imageChange';
  onExit: () => void;
  onContinue: () => void;
};

/** 작성 중인 기록을 버릴지 확인하는 네이티브 다이얼로그. */
export default function RecordExitConfirmDialog({
  onExit,
  onContinue,
  mode = 'record',
}: RecordExitConfirmDialogProps) {
  const text = mode === 'imageChange' ? IMAGE_CHANGE_EXIT_CONFIRM_TEXT : RECORD_EXIT_CONFIRM_TEXT;
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onContinue}
    >
      <View
        accessibilityViewIsModal
        className="z-dialog flex-1 items-center justify-center bg-neutral-900/30 px-4"
      >
        <View className="w-full max-w-[361px] rounded-30 bg-neutral-00 px-4 pt-8 pb-4">
          <Text className="text-center font-pretendard-bold text-title-01-bold text-neutral-700">
            {text.title}
          </Text>
          <Text className="mt-2 text-center font-pretendard-regular text-body-01-regular text-neutral-500">
            {text.description}
          </Text>

          <View className="mt-8 flex-row gap-3">
            <Pressable
              onPress={onExit}
              accessibilityRole="button"
              accessibilityLabel={text.exit}
              className="h-12 flex-1 items-center justify-center rounded-full bg-neutral-300"
            >
              <Text className="font-pretendard-medium text-body-01-medium text-neutral-600">
                {text.exit}
              </Text>
            </Pressable>
            <Pressable
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel={text.continue}
              className="h-12 flex-1 items-center justify-center rounded-full bg-primary-500"
            >
              <Text className="font-pretendard-medium text-body-01-medium text-neutral-00">
                {text.continue}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
