import base64
import os
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials  # type: ignore
from google_auth_oauthlib.flow import InstalledAppFlow  # type: ignore
from googleapiclient.discovery import build  # type: ignore
from google.auth.transport.requests import Request  # type: ignore

SCOPES = ['https://www.googleapis.com/auth/gmail.send']
TOKEN_PATH = "token.json"
CREDENTIALS_PATH = "credentials.json"

def gmail_authenticate():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())  # ✅ Now this will work correctly
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_PATH, SCOPES
            )
            creds = flow.run_local_server(port=0)
        with open(TOKEN_PATH, 'w') as token:
            token.write(creds.to_json())
    service = build('gmail', 'v1', credentials=creds)
    return service

def send_email(recipient: str, subject: str, body: str):
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
        print(f"Message sent to {recipient}: {sent_message['id']}")
    except Exception as e:
        print(f"Failed to send email to {recipient}: {e}")
