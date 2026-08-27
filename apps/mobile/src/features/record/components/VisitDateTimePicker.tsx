import {
  createMonthDate,
  formatVisitDateTimeConfirmLabel,
  getCalendarDays,
  getCalendarWeekCount,
  isSameDate,
  isSameOrAfterMonth,
  VISIT_PERIODS,
  WEEKDAY_LABELS,
} from '@chapchap/shared/record';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeftIcon } from '@/shared/assets/icons';

import type { VisitDateTimeValue } from '@chapchap/shared/record';
import type { GestureResponderEvent } from 'react-native';

const SUNDAY_INDEX = 0;
const SATURDAY_INDEX = 6;
const SHEET_OFFSET = 640;
const TRANSITION_DURATION = 300;
const DRAG_CLOSE_DISTANCE = 80;
const FULL_CALENDAR_WEEK_COUNT = 6;
const CALENDAR_WEEK_HEIGHT = 40;

type VisitDateTimePickerProps = {
  value: VisitDateTimeValue;
  onClose: () => void;
  onConfirm: (value: VisitDateTimeValue) => void;
};

const getWeekdayTextClassName = (weekday: number) => {
  if (weekday === SUNDAY_INDEX) {
    return 'text-notification';
  }
  if (weekday === SATURDAY_INDEX) {
    return 'text-primary-500';
  }
  return 'text-neutral-500';
};

const getDayTextClassName = (weekday: number, selected: boolean, disabled: boolean) => {
  if (disabled) {
    return 'text-neutral-300';
  }
  if (selected) {
    return 'text-neutral-00';
  }
  if (weekday === SUNDAY_INDEX) {
    return 'text-notification';
  }
  if (weekday === SATURDAY_INDEX) {
    return 'text-primary-500';
  }
  return 'text-neutral-700';
};

