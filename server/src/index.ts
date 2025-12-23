import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";

import { userRouter } from "@/routes/user.routes";
import { ClientToServerEvents, ServerToClientEvents } from 'shared';
import { initSockets } from './socket';


const app = express()
const server = createServer(app);
export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>(server);

initSockets(io)

app.get('/', (req, res) => {
  res.send('Server online')
})

app.get('/share/:roomCode', (req, res) => {
  const roomCode = req.params.roomCode

  res.redirect(`questify://room/${roomCode}`)
})

app.use("/user", userRouter)

server.listen(3000, () => {
  console.log(`Questify server listening on port 3000`)
})
