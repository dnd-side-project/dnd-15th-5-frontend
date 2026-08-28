import { useNavigate } from 'react-router-dom';

import { MarkdownPolicyContent, TERMS_OF_SERVICE_CONTENT } from '@/features/auth';
import { BackButton } from '@/shared/ui/back-button';

export default function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh flex-col">
      <BackButton onClick={() => navigate(-1)} />

      <MarkdownPolicyContent className="mt-6" content={TERMS_OF_SERVICE_CONTENT} />
    </main>
  );
}
