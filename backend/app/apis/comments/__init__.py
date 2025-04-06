from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from firebase_admin import auth
import databutton as db
import json
import re

def get_current_user(authorization: str = Depends(lambda: None)) -> Dict:
    """Get the current user from Firebase token"""
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Missing or invalid token')
    
    try:
        token = authorization.split(' ')[1]
        return auth.verify_id_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

router = APIRouter(prefix="/api/comments", tags=["comments", "stream"])

class CommentAttachment(BaseModel):
    id: str
    filename: str
    content_type: str
    size: int
    url: str

class CommentReaction(BaseModel):
    emoji: str
    user_id: str
    created_at: datetime

class CommentReport(BaseModel):
    reason: str
    reporter_id: str
    status: str = "pending"  # pending, reviewed, dismissed
    created_at: datetime

class Comment(BaseModel):
    id: str
    ticket_id: str
    user_id: str
    content: str
    parent_id: Optional[str] = None
    depth: int = 0  # Track nesting level
    attachments: Optional[List[CommentAttachment]] = None
    reactions: Optional[Dict[str, List[CommentReaction]]] = None
    reports: Optional[List[CommentReport]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_edited: bool = False
    is_deleted: bool = False
    moderation_status: str = "approved"  # approved, pending, rejected

class CreateCommentRequest(BaseModel):
    ticket_id: str
    content: str
    parent_id: Optional[str] = None
    attachments: Optional[List[str]] = None  # List of attachment IDs

class UpdateCommentRequest(BaseModel):
    content: str
    attachments: Optional[List[str]] = None  # List of attachment IDs

class ListCommentsResponse(BaseModel):
    comments: List[Comment]

# Helper functions for comment management
def notify_mentioned_users(comment_dict: Dict[str, Any]) -> None:
    """Notify users mentioned in the comment"""
    mentions = re.findall(r'@([\w-]+)', comment_dict['content'])
    
    if mentions:
        try:
            profiles = db.storage.json.get("user_profiles")
            for username in mentions:
                if username in profiles:
                    try:
                        notifications = db.storage.json.get(f"notifications_{username}")
                    except FileNotFoundError:
                        notifications = []
                    
                    notifications.append({
                        "type": "mention",
                        "comment_id": comment_dict['id'],
                        "ticket_id": comment_dict['ticket_id'],
                        "mentioner_id": comment_dict['user_id'],
                        "created_at": datetime.utcnow().isoformat()
                    })
                    
                    db.storage.json.put(f"notifications_{username}", notifications)
        except FileNotFoundError:
            pass

def get_user_comment_count(user_id: str, minutes: int = 5) -> int:
    """Get number of comments created by user in last n minutes"""
    comments = get_comments_store()
    now = datetime.utcnow()
    
    recent_comments = [
        comment for comment in comments.values()
        if comment["user_id"] == user_id 
        and (now - datetime.fromisoformat(comment["created_at"])).total_seconds() < minutes * 60
    ]
    
    return len(recent_comments)

def get_comments_store() -> Dict[str, Any]:
    """Get or initialize the comments storage"""
    try:
        comments = db.storage.json.get("ticket_comments")
    except FileNotFoundError:
        comments = {}
        db.storage.json.put("ticket_comments", comments)
    return comments

@router.post("", response_model=Comment)
def create_comment(body: CreateCommentRequest, background_tasks: BackgroundTasks, current_user: Dict = Depends(get_current_user)) -> Comment:
    """Create a new comment on a ticket"""
    comments = get_comments_store()
    
    # Validate parent_id and calculate depth
    depth = 0
    if body.parent_id:
        if body.parent_id not in comments:
            raise HTTPException(status_code=400, detail="Parent comment not found")
        parent = comments[body.parent_id]
        depth = parent.get("depth", 0) + 1
        if depth > 5:  # Limit nesting to 5 levels
            raise HTTPException(status_code=400, detail="Maximum comment nesting depth exceeded")
    
    # Generate a new comment ID
    comment_id = f"com_{len(comments) + 1}"
    
    # Get attachments if any
    attachments = None
    if body.attachments:
        try:
            attachments_store = db.storage.json.get("ticket_attachments")
            attachments = [
                attachments_store[att_id]
                for att_id in body.attachments
                if att_id in attachments_store
            ]
        except FileNotFoundError:
            # No attachments found
            attachments = []

    # Check rate limiting
    if get_user_comment_count(current_user['uid']) > 10:
        raise HTTPException(
            status_code=429,
            detail="Too many comments. Please wait a few minutes before posting again."
        )
    
    # Validate content length
    if len(body.content) < 2:
        raise HTTPException(
            status_code=400,
            detail="Comment content must be at least 2 characters long"
        )
    if len(body.content) > 10000:
        raise HTTPException(
            status_code=400,
            detail="Comment content must not exceed 10000 characters"
        )
    
    # Create the comment
    now = datetime.utcnow()
    comment = Comment(
        id=comment_id,
        ticket_id=body.ticket_id,
        user_id=current_user['uid'],
        content=body.content,
        parent_id=body.parent_id,
        depth=depth,
        attachments=attachments,
        created_at=now,
        updated_at=now
    )
    
    # Store the comment
    comment_dict = comment.dict()
    comments[comment_id] = comment_dict
    db.storage.json.put("ticket_comments", comments)
    
    
    return comment

@router.get("/tickets/{ticket_id}", response_model=ListCommentsResponse)
def list_comments(ticket_id: str, current_user: Dict = Depends(get_current_user)) -> ListCommentsResponse:
    """Get all comments for a ticket"""
    comments = get_comments_store()
    
    # Filter comments for this ticket
    ticket_comments = [
        Comment(**comment)
        for comment in comments.values()
        if comment["ticket_id"] == ticket_id
    ]
    
    # Sort comments:
    # 1. Root comments by created_at
    # 2. Child comments stay with their parents but are sorted by created_at
    root_comments = [c for c in ticket_comments if not c.parent_id]
    root_comments.sort(key=lambda x: x.created_at)
    
    child_comments = [c for c in ticket_comments if c.parent_id]
    child_comments.sort(key=lambda x: x.created_at)
    
    # Group child comments by parent_id for faster lookup
    children_by_parent = {}
    for comment in child_comments:
        if comment.parent_id not in children_by_parent:
            children_by_parent[comment.parent_id] = []
        children_by_parent[comment.parent_id].append(comment)
    
    # Build the final list maintaining the hierarchy
    result = []
    for root in root_comments:
        result.append(root)
        if root.id in children_by_parent:
            result.extend(children_by_parent[root.id])
    
    return ListCommentsResponse(comments=result)

@router.put("/{comment_id}", response_model=Comment)
def update_comment(comment_id: str, body: UpdateCommentRequest, current_user: Dict = Depends(get_current_user)) -> Comment:
    """Update an existing comment"""
    comments = get_comments_store()
    
    if comment_id not in comments:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment = comments[comment_id]
    
    # Verify ownership
    if comment["user_id"] != current_user['uid']:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
    
    # Update the content
    comment["content"] = body.content
    comment["updated_at"] = datetime.utcnow()
    
    # Update attachments if provided
    if body.attachments is not None:
        try:
            attachments_store = db.storage.json.get("ticket_attachments")
            attachments = [
                attachments_store[att_id]
                for att_id in body.attachments
                if att_id in attachments_store
            ]
            comment["attachments"] = attachments
        except FileNotFoundError:
            # Keep existing attachments
            pass
    
    # Store the updated comment
    comments[comment_id] = comment
    db.storage.json.put("ticket_comments", comments)
    
    
    return Comment(**comment)

@router.post("/{comment_id}/react")
def react_to_comment(comment_id: str, emoji: str, current_user: Dict = Depends(get_current_user)):
    """React to a comment with an emoji"""
    comments = get_comments_store()
    
    if comment_id not in comments:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment = comments[comment_id]
    
    # Initialize reactions if not exists
    if "reactions" not in comment:
        comment["reactions"] = {}
    
    if emoji not in comment["reactions"]:
        comment["reactions"][emoji] = []
    
    # Check if user already reacted with this emoji
    user_reaction = next(
        (r for r in comment["reactions"][emoji] if r["user_id"] == current_user['uid']),
        None
    )
    
    if user_reaction:
        # Remove reaction
        comment["reactions"][emoji] = [
            r for r in comment["reactions"][emoji]
            if r["user_id"] != current_user['uid']
        ]
        if not comment["reactions"][emoji]:
            del comment["reactions"][emoji]
    else:
        # Add reaction
        comment["reactions"][emoji].append({
            "user_id": current_user['uid'],
            "created_at": datetime.utcnow().isoformat()
        })
    
    # Store updated comment
    comments[comment_id] = comment
    db.storage.json.put("ticket_comments", comments)
    
    return {"status": "success", "reactions": comment["reactions"]}

@router.post("/{comment_id}/report")
def report_comment(comment_id: str, reason: str, current_user: Dict = Depends(get_current_user)):
    """Report a comment for moderation"""
    comments = get_comments_store()
    
    if comment_id not in comments:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment = comments[comment_id]
    
    # Initialize reports if not exists
    if "reports" not in comment:
        comment["reports"] = []
    
    # Check if user already reported
    if any(r["reporter_id"] == current_user['uid'] for r in comment["reports"]):
        raise HTTPException(status_code=400, detail="You have already reported this comment")
    
    # Add report
    comment["reports"].append({
        "reason": reason,
        "reporter_id": current_user['uid'],
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    })
    
    # Update moderation status if threshold reached
    if len(comment["reports"]) >= 3:
        comment["moderation_status"] = "pending"
    
    # Store updated comment
    comments[comment_id] = comment
    db.storage.json.put("ticket_comments", comments)
    
    return {"status": "success"}

@router.post("/{comment_id}/moderate")
def moderate_comment(comment_id: str, status: str, current_user: Dict = Depends(get_current_user)):
    """Moderate a reported comment (admin only)"""
    # Verify admin status
    if 'admin' not in current_user.get('roles', []):
        raise HTTPException(status_code=403, detail="Only admins can moderate comments")
    
    comments = get_comments_store()
    
    if comment_id not in comments:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment = comments[comment_id]
    
    # Update moderation status
    comment["moderation_status"] = status
    
    # If rejected, mark as deleted
    if status == "rejected":
        comment["is_deleted"] = True
        comment["content"] = "[This comment has been removed by a moderator]"
    
    # Store updated comment
    comments[comment_id] = comment
    db.storage.json.put("ticket_comments", comments)
    
    return {"status": "success"}

@router.get("/search")
def search_comments(q: str, ticket_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    """Search comments by content"""
    comments = get_comments_store()
    
    # Filter and search comments
    results = [
        Comment(**comment)
        for comment in comments.values()
        if (
            q.lower() in comment["content"].lower() and
            (not ticket_id or comment["ticket_id"] == ticket_id) and
            not comment.get("is_deleted", False) and
            comment.get("moderation_status", "approved") == "approved"
        )
    ]
    
    # Sort by relevance (simple contains match)
    results.sort(key=lambda x: x.content.lower().count(q.lower()), reverse=True)
    
    return {"results": results}

@router.get("/analytics")
def get_comment_analytics(current_user: Dict = Depends(get_current_user)):
    """Get analytics about comments"""
    # Verify admin status
    if 'admin' not in current_user.get('roles', []):
        raise HTTPException(status_code=403, detail="Only admins can view analytics")
    
    comments = get_comments_store()
    
    # Calculate analytics
    total_comments = len(comments)
    comments_by_status = {}
    comments_by_user = {}
    reactions_count = 0
    reports_count = 0
    
    for comment in comments.values():
        # Count by moderation status
        status = comment.get("moderation_status", "approved")
        comments_by_status[status] = comments_by_status.get(status, 0) + 1
        
        # Count by user
        user_id = comment["user_id"]
        comments_by_user[user_id] = comments_by_user.get(user_id, 0) + 1
        
        # Count reactions
        if "reactions" in comment:
            for emoji in comment["reactions"]:
                reactions_count += len(comment["reactions"][emoji])
        
        # Count reports
        if "reports" in comment:
            reports_count += len(comment["reports"])
    
    return {
        "total_comments": total_comments,
        "comments_by_status": comments_by_status,
        "comments_by_user": comments_by_user,
        "total_reactions": reactions_count,
        "total_reports": reports_count
    }

@router.delete("/{comment_id}")
def delete_comment(comment_id: str, current_user: Dict = Depends(get_current_user)):
    """Delete a comment"""
    comments = get_comments_store()
    
    if comment_id not in comments:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment = comments[comment_id]
    
    # Verify ownership
    if comment["user_id"] != current_user['uid']:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    # Soft delete the comment
    comment["is_deleted"] = True
    comment["content"] = "[This comment has been deleted]"
    comment["updated_at"] = datetime.utcnow()
    
    # Store the updated comment
    comments[comment_id] = comment
    db.storage.json.put("ticket_comments", comments)
    
    
    return {"status": "success"}
