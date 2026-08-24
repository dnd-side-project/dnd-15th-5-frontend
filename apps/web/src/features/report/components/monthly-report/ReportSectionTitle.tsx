type ReportSectionTitleProps = {
  description?: string;
  title: string;
};

/** 월간 리포트 섹션의 제목과 선택적 설명을 표시합니다. */
export default function ReportSectionTitle({ description, title }: ReportSectionTitleProps) {
  return (
    <div>
      <h2 className="text-title-01-bold text-neutral-900">{title}</h2>
      {description && <p className="mt-2 text-body-02-medium text-neutral-500">{description}</p>}
    </div>
  );
}
