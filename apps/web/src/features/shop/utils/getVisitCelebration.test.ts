import { getVisitCelebration } from './getVisitCelebration';

describe('getVisitCelebration', () => {
  it('첫 방문 전용 제목과 첫 방문 구간 문구를 반환한다', () => {
    expect(getVisitCelebration(1, 0)).toEqual({
      title: '첫번째 방문 기록이 생성 되었어요!',
      message: '새로운 가게 발견! 지도에 점 하나 콕 찍었어요.',
    });
  });

  it.each([
    [2, '또 왔다! 우연은 아니죠?'],
    [3, '사장님이 슬슬 알아볼 각!'],
    [6, '단골 등극! 이제 당당하게 말해도 돼요.'],
    [9, '신메뉴 나오면 1등으로 달려갈 사람!'],
    [12, '이 가게 테이블 하나쯤은 내 자리예요.'],
  ])('%i회 방문에 해당하는 구간 문구를 반환한다', (visitCount, message) => {
    expect(getVisitCelebration(visitCount, 0)).toEqual({
      title: `총 ${visitCount}번 방문하셨네요!`,
      message,
    });
  });

  it('같은 구간의 세 문구 중 랜덤값에 해당하는 문구를 선택한다', () => {
    expect(getVisitCelebration(8, 0.99).message).toBe(
      '이 동네에서 제일 익숙한 문, 오늘도 열었어요!'
    );
  });

  it('비정상 방문 횟수와 랜덤값을 안전한 기본값으로 보정한다', () => {
    expect(getVisitCelebration(Number.NaN, Number.NaN)).toEqual({
      title: '첫번째 방문 기록이 생성 되었어요!',
      message: '새로운 가게 발견! 지도에 점 하나 콕 찍었어요.',
    });
  });
});
