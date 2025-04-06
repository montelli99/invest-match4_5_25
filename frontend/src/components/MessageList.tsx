import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icons } from "./Icons";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useCallback } from "react";
import { SmileIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Message, Reaction } from "types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import brain from "brain";

interface EmojiCategory {
  label: string;
  emojis: string[];
}

const emojiCategories: EmojiCategory[] = [
  {
    label: "Smileys",
    emojis: ["😀", "😄", "😆", "😂", "🤣", "😊", "😇", "😉", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛"]
  },
  {
    label: "Gestures",
    emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤝", "👏", "🙌", "👐", "🤲", "🤜", "🤛", "✊", "👊", "🤚", "👋"]
  },
  {
    label: "Objects",
    emojis: ["💼", "📱", "💻", "⌚", "📷", "🔋", "💡", "🔍", "🗝️", "🔒", "📌", "✂️", "📎", "📏", "📐", "✏️"]
  },
  {
    label: "Symbols",
    emojis: ["❤️", "💔", "💫", "💥", "💢", "💦", "💨", "🕊️", "✨", "⭐", "🌟", "💫", "☀️", "🌈", "☔", "⚡"]
  }
];

interface Props {
  messages: Message[];
  currentUserId: string;
  onNewMessage?: (message: Message) => void;
  onThreadClick?: (threadId: string) => void;
}

function parseMessageContent(content: string) {
  // Basic emoji parsing - this is a simplified version
  // You might want to use a proper emoji regex for production
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/gu;
  return content.split(emojiRegex).map((part, i) => {
    const match = content.slice(0, content.indexOf(part) + part.length).match(emojiRegex);
    const emoji = match ? match[match.length - 1] : null;
    return (
      <span key={i}>
        {part}
        {emoji && <span className="inline-block text-xl leading-none">{emoji}</span>}
      </span>
    );
  });
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  currentUserId: string;
}

function MessageBubble({ message, isCurrentUser, currentUserId }: MessageBubbleProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Smileys");
  
  useEffect(() => {
    // Fetch reactions for this message
    const fetchReactions = async () => {
      try {
        const response = await brain.get_reactions(message.id);
        if (!response.ok) {
          throw new Error('Failed to get reactions');
        }
        const data = await response.json();
        setReactions(data.reactions);
      } catch (error) {
        console.error("Error fetching reactions:", error);
      }
    };
    
    fetchReactions();
  }, [message.id]);

  const handleEmojiSelect = useCallback(async (emoji: string) => {
    if (!currentUserId) return;
    
    try {
      // Check if user already reacted with this emoji
      const existingReaction = reactions.find(
        (r) => r.user_id === currentUserId && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove reaction
        const removeResponse = await brain.remove_reaction({
          message_id: message.id,
          emoji,
          user_id: currentUserId
        });
        if (!removeResponse.ok) {
          throw new Error('Failed to remove reaction');
        }
      } else {
        // Add reaction
        const addResponse = await brain.add_reaction({
          message_id: message.id,
          emoji,
          user_id: currentUserId
        });
        if (!addResponse.ok) {
          throw new Error('Failed to add reaction');
        }
      }

      // Refresh reactions
      const response = await brain.get_reactions(message.id);
      if (!response.ok) {
        throw new Error('Failed to get reactions');
      }
      const data = await response.json();
      setReactions(data.reactions);
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
    
    setShowPicker(false);
  }, [message.id, currentUserId, reactions]);
  const [showPicker, setShowPicker] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Smileys");
  
  useEffect(() => {
    // Fetch reactions for this message
    const fetchReactions = async () => {
      try {
        const response = await brain.get_reactions(message.id);
        if (!response.ok) {
          throw new Error('Failed to get reactions');
        }
        const data = await response.json();
        setReactions(data.reactions);
      } catch (error) {
        console.error("Error fetching reactions:", error);
      }
    };
    
    fetchReactions();
  }, [message.id]);

  const handleEmojiSelect = useCallback(async (emoji: string) => {
    if (!currentUserId) return;
    
    try {
      // Check if user already reacted with this emoji
      const existingReaction = reactions.find(
        (r) => r.user_id === currentUserId && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove reaction
        const removeResponse = await brain.remove_reaction({
          message_id: message.id,
          emoji,
          user_id: currentUserId
        });
        if (!removeResponse.ok) {
          throw new Error('Failed to remove reaction');
        }
      } else {
        // Add reaction
        const addResponse = await brain.add_reaction({
          message_id: message.id,
          emoji,
          user_id: currentUserId
        });
        if (!addResponse.ok) {
          throw new Error('Failed to add reaction');
        }
      }

      // Refresh reactions
      const response = await brain.get_reactions(message.id);
      if (!response.ok) {
        throw new Error('Failed to get reactions');
      }
      const data = await response.json();
      setReactions(data.reactions);
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
    
    setShowPicker(false);
  }, [message.id, currentUserId, reactions]);


  
  return (
    <div className="flex items-start gap-4">
      <Avatar className="ring-2 ring-background">
        <AvatarFallback>{isCurrentUser ? "You" : "OU"}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-muted-foreground">
            {isCurrentUser ? "You" : "Other User"}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{format(new Date(message.timestamp), "HH:mm")}</span>
            {message.status === "delivered" && <Icons.check className="w-4 h-4" />}
            {message.status === "read" && <Icons.checkCheck className="w-4 h-4 text-blue-500" />}
          </div>
        </div>
        <div className="mt-1 leading-relaxed relative group">
            <p className="whitespace-pre-wrap break-words">{parseMessageContent(message.content)}</p>
            <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Popover open={showPicker} onOpenChange={setShowPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <span className="sr-only">Add reaction</span>
                    <SmileIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="end">
                  <div className="p-4 max-h-[300px] overflow-auto">
                    <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory}>
                      <TabsList className="grid grid-cols-4 mb-4">
                        {emojiCategories.map((category) => (
                          <TabsTrigger
                            key={category.label}
                            value={category.label}
                            className="text-xs"
                          >
                            {category.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {emojiCategories.map((category) => (
                        <TabsContent key={category.label} value={category.label}>
                          <div className="grid grid-cols-8 gap-1">
                            {category.emojis.map((emoji) => (
                              <Button
                                key={emoji}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEmojiSelect(emoji)}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                    {reactions.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Recent Reactions</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(reactions.map(r => r.emoji))).map(emoji => {
                            const count = reactions.filter(r => r.emoji === emoji).length;
                            const hasReacted = reactions.some(
                              r => r.emoji === emoji && r.user_id === currentUserId
                            );
                            return (
                              <Button
                                key={emoji}
                                variant={hasReacted ? "default" : "ghost"}
                                size="sm"
                                className="h-6 px-2 text-xs gap-1"
                                onClick={() => handleEmojiSelect(emoji)}
                              >
                                {emoji}
                                <span>{count}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        {message.attachment && (
          <div className="mt-2 flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors">
            <Icons.paperclip className="w-4 h-4 text-muted-foreground" />
            <a
              href={message.attachment.url}
              className="text-sm text-primary hover:underline flex-1 truncate"
              target="_blank"
              rel="noopener noreferrer"
            >
              {message.attachment.filename}
            </a>
            <span className="text-xs text-muted-foreground">
              {(message.attachment.size / 1024).toFixed(1)}KB
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MessageList({ messages, currentUserId, onNewMessage, onThreadClick }: Props) {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  
  // Group messages by thread
  const messagesByThread = messages.reduce((acc, message) => {
    const threadId = message.thread_id || message.id;
    if (!acc[threadId]) {
      acc[threadId] = [];
    }
    acc[threadId].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  const toggleThread = (threadId: string) => {
    setExpandedThreads(prev => {
      const next = new Set(prev);
      if (next.has(threadId)) {
        next.delete(threadId);
      } else {
        next.add(threadId);
      }
      return next;
    });
  };
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    if (messages.length > 0 && onNewMessage) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender_id !== currentUserId) {
        setHasNewMessage(true);
        toast({
          title: "New Message",
          description: "You have a new message",
        });
      }
    }
  }, [messages, currentUserId, onNewMessage, toast]);

  return (
    <ScrollArea
      ref={scrollRef}
      className={cn("h-[500px] p-4 rounded-md border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", hasNewMessage && "animate-pulse")}
    >
      <div className="space-y-8">
        {Object.entries(messagesByThread).map(([threadId, threadMessages]) => {
          const threadStarter = threadMessages.find(m => m.is_thread_starter) || threadMessages[0];
          const isExpanded = expandedThreads.has(threadId);
          const hasReplies = threadMessages.length > 1;

          return (
            <div key={threadId} className="space-y-2 relative">
              {/* Thread connection line */}
              {isExpanded && hasReplies && (
                <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-border" />
              )}
              {/* Thread starter message */}
              <Card
                className={cn(
                  "p-4 transition-all hover:shadow-md",
                  "border-2",
                  threadStarter.sender_id === currentUserId
                    ? "ml-auto bg-primary/10"
                    : "mr-auto"
                )}
              >
                <div className="flex flex-col gap-2">
                  {threadStarter.is_thread_starter && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full">
                        New Thread
                      </Badge>
                      {hasReplies && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleThread(threadId)}
                          className="h-6 px-2 rounded-full hover:bg-primary/10 transition-colors"
                        >
                          {isExpanded ? "Collapse" : `Show ${threadMessages.length - 1} replies`}
                        </Button>
                      )}
                    </div>
                  )}
                  <MessageBubble 
                    message={threadStarter}
                    isCurrentUser={threadStarter.sender_id === currentUserId}
                    currentUserId={currentUserId}
                  />
                </div>
              </Card>

              {/* Reply messages */}
              {isExpanded && threadMessages.slice(1).map((message) => (
                <Card
                  key={message.id}
                  className={cn(
                    "p-4 ml-8 transition-all hover:shadow-md",
                    message.sender_id === currentUserId
                      ? "ml-auto bg-primary/10"
                      : "mr-auto",
                  )}
                >
                  <MessageBubble 
                    message={message}
                    isCurrentUser={message.sender_id === currentUserId}
                    currentUserId={currentUserId}
                  />
                </Card>
              ))}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
