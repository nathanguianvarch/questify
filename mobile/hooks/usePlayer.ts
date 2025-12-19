import { PlayerStore } from '@/types/player';
import { create } from 'zustand';

export const usePlayer = create<PlayerStore>((set) => ({
  player: null,
  setPlayer: (player) =>
    set({
      player,
    }),

  updatePlayer: (partialPlayer) =>
    set((state) => ({
      player: state.player
        ? { ...state.player, ...partialPlayer }
        : state.player,
    })),

  clearPlayer: () =>
    set({
      player: null,
    }),
}));

