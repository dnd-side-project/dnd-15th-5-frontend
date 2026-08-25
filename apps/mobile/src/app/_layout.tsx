import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ToastProvider } from '@/shared/ui/toast';

import '../global.css';

const RECEIPT_CAMERA_TOAST_BOTTOM_OFFSET = 195;
const NEUTRAL_00_COLOR = '#ffffff';

export default function RootLayout() {
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
