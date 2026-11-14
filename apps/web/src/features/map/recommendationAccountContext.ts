import { createContext } from 'react';

/** 앱에서 조회한 계정 식별자를 주입해 지도 feature의 계정 API 의존을 없앱니다. */
export const RecommendationAccountContext = createContext<number | null>(null);
