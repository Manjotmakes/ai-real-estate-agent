import os
from dotenv import load_dotenv
from models import properties_collection, email_replies_collection
from email_utils import gmail_authenticate
from pprint import pprint

load_dotenv()

def test_database_connections():
    """Test MongoDB connections"""
    print("🔍 Testing database connections...")
    
    try:
        # Test properties collection
        prop_count = properties_collection.count_documents({})
        print(f"✅ Properties collection: {prop_count} documents")
        
        # Test email_replies collection
        reply_count = email_replies_collection.count_documents({})
        print(f"✅ Email replies collection: {reply_count} documents")
        
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_gmail_connection():
    """Test Gmail API connection"""
    print("\n🔍 Testing Gmail API connection...")
    
    try:
        service = gmail_authenticate()
        profile = service.users().getProfile(userId="me").execute()
        print(f"✅ Gmail connected: {profile.get('emailAddress', 'Unknown')}")
        return True
    except Exception as e:
        print(f"❌ Gmail connection failed: {e}")
        return False

def show_sent_emails_summary():
    """Show summary of sent emails"""
    print("\n📤 Sent emails summary:")
    
    properties_with_emails = list(properties_collection.find({"sent_emails": {"$exists": True, "$ne": []}}))
    
    if not properties_with_emails:
        print("❌ No sent emails found in database")
        return
    
    total_sent = 0
    for prop in properties_with_emails:
        sent_emails = prop.get("sent_emails", [])
        total_sent += len(sent_emails)
        
        print(f"\n🏢 Property: {prop.get('address', 'Unknown')}")
        for i, email in enumerate(sent_emails, 1):
            print(f"   📧 Email {i}:")
            print(f"      To: {email.get('contact_person', 'Unknown')}")
            print(f"      Subject: {email.get('subject', 'No subject')}")
            print(f"      Gmail Message ID: {email.get('gmail_message_id', 'Unknown')}")
            print(f"      Email Message ID: {email.get('email_message_id', 'Unknown')}")
            print(f"      Sent: {email.get('timestamp', 'Unknown')}")
    
    print(f"\n📊 Total sent emails: {total_sent}")

def show_received_replies_summary():
    """Show summary of received replies"""
    print("\n📬 Received replies summary:")
    
    replies = list(email_replies_collection.find().sort("timestamp", -1))
    
    if not replies:
        print("❌ No replies found in database")
        return
    
    print(f"📊 Total replies: {len(replies)}")
    
    for i, reply in enumerate(replies, 1):
        print(f"\n📧 Reply {i}:")
        print(f"   🏢 Property: {reply.get('property_address', 'Unknown')}")
        print(f"   👤 From: {reply.get('contact_person', 'Unknown')}")
        print(f"   📧 From Email: {reply.get('from_email', 'Unknown')}")
        print(f"   📝 Subject: {reply.get('subject', 'No subject')}")
        print(f"   🕒 Received: {reply.get('timestamp', 'Unknown')}")
        
        parsed_data = reply.get('parsed_data', {})
        if isinstance(parsed_data, dict) and parsed_data:
            print(f"   📊 Extracted data:")
            for key, value in parsed_data.items():
                if key not in ['raw_response', 'parsing_error', 'error', 'raw_body']:
                    print(f"      {key}: {value}")
        
        # Show a preview of the email body
        body = reply.get('raw_body', '')
        if body:
            preview = body.strip()[:200]
            print(f"   📄 Body preview: {preview}{'...' if len(body) > 200 else ''}")

