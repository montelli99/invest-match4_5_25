import { authedBrain as brain } from "@/components/AuthWrapper";
import { Message } from "@/brain/data-contracts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addMinutes } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, startOfToday, isAfter, isBefore } from "date-fns";
import { CalendarIcon, Check, Clock, X as XIcon } from "lucide-react";
import { Loader2, Paperclip, X } from "lucide-react";
import { MessagePolling } from "./MessagePolling";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  otherUser: {
    uid: string;
    display_name?: string;
    company_name?: string;
  };
}

export function MessageDialog({ isOpen, onClose, otherUser }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [meetingDuration, setMeetingDuration] = useState(30);
  const [meetingAgenda, setMeetingAgenda] = useState("");
  const [reminderTime, setReminderTime] = useState(15);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<{ timeout: NodeJS.Timeout; lastUpdate: number; }>();

  const checkTypingStatus = useCallback(async () => {
    try {
      const response = await brain.get_typing_status(
        { otherUserId: otherUser.uid },
        { token: {} }
      );
      const data = await response.json();
      setIsTyping(data.is_typing);
    } catch (error) {
      console.error("Error checking typing status:", error);
    }
  }, [otherUser.uid]);

  const updateTypingStatus = useCallback(async (isCurrentlyTyping: boolean) => {
    if (!otherUser?.uid) return;
    try {
      await brain.update_typing_indicator({
        body: {
          token: {},
          request: {
            receiver_id: otherUser.uid,
            is_typing: isCurrentlyTyping
          }
        }
      });
    } catch (error) {
      console.error("Error updating typing status:", error);
      toast.error("Failed to update typing status");
    }
  }, [otherUser.uid]);

  const handleInputTyping = useCallback(() => {
    if (!newMessage.trim()) return;

    const now = Date.now();
    const lastUpdate = typingTimeoutRef.current?.lastUpdate || 0;
    if (now - lastUpdate < 1000) return;

    if (typingTimeoutRef.current?.timeout) {
      clearTimeout(typingTimeoutRef.current.timeout);
    }

    const timeoutId = setTimeout(() => {
      updateTypingStatus(false);
    }, 2000);

    typingTimeoutRef.current = {
      lastUpdate: now,
      timeout: timeoutId
    };

    updateTypingStatus(true);
  }, [updateTypingStatus, newMessage]);

  useEffect(() => {
    if (!isOpen) return;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current.timeout);
      }
      updateTypingStatus(false);
    };
  }, [isOpen, updateTypingStatus]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await brain.get_messages({
        pathArgs: { other_user_id: otherUser.uid },
        queryArgs: { page: 1, page_size: 50 },
        body: {}
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [otherUser.uid]);

  useEffect(() => {
    if (isOpen && otherUser.uid) {
      fetchMessages();
    }
  }, [isOpen, otherUser.uid, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const uploadAttachment = async (file: File): Promise<string> => {
    const allowedTypes = [
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv', 'image/jpeg', 'image/png', 'image/gif'
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type. Allowed types: PDF, Word, Excel, Text, CSV, and Images`);
    }

    setUploadProgress(0);
    try {
      setUploadProgress(33);

      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      const response = await brain.upload_attachment({ body: { file } });
      setUploadProgress(66);
      const data = await response.json();
      setUploadProgress(100);

      return data.id || '';
    } catch (error) {
      setUploadProgress(0);
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSendMeetingProposal = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    if (!selectedDate || !selectedTime) return;

    const meetingDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    meetingDateTime.setHours(parseInt(hours), parseInt(minutes));

    const startTime = meetingDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endTime = addMinutes(meetingDateTime, meetingDuration).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const text = `Meeting with ${otherUser.display_name || 'User'}`;
    const details = meetingAgenda.replace(/\n/g, ' ');
    const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}`;

    const meetingProposal = {
      type: 'meeting_proposal',
      datetime: meetingDateTime.toISOString(),
      status: 'pending',
      duration: meetingDuration,
      agenda: meetingAgenda,
      reminder: reminderTime,
      calendarLink: googleCalendarLink
    };

    // Create optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: 'current-user',
      receiver_id: otherUser.uid,
      content: JSON.stringify(meetingProposal),
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      setLoading(true);
      const response = await brain.send_message_endpoint({
        body: {
          token: {},
          request: {
            receiver_id: otherUser.uid,
            content: JSON.stringify(meetingProposal)
          }
        }
      });
      const data = await response.json();
      setMessages(prev => prev.map(m => m.id === tempId ? { ...data, status: 'delivered' } : m));

      setShowScheduler(false);
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    } catch (error) {
      console.error("Error sending meeting proposal:", error);

      if (!navigator.onLine) {
        toast.error('No internet connection. Proposal will be retried when connection is restored.');
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...m, error: 'No internet connection', retry: () => handleSendMeetingProposal(retryCount) } : m
        ));
        return;
      }

      if (retryCount < MAX_RETRIES) {
        toast.error(`Failed to send meeting proposal. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => handleSendMeetingProposal(retryCount + 1), 2000 * (retryCount + 1));
        return;
      }

      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, error: 'Failed to send', retry: () => handleSendMeetingProposal(0) } : m
      ));
      toast.error('Failed to send meeting proposal. Click retry to try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToMeeting = async (messageId: string, accept: boolean) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const meetingProposal = JSON.parse(message.content);
      meetingProposal.status = accept ? 'accepted' : 'declined';

      const response = await brain.send_message_endpoint({
        body: {
          token: {},
          request: {
            receiver_id: otherUser.uid,
            content: JSON.stringify(meetingProposal)
          }
        }
      });
      const data = await response.json();
      
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...data, status: 'delivered' } : m
      ));
    } catch (error) {
      toast.error('Failed to respond to meeting. Please try again.');
      console.error("Error responding to meeting:", error);
    }
  };

  const setupReminder = (proposal: { datetime: string; reminder: number; agenda?: string }) => {
    const meetingTime = new Date(proposal.datetime);
    const reminderMoment = addMinutes(meetingTime, -proposal.reminder);
    
    const existingReminderId = localStorage.getItem(`meeting_reminder_${proposal.datetime}`);
    if (existingReminderId) {
      clearTimeout(parseInt(existingReminderId));
    }

    if (isAfter(meetingTime, new Date())) {
      const timeUntilReminder = reminderMoment.getTime() - new Date().getTime();
      if (timeUntilReminder > 0) {
        const timerId = setTimeout(() => {
          toast.message("Meeting Reminder", {
            description: `Your meeting ${proposal.agenda ? `about "${proposal.agenda}"` : ''} starts in ${proposal.reminder} minutes.`
          });
        }, timeUntilReminder);
        localStorage.setItem(`meeting_reminder_${proposal.datetime}`, timerId.toString());
      }
    }
  };

  const renderMeetingProposal = (message: Message) => {
    try {
      const proposal = JSON.parse(message.content);
      if (proposal.type !== 'meeting_proposal') return null;

      const meetingDate = new Date(proposal.datetime);
      if (!meetingDate) return null;
      const isPast = isBefore(meetingDate, new Date());
      const isMyMessage = message.sender_id !== otherUser.uid;

      return (
        <div className="flex flex-col gap-2 p-3 bg-accent/10 rounded-lg">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="font-medium">Meeting Proposal</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{format(meetingDate, "PPp")} ({proposal.duration} mins)</span>
          </div>
          {proposal.agenda && (
            <div className="text-sm mt-1">
              <p className="font-medium">Agenda:</p>
              <p className="whitespace-pre-wrap text-muted-foreground">{proposal.agenda}</p>
            </div>
          )}
          {proposal.status === 'accepted' && (
            <div className="mt-2">
              <a
                href={proposal.calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <CalendarIcon className="h-4 w-4" />
                Add to Google Calendar
              </a>
            </div>
          )}
          {proposal.status === 'pending' && !isPast && !isMyMessage && (
            <div className="flex items-center gap-2 mt-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  handleRespondToMeeting(message.id, true);
                  setupReminder(proposal);
                }}
              >
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRespondToMeeting(message.id, false)}
              >
                <XIcon className="h-4 w-4 mr-1" /> Decline
              </Button>
            </div>
          )}
          {proposal.status !== 'pending' && (
            <div className={`text-sm mt-1 ${proposal.status === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
              {proposal.status === 'accepted' ? 'Meeting Accepted' : 'Meeting Declined'}
            </div>
          )}
          {isPast && proposal.status === 'pending' && (
            <div className="text-sm text-muted-foreground mt-1">
              This meeting proposal has expired
            </div>
          )}
        </div>
      );
    } catch {
      return null;
    }
  };

  const handleSendMessage = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    if (!newMessage.trim() && !selectedFile) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: 'current-user',
      receiver_id: otherUser.uid,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, optimisticMessage]);

    const messageContent = newMessage.trim();
    setNewMessage('');
    const fileToUpload = selectedFile;
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Clear typing indicator
    if (typingTimeoutRef.current?.timeout) {
      clearTimeout(typingTimeoutRef.current.timeout);
      await updateTypingStatus(false);
    }

    try {
      setLoading(true);
      let attachment_id = null;

      if (fileToUpload) {
        try {
          attachment_id = await uploadAttachment(fileToUpload);
        } catch (error) {
          console.error('File upload failed:', error);
          // Remove optimistic message on file upload failure
          setMessages(prev => prev.filter(m => m.id !== tempId));
          toast.error('Failed to upload file. Please try again.');
          return;
        }
      }

      const response = await brain.send_message_endpoint({
        body: {
          token: {},
          request: {
            receiver_id: otherUser.uid,
            content: messageContent,
            attachment_id
          }
        }
      });
      const data = await response.json();
      
      setMessages(prev => prev.map(m => m.id === tempId ? { ...data, status: 'delivered' } : m));
    } catch (error) {
      console.error("Error sending message:", error);

      if (!navigator.onLine) {
        toast.error('No internet connection. Message will be retried when connection is restored.');
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...m, error: 'No internet connection', retry: () => handleSendMessage(retryCount) } : m
        ));
        return;
      }

      if (error instanceof Error && error.message.includes('file type')) {
        toast.error(error.message);
        setMessages(prev => prev.filter(m => m.id !== tempId));
        return;
      }

      if (retryCount < MAX_RETRIES) {
        toast.error(`Failed to send message. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => handleSendMessage(retryCount + 1), 2000 * (retryCount + 1));
        return;
      }

      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, error: 'Failed to send', retry: () => handleSendMessage(0) } : m
      ));
      toast.error('Failed to send message. Click retry to try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Chat with {otherUser.display_name || "Anonymous"}
            {otherUser.company_name && (
              <span className="text-sm text-muted-foreground block">
                {otherUser.company_name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea ref={scrollRef} className="h-[400px] pr-4">
          <div className="space-y-4">
            <MessagePolling
              onPoll={fetchMessages}
              interval={3000}
              enabled={isOpen}
            />
            <MessagePolling
              onPoll={checkTypingStatus}
              interval={2000}
              enabled={isOpen}
            />
            {messages.map((message) => (
              <div key={message.id} className="relative group">
                {/* Assume MessageBubble is a component you have defined elsewhere */}
                <MessageBubble
                  message={message}
                  isMyMessage={message.sender_id !== otherUser.uid}
                  onRespondToMeeting={handleRespondToMeeting}
                  onSetupReminder={setupReminder}
                />
                {message.error && (
                  <div className="absolute top-0 right-0 -mt-1 -mr-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => message.retry?.()}
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {otherUser.display_name || "User"} is typing...
              </div>
            )}
          </div>
        </ScrollArea>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
        />

        {selectedFile && (
          <div className="mb-2 p-2 bg-muted rounded-lg">
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Paperclip className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
              </div>
              {filePreview && (
                <img src={filePreview} alt="Preview" className="h-8 w-8 object-cover rounded flex-shrink-0" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={() => {
                  setSelectedFile(null);
                  setFilePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-secondary/20 rounded-full h-1.5 mt-2">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Popover open={showScheduler} onOpenChange={setShowScheduler}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0"
                disabled={loading}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Meeting Details</h4>
                  <Textarea
                    placeholder="Meeting agenda or description..."
                    value={meetingAgenda}
                    onChange={(e) => setMeetingAgenda(e.target.value)}
                    className="h-20"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Select Date & Time</h4>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      isBefore(date, startOfToday()) ||
                      isAfter(date, addDays(new Date(), 30))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="">Select a time</option>
                    {Array.from({ length: 24 }, (_, hour) => {
                      const formattedHour = hour.toString().padStart(2, '0');
                      return [
                        `${formattedHour}:00`,
                        `${formattedHour}:30`
                      ];
                    })
                      .flat()
                      .map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={meetingDuration}
                    onChange={(e) => setMeetingDuration(parseInt(e.target.value))}
                  >
                    {[15, 30, 45, 60, 90, 120].map((mins) => (
                      <option key={mins} value={mins}>
                        {mins} minutes
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reminder</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(parseInt(e.target.value))}
                  >
                    {[5, 10, 15, 30, 60].map((mins) => (
                      <option key={mins} value={mins}>
                        {mins} minutes before
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  className="w-full"
                  disabled={!selectedDate || !selectedTime}
                  onClick={handleSendMeetingProposal}
                >
                  Propose Meeting
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (e.target.value.trim()) {
                handleInputTyping();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={handleFileSelect}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={loading || (!newMessage.trim() && !selectedFile)}
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
