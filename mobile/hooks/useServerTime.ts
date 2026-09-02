import { useEffect, useState } from "react";
import { socket } from "./useSocket";

const SYNC_INTERVAL_MS = 30000;
const SYNC_SAMPLES = 5;

let serverTimeOffset = 0;

const measureOffsetOnce = () =>
  new Promise<number>((resolve) => {
    const clientSentAt = Date.now();
    socket.emit("timeSync", clientSentAt, (serverTime) => {
      const roundTripTime = Date.now() - clientSentAt;
      resolve(serverTime - (clientSentAt + roundTripTime / 2));
    });
  });

const syncServerTime = async () => {
  const samples: number[] = [];
  for (let i = 0; i < SYNC_SAMPLES; i++) {
    samples.push(await measureOffsetOnce());
  }
  samples.sort((a, b) => a - b);
  serverTimeOffset = samples[Math.floor(samples.length / 2)];
};

export const getServerNow = () => Date.now() + serverTimeOffset;

export function useServerTime() {
  const [now, setNow] = useState(getServerNow());

  useEffect(() => {
    syncServerTime();
    socket.on("connect", syncServerTime);

    const syncInterval = setInterval(syncServerTime, SYNC_INTERVAL_MS);
    const tickInterval = setInterval(() => setNow(getServerNow()), 250);

    return () => {
      socket.off("connect", syncServerTime);
      clearInterval(syncInterval);
      clearInterval(tickInterval);
    };
  }, []);

  return now;
}
