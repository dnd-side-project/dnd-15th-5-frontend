import type { ReportPreferenceCardVariant } from '@/features/report/types';

/** 백엔드의 네 자리 페르소나 코드를 구성하는 소비 성향 축입니다. */
export type PersonaAxes = {
  activityRange: 'H' | 'W';
  consumptionRhythm: 'P' | 'F';
  consumptionTime: 'D' | 'M';
  visitStyle: 'R' | 'N';
};

const PERSONA_VARIANT_BY_VISIT_AND_TIME = {
  RD: 'local-regular',
  RM: 'night-watch',
  ND: 'alley-explorer',
  NM: 'food-nomad',
} as const satisfies Record<string, ReportPreferenceCardVariant>;

/** 백엔드의 RHDP 형식 코드를 네 가지 소비 성향 축으로 분리합니다. */
export const parsePersonaAxes = (type?: string): PersonaAxes | null => {
  const normalizedType = type?.trim().toUpperCase();
  const match = normalizedType?.match(/^([RN])([HW])([DM])([PF])$/);
  if (!match) return null;

  return {
    visitStyle: match[1] as PersonaAxes['visitStyle'],
    activityRange: match[2] as PersonaAxes['activityRange'],
    consumptionTime: match[3] as PersonaAxes['consumptionTime'],
    consumptionRhythm: match[4] as PersonaAxes['consumptionRhythm'],
  };
};

/** 방문 스타일과 소비 시간 조합으로 가장 가까운 네 가지 카드 유형을 결정합니다. */
export const resolvePersonaVariant = (type?: string): ReportPreferenceCardVariant | undefined => {
  const axes = parsePersonaAxes(type);
  if (!axes) return undefined;

  return PERSONA_VARIANT_BY_VISIT_AND_TIME[`${axes.visitStyle}${axes.consumptionTime}`];
};
