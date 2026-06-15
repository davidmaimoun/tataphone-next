from datetime import datetime
from bson import ObjectId
from app.db import get_db


def get_collection():
    return get_db()['promotions']


def get_all():
    cursor = get_collection().find().sort('createdAt', -1)
    return [serialize(p) for p in cursor]


def create_promotion(data: dict) -> dict:
    now = datetime.utcnow()
    doc = {
        'name':      data.get('name', ''),
        'type':      data.get('type', 'category'),   # product | category | all
        'target':    data.get('target', ''),
        'discount':  float(data.get('discount', 10)),
        'startDate': data.get('startDate', ''),
        'endDate':   data.get('endDate', ''),
        'active':    True,
        'createdAt': now,
        'updatedAt': now,
    }
    result = get_collection().insert_one(doc)
    doc['_id'] = result.inserted_id
    return serialize(doc)


def update_promotion(promo_id: str, data: dict) -> dict:
    data['updatedAt'] = datetime.utcnow()
    get_collection().update_one({'_id': ObjectId(promo_id)}, {'$set': data})
    p = get_collection().find_one({'_id': ObjectId(promo_id)})
    return serialize(p)


def delete_promotion(promo_id: str):
    get_collection().delete_one({'_id': ObjectId(promo_id)})


def serialize(p: dict) -> dict:
    if not p:
        return {}
    return {
        '_id':       str(p['_id']),
        'name':      p.get('name'),
        'type':      p.get('type'),
        'target':    p.get('target'),
        'discount':  p.get('discount'),
        'startDate': p.get('startDate'),
        'endDate':   p.get('endDate'),
        'active':    p.get('active', True),
        'createdAt': p['createdAt'].isoformat() if p.get('createdAt') else '',
    }
