import { ANALYTICS_EVENTS } from '@chapchap/shared/analytics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { AppState } from 'react-native';

import { trackNativeAnalyticsEvent } from './nativeAnalytics';

const MILLISECONDS_PER_SECOND = 1000;

type NativeScreenMetadata = {
  screenName: string;
  screenPath: string;
};

/** 네이티브 화면의 포커스·백그라운드 진입과 이탈, 체류시간을 수집한다. */
export const useNativeScreenAnalytics = ({ screenName, screenPath }: NativeScreenMetadata) => {
  const hasEnteredRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let startedAt = Date.now();
      let isActive = true;

      const trackScreenView = (entryReason: 'route_entered' | 'visibility_restored') => {
        startedAt = Date.now();
        isActive = true;
        trackNativeAnalyticsEvent(ANALYTICS_EVENTS.screenViewed, {
          screen_name: screenName,
          screen_path: screenPath,
          entry_reason: entryReason,
        });
      };

      const trackScreenExit = (exitReason: 'focus_lost' | 'app_backgrounded') => {
        if (!isActive) return;

        isActive = false;
        trackNativeAnalyticsEvent(ANALYTICS_EVENTS.screenExited, {
          screen_name: screenName,
          screen_path: screenPath,
          duration_seconds:
            Math.round(((Date.now() - startedAt) / MILLISECONDS_PER_SECOND) * 10) / 10,
          exit_reason: exitReason,
        });
      };

      trackScreenView(hasEnteredRef.current ? 'visibility_restored' : 'route_entered');
      hasEnteredRef.current = true;

      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active' && !isActive) {
          trackScreenView('visibility_restored');
        } else if (nextAppState !== 'active') {
          trackScreenExit('app_backgrounded');
        }
      });

      return () => {
        subscription.remove();
        trackScreenExit('focus_lost');
      };
    }, [screenName, screenPath])
  );
};
