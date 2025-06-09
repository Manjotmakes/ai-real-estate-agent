import os
from dotenv import load_dotenv  # type: ignore
from models import properties_collection
from email_utils import send_email
import asyncio
import json
from datetime import datetime


from autogen_agentchat.agents import AssistantAgent  # type: ignore
from autogen_core.models import UserMessage  # type: ignore
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
        "vision": True,
        "family": "unknown",
        "structured_output": True,
    },
)

# Define agent to generate emails
email_agent = AssistantAgent(
    name="email_sender_agent",
    model_client=client,
    description="Creates personalized email inquiries for properties.",
    system_message="""
You are a professional real estate assistant. Your job is to write a polite and concise email to a property contact person,
asking for the current availability status, price of the property, and latest asking rent of a property.

The tone should be professional but friendly.
Begin the email with the contact person's name.
End the email by expressing interest and requesting a reply with updates.
Sign every email with:

Best regards,  
Manjot Singh  
raviking2311@gmail.com

IMPORTANT:
Return ONLY a valid JSON object with two fields: "subject" and "body".
Example:
{
  "subject": "Inquiry on Property Availability and Pricing",
  "body": "Dear [Contact Name],\\n\\nI hope this message finds you well..."
}
"""
)

def format_property_for_agent(property_data: dict, contact_person: str) -> str:
    return (
        f"Contact Person: {contact_person}\n"
        f"Property Address: {property_data.get('address', 'Unknown')}\n"
        f"Submarket: {property_data.get('submarket', 'Unknown')}\n"
        f"True Owner: {property_data.get('true_owner', 'Unknown')}\n"
        f"Asking Rent: {property_data.get('asking_rent', 'Unknown')}\n"
        f"Available SF: {property_data.get('sf_available', 'Unknown')} sq ft\n"
    )

async def run_email_agent_for_all_properties():
    properties = list(properties_collection.find())

    if not properties:
        print("No properties found in MongoDB.")
        return

    total_emails_sent = 0

    for i, prop in enumerate(properties, start=1):
        contact_persons = prop.get("owner_contact_persons", ["Unknown Contact"])

        for contact_person in contact_persons:
            print(f"\n📩 Property {i}: Emailing contact → {contact_person}")

            prompt = (
                "Generate a professional email addressed to the contact person below "
                "asking about property availability, pricing, and rent.\n\n"
                + format_property_for_agent(prop, contact_person)
            )

            # Run the agent
            agent_response = await email_agent.run(task=prompt)

            email_subject = None
            email_body = None

            # Extract content
            messages = agent_response.messages if hasattr(agent_response, "messages") else [agent_response]
            content = None
            for message in reversed(messages):
                if getattr(message, "source", None) == "email_sender_agent":
                    content = getattr(message, "content", None)
                    break

            if not content:
                print(f"⚠️ No response for {contact_person}")
                continue

            try:
                parsed = json.loads(content)
                email_subject = parsed.get("subject")
                email_body = parsed.get("body")
            except Exception as e:
                print(f"⚠️ JSON parsing failed: {e}")
                email_subject = f"Inquiry: Property at {prop.get('address', 'Unknown')}"
                email_body = content

            if not email_body:
                print(f"⚠️ No body for {contact_person}, skipping...")
                continue

            if not email_subject:
                email_subject = f"Inquiry: Property at {prop.get('address', 'Unknown')}"

            # Send the email
            try:
                email_result = send_email(
                    recipient=prop.get("contact_email", "raviking2311@gmail.com"),
                    subject=email_subject,
                    body=email_body
                )

                if email_result and email_result.get("gmail_message_id"):
                    print(f"✅ Email sent to {contact_person}")
                    total_emails_sent += 1

                    # Store metadata into MongoDB with BOTH IDs
                    email_data = {
                        "contact_person": contact_person,
                        "contact_email": prop.get("contact_email", ""),
                        "subject": email_subject,
                        "body": email_body,
                        "gmail_message_id": email_result["gmail_message_id"],
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    # Add Email Message-ID if available
                    if email_result.get("email_message_id"):
                        email_data["email_message_id"] = email_result["email_message_id"]
                    
                    properties_collection.update_one(
                        {"_id": prop["_id"]},
                        {"$push": {"sent_emails": email_data}}
                    )
                else:
                    print(f"⚠️ Email sent but no message ID returned. Skipping DB update.")
            except Exception as e:
                print(f"❌ Failed to send email to {contact_person}: {e}")

    print(f"\n📬 Total emails sent: {total_emails_sent}")

    if hasattr(client, "close") and callable(client.close):
        await client.close()

if __name__ == "__main__":
    asyncio.run(run_email_agent_for_all_properties())