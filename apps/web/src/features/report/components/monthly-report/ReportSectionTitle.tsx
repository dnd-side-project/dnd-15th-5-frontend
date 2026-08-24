type ReportSectionTitleProps = {
  description?: string;
  title: string;
};

export default function ReportSectionTitle({ description, title }: ReportSectionTitleProps) {
  return (
    <div>
      <h2 className="text-title-01-bold text-neutral-900">{title}</h2>
      {description && <p className="mt-2 text-body-02-medium text-neutral-500">{description}</p>}
    </div>
  );
}
