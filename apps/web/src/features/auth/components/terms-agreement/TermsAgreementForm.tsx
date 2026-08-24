import { useState } from 'react';

import { CheckIcon, ChevronRightIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

type AgreementKey = 'serviceTermsAgreed' | 'privacyPolicyAgreed' | 'locationTermsAgreed';

type AgreementState = Record<AgreementKey, boolean>;

type TermsAgreementFormProps = {
  isLoading?: boolean;
  onSubmit: (agreement: AgreementState) => void;
};

// TODO: 약관 동의 디자인 시안 확정 후 수정 필요
const INITIAL_AGREEMENT: AgreementState = {
  serviceTermsAgreed: false,
  privacyPolicyAgreed: false,
  locationTermsAgreed: false,
};

const AGREEMENT_ITEMS: Array<{
  key: AgreementKey;
  label: string;
}> = [
  { key: 'serviceTermsAgreed', label: '[필수] 서비스 이용약관 동의' },
  { key: 'privacyPolicyAgreed', label: '[필수] 개인정보 수집 · 이용 동의' },
  { key: 'locationTermsAgreed', label: '[선택] 위치기반 서비스 이용약관' },
];

type AgreementCheckboxProps = {
  checked: boolean;
  label: string;
  onChange: () => void;
};

function AgreementCheckbox({ checked, label, onChange }: AgreementCheckboxProps) {
  return (
    <label className="flex min-w-0 cursor-pointer items-center gap-4">
      <input className="peer sr-only" type="checkbox" checked={checked} onChange={onChange} />
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-400 text-neutral-00 transition-colors peer-checked:bg-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-300 peer-focus-visible:ring-offset-2">
        <CheckIcon className="h-2.5 w-3" aria-hidden="true" />
      </span>
      <span className="text-body-01-medium text-neutral-700">{label}</span>
    </label>
  );
}

export default function TermsAgreementForm({
  isLoading = false,
  onSubmit,
}: TermsAgreementFormProps) {
  const [agreement, setAgreement] = useState(INITIAL_AGREEMENT);
  const isAllAgreed = Object.values(agreement).every(Boolean);
  const areRequiredTermsAgreed = agreement.serviceTermsAgreed && agreement.privacyPolicyAgreed;

  const handleAgreementChange = (key: AgreementKey) => {
    setAgreement((currentAgreement) => ({
      ...currentAgreement,
      [key]: !currentAgreement[key],
    }));
  };

  const handleAllAgreementChange = () => {
    const nextAgreement = !isAllAgreed;

    setAgreement({
      serviceTermsAgreed: nextAgreement,
      privacyPolicyAgreed: nextAgreement,
      locationTermsAgreed: nextAgreement,
    });
  };

  const handleSubmit = () => {
    if (!areRequiredTermsAgreed) return;

    onSubmit(agreement);
  };

  return (
    <div className="mt-auto">
      <section className="px-0.5" aria-labelledby="agreement-heading">
        <h2 id="agreement-heading" className="sr-only">
          약관 동의 항목
        </h2>

        <div className="px-2">
          <AgreementCheckbox
            checked={isAllAgreed}
            label="전체 동의"
            onChange={handleAllAgreementChange}
          />
        </div>

        <div className="my-5.5 border-t border-neutral-200" />

        <div className="flex flex-col gap-6 px-2">
          {AGREEMENT_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-2">
              <AgreementCheckbox
                checked={agreement[item.key]}
                label={item.label}
                onChange={() => handleAgreementChange(item.key)}
              />
              <ChevronRightIcon className="size-6 shrink-0 text-neutral-500" aria-hidden="true" />
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-col items-center gap-3 px-1 pb-8">
        <p
          className={cn(
            'text-body-02-regular tracking-[-0.02em] text-notification',
            areRequiredTermsAgreed && 'invisible'
          )}
          role={areRequiredTermsAgreed ? undefined : 'alert'}
          aria-hidden={areRequiredTermsAgreed || undefined}
        >
          필수 항목에 동의해 주세요
        </p>
        <Button disabled={!areRequiredTermsAgreed} isLoading={isLoading} onClick={handleSubmit}>
          다음으로
        </Button>
      </div>
    </div>
  );
}
