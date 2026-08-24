import ReportSectionTitle from './ReportSectionTitle';

type District = {
  name: string;
  visits: number;
};

type ReportMyPlaceProps = {
  districts: readonly District[];
};

export default function ReportMyPlace({ districts }: ReportMyPlaceProps) {
  const [topDistrict, ...otherDistricts] = districts;

  if (!topDistrict) return null;

  return (
    <section>
      <ReportSectionTitle
        description="이번달에 가장 많이 머문 동네 대표 3곳을 보여줘요"
        title="나의 동네"
      />
      <div className="mt-3 grid grid-cols-[1.2fr_1fr] gap-3.75">
        <article className="flex h-41.25 flex-col justify-between rounded-16 bg-primary-50 p-4">
          <span className="w-fit rounded-full bg-primary-400 px-3 py-1.75 text-label-01-semibold text-neutral-00/90">
            이달의 본거지
          </span>
          <p>
            <span className="block text-body-02-medium text-primary-400">
              {topDistrict.visits}회 방문
            </span>
            <strong className="mt-0.5 block text-title-01-semibold text-neutral-900">
              {topDistrict.name}
            </strong>
          </p>
        </article>
        <div className="flex flex-col gap-3.75">
          {otherDistricts.slice(0, 2).map((district) => (
            <article
              className="flex h-18.75 flex-col justify-center rounded-16 bg-neutral-100 p-4"
              key={district.name}
            >
              <span className="text-label-01-medium text-neutral-500">
                {district.visits}회 방문
              </span>
              <strong className="mt-1 text-body-01-semibold text-neutral-900">
                {district.name}
              </strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
