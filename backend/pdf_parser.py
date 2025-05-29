# pdf_parser.py

import fitz # type: ignore
from models import properties_collection

def extract_properties_from_pdf(pdf_path: str):
    doc = fitz.open(pdf_path)
    properties = []

    for page in doc:
        text = page.get_text()
        lines = text.splitlines()

        for i, line in enumerate(lines):
            if "True Owner" in line:
                try:
                    property_data = {}

                    for j in range(i, 0, -1):
                        if lines[j].strip() and "Houston" in lines[j]:
                            property_data["address"] = lines[j].strip()
                            break

                    property_data["submarket"] = lines[j-1].strip() if j > 1 else ""
                    property_data["true_owner"] = line.split(":")[-1].strip()

                    rent_line = next((l for l in lines[i:] if "Rent" in l), "")
                    property_data["asking_rent"] = rent_line.split()[-2] if "$" in rent_line else "Withheld"

                    available_line = next((l for l in lines[i:] if "Available" in l and "SF" in l), "")
                    sf = ''.join(c for c in available_line if c.isdigit() or c == ',')
                    property_data["sf_available"] = int(sf.replace(',', '')) if sf else None

                    property_data["contact_email"] = "mtmanjot@gmail.com"

                    properties.append(property_data)

                except Exception as e:
                    print(f"Error parsing block at line {i}: {e}")

    return properties


if __name__ == "__main__":
    import json

    extracted = extract_properties_from_pdf("../data/sample.pdf")
    print(json.dumps(extracted, indent=2))

    # Insert into MongoDB
    if extracted:
        result = properties_collection.insert_many(extracted)
        print(f"Inserted {len(result.inserted_ids)} documents.")
