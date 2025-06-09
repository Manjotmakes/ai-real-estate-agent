import fitz  # type: ignore
import os
import json
import hashlib
from datetime import datetime
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager  # type: ignore
from dotenv import load_dotenv # type: ignore
from PIL import Image #type: ignore
import io

# Load .env and GitHub token
load_dotenv()

# Setup LLM config for AutoGen 0.9.0
llm_config = {
    "config_list": [
        {
            "model": "gpt-4o-mini",
            "base_url": "https://models.inference.ai.azure.com",
            "api_key": os.environ["GITHUB_TOKEN"],
            "api_type": "azure",
            "api_version": "2024-02-15-preview"
        }
    ],
    "timeout": 120,
}

# PDF parser agent with improved system message
pdf_parser_agent = AssistantAgent(
    name="pdf_parser_agent",
    llm_config=llm_config,
    system_message="""
You are an expert real estate data extraction assistant. Your task is to carefully extract ALL property information from the provided text.

For each property, extract these fields with attention to detail:

1. **address**: Full property address including street, city, state, and zip code
2. **submarket**: Look for submarket information (e.g., "Gulf Freeway/Pasadena Submarket", "Downtown Houston Submarket")
3. **true_owner**: Look for the company name or owning entity (e.g., "Kaldis Interests", "Midway")
4. **owner_contact_persons**: Extract a list of full names (e.g., "Deidre Young", "Andrew Kaldis") of people listed with phone numbers in gray sections below the property image or in contact sections
5. **asking_rent**: Look for rent information:
   - "Asking Rent" field
   - "Rent/SF/year" values
   - If "Withheld" or not found, use "Withheld"
6. **sf_available**: Look for available square footage:
   - "Available" field (e.g., "250 - 48,000 SF" means 48000)
   - "SF Available" in tables
   - "RBA" total square footage
   - Extract the maximum number, convert to integer
7. **contact_email**: Always set to "raviking2311@gmail.com"

IMPORTANT EXTRACTION RULES:
- For `owner_contact_persons`, extract **only names of people**, not companies. They are typically listed with phone numbers.
- Do not duplicate `true_owner` in `owner_contact_persons`.
- Use default values when data is missing.
- Return ONLY a JSON array of property objects. No extra text or formatting.
"""
)

# User proxy agent
user_proxy = UserProxyAgent(
    name="user_proxy",
    llm_config=llm_config,
    system_message="You provide PDF content for property extraction.",
    code_execution_config=False,
    human_input_mode="NEVER",
    max_consecutive_auto_reply=1
)

def extract_text_from_pdf(pdf_path: str, max_pages=None) -> str:
    """Extract text from ALL pages of PDF (not just first 5)"""
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    
    # If max_pages is None, read ALL pages
    if max_pages is None:
        max_pages = total_pages
    
    print(f"📄 PDF has {total_pages} pages, reading {min(max_pages, total_pages)} pages")
    
    pages_text = []
    for i in range(min(total_pages, max_pages)):
        page_text = doc[i].get_text()
        if page_text.strip():  # Only add non-empty pages
            pages_text.append(f"--- PAGE {i+1} ---\n{page_text}")
    
    text = "\n\n".join(pages_text)
    print(f"📄 Extracted {len(text)} characters from PDF")
    return text

def is_property_image(image_bytes, width, height, page_text=""):
    """
    Determine if an image is likely a property photo vs text/logo/symbol
    
    Criteria for property images:
    1. Minimum size (width > 200px, height > 150px)
    2. Reasonable aspect ratio (not too narrow/wide)
    3. Sufficient file size (> 10KB)
    4. Not too small in file size (logos are usually small)
    5. Check if it's a color image (property photos are usually colorful)
    """
    
    # Size filters
    if width < 200 or height < 150:
        print(f"❌ Image too small: {width}x{height}")
        return False
    
    # File size filter
    if len(image_bytes) < 10000:  # Less than 10KB
        print(f"❌ Image file too small: {len(image_bytes)} bytes")
        return False
    
    # Aspect ratio filter (avoid very wide or very tall images)
    aspect_ratio = width / height
    if aspect_ratio > 4 or aspect_ratio < 0.25:
        print(f"❌ Unusual aspect ratio: {aspect_ratio:.2f}")
        return False
    
    try:
        # Load image with PIL to analyze
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Check color variance (logos/text often have limited colors)
        # Sample pixels and check color diversity
        img_small = img.resize((50, 50))  # Resize for faster processing
        pixels = list(img_small.getdata())
        
        # Calculate color variance
        unique_colors = len(set(pixels))
        color_variance = unique_colors / len(pixels)
        
        if color_variance < 0.1:  # Very limited color palette
            print(f"❌ Limited color variance: {color_variance:.3f}")
            return False
        
        # Check if image is mostly white/transparent (common for logos)
        white_pixels = sum(1 for r, g, b in pixels if r > 240 and g > 240 and b > 240)
        white_ratio = white_pixels / len(pixels)
        
        if white_ratio > 0.7:  # More than 70% white
            print(f"❌ Too much white space: {white_ratio:.3f}")
            return False
        
        print(f"✅ Property image detected: {width}x{height}, {len(image_bytes)} bytes, colors: {color_variance:.3f}")
        return True
        
    except Exception as e:
        print(f"⚠️ Error analyzing image: {e}")
        return False

