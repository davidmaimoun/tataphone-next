from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db import get_db
from app.models import product as ProductModel
from bson import ObjectId
import datetime

wishlist_bp = Blueprint('wishlist', __name__)


def _col():
    return get_db()['wishlists']


@wishlist_bp.route('/', methods=['GET'])
@jwt_required()
def get_wishlist():
    user_id = get_jwt_identity()
    doc     = _col().find_one({'userId': user_id})
    ids     = doc.get('productIds', []) if doc else []

    # Fetch full product details
    products = []
    for pid in ids:
        try:
            p = ProductModel.get_by_id(pid)
            if p:
                products.append(p)
        except Exception:
            pass

    return jsonify({'products': products, 'ids': ids})


@wishlist_bp.route('/toggle', methods=['POST'])
@jwt_required()
def toggle():
    user_id    = get_jwt_identity()
    product_id = (request.get_json() or {}).get('productId', '')
    if not product_id:
        return jsonify({'error': 'productId required'}), 400

    doc = _col().find_one({'userId': user_id})

    if doc and product_id in doc.get('productIds', []):
        # Remove
        _col().update_one(
            {'userId': user_id},
            {'$pull': {'productIds': product_id}, '$set': {'updatedAt': datetime.datetime.utcnow()}}
        )
        return jsonify({'liked': False, 'productId': product_id})
    else:
        # Add
        _col().update_one(
            {'userId': user_id},
            {'$addToSet': {'productIds': product_id},
             '$set': {'updatedAt': datetime.datetime.utcnow()},
             '$setOnInsert': {'createdAt': datetime.datetime.utcnow()}},
            upsert=True
        )
        return jsonify({'liked': True, 'productId': product_id})


@wishlist_bp.route('/ids', methods=['GET'])
@jwt_required()
def get_ids():
    """Lightweight — just returns the list of liked product IDs."""
    user_id = get_jwt_identity()
    doc     = _col().find_one({'userId': user_id})
    ids     = doc.get('productIds', []) if doc else []
    return jsonify({'ids': ids})