import {
  createInitialVisitDateTime,
  formatAmount,
  formatVisitDateTime,
  RECORD_CATEGORIES,
  sanitizeAmount,
  validateRecordRequiredFields,
} from '@chapchap/shared/record';
import { useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RECEIPT_BACK_BUTTON_SAFE_AREA_OFFSET } from '@/features/record/constants';
import type { ReceiptDraft, ReceiptReviewState } from '@/features/record/types';
import { CalendarIcon, CloseIcon, LocationPinIcon, StoreIcon } from '@/shared/assets/icons';
import { BackButton } from '@/shared/ui/back-button';

import RecordExitConfirmDialog from './RecordExitConfirmDialog';
import VisitDateTimePicker from './VisitDateTimePicker';

import type { RecordCategory, VisitDateTimeValue } from '@chapchap/shared/record';
import type { ReactNode } from 'react';

type ReceiptReviewFormProps = {
  receiptUri: string;
  initialReceiptImageId?: number | null;
  initialShopId?: string | null;
  initialShopName?: string;
  initialShopAddress?: string;
  initialShopPhotoUrl?: string | null;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  initialVisitDateTime?: VisitDateTimeValue;
  initialAmount?: string;
  initialCategory?: RecordCategory;
  onBack: () => void;
  onClose: () => void;
  onChangeShop?: (state: ReceiptReviewState) => void;
  onSubmit?: (draft: ReceiptDraft) => void;
  isSubmitting?: boolean;
};

type RequiredFieldProps = {
  label: string;
  children: ReactNode;
};

function RequiredField({ label, children }: RequiredFieldProps) {
  return (
    <View>
      <View className="flex-row items-center">
        <Text className="font-pretendard-semibold text-body-02-semibold text-notification">*</Text>
        <Text className="ml-1 font-pretendard-semibold text-body-02-semibold text-neutral-700">
          {label}
        </Text>
      </View>
      <View className="mt-2">{children}</View>
    </View>
  );
}

