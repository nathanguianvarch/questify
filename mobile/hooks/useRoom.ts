import { RoomStore } from '@/types/room';
import { create } from 'zustand';

export const useRoom = create<RoomStore>((set) => ({
  room: null,

  setRoom: (room) =>
    set({
      room,
    }),

  updateRoom: (partialRoom) =>
    set((state) => ({
      room: state.room
        ? { ...state.room, ...partialRoom }
        : state.room,
    })),

  clearRoom: () =>
    set({
      room: null,
    }),
}));

