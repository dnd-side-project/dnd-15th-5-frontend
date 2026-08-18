import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ToastProvider } from '@/shared/ui/toast';

import '../global.css';

export default function RootLayout() {
  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ToastProvider>
  );
}
