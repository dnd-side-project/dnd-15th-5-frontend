import type { PersonaCardResponse } from '@/features/report/apis/dto';
import type { ReportPreferenceCardVariant, ReportPreferenceMetric } from '@/features/report/types';

const PERSONA_VARIANT_BY_TITLE: Record<string, ReportPreferenceCardVariant> = {
  '골목 야간반장': 'night-watch',
  '미식 유목민': 'food-nomad',
  '동네 터줏대감': 'local-regular',
  '골목 발굴러': 'alley-explorer',
};

const PERSONA_VARIANT_BY_TYPE: Record<string, ReportPreferenceCardVariant> = {
  ALLEY_EXPLORER: 'alley-explorer',
  FOOD_NOMAD: 'food-nomad',
  LOCAL_REGULAR: 'local-regular',
  NIGHT_WATCH: 'night-watch',
};

const clampScore = (score?: number) => Math.min(Math.max(score ?? 50, 0), 100);
const invertScore = (score?: number) => 100 - clampScore(score);

export const createPreferenceMetrics = (
  scores: PersonaCardResponse['scores']
): readonly ReportPreferenceMetric[] => [
  {
    leftLabel: '신규 탐색형',
    rightLabel: '단골 반복형',
    value: invertScore(scores?.scoreExploration),
  },
  {
    leftLabel: '동네 확장형',
    rightLabel: '동네 집중형',
    value: invertScore(scores?.scoreTownExpansion),
  },
  {
    leftLabel: '낮소비형',
    rightLabel: '밤소비형',
    value: invertScore(scores?.scoreDaytime),
  },
  {
    leftLabel: '즉흥형',
    rightLabel: '규칙형',
    value: invertScore(scores?.scoreImpulsive),
  },
];

export const getPreferenceCardVariant = (
  type: string | undefined,
  title: string | undefined
): ReportPreferenceCardVariant => {
  if (title && PERSONA_VARIANT_BY_TITLE[title]) return PERSONA_VARIANT_BY_TITLE[title];

  const normalizedType = type?.trim().replaceAll('-', '_').toUpperCase();
  return (normalizedType && PERSONA_VARIANT_BY_TYPE[normalizedType]) || 'night-watch';
};

/** 공유 API 응답을 취향 카드 컴포넌트가 사용하는 표시 모델로 변환합니다. */
export const mapSharedPersonaCard = (persona: PersonaCardResponse) => ({
  description: persona.description?.trim() || '나만의 소비 취향을 확인해 보세요.',
  metrics: createPreferenceMetrics(persona.scores),
  nickname: persona.nickname?.trim() || '챱챱 사용자',
  tags: persona.keywords?.filter((keyword) => keyword.trim()) ?? [],
  title: persona.typeName?.trim() || '나만의 소비 취향',
  variant: getPreferenceCardVariant(persona.type, persona.typeName),
});
