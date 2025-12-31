import express from 'express';
import { createServer } from 'http';
import path from "path";
import { Server } from "socket.io";

import { ClientToServerEvents, ServerToClientEvents } from 'shared';
import { spotifyRouter } from './routes/spotify.routes';
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

app.use("/spotify", spotifyRouter)

app.use(
  "/assets",
  express.static(path.join(__dirname, "../assets"))
);

app.get('/share/:roomCode', (req, res) => {
  const roomCode = req.params.roomCode
  const deepLink = `questify://room/${roomCode}`;

  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta property="og:title" content="Rejoins la partie ${roomCode} sur Questify !" />
      <meta property="og:description" content="Code de la salle : ${roomCode}" />
      <meta property="og:image" content="http://localhost:3000/assets/icon.png" />
      <meta property="og:type" content="website" />

      <link rel="icon" type="image/x-icon" href="https://questify.nathanguianvarch.fr/assets/icon.png">
      <title>Questify - Partage</title>

      <script>
        window.location.href = "${deepLink}";
      </script>
    </head>
    <body>
      <p>Redirection vers l'application en cours... Si rien ne se passe, <a href="${deepLink}">cliquez ici</a>.</p>
    </body>
    </html>
  `);
})

server.listen(3000, () => {
  console.log(`Questify server listening on port 3000`)
})
