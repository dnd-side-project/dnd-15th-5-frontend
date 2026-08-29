import { useNavigate } from 'react-router-dom';

import { MarkdownPolicyContent, PRIVACY_POLICY_CONTENT } from '@/features/auth';
import { BackButton } from '@/shared/ui/back-button';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh flex-col">
      <BackButton onClick={() => navigate(-1)} />

      <MarkdownPolicyContent className="mt-6" content={PRIVACY_POLICY_CONTENT} />
    </main>
  );
}
