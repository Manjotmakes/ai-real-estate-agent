import os
import json
import re
from datetime import datetime
from dotenv import load_dotenv  # type: ignore
from models import properties_collection, email_replies_collection
from pymongo import MongoClient  # type: ignore
from bson import ObjectId

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

# MongoDB setup for comparisons collection
client_mongo = MongoClient(os.getenv("MONGO_URI"))
db = client_mongo[os.getenv("DB_NAME")]
comparisons_collection = db["comparisons"]

# Helper function to convert ObjectId to string
def convert_objectid_to_string(data):
    """Recursively convert ObjectId to string in MongoDB documents"""
    if isinstance(data, list):
        return [convert_objectid_to_string(item) for item in data]
    elif isinstance(data, dict):
        return {key: convert_objectid_to_string(value) for key, value in data.items()}
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data

# Comparison agent
comparison_agent = AssistantAgent(
    name="comparison_agent",
    model_client=client,
    system_message="""
You are a real estate property comparison analyst. Your task is to compare original property data extracted from PDF documents with updated information received from email replies to identify changes in market conditions.

You will receive two data structures:
1. ORIGINAL_PROPERTY: Property data from PDF extraction with fields like address, asking_rent, sf_available, true_owner, etc.
2. EMAIL_REPLY_DATA: Updated information from property contacts with parsed_data containing asking_rent, sf_available, availability_status, etc.

Your analysis should focus on:

**PRICE ANALYSIS:**
- Compare asking_rent values (handle formats like "Withheld", "$27.50/SF", dollar amounts)
- Identify if rent has increased, decreased, or remained stable
- Calculate percentage change when possible

**AVAILABILITY ANALYSIS:**
- Compare sf_available (square footage) between original and reply
- Determine if more or less space is available
- Note availability_status changes (Available, Leased, Under Contract, etc.)

**MARKET INSIGHTS:**
- Assess if changes indicate market trends (rising/falling rents, increasing/decreasing supply)
- Flag significant discrepancies that may need verification
- Note when "Withheld" information becomes available

**OUTPUT FORMAT:**
Return a structured JSON with:
{
  "property_address": "address",
  "comparison_summary": "brief summary of key changes",
  "rent_analysis": {
    "original": "original rent or Withheld",
    "updated": "new rent from reply",
    "change_type": "increased/decreased/stable/newly_available",
    "percentage_change": null
  },
  "availability_analysis": {
    "original_sf": number,
    "updated_sf": number,
    "change_type": "increased/decreased/stable",
    "sf_difference": number
  },
  "market_signal": "positive/negative/neutral/mixed",
  "requires_attention": boolean,
  "notes": "additional observations"
}

Focus on accuracy and provide actionable insights for real estate investment decisions. Return ONLY valid JSON, no extra text.
"""
)

def extract_rent_value(rent_str):
    """Extract numeric rent value from string for comparison"""
    if not rent_str or rent_str.lower() in ['withheld', 'unknown', 'n/a']:
        return None
    
    # Extract numeric value from strings like "$27.50/SF", "$25 per SF", etc.
    match = re.search(r'\$?(\d+\.?\d*)', str(rent_str))
    if match:
        return float(match.group(1))
    return None

def format_property_for_comparison(property_data, reply_data):
    """Format property and reply data for agent analysis"""
    return f"""
ORIGINAL_PROPERTY:
- Address: {property_data.get('address', 'Unknown')}
- Submarket: {property_data.get('submarket', 'Unknown')}
- True Owner: {property_data.get('true_owner', 'Unknown')}
- Original Asking Rent: {property_data.get('asking_rent', 'Unknown')}
- Original Available SF: {property_data.get('sf_available', 'Unknown')}
- Contact Email: {property_data.get('contact_email', 'Unknown')}

EMAIL_REPLY_DATA:
- From: {reply_data.get('from_email', 'Unknown')}
- Contact Person: {reply_data.get('contact_person', 'Unknown')}
- Reply Date: {reply_data.get('timestamp', 'Unknown')}
- Updated Asking Rent: {reply_data.get('parsed_data', {}).get('asking_rent', 'Not mentioned')}
- Updated Available SF: {reply_data.get('parsed_data', {}).get('sf_available', 'Not mentioned')}
- Availability Status: {reply_data.get('parsed_data', {}).get('availability_status', 'Not mentioned')}
- Additional Notes: {reply_data.get('parsed_data', {}).get('additional_notes', 'None')}
- Raw Reply Body: {reply_data.get('raw_body', '')[:200]}...
"""

