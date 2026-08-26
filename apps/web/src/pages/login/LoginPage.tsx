import { GoogleLoginButton, KakaoLoginButton } from '@/features/auth';
import LoginLogoImage from '@/shared/assets/images/logo-login.png';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen-safe-bottom items-center">
      <div className="flex w-full flex-col items-center gap-20">
        <img src={LoginLogoImage} alt="ChapChap" className="w-[204px]" />
        <div className="flex w-full flex-col gap-5">
          <KakaoLoginButton />
          <GoogleLoginButton />
        </div>
      </div>
    </main>
  );
}
