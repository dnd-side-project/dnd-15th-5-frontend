import { useNavigate } from 'react-router-dom';

import { OnboardingCarousel } from '@/features/onboarding';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const handleExit = () => navigate(ROUTE_PATHS.home, { replace: true });

  return (
    <main className="min-h-screen-safe-bottom flex flex-col overflow-hidden pb-6">
      <OnboardingCarousel onBack={handleExit} onComplete={handleExit} />
    </main>
  );
}