/** 웹 수기 기록과 같은 규칙을 사용하는 네이티브 방문 일시 선택 바텀시트. */
export default function VisitDateTimePicker({
  value,
  onClose,
  onConfirm,
}: VisitDateTimePickerProps) {
  const insets = useSafeAreaInsets();
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  const [sheetTranslateY] = useState(() => new Animated.Value(SHEET_OFFSET));
  const [isClosing, setIsClosing] = useState(false);
  const dragStartYRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date(value.date.getFullYear(), value.date.getMonth(), value.date.getDate())
  );
  const [selectedPeriod, setSelectedPeriod] = useState(value.period);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(value.date.getFullYear(), value.date.getMonth(), 1)
  );

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isNextMonthDisabled = isSameOrAfterMonth(visibleMonth, today);
  const calendarDays = getCalendarDays(visibleMonth);
  const calendarHeightSpacer =
    Math.max(FULL_CALENDAR_WEEK_COUNT - getCalendarWeekCount(visibleMonth), 0) *
    CALENDAR_WEEK_HEIGHT;
  const calendarWeeks = Array.from(
    { length: calendarDays.length / WEEKDAY_LABELS.length },
    (_, weekIndex) => {
      const startIndex = weekIndex * WEEKDAY_LABELS.length;

      return calendarDays.slice(startIndex, startIndex + WEEKDAY_LABELS.length);
    }
  );
  const confirmLabel = formatVisitDateTimeConfirmLabel({
    date: selectedDate,
    period: selectedPeriod,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: TRANSITION_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: TRANSITION_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  }, [backdropOpacity, sheetTranslateY]);

  const closeBottomSheet = useCallback(
    (afterClose?: () => void) => {
      if (isClosing) {
        return;
      }

      setIsClosing(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: TRANSITION_DURATION,
          useNativeDriver: false,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: SHEET_OFFSET,
          duration: TRANSITION_DURATION,
          useNativeDriver: false,
        }),
      ]).start(() => {
        if (afterClose) {
          afterClose();
          return;
        }
        onClose();
      });
    },
    [backdropOpacity, isClosing, onClose, sheetTranslateY]
  );

  const resetSheetPosition = useCallback(() => {
    Animated.spring(sheetTranslateY, {
      toValue: 0,
      damping: 20,
      stiffness: 240,
      mass: 0.8,
      useNativeDriver: false,
    }).start();
  }, [sheetTranslateY]);

  const handleDragStart = useCallback(
    (event: GestureResponderEvent) => {
      dragStartYRef.current = event.nativeEvent.pageY;
      dragDistanceRef.current = 0;
      sheetTranslateY.stopAnimation(() => sheetTranslateY.setValue(0));
    },
    [sheetTranslateY]
  );

  const handleDragMove = useCallback(
    (event: GestureResponderEvent) => {
      const dragDistance = Math.max(0, event.nativeEvent.pageY - dragStartYRef.current);

      dragDistanceRef.current = dragDistance;
      sheetTranslateY.setValue(dragDistance);
    },
    [sheetTranslateY]
  );

  const handleDragEnd = useCallback(() => {
    const shouldClose = dragDistanceRef.current >= DRAG_CLOSE_DISTANCE;

    dragDistanceRef.current = 0;
    if (shouldClose) {
      closeBottomSheet();
      return;
    }

    resetSheetPosition();
  }, [closeBottomSheet, resetSheetPosition]);

  const handleDragTerminate = useCallback(() => {
    dragDistanceRef.current = 0;
    resetSheetPosition();
  }, [resetSheetPosition]);

  const handleConfirm = () => {
    closeBottomSheet(() => onConfirm({ date: selectedDate, period: selectedPeriod }));
  };

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => closeBottomSheet()}
    >
      <View
        className="flex-1 justify-end"
        accessibilityViewIsModal
        accessibilityLabel="방문 일시 선택"
      >
        <Animated.View className="absolute inset-0" style={{ opacity: backdropOpacity }}>
          <Pressable
            onPress={() => closeBottomSheet()}
            accessibilityRole="button"
            accessibilityLabel="방문 일시 선택 닫기"
            className="flex-1 bg-neutral-900/30"
          />
        </Animated.View>

        <Animated.View style={{ transform: [{ translateY: sheetTranslateY }] }}>
          <View
            className="rounded-t-32 bg-neutral-00 px-4"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <View
              testID="bottom-sheet-handle"
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={handleDragStart}
              onResponderMove={handleDragMove}
              onResponderRelease={handleDragEnd}
              onResponderTerminate={handleDragTerminate}
              onResponderTerminationRequest={() => false}
              accessible
              accessibilityRole="button"
              accessibilityLabel="바텀시트 핸들"
              accessibilityHint="아래로 드래그하여 닫기"
              onAccessibilityTap={() => closeBottomSheet()}
              className="h-6 items-center justify-center"
            >
              <View className="h-1 w-9 rounded-full bg-neutral-300" />
            </View>

            <View className="flex-row items-center justify-center gap-3 h-8">
              <Pressable
                onPress={() => setVisibleMonth((current) => createMonthDate(current, -1))}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="이전 달"
                className="h-7 w-7 items-center justify-center rounded-full"
              >
                <ChevronLeftIcon width={7} height={14} color="#4b4b4b" />
              </Pressable>

              <Text className="min-w-25 text-center font-pretendard-medium text-body-01-medium text-neutral-700">
                {year}년 {month + 1}월
              </Text>

              <Pressable
                onPress={() => setVisibleMonth((current) => createMonthDate(current, 1))}
                disabled={isNextMonthDisabled}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="다음 달"
                className="h-7 w-7 items-center justify-center rounded-full"
              >
                <View className="rotate-180">
                  <ChevronLeftIcon
                    width={7}
                    height={14}
                    color={isNextMonthDisabled ? '#e1e1e1' : '#4b4b4b'}
                  />
                </View>
              </Pressable>
            </View>

            <View className="mt-2 flex-row">
              {WEEKDAY_LABELS.map((weekday, index) => (
                <View key={weekday} className="flex-1 items-center">
                  <Text
                    className={`font-pretendard-medium text-caption-01-medium ${getWeekdayTextClassName(
                      index
                    )}`}
                  >
                    {weekday}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-1">
              {calendarWeeks.map((week, weekIndex) => (
                <View key={`week-${weekIndex}`} testID="calendar-week" className="flex-row">
                  {week.map((day, weekday) => {
                    if (day === null) {
                      return (
                        <View
                          key={`empty-${weekIndex}-${weekday}`}
                          testID="calendar-cell"
                          className="h-10 flex-1"
                        />
                      );
                    }

                    const date = new Date(year, month, day);
                    const selected = isSameDate(date, selectedDate);
                    const isFutureDate = date.getTime() > today.getTime();

                    return (
                      <View
                        key={`${year}-${month}-${day}`}
                        testID="calendar-cell"
                        className="h-10 flex-1 items-center"
                      >
                        <Pressable
                          onPress={() => setSelectedDate(date)}
                          disabled={isFutureDate}
                          accessibilityRole="button"
                          accessibilityLabel={`${year}년 ${month + 1}월 ${day}일`}
                          accessibilityState={{ selected, disabled: isFutureDate }}
                          className={`h-9 w-9 items-center justify-center rounded-32 ${
                            selected ? 'bg-primary-500' : 'bg-neutral-00'
                          }`}
                        >
                          <Text
                            className={`font-pretendard-medium text-caption-01-medium ${getDayTextClassName(
                              weekday,
                              selected,
                              isFutureDate
                            )}`}
                          >
                            {day}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            <View className="mt-4 flex-row gap-2">
              {VISIT_PERIODS.map((period) => {
                const selected = selectedPeriod === period.value;

                return (
                  <Pressable
                    key={period.value}
                    onPress={() => setSelectedPeriod(period.value)}
                    accessibilityRole="button"
                    accessibilityLabel={period.label}
                    accessibilityState={{ selected }}
                    className={`min-w-0 flex-1 items-center justify-center rounded-16 border py-2 ${
                      selected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-neutral-300 bg-neutral-00'
                    }`}
                  >
                    <Text
                      className={`font-pretendard-semibold text-body-01-semibold ${
                        selected ? 'text-neutral-00' : 'text-neutral-600'
                      }`}
                    >
                      {period.label}
                    </Text>
                    <Text
                      className={`mt-1 font-pretendard-regular text-caption-01-regular ${
                        selected ? 'text-primary-100' : 'text-neutral-500'
                      }`}
                    >
                      {period.range}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {calendarHeightSpacer > 0 && (
              <View testID="calendar-height-spacer" style={{ height: calendarHeightSpacer }} />
            )}

            <Pressable
              onPress={handleConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              className="mt-12 h-13.5 items-center justify-center rounded-full bg-primary-500"
            >
              <Text className="font-pretendard-semibold text-body-01-semibold text-neutral-00">
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
