import os
import secrets
import datetime
import requests as http_requests

from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import (
    create_access_token, jwt_required,
    get_jwt_identity, get_jwt
)
from app.models import user as UserModel
from app.db import get_db
from app.services.email_service import send_welcome, send_email, _wrap, _btn, APP_URL

auth_bp = Blueprint('auth', __name__)

GOOGLE_CLIENT_ID     = os.getenv('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')
GOOGLE_REDIRECT_URI  = os.getenv('GOOGLE_REDIRECT_URI', f"{APP_URL}/api/auth/google/callback")


def _make_token(user: dict) -> str:
    additional = {
        'role':  user.get('role', 'user'),
        'name':  user.get('name', ''),
        'email': user.get('email', ''),
    }
    return create_access_token(
        identity=str(user['_id']),
        additional_claims=additional,
    )


# ── Register ──────────────────────────────────────────────────────────────────

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    if UserModel.find_by_email(data['email']):
        return jsonify({'error': 'Email already in use'}), 409

    data['verified'] = False
    user  = UserModel.create_user(data)
    token = secrets.token_urlsafe(32)

    get_db()['email_verifications'].insert_one({
        'userId':    str(user['_id']),
        'token':     token,
        'email':     user['email'],
        'expiresAt': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
    })

    try:
        _send_verification_email(user['email'], user.get('name', ''), token)
    except Exception as e:
        print(f'[EMAIL] verification failed: {e}')

    return jsonify({
        'message': 'נשלח אימייל לאימות. אנא בדוק את תיבת הדואר שלך.',
        'requiresVerification': True,
    }), 201


@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    token = (request.get_json() or {}).get('token', '')
    if not token:
        return jsonify({'error': 'Token required'}), 400

    rec = get_db()['email_verifications'].find_one({'token': token})
    if not rec:
        return jsonify({'error': 'קישור לא תקין'}), 400
    if rec['expiresAt'] < datetime.datetime.utcnow():
        return jsonify({'error': 'הקישור פג תוקף — בקש קישור חדש'}), 400

    import bson
    get_db()['users'].update_one(
        {'_id': bson.ObjectId(rec['userId'])},
        {'$set': {'verified': True}}
    )
    get_db()['email_verifications'].delete_one({'token': token})

    user = UserModel.find_by_id(rec['userId'])
    jwt  = _make_token(user)

    try:
        send_welcome(user['email'], user.get('name', ''))
    except Exception as e:
        print(f'[EMAIL] welcome failed: {e}')

    ip = request.headers.get('X-Forwarded-For', request.remote_addr or '').split(',')[0].strip()
    if ip:
        import datetime as _dt
        get_db()['users'].update_one({'_id': user['_id']}, {'$set': {'ip': ip, 'lastLogin': _dt.datetime.utcnow()}})
    return jsonify({'token': jwt, 'user': UserModel.serialize(user)})


@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    email = (request.get_json() or {}).get('email', '')
    user  = UserModel.find_by_email(email)
    if not user:
        return jsonify({'error': 'משתמש לא נמצא'}), 404
    if user.get('verified'):
        return jsonify({'error': 'החשבון כבר מאומת'}), 400

    get_db()['email_verifications'].delete_many({'userId': str(user['_id'])})
    token = secrets.token_urlsafe(32)
    get_db()['email_verifications'].insert_one({
        'userId':    str(user['_id']),
        'token':     token,
        'email':     email,
        'expiresAt': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
    })
    try:
        _send_verification_email(email, user.get('name', ''), token)
    except Exception as e:
        print(f'[EMAIL] resend failed: {e}')

    return jsonify({'message': 'אימייל נשלח מחדש'})


# ── Login ─────────────────────────────────────────────────────────────────────

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    user = UserModel.find_by_email(data.get('email', ''))
    if not user or not UserModel.verify_password(user, data.get('password', '')):
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user.get('verified', True):
        return jsonify({
            'error': 'יש לאמת את האימייל לפני ההתחברות',
            'requiresVerification': True,
            'email': user['email'],
        }), 403

    token = _make_token(user)
    return jsonify({'token': token, 'user': UserModel.serialize(user)})


# ── Google OAuth — redirect flow ──────────────────────────────────────────────

@auth_bp.route('/google', methods=['GET'])
def google_init():
    """Step 1 — return Google OAuth URL to frontend."""
    state = secrets.token_urlsafe(16)
    # Store state in DB for CSRF protection
    get_db()['oauth_states'].insert_one({
        'state':     state,
        'expiresAt': datetime.datetime.utcnow() + datetime.timedelta(minutes=10),
    })
    params = {
        'client_id':     GOOGLE_CLIENT_ID,
        'redirect_uri':  GOOGLE_REDIRECT_URI,
        'response_type': 'code',
        'scope':         'openid email profile',
        'state':         state,
        'access_type':   'offline',
        'prompt':        'select_account',
    }
    from urllib.parse import urlencode
    url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urlencode(params)
    return jsonify({'url': url})


