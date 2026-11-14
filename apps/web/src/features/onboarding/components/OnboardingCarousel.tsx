import { useState } from 'react';

import { useScrollToTop } from '@/shared/hooks/useScrollToTop';
import PageHeader from '@/shared/layout/page-header';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

import { OnboardingIllustration } from './OnboardingIllustration';

import type { RefObject } from 'react';

type OnboardingCarouselProps = {
  onBack: () => void;
  onComplete: () => void;
  scrollContainerRef: RefObject<HTMLElement | null>;
};

const ONBOARDING_STEPS = [
  {
    id: 'photo',
    title: '내가 찍은 사진으로\n기록해보세요',
  },
  {
    id: 'map',
    title: '기록이 쌓이며\n나만의 소비 지도를 만들어요',
  },
  {
    id: 'report',
    title: '매달 새로운 소비 취향\n리포트를 받아보세요',
  },
] as const;

const LAST_STEP_INDEX = ONBOARDING_STEPS.length - 1;
const SLIDE_WIDTH_PERCENTAGE = 100;

export function OnboardingCarousel({
  onBack,
  onComplete,
  scrollContainerRef,
}: OnboardingCarouselProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const isLastStep = currentStepIndex === LAST_STEP_INDEX;

  useScrollToTop(currentStepIndex, scrollContainerRef);

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
      <PageHeader onBack={handleBack} className="mx-5" backButtonClassName="-left-0.5" />

      <section className="flex min-h-0 flex-1 flex-col items-center pt-5.75">
        <ol
          aria-label={`온보딩 진행 상태: ${ONBOARDING_STEPS.length}단계 중 ${currentStepIndex + 1}단계`}
          className="flex shrink-0 gap-2 px-2"
        >
          {ONBOARDING_STEPS.map((step, stepIndex) => {
            const isCurrentStep = stepIndex === currentStepIndex;

            return (
              <li
                key={step.id}
                aria-current={isCurrentStep ? 'step' : undefined}
                className={cn(
                  'flex size-5.5 items-center justify-center rounded-full text-body-02-medium',
                  isCurrentStep
                    ? 'bg-primary-500 text-neutral-00'
                    : 'bg-primary-200 text-primary-50'
                )}
              >
                {stepIndex + 1}
              </li>
            );
          })}
        </ol>

        <div aria-live="polite" className="mt-6.75 min-h-0 w-full flex-1">
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
                className="flex h-full min-w-full flex-col items-center overflow-hidden"
              >
                <h1 className="min-h-17 shrink-0 whitespace-pre-line text-center text-heading-02-semibold text-neutral-700">
                  {step.title}
                </h1>

                <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
                  <OnboardingIllustration step={step.id} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="h-32.75 shrink-0 bg-neutral-00 px-5 pb-8">
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
