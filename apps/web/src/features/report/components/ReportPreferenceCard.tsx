type ReportPreferenceCardProps = {
  tags: readonly string[];
  title: string;
};

export default function ReportPreferenceCard({ tags, title }: ReportPreferenceCardProps) {
  return (
    <article className="box-border w-full overflow-hidden rounded-[15px] bg-[#4968a8] px-3.5 pb-6 pt-3.5">
      <div
        aria-label="이미지 영역"
        className="box-border h-65 w-62 rounded-2xl border border-black"
      />
      <div className="flex flex-col items-center pt-3.5 text-center text-white">
        <h1 className="m-0 text-[1.35rem] font-black tracking-[-0.04em]">{title}</h1>
        <div className="mt-3 flex justify-center gap-2">
          {tags.map((tag) => (
            <span
              className="rounded-full bg-[#172851] px-3 py-1.75 text-xs font-medium leading-none"
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