async def compare_single_property(property_data, reply_data):
    """Compare a single property with its email reply"""
    print(f"🔍 Comparing property: {property_data.get('address', 'Unknown')}")
    
    try:
        # Format data for agent
        comparison_prompt = f"""
Analyze and compare the following property data with the email reply:

{format_property_for_comparison(property_data, reply_data)}

Provide a detailed comparison focusing on rent changes, availability changes, and market insights.
"""
        
        # Run the comparison agent
        result = await comparison_agent.run(task=comparison_prompt)
        
        # Extract response content
        response_content = None
        if hasattr(result, 'messages') and result.messages:
            response_content = result.messages[-1].content
        else:
            response_content = str(result)
        
        print(f"🤖 Agent response: {response_content[:200]}...")
        
        # Parse JSON response
        try:
            comparison_result = json.loads(response_content)
        except json.JSONDecodeError as e:
            print(f"⚠️ JSON parsing failed: {e}")
            # Create fallback comparison
            comparison_result = create_fallback_comparison(property_data, reply_data)
        
        # Add metadata
        comparison_result.update({
            "property_id": str(property_data["_id"]),
            "reply_id": str(reply_data["_id"]),
            "comparison_date": datetime.utcnow().isoformat(),
            "status": "completed"
        })
        
        return comparison_result
        
    except Exception as e:
        print(f"❌ Comparison failed for {property_data.get('address', 'Unknown')}: {e}")
        # Return fallback comparison
        return create_fallback_comparison(property_data, reply_data, error=str(e))

def create_fallback_comparison(property_data, reply_data, error=None):
    """Create a basic comparison when AI agent fails"""
    print("🔄 Creating fallback comparison...")
    
    original_rent = property_data.get('asking_rent', 'Unknown')
    updated_rent = reply_data.get('parsed_data', {}).get('asking_rent', 'Not mentioned')
    original_sf = property_data.get('sf_available')
    updated_sf = reply_data.get('parsed_data', {}).get('sf_available')
    
    # Determine rent change
    rent_change_type = "unknown"
    if original_rent == "Withheld" and updated_rent != "Not mentioned":
        rent_change_type = "newly_available"
    elif original_rent != "Unknown" and updated_rent != "Not mentioned":
        orig_val = extract_rent_value(original_rent)
        new_val = extract_rent_value(updated_rent)
        if orig_val and new_val:
            if new_val > orig_val:
                rent_change_type = "increased"
            elif new_val < orig_val:
                rent_change_type = "decreased"
            else:
                rent_change_type = "stable"
    
    # Determine SF change
    sf_change_type = "unknown"
    sf_difference = 0
    if original_sf and updated_sf:
        sf_difference = updated_sf - original_sf
        if sf_difference > 0:
            sf_change_type = "increased"
        elif sf_difference < 0:
            sf_change_type = "decreased"
        else:
            sf_change_type = "stable"
    
    return {
        "property_address": property_data.get('address', 'Unknown'),
        "comparison_summary": f"Basic comparison - Rent: {rent_change_type}, SF: {sf_change_type}",
        "rent_analysis": {
            "original": original_rent,
            "updated": updated_rent,
            "change_type": rent_change_type,
            "percentage_change": None
        },
        "availability_analysis": {
            "original_sf": original_sf,
            "updated_sf": updated_sf,
            "change_type": sf_change_type,
            "sf_difference": sf_difference
        },
        "market_signal": "neutral",
        "requires_attention": rent_change_type in ["increased", "newly_available"] or abs(sf_difference) > 5000,
        "notes": f"Fallback comparison. {f'Error: {error}' if error else 'AI analysis unavailable'}",
        "property_id": str(property_data["_id"]),
        "reply_id": str(reply_data["_id"]),
        "comparison_date": datetime.utcnow().isoformat(),
        "status": "fallback"
    }

