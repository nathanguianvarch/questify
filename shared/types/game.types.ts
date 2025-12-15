type Player = {
  socketId: string;
};
type Room = {
  code: string;
  hostSocketId: string;
  players: Player[];
};