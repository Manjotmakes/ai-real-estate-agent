from fastapi import FastAPI, UploadFile, File, HTTPException  # type: ignore
from fastapi.responses import JSONResponse  # type: ignore
import os
import time
import traceback
from ai_pdf_parser import extract_properties_from_pdf, extract_property_images
from models import properties_collection

app = FastAPI()

UPLOAD_DIR = "../data"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "AI Real Estate PDF Parser API"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": time.time()}

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    print(f"🚀 Starting PDF upload: {file.filename}")
    start_time = time.time()
    
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Save uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        print(f"💾 Saving file to: {file_path}")
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
            print(f"💾 Saved {len(content)} bytes")

        # Extract properties
        print("🔍 Starting property extraction...")
        extraction_start = time.time()
        
        extracted_data = await extract_properties_from_pdf(file_path)
        
        extraction_time = time.time() - extraction_start
        print(f"🔍 Property extraction completed in {extraction_time:.2f} seconds")
        print(f"📊 Extracted {len(extracted_data)} properties")

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
            "extraction_time": f"{extraction_time:.2f}s"
        })

    except Exception as e:
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

@app.get("/properties/")
async def get_properties():
    """Get all properties from database"""
    try:
        properties = list(properties_collection.find({}, {"_id": 0}))
        return JSONResponse(content={
            "count": len(properties),
            "properties": properties
        })
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )