import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

_client = None
_db     = None


def init_db():
    global _client, _db
    env = os.getenv('FLASK_ENV', 'development')
    uri = os.getenv('MONGO_URI_PROD') if env == 'production' else os.getenv('MONGO_URI', 'mongodb://localhost:27017/tataphone')
    _client = MongoClient(uri)
    _db     = _client.get_default_database()
    print(f"[DB] Connected → {_db.name} ({env})")
    return _db


def get_db():
    if _db is None:
        init_db()
    return _db