async def generate_all_comparisons():
    """Generate comparisons for all properties that have email replies"""
    print("🚀 Starting comprehensive property comparison...")
    
    # Get all properties with email replies
    properties_with_replies = list(properties_collection.find({
        "sent_emails": {"$exists": True, "$ne": []}
    }))
    
    if not properties_with_replies:
        print("📭 No properties with sent emails found")
        return []
    
    print(f"🏢 Found {len(properties_with_replies)} properties with sent emails")
    
    all_comparisons = []
    
    for property_data in properties_with_replies:
        property_id = property_data["_id"]
        
        # Find email replies for this property
        replies = list(email_replies_collection.find({
            "property_id": property_id
        }))
        
        if not replies:
            print(f"📭 No replies found for property: {property_data.get('address', 'Unknown')}")
            continue
        
        print(f"📧 Found {len(replies)} replies for property: {property_data.get('address', 'Unknown')}")
        
        for reply in replies:
            try:
                # Check if comparison already exists
                existing_comparison = comparisons_collection.find_one({
                    "property_id": str(property_id),
                    "reply_id": str(reply["_id"])
                })
                
                if existing_comparison:
                    print(f"✅ Comparison already exists for property {property_data.get('address', 'Unknown')}")
                    # Convert ObjectIds to strings
                    existing_comparison = convert_objectid_to_string(existing_comparison)
                    all_comparisons.append(existing_comparison)
                    continue
                
                # Generate new comparison
                comparison = await compare_single_property(property_data, reply)
                
                # Save to database
                comparisons_collection.insert_one(comparison.copy())
                print(f"💾 Saved comparison to database")
                
                all_comparisons.append(comparison)
                
            except Exception as e:
                print(f"❌ Error processing reply for {property_data.get('address', 'Unknown')}: {e}")
                continue
    
    print(f"✅ Generated {len(all_comparisons)} total comparisons")
    return all_comparisons

def get_all_comparisons():
    """Get all existing comparisons from database"""
    try:
        comparisons = list(comparisons_collection.find({}))
        # Convert ObjectIds to strings
        comparisons = convert_objectid_to_string(comparisons)
        print(f"📊 Retrieved {len(comparisons)} comparisons from database")
        return comparisons
    except Exception as e:
        print(f"❌ Error retrieving comparisons: {e}")
        return []

def get_dashboard_summary():
    """Get summary data for dashboard"""
    try:
        # Count properties
        total_properties = properties_collection.count_documents({})
        properties_with_emails = properties_collection.count_documents({
            "sent_emails": {"$exists": True, "$ne": []}
        })
        
        # Calculate total emails sent
        total_emails_sent = 0
        for prop in properties_collection.find({"sent_emails": {"$exists": True, "$ne": []}}):
            total_emails_sent += len(prop.get("sent_emails", []))
        
        # Count replies
        total_replies = email_replies_collection.count_documents({})
        
        # Count comparisons
        total_comparisons = comparisons_collection.count_documents({})
        comparisons_needing_attention = comparisons_collection.count_documents({
            "requires_attention": True
        })
        
        # Get recent comparisons
        recent_comparisons = list(comparisons_collection.find({})
                                .sort("comparison_date", -1)
                                .limit(5))
        
        # Convert ObjectIds to strings
        recent_comparisons = convert_objectid_to_string(recent_comparisons)
        
        return {
            "total_properties": total_properties,
            "properties_with_emails": properties_with_emails,
            "total_emails_sent": total_emails_sent,
            "total_replies": total_replies,
            "total_comparisons": total_comparisons,
            "comparisons_needing_attention": comparisons_needing_attention,
            "recent_comparisons": recent_comparisons,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error generating dashboard summary: {e}")
        return {"error": str(e)}

def main():
    """Main function for testing"""
    import asyncio
    
    async def test_comparisons():
        print("🧪 Testing comparison generation...")
        comparisons = await generate_all_comparisons()
        
        print("\n📊 Comparison Results:")
        for comp in comparisons[:3]:  # Show first 3
            print(f"\n🏢 {comp.get('property_address', 'Unknown')}")
            print(f"   Rent: {comp.get('rent_analysis', {}).get('original', 'N/A')} → {comp.get('rent_analysis', {}).get('updated', 'N/A')}")
            print(f"   SF: {comp.get('availability_analysis', {}).get('original_sf', 'N/A')} → {comp.get('availability_analysis', {}).get('updated_sf', 'N/A')}")
            print(f"   Signal: {comp.get('market_signal', 'N/A')}")
            print(f"   Attention: {comp.get('requires_attention', False)}")
    
    try:
        asyncio.run(test_comparisons())
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    main()