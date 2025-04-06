import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, MessageCircle, X, Send, User, Bot, ArrowDown } from "lucide-react";
import { toast } from "sonner";

/**
 * Chat Support Widget provides AI-powered assistance throughout the admin interface
 * Similar to Intercom but with InvestMatch's own AI assistant
 */
export function ChatSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    type: "assistant",
    content: "Hello! I'm your InvestMatch Support Assistant. How can I help you today? You can ask about moderation, appeals, user management, reporting, and more.",
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  type Message = {
    id: string;
    type: "user" | "assistant";
    content: string;
    timestamp: Date;
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    try {
      // In a production environment, this would call an actual API
      // for now we'll simulate a response with predefined answers for common questions
      await simulateResponse(userMessage.content);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateResponse = async (query: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple pattern matching for demo purposes
    // In production, this would be replaced with an actual API call to a language model
    const lowerQuery = query.toLowerCase();
    let response = "";

    if (lowerQuery.includes("appeal") || (lowerQuery.includes("approve") && lowerQuery.includes("appeal"))) {
      response = "To approve an appeal:\n\n1. Navigate to the 'Enhanced Moderation' tab in the admin dashboard\n2. Click on the 'Appeals' sub-tab (or section)\n3. You'll see a list of pending appeals sorted by date\n4. Click on the appeal you want to review\n5. Read the appeal details, original report, and user comments\n6. Use the 'Approve Appeal' button to approve it\n7. Optionally add a note explaining your decision\n\nOnce approved, the content will be restored and the user will be notified automatically.";
    } else if (lowerQuery.includes("moderation") && (lowerQuery.includes("how") || lowerQuery.includes("use"))) {
      response = "To use the moderation system, navigate to the 'Enhanced Moderation' tab in the admin dashboard. From there, you'll see a list of content reports that need review. Click on any report to view details and take action. You can approve content, remove it, or mark the report as a false positive.";
    } else if (lowerQuery.includes("add") && lowerQuery.includes("rule")) {
      response = "To add a new moderation rule: \n1. Go to the Enhanced Moderation dashboard\n2. Click the 'Content Rules' tab\n3. Click 'Add New Rule' button\n4. Enter the pattern (supports regex)\n5. Select action type and severity\n6. Click 'Save Rule'\n\nYour new rule will start applying to content immediately.";
    } else if (lowerQuery.includes("report") && lowerQuery.includes("export")) {
      response = "To export reports, go to the Analytics section and click the export button in the top-right corner of any report widget. You can choose CSV or PDF format. For regular exports, you can also schedule automatic exports in the Settings section.";
    } else if (lowerQuery.includes("user") && (lowerQuery.includes("manage") || lowerQuery.includes("how"))) {
      response = "To manage users, navigate to the 'Users' section of the dashboard. Here you can view all users, filter by user type, and see verification status. Click on any user to view their complete profile and take actions like approving verification documents or changing their status.";
    } else if (lowerQuery.includes("ticket") && (lowerQuery.includes("respond") || lowerQuery.includes("answer"))) {
      response = "To respond to support tickets:\n1. Go to the 'Support' section\n2. Click on any open ticket\n3. Read the ticket details and any previous responses\n4. Type your response in the reply box\n5. Attach any relevant files if needed\n6. Click 'Send Response'\n\nYou can also change the ticket status to 'In Progress' or 'Resolved' as appropriate.";
    } else if (lowerQuery.includes("find") && lowerQuery.includes("guide")) {
      response = "To find the complete admin guide, look for the question mark icon (?) in the main navigation bar at the top right of the admin dashboard. Clicking this icon will open the comprehensive help guide with sections for each dashboard feature.";
    } else if (lowerQuery.includes("batch") || (lowerQuery.includes("multiple") && lowerQuery.includes("report"))) {
      response = "To process multiple reports at once:\n\n1. Go to the Enhanced Moderation dashboard\n2. In the Reports list, use the checkboxes to select multiple items\n3. Once you've selected reports, the batch actions menu will appear\n4. Choose an action (Approve, Reject, Mark as False Positive)\n5. Confirm your action\n\nThis allows you to efficiently handle similar reports without processing each one individually.";
    } else if (lowerQuery.includes("dashboard") || lowerQuery.includes("navigate")) {
      response = "The admin dashboard has several main sections accessible from the left sidebar:\n\n1. Overview - Platform statistics and activity\n2. Enhanced Moderation - Content reports, rules, and appeals\n3. Users - User management and verification\n4. Analytics - Detailed metrics and reports\n5. Support - Ticket management\n6. Settings - Platform configuration\n\nClick on any section to navigate to it. Each section has sub-tabs for more specific functions.";
    } else {
      response = "I'll help you with that. Could you provide more details about what you're trying to accomplish in the admin dashboard? For specific features, you can also check the comprehensive help guide by clicking the Help icon in the dashboard header.";
    }

    setMessages(prev => [...prev, {
      id: `assistant-${Date.now()}`,
      type: "assistant",
      content: response,
      timestamp: new Date()
    }]);
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat window */}
      {isOpen && (
        <div className="bg-white rounded-md shadow-lg w-80 sm:w-96 mb-4 flex flex-col overflow-hidden border border-gray-200 max-h-[70vh]">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <h3 className="font-medium">InvestMatch Support</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-blue-700 rounded-full p-0"
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>
          
          {/* Messages container */}
          <div className="flex-1 p-3 overflow-y-auto max-h-[400px]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user' 
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {message.type === 'assistant' && (
                        <Avatar className="h-6 w-6 bg-blue-100">
                          <Bot size={14} className="text-blue-600" />
                        </Avatar>
                      )}
                      <div>
                        <div className="whitespace-pre-line">{message.content}</div>
                        <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                      {message.type === 'user' && (
                        <Avatar className="h-6 w-6 bg-blue-800">
                          <User size={14} className="text-white" />
                        </Avatar>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-800">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 bg-blue-100">
                        <Bot size={14} className="text-blue-600" />
                      </Avatar>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Scroll indicator if there are more messages */}
          {messagesEndRef.current && messagesEndRef.current.getBoundingClientRect().top > window.innerHeight && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute bottom-16 right-4 rounded-full bg-white shadow-md p-2"
              onClick={scrollToBottom}
            >
              <ArrowDown size={14} />
            </Button>
          )}
          
          {/* Input form */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
            <div className="flex items-end gap-2">
              <Textarea 
                ref={inputRef}
                placeholder="Ask a question..."
                className="flex-1 min-h-[60px] max-h-32 resize-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-10 w-10 rounded-full" 
                disabled={!inputValue.trim() || isProcessing}
                onClick={handleSubmit}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
      
      {/* Chat button */}
      <Button
        variant={isOpen ? "secondary" : "default"}
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </Button>
    </div>
  );
}
