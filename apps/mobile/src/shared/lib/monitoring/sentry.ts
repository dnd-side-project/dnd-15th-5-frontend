import * as Sentry from '@sentry/react-native';

const SENTRY_DSN =
  'https://2720a02efa24fca508a17deeaefc2751@o4511384341905408.ingest.us.sentry.io/4511985169268736';
const IS_PRODUCTION = process.env.EXPO_PUBLIC_APP_ENV === 'production';

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: IS_PRODUCTION,
  environment: 'production',
  sendDefaultPii: false,
  enableLogs: false,
  attachScreenshot: false,
  attachViewHierarchy: false,
  integrations: [Sentry.expoRouterIntegration()],
  tracesSampleRate: 0.1,
});
