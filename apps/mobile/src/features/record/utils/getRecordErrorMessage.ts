type ServerErrorResponse = {
  response?: {
    data?: {
      message?: unknown;
    };
  };
};

/** 기록 API·네이티브 처리 오류에서 사용자에게 보여줄 메시지를 안전하게 추출한다. */
export const getRecordErrorMessage = (error: unknown) => {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  const message = (error as ServerErrorResponse).response?.data?.message;

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return error instanceof Error && error.message.trim() ? error.message : null;
};
