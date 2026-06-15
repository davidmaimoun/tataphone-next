from datetime import datetime
from bson import ObjectId
import bcrypt
from app.db import get_db


def get_collection():
    return get_db()['users']


def create_indexes():
    col = get_collection()
    col.create_index('email', unique=True)


# ── CRUD helpers ─────────────────────────────────────────────────────────────

def find_by_email(email: str):
    return get_collection().find_one({'email': email.lower().strip()})


def find_by_id(user_id: str):
    try:
        return get_collection().find_one({'_id': ObjectId(user_id)})
    except Exception:
        return None


def create_user(data: dict) -> dict:
    col = get_collection()
    now = datetime.utcnow()
    pw  = data.get('password', '')
    hashed = bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode() if pw else ''

    doc = {
        'name':      data.get('name', ''),
        'email':     data.get('email', '').lower().strip(),
        'password':  hashed,
        'phone':     data.get('phone', ''),
        'role':      data.get('role', 'user'),   # 'user' | 'admin'
        'googleId':  data.get('googleId'),
        'picture':   data.get('picture'),
        'addresses': [],
        'wishlist':  [],
        'createdAt': now,
        'updatedAt': now,
    }
    result = col.insert_one(doc)
    doc['_id'] = result.inserted_id
    return doc


def verify_password(user: dict, password: str) -> bool:
    stored = user.get('password', '')
    if not stored:
        return False
    return bcrypt.checkpw(password.encode(), stored.encode())


def update_user(user_id: str, data: dict):
    data['updatedAt'] = datetime.utcnow()
    get_collection().update_one(
        {'_id': ObjectId(user_id)},
        {'$set': data}
    )


def serialize(user: dict) -> dict:
    """Safe public representation (no password)."""
    return {
        'id':        str(user['_id']),
        'name':      user.get('name'),
        'email':     user.get('email'),
        'phone':     user.get('phone'),
        'role':      user.get('role', 'user'),
        'picture':   user.get('picture'),
        'createdAt': user.get('createdAt', '').isoformat() if user.get('createdAt') else '',
    }
