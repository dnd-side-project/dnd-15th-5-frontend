import type { ReactNode } from 'react';

type ReportSectionProps = {
  children: ReactNode;
  title: ReactNode;
};

/** 리포트 콘텐츠의 제목과 본문 간격을 구성합니다. */
export default function ReportSection({ children, title }: ReportSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title-02-bold text-neutral-900">{title}</h2>
      {children}
    </section>
  );
}
