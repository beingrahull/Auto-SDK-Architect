from beanie import init_beanie
from pymongo import AsyncMongoClient

from app.config import settings
from app.models.user import User


async def init_db():
    client = AsyncMongoClient(settings.mongo_uri)
    await init_beanie(
        database=client.get_default_database(),
        document_models=[User],
    )
    print("Connection to MongoDB successful", flush=True)