@auth_bp.route('/google/callback', methods=['GET'])
def google_callback():
    """Step 2 — Google redirects here with ?code=xxx&state=xxx."""
    code  = request.args.get('code')
    state = request.args.get('state')
    error = request.args.get('error')

    print(f"[GOOGLE] callback reçu — code={'oui' if code else 'non'}, state={state}")   

    if error or not code:
        print("[GOOGLE] → google_cancelled")                                              
        return redirect(f"{APP_URL}/login?error=google_cancelled")

    rec = get_db()['oauth_states'].find_one_and_delete({'state': state})
    print(f"[GOOGLE] state trouvé en base ? {'oui' if rec else 'NON'}")                   
    if not rec or rec['expiresAt'] < datetime.datetime.utcnow():
        print("[GOOGLE] → invalid_state")                                                 
        return redirect(f"{APP_URL}/login?error=invalid_state")
    

    # Exchange code for tokens
    token_resp = http_requests.post('https://oauth2.googleapis.com/token', data={
        'code':          code,
        'client_id':     GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri':  GOOGLE_REDIRECT_URI,
        'grant_type':    'authorization_code',
    })
   
    if token_resp.status_code != 200:
        print(f"[GOOGLE] ÉCHANGE ÉCHOUÉ — HTTP {token_resp.status_code}")
        print(f"[GOOGLE] réponse Google: {token_resp.text}")
        print(f"[GOOGLE] redirect_uri envoyé: {GOOGLE_REDIRECT_URI}")
        print(f"[GOOGLE] client_id présent: {bool(GOOGLE_CLIENT_ID)}, secret présent: {bool(GOOGLE_CLIENT_SECRET)}")
        return redirect(f"{APP_URL}/login?error=token_exchange_failed")

    tokens   = token_resp.json()
    id_token = tokens.get('id_token')

    # Verify id_token and get user info
    info_resp = http_requests.get(
        'https://oauth2.googleapis.com/tokeninfo',
        params={'id_token': id_token},
    )

    if info_resp.status_code != 200:
        return redirect(f"{APP_URL}/login?error=invalid_token")
        

    info = info_resp.json()

    # Find or create user
    print(f"[GOOGLE] email={info.get('email')} name={info.get('name')}")
    user = UserModel.find_by_email(info['email'])
    print(f"[GOOGLE] existing user: {user is not None}")
    
    if not user:
        user = UserModel.create_user({
            'name':     info.get('name', ''),
            'email':    info['email'],
            'googleId': info.get('sub'),
            'picture':  info.get('picture'),
            'password': '',
            'verified': True,
        })
        try:
            send_welcome(user['email'], user.get('name', ''))
        except Exception as e:
            print(f'[EMAIL] welcome failed: {e}')
    else:
        get_db()['users'].update_one(
            {'_id': user['_id']},
            {'$set': {'verified': True}}
        )

    jwt = _make_token(user)
    # Redirect to frontend with JWT in query param (frontend stores it)
    return redirect(f"{APP_URL}/auth/google/success?token={jwt}")


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user    = UserModel.find_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(UserModel.serialize(user))


# ── Email template ────────────────────────────────────────────────────────────

def _send_verification_email(to: str, name: str, token: str):
    url  = f"{APP_URL}/verify-email?token={token}"
    html = _wrap(f"""
      <h2 style="font-size:20px;font-weight:900;color:#0F172A;margin:0 0 8px;">אמת את האימייל שלך 📧</h2>
      <p style="font-size:14px;color:#64748B;line-height:1.7;margin:0 0 16px;">
        שלום {name},<br>
        תודה שנרשמת לטטהפון! לחץ על הכפתור להשלמת ההרשמה.
      </p>
      <div style="background:#EFF6FF;border-radius:10px;padding:12px 16px;margin:14px 0;">
        <p style="font-size:12px;color:#1D4ED8;margin:0;">⏰ הקישור תקף ל-24 שעות בלבד</p>
      </div>
      {_btn(url, "אמת את האימייל שלי")}
      <p style="font-size:11px;color:#94A3B8;margin-top:16px;">
        אם לא נרשמת — התעלם מאימייל זה.<br>
        או העתק: <span style="color:#2563EB;word-break:break-all;">{url}</span>
      </p>
    """)
    send_email(to, "אמת את האימייל שלך — טטהפון 📧", html)