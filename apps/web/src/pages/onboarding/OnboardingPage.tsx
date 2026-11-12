import { useNavigate } from 'react-router-dom';

import { OnboardingCarousel } from '@/features/onboarding';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const handleExit = () => navigate(ROUTE_PATHS.home, { replace: true });

  return (
    <main className="flex h-[calc(100dvh-env(safe-area-inset-bottom))] min-h-[480px] flex-col overflow-hidden bg-neutral-00">
      <OnboardingCarousel onBack={handleExit} onComplete={handleExit} />
    </main>
  );
}
