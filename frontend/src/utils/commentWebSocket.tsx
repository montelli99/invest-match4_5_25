import useWebSocket, { ReadyState } from "react-use-websocket";
import { Comment } from "types";
import { create } from "zustand";

interface WebSocketMessage {
  type: 'comment_created' | 'comment_updated' | 'comment_deleted';
  data: Comment;
  timestamp: string;
}

interface WebSocketError {
  type: 'error';
  message: string;
  code: number;
}

export type WebSocketResponse = WebSocketMessage | WebSocketError;

interface CommentWebSocketStore {
  connectionStatus: ReadyState;
  setConnectionStatus: (status: ReadyState) => void;
  lastMessage: WebSocketResponse | null;
  setLastMessage: (message: WebSocketResponse) => void;
  clearLastMessage: () => void;
  error: string | null;
  setError: (error: string | null) => void;
  reconnectAttempt: number;
  setReconnectAttempt: (attempt: number) => void;
}

export const useCommentWebSocket = create<CommentWebSocketStore>((set) => ({
  error: null,
  setError: (error) => set({ error }),
  reconnectAttempt: 0,
  setReconnectAttempt: (attempt) => set({ reconnectAttempt: attempt }),
  connectionStatus: ReadyState.UNINSTANTIATED,
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  lastMessage: null,
  setLastMessage: (message) => set({ lastMessage: message }),
  clearLastMessage: () => set({ lastMessage: null }),
}));

// Helper function to get connection status text
// Calculate reconnection delay with exponential backoff
export const getReconnectDelay = (attempt: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
};

export const getConnectionStatusText = (status: ReadyState) => {
  switch (status) {
    case ReadyState.CONNECTING:
      return "Connecting...";
    case ReadyState.OPEN:
      return "Connected";
    case ReadyState.CLOSING:
      return "Closing...";
    case ReadyState.CLOSED:
      return "Disconnected";
    default:
      return "Uninstantiated";
  }
};
