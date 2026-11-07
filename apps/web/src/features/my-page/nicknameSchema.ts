export const NICKNAME_MAX_LENGTH = 16;
const NICKNAME_PATTERN = /^[가-힣ㄱ-ㅎㅏ-ㅣ ]+$/;
type NicknameValidationResult =
  { success: true; data: string } | { success: false; error: 'characters' | 'length' };

/** 한글과 공백만으로 이루어진 닉네임인지 검사합니다. */
export const nicknameCharactersSchema = {
  safeParse(input: string) {
    const value = input.trim();

    if (!value || !NICKNAME_PATTERN.test(value)) {
      return { success: false as const, error: 'characters' as const };
    }

    return { success: true as const, data: value };
  },
};

/** 닉네임이 최대 글자 수를 넘지 않는지 검사합니다. */
export const nicknameLengthSchema = {
  maxLength: NICKNAME_MAX_LENGTH,
  safeParse(input: string) {
    const value = input.trim();

    if ([...value].length > NICKNAME_MAX_LENGTH) {
      return { success: false as const, error: 'length' as const };
    }

    return { success: true as const, data: value };
  },
};

/** 닉네임을 정규화하고 문자 종류 및 글자 수를 검사합니다. */
export const nicknameSchema = {
  safeParse(input: string): NicknameValidationResult {
    const charactersResult = nicknameCharactersSchema.safeParse(input);
    if (!charactersResult.success) return charactersResult;

    return nicknameLengthSchema.safeParse(charactersResult.data);
  },
};
