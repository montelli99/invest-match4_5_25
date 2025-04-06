import { useEffect, useRef } from "react";

type TimeoutId = ReturnType<typeof setTimeout>;

type AbortSignal = {
  aborted: boolean;
  reason?: any;
  throwIfAborted(): void;
};

interface Props {
  onPoll: (signal?: AbortSignal) => void | Promise<void>;
  interval?: number;
  enabled?: boolean;
}

export function MessagePolling({
  onPoll,
  interval = 3000,
  enabled = true,
}: Props) {
  const timeoutRef = useRef<TimeoutId>();

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    const poll = async () => {
      try {
        await onPoll(controller.signal);
        timeoutRef.current = setTimeout(poll, interval);
      } catch (error) {
        if (error instanceof Error && (error.name === 'AbortError' || error.name === 'AbortSignal')) {
          console.log('Poll aborted');
        } else {
          console.error('Error polling:', error);
        }
      }
    };

    poll();

    return () => {
      controller.abort();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onPoll, interval, enabled]);

  return null;
}
