import type { PersonaCardResponse } from '@/features/report/apis/dto';
import {
  REPORT_PERSONA_COPY,
  REPORT_PERSONA_TAGS,
  REPORT_PERSONA_VARIANTS,
} from '@/features/report/constants';
import type { ReportPreferenceCardVariant, ReportPreferenceMetric } from '@/features/report/types';

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

export const getPreferenceCardVariant = (type: string | undefined): ReportPreferenceCardVariant => {
  const normalizedType = type?.trim().toUpperCase();

  if (normalizedType && normalizedType in REPORT_PERSONA_VARIANTS) {
    return REPORT_PERSONA_VARIANTS[normalizedType as keyof typeof REPORT_PERSONA_VARIANTS];
  }

  return 'night-watch';
};

const createPreferenceTags = (type: string | undefined, fallbackTags?: readonly string[]) => {
  const normalizedType = type?.trim().toUpperCase();
  const match = normalizedType?.match(/^([RN])[HW]([DM])([PF])$/);

  if (!match) return fallbackTags?.filter((tag) => tag.trim()) ?? [];

  const visitStyle = match[1] as keyof typeof REPORT_PERSONA_TAGS.visitStyle;
  const consumptionTime = match[2] as keyof typeof REPORT_PERSONA_TAGS.consumptionTime;
  const consumptionRhythm = match[3] as keyof typeof REPORT_PERSONA_TAGS.consumptionRhythm;

  return [
    REPORT_PERSONA_TAGS.consumptionTime[consumptionTime],
    REPORT_PERSONA_TAGS.visitStyle[visitStyle],
    REPORT_PERSONA_TAGS.consumptionRhythm[consumptionRhythm],
  ];
};

/** 공유 API 응답을 취향 카드 컴포넌트가 사용하는 표시 모델로 변환합니다. */
export const mapSharedPersonaCard = (persona: PersonaCardResponse) => {
  const variant = getPreferenceCardVariant(persona.type);
  const copy = REPORT_PERSONA_COPY[variant];

  return {
    description: copy.description,
    metrics: createPreferenceMetrics(persona.scores),
    nickname: persona.nickname?.trim() || '챱챱 사용자',
    tags: createPreferenceTags(persona.type, copy.tags),
    title: copy.title,
    variant,
  };
};
