from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, BackgroundTasks
import databutton as db
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

class EmailNotification(BaseModel):
    recipient_email: str
    subject: str
    content: str

def send_email(notification: EmailNotification):
    """Send an email notification"""
    try:
        smtp_server = db.secrets.get("SMTP_SERVER")
        smtp_port = int(db.secrets.get("SMTP_PORT"))
        smtp_username = db.secrets.get("SMTP_USERNAME")
        smtp_password = db.secrets.get("SMTP_PASSWORD")
        sender_email = db.secrets.get("SENDER_EMAIL")
        
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = notification.recipient_email
        msg["Subject"] = notification.subject
        
        msg.attach(MIMEText(notification.content, "html"))
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
            
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email notification")

def notify_ticket_update(ticket_id: str, update_type: str, user_id: str, background_tasks: BackgroundTasks):
    """Send notification for ticket updates"""
    try:
        # Get ticket details
        tickets = db.storage.json.get("support_tickets")
        ticket = tickets.get(ticket_id)
        if not ticket:
            return
            
        # Get user profile for email
        profiles = db.storage.json.get("user_profiles")
        user_profile = profiles.get(user_id)
        if not user_profile or not user_profile.get("email"):
            return
            
        # Prepare notification
        subject = f"Ticket Update: {ticket['title']}"
        content = f"""
        <h2>Ticket Update</h2>
        <p>Your ticket <strong>{ticket['title']}</strong> has been updated.</p>
        <p>Update type: {update_type}</p>
        <p>Click <a href='/tickets/{ticket_id}'>here</a> to view the ticket.</p>
        """
        
        notification = EmailNotification(
            recipient_email=user_profile["email"],
            subject=subject,
            content=content
        )
        
        # Send email in background
        background_tasks.add_task(send_email, notification)
        
    except Exception as e:
        print(f"Failed to send ticket notification: {str(e)}")

@router.post("/test-email")
def test_email_notification(notification: EmailNotification, background_tasks: BackgroundTasks):
    """Test endpoint for email notifications"""
    background_tasks.add_task(send_email, notification)
    return {"status": "Email notification queued"}
