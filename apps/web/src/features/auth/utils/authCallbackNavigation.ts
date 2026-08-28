/** 인증 복원이 필요한 경로를 새 문서로 열어 AuthProvider가 다시 실행되게 합니다. */
export const reloadToAuthPath = (path: string) => {
  window.location.replace(path);
};
