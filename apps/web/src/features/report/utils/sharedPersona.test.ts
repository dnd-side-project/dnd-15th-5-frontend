import { createPreferenceMetrics, mapSharedPersonaCard } from './sharedPersona';

describe('sharedPersona', () => {
  it('API 점수를 카드의 좌우 축 방향에 맞게 변환한다', () => {
    expect(
      createPreferenceMetrics({
        scoreDaytime: 80,
        scoreExploration: 70,
        scoreImpulsive: 40,
        scoreTownExpansion: 60,
      }).map(({ value }) => value)
    ).toEqual([30, 40, 20, 60]);
  });

  it('공유 응답의 페르소나 타입과 표시값을 카드 모델로 변환한다', () => {
    expect(
      mapSharedPersonaCard({
        description: '새로운 골목을 찾아다녀요.',
        keywords: ['낮 활동파', '즉흥적'],
        nickname: '이앤더',
        scores: {},
        type: 'ALLEY_EXPLORER',
        typeName: '골목 발굴러',
      })
    ).toMatchObject({
      description: '새로운 골목을 찾아다녀요.',
      nickname: '이앤더',
      tags: ['낮 활동파', '즉흥적'],
      title: '골목 발굴러',
      variant: 'alley-explorer',
    });
  });
});
