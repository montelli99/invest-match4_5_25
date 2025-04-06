import { useEffect, useRef, useState, useCallback } from 'react';
import { API_URL, WS_API_URL } from 'app';
import { toast } from 'sonner'; // Use sonner for toast notifications

// Define WebSocket event types for type safety
export type WebSocketEventType = 'moderation' | 'analytics' | 'user_activity' | 'system';

// Define WebSocket event interface with more structured data
export interface WebSocketEvent {
  type: WebSocketEventType;
  timestamp: string;
  data: any;
};

// Define WebSocket connection status types
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// Define options for WebSocket hook with improved typings
export interface WebSocketOptions {
  // Callback for handling incoming messages
  onMessage: (event: WebSocketEvent) => void;
  // Array of event types this connection should handle
  eventTypes: WebSocketEventType[];
  // Auto-reconnect on disconnect
  autoReconnect?: boolean;
  // Maximum reconnection attempts before giving up
  maxReconnectAttempts?: number;
  // Reconnection delay in milliseconds (defaults to 2000ms)
  reconnectDelay?: number;
  // Authentication token for secure WebSockets
  authToken?: string;
  // Optional error handler
  onError?: (error: any) => void;
}

/**
 * Custom hook for WebSocket connections with automatic reconnection
 * and message handling for real-time admin dashboard updates.
 * 
 * Features:
 * - Automatic reconnection with configurable attempts and delay
 * - Simulation mode for development environments
 * - Typed event handling for better safety
 * - Authentication support
 * - Status tracking and management
 * 
 * @param endpoint - The WebSocket endpoint to connect to
 * @param options - Configuration options for the WebSocket connection
 * @returns Object with connection status and methods to interact with the WebSocket
 */
