from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app.models import promotion as PromotionModel
from app.models import product   as ProductModel

promotions_bp = Blueprint('promotions', __name__)


def _is_admin():
    return get_jwt().get('role','user') == 'admin'


# ── GET /api/promotions ───────────────────────────────────────────────────────
@promotions_bp.route('/', methods=['GET'])
def list_promotions():
    return jsonify(PromotionModel.get_all())


# ── POST /api/promotions ──────────────────────────────────────────────────────
@promotions_bp.route('/', methods=['POST'])
@jwt_required()
def create_promotion():
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403
    data  = request.get_json() or {}
    promo = PromotionModel.create_promotion(data)
    return jsonify(promo), 201


# ── PUT /api/promotions/:id ───────────────────────────────────────────────────
@promotions_bp.route('/<promo_id>', methods=['PUT'])
@jwt_required()
def update_promotion(promo_id):
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403
    data  = request.get_json() or {}
    promo = PromotionModel.update_promotion(promo_id, data)
    return jsonify(promo)


# ── DELETE /api/promotions/:id ────────────────────────────────────────────────
@promotions_bp.route('/<promo_id>', methods=['DELETE'])
@jwt_required()
def delete_promotion(promo_id):
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403
    PromotionModel.delete_promotion(promo_id)
    return jsonify({'deleted': True})


# ── POST /api/promotions/apply ────────────────────────────────────────────────
@promotions_bp.route('/apply', methods=['POST'])
@jwt_required()
def apply_discount():
    """Instantly apply a discount % to products, category, or all."""
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403

    data         = request.get_json() or {}
    target_type  = data.get('type', 'category')    # product | category | all
    target       = data.get('target', '')
    discount_pct = float(data.get('discount', 10))

    count = ProductModel.apply_promotion(target_type, target, discount_pct)
    return jsonify({'applied': count, 'discount': discount_pct})