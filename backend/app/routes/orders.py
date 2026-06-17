import io, smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request
from fpdf import FPDF

from app.models import order as OrderModel
from app.models import product as ProductModel
from app.services.email_service import send_order_confirmation, send_email

orders_bp = Blueprint('orders', __name__)


def _is_admin():
    try:
        verify_jwt_in_request()
        role = get_jwt().get('role', 'user')
        return role == 'admin'
    except Exception as e:
        print(f"[AUTH] _is_admin error: {e}")
        return False


def _get_user_id():
    try:
        verify_jwt_in_request()
        return get_jwt_identity()
    except Exception:
        return None


# ── Routes ────────────────────────────────────────────────────────────────────

@orders_bp.route('/', methods=['POST'])
def create_order():
    data    = request.get_json() or {}
    print(f"[ORDER] received: subtotal={data.get('subtotal')} vat={data.get('vat')} total={data.get('total')}")
    user_id = _get_user_id()
    if user_id:
        data['userId'] = user_id

    # AJOUT : flag commande test (le bouton test du checkout envoie paymentMethod='test')
    data['isTest'] = (data.get('paymentMethod') == 'test')

    for item in data.get('items', []):
        p = ProductModel.get_by_id(item.get('product', ''))
        if p:
            item['name'] = p.get('name', '')
            # AJOUT : on fige le prix fournisseur dans la commande (pour la compta)
            try:
                item['supplierPrice'] = float(p.get('supplierPrice') or 0)
            except (TypeError, ValueError):
                item['supplierPrice'] = 0
    order = OrderModel.create_order(data)

    # Send HTML confirmation
    try:
        c = order.get('customer', {})
        print(f"[EMAIL] order subtotal={order.get('subtotal')} vat={order.get('vat')} total={order.get('total')}")
        if c.get('email'):
            send_order_confirmation(c['email'], c.get('firstName',''), order)
    except Exception as e:
        print(f'[EMAIL] confirmation failed: {e}')

    # PDF is already attached in send_order_confirmation above
    OrderModel.mark_invoice_sent(order.get('_id',''))
    return jsonify(order), 201


@orders_bp.route('/', methods=['GET'])
@jwt_required()
def list_orders():
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403
    return jsonify(OrderModel.get_all(request.args.to_dict()))


@orders_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403
    from app.db import get_db
    s = OrderModel.get_stats()
    s['totalProducts'] = get_db()['products'].count_documents({})
    s['newUsers']      = get_db()['users'].count_documents({})
    return jsonify(s)


