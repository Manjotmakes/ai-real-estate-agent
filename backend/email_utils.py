import base64
import os
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials  # type: ignore
from google_auth_oauthlib.flow import InstalledAppFlow  # type: ignore
from googleapiclient.discovery import build  # type: ignore
from google.auth.transport.requests import Request  # type: ignore

SCOPES = ['https://www.googleapis.com/auth/gmail.modify']
TOKEN_PATH = "token.json"
CREDENTIALS_PATH = "credentials.json"

def gmail_authenticate():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request()) 
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_PATH, SCOPES
            )
            creds = flow.run_local_server(port=0)
        with open(TOKEN_PATH, 'w') as token:
            token.write(creds.to_json())
    service = build('gmail', 'v1', credentials=creds)
    return service


def get_email_conversation(property_data) -> list:
    """
    Get email conversation for a property based on sent emails and replies
    Returns list of emails in chronological order
    """
    service = gmail_authenticate()
    conversation_emails = []
    
    try:
        # Get sent emails from property data
        sent_emails = property_data.get('sent_emails', [])
        
        # For each sent email, get the full thread
        for sent_email in sent_emails:
            gmail_msg_id = sent_email.get('gmail_message_id')
            if gmail_msg_id:
                try:
                    # Get the message to find its thread ID
                    message = service.users().messages().get(
                        userId="me", 
                        id=gmail_msg_id,
                        format="full"
                    ).execute()
                    
                    thread_id = message.get('threadId')
                    if thread_id:
                        # Get the entire thread
                        thread = service.users().threads().get(
                            userId="me",
                            id=thread_id,
                            format="full"
                        ).execute()
                        
                        # Process each message in the thread
                        for msg in thread.get('messages', []):
                            email_data = parse_email_message(msg)
                            if email_data:
                                conversation_emails.append(email_data)
                        
                        for msg in thread.get('messages', []):
                            email_data = parse_email_message(msg)
                            if email_data:
                                conversation_emails.append(email_data)
                        
                except Exception as e:
                    print(f"Error fetching thread for message {gmail_msg_id}: {e}")
                    
        # Remove duplicates and sort by date
        seen_ids = set()
        unique_emails = []
        for email in conversation_emails:
            if email['id'] not in seen_ids:
                unique_emails.append(email)
                seen_ids.add(email['id'])
        
        # Sort by date (oldest first)
        unique_emails.sort(key=lambda x: x.get('date', ''))
        
        return unique_emails
        
    except Exception as e:
        print(f"Error fetching email conversation: {e}")
        return []

def parse_email_message(message) -> dict:
    """Parse Gmail message into structured data"""
    try:
        headers = message.get('payload', {}).get('headers', [])
        
        # Extract headers
        subject = ""
        from_email = ""
        to_email = ""
        date = ""
        
        for header in headers:
            name = header.get('name', '').lower()
            value = header.get('value', '')
            
            if name == 'subject':
                subject = value
            elif name == 'from':
                from_email = value
            elif name == 'to':
                to_email = value
            elif name == 'date':
                date = value
        
        # Extract body
        body = extract_message_body(message.get('payload', {}))
        
        return {
            'id': message.get('id'),
            'subject': subject,
            'from': from_email,
            'to': to_email,
            'date': date,
            'body': body,
            'snippet': message.get('snippet', '')
        }
        
    except Exception as e:
        print(f"Error parsing email message: {e}")
        return None

def extract_message_body(payload):
    """Extract body text from email payload"""
    try:
        body = ""
        
        if 'parts' in payload:
            for part in payload['parts']:
                if part.get('mimeType') == 'text/plain':
                    data = part.get('body', {}).get('data')
                    if data:
                        body = base64.urlsafe_b64decode(data).decode('utf-8')
                        break
        else:
            if payload.get('mimeType') == 'text/plain':
                data = payload.get('body', {}).get('data')
                if data:
                    body = base64.urlsafe_b64decode(data).decode('utf-8')
        
        return body
        
    except Exception as e:
        print(f"Error extracting message body: {e}")
        return ""
    
    
def send_email(recipient: str, subject: str, body: str) -> dict | None:
    """
    Send email and return both Gmail Message ID and Email Message-ID
    Returns: {"gmail_message_id": "abc123", "email_message_id": "xyz@mail.gmail.com"} or None
    """
    service = gmail_authenticate()
    message = MIMEText(body)
    message['to'] = recipient
    message['from'] = "me"
    message['subject'] = subject

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    try:
        sent_message = service.users().messages().send(
            userId="me",
            body={"raw": raw_message}
        ).execute()
        
        gmail_msg_id = sent_message['id']
        print(f"Message sent to {recipient}: {gmail_msg_id}")
        
        # Get the full message to extract the Email Message-ID
        try:
            full_message = service.users().messages().get(
                userId="me", 
                id=gmail_msg_id, 
                format="full"
            ).execute()
            
            headers = full_message.get("payload", {}).get("headers", [])
            email_message_id = None
            
            for header in headers:
                if header["name"].lower() == "message-id":
                    email_message_id = header["value"]
                    print(f"📧 Email Message-ID found: {email_message_id}")
                    break
            
            if not email_message_id:
                print("⚠️ No Message-ID header found in sent email")
            
            return {
                "gmail_message_id": gmail_msg_id,
                "email_message_id": email_message_id if email_message_id else ""
            }
            
        except Exception as e:
            print(f"⚠️ Could not get Email Message-ID: {e}")
            # Return just the Gmail Message ID if we can't get the Email Message-ID
            return {
                "gmail_message_id": gmail_msg_id,
                "email_message_id": ""
            }
        
    except Exception as e:
        print(f"Failed to send email to {recipient}: {e}")
        return None  # ⛔ fallback return