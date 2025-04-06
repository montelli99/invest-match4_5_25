import { useAuth } from "@/components/AuthWrapper";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import brain from "brain";
import { format } from "date-fns";
import React, { useState, useEffect, useRef } from "react";
import { Message, MessageStatus } from "types";

interface Props {
  receiverId: string;
  onClose?: () => void;
}

export function MessageThread({ receiverId, onClose }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await brain.ThreadResponse(
        { 
          otherUserId: receiverId,
          total_messages: totalMessages,
          has_more: hasMore,
          unread_count: unreadCount 
        },
        { 
          messages: messages,
          thread: null 
        }
      );
      const data = await response.json();
      setMessages(data.messages);
      setHasMore(data.has_more);
      setTotalMessages(data.total_messages);
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Check typing status
  const checkTypingStatus = async () => {
    try {
      const response = await brain.get_typing_status(
        { otherUserId: receiverId },
        { token: {} },
      );
      const data = await response.json();
      setOtherUserTyping(data.is_typing);
    } catch (error) {
      console.error("Error checking typing status:", error);
    }
  };

  // Update typing indicator
  const updateTypingIndicator = async (isTyping: boolean) => {
    try {
      await brain.update_typing_indicator({
        request: {
          receiver_id: receiverId,
          is_typing: isTyping
        },
        token: {}
      });
    } catch (error) {
      console.error("Error updating typing status:", error);
    }
  };

  // Handle typing
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      updateTypingIndicator(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingIndicator(false);
    }, 2000);
  };

  // Send message
  const sendMessage = async () => {
    if (!user?.uid) return;
    if (!newMessage.trim()) return;

    try {
      const response = await brain.send_message_endpoint({
        request: {
          receiver_id: receiverId,
          content: newMessage.trim(),
          parent_id: null,
          thread_title: null,
          attachment_id: null
        },
        token: {}
      });
      const data = await response.json();
      setMessages([...messages, data]);
      setNewMessage("");
      setIsTyping(false);
      updateTypingIndicator(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when viewed
  const markMessagesAsRead = async () => {
    if (!messages.length || !user?.uid) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender_id !== user.uid && !lastMessage.read_at) {
      try {
        await brain.mark_thread_read_status(
          { threadId: lastMessage.thread_id || '', is_read: true },
          { token: {} }
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  // Fetch messages on mount and periodically
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [receiverId]);

  // Check typing status periodically
  useEffect(() => {
    const interval = setInterval(checkTypingStatus, 2000);
    return () => clearInterval(interval);
  }, [receiverId]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Avatar />
          <div>
            <h3 className="font-semibold">Chat</h3>
            {otherUserTyping && (
              <p className="text-sm text-muted-foreground">Typing...</p>
            )}
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.uid ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] ${message.sender_id === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-3`}
              >
                <p>{message.content}</p>
                <div className="flex items-center justify-end space-x-2 mt-1">
                  <span className="text-xs opacity-70">
                    {format(new Date(message.timestamp), "HH:mm")}
                  </span>
                  {message.sender_id === user?.uid && (
                    <Badge 
                      variant={message.status === "failed" ? "destructive" : "outline"} 
                      className="text-xs"
                    >
                      {message.status === "sending" ? "Sending..." :
                       message.status === "sent" ? "Sent" :
                       message.status === "delivered" ? "Delivered" :
                       message.status === "read" ? "Read" :
                       "Failed"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </Card>
  );
}
