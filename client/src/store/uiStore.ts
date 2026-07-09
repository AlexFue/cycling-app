import { create } from 'zustand'

interface UiState {
  isRouteModalOpen: boolean
  openRouteModal: () => void
  closeRouteModal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  isRouteModalOpen: false,
  openRouteModal: () => set({ isRouteModalOpen: true }),
  closeRouteModal: () => set({ isRouteModalOpen: false }),
}))
