export type Player = {
  socketId?: string;
  host?: boolean;
  username: string;
  email: string;
  cover: string;
};

export type PlayerStore = {
  player: Player | null;
  setPlayer: (player: Player) => void;
  updatePlayer: (partialRoom: Partial<Player>) => void;
  clearPlayer: () => void;
};