def extract_property_images(pdf_path: str, output_dir: str = "../data/images"):
    """Extract only property images from PDF, filtering out logos/text/symbols"""
    print(f"🖼️ Starting property image extraction from: {pdf_path}")
    
    # Create images directory
    os.makedirs(output_dir, exist_ok=True)
    
    doc = fitz.open(pdf_path)
    all_images = []  # Store all valid property images in order
    
    for page_num, page in enumerate(doc, start=1):
        print(f"📄 Processing page {page_num} for property images...")
        
        # Get page text for context
        page_text = page.get_text()
        
        # Get images from this page
        images = page.get_images(full=True)
        
        print(f"🔍 Found {len(images)} total images on page {page_num}")
        
        for img_index, img in enumerate(images):
            try:
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                width = base_image["width"]
                height = base_image["height"]
                
                print(f"📸 Analyzing image {img_index + 1}: {width}x{height}, {len(image_bytes)} bytes")
                
                # Filter out non-property images
                if not is_property_image(image_bytes, width, height, page_text):
                    print(f"⏭️ Skipping non-property image {img_index + 1}")
                    continue
                
                # Create a hash of the image to avoid duplicates
                image_hash = hashlib.md5(image_bytes).hexdigest()[:8]
                
                # Create meaningful filename with sequential numbering
                filename = f"property_{len(all_images) + 1:02d}_{image_hash}.{image_ext}"
                img_path = os.path.join(output_dir, filename)
                
                # Save image
                with open(img_path, "wb") as img_file:
                    img_file.write(image_bytes)
                
                # Store relative path for database
                relative_path = f"/images/{filename}"
                all_images.append({
                    'path': relative_path,
                    'page': page_num,
                    'index': len(all_images)
                })
                
                print(f"💾 Saved property image {len(all_images)}: {filename} ({len(image_bytes)} bytes)")
                
            except Exception as e:
                print(f"⚠️ Failed to process image {img_index} from page {page_num}: {e}")
                continue
    
    doc.close()
    print(f"✅ Extracted {len(all_images)} total property images in sequential order")
    return all_images

def assign_images_to_properties(properties: list, extracted_images: list) -> list:
    """
    Assign extracted property images to properties in 1:1 mapping
    Each property gets exactly one image in order: 1st property -> 1st image, etc.
    """
    print(f"🔗 Assigning {len(extracted_images)} images to {len(properties)} properties...")
    
    # Initialize all properties with empty images
    for prop in properties:
        prop["images"] = []
    
    # Simple 1:1 sequential assignment
    for i in range(len(properties)):
        if i < len(extracted_images):
            # Assign the i-th image to the i-th property
            properties[i]["images"] = [extracted_images[i]['path']]
            
            address = properties[i].get('address', 'Unknown')[:50]  # Truncate for display
            print(f"🏢 Property {i+1} '{address}...' assigned image: {extracted_images[i]['path']}")
        else:
            # No more images available
            address = properties[i].get('address', 'Unknown')[:50]
            print(f"📷 Property {i+1} '{address}...' has no image available")
    
    # Handle case where there are more images than properties
    if len(extracted_images) > len(properties):
        print(f"⚠️ Warning: {len(extracted_images) - len(properties)} extra images not assigned")
        for j in range(len(properties), len(extracted_images)):
            print(f"📸 Unassigned image: {extracted_images[j]['path']}")
    
    # Summary
    assigned_count = sum(1 for prop in properties if prop.get("images"))
    print(f"✅ Successfully assigned images to {assigned_count}/{len(properties)} properties")
    
    return properties

