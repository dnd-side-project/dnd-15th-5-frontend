type PushTokenSynchronizer = {
  stopAndDrain: () => Promise<void>;
};

const synchronizers = new Set<PushTokenSynchronizer>();

/** 활성 Push Token 동기화 작업을 등록하고 해제합니다. */
export const registerPushTokenSynchronizer = (synchronizer: PushTokenSynchronizer) => {
  synchronizers.add(synchronizer);

  return () => {
    synchronizers.delete(synchronizer);
  };
};

/** 로그아웃 전에 동기화를 중지하고 이미 진행 중인 서버 등록을 모두 기다립니다. */
export const stopPushTokenSyncAndDrain = async () => {
  await Promise.all([...synchronizers].map((synchronizer) => synchronizer.stopAndDrain()));
};
