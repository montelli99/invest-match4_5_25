from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from enum import Enum
from app.apis.auth_utils import TokenRequest, get_user_id
from uuid import uuid4
import databutton as db
import base64

class MessageStatus(str, Enum):
    """Message status enum"""
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"

class Attachment(BaseModel):
    """Attachment model"""
    id: str
    filename: str
    content_type: str
    size: int
    url: str

class Message(BaseModel):
    """Message model"""
    id: str
    sender_id: str
    receiver_id: str
    content: str
    timestamp: str
    attachment: Optional[Attachment] = None
    status: str = MessageStatus.SENT
    retry_count: int = 0
    parent_id: Optional[str] = None
    thread_id: Optional[str] = None
    reply_count: int = 0
    is_thread_starter: bool = False

class SendMessageRequest(BaseModel):
    """Request model for sending messages"""
    receiver_id: str
    content: str
    attachment_id: Optional[str] = None
    parent_id: Optional[str] = None
    thread_title: Optional[str] = None

class TypingIndicatorRequest(BaseModel):
    """Request model for typing indicators"""
    receiver_id: str
    is_typing: bool

class UserInfo(BaseModel):
    """User info model"""
    uid: str
    display_name: str
    company_name: str

class Conversation(BaseModel):
    """Conversation model"""
    messages: List[Message]
    other_user: UserInfo
    unread_count: int = 0

class ThreadMetadata(BaseModel):
    """Thread metadata model"""
    thread_id: str
    title: Optional[str] = None
    participants: List[str]
    created_at: str
    last_activity: str
    message_count: int = 0
    is_muted: bool = False
    is_read: bool = True
    user_statuses: Dict[str, Dict[str, Any]] = {}

    def get_user_status(self, user_id: str) -> Dict[str, Any]:
        """Get status for a specific user"""
        return self.user_statuses.get(user_id, {"is_muted": False, "is_read": True})

    def update_user_status(self, user_id: str, is_muted: Optional[bool] = None, is_read: Optional[bool] = None):
        """Update status for a specific user"""
        current = self.get_user_status(user_id)
        if is_muted is not None:
            current["is_muted"] = is_muted
        if is_read is not None:
            current["is_read"] = is_read
        self.user_statuses[user_id] = current

router = APIRouter()

# Store typing indicators in memory with TTL cleanup
typing_indicators = {}
_last_cleanup = datetime.utcnow()
_cleanup_interval = 60  # 1 minute

# Store message delivery status with timestamps
delivery_status = {}

def update_message_status(message_id: str, new_status: str, timestamp: str = None):
    """Update message status with timestamp tracking"""
    if not timestamp:
        timestamp = datetime.utcnow().isoformat()
    
    delivery_status[message_id] = {
        "status": new_status,
        "timestamp": timestamp,
        "retries": delivery_status.get(message_id, {}).get("retries", 0)
    }
    
    # Cleanup old entries (keep last 1000 messages)
    if len(delivery_status) > 1000:
        # Sort by timestamp and remove oldest
        sorted_messages = sorted(
            delivery_status.items(),
            key=lambda x: x[1]["timestamp"],
            reverse=True
        )
        delivery_status.clear()
        delivery_status.update(dict(sorted_messages[:1000]))


def _cleanup_typing_indicators():
    """Remove expired typing indicators with improved cleanup"""
    global _last_cleanup
    current_time = datetime.utcnow()
    
    try:
        # Only run cleanup every minute
        if (current_time - _last_cleanup).total_seconds() < _cleanup_interval:
            return
            
        expired = []
        for key, data in typing_indicators.items():
            # Check if typing indicator has expired (5 seconds)
            if (current_time - data["timestamp"]).total_seconds() > 5:
                expired.append(key)
            # Check if user has explicitly stopped typing
            elif not data.get("is_typing", False):
                expired.append(key)
        
        for key in expired:
            typing_indicators.pop(key, None)
        
        _last_cleanup = current_time
        
        # Log cleanup results
        if expired:
            print(f"Cleaned up {len(expired)} expired typing indicators")
            
    except Exception as e:
        print(f"Error during typing indicator cleanup: {str(e)}")
        # Continue execution even if cleanup fails

