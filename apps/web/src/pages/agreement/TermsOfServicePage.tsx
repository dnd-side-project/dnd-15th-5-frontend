import { useNavigate } from 'react-router-dom';

import { MarkdownPolicyContent, TERMS_OF_SERVICE_CONTENT } from '@/features/auth';
import PageHeader from '@/shared/layout/PageHeader';

export default function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh flex-col">
      <PageHeader onBack={() => navigate(-1)} />

      <MarkdownPolicyContent className="mt-1.5" content={TERMS_OF_SERVICE_CONTENT} />
    </main>
  );
}
