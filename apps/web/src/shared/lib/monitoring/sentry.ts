import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const SENTRY_DSN =
  'https://c349ec214a7b6b29a98988ff303a604d@o4511384341905408.ingest.us.sentry.io/4511985135124480';

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: import.meta.env.PROD,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.reactRouterBrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: 0.1,
  tracePropagationTargets: [/^https:\/\/chapchap\.kr\/api(?:\/|$)/],
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: {
      request: false,
      response: false,
    },
    httpBodies: [],
    urlQueryParams: false,
    graphQL: {
      document: false,
      variables: false,
    },
    genAI: {
      inputs: false,
      outputs: false,
    },
    databaseQueryData: false,
    stackFrameVariables: false,
  },
});
