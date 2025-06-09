import os
import json
import base64
from datetime import datetime
from dotenv import load_dotenv  # type: ignore
from models import properties_collection, email_replies_collection
from email_utils import gmail_authenticate

from autogen_agentchat.agents import AssistantAgent  # type: ignore
from autogen_ext.models.azure import AzureAIChatCompletionClient  # type: ignore
from azure.core.credentials import AzureKeyCredential  # type: ignore

load_dotenv()

# Setup model client
client = AzureAIChatCompletionClient(
    model="gpt-4o-mini",
    endpoint="https://models.inference.ai.azure.com",
    credential=AzureKeyCredential(os.environ["GITHUB_TOKEN"]),
    model_info={
        "json_output": True,
        "function_calling": True,
        "vision": False,
        "family": "unknown",
        "structured_output": True,
    },
)

# Agent to extract updated property data from email replies
reply_extractor_agent = AssistantAgent(
    name="reply_extractor_agent",
    model_client=client,
    system_message="""
You are a real estate assistant. You will be given the text of a reply to a property inquiry.
Your job is to extract structured updates from the reply.

Look for:
- updated asking rent (e.g., $28/SF, $25 per square foot, $30/sq ft, etc.)
- updated square footage available (e.g., 20,000 SF, 15000 sq ft, etc.)
- availability status (e.g., Available, Leased, Not available, Under contract, etc.)
- any other relevant property information

IMPORTANT: Return ONLY a valid JSON object. Do not include any other text or explanation.
Omit fields that are not mentioned in the email.

Example response:
{
  "asking_rent": "$28/SF",
  "sf_available": 20000,
  "availability_status": "Available",
  "additional_notes": "Property will be available starting next month"
}
"""
)

def extract_reply_body(payload):
    """Extract text body from Gmail message payload"""
    def get_body_recursive(parts):
        body_text = ""
        for part in parts:
            if part.get("mimeType") == "text/plain":
                data = part.get("body", {}).get("data")
                if data:
                    try:
                        decoded = base64.urlsafe_b64decode(data).decode("utf-8")
                        body_text += decoded + "\n"
                    except Exception as e:
                        print(f"⚠️ Failed to decode part: {e}")
            elif part.get("mimeType") == "multipart/alternative" and "parts" in part:
                body_text += get_body_recursive(part["parts"])
        return body_text
    
    # Handle different message structures
    if "parts" in payload:
        return get_body_recursive(payload["parts"])
    else:
        # Single part message
        data = payload.get("body", {}).get("data")
        if data:
            try:
                return base64.urlsafe_b64decode(data).decode("utf-8")
            except Exception as e:
                print(f"⚠️ Failed to decode message body: {e}")
    
    return None

