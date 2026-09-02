import { useEffect, useRef } from "react";
import { socket } from "./useSocket";

export function useSocketEvent<Ev extends Parameters<typeof socket.on>[0]>(
  event: Ev,
  handler: Parameters<typeof socket.on<Ev>>[1],
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = (...args: unknown[]) =>
      (handlerRef.current as (...args: unknown[]) => void)(...args);

    socket.on(event, listener as never);
    return () => {
      socket.off(event, listener as never);
    };
  }, [event]);
}
