import { Children, useEffect, useRef, useState } from 'react';

import type { ComponentProps, ReactNode } from 'react';

type MockSwiperInstance = {
  activeIndex: number;
  destroyed: boolean;
  el: HTMLElement;
  slideNext: () => void;
  slidePrev: () => void;
  slideTo: (index: number, speed?: number, runCallbacks?: boolean) => void;
  update: () => void;
};

type SwiperProps = {
  children: ReactNode;
  className?: string;
  initialSlide?: number;
  onSlideChange?: (swiper: MockSwiperInstance) => void;
  onSlideChangeTransitionEnd?: (swiper: MockSwiperInstance) => void;
  onSlideChangeTransitionStart?: (swiper: MockSwiperInstance) => void;
  onSwiper?: (swiper: MockSwiperInstance) => void;
};

/** Jest의 CommonJS 환경에서 Swiper React의 인덱스 이동 계약만 재현합니다. */
export function Swiper({
  children,
  className,
  initialSlide = 0,
  onSlideChange,
  onSlideChangeTransitionEnd,
  onSlideChangeTransitionStart,
  onSwiper,
}: SwiperProps) {
  const [, setActiveIndex] = useState(initialSlide);
  const childCount = Children.count(children);
  const childCountRef = useRef(childCount);
  const callbacksRef = useRef({
    onSlideChange,
    onSlideChangeTransitionEnd,
    onSlideChangeTransitionStart,
  });
  const [swiper] = useState<MockSwiperInstance>(() => {
    const slideTo = (index: number, _speed?: number, runCallbacks = true) => {
      const nextIndex = Math.min(Math.max(index, 0), Math.max(childCountRef.current - 1, 0));
      if (nextIndex === instance.activeIndex) return;

      instance.activeIndex = nextIndex;
      setActiveIndex(nextIndex);

      if (!runCallbacks) return;

      callbacksRef.current.onSlideChangeTransitionStart?.(instance);
      callbacksRef.current.onSlideChange?.(instance);
      callbacksRef.current.onSlideChangeTransitionEnd?.(instance);
    };

    const instance: MockSwiperInstance = {
      activeIndex: initialSlide,
      destroyed: false,
      el: document.createElement('div'),
      slideNext: () => slideTo(instance.activeIndex + 1),
      slidePrev: () => slideTo(instance.activeIndex - 1),
      slideTo,
      update: () => undefined,
    };

    return instance;
  });

  useEffect(() => {
    childCountRef.current = childCount;
    callbacksRef.current = {
      onSlideChange,
      onSlideChangeTransitionEnd,
      onSlideChangeTransitionStart,
    };
  }, [childCount, onSlideChange, onSlideChangeTransitionEnd, onSlideChangeTransitionStart]);

  useEffect(() => {
    onSwiper?.(swiper);
  }, [onSwiper, swiper]);

  return <div className={`swiper ${className ?? ''}`}>{children}</div>;
}

/** 테스트에서는 슬라이드의 DOM 경계와 전달된 접근성 속성만 유지합니다. */
export function SwiperSlide({ className, ...props }: ComponentProps<'div'>) {
  return <div className={`swiper-slide ${className ?? ''}`} {...props} />;
}
