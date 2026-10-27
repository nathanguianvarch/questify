import { createAudioPlayer } from "expo-audio";
import { useEffect, useRef } from "react";

const FADE_MS = 500;
const FADE_STEP_MS = 30;
const LOAD_FALLBACK_MS = 1500;

type ManagedPlayer = {
  player: ReturnType<typeof createAudioPlayer>;
  remove: () => void;
};

function createManagedPlayer(url: string): ManagedPlayer {
  const player = createAudioPlayer({ uri: url });
  let removed = false;
  return {
    player,
    remove: () => {
      if (removed) return;
      removed = true;
      try {
        player.pause();
      } catch {}
      try {
        player.remove();
      } catch {}
    },
  };
}

function fadeVolume(
  managed: ManagedPlayer,
  from: number,
  to: number,
  onDone?: () => void,
) {
  let step = 0;
  const steps = Math.max(1, Math.round(FADE_MS / FADE_STEP_MS));
  const interval = setInterval(() => {
    step += 1;
    const progress = Math.min(1, step / steps);
    try {
      managed.player.volume = from + (to - from) * progress;
    } catch {
      clearInterval(interval);
      return;
    }
    if (progress >= 1) {
      clearInterval(interval);
      onDone?.();
    }
  }, FADE_STEP_MS);
  return () => clearInterval(interval);
}

export function useCrossfadeAudioPlayer(url: string | undefined) {
  const currentUrlRef = useRef<string | undefined>(undefined);
  const activePlayersRef = useRef<Set<ManagedPlayer>>(new Set());

  useEffect(() => {
    if (url === currentUrlRef.current) return;
    currentUrlRef.current = url;

    const activePlayers = activePlayersRef.current;
    const outgoing = new Set(activePlayers);

    const cleanupFns: Array<() => void> = [];

    outgoing.forEach((managed) => {
      const cancel = fadeVolume(managed, managed.player.volume, 0, () => {
        activePlayers.delete(managed);
        managed.remove();
      });
      cleanupFns.push(cancel);
    });

    if (!url) {
      return () => cleanupFns.forEach((fn) => fn());
    }

    const managed = createManagedPlayer(url);
    managed.player.volume = 0;
    activePlayers.add(managed);

    let started = false;
    let cancelFadeIn: (() => void) | undefined;
    const startFadeIn = () => {
      if (started) return;
      started = true;
      cancelFadeIn = fadeVolume(managed, 0, 1);
    };

    const subscription = managed.player.addListener(
      "playbackStatusUpdate",
      (status) => {
        if (status.isLoaded) {
          startFadeIn();
        }
      },
    );
    const fallbackTimeout = setTimeout(startFadeIn, LOAD_FALLBACK_MS);

    managed.player.play();

    cleanupFns.push(() => {
      subscription.remove();
      clearTimeout(fallbackTimeout);
      cancelFadeIn?.();
    });

    return () => cleanupFns.forEach((fn) => fn());
  }, [url]);

  useEffect(() => {
    const activePlayers = activePlayersRef.current;
    return () => {
      activePlayers.forEach((managed) => managed.remove());
      activePlayers.clear();
    };
  }, []);
}
