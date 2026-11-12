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
            x="28.25"
            y="243.48"
            width="60.9835"
            height="60.9835"
            transform="rotate(-45.89 58.74 273.97)"
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
            x="42.25"
            y="285.25"
            width="74"
            height="74"
            transform="rotate(22.23 79.25 322.25)"
          />
          <image
            href={OnboardingCoffeeImage}
            x="45.49"
            y="151.49"
            width="74"
            height="74"
            transform="rotate(-29.78 82.49 188.49)"
          />
          <image
            href={OnboardingDonutImage}
            x="245.16"
            y="179.89"
            width="144.706"
            height="144.706"
            transform="rotate(-20.7 317.51 252.24)"
          />
        </>
      )}
      {step === 'report' && (
        <image href={OnboardingReportImage} x="0" y="-28" width="393" height="407" />
      )}
    </svg>
  );
}
