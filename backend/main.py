# main.py

from fastapi import FastAPI, UploadFile, File # type: ignore
from fastapi.responses import JSONResponse # type: ignore
import os
from pdf_parser import extract_properties_from_pdf
from models import properties_collection

app = FastAPI()

UPLOAD_DIR = "../data"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        # Save uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Extract properties
        extracted_data = extract_properties_from_pdf(file_path)

        if extracted_data:
            properties_collection.insert_many(extracted_data)

        # Remove any MongoDB _id fields before returning
        for prop in extracted_data:
            prop.pop("_id", None)

        return JSONResponse(content={
            "message": f"{len(extracted_data)} properties extracted and saved.",
            "data": extracted_data
        })


    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
