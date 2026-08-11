import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

/**
 * 활성화된 시점에 포그라운드 위치 권한을 최초 한 번 요청한다.
 *
 * 권한이 거부되거나 네이티브 요청이 실패해도 요청 완료 상태로 전환해,
 * 호출 화면이 자체 오류 처리 흐름을 계속 사용할 수 있도록 한다.
 */
export const useForegroundLocationPermission = (isEnabled: boolean) => {
  const hasRequestedPermission = useRef(false);
  const [isRequestComplete, setIsRequestComplete] = useState(false);

  useEffect(() => {
    if (!isEnabled || hasRequestedPermission.current) {
      return;
    }

    hasRequestedPermission.current = true;

    const requestPermission = async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch {
        // 권한 요청 실패는 호출 화면의 렌더링을 막지 않는다.
      } finally {
        setIsRequestComplete(true);
      }
    };

    void requestPermission();
  }, [isEnabled]);

  return isRequestComplete;
};
