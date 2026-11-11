import '@/shared/lib/monitoring/sentry';

import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/app/App';
import { configureAxiosAuth } from '@/app/configureAxiosAuth';
import { configureLogoutAuthentication } from '@/app/configureLogoutAuthentication';
import ErrorPage from '@/app/ErrorPage';
import AuthProvider from '@/app/providers/AuthProvider';
import GoogleMapsProvider from '@/app/providers/GoogleMapsProvider';
import PushNotificationInitializer from '@/app/providers/PushNotificationInitializer';
import QueryProvider from '@/app/providers/QueryProvider';
import '@/app/styles/index.css';
import { initializeAnalytics } from '@/shared/lib/analytics/mixpanel';
import { ToastProvider } from '@/shared/ui/toast';

configureAxiosAuth();
configureLogoutAuthentication();
initializeAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorPage />}>
      <QueryProvider>
        <ToastProvider>
          <AuthProvider>
            <PushNotificationInitializer />
            <GoogleMapsProvider>
              <App />
            </GoogleMapsProvider>
          </AuthProvider>
        </ToastProvider>
      </QueryProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>
);
