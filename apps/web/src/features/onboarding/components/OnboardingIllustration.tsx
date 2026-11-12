import OnboardingCoffeeImage from '@/shared/assets/images/onboarding/img-onboarding-coffee.png';
import OnboardingDonutImage from '@/shared/assets/images/onboarding/img-onboarding-donut.png';
import OnboardingMapImage from '@/shared/assets/images/onboarding/img-onboarding-map-preview.png';
import OnboardingPhotoIcon from '@/shared/assets/images/onboarding/img-onboarding-photo-icon.svg';
import OnboardingPhotoImage from '@/shared/assets/images/onboarding/img-onboarding-photo.png';
import OnboardingReportImage from '@/shared/assets/images/onboarding/img-onboarding-report.png';
import OnboardingSaladImage from '@/shared/assets/images/onboarding/img-onboarding-salad.png';

type OnboardingIllustrationProps = {
  step: 'photo' | 'map' | 'report';
};

/** Figma에서 내보낸 장식 이미지를 시안 좌표에 배치하고 화면 크기에 맞춰 함께 축소합니다. */
export function OnboardingIllustration({ step }: OnboardingIllustrationProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 393 464"
      preserveAspectRatio="xMidYMid meet"
      className="h-full max-h-116 w-full max-w-98.25 overflow-visible"
    >
      {step === 'photo' && (
        <>
          <image
            href={OnboardingPhotoIcon}
            x="28"
            y="243"
            width="61"
            height="61"
            transform="rotate(-46 59 274)"
          />
          <image href={OnboardingPhotoImage} x="51" y="51" width="342" height="328" />
        </>
      )}
      {step === 'map' && (
        <>
          <svg x="85" y="65" width="222" height="314" className="overflow-hidden">
            <image href={OnboardingMapImage} width="222" height="356" />
          </svg>
          <image
            href={OnboardingSaladImage}
            x="42"
            y="285"
            width="74"
            height="74"
            transform="rotate(22 79 322)"
          />
          <image
            href={OnboardingCoffeeImage}
            x="45"
            y="151"
            width="74"
            height="74"
            transform="rotate(-30 82 188)"
          />
          <image
            href={OnboardingDonutImage}
            x="245"
            y="180"
            width="145"
            height="145"
            transform="rotate(-21 318 252)"
          />
        </>
      )}
      {step === 'report' && (
        <image href={OnboardingReportImage} x="0" y="-28" width="393" height="407" />
      )}
    </svg>
  );
}
