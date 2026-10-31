import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  MarkdownPolicyContent,
  PRIVACY_POLICY_CONTENT,
  TERMS_OF_SERVICE_CONTENT,
} from '@/features/auth';
import PageHeader from '@/shared/layout/PageHeader';

type PolicyType = 'terms' | 'privacy';

const POLICY_TABS: { id: PolicyType; label: string; content: string }[] = [
  { id: 'terms', label: '서비스 이용약관', content: TERMS_OF_SERVICE_CONTENT },
  { id: 'privacy', label: '개인정보처리방침', content: PRIVACY_POLICY_CONTENT },
];

/** 마이페이지에서 이용약관과 개인정보처리방침을 전환해 읽을 수 있는 화면입니다. */
export default function PoliciesPage() {
  const navigate = useNavigate();
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>('terms');
  const policy = POLICY_TABS.find(({ id }) => id === selectedPolicy)!;

  return (
    <main className="flex min-h-dvh flex-col">
      <PageHeader title="이용약관 및 개인정보처리방침" onBack={() => navigate(-1)} />

      <div
        className="mt-2 grid grid-cols-2 rounded-08 bg-neutral-100 p-1"
        role="tablist"
        aria-label="정책 선택"
      >
        {POLICY_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`policy-tab-${id}`}
            aria-selected={selectedPolicy === id}
            aria-controls="policy-content"
            onClick={() => setSelectedPolicy(id)}
            className={`rounded-08 px-2 py-2.5 text-label-01-medium ${
              selectedPolicy === id
                ? 'bg-neutral-00 font-semibold text-neutral-700 shadow-sm'
                : 'text-neutral-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section
        id="policy-content"
        role="tabpanel"
        aria-labelledby={`policy-tab-${selectedPolicy}`}
        className="mt-5"
      >
        <MarkdownPolicyContent content={policy.content} />
      </section>
    </main>
  );
}
