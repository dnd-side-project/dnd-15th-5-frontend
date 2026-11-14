import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { saveTown } from '@/features/map/apis/clients';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';

import { useRecommendationLocationActions } from './useRecommendationLocationActions';

import type { PropsWithChildren } from 'react';

jest.mock('@/features/map/apis/clients');

it('새 동네 저장에 실패하면 기존 확정 좌표와 재시도할 핀을 유지한다', async () => {
  const confirmedPosition = { lat: 37.51, lng: 127.03 };
  const draftSelection = {
    status: 'ready' as const,
    position: { lat: 37.55, lng: 127.05 },
    address: '성수동',
  };
  useLocationSelectionStore.setState({ confirmedPosition, draftSelection });
  useHomeBottomSheetStore.getState().showHome();
  jest.mocked(saveTown).mockRejectedValueOnce(new Error('저장 실패'));
  const onConfirm = jest.fn();
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(useRecommendationLocationActions, { wrapper });

  act(() => result.current.confirmLocation(draftSelection, onConfirm));

  await waitFor(() => expect(result.current.hasSaveError).toBe(true));
  expect(result.current.isSaving).toBe(false);
  expect(useLocationSelectionStore.getState()).toMatchObject({ confirmedPosition, draftSelection });
  expect(useHomeBottomSheetStore.getState().activeSheet.type).toBe('home');
  expect(onConfirm).not.toHaveBeenCalled();
});
