import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { OnboardingCarousel } from '@/features/onboarding';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLElement>(null);
  const handleExit = () => navigate(ROUTE_PATHS.home, { replace: true });

  return (
    <main
      ref={scrollContainerRef}
      className="h-[calc(100dvh-env(safe-area-inset-bottom))] overflow-x-hidden overflow-y-auto bg-neutral-00"
    >
      <div className="flex h-full min-h-160 flex-col">
        <OnboardingCarousel
          onBack={handleExit}
          onComplete={handleExit}
          scrollContainerRef={scrollContainerRef}
        />
      </div>
    </main>
  );
}
