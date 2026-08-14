import { GoogleLoginButton, KakaoLoginButton } from '@/features/auth';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center">
      <div className="flex w-full flex-col gap-5">
        <KakaoLoginButton />
        <GoogleLoginButton />
      </div>
    </main>
  );
}