async def extract_properties_from_pdf(pdf_path: str):
    print(f"🚀 Starting property extraction from: {pdf_path}")
    
    try:
        # Extract property images first (with filtering) - returns ordered list
        extracted_images = extract_property_images(pdf_path)
        
        # Read ALL pages instead of just 5
        text = extract_text_from_pdf(pdf_path, max_pages=None)
        
        if not text.strip():
            print("⚠️ No text extracted from PDF")
            return []

        # Check if text is too long for API and split if needed
        if len(text) > 100000:  # If text is very long (>100k chars)
            print("📄 PDF text is very long, processing in chunks...")
            properties = await process_pdf_in_chunks(text)
        else:
            properties = await extract_properties_with_agent(text)

        # Assign property images to properties in 1:1 order
        if properties and extracted_images:
            properties = assign_images_to_properties(properties, extracted_images)
        
        return properties
            
    except Exception as e:
        print(f"❌ Error in extraction: {e}")
        return []

async def extract_properties_with_agent(text: str):
    """Extract properties using the AI agent"""
    # Enhanced prompt with specific instructions
    prompt = f"""
    Analyze this real estate document and extract ALL properties with complete information.

    IMPORTANT: This document contains MULTIPLE properties. Look for:
    - Property numbers (1, 2, 3, etc.)
    - Different addresses
    - Page breaks (--- PAGE X ---)
    - Property section headers

    Document text:
    {text}

    Instructions:
    1. Identify each separate property
    2. For each property, extract:

    - address
    - submarket
    - true_owner (company/entity name)
    - owner_contact_persons (list of actual person names listed with phone numbers)
    - asking_rent
    - sf_available (extract the **maximum** available square footage)
    - contact_email (always "raviking2311@gmail.com")

    Return an array of valid JSON objects. Do NOT return explanations or markdown formatting.
    """

    # Create and run group chat
    group_chat = GroupChat(
        agents=[user_proxy, pdf_parser_agent],
        messages=[],
        max_round=5,  # Increased rounds for better processing
        speaker_selection_method="round_robin"
    )
    chat_manager = GroupChatManager(groupchat=group_chat, llm_config=llm_config)
    
    try:
        await user_proxy.a_initiate_chat(
            recipient=chat_manager,
            message=prompt,
            max_turns=5
        )
    except Exception as e:
        print(f"❌ Async conversation failed: {e}")
        # Fallback to sync
        user_proxy.initiate_chat(
            recipient=chat_manager,
            message=prompt,
            max_turns=5
        )

    # Extract response from agent
    content = None
    for msg in reversed(group_chat.messages):
        if msg.get("name") == "pdf_parser_agent":
            content = msg.get("content")
            break

    if not content:
        print("❌ No response from agent")
        return create_fallback_extraction(text)

    # Parse JSON response
    try:
        content_clean = content.strip()
        
        # Remove markdown code blocks
        if content_clean.startswith('```json'):
            content_clean = content_clean[7:-3].strip()
        elif content_clean.startswith('```'):
            content_clean = content_clean[3:-3].strip()
        
        # Parse JSON
        if content_clean.startswith('[') or content_clean.startswith('{'):
            parsed = json.loads(content_clean)
        else:
            import re
            json_match = re.search(r'(\[.*\]|\{.*\})', content_clean, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(1))
            else:
                return create_fallback_extraction(text)
        
        result = parsed if isinstance(parsed, list) else [parsed]
        print(f"✅ Successfully extracted {len(result)} properties")
        
        # Validate we got all properties
        if len(result) < 8:
            print(f"⚠️ Expected 8 properties but got {len(result)}, trying fallback extraction...")
            fallback_result = create_fallback_extraction(text)
            if len(fallback_result) > len(result):
                print(f"✅ Fallback found {len(fallback_result)} properties")
                return fallback_result
        
        return result
        
    except Exception as e:
        print(f"❌ JSON parsing failed: {e}")
        return create_fallback_extraction(text)

async def process_pdf_in_chunks(text: str):
    """Process large PDFs in chunks to avoid API limits"""
    print("📄 Processing PDF in chunks...")
    
    # Split by page markers
    pages = text.split("--- PAGE")
    all_properties = []
    
    # Process pages in groups of 3-4
    chunk_size = 4
    for i in range(0, len(pages), chunk_size):
        chunk_pages = pages[i:i+chunk_size]
        chunk_text = "--- PAGE".join(chunk_pages)
        
        if len(chunk_text.strip()) < 100:
            continue
            
        print(f"📄 Processing chunk {i//chunk_size + 1} (pages {i+1}-{min(i+chunk_size, len(pages))})")
        
        # Use simpler extraction for chunks
        chunk_properties = create_fallback_extraction(chunk_text)
        all_properties.extend(chunk_properties)
    
    print(f"✅ Chunk processing found {len(all_properties)} total properties")
    return all_properties

