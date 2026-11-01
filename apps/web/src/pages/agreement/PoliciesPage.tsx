import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  MarkdownPolicyContent,
  PRIVACY_POLICY_CONTENT,
  TERMS_OF_SERVICE_CONTENT,
} from '@/features/auth';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import PageHeader from '@/shared/layout/PageHeader';
import { SegmentedToggle } from '@/shared/ui/segmented-toggle';

type PolicyType = 'terms' | 'privacy';

const POLICY_TABS: { id: PolicyType; label: string; content: string }[] = [
  { id: 'terms', label: '서비스 이용약관', content: TERMS_OF_SERVICE_CONTENT },
  { id: 'privacy', label: '개인정보처리방침', content: PRIVACY_POLICY_CONTENT },
];
const POLICY_OPTIONS = [
  { label: '서비스 이용약관', value: 'terms' },
  { label: '개인정보처리방침', value: 'privacy' },
] as const;

/** 마이페이지에서 이용약관과 개인정보처리방침을 전환해 읽을 수 있는 화면입니다. */
export default function PoliciesPage() {
  const navigate = useNavigate();
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>('terms');
  const policy = POLICY_TABS.find(({ id }) => id === selectedPolicy)!;

  const handleBack = () => {
    const historyIndex = window.history.state?.idx;

    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(ROUTE_PATHS.myPage, { replace: true });
  };

  return (
    <main className="flex min-h-dvh flex-col">
      <PageHeader title="이용약관 및 개인정보처리방침" onBack={handleBack} />

      <SegmentedToggle
        options={POLICY_OPTIONS}
        value={selectedPolicy}
        onValueChange={setSelectedPolicy}
        ariaLabel="정책 선택"
        className="mt-2"
      />

      <section aria-label={policy.label} className="mt-5">
        <MarkdownPolicyContent content={policy.content} />
      </section>
    </main>
  );
}
