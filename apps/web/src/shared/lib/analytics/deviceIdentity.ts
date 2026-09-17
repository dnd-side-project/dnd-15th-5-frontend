const DEVICE_ID_STORAGE_KEY = 'chapchap_analytics_device_id';

let inMemoryDeviceId: string | null = null;

const createDeviceId = () => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

/** 브라우저 프로필 또는 앱 WebView 설치 단위로 유지되는 익명 기기 식별자를 반환합니다. */
export const getOrCreateAnalyticsDeviceId = () => {
  if (inMemoryDeviceId) return inMemoryDeviceId;

  try {
    const storedDeviceId = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);

    if (storedDeviceId) {
      inMemoryDeviceId = storedDeviceId;
      return storedDeviceId;
    }

    const deviceId = createDeviceId();
    window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    inMemoryDeviceId = deviceId;
    return deviceId;
  } catch {
    inMemoryDeviceId = createDeviceId();
    return inMemoryDeviceId;
  }
};

/** 테스트 간 메모리 식별자가 공유되지 않도록 초기화합니다. */
export const resetAnalyticsDeviceIdForTest = () => {
  inMemoryDeviceId = null;
};
