import type { ReactNode } from 'react';

type ReportSectionProps = {
  action?: ReactNode;
  children: ReactNode;
  title: ReactNode;
};

/** 리포트 콘텐츠의 제목과 본문 간격을 구성합니다. */
export default function ReportSection({ action, children, title }: ReportSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 text-title-02-bold text-neutral-900">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
