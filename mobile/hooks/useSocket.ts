import { ClientToServerEvents, ServerToClientEvents } from 'shared';
import { io, Socket } from 'socket.io-client';

export const socket: Socket<
  ServerToClientEvents,
  ClientToServerEvents
> = io(process.env.EXPO_PUBLIC_SERVERURL ?? "http://localhost:3000");