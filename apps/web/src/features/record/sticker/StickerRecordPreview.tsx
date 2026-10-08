import { RECORD_CATEGORIES } from '@chapchap/shared/record';
import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { CategoryChip } from '@/shared/ui/category-chip';

type StickerRecordPreviewProps = { sticker: string; onChangeImage: () => void };

/** 스티커가 적용된 기록 폼의 PoC입니다. 입력값은 서버에 저장하지 않습니다. */
export default function StickerRecordPreview({
  sticker,
  onChangeImage,
}: StickerRecordPreviewProps) {
  const [category, setCategory] = useState<string>(RECORD_CATEGORIES[0]);
  return (
    <section className="flex flex-1 flex-col bg-primary-50">
      <div className="flex flex-col items-center gap-4 px-5 py-6">
        <img src={sticker} alt="기록에 적용한 스티커" className="size-48 object-contain" />
        <Button variant="secondary" size="small" className="bg-neutral-00" onClick={onChangeImage}>
          이미지 변경
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-7 rounded-t-32 bg-neutral-00 px-5 py-8">
        <h2 className="text-heading-03-semibold">소비정보를 입력해주세요</h2>
        <p className="text-caption-01-regular text-neutral-500">
          스티커 적용 미리보기예요. 입력한 소비정보는 저장되지 않아요.
        </p>
        <label className="flex flex-col gap-2 text-body-02-medium">
          가게 정보
          <input
            placeholder="가게명 입력하기"
            className="rounded-08 border border-neutral-300 p-4 text-body-01-regular"
          />
        </label>
        <label className="flex flex-col gap-2 text-body-02-medium">
          방문 일시
          <input
            type="datetime-local"
            className="min-w-0 rounded-08 border border-neutral-300 p-4 text-body-01-regular"
          />
        </label>
        <fieldset>
          <legend className="mb-2 text-body-02-medium">카테고리</legend>
          <div className="flex flex-wrap gap-2">
            {RECORD_CATEGORIES.map((item) => (
              <CategoryChip
                key={item}
                selected={category === item}
                onSelectedChange={(selected) => selected && setCategory(item)}
              >
                {item}
              </CategoryChip>
            ))}
          </div>
        </fieldset>
        <label className="flex flex-col gap-2 text-body-02-medium">
          금액
          <input
            type="number"
            min="0"
            placeholder="금액을 입력해주세요"
            className="rounded-08 border border-neutral-300 p-4 text-body-01-regular"
          />
        </label>
        <label className="flex flex-col gap-2 text-body-02-medium">
          메모
          <textarea
            placeholder="기록을 남겨주세요"
            rows={4}
            className="rounded-08 border border-neutral-300 p-4 text-body-01-regular"
          />
        </label>
        <Button disabled>기록하기</Button>
        <a
          href={sticker}
          download="chapchap-sticker.png"
          className="text-center text-body-02-medium text-primary-500"
        >
          스티커 PNG 다운로드
        </a>
      </div>
    </section>
  );
}
