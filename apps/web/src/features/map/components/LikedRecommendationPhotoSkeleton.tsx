/** 좋아요 가게 사진이 로드되는 동안 표시하는 3칸 스켈레톤입니다. */
export default function LikedRecommendationPhotoSkeleton() {
  return (
    <div
      role="status"
      aria-label="가게 사진 불러오는 중"
      className="col-span-full grid grid-cols-3 gap-1"
    >
      {[0, 1, 2].map((index) => (
        <span key={index} className="h-32 animate-pulse bg-neutral-200" />
      ))}
    </div>
  );
}
