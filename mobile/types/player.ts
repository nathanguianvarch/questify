import { Player } from "shared";

export type PlayerStore = {
  player: Player | null;
  setPlayer: (player: Player) => void;
  updatePlayer: (partialRoom: Partial<Player>) => void;
  clearPlayer: () => void;
};