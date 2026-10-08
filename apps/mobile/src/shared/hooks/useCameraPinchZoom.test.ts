import { act, renderHook } from '@testing-library/react-native';
import { PanResponder, Platform } from 'react-native';

import { useCameraPinchZoom } from './useCameraPinchZoom';

import type { CameraView } from 'expo-camera';
import type { GestureResponderEvent, PanResponderCallbacks } from 'react-native';

const ULTRA_WIDE_LENS = 'Back Ultra Wide Camera';

const createPinchEvent = (distance: number) =>
  ({
    nativeEvent: {
      touches: [
        { pageX: 0, pageY: 0 },
        { pageX: distance, pageY: 0 },
      ],
    },
  }) as unknown as GestureResponderEvent;

const renderPinchZoom = async () => {
  let callbacks: PanResponderCallbacks = {};
  jest.spyOn(PanResponder, 'create').mockImplementation((config) => {
    callbacks = config;
    return { panHandlers: {}, getInteractionHandle: () => null };
  });
  const cameraRef = {
    current: {
      getAvailableLensesAsync: jest.fn().mockResolvedValue(['Back Camera', ULTRA_WIDE_LENS]),
    } as unknown as CameraView,
  };
  const hook = await renderHook(() => useCameraPinchZoom(cameraRef));
  const pinch = (from: number, to: number) =>
    act(async () => {
      callbacks.onPanResponderGrant?.(createPinchEvent(from), {} as never);
      callbacks.onPanResponderMove?.(createPinchEvent(to), {} as never);
      callbacks.onPanResponderRelease?.(createPinchEvent(to), {} as never);
    });

  return { ...hook, cameraRef, pinch };
};

afterEach(() => {
  jest.restoreAllMocks();
  Platform.OS = 'ios';
});

it('두 손가락을 벌리면 배율을 높인다', async () => {
  const { result, pinch } = await renderPinchZoom();

  await pinch(100, 200);

  expect(result.current.zoom).toBe(0.5);
  expect(result.current.selectedLens).toBeUndefined();
});

it('iOS 기본 렌즈에서 더 축소하면 초광각 렌즈로 전환하고 다시 확대하면 돌아온다', async () => {
  Platform.OS = 'ios';
  const { result, cameraRef, pinch } = await renderPinchZoom();

  // NOTE: 렌즈 목록 조회가 끝날 때까지 기다린 뒤 제스처를 시작한다.
  await act(async () => result.current.loadLenses());
  expect(cameraRef.current.getAvailableLensesAsync).toHaveBeenCalled();
  await pinch(200, 100);

  expect(result.current.selectedLens).toBe(ULTRA_WIDE_LENS);
  expect(result.current.zoom).toBe(0);

  await pinch(100, 200);

  expect(result.current.selectedLens).toBeUndefined();
});

it('카메라를 전환하면 배율과 렌즈를 초기화한다', async () => {
  const { result, pinch } = await renderPinchZoom();

  await pinch(100, 200);
  await act(async () => result.current.reset());

  expect(result.current.zoom).toBe(0);
  expect(result.current.selectedLens).toBeUndefined();
});

it('Android에서는 렌즈 목록을 조회하지 않는다', async () => {
  Platform.OS = 'android';
  const { result, cameraRef } = await renderPinchZoom();

  await act(async () => result.current.loadLenses());

  expect(cameraRef.current.getAvailableLensesAsync).not.toHaveBeenCalled();
});
