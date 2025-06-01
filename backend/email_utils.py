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