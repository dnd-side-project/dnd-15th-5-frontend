import { ANALYTICS_EVENTS, NATIVE_ANALYTICS_EVENT } from '@chapchap/shared/analytics';
import { act, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { trackAnalyticsEvent } from '@/shared/lib/analytics/mixpanel';

import AnalyticsTracker from './AnalyticsTracker';

jest.mock('@/shared/lib/analytics/mixpanel', () => ({
  ...jest.requireActual('@/shared/lib/analytics/mixpanel'),
  trackAnalyticsEvent: jest.fn(),
  trackUtTaskCompleted: jest.fn(),
}));

const mockedTrackAnalyticsEvent = jest.mocked(trackAnalyticsEvent);

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