def create_fallback_extraction(text: str):
    """Enhanced fallback extraction with better pattern matching"""
    print("🔄 Using fallback extraction...")
    
    import re
    
    # Split text into property sections using multiple patterns
    # Look for numbered properties or clear address patterns
    property_sections = []
    
    # Method 1: Split by page breaks and numbers
    pages = text.split("--- PAGE")
    for page in pages:
        if not page.strip():
            continue
            
        # Look for numbered sections within each page
        numbered_sections = re.split(r'\n\s*(\d+)\s*\n(?=\d+.*(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Way|Boulevard|Blvd|Commerce))', page)
        
        for section in numbered_sections:
            if len(section.strip()) > 200:  # Only process substantial sections
                property_sections.append(section)
    
    # If that didn't work well, try splitting by address patterns
    if len(property_sections) < 3:
        property_sections = re.split(r'\n(?=\d+[^,\n]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Way|Boulevard|Blvd|Commerce))', text)
    
    properties = []
    
    for section in property_sections:
        if len(section.strip()) < 100:  # Skip small sections
            continue
            
        # Extract address - more flexible pattern
        address_patterns = [
            r'(\d+[^,\n]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Way|Boulevard|Blvd|Commerce)[^,\n]*(?:,\s*[^,\n]+)*)',
            r'(\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Dr|Drive|Rd|Road|Blvd|Boulevard|Way|Lane|Ln)[^,\n]*)',
            r'(\d+[^,\n]*(?:Capitol|Commerce|Jensen)[^,\n]*)'
        ]
        
        address = None
        for pattern in address_patterns:
            address_match = re.search(pattern, section, re.IGNORECASE)
            if address_match:
                address = address_match.group(1).strip()
                break
        
        if not address:
            continue
            
        # Extract submarket
        submarket_match = re.search(r'([^,\n]+ Submarket)', section, re.IGNORECASE)
        submarket = submarket_match.group(1) if submarket_match else "Unknown"
        
        # Extract true owner - multiple patterns
        owner_patterns = [
            r'True Owner\s*([^\n]+)',
            r'([A-Z][a-z]+ [A-Z][a-z]+ (?:Properties|Interests|Group|LLC|Inc)[^:,\n]*)',
            r'([A-Z][a-zA-Z\s]+(?:Properties|Interests|Group))(?:\s*:|\s+\()'
        ]
        
        owner = "Unknown"
        for pattern in owner_patterns:
            owner_match = re.search(pattern, section, re.IGNORECASE)
            if owner_match:
                owner = owner_match.group(1).strip()
                break
        
        # Extract asking rent
        rent_patterns = [
            r'Asking Rent\s*([^\n]+)',
            r'\$[\d.,]+[^\n]*(?:SF|year)',
            r'Rent/SF/year\s*([^\n]+)'
        ]
        
        asking_rent = "Withheld"
        for pattern in rent_patterns:
            rent_match = re.search(pattern, section, re.IGNORECASE)
            if rent_match:
                asking_rent = rent_match.group(1).strip() if 'Asking Rent' in pattern else rent_match.group(0).strip()
                break
        
        # Extract SF available (look for the largest number)
        sf_matches = re.findall(r'(\d{1,3}(?:,\d{3})*)\s*SF', section, re.IGNORECASE)
        sf_available = None
        if sf_matches:
            # Convert to integers and find the maximum
            sf_numbers = [int(sf.replace(',', '')) for sf in sf_matches]
            sf_available = max(sf_numbers)
        
        prop = {
            "address": address,
            "submarket": submarket,
            "true_owner": owner,
            "asking_rent": asking_rent,
            "sf_available": sf_available,
            "contact_email": "raviking2311@gmail.com",
            "images": []  # Initialize empty images array
        }
        properties.append(prop)
    
    # Remove duplicates based on address
    seen_addresses = set()
    unique_properties = []
    for prop in properties:
        if prop["address"] not in seen_addresses:
            seen_addresses.add(prop["address"])
            unique_properties.append(prop)
    
    print(f"🔄 Fallback extracted {len(unique_properties)} unique properties")
    return unique_properties