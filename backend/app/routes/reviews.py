from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.db import get_db
from bson import ObjectId
import datetime

reviews_bp = Blueprint('reviews', __name__)


def _col():
    return get_db()['reviews']


def _serialize(r):
    return {
        '_id':       str(r['_id']),
        'productId': r['productId'],
        'userId':    r.get('userId'),
        'name':      r.get('name', 'אנונימי'),
        'rating':    r.get('rating', 5),
        'title':     r.get('title', ''),
        'body':      r.get('body', ''),
        'verified':  r.get('verified', False),  # bought this product
        'createdAt': r['createdAt'].isoformat() if r.get('createdAt') else '',
    }


def _update_product_rating(product_id):
    """Recompute average rating on the product document."""
    pipeline = [
        {'$match': {'productId': product_id}},
        {'$group': {'_id': None, 'avg': {'$avg': '$rating'}, 'count': {'$sum': 1}}}
    ]
    res = list(_col().aggregate(pipeline))
    if res:
        avg   = round(res[0]['avg'], 1)
        count = res[0]['count']
        get_db()['products'].update_one(
            {'_id': ObjectId(product_id)},
            {'$set': {'rating': avg, 'reviewCount': count}}
        )


# ── GET /api/reviews?productId=xxx ───────────────────────────────────────────
@reviews_bp.route('/', methods=['GET'])
def get_reviews():
    product_id = request.args.get('productId', '')
    if not product_id:
        return jsonify({'reviews': []})
    reviews = list(_col().find({'productId': product_id}).sort('createdAt', -1).limit(50))
    return jsonify({'reviews': [_serialize(r) for r in reviews]})


# ── POST /api/reviews/ ────────────────────────────────────────────────────────
@reviews_bp.route('/', methods=['POST'])
def create_review():
    data       = request.get_json() or {}
    product_id = data.get('productId', '')
    rating     = int(data.get('rating', 5))
    title      = data.get('title', '').strip()
    body       = data.get('body', '').strip()
    name       = data.get('name', '').strip() or 'לקוח'

    if not product_id or not body:
        return jsonify({'error': 'productId and body required'}), 400
    if not 1 <= rating <= 5:
        return jsonify({'error': 'rating must be 1-5'}), 400

    # Get user if logged in
    user_id  = None
    verified = False
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            # Check if user bought this product
            order = get_db()['orders'].find_one({
                'userId': user_id,
                'items.product': product_id,
                'status': {'$in': ['הושלם', 'נשלח']}
            })
            verified = order is not None
            # Get name from user if not provided
            user = get_db()['users'].find_one({'_id': ObjectId(user_id)}, {'name': 1})
            if user and not data.get('name'):
                name = user.get('name', name)
    except Exception:
        pass

    # One review per user per product
    if user_id:
        existing = _col().find_one({'productId': product_id, 'userId': user_id})
        if existing:
            return jsonify({'error': 'כבר כתבת ביקורת למוצר זה'}), 409

    doc = {
        'productId': product_id,
        'userId':    user_id,
        'name':      name,
        'rating':    rating,
        'title':     title,
        'body':      body,
        'verified':  verified,
        'createdAt': datetime.datetime.utcnow(),
    }
    result = _col().insert_one(doc)
    doc['_id'] = result.inserted_id
    _update_product_rating(product_id)

    return jsonify(_serialize(doc)), 201


# ── DELETE /api/reviews/<id> ──────────────────────────────────────────────────
@reviews_bp.route('/<review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    from flask_jwt_extended import get_jwt
    user_id = get_jwt_identity()
    role    = get_jwt().get('role')
    review  = _col().find_one({'_id': ObjectId(review_id)})
    if not review:
        return jsonify({'error': 'Not found'}), 404
    if role != 'admin' and str(review.get('userId', '')) != str(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    _col().delete_one({'_id': ObjectId(review_id)})
    _update_product_rating(review['productId'])
    return jsonify({'ok': True})