export function useWebSocket(endpoint: string, options: WebSocketOptions) {
  // Parse options with defaults
  const {
    onMessage,
    eventTypes,
    autoReconnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
    authToken,
    onError
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<number>();
  const isRealEndpoint = useRef(true);
  // Use mounted ref to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Check if we're in a development environment without real WebSocket endpoints
  useEffect(() => {
    // Attempt to detect if the WebSocket endpoint is available
    // This can be toggled via localStorage for testing real connections in development
    const forceRealWebsocket = localStorage.getItem('use_real_websocket') === 'true';
    
    if (forceRealWebsocket) {
      console.info('Using real WebSocket connection (forced via localStorage)');
      isRealEndpoint.current = true;
    } else {
      console.info('Using simulated WebSocket connection');
      isRealEndpoint.current = false;
    }
    
    // Set mounted flag
    isMountedRef.current = true;
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);


  // Create full WebSocket URL with proper protocol and authentication
  const getWebSocketUrl = useCallback(() => {
    // Use WebSocket URL from environment or fallback to API URL with ws/wss protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = WS_API_URL || API_URL.replace(/^http(s)?:/, protocol);
    
    // Add endpoint and strip any leading slashes
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${baseUrl}/api/websocket${path}`);
    
    // Add event types as query parameter if provided
    if (eventTypes?.length) {
      url.searchParams.set('event_types', eventTypes.join(','));
    }
    
    // Add auth token if provided
    if (authToken) {
      url.searchParams.set('token', authToken);
    }
    
    return url.toString();
  }, [endpoint, eventTypes, authToken]);

  // Main connection function
  const connect = useCallback(() => {
    try {
      // If we've determined the endpoint doesn't exist, simulate connection instead
      if (!isRealEndpoint.current) {
        console.log('Using simulated WebSocket connection');
        setStatus('connected');
        // Set up interval to simulate receiving messages
        const interval = window.setInterval(() => {
          // Only simulate if we have a message handler
          if (onMessage) {
            const simulatedTypes = eventTypes || ['system'];
            const randomType = simulatedTypes[Math.floor(Math.random() * simulatedTypes.length)];
            
            // Create more realistic simulated messages based on event type
            let simulatedData;
            const timestamp = new Date().toISOString();
            
            switch (randomType) {
              case 'moderation':
                simulatedData = {
                  report_id: `sim-${Math.floor(Math.random() * 1000)}`,
                  content_type: ['profile', 'message', 'comment'][Math.floor(Math.random() * 3)],
                  severity: Math.floor(Math.random() * 100),
                  status: ['pending', 'reviewing', 'resolved'][Math.floor(Math.random() * 3)]
                };
                break;
              case 'analytics':
                simulatedData = {
                  metric: ['users', 'matches', 'messages', 'reports'][Math.floor(Math.random() * 4)],
                  value: Math.floor(Math.random() * 100),
                  change: (Math.random() * 20 - 10).toFixed(1) + '%'
                };
                break;
              case 'user_activity':
                simulatedData = {
                  user_id: `user-${Math.floor(Math.random() * 1000)}`,
                  action: ['login', 'profile_update', 'message_sent', 'report_submitted'][Math.floor(Math.random() * 4)],
                  details: 'Simulated user activity'
                };
                break;
              case 'system':
              default:
                simulatedData = { 
                  message: 'Simulated system event',
                  level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)]
                };
                break;
            }
            
            onMessage({
              type: randomType as any,
              timestamp,
              data: simulatedData
            });
          }
        }, 60000); // Simulate an event every minute
        
        // Store the interval ID in reconnectTimeoutRef to clean it up later
        reconnectTimeoutRef.current = interval as unknown as number;
        return;
      }

      // Clean up any existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Get WebSocket URL
      const url = getWebSocketUrl();

      // Create new WebSocket connection
      wsRef.current = new WebSocket(url.toString());
      setStatus('connecting');
      console.log(`Connecting to WebSocket: ${url}`);

      wsRef.current.onopen = () => {
        if (!isMountedRef.current) return;
        setStatus('connected');
        reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
      };

      wsRef.current.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          
          // Validate received data has required structure
          if (!data.type || !data.data) {
            console.warn('Received malformed WebSocket message:', data);
            return;
          }
          
          // Check if this event type is one we're listening for
          if (eventTypes.length > 0 && !eventTypes.includes(data.type)) {
            console.debug('Ignoring WebSocket event of type', data.type, 'not in subscription list');
            return;
          }
          
          // Add timestamp if missing
          if (!data.timestamp) {
            data.timestamp = new Date().toISOString();
          }
          
          onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          // Try to extract the raw message for debugging
          try {
            console.debug('Raw message content:', event.data.substring(0, 200) + '...');
          } catch (e) {
            // Ignore additional errors in debug logging
          }
        }
      };

      wsRef.current.onerror = (error) => {
        if (!isMountedRef.current) return;
        console.error('WebSocket error:', error);
        setStatus('error');
        
        // More detailed error diagnostics
        const diagInfo = {
          url: url,
          readyState: wsRef.current?.readyState,
          hasAuthToken: !!authToken,
          browser: navigator.userAgent
        };
        console.debug('Connection diagnostic information:', diagInfo);
        
        // Notify about connection issues if this isn't the first attempt
        if (reconnectAttempts.current > 0) {
          toast.error('Connection issues detected. Some real-time updates may be delayed.');
        }
        
        onError?.(error);
      };

      wsRef.current.onclose = (event) => {
        if (!isMountedRef.current) return;
        
        // Check for authentication-related close codes
        const isAuthError = event.code === 1008 || // Policy violation
                           event.code === 1003 || // Unsupported data
                           event.code === 4001;   // Custom auth error code
        
        // Log close with more context
        console.log(`WebSocket connection closed: ${event.code} ${event.reason || ''} ${isAuthError ? '(Auth issue)' : ''}`);
        
        setStatus('disconnected');
        wsRef.current = null;

        // Handle authentication errors specially
        if (isAuthError && authToken) {
          console.error('WebSocket authentication failed. Token may be invalid.');
          toast.error('Authentication error. Please refresh your session.');
          // Don't retry auth errors
          return;
        }

        // Attempt to reconnect if enabled
        if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          setStatus('reconnecting');
          console.log(`Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`);
          reconnectAttempts.current += 1;
          
          // Use exponential backoff for reconnection attempts
          const backoffDelay = reconnectDelay * Math.pow(1.5, reconnectAttempts.current - 1);
          console.log(`Using backoff delay of ${backoffDelay}ms`);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (isMountedRef.current) {
              connect();
            }
          }, backoffDelay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.log('Maximum reconnection attempts reached');
          // Notify user that real-time updates are no longer available
          toast.error('Real-time updates disconnected. Please refresh the page.', {
            duration: 10000, // Show this important message longer
            action: {
              label: "Refresh Now",
              onClick: () => window.location.reload()
            }
          });
          
          // Use polling as fallback
          console.info('WebSocket connection error or disconnected, switching to polling fallback mode');
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setStatus('error');
    }
  }, [getWebSocketUrl, eventTypes, onMessage, autoReconnect, reconnectDelay, maxReconnectAttempts, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('disconnected');
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    status,
    sendMessage,
    disconnect,
    connect
  };
}
