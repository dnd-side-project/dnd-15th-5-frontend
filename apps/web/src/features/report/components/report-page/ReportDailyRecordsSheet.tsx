import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { StateView } from '@/shared/ui/state-view';

type DailyRecord = {
  image: string;
  shopName: string;
  category: string;
  visitLabel: string;
};

const dateFormatter = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' });

export default function ReportDailyRecordsSheet({
  date,
  records,
  onClose,
}: {
  date: Date;
  records: DailyRecord[];
  onClose: () => void;
}) {
  const dateLabel = dateFormatter.format(date);

  return (
    <div className="fixed z-dialog">
      <BottomSheet
        snapPoint="medium"
        snapPoints={['hidden', 'medium']}
        onSnapPointChange={(point) => {
          if (point === 'hidden') onClose();
        }}
        onHandleClick={onClose}
        onContentPullDown={onClose}
      >
        <section
          aria-label={`${dateLabel} 소비 기록`}
          className="flex min-h-full flex-col"
          tabIndex={-1}
          ref={(element) => element?.focus()}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onClose();
          }}
        >
          <h2 className="mb-4 text-title-02-semibold text-neutral-700">{dateLabel}</h2>
          {records.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {records.map(({ image, shopName, category, visitLabel }) => (
                <li
                  key={shopName}
                  className="flex items-center gap-3 rounded-16 bg-primary-50 p-2.5"
                >
                  <img alt="" src={image} className="size-12 shrink-0 object-contain" />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-01-semibold text-neutral-700">{shopName}</p>
                    <p className="mt-0.75 text-caption-01-regular text-neutral-500">
                      {dateLabel} · 오전 · {category}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-08 bg-primary-100 px-2 py-1 text-card-body-01-medium text-primary-500">
                    {visitLabel}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <StateView
              className="my-auto"
              variant="empty"
              headingAs="h3"
              title="아직 기록이 없어요"
              actionLabel="소비 기록 작성하기"
              to={ROUTE_PATHS.record}
            />
          )}
        </section>
      </BottomSheet>
    </div>
  );
}
