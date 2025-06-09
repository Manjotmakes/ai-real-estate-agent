from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from bson import ObjectId
from models import properties_collection, email_replies_collection, comparisons_collection
from ai_pdf_parser import extract_properties_from_pdf
from email_sender_agent import run_email_agent_for_all_properties
from email_reply_agent import process_replies
from compare import generate_all_comparisons, get_all_comparisons, get_dashboard_summary, convert_objectid_to_string

# Initialize FastAPI app
app = FastAPI(
    title="AI Real Estate Agent API",
    description="An AI-powered real estate agent for property analysis and communication",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create images directory and mount static files
IMAGES_DIR = "../data/images"
os.makedirs(IMAGES_DIR, exist_ok=True)

# Mount static files for serving images
app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AI Real Estate Agent API", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Real Estate Agent"}

# ===== NEW PDF UPLOAD FLOW =====

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and extract data from PDF including images"""
    print(f"🚀 Starting PDF upload: {file.filename}")
    import time
    start_time = time.time()
    
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Create upload directory
        UPLOAD_DIR = "../data"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Save uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        print(f"💾 Saving file to: {file_path}")
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        print(f"💾 Saved {len(content)} bytes")
        
        # Extract properties (including images)
        print("🔍 Starting property extraction with images...")
        extraction_start = time.time()
        extracted_data = await extract_properties_from_pdf(file_path)
        extraction_time = time.time() - extraction_start
        print(f"🔍 Property extraction completed in {extraction_time:.2f} seconds")
        print(f"📊 Extracted {len(extracted_data)} properties")
        
        # Count total images extracted
        total_images = sum(len(prop.get("images", [])) for prop in extracted_data)
        print(f"🖼️ Extracted {total_images} total images")
        
        # Save to MongoDB if we have data
        if extracted_data:
            print("💾 Saving to MongoDB...")
            try:
                result = properties_collection.insert_many(extracted_data)
                print(f"💾 Inserted {len(result.inserted_ids)} documents to MongoDB")
            except Exception as e:
                print(f"❌ MongoDB error: {e}")
                # Continue anyway, don't fail the whole request
        else:
            print("⚠️ No data to save to MongoDB")
        
        # Clean up _id fields for response
        response_data = []
        for prop in extracted_data:
            clean_prop = dict(prop)
            clean_prop.pop("_id", None)
            response_data.append(clean_prop)
        
        total_time = time.time() - start_time
        print(f"✅ Request completed in {total_time:.2f} seconds")
        
        return JSONResponse(content={
            "message": f"{len(extracted_data)} properties extracted and saved.",
            "data": response_data,
            "processing_time": f"{total_time:.2f}s",
            "extraction_time": f"{extraction_time:.2f}s",
            "properties_count": len(extracted_data),
            "images_extracted": total_images,
            "status": "success"
        })
        
    except Exception as e:
        import traceback
        error_time = time.time() - start_time
        print(f"❌ Error after {error_time:.2f} seconds: {e}")
        print("❌ Full traceback:")
        traceback.print_exc()
        
        return JSONResponse(
            status_code=500,
            content={
                "error": str(e),
                "processing_time": f"{error_time:.2f}s",
                "message": "An error occurred during PDF processing"
            }
        )

@app.post("/send-emails/")
async def send_emails():
    """Send emails to all property contacts (called after PDF upload or manually)"""
    try:
        print("📧 Starting email sending process...")
        await run_email_agent_for_all_properties()
        
        # Get count of sent emails
        sent_count = 0
        properties = list(properties_collection.find({"sent_emails": {"$exists": True}}))
        for prop in properties:
            sent_count += len(prop.get("sent_emails", []))
        
        return JSONResponse(content={
            "message": "Email sending completed",
            "emails_sent": sent_count,
            "properties_processed": len(properties),
            "status": "success"
        })
        
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "message": "Failed to send emails"}
        )

# ===== EXISTING DATA FLOW =====

@app.get("/properties/")
async def get_all_properties():
    """Get all properties (same as your original working version)"""
    try:
        properties = list(properties_collection.find({}))
        
        # Convert ObjectIds to strings
        properties = convert_objectid_to_string(properties)
        
        return JSONResponse(content={
            "count": len(properties),
            "properties": properties
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/properties-with-status/")
async def get_properties_with_status():
    """Get properties with their email and reply status (main dashboard view)"""
    try:
        pipeline = [
            {
                "$lookup": {
                    "from": "email_replies",
                    "localField": "_id",
                    "foreignField": "property_id",
                    "as": "replies"
                }
            },
            {
                "$lookup": {
                    "from": "comparisons",
                    "let": {"prop_id": {"$toString": "$_id"}},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$property_id", "$$prop_id"]}}}
                    ],
                    "as": "comparisons"
                }
            },
            {
                "$project": {
                    "address": 1,
                    "submarket": 1,
                    "true_owner": 1,
                    "asking_rent": 1,
                    "sf_available": 1,
                    "owner_contact_persons": 1,
                    "images": 1,  # Include images in the response
                    "emails_sent": {"$size": {"$ifNull": ["$sent_emails", []]}},
                    "replies_received": {"$size": "$replies"},
                    "comparisons_available": {"$size": "$comparisons"},
                    "has_replies": {"$gt": [{"$size": "$replies"}, 0]},
                    "needs_attention": {"$anyElementTrue": {"$map": {
                        "input": "$comparisons",
                        "as": "comp",
                        "in": "$$comp.requires_attention"
                    }}},
                    "latest_reply_date": {"$max": "$replies.timestamp"},
                    "status": {
                        "$cond": {
                            "if": {"$gt": [{"$size": "$replies"}, 0]},
                            "then": "reply_received",
                            "else": {
                                "$cond": {
                                    "if": {"$gt": [{"$size": {"$ifNull": ["$sent_emails", []]}}, 0]},
                                    "then": "email_sent",
                                    "else": "pending"
                                }
                            }
                        }
                    }
                }
            }
        ]
        
        properties = list(properties_collection.aggregate(pipeline))
        
        # Convert ObjectId to string for JSON serialization
        properties = convert_objectid_to_string(properties)
        
        return JSONResponse(content={
            "total_count": len(properties),
            "properties": properties
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/process-replies/")
async def process_email_replies():
    """Process new email replies (checks email for new replies)"""
    try:
        print("📨 Starting reply processing...")
        await process_replies()
        
        # Get count of processed replies
        reply_count = email_replies_collection.count_documents({})
        
        return JSONResponse(content={
            "message": "Reply processing completed",
            "total_replies": reply_count,
            "status": "success"
        })
        
    except Exception as e:
        print(f"❌ Reply processing failed: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "message": "Failed to process replies"}
        )

@app.post("/generate-comparisons/")
async def generate_comparisons():
    """Generate property comparisons (compares replies with PDF data)"""
    try:
        print("🔍 Starting comparison generation...")
        comparisons = await generate_all_comparisons()
        
        return JSONResponse(content={
            "message": "Comparisons generated successfully",
            "total_comparisons": len(comparisons),
            "data": comparisons,
            "status": "success"
        })
        
    except Exception as e:
        print(f"❌ Comparison generation failed: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "message": "Failed to generate comparisons"}
        )

@app.get("/comparisons/")
async def get_comparisons():
    """Get all property comparisons"""
    try:
        comparisons = get_all_comparisons()
        
        return JSONResponse(content={
            "total_count": len(comparisons),
            "comparisons": comparisons
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/dashboard-summary/")
async def dashboard_summary():
    """Get dashboard summary data (overview statistics)"""
    try:
        summary = get_dashboard_summary()
        return JSONResponse(content=summary)
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

# ===== DETAILED VIEWS =====

@app.get("/property/{property_id}/details/")
async def get_property_details(property_id: str):
    """Get detailed property information including replies and comparisons"""
    try:
        # Convert string ID to ObjectId for MongoDB query
        try:
            object_id = ObjectId(property_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid property ID format")
        
        # Get property data
        property_data = properties_collection.find_one({"_id": object_id})
        if not property_data:
            raise HTTPException(status_code=404, detail="Property not found")
        
        # Get replies for this property
        replies = list(email_replies_collection.find({"property_id": object_id}))
        
        # Get comparisons for this property
        comparisons = list(comparisons_collection.find({"property_id": property_id}))
        
        # Convert ObjectIds to strings for JSON serialization
        property_data = convert_objectid_to_string(property_data)
        replies = convert_objectid_to_string(replies)
        comparisons = convert_objectid_to_string(comparisons)
        
        return JSONResponse(content={
            "property": property_data,
            "replies": replies,
            "comparisons": comparisons
        })
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting property details: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/replies/")
async def get_all_replies():
    """Get all email replies"""
    try:
        replies = list(email_replies_collection.find({}))
        
        # Convert ObjectId to string for JSON serialization
        replies = convert_objectid_to_string(replies)
        
        return JSONResponse(content={
            "total_count": len(replies),
            "replies": replies
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

# ===== WORKFLOW ENDPOINTS =====

@app.post("/workflow/new-pdf/")
async def new_pdf_workflow():
    """Complete workflow for new PDF: extract → send emails → show status"""
    try:
        # This endpoint would be called after PDF upload
        # It triggers email sending and returns dashboard summary
        
        print("🔄 Starting new PDF workflow...")
        
        # Send emails
        email_result = await send_emails()
        if email_result.status_code != 200:
            raise Exception("Failed to send emails")
        
        # Get dashboard summary
        summary = get_dashboard_summary()
        
        return JSONResponse(content={
            "message": "New PDF workflow completed",
            "email_result": email_result.body.decode(),
            "dashboard_summary": summary,
            "next_step": "Wait for replies, then use existing data flow"
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "message": "New PDF workflow failed"}
        )

@app.post("/workflow/existing-data/")
async def existing_data_workflow():
    """Complete workflow for existing data: process replies → generate comparisons → show results"""
    try:
        print("🔄 Starting existing data workflow...")
        
        # Process replies
        await process_replies()
        
        # Generate comparisons
        comparisons = await generate_all_comparisons()
        
        # Get updated dashboard summary
        summary = get_dashboard_summary()
        
        return JSONResponse(content={
            "message": "Existing data workflow completed",
            "comparisons_generated": len(comparisons),
            "dashboard_summary": summary,
            "comparisons": comparisons
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "message": "Existing data workflow failed"}
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)