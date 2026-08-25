import { useNavigate } from 'react-router-dom';

import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { Button } from '@/shared/ui/button';

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh flex-col justify-end px-1 pb-8">
      {/* TODO: 온보딩 디자인 시안 확정 후 수정 필요 */}
      <Button onClick={() => navigate(ROUTE_PATHS.home, { replace: true })}>시작하기</Button>
    </main>
  );
}
