import { useNavigate } from 'react-router-dom';

import { MarkdownPolicyContent, PRIVACY_POLICY_CONTENT } from '@/features/auth';
import PageHeader from '@/shared/layout/PageHeader';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh flex-col">
      <PageHeader onBack={() => navigate(-1)} />

      <MarkdownPolicyContent className="mt-1.5" content={PRIVACY_POLICY_CONTENT} />
    </main>
  );
}
