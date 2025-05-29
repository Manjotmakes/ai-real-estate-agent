import os
from dotenv import load_dotenv  # type: ignore
from models import properties_collection
from email_utils import send_email
import asyncio
import json

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
    You are a professional real estate assistant. Your job is to write a polite and concise email to a property dealer,
    asking for the current availability status, price of the property, and latest asking rent of a property.

    The tone should be professional but friendly.
    End the email by expressing interest and requesting a reply with updates.

    IMPORTANT:
    Return ONLY a valid JSON object with two fields: "subject" and "body".
    Example:
    {
      "subject": "Inquiry on Property Availability and Pricing",
      "body": "Dear [Property Contact's Name],\\n\\nI hope this message finds you well..."
    }
    """
)

# Helper: format MongoDB property into input for the agent
def format_property_for_agent(property_data: dict) -> str:
    return (
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

    for i, prop in enumerate(properties, start=1):
        print(f"\n📩 [{i}/{len(properties)}] Processing property at: {prop.get('address')}")

        prompt = (
            "Please write an email to the property contact asking for updated price and availability "
            "based on the following property details. Return ONLY a JSON object with 'subject' and 'body' fields:\n\n"
            + format_property_for_agent(prop)
        )

        # Run the agent
        agent_response = await email_agent.run(task=prompt)

        email_subject = None
        email_body = None

        # Handle response: check for .messages attribute or list or str
        messages = None
        if hasattr(agent_response, "messages"):
            messages = agent_response.messages
        elif isinstance(agent_response, list):
            messages = agent_response
        else:
            messages = [agent_response]

        content = None
        # Look for last message from this agent
        for message in reversed(messages):
            if getattr(message, "source", None) == "email_sender_agent":
                content = getattr(message, "content", None)
                break

        if content is None:
            print("⚠️ No content found in agent messages, skipping property.")
            continue

        # Try to parse JSON response safely
        try:
            parsed = json.loads(content)
            email_subject = parsed.get("subject")
            email_body = parsed.get("body")
        except Exception as e:
            print(f"⚠️ Failed to parse JSON from agent response: {e}")
            # fallback: treat whole response as body with generic subject
            email_body = content
            email_subject = f"Inquiry: Property at {prop.get('address', 'Unknown')}"

        if not email_body:
            print("⚠️ No email body found in parsed agent response, skipping property.")
            continue

        if not email_subject:
            email_subject = f"Inquiry: Property at {prop.get('address', 'Unknown')}"

        print("✍️ Email generated:")
        print(f"Subject: {email_subject}")
        print(f"Body:\n{email_body}\n")

        # Send email
        try:
            send_email(
                recipient=prop["contact_email"],
                subject=email_subject,
                body=email_body
            )
        except Exception as e:
            print(f"⚠️ Failed to send email for property {prop.get('address', '')}: {e}")

    # Optionally close the client if supported (avoid resource leaks)
    if hasattr(client, "close") and callable(client.close):
        await client.close()


if __name__ == "__main__":
    asyncio.run(run_email_agent_for_all_properties())
