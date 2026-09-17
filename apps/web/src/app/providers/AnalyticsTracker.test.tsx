import { ANALYTICS_EVENTS, NATIVE_ANALYTICS_EVENT } from '@chapchap/shared/analytics';
import { act, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { trackAnalyticsEvent } from '@/shared/lib/analytics/mixpanel';
import { notifyNative } from '@/shared/lib/bridge';

import AnalyticsTracker from './AnalyticsTracker';

jest.mock('@/shared/lib/analytics/mixpanel', () => ({
  ...jest.requireActual('@/shared/lib/analytics/mixpanel'),
  trackAnalyticsEvent: jest.fn(),
  trackUtTaskCompleted: jest.fn(),
}));
jest.mock('@/shared/lib/bridge', () => ({ notifyNative: jest.fn() }));

const mockedTrackAnalyticsEvent = jest.mocked(trackAnalyticsEvent);
const mockedNotifyNative = jest.mocked(notifyNative);

describe('<AnalyticsTracker />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('검증된 네이티브 이벤트를 mobile 속성과 함께 Mixpanel로 전달한다', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AnalyticsTracker />
      </MemoryRouter>
    );
    expect(mockedNotifyNative).toHaveBeenCalledWith('analyticsReady', {});
    mockedTrackAnalyticsEvent.mockClear();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(NATIVE_ANALYTICS_EVENT, {
          detail: {
            eventName: ANALYTICS_EVENTS.stepCompleted,
            properties: {
              screen_name: 'REC_ReceiptConfirm',
              completion_reason: 'record_created',
            },
          },
        })
      );
    });

    expect(mockedTrackAnalyticsEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.stepCompleted, {
      screen_name: 'REC_ReceiptConfirm',
      completion_reason: 'record_created',
      app: 'mobile',
    });
  });

  it('숨겨진 문서에서는 진입을 기록하지 않고 처음 보일 때부터 체류시간을 측정한다', () => {
    const visibilityState = jest
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('hidden');

    render(
      <MemoryRouter initialEntries={['/home']}>
        <AnalyticsTracker />
      </MemoryRouter>
    );

    expect(mockedTrackAnalyticsEvent).not.toHaveBeenCalledWith(
      ANALYTICS_EVENTS.screenViewed,
      expect.anything()
    );

    visibilityState.mockReturnValue('visible');
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(mockedTrackAnalyticsEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.screenViewed, {
      screen_name: 'MAP_Main',
      screen_path: '/home',
      entry_reason: 'route_entered',
    });

    visibilityState.mockRestore();
  });

  it('허용하지 않은 네이티브 이벤트는 무시한다', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <AnalyticsTracker />
      </MemoryRouter>
    );
    mockedTrackAnalyticsEvent.mockClear();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(NATIVE_ANALYTICS_EVENT, {
          detail: { eventName: 'Arbitrary Event', properties: { value: 'secret' } },
        })
      );
    });

    expect(mockedTrackAnalyticsEvent).not.toHaveBeenCalled();
  });
});
