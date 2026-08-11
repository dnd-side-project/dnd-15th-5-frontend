type ReportPreferenceCardProps = {
  description?: string;
  tags: readonly string[];
  title: string;
};

// TODO: 디자인 시스템 확정 후 컬러·타이포그래피 토큰과 카드 유형별 variant를 적용한다.
/**
 * 사용자의 리포트 취향 결과를 이미지 영역, 제목, 설명, 태그로 표현하는 카드.
 *
 * 설명은 저장용 카드처럼 상세 문구가 필요한 경우에만 표시한다.
 */
export default function ReportPreferenceCard({
  description,
  tags,
  title,
}: ReportPreferenceCardProps) {
  return (
    <article className="box-border w-69 overflow-hidden rounded-15 bg-[#506FAF] px-3.5 pb-6 pt-3.5">
      {/* TODO: 이미지 영역에 이미지 넣기 */}
      <div
        aria-label="이미지 영역"
        className="box-border h-65 w-62 rounded-2xl border border-neutral-900"
      />
      <div className="flex flex-col items-center pt-3.5 text-center text-neutral-00">
        <h1 className="m-0 text-[1.35rem] font-black">{title}</h1>
        {description && (
          <p className="m-0 mt-3 text-xs leading-5 whitespace-pre-line">{description}</p>
        )}
        <div className="mt-3 flex justify-center gap-2">
          {tags.map((tag) => (
            <span
              className="rounded-full bg-[#132450] px-3 py-1.75 text-xs font-medium leading-none"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
