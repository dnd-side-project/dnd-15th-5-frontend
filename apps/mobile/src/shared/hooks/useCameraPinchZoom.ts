import { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, Platform } from 'react-native';

import type { CameraView } from 'expo-camera';
import type { RefObject } from 'react';
import type { GestureResponderEvent, PanResponderInstance } from 'react-native';

// NOTE: 손가락 이동 거리 대비 줌 변화량. 실제 기기에서 체감 속도를 보고 조정이 필요할 수 있다.
const PINCH_ZOOM_SENSITIVITY = 0.5;
const ULTRA_WIDE_LENS_PATTERN = /ultra[ -]?wide|울트라[ -]?와이드|초광각/i;

const getTouchDistance = (touches: GestureResponderEvent['nativeEvent']['touches']) => {
  const [first, second] = touches;

  if (!first || !second) {
    return 0;
  }

  return Math.hypot(first.pageX - second.pageX, first.pageY - second.pageY);
};

/**
 * 두 손가락 핀치로 카메라 배율을 조절하고, iOS에서는 초광각 렌즈까지 이어서 전환합니다.
 *
 * 기본 렌즈에서 더 축소하면 초광각 렌즈로, 초광각에서 다시 확대하면 기본 렌즈로 돌아갑니다.
 * Android는 `selectedLens`를 지원하지 않아 배율 조절만 동작합니다.
 *
 * NOTE: `CameraView`의 `onCameraReady`에서 `loadLenses`를 호출해야 초광각 렌즈를 찾을 수 있습니다.
 * 전후면 전환처럼 카메라가 바뀌면 `reset`으로 배율과 렌즈를 초기화합니다.
 *
 * @example
 * ```tsx
 * const { zoom, selectedLens, panHandlers, loadLenses } = useCameraPinchZoom(cameraRef);
 *
 * <View style={{ flex: 1 }} {...panHandlers}>
 *   <CameraView ref={cameraRef} zoom={zoom} selectedLens={selectedLens} onCameraReady={loadLenses} />
 * </View>
 * ```
 */
export function useCameraPinchZoom(cameraRef: RefObject<CameraView | null>) {
  const [zoom, setZoom] = useState(0);
  const zoomRef = useRef(0);
  const [selectedLens, setSelectedLens] = useState<string | undefined>(undefined);
  const selectedLensRef = useRef<string | undefined>(undefined);
  const ultraWideLensRef = useRef<string | undefined>(undefined);
  const pinchStartRef = useRef<{
    distance: number;
    zoom: number;
    lens: string | undefined;
  } | null>(null);
  const [panHandlers, setPanHandlers] = useState<PanResponderInstance['panHandlers']>({});

  const updateZoom = useCallback((value: number) => {
    zoomRef.current = value;
    setZoom(value);
  }, []);

  const updateSelectedLens = useCallback((value?: string) => {
    selectedLensRef.current = value;
    setSelectedLens(value);
  }, []);

  const loadLenses = useCallback(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    // NOTE: onCameraReady는 async로 넘기면 안 된다(호출부가 반환값을 함수로 기대할 수 있다).
    // 렌즈 목록 조회는 별도로 fire-and-forget한다.
    void (async () => {
      try {
        const availableLenses = (await cameraRef.current?.getAvailableLensesAsync()) ?? [];
        ultraWideLensRef.current = availableLenses.find((lens) =>
          ULTRA_WIDE_LENS_PATTERN.test(lens)
        );
      } catch {
        // NOTE: 렌즈 목록 조회에 실패해도 기본 렌즈로는 계속 촬영할 수 있어 조용히 무시한다.
        ultraWideLensRef.current = undefined;
      }
    })();
  }, [cameraRef]);

  const reset = useCallback(() => {
    pinchStartRef.current = null;
    ultraWideLensRef.current = undefined;
    updateZoom(0);
    updateSelectedLens(undefined);
  }, [updateSelectedLens, updateZoom]);

  useEffect(() => {
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: (event) => event.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: (event) => event.nativeEvent.touches.length === 2,
      onPanResponderGrant: (event) => {
        pinchStartRef.current = {
          distance: getTouchDistance(event.nativeEvent.touches),
          zoom: zoomRef.current,
          lens: selectedLensRef.current,
        };
      },
      onPanResponderMove: (event) => {
        const pinchStart = pinchStartRef.current;

        if (!pinchStart || event.nativeEvent.touches.length !== 2 || pinchStart.distance === 0) {
          return;
        }

        const distance = getTouchDistance(event.nativeEvent.touches);
        const scale = distance / pinchStart.distance;
        const nextZoom = pinchStart.zoom + (scale - 1) * PINCH_ZOOM_SENSITIVITY;

        // NOTE: 기본 렌즈에서 계속 축소하면(줌 < 0) iOS에서만 초광각 렌즈로 전환한다.
        // 이 지점을 새 제스처 기준점으로 삼아 이어서 손가락을 움직여도 자연스럽게 이어지게 한다.
        if (pinchStart.lens === undefined && nextZoom < 0 && ultraWideLensRef.current) {
          updateSelectedLens(ultraWideLensRef.current);
          updateZoom(0);
          pinchStartRef.current = { distance, zoom: 0, lens: ultraWideLensRef.current };
          return;
        }

        // NOTE: 초광각에서 다시 확대 방향으로 돌리면 기본 렌즈로 복귀한다.
        if (
          ultraWideLensRef.current &&
          pinchStart.lens === ultraWideLensRef.current &&
          nextZoom > 0
        ) {
          updateSelectedLens(undefined);
          updateZoom(0);
          pinchStartRef.current = { distance, zoom: 0, lens: undefined };
          return;
        }

        updateZoom(Math.min(1, Math.max(0, nextZoom)));
      },
      onPanResponderRelease: () => {
        pinchStartRef.current = null;
      },
      onPanResponderTerminate: () => {
        pinchStartRef.current = null;
      },
    });

    setPanHandlers(responder.panHandlers);
  }, [updateSelectedLens, updateZoom]);

  return {
    zoom,
    selectedLens: Platform.OS === 'ios' ? selectedLens : undefined,
    panHandlers,
    loadLenses,
    reset,
  };
}
