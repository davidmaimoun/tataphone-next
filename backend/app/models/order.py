from datetime import datetime
from bson import ObjectId
from app.db import get_db


def get_collection():
    return get_db()['orders']


def create_indexes():
    col = get_collection()
    col.create_index('customer.email')
    col.create_index('status')
    col.create_index('createdAt')


VALID_STATUSES = ['ממתין', 'אושר', 'נשלח', 'הושלם', 'בוטל']


def create_order(data: dict) -> dict:
    now = datetime.utcnow()
    doc = {
        'customer': {
            'firstName': data['customer'].get('firstName', ''),
            'lastName':  data['customer'].get('lastName', ''),
            'email':     data['customer'].get('email', ''),
            'phone':     data['customer'].get('phone', ''),
            'address':   data['customer'].get('address', ''),
            'city':      data['customer'].get('city', ''),
            'notes':     data['customer'].get('notes', ''),
        },
        'items': [
            {
                'product':  str(i.get('product')),
                'name':     i.get('name', ''),
                'price':    float(i.get('price', 0)),
                'qty':      int(i.get('qty', 1)),
            }
            for i in data.get('items', [])
        ],
        'subtotal':       float(data.get('subtotal', data.get('total', 0))),
        'vat':            float(data.get('vat', 0)),
        'total':          float(data.get('total', 0)),
        'status':         'ממתין',
        'paymentMethod':  data.get('paymentMethod', 'pending'),
        'paymentStatus':  'pending',
        'userId':         data.get('userId'),
        'invoiceSent':    False,
        'createdAt':      now,
        'updatedAt':      now,
    }
    result = get_collection().insert_one(doc)
    doc['_id'] = result.inserted_id
    return serialize(doc)


def get_all(params: dict = {}):
    col   = get_collection()
    query = {}
    if params.get('status'):
        query['status'] = params['status']
    page  = max(1, int(params.get('page', 1)))
    limit = min(100, int(params.get('limit', 50)))
    skip  = (page - 1) * limit
    cursor = col.find(query).sort('createdAt', -1).skip(skip).limit(limit)
    orders = [serialize(o) for o in cursor]
    total  = col.count_documents(query)
    return {'orders': orders, 'total': total}


def get_by_id(order_id: str):
    try:
        o = get_collection().find_one({'_id': ObjectId(order_id)})
        return serialize(o) if o else None
    except Exception:
        return None


def get_by_user(user_id: str):
    cursor = get_collection().find({'userId': user_id}).sort('createdAt', -1)
    return [serialize(o) for o in cursor]


def update_status(order_id: str, status: str):
    if status not in VALID_STATUSES:
        raise ValueError(f'Invalid status: {status}')
    get_collection().update_one(
        {'_id': ObjectId(order_id)},
        {'$set': {'status': status, 'updatedAt': datetime.utcnow()}}
    )


def mark_invoice_sent(order_id: str):
    get_collection().update_one(
        {'_id': ObjectId(order_id)},
        {'$set': {'invoiceSent': True, 'updatedAt': datetime.utcnow()}}
    )


def get_stats():
    col = get_collection()
    pipeline_revenue = [
        {'$match': {'status': {'$ne': 'בוטל'}}},
        {'$group': {'_id': None, 'total': {'$sum': '$total'}, 'count': {'$sum': 1}}},
    ]
    pipeline_monthly = [
        {'$match': {'status': {'$ne': 'בוטל'}}},
        {'$group': {
            '_id':     {'$month': '$createdAt'},
            'revenue': {'$sum': '$total'},
            'orders':  {'$sum': 1},
        }},
        {'$sort': {'_id': 1}},
    ]
    MONTHS_HE = ['','ינו','פבר','מרץ','אפר','מאי','יונ','יול','אוג','ספט','אוק','נוב','דצמ']

    agg = list(col.aggregate(pipeline_revenue))
    monthly = list(col.aggregate(pipeline_monthly))

    total_revenue = agg[0]['total'] if agg else 0
    total_orders  = agg[0]['count'] if agg else 0

    revenue_chart = [
        {'month': MONTHS_HE[m['_id']], 'revenue': m['revenue']}
        for m in monthly if m['_id'] <= 12
    ]
    recent = list(col.find().sort('createdAt', -1).limit(5))

    return {
        'totalRevenue':  total_revenue,
        'totalOrders':   total_orders,
        'revenueChart':  revenue_chart,
        'recentOrders':  [serialize(o) for o in recent],
    }


def serialize(o: dict) -> dict:
    if not o:
        return {}
    return {
        '_id':           str(o['_id']),
        'customer':      o.get('customer', {}),
        'items':         o.get('items', []),
        'subtotal':      o.get('subtotal', o.get('total', 0)),
        'vat':           o.get('vat', 0),
        'total':         o.get('total', 0),
        'status':        o.get('status', 'ממתין'),
        'paymentMethod': o.get('paymentMethod'),
        'paymentStatus': o.get('paymentStatus'),
        'invoiceSent':   o.get('invoiceSent', False),
        'userId':        o.get('userId'),
        'createdAt':     o['createdAt'].isoformat() if o.get('createdAt') else '',
        'updatedAt':     o['updatedAt'].isoformat() if o.get('updatedAt') else '',
    }