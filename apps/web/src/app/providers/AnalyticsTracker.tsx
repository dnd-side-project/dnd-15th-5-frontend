import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import {
  ANALYTICS_EVENTS,
  trackAnalyticsEvent,
  trackUtTaskCompleted,
} from '@/shared/lib/analytics/mixpanel';
import { getScreenMetadata } from '@/shared/lib/analytics/screens';

const MILLISECONDS_PER_SECOND = 1000;

/** SPA 라우트 진입·이탈과 포그라운드 체류시간을 공통 이벤트로 수집합니다. */
export default function AnalyticsTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    const screen = getScreenMetadata(pathname);
    let startedAt = performance.now();
    let isActive = true;

    const trackScreenView = (entryReason: 'route_entered' | 'visibility_restored') => {
      startedAt = performance.now();
      isActive = true;
      trackAnalyticsEvent(ANALYTICS_EVENTS.screenViewed, {
        screen_name: screen.screenName,
        screen_path: screen.screenPath,
        entry_reason: entryReason,
      });

      if (entryReason === 'route_entered' && screen.utCompletionTarget) {
        trackUtTaskCompleted(screen.utCompletionTarget);
      }
    };

    const trackScreenExit = (
      exitReason: 'route_changed' | 'page_hidden' | 'component_unmounted'
    ) => {
      if (!isActive) return;

      isActive = false;
      trackAnalyticsEvent(
        ANALYTICS_EVENTS.screenExited,
        {
          screen_name: screen.screenName,
          screen_path: screen.screenPath,
          duration_seconds:
            Math.round(((performance.now() - startedAt) / MILLISECONDS_PER_SECOND) * 10) / 10,
          exit_reason: exitReason,
        },
        { transport: 'sendBeacon' }
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackScreenExit('page_hidden');
      } else if (!isActive) {
        trackScreenView('visibility_restored');
      }
    };

    trackScreenView('route_entered');
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      trackScreenExit(
        document.visibilityState === 'hidden' ? 'component_unmounted' : 'route_changed'
      );
    };
  }, [pathname]);

  return null;
}
