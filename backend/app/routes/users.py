from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import user as UserModel
from app.db import get_db
from bson import ObjectId

users_bp = Blueprint('users', __name__)

def _is_admin():
    return get_jwt().get('role','user') == 'admin'

@users_bp.route('/', methods=['GET'])
@jwt_required()
def list_users():
    if not _is_admin(): return jsonify({'error':'Admin only'}), 403
    col = get_db()['users']
    users = list(col.find({}, {'password': 0}).sort('createdAt', -1).limit(200))
    # Enrich with order count
    orders_col = get_db()['orders']
    result = []
    for u in users:
        uid = str(u['_id'])
        order_count = orders_col.count_documents({'userId': uid})
        total_spent = list(orders_col.aggregate([
            {'$match': {'userId': uid, 'status': {'$ne': 'בוטל'}}},
            {'$group': {'_id': None, 'total': {'$sum': '$total'}}}
        ]))
        result.append({
            '_id':        uid,
            'name':       u.get('name',''),
            'email':      u.get('email',''),
            'phone':      u.get('phone',''),
            'role':       u.get('role','user'),
            'createdAt':  u['createdAt'].isoformat() if u.get('createdAt') else '',
            'orderCount': order_count,
            'totalSpent': total_spent[0]['total'] if total_spent else 0,
        })
    return jsonify({'users': result, 'total': len(result)})

@users_bp.route('/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    if not _is_admin(): return jsonify({'error':'Admin only'}), 403
    data = request.get_json() or {}
    allowed = {k: data[k] for k in ['name','email','phone','role'] if k in data}
    get_db()['users'].update_one({'_id': ObjectId(user_id)}, {'$set': allowed})
    return jsonify({'updated': True})

@users_bp.route('/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    if not _is_admin(): return jsonify({'error':'Admin only'}), 403
    get_db()['users'].delete_one({'_id': ObjectId(user_id)})
    return jsonify({'deleted': True})


# ── PUT /api/users/<id>/ban ────────────────────────────────────────────────
@users_bp.route('/<user_id>/ban', methods=['PUT'])
@jwt_required()
def ban_user(user_id):
    if get_jwt().get('role') != 'admin':
        return jsonify({'error': 'Admin only'}), 403
    from app.db import get_db; from bson import ObjectId
    get_db()['users'].update_one({'_id': ObjectId(user_id)}, {'$set': {'banned': True}})
    return jsonify({'ok': True})


@users_bp.route('/<user_id>/unban', methods=['PUT'])
@jwt_required()
def unban_user(user_id):
    if get_jwt().get('role') != 'admin':
        return jsonify({'error': 'Admin only'}), 403
    from app.db import get_db; from bson import ObjectId
    get_db()['users'].update_one({'_id': ObjectId(user_id)}, {'$set': {'banned': False}})
    return jsonify({'ok': True})


# ── GET /api/users/<id>/reviews ────────────────────────────────────────────
@users_bp.route('/<user_id>/reviews', methods=['GET'])
@jwt_required()
def user_reviews(user_id):
    if get_jwt().get('role') != 'admin':
        return jsonify({'error': 'Admin only'}), 403
    from app.db import get_db
    reviews = list(get_db()['reviews'].find({'userId': user_id}).sort('createdAt', -1))
    for r in reviews:
        r['_id'] = str(r['_id'])
        if r.get('createdAt'):
            r['createdAt'] = r['createdAt'].isoformat()
    return jsonify({'reviews': reviews})


# ── GET /api/users/guests ─────────────────────────────────────────────────
@users_bp.route('/guests', methods=['GET'])
@jwt_required()
def get_guests():
    if get_jwt().get('role') != 'admin':
        return jsonify({'error': 'Admin only'}), 403
    from app.db import get_db
    guests = list(get_db()['guests'].find().sort('lastSeen', -1).limit(200))
    for g in guests:
        g['_id'] = str(g['_id'])
        for f in ['createdAt', 'lastSeen']:
            if g.get(f): g[f] = g[f].isoformat()
    return jsonify({'guests': guests})


# ── POST /api/analytics/visit ─────────────────────────────────────────────
@users_bp.route('/analytics/visit', methods=['POST'])
def track_visit():
    from app.db import get_db
    import datetime
    db  = get_db()
    today = datetime.datetime.utcnow().strftime('%Y-%m-%d')
    db['analytics'].update_one(
        {'date': today},
        {'$inc': {'visits': 1}},
        upsert=True
    )
    return jsonify({'ok': True})


# ── GET /api/analytics/stats ──────────────────────────────────────────────
@users_bp.route('/analytics/stats', methods=['GET'])
@jwt_required()
def analytics_stats():
    if get_jwt().get('role') != 'admin':
        return jsonify({'error': 'Admin only'}), 403
    from app.db import get_db
    import datetime
    db  = get_db()
    days = int(request.args.get('days', 30))
    since = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    since_str = since.strftime('%Y-%m-%d')

    visits = list(db['analytics'].find({'date': {'$gte': since_str}}).sort('date', 1))
    orders = list(db['orders'].find({'createdAt': {'$gte': since}}, {'createdAt':1,'total':1}))

    # Build daily data
    daily = {}
    for v in visits:
        daily[v['date']] = {'date': v['date'], 'visits': v.get('visits',0), 'orders': 0, 'revenue': 0}
    for o in orders:
        d = o['createdAt'].strftime('%Y-%m-%d')
        if d not in daily:
            daily[d] = {'date': d, 'visits': 0, 'orders': 0, 'revenue': 0}
        daily[d]['orders'] += 1
        daily[d]['revenue'] += o.get('total', 0)

    data = sorted(daily.values(), key=lambda x: x['date'])
    total_visits = sum(d['visits'] for d in data)
    total_orders = sum(d['orders'] for d in data)
    conversion = round((total_orders / total_visits * 100), 1) if total_visits else 0

    return jsonify({
        'daily': data,
        'totals': {
            'visits': total_visits,
            'orders': total_orders,
            'revenue': sum(d['revenue'] for d in data),
            'conversion': conversion,
        }
    })