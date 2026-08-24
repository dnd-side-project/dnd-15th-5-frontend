import type { ReportPreferenceCardVariant } from '@/features/report/types';
import {
  ReportCardAlleyExplorerImage,
  ReportCardFoodNomadImage,
  ReportCardLocalRegularImage,
  ReportCardNightWatchImage,
} from '@/shared/assets/images/preference-card';

type ReportPreferenceCardVariantConfig = {
  backClassName: string;
  characterAlt: string;
  characterClassName: string;
  characterImage: string;
  frontClassName: string;
  saveCharacterClassName: string;
  spotClassName: string;
  textureClassName: string;
  titleClassName: string;
};

/** 소비 성향별 카드 이미지와 앞·뒷면 색상 구성을 정의합니다. */
export const REPORT_PREFERENCE_CARD_VARIANTS: Record<
  ReportPreferenceCardVariant,
  ReportPreferenceCardVariantConfig
> = {
  'night-watch': {
    backClassName: 'bg-report-card-night-back',
    characterAlt: '손으로 브이 표시를 하는 방패 캐릭터',
    characterClassName: 'top-24.25 left-12 h-48.5 w-45.25',
    characterImage: ReportCardNightWatchImage,
    frontClassName: 'bg-report-card-night-front',
    saveCharacterClassName: 'top-21.5 left-10.5 h-43 w-40',
    spotClassName: 'bg-report-card-night-spot',
    textureClassName: 'opacity-40',
    titleClassName: 'text-neutral-00',
  },
  'food-nomad': {
    backClassName: 'bg-report-card-nomad-back',
    characterAlt: '소시지를 맛보는 요리사 캐릭터',
    characterClassName: 'top-16.25 left-13 h-63.5 w-42.25',
    characterImage: ReportCardFoodNomadImage,
    frontClassName: 'bg-report-card-nomad-front',
    saveCharacterClassName: 'top-14.25 left-11.5 h-56 w-37.25',
    spotClassName: 'bg-report-card-nomad-spot',
    textureClassName: 'opacity-40',
    titleClassName: 'text-neutral-700',
  },
  'local-regular': {
    backClassName: 'bg-report-card-regular-back',
    characterAlt: '왕관과 망토를 두르고 왕좌에 앉은 캐릭터',
    characterClassName: 'top-18 left-7.75 h-57.5 w-53.75',
    characterImage: ReportCardLocalRegularImage,
    frontClassName: 'bg-report-card-regular-front',
    saveCharacterClassName: 'top-16 left-7.75 h-50.75 w-47.5',
    spotClassName: 'bg-report-card-regular-spot',
    textureClassName: 'opacity-30',
    titleClassName: 'text-primary-50',
  },
  'alley-explorer': {
    backClassName: 'bg-report-card-explorer-back',
    characterAlt: '망원경으로 골목을 살펴보는 탐험가 캐릭터',
    characterClassName: 'top-21.25 left-13.75 h-55.75 w-47',
    characterImage: ReportCardAlleyExplorerImage,
    frontClassName: 'bg-report-card-explorer-front',
    saveCharacterClassName: 'top-18.75 left-12.25 h-49.25 w-41.5',
    spotClassName: 'bg-report-card-explorer-spot',
    textureClassName: 'opacity-55',
    titleClassName: 'text-neutral-700',
  },
};