/** 촬영한 영수증과 인식 결과를 확인하고 수정하는 폼. */
export default function ReceiptReviewForm({
  receiptUri,
  initialReceiptImageId = null,
  initialShopId = null,
  initialShopName = '',
  initialShopAddress = '',
  initialShopPhotoUrl = null,
  initialLatitude = null,
  initialLongitude = null,
  initialVisitDateTime,
  initialAmount = '',
  initialCategory,
  onBack,
  onClose,
  onChangeShop,
  onSubmit,
  isSubmitting = false,
}: ReceiptReviewFormProps) {
  const insets = useSafeAreaInsets();
  const shopName = initialShopName;
  const shopAddress = initialShopAddress;
  const [isShopPhotoError, setIsShopPhotoError] = useState(false);
  const [prevShopPhotoUrl, setPrevShopPhotoUrl] = useState(initialShopPhotoUrl);

  if (initialShopPhotoUrl !== prevShopPhotoUrl) {
    setPrevShopPhotoUrl(initialShopPhotoUrl);
    setIsShopPhotoError(false);
  }

  const [visitDateTime, setVisitDateTime] = useState<VisitDateTimeValue>(
    () => initialVisitDateTime ?? createInitialVisitDateTime()
  );
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [amount, setAmount] = useState(() => sanitizeAmount(initialAmount));
  const [category, setCategory] = useState<RecordCategory>(initialCategory ?? RECORD_CATEGORIES[0]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const { isShopValid, isAmountValid, canSubmit } = validateRecordRequiredFields({
    hasShop:
      shopName.trim().length > 0 &&
      shopAddress.trim().length > 0 &&
      Boolean(initialShopId) &&
      initialLatitude !== null &&
      initialLongitude !== null,
    amount,
  });
  const hasShopError = !isShopValid;
  const hasAmountError = hasAttemptedSubmit && !isAmountValid;
  const hasRequiredFieldError = hasAttemptedSubmit && !canSubmit;
  const isSubmitUnavailable = canSubmit && !onSubmit;

  const handleSubmit = () => {
    setHasAttemptedSubmit(true);

    if (!canSubmit || !onSubmit || isSubmitting) {
      return;
    }

    onSubmit({
      receiptImageId: initialReceiptImageId,
      shopId: initialShopId,
      shopName: shopName.trim(),
      shopAddress: shopAddress.trim(),
      shopPhotoUrl: initialShopPhotoUrl,
      latitude: initialLatitude,
      longitude: initialLongitude,
      visitDateTime,
      amount,
      category,
      receiptUri,
    });
  };

  const handleChangeShop = () => {
    onChangeShop?.({
      receiptImageId: initialReceiptImageId,
      shopId: initialShopId,
      shopName: shopName.trim(),
      shopAddress: shopAddress.trim(),
      shopPhotoUrl: initialShopPhotoUrl,
      latitude: initialLatitude,
      longitude: initialLongitude,
      visitDateTime,
      amount,
      category,
      receiptUri,
    });
  };

  return (
    <>
      <KeyboardAvoidingView
        className="flex-1 bg-neutral-00"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 32 }}
        >
          <View
            testID="receipt-review-content"
            className="flex-1 px-4"
            style={{ paddingTop: insets.top + RECEIPT_BACK_BUTTON_SAFE_AREA_OFFSET }}
          >
            <View className="flex-row items-center justify-between">
              <BackButton onPress={onBack} disabled={isSubmitting} />
              <Pressable
                onPress={() => setIsExitConfirmOpen(true)}
                disabled={isSubmitting}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="기록 닫고 홈으로 이동"
                className="h-6 w-6 items-center justify-center"
              >
                {/* #1f1f1f = neutral-700 */}
                <CloseIcon width={14} height={14} color="#1f1f1f" />
              </Pressable>
            </View>

            <Text className="mt-6 font-pretendard-semibold text-heading-02-semibold text-neutral-700">
              정보가 정확하게 인식되었나요?
            </Text>

            <View
              testID="shop-field"
              className={`relative mt-8 flex-row items-center rounded-16 border p-2 pr-16 ${
                hasShopError ? 'border-notification' : 'border-neutral-300'
              }`}
            >
              {initialShopPhotoUrl && !isShopPhotoError ? (
                <Image
                  source={{ uri: initialShopPhotoUrl }}
                  accessibilityLabel="가게 사진"
                  className="h-15 w-15 rounded-08 bg-neutral-100"
                  resizeMode="cover"
                  onError={() => setIsShopPhotoError(true)}
                />
              ) : (
                <View
                  accessibilityLabel="가게 사진 없음"
                  className="h-15 w-15 items-center justify-center rounded-08 bg-neutral-100"
                >
                  <StoreIcon width={30} height={30} />
                </View>
              )}
              <View className="ml-4 min-w-0 flex-1">
                <Text
                  accessibilityLabel="가게 이름"
                  numberOfLines={1}
                  className={`font-pretendard-medium text-body-01-medium ${
                    isShopValid ? 'text-neutral-700' : 'text-notification'
                  }`}
                >
                  {isShopValid ? shopName : '가게를 찾지 못했습니다'}
                </Text>
                <View className="mt-2 flex-row items-center gap-0.5">
                  <LocationPinIcon width={9} height={12} color="#cacaca" />
                  <Text
                    accessibilityLabel="가게 주소"
                    numberOfLines={1}
                    className="min-w-0 flex-1 font-pretendard-regular text-body-02-regular text-neutral-500"
                  >
                    {isShopValid ? shopAddress : '가게 정보를 변경해주세요'}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  handleChangeShop();
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="가게 정보 변경"
                className="absolute bottom-2 right-2 top-2 z-10 w-12 items-center justify-center"
              >
                <Text className="font-pretendard-regular text-body-02-regular text-primary-500">
                  변경
                </Text>
              </Pressable>
            </View>

            <View className="mt-8">
              <RequiredField label="방문 일시">
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsDateTimePickerOpen(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`방문 일시 변경, ${formatVisitDateTime(visitDateTime)}`}
                  className="flex-row items-center justify-between rounded-08 border border-neutral-300 p-4"
                >
                  <Text className="font-pretendard-regular text-body-01-regular text-neutral-700">
                    {formatVisitDateTime(visitDateTime)}
                  </Text>
                  <CalendarIcon width={20} height={20} />
                </Pressable>
              </RequiredField>
            </View>

            <View className="mt-8">
              <RequiredField label="금액">
                <View
                  testID="amount-field"
                  className={`flex-row items-center rounded-08 border p-4 ${
                    hasAmountError ? 'border-notification' : 'border-neutral-300'
                  }`}
                >
                  <TextInput
                    accessibilityLabel="금액"
                    aria-invalid={hasAmountError}
                    inputMode="numeric"
                    keyboardType="number-pad"
                    placeholder="금액을 입력해주세요"
                    placeholderTextColor="#8e8e8e"
                    value={formatAmount(amount)}
                    onChangeText={(value) => setAmount(sanitizeAmount(value))}
                    className="min-w-0 flex-1 p-0 font-pretendard-regular text-body-01-regular text-neutral-700"
                  />
                  <Text className="ml-2 font-pretendard-semibold text-body-01-semibold text-neutral-700">
                    원
                  </Text>
                </View>
              </RequiredField>
            </View>

            <View className="mt-8">
              <RequiredField label="카테고리">
                <View className="flex-row flex-wrap gap-2">
                  {RECORD_CATEGORIES.map((recordCategory) => {
                    const selected = category === recordCategory;

                    return (
                      <Pressable
                        key={recordCategory}
                        onPress={() => setCategory(recordCategory)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        className={`items-center justify-center rounded-16 border px-4 py-2 ${
                          selected
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-neutral-300 bg-neutral-00'
                        }`}
                      >
                        <Text
                          className={`font-pretendard-regular text-body-02-regular ${
                            selected ? 'text-neutral-00' : 'text-neutral-700'
                          }`}
                        >
                          {recordCategory}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </RequiredField>
            </View>

            <View className="mt-auto pt-12">
              {hasRequiredFieldError && (
                <Text
                  accessibilityRole="alert"
                  className="mb-4 text-center font-pretendard-regular text-body-02-regular text-notification"
                >
                  필수항목을 작성해주세요
                </Text>
              )}
              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitUnavailable || isSubmitting}
                accessibilityRole="button"
                accessibilityLabel={
                  isSubmitting
                    ? '기록 저장 중'
                    : isSubmitUnavailable
                      ? '기록 기능 준비 중'
                      : '기록하기'
                }
                className={`h-13.5 items-center justify-center rounded-full ${
                  canSubmit && !isSubmitUnavailable && !isSubmitting
                    ? 'bg-primary-500'
                    : 'bg-neutral-400'
                }`}
              >
                <Text className="font-pretendard-semibold text-body-01-semibold text-neutral-00">
                  {isSubmitting
                    ? '기록 중...'
                    : isSubmitUnavailable
                      ? '기록 기능 준비 중'
                      : '기록하기'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isDateTimePickerOpen && (
        <VisitDateTimePicker
          value={visitDateTime}
          onClose={() => setIsDateTimePickerOpen(false)}
          onConfirm={(nextValue) => {
            setVisitDateTime(nextValue);
            setIsDateTimePickerOpen(false);
          }}
        />
      )}

      {isExitConfirmOpen && (
        <RecordExitConfirmDialog onExit={onClose} onContinue={() => setIsExitConfirmOpen(false)} />
      )}
    </>
  );
}
