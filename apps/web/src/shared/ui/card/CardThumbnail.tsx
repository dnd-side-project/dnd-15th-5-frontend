type CardThumbnailProps = {
  src: string | null;
};

/** 카드 좌측에 쓰는 정사각형 썸네일입니다. 이미지가 없으면 회색 배경으로 대체합니다. */
export function CardThumbnail({ src }: CardThumbnailProps) {
  if (!src) {
    return (
      <span
        className="inline-block size-15 shrink-0 rounded-05 bg-neutral-200"
        aria-hidden="true"
      />
    );
  }

  return (
    <img src={src} alt="" loading="lazy" className="size-15 shrink-0 rounded-05 object-cover" />
  );
}
