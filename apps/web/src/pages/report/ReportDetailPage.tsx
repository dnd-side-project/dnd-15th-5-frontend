import {
  MOCK_REPORT_PREFERENCE,
  ReportPreferenceCard,
  ReportPreferenceShareCard,
  useReportImageDownload,
} from '@/features/report';

export default function ReportDetailPage() {
  const { description, metrics, tags, title } = MOCK_REPORT_PREFERENCE;
  const { captureRef, downloadImage, hasDownloadError, isDownloading } = useReportImageDownload(
    `${title}.png`
  );

  return (
    <main className="flex items-center justify-center pt-4.5 pb-8">
      <div className="w-full">
        <ReportPreferenceCard tags={tags} title={title} />
        {/* TODO: 이미지 저장 버튼을 확정된 디자인 토큰과 공통 Button variant로 교체한다. */}
        <button
          className="mt-4 w-full cursor-pointer rounded-2xl bg-[#172851] p-4 text-[0.95rem] font-extrabold text-neutral-00 disabled:cursor-wait disabled:opacity-60"
          disabled={isDownloading}
          onClick={downloadImage}
          type="button"
        >
          {isDownloading ? '이미지 생성 중...' : '이미지 저장하기'}
        </button>
        {/* TODO: 이미지 저장 실패 인라인 문구를 공통 Toast 알림으로 교체한다. */}
        {hasDownloadError && (
          <p className="mt-2 text-center text-caption-01-regular text-notification" role="alert">
            이미지 저장에 실패했어요. 다시 시도해 주세요.
          </p>
        )}
        {/* INFO: PNG 변환을 위해 저장용 카드를 display: none 없이 화면 밖에 렌더링한다. */}
        <div aria-hidden className="pointer-events-none fixed top-0 left-[-9999px]">
          <div ref={captureRef}>
            <ReportPreferenceShareCard
              description={description}
              metrics={metrics}
              tags={tags}
              title={title}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