def check_recent_inbox_messages():
    """Check recent inbox messages for debugging"""
    print("\n🔍 Checking recent inbox messages (for debugging)...")
    
    try:
        service = gmail_authenticate()
        response = service.users().messages().list(
            userId="me", 
            labelIds=["INBOX"], 
            maxResults=10
        ).execute()
        messages = response.get("messages", [])
        
        if not messages:
            print("📭 No messages in inbox")
            return
        
        print(f"📧 Found {len(messages)} recent messages:")
        
        # Get sent message IDs with better debugging
        sent_gmail_ids = set()
        sent_email_ids = set()
        sent_email_ids_clean = set()  # Without angle brackets
        
        print("\n🔍 Collecting sent message IDs from database...")
        for prop in properties_collection.find({"sent_emails": {"$exists": True, "$ne": []}}):
            for sent in prop.get("sent_emails", []):
                gmail_id = sent["gmail_message_id"]
                email_id = sent.get("email_message_id", "")
                
                sent_gmail_ids.add(gmail_id)
                print(f"   📤 Gmail ID: {gmail_id}")
                
                if email_id and email_id.strip():
                    sent_email_ids.add(email_id)
                    # Also store without angle brackets for comparison
                    clean_id = email_id.strip("<>")
                    sent_email_ids_clean.add(clean_id)
                    print(f"   📤 Email ID (with brackets): {email_id}")
                    print(f"   📤 Email ID (clean): {clean_id}")
        
        print(f"\n📋 Summary of IDs to match:")
        print(f"   Gmail IDs: {len(sent_gmail_ids)}")
        print(f"   Email IDs (with brackets): {len(sent_email_ids)}")
        print(f"   Email IDs (clean): {len(sent_email_ids_clean)}")
        
        for i, msg in enumerate(messages, 1):
            try:
                full_msg = service.users().messages().get(
                    userId="me", 
                    id=msg["id"], 
                    format="full"
                ).execute()
                
                headers = full_msg.get("payload", {}).get("headers", [])
                
                subject = "No Subject"
                from_email = "Unknown"
                in_reply_to = None
                references = None
                
                for header in headers:
                    name = header["name"].lower()
                    if name == "subject":
                        subject = header["value"]
                    elif name == "from":
                        from_email = header["value"]
                    elif name == "in-reply-to":
                        in_reply_to = header["value"]
                    elif name == "references":
                        references = header["value"]
                
                # Check for matches with detailed debugging
                is_gmail_match = in_reply_to and in_reply_to in sent_gmail_ids
                is_email_match_with_brackets = in_reply_to and f"<{in_reply_to}>" in sent_email_ids
                is_email_match_clean = in_reply_to and in_reply_to in sent_email_ids_clean
                is_references_match = False
                
                if references:
                    for sent_id in sent_gmail_ids.union(sent_email_ids_clean):
                        if sent_id in references:
                            is_references_match = True
                            break
                
                is_reply_to_our_email = (is_gmail_match or is_email_match_with_brackets or 
                                       is_email_match_clean or is_references_match)
                
                print(f"\n   📧 Message {i}:")
                print(f"      ID: {msg['id']}")
                print(f"      From: {from_email}")
                print(f"      Subject: {subject}")
                print(f"      In-Reply-To: {in_reply_to or 'None'}")
                print(f"      References: {references[:100] + '...' if references and len(references) > 100 else references or 'None'}")
                print(f"      🔍 Match Analysis:")
                print(f"         Gmail ID match: {'✅' if is_gmail_match else '❌'}")
                print(f"         Email ID match (with brackets): {'✅' if is_email_match_with_brackets else '❌'}")
                print(f"         Email ID match (clean): {'✅' if is_email_match_clean else '❌'}")
                print(f"         References match: {'✅' if is_references_match else '❌'}")
                print(f"      Is reply to our email: {'✅ YES' if is_reply_to_our_email else '❌ NO'}")
                
            except Exception as e:
                print(f"   ⚠️ Error reading message {i}: {e}")
    
    except Exception as e:
        print(f"❌ Failed to check inbox: {e}")

def clear_test_data():
    """Clear test data (use with caution)"""
    print("\n⚠️ CAUTION: This will clear all email replies data!")
    response = input("Are you sure you want to clear all reply data? (yes/no): ")
    
    if response.lower() == 'yes':
        try:
            result = email_replies_collection.delete_many({})
            print(f"✅ Cleared {result.deleted_count} reply documents")
        except Exception as e:
            print(f"❌ Failed to clear data: {e}")
    else:
        print("❌ Operation cancelled")

def main():
    """Main test function"""
    print("🧪 Email Reply System Test Suite")
    print("=" * 50)
    
    # Test database connections
    if not test_database_connections():
        return
    
    # Test Gmail connection
    if not test_gmail_connection():
        return
    
    while True:
        print("\n" + "=" * 50)
        print("Choose an option:")
        print("1. Show sent emails summary")
        print("2. Show received replies summary")
        print("3. Check recent inbox messages (debug)")
        print("4. Clear all reply data (CAUTION)")
        print("5. Exit")
        
        choice = input("Enter your choice (1-5): ").strip()
        
        if choice == "1":
            show_sent_emails_summary()
        elif choice == "2":
            show_received_replies_summary()
        elif choice == "3":
            check_recent_inbox_messages()
        elif choice == "4":
            clear_test_data()
        elif choice == "5":
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main()