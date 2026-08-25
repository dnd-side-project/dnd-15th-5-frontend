import { isOAuthCallbackUrl } from '@/native/auth';

/** OAuth callback은 WebBrowser가 처리하므로 Expo Router의 화면 이동에서는 제외합니다. */
export const redirectSystemPath = ({ path }: { path: string; initial: boolean }) =>
  isOAuthCallbackUrl(path) ? null : path;
