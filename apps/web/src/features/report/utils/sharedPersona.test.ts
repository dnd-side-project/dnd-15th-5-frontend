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

  it('4축 페르소나 코드는 프론트의 카드 카피와 태그로 매핑한다', () => {
    expect(
      mapSharedPersonaCard({
        description:
          '새로운 가게를 적극적으로 찾아 나서는 편이에요. 익숙한 한 동네에 머무는 편이에요.',
        keywords: ['신규 탐색형', '동네 집중형', '낮소비형', '즉흥형'],
        nickname: '차분한 알파카',
        scores: {},
        type: 'NHDF',
        typeName: '신규 탐색형 · 동네 집중형 · 낮소비형 · 즉흥형',
      })
    ).toMatchObject({
      description:
        '익숙한 동네에서도 새로운 가게를 찾아다녀요. 골목 속 숨은 맛집을 발견하는 재미를 즐겨요. 남들보다 먼저 찜해두는 타입이에요.',
      nickname: '차분한 알파카',
      tags: ['낮 활동파', '신규 탐색형', '즉흥적'],
      title: '골목 발굴러',
      variant: 'alley-explorer',
    });
  });

  it('백엔드의 표시 문구는 사용하지 않는다', () => {
    expect(
      mapSharedPersonaCard({
        description: '백엔드 설명',
        keywords: ['백엔드 키워드'],
        type: 'RHMP',
        typeName: '백엔드 제목',
      })
    ).toMatchObject({
      description:
        '정해진 동네, 익숙한 가게를 밤에 즐겨 찾는 편이에요. 새로운 곳보다 아는 곳에서 확실한 만족을 얻는 타입이예요.',
      tags: ['야행성', '단골형', '규칙적'],
      title: '골목 야간반장',
      variant: 'night-watch',
    });
  });
});
