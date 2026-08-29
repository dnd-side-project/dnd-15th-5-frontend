import '@/shared/lib/monitoring/sentry';

import * as Sentry from '@sentry/react-native';
import { ErrorBoundary as ExpoRouterErrorBoundary, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ToastProvider } from '@/shared/ui/toast';

import '../global.css';

const RECEIPT_CAMERA_TOAST_BOTTOM_OFFSET = 195;
const NEUTRAL_00_COLOR = '#ffffff';

function RootLayout() {
  const pathname = usePathname();
  const isReceiptCamera = pathname === '/camera';

  return (
    <ToastProvider
      bottomOffset={isReceiptCamera ? RECEIPT_CAMERA_TOAST_BOTTOM_OFFSET : undefined}
      includeBottomSafeArea={!isReceiptCamera}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          // NOTE: React Navigation 옵션에는 className을 쓸 수 없어 neutral-00 값을 전달한다.
          contentStyle: { backgroundColor: NEUTRAL_00_COLOR },
        }}
      />
      <StatusBar style={isReceiptCamera ? 'light' : 'dark'} />
    </ToastProvider>
  );
}

export const ErrorBoundary = Sentry.wrapExpoRouterErrorBoundary(ExpoRouterErrorBoundary);

export default Sentry.wrap(RootLayout);
