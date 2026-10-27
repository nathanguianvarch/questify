import { ClientToServerEvents, ServerToClientEvents } from "shared";
import { Server, Socket } from "socket.io";

export type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;
export type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