# ── GET /api/orders/accounting?month=YYYY-MM — RAPPORT COMPTABLE (AJOUT) ──────
@orders_bp.route('/accounting', methods=['GET'])
@jwt_required()
def accounting():
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403
    from app.db import get_db
    from bson import ObjectId
    import datetime

    month        = request.args.get('month')                       # 'YYYY-MM'
    include_test = request.args.get('includeTest') == 'true'
    now = datetime.datetime.utcnow()
    if month:
        try:
            y, m = map(int, month.split('-'))
        except Exception:
            y, m = now.year, now.month
    else:
        y, m = now.year, now.month
    start = datetime.datetime(y, m, 1)
    end   = datetime.datetime(y + (m // 12), (m % 12) + 1, 1)

    db = get_db()
    q = {'createdAt': {'$gte': start, '$lt': end}, 'status': 'completed'}
    if not include_test:
        q['isTest'] = {'$ne': True}
    
    orders = list(db['orders'].find(q))

    supplier_cache = {}
    def supplier_of(item):
        sp = item.get('supplierPrice')
        if sp is not None:
            try: return float(sp)
            except (TypeError, ValueError): return 0
        pid = item.get('product', '')
        if pid in supplier_cache:
            return supplier_cache[pid]
        val = 0
        try:
            prod = db['products'].find_one({'_id': ObjectId(pid)})
            if prod:
                val = float(prod.get('supplierPrice') or 0)
        except Exception:
            val = 0
        supplier_cache[pid] = val
        return val

    revenue = 0.0
    supplier_cost = 0.0
    product_stats = {}
    for o in orders:
        for it in o.get('items', []):
            qty   = int(it.get('qty', 1) or 1)
            price = float(it.get('price', 0) or 0)
            sup   = supplier_of(it)
            revenue       += price * qty
            supplier_cost += sup * qty
            key = it.get('name', '—')
            if key not in product_stats:
                product_stats[key] = {'name': key, 'qty': 0, 'revenue': 0.0, 'supplierCost': 0.0}
            product_stats[key]['qty']          += qty
            product_stats[key]['revenue']      += price * qty
            product_stats[key]['supplierCost'] += sup * qty

    products = sorted(product_stats.values(), key=lambda x: x['qty'], reverse=True)
    for p in products:
        p['revenue']      = round(p['revenue'], 2)
        p['supplierCost'] = round(p['supplierCost'], 2)
        p['profit']       = round(p['revenue'] - p['supplierCost'], 2)

    return jsonify({
        'month':        f'{y:04d}-{m:02d}',
        'orderCount':   len(orders),
        'revenue':      round(revenue, 2),
        'supplierCost': round(supplier_cost, 2),
        'profit':       round(revenue - supplier_cost, 2),
        'products':     products,
    })


@orders_bp.route('/mine', methods=['GET'])
@jwt_required()
def my_orders():
    return jsonify(OrderModel.get_by_user(get_jwt_identity()))


@orders_bp.route('/<order_id>', methods=['GET'])
def get_order(order_id):
    order = OrderModel.get_by_id(order_id)
    if not order:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(order)


@orders_bp.route('/<order_id>/status', methods=['PUT'])
@jwt_required()
def update_status(order_id):
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403
    status = (request.get_json() or {}).get('status')
    try:
        OrderModel.update_status(order_id, status)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    try:
        order = OrderModel.get_by_id(order_id)
        if order:
            _send_status_email(order, status)
    except Exception as e:
        print(f'[EMAIL] status update failed: {e}')

    return jsonify({'updated': True})


@orders_bp.route('/<order_id>/invoice', methods=['POST'])
@jwt_required()
def send_invoice(order_id):
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403
    order = OrderModel.get_by_id(order_id)
    if not order:
        return jsonify({'error': 'Not found'}), 404
    try:
        pdf_bytes = _generate_invoice_pdf(order)
        _send_invoice_with_pdf(order, pdf_bytes)
        OrderModel.mark_invoice_sent(order_id)
    except Exception as e:
        print(f'[INVOICE] failed: {e}')
        return jsonify({'error': str(e)}), 500
    return jsonify({'sent': True})


# ── PDF invoice ───────────────────────────────────────────────────────────────

def _generate_invoice_pdf(order: dict) -> bytes:
    """Delegate to email_service to avoid duplication."""
    from app.services.email_service import _generate_invoice_pdf as _pdf
    return _pdf(order)


def _send_invoice_with_pdf(order: dict, pdf_bytes: bytes):
    """Send invoice via email_service (rich HTML + PDF attached)."""
    from app.services.email_service import send_order_confirmation
    c    = order.get('customer', {})
    to   = c.get('email', '')
    name = c.get('firstName', '')
    if not to:
        print('[INVOICE] No recipient — skipping')
        return
    send_order_confirmation(to, name, order)
    print(f'[INVOICE] Sent to {to}')


# ── GET /api/orders/<id>/invoice-download ─────────────────────────────────────
@orders_bp.route('/<order_id>/invoice-download', methods=['GET'])
@jwt_required()
def download_invoice(order_id):
    """Download PDF invoice — accessible by the order owner or admin."""
    from flask import send_file
    import io

    current_user = get_jwt_identity()
    order = OrderModel.get_by_id(order_id)
    if not order:
        return jsonify({'error': 'Not found'}), 404

    is_admin = get_jwt().get('role') == 'admin'
    is_owner = str(order.get('userId', '')) == str(current_user)
    if not is_admin and not is_owner:
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        pdf_bytes = _generate_invoice_pdf(order)
        oid = str(order['_id'])[-8:].upper()
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'tataphone_invoice_{oid}.pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── GET /api/orders/pending-count ─────────────────────────────────────────────
@orders_bp.route('/pending-count', methods=['GET'])
@jwt_required()
def pending_count():
    if not _is_admin():
        return jsonify({'error': 'Admin only'}), 403
    from app.db import get_db
    count = get_db()['orders'].count_documents({'status': 'pending'})
    return jsonify({'count': count})


def _send_status_email(order: dict, status: str):
    from app.services.email_service import send_email, _wrap, _btn, APP_URL
    cust = order.get('customer', {})
    to   = cust.get('email', ''); name = cust.get('firstName', '')
    oid  = str(order.get('_id',''))[-8:].upper()
    if not to: return
 
    STATUS_CFG = {
        'approved':  ('ההזמנה אושרה! ✅', '🎉', '#059669', 'ההזמנה שלך אושרה ומוכנה לשליחה.'),
        'shipped':   ('ההזמנה נשלחה! 🚚', '📦', '#CC785C', 'ההזמנה בדרך! צפה לקבל אותה תוך 2-4 ימי עסקים.'),
        'completed': ('ההזמנה הושלמה! 🎊', '🎊', '#7C3AED', 'תודה שקנית בטאטעפון! נשמח לראותך שוב.'),
        'cancelled': ('ההזמנה בוטלה ❌', '❌', '#DC2626', 'ההזמנה שלך בוטלה. לשאלות פנה אלינו.'),
    }
    if status not in STATUS_CFG: return
    title, emoji, color, desc = STATUS_CFG[status]
    order_btn = _btn(f"{APP_URL}/my-orders", "צפה בהזמנות שלי") if order.get('userId') else ""
    html = _wrap(
        f"<div style='text-align:center;padding:20px 0 16px;'><div style='font-size:48px;'>{emoji}</div>"
        f"<h2 style='font-size:22px;font-weight:900;color:#3A2A22;margin:12px 0 8px;'>{title}</h2>"
        f"<p style='font-size:14px;color:#7A6A60;'>הזמנה <strong style='color:{color};'>#{oid}</strong></p></div>"
        f"<div style='background:#FAF3EF;border-radius:10px;padding:16px 20px;margin:16px 0;text-align:right;'>"
        f"<p style='font-size:14px;color:#5A4A40;line-height:1.7;'>שלום {name},<br>{desc}</p></div>{order_btn}"
    )
    send_email(to, f"הזמנה #{oid} — {title}", html)
 

# ── POST /api/payments/paypal/create ─────────────────────────────────────────
@orders_bp.route('/paypal/create', methods=['POST'])
def paypal_create():
    """Create PayPal order and return approval URL."""
    import os, requests as req
    data     = request.get_json() or {}
    amount   = float(data.get('amount', 0))
    order_id = data.get('orderId', '')

    client_id = os.getenv('PAYPAL_CLIENT_ID', '')
    secret    = os.getenv('PAYPAL_SECRET', '')
    base      = 'https://api-m.sandbox.paypal.com' if os.getenv('PAYPAL_SANDBOX','true')=='true' \
                else 'https://api-m.paypal.com'

    if not client_id or not secret:
        return jsonify({'error': 'PayPal not configured'}), 500

    token_resp = req.post(f'{base}/v1/oauth2/token',
        auth=(client_id, secret),
        data={'grant_type': 'client_credentials'})
    access_token = token_resp.json().get('access_token')

    app_url = os.getenv('APP_URL', 'http://localhost:3000')
    pp_resp = req.post(f'{base}/v2/checkout/orders',
        headers={'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'},
        json={
            'intent': 'CAPTURE',
            'purchase_units': [{'amount': {'currency_code': 'ILS', 'value': f'{amount:.2f}'},
                                'custom_id': order_id}],
            'application_context': {
                'return_url': f'{app_url}/order-success?paypal=success&orderId={order_id}',
                'cancel_url': f'{app_url}/checkout?paypal=cancel',
            }
        })
    pp_data = pp_resp.json()
    approve = next((l['href'] for l in pp_data.get('links',[]) if l['rel']=='approve'), None)
    return jsonify({'approvalUrl': approve, 'paypalOrderId': pp_data.get('id')})


# ── POST /api/payments/paypal/capture ────────────────────────────────────────
@orders_bp.route('/paypal/capture', methods=['POST'])
def paypal_capture():
    """Capture PayPal payment after approval."""
    import os, requests as req
    data           = request.get_json() or {}
    paypal_order_id = data.get('paypalOrderId', '')
    our_order_id    = data.get('orderId', '')

    client_id = os.getenv('PAYPAL_CLIENT_ID', '')
    secret    = os.getenv('PAYPAL_SECRET', '')
    base      = 'https://api-m.sandbox.paypal.com' if os.getenv('PAYPAL_SANDBOX','true')=='true' \
                else 'https://api-m.paypal.com'

    token_resp = req.post(f'{base}/v1/oauth2/token',
        auth=(client_id, secret), data={'grant_type': 'client_credentials'})
    access_token = token_resp.json().get('access_token')

    cap_resp = req.post(f'{base}/v2/checkout/orders/{paypal_order_id}/capture',
        headers={'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'})
    cap_data = cap_resp.json()

    if cap_data.get('status') == 'COMPLETED':
        OrderModel.update_status(our_order_id, 'אושר')
        from app.db import get_db
        get_db()['orders'].update_one(
            {'_id': __import__('bson').ObjectId(our_order_id)},
            {'$set': {'paymentStatus': 'paid', 'paymentMethod': 'paypal'}}
        )
        return jsonify({'ok': True, 'status': 'COMPLETED'})
    return jsonify({'ok': False, 'status': cap_data.get('status')}), 400


# ── POST /api/payments/payplus/create ────────────────────────────────────────
@orders_bp.route('/payplus/create', methods=['POST'])
def payplus_create():
    """Create PayPlus payment page and return URL."""
    import os, requests as req, hashlib, json as _json
    data     = request.get_json() or {}
    amount   = float(data.get('amount', 0))
    order_id = data.get('orderId', '')
    customer = data.get('customer', {})

    api_key    = os.getenv('PAYPLUS_API_KEY', '')
    secret_key = os.getenv('PAYPLUS_SECRET_KEY', '')
    app_url    = os.getenv('APP_URL', 'http://localhost:3000')

    if not api_key or not secret_key:
        return jsonify({'error': 'PayPlus not configured'}), 500

    payload = {
        'payment_page_uid': os.getenv('PAYPLUS_PAGE_UID', ''),
        'charge_method': 1,
        'currency_code': 'ILS',
        'amount': amount,
        'order': {'id': order_id},
        'customer': {
            'customer_name':  customer.get('firstName','') + ' ' + customer.get('lastName',''),
            'email':          customer.get('email',''),
            'phone':          customer.get('phone',''),
        },
        'success_url': f'{app_url}/order-success?payplus=success&orderId={order_id}',
        'cancel_url':  f'{app_url}/checkout?payplus=cancel',
        'notify_url':  f'{os.getenv("BACKEND_URL","http://localhost:5000")}/api/orders/payplus/webhook',
    }
    signature = hashlib.md5(f"{api_key}{secret_key}{_json.dumps(payload,separators=(',',':'))}".encode()).hexdigest()
    resp = req.post('https://reserver.payplus.co.il/api/v1.0/PaymentPages/generateLink',
        headers={'api_key': api_key, 'secret_key': secret_key, 'Content-Type': 'application/json'},
        json=payload)
    resp_data = resp.json()
    url = resp_data.get('data', {}).get('payment_page_link')
    return jsonify({'paymentUrl': url})


# ── POST /api/payments/payplus/webhook ───────────────────────────────────────
@orders_bp.route('/payplus/webhook', methods=['POST'])
def payplus_webhook():
    data     = request.get_json() or {}
    order_id = data.get('order', {}).get('id', '')
    status   = data.get('status_code')
    if status == '000' and order_id:  # 000 = success in PayPlus
        OrderModel.update_status(order_id, 'אושר')
        from app.db import get_db
        get_db()['orders'].update_one(
            {'_id': __import__('bson').ObjectId(order_id)},
            {'$set': {'paymentStatus': 'paid', 'paymentMethod': 'payplus'}}
        )
    return jsonify({'ok': True})


# ── POST /api/orders/track-guest ─────────────────────────────────────────────
@orders_bp.route('/track-guest', methods=['POST'])
def track_guest():
    """Track guest orders for admin stats."""
    from app.db import get_db
    import datetime
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({'ok': False}), 400
    ip = request.headers.get('X-Forwarded-For', request.remote_addr or '').split(',')[0].strip()
    db = get_db()
    db['guests'].update_one(
        {'email': email},
        {'$set': {
            'email': email,
            'lastSeen': datetime.datetime.utcnow(),
            'ip': ip,
            'name': data.get('name', ''),
            'phone': data.get('phone', ''),
        },
        '$inc': {'orderCount': 1},
        '$setOnInsert': {'createdAt': datetime.datetime.utcnow(), 'banned': False}},
        upsert=True
    )
    return jsonify({'ok': True})