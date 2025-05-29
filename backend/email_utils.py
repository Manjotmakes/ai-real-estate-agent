# email_utils.py

import base64
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials # type: ignore
from google_auth_oauthlib.flow import InstalledAppFlow  # type: ignore
from googleapiclient.discovery import build         # type: ignore
import os

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def gmail_authenticate():
    creds = None
    token_path = "token.json"

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            "credentials.json",
            scopes=SCOPES
        )
        creds = flow.run_local_server(port=0)
        with open(token_path, "w") as token:
            token.write(creds.to_json())

    service = build('gmail', 'v1', credentials=creds)
    return service


def send_email(recipient, subject, body):
    service = gmail_authenticate()

    message = MIMEText(body)
    message['to'] = recipient
    message['from'] = "me"
    message['subject'] = subject

    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    send_result = service.users().messages().send(
        userId="me",
        body={"raw": encoded_message}
    ).execute()

    print(f"Message sent to {recipient}: {send_result['id']}")
