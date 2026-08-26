import { useState } from 'react';

import OnboardingMapImage from '@/shared/assets/images/onboarding/img-onboarding-map.png';
import OnboardingReceiptImage from '@/shared/assets/images/onboarding/img-onboarding-receipt.png';
import OnboardingReportImage from '@/shared/assets/images/onboarding/img-onboarding-report.png';
import { cn } from '@/shared/lib/cn';
import { BackButton } from '@/shared/ui/back-button';
import { Button } from '@/shared/ui/button';

type OnboardingCarouselProps = {
  onBack: () => void;
  onComplete: () => void;
};

const ONBOARDING_STEPS = [
  {
    id: 'receipt',
    image: OnboardingReceiptImage,
    title: '영수증으로\n간편하게 기록해요',
  },
  {
    id: 'map',
    image: OnboardingMapImage,
    title: '기록이 쌓이며\n나만의 소비 지도를 만들어요',
  },
  {
    id: 'report',
    image: OnboardingReportImage,
    title: '매달 새로운 소비 취향\n리포트를 받아보세요',
  },
] as const;

const LAST_STEP_INDEX = ONBOARDING_STEPS.length - 1;
const SLIDE_WIDTH_PERCENTAGE = 100;

export function OnboardingCarousel({ onBack, onComplete }: OnboardingCarouselProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const isLastStep = currentStepIndex === LAST_STEP_INDEX;

  const handleBack = () => {
    if (currentStepIndex === 0) {
      onBack();
      return;
    }

    setCurrentStepIndex((previousStepIndex) => previousStepIndex - 1);
  };

  const handlePrimaryAction = () => {
    if (isLastStep) {
      onComplete();
      return;
    }

    setCurrentStepIndex((previousStepIndex) => previousStepIndex + 1);
  };

  return (
    <>
      <BackButton onClick={handleBack} className="ml-4" />

      <section className="flex min-h-0 flex-1 flex-col items-center pt-7">
        <ol
          aria-label={`온보딩 진행 상태: ${ONBOARDING_STEPS.length}단계 중 ${currentStepIndex + 1}단계`}
          className="flex gap-1"
        >
          {ONBOARDING_STEPS.map((step, stepIndex) => {
            const isCurrentStep = stepIndex === currentStepIndex;

            return (
              <li
                key={step.id}
                aria-current={isCurrentStep ? 'step' : undefined}
                className={cn(
                  'flex size-5 items-center justify-center rounded-full text-body-02-medium text-neutral-00',
                  isCurrentStep ? 'bg-primary-500' : 'bg-primary-200'
                )}
              >
                {stepIndex + 1}
              </li>
            );
          })}
        </ol>

        <div aria-live="polite" className="mt-5 min-h-0 w-full flex-1 overflow-hidden">
          <div
            className="flex h-full transform-gpu transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none"
            style={{
              transform: `translateX(-${currentStepIndex * SLIDE_WIDTH_PERCENTAGE}%)`,
            }}
          >
            {ONBOARDING_STEPS.map((step, stepIndex) => (
              <article
                key={step.id}
                aria-hidden={stepIndex !== currentStepIndex}
                className="flex h-full min-w-full flex-col items-center"
              >
                <h1 className="whitespace-pre-line text-center text-heading-02-semibold text-neutral-700">
                  {step.title}
                </h1>

                <div className="mt-8 flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
                  <img src={step.image} alt="" className="w-full object-contain" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="shrink-0 px-4">
        <Button onClick={handlePrimaryAction}>{isLastStep ? '시작하기' : '다음으로'}</Button>

        <div className="mt-5 flex h-5 items-center justify-center">
          {!isLastStep && (
            <button
              type="button"
              onClick={onComplete}
              className="rounded-05 px-2 text-body-02-semibold text-neutral-500 outline-none transition-colors hover:text-neutral-600 active:text-neutral-700 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1"
            >
              건너뛰기
            </button>
          )}
        </div>
      </div>
    </>
  );
}
