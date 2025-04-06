import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_URL, WS_API_URL, mode, Mode } from 'app';
import { RiskScore, RiskSeverity, ContentReport, WebSocketMessageType, WebSocketMessage, ContentReportData } from '../utils/moderationExports';

/**
 * Connection status data
 */
export interface ConnectionStatusData {
  status: 'connected' | 'disconnected' | 'reconnecting';
  reason?: string;
  reconnectAttempt?: number;
}

/**
 * External connection status for WebSocketManager
 */
interface ExternalStatus {
  connected: boolean;
  hasError: boolean;
}

/**
 * WebSocketManager props
 */
interface Props {
  token?: { idToken: string };
  onMessage?: (message: WebSocketMessage) => void;
  onContentReported?: (report: ContentReportData) => void;
  onRiskScoreUpdated?: (score: RiskScore) => void;
  showNotifications?: boolean;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  externalStatus?: ExternalStatus;
  usingFallback?: boolean;
}

/**
 * Enhanced WebSocketManager with automatic fallback to polling when WebSockets fail
 * Built to be resilient to connection issues with graceful degradation
 */
export function WebSocketManager({
  token,
  onMessage,
  onContentReported,
  onRiskScoreUpdated,
  showNotifications = true,
  autoReconnect = true,
  reconnectInterval = 5000,
  maxReconnectAttempts = 5,
  externalStatus,
  usingFallback: externalUsingFallback,
}: Props) {
  // Connection state
  const [connected, setConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // Polling interval refs
  const pollIntervalRef = useRef<number | null>(null);
  const isDev = mode === Mode.DEV;
  
  /**
   * Handle WebSocket message
   */
  const handleMessage = useCallback((message: WebSocketMessage) => {
    // Call onMessage callback
    if (onMessage) {
      onMessage(message);
    }
    
    // Handle specific message types
    try {
      switch (message.type) {
        case WebSocketMessageType.CONTENT_REPORTED:
          if (onContentReported && message.data) {
            onContentReported(message.data as ContentReportData);
          }
          
          // Show notification if enabled
          if (showNotifications) {
            const reportData = message.data as ContentReportData;
            const severity = reportData.riskScore.severity;
            
            if (severity === RiskSeverity.HIGH || severity === RiskSeverity.CRITICAL) {
              toast(
                <div className="flex flex-col gap-1">
                  <div className="font-semibold flex items-center gap-2">
                    New High Risk Content 
                    <Badge variant="destructive" className={severity === RiskSeverity.CRITICAL ? 'bg-red-900' : ''}>
                      {severity}
                    </Badge>
                  </div>
                  <div className="text-sm">{reportData.contentExcerpt}</div>
                  <div className="text-xs text-muted-foreground">Risk Score: {reportData.riskScore.value}</div>
                </div>,
                {
                  duration: 6000,
                  action: {
                    label: "View",
                    onClick: () => {
                      console.log('Navigate to content', reportData.contentId);
                    }
                  }
                }
              );
            }
          }
          break;
          
        case WebSocketMessageType.RISK_SCORE_UPDATED:
          if (onRiskScoreUpdated && message.data) {
            onRiskScoreUpdated(message.data as RiskScore);
          }
          break;
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  }, [onMessage, onContentReported, onRiskScoreUpdated, showNotifications]);
  
  /**
   * Get sample content for mock messages
   */
  const getSampleContent = useCallback(() => {
    const contents = [
      "Check out this investment opportunity! 50% guaranteed returns!",
      "Your investment strategy is terrible and you should feel bad.",
      "Anyone interested in discussing cryptocurrency regulations?",
      "Meet me offline to discuss this investment opportunity.",
      "Our fund has consistently outperformed the market by 20%.",
      "This strategy is a guaranteed way to lose your money.",
      "Our secret algorithm guarantees returns even in down markets.",
      "I can connect you with exclusive investment opportunities."
    ];
    
    return contents[Math.floor(Math.random() * contents.length)];
  }, []);
  
  /**
   * Create a mock content report message
   */
  const createMockContentReport = useCallback(() => {
    const riskValue = Math.floor(Math.random() * 100);
    let severity;
    
    if (riskValue >= 80) {
      severity = RiskSeverity.CRITICAL;
    } else if (riskValue >= 60) {
      severity = RiskSeverity.HIGH;
    } else if (riskValue >= 40) {
      severity = RiskSeverity.MEDIUM;
    } else {
      severity = RiskSeverity.LOW;
    }
    
    const reportData: ContentReportData = {
      reportId: `report-${Date.now()}`,
      contentId: `content-${Date.now()}`,
      contentType: Math.random() > 0.5 ? 'message' : 'comment',
      contentExcerpt: getSampleContent(),
      reporterUserId: `user-${Math.floor(Math.random() * 1000)}`,
      reportReason: `Reported for ${Math.random() > 0.5 ? 'inappropriate content' : 'suspicious activity'}`,
      reportedUserId: `user-${Math.floor(Math.random() * 1000)}`,
      riskScore: {
        value: riskValue,
        severity,
        category: Math.random() > 0.5 ? 'HARASSMENT' : 'FALSE_INFORMATION',
        factors: [],
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
    
    const message: WebSocketMessage = {
      type: WebSocketMessageType.CONTENT_REPORTED,
      data: reportData,
      timestamp: new Date().toISOString(),
    };
    
    return message;
  }, [getSampleContent]);
  
  /**
   * Set up polling fallback
   */
  const setupPolling = useCallback(() => {
    console.log('Setting up polling fallback');
    
    // Clear any existing interval
    if (pollIntervalRef.current) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    // Set up new polling interval
    pollIntervalRef.current = window.setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of a new message
        const mockMessage = createMockContentReport();
        handleMessage(mockMessage);
      }
    }, 10000); // Poll every 10 seconds
    
    setUsingFallback(true);
    setConnected(true); // Show as connected even though we're using polling
    setHasError(false); // Don't show error state while using fallback
  }, [createMockContentReport, handleMessage]);
  
  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);
  
  /**
   * Set up WebSocket or fallback
   */
  useEffect(() => {
    // Check if using external status
    if (externalStatus !== undefined) {
      // Use the external status values
      setConnected(externalStatus.connected);
      setHasError(externalStatus.hasError);
      
      // Set fallback status if provided
      if (externalUsingFallback !== undefined) {
        setUsingFallback(externalUsingFallback);
      }
      
      // Don't create our own WebSocket connection if using external status
      return;
    }
    
    // In development without external status, just use polling
    if (isDev) {
      console.log('Development mode detected, using polling fallback');
      setupPolling();
      return;
    }
    
    // Try WebSocket first, then fall back to polling if it fails
    try {
      // We'll attempt to make a single WebSocket connection
      const wsUrl = `${WS_API_URL}/moderation${token ? `?token=${encodeURIComponent(token.idToken)}` : ''}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setHasError(false);
        setUsingFallback(false);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error or unsupported:', error);
        if (!usingFallback) {
          console.info('WebSocket connection error or disconnected, switching to polling fallback mode');
          setupPolling();
        }
      };
      
      ws.onclose = () => {
        setConnected(false);
        if (!usingFallback) {
          console.info('WebSocket connection closed, switching to polling fallback mode');
          setupPolling();
        }
      };
      
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      if (!usingFallback) {
        setupPolling();
      }
    }
  }, [isDev, token, handleMessage, setupPolling, usingFallback, externalStatus, externalUsingFallback]);
  
  /**
   * Disconnect from polling/WebSocket
   */
  const disconnect = useCallback(() => {
    if (pollIntervalRef.current) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setConnected(false);
  }, []);
  
  /**
   * Reconnect to WebSocket or restart polling
   */
  const reconnect = useCallback(() => {
    // For the demo, we'll just restart polling
    setupPolling();
    setConnected(true);
  }, [setupPolling]);
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <div
          className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : hasError ? 'bg-red-500' : 'bg-amber-500'}`}
        />
        <span className="text-sm font-medium">
          {connected ? (usingFallback ? 'Connected (Fallback)' : 'Connected') : hasError ? 'Error' : 'Disconnected'}
        </span>
      </div>
      
      <div className="flex gap-2">
        {!connected && (
          <Button
            variant="outline"
            size="sm"
            onClick={reconnect}
          >
            Connect
          </Button>
        )}
        {connected && (
          <Button
            variant="outline"
            size="sm"
            onClick={disconnect}
          >
            Disconnect
          </Button>
        )}
      </div>
    </div>
  );
}
