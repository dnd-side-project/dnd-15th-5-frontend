import type { SpendingRecordGroup } from '@/features/report/types';

import SpendingRecordItem from './SpendingRecordItem';

type SpendingRecordListProps = {
  groups: readonly SpendingRecordGroup[];
};

/** 소비 기록을 날짜별로 묶어 제목과 항목 목록을 표시합니다. */
export default function SpendingRecordList({ groups }: SpendingRecordListProps) {
  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const headingId = `date-${group.dateLabel}`;

        return (
          <section key={group.dateLabel} aria-labelledby={headingId}>
            <h2 id={headingId} className="mb-3 text-body-01-semibold text-neutral-900">
              {group.dateLabel}
            </h2>
            <ul className="space-y-3">
              {group.records.map((record) => (
                <SpendingRecordItem key={record.id} record={record} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
