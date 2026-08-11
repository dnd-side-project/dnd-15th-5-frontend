import type { PreferenceMetric } from '@/features/report/types';

import ReportPreferenceCard from './ReportPreferenceCard';

type ReportPreferenceShareCardProps = {
  description: string;
  metrics: readonly PreferenceMetric[];
  tags: readonly string[];
  title: string;
};

const PREFERENCE_METRIC_LABELS: Record<
  PreferenceMetric['key'],
  { leftLabel: string; rightLabel: string }
> = {
  shop: { leftLabel: '신규 탐색형', rightLabel: '단골 반복형' },
  area: { leftLabel: '동네 확장형', rightLabel: '동네 집중형' },
  time: { leftLabel: '낮소비형', rightLabel: '밤소비형' },
  routine: { leftLabel: '즉흥형', rightLabel: '규칙형' },
};

// TODO: 디자인 시스템 확정 후 컬러·타이포그래피 토큰과 카드 유형별 variant를 적용한다.
// TODO: 피그마 디자인 확정 후 레이아웃 조정 필요
/**
 * PNG 저장에 사용하는 리포트 취향 카드.
 *
 * 기본 취향 카드에 설명과 고정 라벨 기반의 성향 지표를 결합한다.
 * 화면 미리보기 대신 렌더링된 DOM을 이미지로 변환할 수 있도록 `display: none` 상태로 사용하지 않아야 한다.
 */
export default function ReportPreferenceShareCard({
  description,
  metrics,
  tags,
  title,
}: ReportPreferenceShareCardProps) {
  return (
    <article className="w-69 overflow-hidden rounded-15 bg-[#506FAF]">
      <ReportPreferenceCard description={description} tags={tags} title={title} />
      <div className="flex flex-col gap-1.5 rounded-2xl bg-neutral-00 px-6 py-5">
        {metrics.map((metric) => {
          const { leftLabel, rightLabel } = PREFERENCE_METRIC_LABELS[metric.key];

          return (
            <div key={metric.key}>
              <div className="flex justify-between text-[12px] text-[#777d8b]">
                <span>{leftLabel}</span>
                <span>{rightLabel}</span>
              </div>
              <div className="relative h-1.5 rounded-full bg-primary-300">
                <span
                  className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#4c65ed] bg-neutral-00"
                  style={{ left: `${metric.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
