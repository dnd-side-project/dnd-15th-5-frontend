import { getOrCreateAnalyticsDeviceId, resetAnalyticsDeviceIdForTest } from './deviceIdentity';

describe('analytics device identity', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetAnalyticsDeviceIdForTest();
  });

  it('브라우저 저장소에 기기 식별자를 생성하고 재사용한다', () => {
    const firstDeviceId = getOrCreateAnalyticsDeviceId();
    const secondDeviceId = getOrCreateAnalyticsDeviceId();

    expect(firstDeviceId).toBeTruthy();
    expect(secondDeviceId).toBe(firstDeviceId);
    expect(window.localStorage.getItem('chapchap_analytics_device_id')).toBe(firstDeviceId);
  });

  it('기존 브라우저 식별자가 있으면 그대로 사용한다', () => {
    window.localStorage.setItem('chapchap_analytics_device_id', 'existing-device-id');

    expect(getOrCreateAnalyticsDeviceId()).toBe('existing-device-id');
  });
});
