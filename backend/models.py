# models.py

from pymongo import MongoClient # type: ignore
from dotenv import load_dotenv
import os

load_dotenv()

# Load from .env
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

# MongoDB client setup
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
properties_collection = db[COLLECTION_NAME]