async def process_replies():
    """Process email replies and extract property updates"""
    service = gmail_authenticate()
    print("🔍 Starting to process email replies...")

    # Fetch the latest 50 inbox messages to catch more replies
    try:
        response = service.users().messages().list(
            userId="me", 
            labelIds=["INBOX"], 
            maxResults=50
        ).execute()
        messages = response.get("messages", [])
    except Exception as e:
        print(f"❌ Failed to fetch emails: {e}")
        return

    if not messages:
        print("📭 No emails found in inbox.")
        return

    print(f"📧 Found {len(messages)} messages in inbox")

    # Get all sent message IDs from our database (both Gmail and Email Message IDs)
    sent_gmail_ids = set()
    sent_email_ids = set()
    sent_email_ids_clean = set()  # Without angle brackets for matching
    properties_with_sent_emails = list(properties_collection.find({"sent_emails": {"$exists": True, "$ne": []}}))
    
    for prop in properties_with_sent_emails:
        for sent in prop.get("sent_emails", []):
            sent_gmail_ids.add(sent["gmail_message_id"])
            # Only add to sent_email_ids if it's not empty
            if sent.get("email_message_id") and sent["email_message_id"].strip():
                email_id = sent["email_message_id"]
                sent_email_ids.add(email_id)
                # Also store without angle brackets for comparison
                clean_id = email_id.strip("<>")
                sent_email_ids_clean.add(clean_id)
    
    print(f"📤 Found {len(sent_gmail_ids)} Gmail message IDs and {len(sent_email_ids)} Email message IDs to match against")
    print(f"🔍 Gmail IDs: {list(sent_gmail_ids)[:3]}...")  # Show first 3 for debugging
    print(f"🔍 Email IDs (with brackets): {list(sent_email_ids)[:3]}...")   # Show first 3 for debugging
    print(f"🔍 Email IDs (clean): {list(sent_email_ids_clean)[:3]}...")   # Show first 3 for debugging

    # Get already processed reply IDs to avoid duplicates
    processed_reply_ids = set()
    for reply in email_replies_collection.find({}, {"gmail_reply_id": 1}):
        if "gmail_reply_id" in reply:
            processed_reply_ids.add(reply["gmail_reply_id"])

    replies_processed = 0

    for msg in messages:
        msg_id = msg["id"]
        
        # Skip if already processed
        if msg_id in processed_reply_ids:
            continue
            
        try:
            # Get full message details
            full_msg = service.users().messages().get(
                userId="me", 
                id=msg_id, 
                format="full"
            ).execute()
            
            headers = full_msg.get("payload", {}).get("headers", [])
            
            # Extract relevant headers
            in_reply_to = None
            references = None
            subject = "No Subject"
            from_email = "Unknown"
            
            for header in headers:
                name = header["name"].lower()
                value = header["value"]
                
                if name == "in-reply-to":
                    in_reply_to = value.strip("<>")
                elif name == "references":
                    references = value
                elif name == "subject":
                    subject = value
                elif name == "from":
                    from_email = value
            
            print(f"\n🔍 Checking message: {msg_id}")
            print(f"   From: {from_email}")
            print(f"   Subject: {subject}")
            print(f"   In-Reply-To: {in_reply_to}")
            
            # Extract message body
            body = extract_reply_body(full_msg.get("payload", {}))
            
            if not body or not body.strip():
                print("   ⚠️ No body content, skipping...")
                continue
                
            # Check if this is a reply to one of our sent emails
            reply_to_message_id = None
            matched_sent_email = None
            
            # Method 1: Check In-Reply-To header against Email Message IDs
            if in_reply_to and in_reply_to in sent_email_ids:
                reply_to_message_id = in_reply_to
                print(f"   🎯 Found reply match via In-Reply-To Email ID: {in_reply_to}")
            
            # Method 2: Check In-Reply-To header against Gmail Message IDs (fallback)
            elif in_reply_to and in_reply_to in sent_gmail_ids:
                reply_to_message_id = in_reply_to
                print(f"   🎯 Found reply match via Gmail ID: {in_reply_to}")
            
            # Method 3: Check references header for any of our sent message IDs
            elif references:
                for sent_id in sent_email_ids.union(sent_gmail_ids):
                    if sent_id in references:
                        reply_to_message_id = sent_id
                        print(f"   🎯 Found reply match via References: {sent_id}")
                        break
            
            if not reply_to_message_id:
                print("   ❌ Not a reply to our emails")
                continue
                
            # Find the matching property and email
            matched_property = None
            matched_email = None
            
            for prop in properties_with_sent_emails:
                for sent in prop.get("sent_emails", []):
                    # Check both Gmail Message ID and Email Message ID
                    if (sent["gmail_message_id"] == reply_to_message_id or 
                        (sent.get("email_message_id") and sent["email_message_id"] == reply_to_message_id)):
                        matched_property = prop
                        matched_email = sent
                        break
                if matched_property:
                    break
            
            if not matched_property:
                print(f"   ❌ No matching property found for reply ID: {reply_to_message_id}")
                continue
                
            print(f"\n📬 Reply found for property: {matched_property['address']}")
            print(f"👤 From: {from_email}")
            print(f"📧 Subject: {subject}")
            print(f"📝 Body preview: {body[:100]}...")
            
            # Use the agent to extract structured data
            try:
                print("🤖 Running AI agent to extract property data...")
                
                # Create a more detailed prompt for the agent
                agent_prompt = f"""
Extract property information from this email reply:

ORIGINAL INQUIRY DETAILS:
- Property Address: {matched_property.get('address', 'Unknown')}
- Contact Person: {matched_email.get('contact_person', 'Unknown')}
- Current Asking Rent: {matched_property.get('asking_rent', 'Unknown')}
- Current Available SF: {matched_property.get('sf_available', 'Unknown')}

EMAIL REPLY TEXT:
{body}

Extract any updates to asking rent, available square footage, availability status, or other relevant property information.
"""
                
                result = await reply_extractor_agent.run(task=agent_prompt)
                
                # Extract the response content
                response_content = None
                if hasattr(result, 'messages') and result.messages:
                    response_content = result.messages[-1].content
                else:
                    response_content = str(result)
                
                print(f"🤖 Agent response: {response_content}")
                
                # Parse the JSON response
                try:
                    parsed_data = json.loads(response_content)
                except json.JSONDecodeError as e:
                    print(f"⚠️ JSON parsing failed: {e}")
                    print(f"Raw response: {response_content}")
                    # Store raw response if JSON parsing fails
                    parsed_data = {"raw_response": response_content, "parsing_error": str(e)}
                
            except Exception as e:
                print(f"⚠️ Agent failed to process reply: {e}")
                parsed_data = {"error": str(e), "raw_body": body}
            
            # Store the reply in the database
            reply_document = {
                "gmail_reply_id": msg_id,
                "reply_to_id": matched_email["gmail_message_id"],
                "property_id": matched_property["_id"],
                "property_address": matched_property.get("address", "Unknown"),
                "contact_person": matched_email["contact_person"],
                "from_email": from_email,
                "subject": subject,
                "raw_body": body,
                "parsed_data": parsed_data,
                "timestamp": datetime.utcnow().isoformat(),
                "processed_at": datetime.utcnow().isoformat()
            }
            
            try:
                email_replies_collection.insert_one(reply_document)
                print(f"✅ Reply stored in database for contact: {matched_email['contact_person']}")
                replies_processed += 1
            except Exception as e:
                print(f"❌ Failed to store reply in database: {e}")
                
        except Exception as e:
            print(f"⚠️ Error processing message {msg_id}: {e}")
            continue
    
    print(f"\n📊 Processing complete!")
    print(f"✅ New replies processed: {replies_processed}")
    
    # Display summary of extracted data
    if replies_processed > 0:
        print("\n📋 Summary of extracted data:")
        recent_replies = list(email_replies_collection.find().sort("processed_at", -1).limit(replies_processed))
        for reply in recent_replies:
            print(f"\n🏢 Property: {reply.get('property_address', 'Unknown')}")
            print(f"👤 Contact: {reply.get('contact_person', 'Unknown')}")
            parsed = reply.get('parsed_data', {})
            if isinstance(parsed, dict) and parsed:
                for key, value in parsed.items():
                    if key not in ['raw_response', 'parsing_error', 'error']:
                        print(f"   {key}: {value}")

def main():
    """Main function to run the reply processor"""
    try:
        import asyncio
        asyncio.run(process_replies())
    except KeyboardInterrupt:
        print("\n⚠️ Process interrupted by user")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()