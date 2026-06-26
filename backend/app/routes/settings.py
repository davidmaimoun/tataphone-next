"""
settings.py (routes) — API des paramètres boutique.
  GET  /api/settings        → public (lecture, pour cart/checkout/bannière)
  PUT  /api/settings        → admin (modification)

À enregistrer dans create_app() :
  from app.routes.settings import settings_bp
  app.register_blueprint(settings_bp, url_prefix='/api/settings')
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request

from app.models import settings as SettingsModel

settings_bp = Blueprint('settings', __name__)


def _is_admin():
    try:
        verify_jwt_in_request()
        return get_jwt().get('role', 'user') == 'admin'
    except Exception:
        return False


@settings_bp.route('', methods=['GET'])
@settings_bp.route('/', methods=['GET'])
def get_settings():
    """Public — lecture des settings (cart, checkout, bannière promo)."""
    s = SettingsModel.get_settings()
    # On peut exposer tout : ce sont des infos publiques (TVA, livraison, infos boutique)
    return jsonify(s)


@settings_bp.route('', methods=['PUT'])
@settings_bp.route('/', methods=['PUT'])
def update_settings():
    """Admin — modification des settings."""
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403
    data = request.get_json() or {}
    updated = SettingsModel.update_settings(data)
    return jsonify(updated)