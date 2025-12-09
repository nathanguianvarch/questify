import express from 'express'
import { createServer } from 'http';
import { Server } from "socket.io";

const app = express()
const server = createServer(app);
const io = new Server(server);
const port = 3000

app.get('/', (req, res) => {
  res.send('Server online')
})

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(port, () => {
  console.log(`Questify server listening on port ${port}`)
})
