# ════════════════════════════════════════════════════════════════════════════
#  ROUTES INTÉGRATIONS — Priority (lecture seule).
#  → backend/app/routes/integrations.py
#
#  Enregistre dans app/__init__.py (create_app) :
#    from app.routes.integrations import integrations_bp
#    app.register_blueprint(integrations_bp, url_prefix='/api/integrations')
# ════════════════════════════════════════════════════════════════════════════

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, verify_jwt_in_request
from app.services import priority_service

integrations_bp = Blueprint('integrations', __name__)


def _is_admin():
    try:
        verify_jwt_in_request()
        return get_jwt().get('role', 'user') == 'admin'
    except Exception:
        return False


# ── GET /api/integrations/priority/status ────────────────────────────────────
@integrations_bp.route('/priority/status', methods=['GET'])
@jwt_required()
def priority_status():
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403
    return jsonify(priority_service.check_connection())


# ── GET /api/integrations/priority/products?limit=50 ─────────────────────────
@integrations_bp.route('/priority/products', methods=['GET'])
@jwt_required()
def priority_products():
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403
    try:
        limit = int(request.args.get('limit', 50))
    except ValueError:
        limit = 50
    only_products = request.args.get('onlyProducts', 'true') == 'true'
    try:
        products = priority_service.fetch_products(limit=limit, only_products=only_products)
        return jsonify({'products': products, 'count': len(products)})
    except Exception as e:
        return jsonify({'error': str(e), 'products': []}), 502