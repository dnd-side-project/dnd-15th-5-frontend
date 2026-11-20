import { SocialLoginCallback } from '@/features/auth';

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen-safe-bottom flex items-center justify-center">
      <SocialLoginCallback />
    </main>
  );
}
