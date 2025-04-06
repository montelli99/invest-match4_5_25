import { MessageDialog } from "@/components/MessageDialog";
import { MessagePolling } from "@/components/MessagePolling";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/Badge";
import { Bell, Check, CheckCheck, Clock } from "lucide-react";
import brain from "brain";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { Conversation, Message } from "types";
import { useAuth } from "@/components/AuthWrapper";

interface ExtendedConversation extends Omit<Conversation, 'other_user'> {
  isTyping?: boolean;
  other_user: {
    uid: string;
    display_name?: string;
    company_name?: string;
  };
  messages: Message[];
  unread_count: number;
}

export default function Messages() {
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();

    // Check typing status for all conversations periodically
    const typingInterval = setInterval(async () => {
      if (!user) return;
      
      const newTypingStatus: Record<string, boolean> = {};
      for (const conv of conversations) {
        try {
          const response = await brain.get_typing_status(
            { otherUserId: conv.other_user.uid },
            { token: { uid: user.uid } }
          );
          const status = await response.json();
          newTypingStatus[conv.other_user.uid] = status.is_typing;
        } catch (error) {
          console.error('Error checking typing status:', error);
        }
      }
      setTypingStatus(newTypingStatus);
    }, 3000);

    return () => clearInterval(typingInterval);
  }, []);

  const { user } = useAuth();

  const loadConversations = async () => {
    if (!user) {
      setError("Please sign in to view messages");
      setLoading(false);
      return;
    }

    console.log('[Debug] Loading conversations...');
    try {
      console.log('[Debug] Sending GET request for conversations...');
      const response = await brain.get_conversations({
        body: { token: { uid: user.uid } }
      });
      console.log('[Debug] GET request successful');
      const data = await response.json() as ExtendedConversation[];
      setConversations(data);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError("Failed to load conversations. Please try again later.");
      setConversations([]); // Reset conversations on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ProtectedRoute>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-semibold">Messages</h1>
          {conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) > 0 && (
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <Badge variant="default" className="text-sm">
                {conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)} unread
              </Badge>
            </div>
          )}
        </div>
      </div>
      <Card className="p-6">
        <div className="space-y-4">
          {conversations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No conversations yet. Start connecting with other users to begin
              messaging!
            </p>
          ) : (
            [...conversations]
              .sort((a, b) => {
                // Sort by unread count first
                if ((a.unread_count || 0) > 0 && (b.unread_count || 0) === 0) return -1;
                if ((a.unread_count || 0) === 0 && (b.unread_count || 0) > 0) return 1;
                
                // Then sort by latest message timestamp
                const aLatest = a.messages[a.messages.length - 1]?.timestamp;
                const bLatest = b.messages[b.messages.length - 1]?.timestamp;
                if (!aLatest || !bLatest) return 0;
                return new Date(bLatest).getTime() - new Date(aLatest).getTime();
              })
              .map((conversation) => {
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                const formattedDate = lastMessage ? new Date(lastMessage.timestamp).toLocaleString() : '';
                return (
              <div 
                key={conversation.other_user.uid} 
                className="relative group hover:bg-accent/5 rounded-lg transition-colors cursor-pointer p-4 border border-muted"
                onClick={() => setSelectedConversation(conversation.other_user.uid)}
              >
                {conversation.unread_count > 0 && (
                  <Badge 
                    variant="default"
                    className="absolute -left-3 top-1/2 -translate-y-1/2 -translate-x-full"
                  >
                    {conversation.unread_count}
                  </Badge>
                )}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      {conversation.other_user.display_name || 'Anonymous'}
                      {conversation.other_user.company_name && (
                        <span className="text-muted-foreground ml-2 text-sm">
                          {conversation.other_user.company_name}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{formattedDate}</span>
                  </div>
                  
                  {lastMessage && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage.content}
                      </p>
                      <div className="flex-shrink-0">
                        {lastMessage.sender_id === user?.uid && (
                          lastMessage.status === 'read' ? (
                            <CheckCheck className="h-4 w-4 text-primary" />
                          ) : lastMessage.status === 'delivered' ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )
                        )}
                      </div>
                    </div>
                  )}
                  
                  {typingStatus[conversation.other_user.uid] && (
                    <p className="text-sm text-primary animate-pulse">
                      Typing...
                    </p>
                  )}
                </div>
                <MessageDialog
                  isOpen={selectedConversation === conversation.other_user.uid}
                  onClose={() => setSelectedConversation(null)}
                  otherUser={{
                    uid: conversation.other_user.uid,
                    display_name: conversation.other_user.display_name,
                    company_name: conversation.other_user.company_name
                  }}
                />
              </div>
                );
              })
          )}
        </div>
      </Card>
      <MessagePolling onPoll={loadConversations} interval={5000} enabled={true} />
    </div>
    </ProtectedRoute>
  );
}
