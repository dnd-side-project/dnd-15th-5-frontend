const VISIT_MESSAGES = {
  first: [
    '새로운 가게 발견! 지도에 점 하나 콕 찍었어요.',
    '반가워요, 오늘부터 아는 사이!',
    '첫 방문 기념, 오늘의 첫인상 저장 완료!',
  ],
  second: [
    '또 왔다! 우연은 아니죠?',
    '두 번 왔으면 이미 마음이 있는 거예요.',
    '이 점, 다시 찍힐 줄 알았어요!',
  ],
  thirdToFifth: [
    '사장님이 슬슬 알아볼 각!',
    '"늘 먹던 걸로 주세요" 시전 가능해졌어요.',
    '이건 취향이 맞네요, 인정!',
  ],
  sixthToEighth: [
    '단골 등극! 이제 당당하게 말해도 돼요.',
    '메뉴판? 안 봐도 다 알아요.',
    '이 동네에서 제일 익숙한 문, 오늘도 열었어요!',
  ],
  ninthToEleventh: [
    '신메뉴 나오면 1등으로 달려갈 사람!',
    '사장님도 이제 기다리고 있을걸요?',
    '이 가게 분위기, 절반은 내 지분이에요.',
  ],
  twelfthOrMore: [
    '이 가게 테이블 하나쯤은 내 자리예요.',
    '사실상 명예 직원! 유니폼만 없을 뿐.',
    '여기 역사에 내 이름 한 줄 있어야 해요.',
  ],
} as const;

const getVisitMessages = (visitCount: number) => {
  if (visitCount <= 1) return VISIT_MESSAGES.first;
  if (visitCount === 2) return VISIT_MESSAGES.second;
  if (visitCount <= 5) return VISIT_MESSAGES.thirdToFifth;
  if (visitCount <= 8) return VISIT_MESSAGES.sixthToEighth;
  if (visitCount <= 11) return VISIT_MESSAGES.ninthToEleventh;
  return VISIT_MESSAGES.twelfthOrMore;
};

/** 비정상 값과 소수 방문 횟수를 화면에서 사용할 1 이상의 정수로 보정합니다. */
export const normalizeVisitCount = (visitCount: number) =>
  Number.isFinite(visitCount) ? Math.max(1, Math.floor(visitCount)) : 1;

/** 방문 횟수 구간에서 세 문구 중 하나를 선택해 상세 화면의 축하 문구를 만듭니다. */
export const getVisitCelebration = (visitCount: number, randomValue = Math.random()) => {
  const normalizedVisitCount = normalizeVisitCount(visitCount);
  const messages = getVisitMessages(normalizedVisitCount);
  const normalizedRandomValue = Number.isFinite(randomValue) ? Math.max(0, randomValue) : 0;
  const messageIndex = Math.min(
    Math.floor(normalizedRandomValue * messages.length),
    messages.length - 1
  );

  return {
    title:
      normalizedVisitCount === 1
        ? '첫번째 방문 기록이 생성 되었어요!'
        : `총 ${normalizedVisitCount}번 방문하셨네요!`,
    message: messages[messageIndex],
  };
};