# Store temporary attachments with encryption
temp_attachments = {}

def encrypt_file(content: bytes) -> bytes:
    """Encrypt file content using Fernet encryption"""
    try:
        from cryptography.fernet import Fernet
        key = db.secrets.get("DOCUMENT_ENCRYPTION_KEY")
        if not key:
            print("Warning: DOCUMENT_ENCRYPTION_KEY not set, using fallback encryption")
            key = Fernet.generate_key()
        f = Fernet(key)
        return f.encrypt(content)
    except Exception as e:
        print(f"Error encrypting file: {str(e)}")
        return content

def decrypt_file(content: bytes) -> bytes:
    """Decrypt file content using Fernet encryption"""
    try:
        from cryptography.fernet import Fernet
        key = db.secrets.get("DOCUMENT_ENCRYPTION_KEY")
        if not key:
            return content
        f = Fernet(key)
        return f.decrypt(content)
    except Exception as e:
        print(f"Error decrypting file: {str(e)}")
        return content

def validate_file_type(content_type: str) -> bool:
    """Validate file type against allowed types"""
    ALLOWED_TYPES = [
        # Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        # Images
        'image/jpeg',
        'image/png',
        # Spreadsheets
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        # Presentations
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]
    return content_type in ALLOWED_TYPES



def get_conversation_key(user1_id: str, user2_id: str) -> str:
    """Generate a consistent key for a conversation between two users"""
    # Sort IDs to ensure the same key regardless of who initiates
    return f"conversation:{sorted([user1_id, user2_id])[0]}:{sorted([user1_id, user2_id])[1]}"



@router.post("/messages/send")
def send_message_endpoint(request: SendMessageRequest, token: TokenRequest) -> Message:
    """Send a message endpoint"""
    return send_message(request, token)

