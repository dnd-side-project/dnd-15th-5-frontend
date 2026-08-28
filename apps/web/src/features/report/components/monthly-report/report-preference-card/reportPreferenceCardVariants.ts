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
  shareClassName: string;
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
    characterClassName: 'top-16.75 left-1/2 size-62.5 -translate-x-1/2',
    characterImage: ReportCardNightWatchImage,
    frontClassName: 'bg-report-card-night-front',
    saveCharacterClassName: 'top-21.5 left-1/2 size-41.5 -translate-x-1/2',
    shareClassName: 'bg-report-share-night-watch',
    spotClassName: 'bg-report-card-night-spot',
    textureClassName: 'opacity-40',
    titleClassName: 'text-neutral-00',
  },
  'food-nomad': {
    backClassName: 'bg-report-card-nomad-back',
    characterAlt: '소시지를 맛보는 요리사 캐릭터',
    characterClassName: 'top-16.25 left-1/2 size-62.5 -translate-x-1/2',
    characterImage: ReportCardFoodNomadImage,
    frontClassName: 'bg-report-card-nomad-front',
    saveCharacterClassName: 'top-14.25 left-1/2 size-41.5 -translate-x-1/2',
    shareClassName: 'bg-report-share-food-nomad',
    spotClassName: 'bg-report-card-nomad-spot',
    textureClassName: 'opacity-40',
    titleClassName: 'text-neutral-700',
  },
  'local-regular': {
    backClassName: 'bg-report-card-regular-back',
    characterAlt: '왕관과 망토를 두르고 왕좌에 앉은 캐릭터',
    characterClassName: 'top-15 left-1/2 size-62.5 -translate-x-1/2',
    characterImage: ReportCardLocalRegularImage,
    frontClassName: 'bg-report-card-regular-front',
    saveCharacterClassName: 'top-16 left-1/2 size-41.5 -translate-x-1/2',
    shareClassName: 'bg-report-share-local-regular',
    spotClassName: 'bg-report-card-regular-spot',
    textureClassName: 'opacity-30',
    titleClassName: 'text-primary-50',
  },
  'alley-explorer': {
    backClassName: 'bg-report-card-explorer-back',
    characterAlt: '망원경으로 골목을 살펴보는 탐험가 캐릭터',
    characterClassName: 'top-18.5 left-1/2 size-62.5 -translate-x-1/2',
    characterImage: ReportCardAlleyExplorerImage,
    frontClassName: 'bg-report-card-explorer-front',
    saveCharacterClassName: 'top-18.75 left-1/2 size-41.5 -translate-x-1/2',
    shareClassName: 'bg-report-share-alley-explorer',
    spotClassName: 'bg-report-card-explorer-spot',
    textureClassName: 'opacity-55',
    titleClassName: 'text-neutral-700',
  },
};
