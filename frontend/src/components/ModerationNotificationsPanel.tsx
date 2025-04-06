import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WebSocketManager, WebSocketMessage, WebSocketMessageType, ContentReportData } from './WebSocketManager';
import { RiskSeverity } from '../utils/moderationTypes';
import { Bell, CheckCircle, Clock, MessageSquare, User, XCircle } from 'lucide-react';

/**
 * ModerationNotificationsPanel props
 */
interface Props {
  token?: { idToken: string };
  onViewNotification?: (notification: ContentReportData) => void;
}

/**
 * ModerationNotificationsPanel component
 * 
 * Displays real-time notifications for content moderation events.
 */
export function ModerationNotificationsPanel({ token, onViewNotification }: Props) {
  const [notifications, setNotifications] = useState<ContentReportData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  /**
   * Handle WebSocket message
   */
  const handleMessage = (message: WebSocketMessage) => {
    if (message.type === WebSocketMessageType.CONTENT_REPORTED) {
      const reportData = message.data as ContentReportData;
      
      // Add to notifications
      setNotifications(prev => [reportData, ...prev].slice(0, 50)); // Keep last 50 notifications
      
      // Increment unread count
      setUnreadCount(prev => prev + 1);
    }
  };
  
  /**
   * Format relative time
   */
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
      return `${diffSec}s ago`;
    }
    
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return `${diffMin}m ago`;
    }
    
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) {
      return `${diffHour}h ago`;
    }
    
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}d ago`;
  };
  
  /**
   * Handle notification click
   */
  const handleNotificationClick = (notification: ContentReportData) => {
    if (onViewNotification) {
      onViewNotification(notification);
    }
  };
  
  /**
   * Get severity badge
   */
  const getSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case RiskSeverity.CRITICAL:
        return <Badge variant="destructive">Critical</Badge>;
      case RiskSeverity.HIGH:
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
      case RiskSeverity.MEDIUM:
        return <Badge variant="warning">Medium</Badge>;
      case RiskSeverity.LOW:
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  /**
   * Mark all as read
   */
  const markAllAsRead = () => {
    setUnreadCount(0);
  };
  
  /**
   * Clear all notifications
   */
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Moderation Notifications
              {unreadCount > 0 && (
                <Badge>{unreadCount}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time alerts for content needing review
            </CardDescription>
          </div>
          <WebSocketManager
            token={token}
            onMessage={handleMessage}
            showNotifications={false}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time notifications will appear here as content is reported
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.reportId}
                  className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {notification.contentType === 'message' ? (
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                      ) : (
                        <User className="h-4 w-4 text-purple-500" />
                      )}
                      <span className="font-medium capitalize">
                        {notification.contentType} Reported
                      </span>
                      {getSeverityBadge(notification.riskScore.severity)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatRelativeTime(notification.timestamp)}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-2 line-clamp-2">
                    {notification.contentExcerpt}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Report reason: {notification.reportReason}</span>
                    <span>Risk score: {notification.riskScore.value}</span>
                  </div>
                  
                  <div className="flex justify-end mt-2 gap-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <XCircle className="h-4 w-4 mr-1 text-red-500" />
                      Remove
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      {notifications.length > 0 && (
        <CardFooter className="flex justify-between border-t p-4">
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear All
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