@router.post("/messages/threads/{thread_id}/mute")
def toggle_thread_mute(thread_id: str, token: TokenRequest) -> dict:
    """Toggle mute status for a thread"""
    user_id = get_user_id(token.token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    try:
        threads = db.storage.json.get("thread_metadata", default={})
        metadata = threads.get(thread_id)
        
        if not metadata:
            raise HTTPException(status_code=404, detail="Thread not found")
            
        thread = ThreadMetadata(**metadata)
        
        # Check if user is a participant
        if user_id not in thread.participants:
            raise HTTPException(status_code=403, detail="User is not a participant in this thread")
        
        # Toggle mute status
        current_status = thread.get_user_status(user_id)
        thread.update_user_status(user_id, is_muted=not current_status["is_muted"])
        
        # Save updated metadata
        threads[thread_id] = thread.dict()
        db.storage.json.put("thread_metadata", threads)
        
        return {"status": "success", "is_muted": not current_status["is_muted"]}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error toggling thread mute status: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating thread status") from e

@router.post("/messages/threads/{thread_id}/read")
def mark_thread_read_status(thread_id: str, is_read: bool, token: TokenRequest) -> dict:
    """Mark a thread as read or unread"""
    user_id = get_user_id(token.token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    try:
        threads = db.storage.json.get("thread_metadata", default={})
        metadata = threads.get(thread_id)
        
        if not metadata:
            raise HTTPException(status_code=404, detail="Thread not found")
            
        thread = ThreadMetadata(**metadata)
        
        # Check if user is a participant
        if user_id not in thread.participants:
            raise HTTPException(status_code=403, detail="User is not a participant in this thread")
        
        # Update read status
        thread.update_user_status(user_id, is_read=is_read)
        
        # Save updated metadata
        threads[thread_id] = thread.dict()
        db.storage.json.put("thread_metadata", threads)
        
        return {"status": "success", "is_read": is_read}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error updating thread read status: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating thread status") from e

def get_thread_metadata(thread_id: str) -> Optional[ThreadMetadata]:
    """Get metadata for a specific thread with enhanced validation"""
    try:
        threads = db.storage.json.get("thread_metadata", default={})
        metadata = threads.get(thread_id)
        
        if not metadata:
            return None
            
        # Validate and repair metadata if needed
        if not isinstance(metadata, dict):
            print(f"Invalid metadata type for thread {thread_id}: {type(metadata)}")
            return None
            
        current_time = datetime.utcnow().isoformat()
        
        # Create a valid metadata object with defaults
        valid_metadata = {
            "thread_id": thread_id,
            "title": metadata.get("title"),
            "participants": metadata.get("participants", []),
            "created_at": metadata.get("created_at") or current_time,
            "last_activity": metadata.get("last_activity") or current_time,
            "message_count": max(0, metadata.get("message_count", 0)),  # Ensure non-negative
            "user_statuses": {}
        }
        
        # Convert old format to new user_statuses format if needed
        if "is_muted" in metadata or "is_read" in metadata:
            for participant in valid_metadata["participants"]:
                valid_metadata["user_statuses"][participant] = {
                    "is_muted": metadata.get("is_muted", False),
                    "is_read": metadata.get("is_read", True)
                }
        else:
            valid_metadata["user_statuses"] = metadata.get("user_statuses", {})
        
        return ThreadMetadata(**valid_metadata)
    except Exception as e:
        print(f"Error getting thread metadata: {str(e)}")
        return None

def update_thread_metadata(thread_id: str, participants: List[str], title: Optional[str] = None):
    """Update or create thread metadata with enhanced validation and cleanup"""
    try:
        threads = db.storage.json.get("thread_metadata", default={})
        current_time = datetime.utcnow().isoformat()
        
        # Clean up invalid thread entries
        threads = {tid: meta for tid, meta in threads.items() 
                  if isinstance(meta, dict) and meta.get("participants")}
        
        if thread_id in threads:
            # Update existing thread
            metadata = threads[thread_id]
            # Create new metadata dict to avoid modifying the original
            updated_metadata = {
                "thread_id": thread_id,
                "title": title if title is not None else metadata.get("title"),
                "participants": list(set(metadata.get("participants", []) + participants)),
                "created_at": metadata.get("created_at") or current_time,
                "last_activity": current_time,
                "message_count": metadata.get("message_count", 0) + 1,
                "user_statuses": metadata.get("user_statuses", {})
            }
            
            # Initialize user_statuses for new participants
            for participant in updated_metadata["participants"]:
                if participant not in updated_metadata["user_statuses"]:
                    updated_metadata["user_statuses"][participant] = {
                        "is_muted": False,
                        "is_read": True
                    }
        else:
            # Create new thread
            updated_metadata = {
                "thread_id": thread_id,
                "title": title,
                "participants": participants,
                "created_at": current_time,
                "last_activity": current_time,
                "message_count": 1,
                "user_statuses": {p: {"is_muted": False, "is_read": True} for p in participants}
            }
        
        threads[thread_id] = updated_metadata
        
        # Cleanup old threads (keep last 1000)
        if len(threads) > 1000:
            sorted_threads = sorted(
                threads.items(),
                key=lambda x: x[1].get("last_activity", ""),
                reverse=True
            )
            threads = dict(sorted_threads[:1000])
        
        db.storage.json.put("thread_metadata", threads)
        
    except Exception as e:
        print(f"Error updating thread metadata: {str(e)}")
        # Continue execution to maintain message flow

def send_message(request: SendMessageRequest, token: TokenRequest) -> Message:
    """Send a message to another user with enhanced validation and threading support"""
    sender_id = get_user_id(token.token)
    if not sender_id:
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    # Rate limiting check
    rate_limit_key = f"rate_limit:{sender_id}"
    try:
        rate_limit = db.storage.json.get(rate_limit_key, default={"count": 0, "reset_time": datetime.utcnow().isoformat()})
        current_time = datetime.utcnow()
        reset_time = datetime.fromisoformat(rate_limit["reset_time"])
        
        if current_time > reset_time:
            # Reset counter if time window has passed
            rate_limit = {"count": 0, "reset_time": (current_time + timedelta(minutes=1)).isoformat()}
        
        if rate_limit["count"] >= 10:  # Max 10 messages per minute
            raise HTTPException(
                status_code=429,
                detail={
                    "message": "Too many messages. Please wait a moment.",
                    "retry_after": int((reset_time - current_time).total_seconds())
                }
            )
            
        rate_limit["count"] += 1
        db.storage.json.put(rate_limit_key, rate_limit)
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Rate limiting error: {str(e)}")
        # Continue if rate limiting fails
    try:
        
        # Get attachment if provided
        attachment = None
        if request.attachment_id:
            attachment_data = temp_attachments.get(request.attachment_id)
            if attachment_data:
                attachment = Attachment(**attachment_data)
                # Remove from temporary storage
                temp_attachments.pop(request.attachment_id)
        
        # Handle threading logic
        thread_id = None
        is_thread_starter = False
        parent_message = None
        thread_title = None

        if request.parent_id:
            # This is a reply to an existing message
            conversations = db.storage.json.get("conversations", default={})
            # Search for parent message in all conversations
            for conv in conversations.values():
                for msg in conv.get("messages", []):
                    if msg.get("id") == request.parent_id:
                        parent_message = msg
                        break
                if parent_message:
                    break

            if not parent_message:
                raise HTTPException(status_code=404, detail="Parent message not found")

            # Use existing thread_id or parent_id as thread_id
            thread_id = parent_message.get("thread_id") or parent_message.get("id")
            
            # Get thread metadata
            thread_meta = get_thread_metadata(thread_id)
            if thread_meta:
                thread_title = thread_meta.title

            # Update parent message's reply count
            parent_message["reply_count"] = parent_message.get("reply_count", 0) + 1
        else:
            # This could be the start of a new thread
            is_thread_starter = True
            thread_id = f"thread_{datetime.utcnow().timestamp()}"
            thread_title = request.thread_title  # New field in SendMessageRequest

        # Create message with initial status and threading info
        message = Message(
            id=f"msg_{datetime.utcnow().timestamp()}",
            sender_id=sender_id,
            receiver_id=request.receiver_id,
            content=request.content,
            timestamp=datetime.utcnow().isoformat(),
            attachment=attachment,
            status="sent",  # Initial status
            retry_count=0,
            # Threading fields
            parent_id=request.parent_id,
            thread_id=thread_id,
            reply_count=0,
            is_thread_starter=is_thread_starter
        )
        
        # Get conversation key
        conv_key = get_conversation_key(sender_id, request.receiver_id)
        
        # Get existing conversation or create new one
        conversations = db.storage.json.get("conversations", default={})
        conversation = conversations.get(conv_key, {"messages": []})
        
        # Add message to conversation
        conversation["messages"] = conversation.get("messages", []) + [message.dict()]
        conversations[conv_key] = conversation
        
        # Save updated conversations
        db.storage.json.put("conversations", conversations)
        
        # Update thread metadata
        if thread_id:
            update_thread_metadata(
                thread_id=thread_id,
                participants=[sender_id, request.receiver_id],
                title=thread_title
            )
        
        return message
    except Exception as e:
        print(f"Error sending message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error sending message: {str(e)}"
        ) from e

class ThreadResponse(BaseModel):
    """Response model for messages with thread metadata"""
    messages: List[Message]
    thread: Optional[ThreadMetadata] = None
    total_messages: int = 0
    has_more: bool = False
    unread_count: int = 0

@router.get("/messages/{other_user_id}")
def get_messages(
    other_user_id: str,
    token: TokenRequest,
    page: int = 1,
    page_size: int = 50,
    thread_id: Optional[str] = None
) -> ThreadResponse:
    """Get messages between current user and another user with enhanced thread support"""
    current_user_id = get_user_id(token.token)
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Authentication failed")
        
    try:
        

        conv_key = get_conversation_key(current_user_id, other_user_id)
        
        # Get conversation
        try:
            conversations = db.storage.json.get("conversations", default={})
            if not isinstance(conversations, dict):
                print(f"Invalid conversations data type: {type(conversations)}")
                conversations = {}
        except Exception as e:
            print(f"Error reading conversations: {str(e)}")
            conversations = {}
            
        conversation = conversations.get(conv_key, {"messages": []})
        if not isinstance(conversation, dict):
            print(f"Invalid conversation data type for {conv_key}: {type(conversation)}")
            conversation = {"messages": []}
        
        # Get messages and filter by thread if specified
        messages = conversation.get("messages", [])
        if not isinstance(messages, list):
            print(f"Invalid messages data type: {type(messages)}")
            messages = []

        total_messages = len(messages)
        unread_count = 0

        if thread_id:
            # If thread_id is specified, return all messages in the thread
            thread_messages = [
                msg for msg in messages
                if msg.get("thread_id") == thread_id or msg.get("id") == thread_id
            ]
            # Count unread messages in thread
            unread_count = sum(
                1 for msg in thread_messages
                if msg.get("receiver_id") == current_user_id 
                and msg.get("status") in ["sent", "delivered"]
            )
            # Sort by timestamp to maintain conversation flow
            thread_messages.sort(key=lambda x: x.get("timestamp", ""))
            messages = thread_messages
            total_messages = len(thread_messages)
        else:
            # Count all unread messages
            unread_count = sum(
                1 for msg in messages
                if msg.get("receiver_id") == current_user_id 
                and msg.get("status") in ["sent", "delivered"]
            )
            
        current_time = datetime.utcnow().isoformat()
        
        # Update message statuses
        updated = False
        for msg in messages:
            if msg["receiver_id"] == current_user_id:
                if msg.get("status") == "sent":
                    msg["status"] = "delivered"
                    msg["delivered_at"] = current_time
                    updated = True
                elif msg.get("status") == "delivered" and not msg.get("read_at"):
                    msg["status"] = "read"
                    msg["read_at"] = current_time
                    updated = True
        
        # Save updates if needed
        if updated:
            conversations[conv_key] = conversation
            db.storage.json.put("conversations", conversations)
        
        # Validate pagination parameters
        try:
            page = max(1, page)  # Ensure page is at least 1
            page_size = max(1, min(page_size, 50))  # Ensure page_size is between 1 and 50
            
            # Get paginated messages
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            paginated_messages = messages[start_idx:end_idx] if messages else []
        except Exception as e:
            print(f"Error during pagination: {str(e)}")
            paginated_messages = []
        
        # Mark messages as read and delivered
        updated = False
        for msg in messages:
            if msg["receiver_id"] == current_user_id:
                if not msg.get("delivered", False):
                    msg["delivered"] = True
                    msg["status"] = "delivered"
                    updated = True
                if not msg.get("read", False):
                    msg["read"] = True
                    msg["status"] = "read"
                    updated = True
        
        # Save if messages were updated
        if updated:
            conversations[conv_key] = conversation
            db.storage.json.put("conversations", conversations)
        
        # Get thread metadata if thread_id is provided
        thread_metadata = None
        if thread_id:
            thread_metadata = get_thread_metadata(thread_id)
            
        # Calculate pagination info
        has_more = end_idx < total_messages
        
        return ThreadResponse(
            messages=[Message(**msg) for msg in paginated_messages],
            thread=thread_metadata,
            total_messages=total_messages,
            has_more=has_more,
            unread_count=unread_count
        )
    except Exception as e:
        print(f"Error getting messages: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting messages: {str(e)}"
        ) from e

@router.post("/messages/typing")
def update_typing_indicator(request: TypingIndicatorRequest, token: TokenRequest):
    """Update typing indicator with automatic cleanup"""
    _cleanup_typing_indicators()
    try:
        sender_id = get_user_id(token.token)
        if not sender_id:
            raise HTTPException(status_code=401, detail="Authentication failed")
        key = f"{sender_id}:{request.receiver_id}"
        
        if request.is_typing:
            typing_indicators[key] = {
                "timestamp": datetime.utcnow(),
                "is_typing": True
            }
        else:
            typing_indicators[key] = {
                "timestamp": datetime.utcnow(),
                "is_typing": False
            }
            
        return {"status": "success"}
    except Exception as e:
        print(f"Error updating typing indicator: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error updating typing indicator: {str(e)}"
        ) from e

@router.get("/messages/typing/{other_user_id}")
def get_typing_status(other_user_id: str, token: TokenRequest):
    """Get typing status for a user"""
    current_user_id = get_user_id(token.token)
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Authentication failed")
        
    if not other_user_id or not isinstance(other_user_id, str):
        raise HTTPException(status_code=422, detail="Invalid user ID format")
        
    try:
        current_user_id = get_user_id(token.token)
        if not current_user_id:
            raise HTTPException(status_code=401, detail="Authentication failed")
        key = f"{other_user_id}:{current_user_id}"
        
        if key in typing_indicators:
            data = typing_indicators[key]
            if datetime.utcnow() - data["timestamp"] < timedelta(seconds=5):
                return {"is_typing": data["is_typing"]}
            typing_indicators.pop(key)
            
        return {"is_typing": False}
    except Exception as e:
        print(f"Error getting typing status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting typing status: {str(e)}"
        ) from e

@router.get("/conversations")
def get_conversations(token: TokenRequest) -> List[Conversation]:
    """Get all conversations for the current user"""
    try:
        current_user_id = get_user_id(token.token)
        if not current_user_id:
            raise HTTPException(status_code=401, detail="Authentication failed")

        # Validate user ID format
        if not isinstance(current_user_id, str) or not current_user_id.strip():
            raise HTTPException(status_code=401, detail="Invalid user ID format")

        # Get conversations and profiles
        conversations = db.storage.json.get("conversations", default={})
        profiles = db.storage.json.get("user_profiles", default={})
        
        user_conversations = []
        for conv_key, conv in conversations.items():
            try:
                # Parse conversation key
                parts = conv_key.split(":")
                if len(parts) != 3 or parts[0] != "conversation":
                    print(f"Skipping invalid conversation key: {conv_key}")
                    continue
                    
                user_ids = parts[1:]
                if current_user_id not in user_ids:
                    continue
                
                # Get other user's profile
                other_user_id = user_ids[0] if user_ids[1] == current_user_id else user_ids[1]
                other_user = profiles.get(other_user_id)
                
                # Create a default profile if not found
                if not other_user:
                    print(f"Creating default profile for user {other_user_id}")
                    other_user = {
                        "name": "Anonymous User",
                        "company": "Unknown Company"
                    }
                
                # Validate messages format
                messages = conv.get("messages", [])
                valid_messages = []
                for msg in messages:
                    try:
                        # Ensure required fields exist
                        if not all(key in msg for key in ["sender_id", "receiver_id", "content", "timestamp"]):
                            print(f"Skipping invalid message in conversation {conv_key}")
                            continue
                        
                        # Convert to Message object to validate
                        valid_messages.append(Message(**msg))
                    except Exception as msg_error:
                        print(f"Error validating message in conversation {conv_key}: {str(msg_error)}")
                        continue
                
                # Count unread messages
                unread_count = sum(
                    1 for msg in valid_messages
                    if msg.receiver_id == current_user_id 
                    and msg.status in [MessageStatus.SENT, MessageStatus.DELIVERED]
                )
                
                # Create conversation object
                conversation = Conversation(
                    messages=valid_messages,
                    other_user={
                        "uid": other_user_id,
                        "display_name": other_user.get("name", "Anonymous User"),
                        "company_name": other_user.get("company", "Unknown Company"),
                    },
                    unread_count=unread_count
                )
                user_conversations.append(conversation)
                    
            except Exception as conv_error:
                print(f"Error processing conversation {conv_key}: {str(conv_error)}")
                continue
        
        # Sort conversations by latest message, handling empty conversations
        try:
            sorted_conversations = sorted(
                user_conversations,
                key=lambda x: max((m.timestamp for m in x.messages), default="0"),
                reverse=True
            )
            return sorted_conversations
        except Exception as e:
            print(f"Error sorting conversations: {str(e)}")
            return user_conversations
        
    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        print(f"Error getting conversations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching conversations: {str(e)}"
        ) from e