import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import AppErrorFallback from '@/app/AppErrorFallback';

/** React Router가 처리한 예상하지 못한 오류를 Sentry에 기록하고 복구 화면을 표시합니다. */
export default function RouteErrorPage() {
  const error = useRouteError();

  useEffect(() => {
    if (isRouteErrorResponse(error) && error.status < 500) {
      return;
    }

    Sentry.withScope((scope) => {
      scope.setTag('error.boundary', 'react-router');
      Sentry.captureException(error);
    });
  }, [error]);

  return <AppErrorFallback />;
}
