const PRESSED_OPACITY_STYLE = { opacity: 0.6 };

/** `Pressable`의 `style`에 그대로 전달해 눌렀을 때 옅어지는 피드백을 준다. */
export const getPressedStyle = ({ pressed }: { pressed: boolean }) =>
  pressed ? PRESSED_OPACITY_STYLE : undefined;
