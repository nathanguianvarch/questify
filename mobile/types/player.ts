import { Player } from "shared";

export type PlayerStore = {
  player: Player;
  setPlayer: (player: Player) => void;
  updatePlayer: (partialRoom: Partial<Player>) => void;
};