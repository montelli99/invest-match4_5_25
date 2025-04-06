import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flag, FileCheck, MessageSquare, Bell } from "lucide-react";

/**
 * Notification type for real-time updates
 */
interface Notification {
  id: string;
  type: "report" | "appeal" | "feedback" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
}

interface NotificationsPanelProps {
  onNotificationRead: (id: string) => void;
  onMarkAllRead: () => void;
}

/**
 * NotificationsPanel - Displays and manages notifications
 */
export function NotificationsPanel({
  onNotificationRead,
  onMarkAllRead
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Initialize with mock notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "notif1",
        type: "report",
        title: "New Content Report",
        message: "High-risk content reported by multiple users",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        priority: "high",
        actionUrl: "/reports/143"
      },
      {
        id: "notif2",
        type: "appeal",
        title: "Moderation Appeal Submitted",
        message: "User johnsmith has appealed a content removal decision",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        priority: "medium",
        actionUrl: "/appeals/57"
      },
      {
        id: "notif3",
        type: "system",
        title: "Rule Effectiveness Alert",
        message: "Pattern 'investment_scam_*' has high false positive rate (28%)",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        priority: "high",
        actionUrl: "/rules/effectiveness"
      },
      {
        id: "notif4",
        type: "feedback",
        title: "New Moderator Feedback",
        message: "3 new feedback items for your recent moderation actions",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        read: true,
        priority: "low",
        actionUrl: "/feedback"
      },
      {
        id: "notif5",
        type: "report",
        title: "Urgent Content Report",
        message: "Potentially illegal content reported - requires immediate review",
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        read: false,
        priority: "urgent",
        actionUrl: "/reports/144"
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      // Mark notification as read in local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      
      // Notify parent that notification was read
      onNotificationRead(notification.id);
    }
    
    // Navigate or handle action would go here
    console.log(`Navigate to ${notification.actionUrl}`);
  };
  
  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onMarkAllRead();
  };
  
  /**
   * Get priority badge for notifications
   */
  const PriorityBadge = ({ priority }: { priority: string }) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  /**
   * Get icon for notification types
   */
  const NotificationIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "report":
        return <Flag className="h-4 w-4 text-red-500" />;
      case "appeal":
        return <FileCheck className="h-4 w-4 text-amber-500" />;
      case "feedback":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <>
      <div className="flex items-center justify-between p-4 pb-2">
        <DropdownMenuLabel className="text-base font-semibold">Notifications</DropdownMenuLabel>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleMarkAllAsRead} 
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>
      <DropdownMenuSeparator />
      
      <ScrollArea className="h-[300px]">
        <div className="p-2">
          {notifications.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${notification.read ? "bg-transparent" : "bg-muted"}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <NotificationIcon type={notification.type} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <PriorityBadge priority={notification.priority} />
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );
}
