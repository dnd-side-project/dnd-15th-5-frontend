import { mapMonthlyReportResponse } from './monthlyReport';

describe('mapMonthlyReportResponse', () => {
  it('월간 리포트 API 응답을 상세 화면 표시 데이터로 변환한다', () => {
    const report = mapMonthlyReportResponse(
      {
        reportId: 7,
        yearMonth: '2026-07',
        persona: {
          type: 'RHDP',
          scores: {
            scoreExploration: 78,
            scoreTownExpansion: 67,
            scoreDaytime: 19,
            scoreImpulsive: 79,
          },
        },
        summary: { totalVisitCount: 42, newTownCount: 6, newPlaceCount: 8 },
        placeRanks: [
          {
            rank: 1,
            placeName: '아오이 카페',
            visitCount: 5,
            firstVisitedDate: '2026-04-02',
            stickerNames: ['커피', '지원하지 않는 스티커'],
          },
        ],
        townRanks: [{ rank: 1, townName: '연남동', visitCount: 5 }],
        categoryStats: [
          { category: '카페', percentage: 60 },
          { category: '새 카테고리', percentage: 10 },
        ],
        timePattern: {
          peakDayOfWeek: '금',
          peakTimeSlot: '저녁',
          dayOfWeekPattern: [
            { dayOfWeek: 1, visitCount: 2 },
            { dayOfWeek: 5, visitCount: 9 },
          ],
        },
      },
      { month: 7, year: 2026 }
    );

    expect(report).toMatchObject({
      month: { month: 7, year: 2026 },
      persona: {
        title: '동네 터줏대감',
        variant: 'local-regular',
        tags: ['낮 활동파', '단골형', '규칙적'],
        description:
          '익숙한 동네와 단골 가게를 자주 찾아요. 마음에 들면 꾸준히 찾는 편이에요. 사장님이 알아볼지도 모르는 찐 단골 타입이에요.',
        metrics: [
          { leftLabel: '신규 탐색형', rightLabel: '단골 반복형', value: 78 },
          { leftLabel: '동네 확장형', rightLabel: '동네 집중형', value: 67 },
          { leftLabel: '낮소비형', rightLabel: '밤소비형', value: 19 },
          { leftLabel: '즉흥형', rightLabel: '규칙형', value: 79 },
        ],
      },
      summary: [
        { label: '방문 횟수', value: 42 },
        { label: '동네 갯수', value: 6 },
        { label: '새 가게 수', value: 8 },
      ],
      shops: [{ name: '아오이 카페', visits: 5, months: 4 }],
      districts: [{ name: '연남동', visits: 5 }],
      categories: [
        { category: '카페', percentage: 60 },
        { category: '기타', percentage: 10 },
      ],
      weekdayInsight: '금요일 저녁에 가장 많이 소비했어요',
    });
    expect(report?.shops[0]?.stickerImages).toHaveLength(1);
    expect(report?.weekdaySpending).toEqual([
      { day: '월', count: 2 },
      { day: '화', count: 0 },
      { day: '수', count: 0 },
      { day: '목', count: 0 },
      { day: '금', count: 9 },
      { day: '토', count: 0 },
      { day: '일', count: 0 },
    ]);
  });

  it.each([
    ['RHMP', 'night-watch', '골목 야간반장', ['야행성', '단골형', '규칙적']],
    ['NWMF', 'food-nomad', '미식 유목민', ['야행성', '신규 탐색형', '즉흥적']],
    ['RHDP', 'local-regular', '동네 터줏대감', ['낮 활동파', '단골형', '규칙적']],
    ['NHDF', 'alley-explorer', '골목 발굴러', ['낮 활동파', '신규 탐색형', '즉흥적']],
  ])('%s 유형의 카드 카피와 키워드를 매핑한다', (type, variant, title, tags) => {
    const report = mapMonthlyReportResponse(
      { reportId: 1, persona: { type } },
      { month: 7, year: 2026 }
    );

    expect(report?.persona).toMatchObject({ variant, title, tags });
    expect(report?.persona.description).not.toBe('');
  });

  it('리포트 식별자가 없으면 기록이 없는 월로 처리한다', () => {
    expect(mapMonthlyReportResponse({}, { month: 7, year: 2026 })).toBeUndefined();
    expect(mapMonthlyReportResponse(undefined, { month: 7, year: 2026 })).toBeUndefined();
  });
});
