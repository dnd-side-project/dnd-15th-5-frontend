import { useNavigate } from 'react-router-dom';

import { TermsAgreementForm } from '@/features/auth';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { BackButton } from '@/shared/ui/back-button';

export default function AgreementPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh flex-col">
      <BackButton onClick={() => navigate(-1)} />

      <h1 className="mt-14 px-2 text-heading-01-bold text-neutral-700">
        챱챱 이용을 위한
        <br />
        약관에 동의해주세요
      </h1>

      <TermsAgreementForm onSubmit={() => navigate(ROUTE_PATHS.onboarding)} />
    </main>
  );
}
