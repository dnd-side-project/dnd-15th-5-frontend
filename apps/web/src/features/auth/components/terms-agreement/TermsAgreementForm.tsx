import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { TermsAgreementRequest } from '@/features/auth/apis/dto';
import { CheckIcon, ChevronRightIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

type AgreementState = TermsAgreementRequest;

type AgreementKey = keyof AgreementState;

type TermsAgreementFormProps = {
  isLoading?: boolean;
  onSubmit: (agreement: AgreementState) => void;
};

const INITIAL_AGREEMENT: AgreementState = {
  ageConfirmed: false,
  serviceTermsAgreed: false,
};

const AGREEMENT_ITEMS: Array<{
  detailPath?: string;
  key: AgreementKey;
  label: string;
}> = [
  { key: 'ageConfirmed', label: '[필수] 만 14세 이상입니다.' },
  {
    detailPath: ROUTE_PATHS.agreementTermsOfService,
    key: 'serviceTermsAgreed',
    label: '[필수] 서비스 이용약관 동의',
  },
];

const PRIVACY_POLICY_LABEL = '개인정보 처리방침';

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
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(INITIAL_AGREEMENT);
  const isAllAgreed = Object.values(agreement).every(Boolean);
  const areRequiredTermsAgreed = agreement.ageConfirmed && agreement.serviceTermsAgreed;

  const handleAgreementChange = (key: AgreementKey) => {
    setAgreement((currentAgreement) => ({
      ...currentAgreement,
      [key]: !currentAgreement[key],
    }));
  };

  const handleAllAgreementChange = () => {
    const nextAgreement = !isAllAgreed;

    setAgreement({
      ageConfirmed: nextAgreement,
      serviceTermsAgreed: nextAgreement,
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
          {AGREEMENT_ITEMS.map(({ detailPath, key, label }) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <AgreementCheckbox
                checked={agreement[key]}
                label={label}
                onChange={() => handleAgreementChange(key)}
              />
              {detailPath && (
                <button
                  type="button"
                  aria-label={`${label} 내용 보기`}
                  onClick={() => navigate(detailPath)}
                  className="shrink-0 rounded-full p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  <ChevronRightIcon className="size-6 text-neutral-500" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}

          {/* NOTE: 개인정보 처리방침은 동의가 아니라 확인 대상이라 체크박스 없이 열람만 가능한 행으로 둔다. */}
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.agreementPrivacyPolicy)}
            className="flex items-center justify-between gap-2 rounded-08 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <span className="text-body-01-medium text-neutral-700">{PRIVACY_POLICY_LABEL}</span>
            <ChevronRightIcon className="size-6 shrink-0 text-neutral-500" aria-hidden="true" />
          </button>
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
