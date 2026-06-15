import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from .db import init_db

load_dotenv()

def create_app():
    app = Flask(__name__)

    # ── Config ────────────────────────────────────────
    app.config['JWT_SECRET_KEY']           = os.getenv('JWT_SECRET', 'dev-secret')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = __import__('datetime').timedelta(
        hours=int(os.getenv('JWT_EXPIRY_HOURS', 48))
    )
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_MB', 16)) * 1024 * 1024
    app.config['UPLOAD_FOLDER']      = os.path.join(
        os.path.dirname(__file__), '..', os.getenv('UPLOAD_FOLDER', 'uploads')
    )
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # ── Extensions ───────────────────────────────────
    CORS(app, origins=os.getenv('CORS_ORIGINS', '*').split(','))
    JWTManager(app)
    init_db()

    # ── Blueprints ───────────────────────────────────
    from .routes.auth       import auth_bp
    from .routes.products   import products_bp
    from .routes.orders     import orders_bp
    from .routes.promotions import promotions_bp
    from .routes.users      import users_bp
    from .routes.contact    import contact_bp
    from .routes.uploads    import uploads_bp
    from .routes.wishlist   import wishlist_bp
    from .routes.meta      import meta_bp
    from .routes.reviews   import reviews_bp

    app.register_blueprint(wishlist_bp,    url_prefix='/api/wishlist')
    app.register_blueprint(meta_bp,        url_prefix='/api/meta')
    app.register_blueprint(reviews_bp,    url_prefix='/api/reviews')

    app.register_blueprint(auth_bp,       url_prefix='/api/auth')
    app.register_blueprint(products_bp,   url_prefix='/api/products')
    app.register_blueprint(orders_bp,     url_prefix='/api/orders')
    app.register_blueprint(promotions_bp, url_prefix='/api/promotions')
    app.register_blueprint(users_bp,      url_prefix='/api/users')
    app.register_blueprint(contact_bp,    url_prefix='/api/contact')
    app.register_blueprint(uploads_bp,    url_prefix='/api/uploads')



    return app