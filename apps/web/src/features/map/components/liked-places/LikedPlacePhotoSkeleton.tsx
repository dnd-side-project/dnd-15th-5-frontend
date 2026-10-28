/** 좋아요한 가게 사진을 불러오는 동안 3칸 미리보기를 표시합니다. */
export default function LikedPlacePhotoSkeleton() {
  return (
    <div aria-hidden="true" className="col-span-full grid grid-cols-3 gap-1">
      {[0, 1, 2].map((index) => (
        <span key={index} className="h-32 animate-pulse bg-neutral-200" />
      ))}
    </div>
  );
}
