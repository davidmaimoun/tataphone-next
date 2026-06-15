from datetime import datetime
from bson import ObjectId

def _to_bool(val, default=False):
    """Convert any truthy value to bool."""
    if isinstance(val, bool): return val
    if isinstance(val, str):  return val.lower() in ('yes','true','1','כן')
    return bool(val) if val is not None else default


from app.db import get_db


def get_collection():
    return get_db()['products']


def create_indexes():
    col = get_collection()
    col.create_index('category')
    col.create_index('brand')
    col.create_index([('name', 'text'), ('brand', 'text'), ('description', 'text')])
    col.create_index('sku', sparse=True)
    col.create_index('createdAt')
    col.create_index('rating')


# ── Helpers ──────────────────────────────────────────────────────────────────

def build_query(params: dict) -> dict:
    query = {}
    if params.get('cat'):
        query['category'] = params['cat']
    if params.get('brand'):
        query['brand'] = {'$regex': params['brand'], '$options': 'i'}
    if params.get('q'):
        query['$text'] = {'$search': params['q']}
    if params.get('sale') == 'true':
        query['discount'] = True
    if params.get('isKosher') == 'true':
        query['isKosher'] = True
    if params.get('isAccessory') == 'true':
        query['isAccessory'] = True
    if params.get('min_price') or params.get('max_price'):
        price_q = {}
        if params.get('min_price'):
            price_q['$gte'] = float(params['min_price'])
        if params.get('max_price'):
            price_q['$lte'] = float(params['max_price'])
        query['price'] = price_q
    return query


def get_all(params: dict = {}):
    col    = get_collection()
    query  = build_query(params)
    sort   = params.get('sort', '-createdAt')
    page   = max(1, int(params.get('page', 1)))
    limit  = min(48, max(1, int(params.get('limit', 12))))
    skip   = (page - 1) * limit

    # Build sort list
    sort_field = sort.lstrip('-')
    sort_dir   = -1 if sort.startswith('-') else 1
    cursor = col.find(query).sort(sort_field, sort_dir).skip(skip).limit(limit)

    products = [serialize(p) for p in cursor]
    total    = col.count_documents(query)
    return {'products': products, 'total': total, 'page': page, 'limit': limit}


def get_by_id(product_id: str):
    try:
        p = get_collection().find_one({'_id': ObjectId(product_id)})
        return serialize(p) if p else None
    except Exception:
        return None


def get_related(product_id: str, limit: int = 4):
    p = get_collection().find_one({'_id': ObjectId(product_id)})
    if not p:
        return []
    cursor = get_collection().find({
        'category': p.get('category'),
        '_id':      {'$ne': ObjectId(product_id)}
    }).sort('rating', -1).limit(limit)
    return [serialize(r) for r in cursor]


def get_recommended(visited_ids: list, limit: int = 8):
    """Simple recommendation: same categories as visited products."""
    try:
        obj_ids = [ObjectId(i) for i in visited_ids[:10]]
    except Exception:
        return []
    visited = list(get_collection().find({'_id': {'$in': obj_ids}}))
    cats = list({p.get('category') for p in visited if p.get('category')})
    cursor = get_collection().find({
        'category': {'$in': cats},
        '_id':      {'$nin': obj_ids}
    }).sort('rating', -1).limit(limit)
    return [serialize(p) for p in cursor]



def _parse_list(val) -> list:
    """Accept JSON string or list."""
    if isinstance(val, list): return val
    if isinstance(val, str):
        import json
        try: return json.loads(val)
        except Exception: return [v.strip() for v in val.split(',') if v.strip()]
    return []


def _parse_specs(val) -> dict:
    if isinstance(val, dict): return val
    if isinstance(val, str):
        import json
        try: return json.loads(val)
        except: return {}
    return {}

def create_product(data: dict) -> dict:
    now = datetime.utcnow()
    price    = float(data.get('price', 0))
    orig     = float(data.get('originalPrice') or 0)
    doc = {
        'name':          data.get('name', ''),
        'brand':         data.get('brand', ''),
        'sku':           data.get('sku', ''),
        'category':      data.get('category', 'smartphones'),
        'description':   data.get('description', ''),
        'price':         price,
        'originalPrice': orig if orig > price else None,
        'discount':      orig > price,
        'specs':         data.get('specs', {}),
        'images':        data.get('images', []),
        'stock':         int(data.get('stock', 0)),
        'rating':        float(data.get('rating', 0)),
        'reviewCount':   int(data.get('reviewCount', 0)),
        'isNew':         data.get('isNew', True),
        'isTopRated':    data.get('isTopRated', False),
        'isKosher':      _to_bool(data.get('isKosher', data.get('is_kosher', data.get('kosher','yes'))), True),
        'isAccessory':   _to_bool(data.get('isAccessory', data.get('is_accessory', False)), False),
        'tags':          data.get('tags', []),
        'colors':        _parse_list(data.get('selectedColors', '[]')),
        'note':          data.get('note', ''),
        'specs':         _parse_specs(data.get('specs', '{}')),
        'sizes':         _parse_list(data.get('selectedSizes', '[]')),
        'createdAt':     now,
        'updatedAt':     now,
    }
    result = get_collection().insert_one(doc)
    doc['_id'] = result.inserted_id
    return serialize(doc)


def update_product(product_id: str, data: dict) -> dict:
    # Remove immutable fields MongoDB refuses to update
    for field in ('_id', 'id', 'createdAt'):
        data.pop(field, None)

    data['updatedAt'] = datetime.utcnow()
    # Recompute discount flag
    try:
        price = float(data.get('price', 0))
        orig  = float(data.get('originalPrice') or 0)
        if price and orig:
            data['discount'] = orig > price
    except (ValueError, TypeError):
        pass
    import json as _json

    # Parse all JSON-string fields
    for field in ('specs',):
        if field in data and isinstance(data[field], str):
            data[field] = _parse_specs(data[field])
    for field in ('colors', 'sizes', 'images'):
        if field in data and isinstance(data[field], str):
            try: data[field] = _json.loads(data[field])
            except: pass

    # Recompute discount
    try:
        price = float(data.get('price', 0) or 0)
        orig  = float(data.get('originalPrice', 0) or 0)
        if price and orig:
            data['discount'] = orig > price
    except (ValueError, TypeError):
        pass

    get_collection().update_one({'_id': ObjectId(product_id)}, {'$set': data})
    return get_by_id(product_id)


def add_images(product_id: str, urls: list):
    get_collection().update_one(
        {'_id': ObjectId(product_id)},
        {'$push': {'images': {'$each': urls}}, '$set': {'updatedAt': datetime.utcnow()}}
    )


def apply_promotion(target_type: str, target: str, discount_pct: float):
    """Apply a discount % to products matching target."""
    col = get_collection()
    if target_type == 'all':
        match = {}
    elif target_type == 'category':
        match = {'category': target}
    else:  # product
        try:
            match = {'_id': ObjectId(target)}
        except Exception:
            return 0

    products = list(col.find(match))
    count = 0
    for p in products:
        base  = p.get('originalPrice') or p['price']
        new_p = round(base * (1 - discount_pct / 100), 2)
        col.update_one({'_id': p['_id']}, {'$set': {
            'price':         new_p,
            'originalPrice': base,
            'discount':      True,
            'updatedAt':     datetime.utcnow(),
        }})
        count += 1
    return count


def delete_product(product_id: str):
    get_collection().delete_one({'_id': ObjectId(product_id)})


def serialize(p: dict) -> dict:
    if not p:
        return {}
    return {
        '_id':           str(p['_id']),
        'name':          p.get('name'),
        'brand':         p.get('brand'),
        'sku':           p.get('sku'),
        'category':      p.get('category'),
        'description':   p.get('description'),
        'price':         p.get('price'),
        'originalPrice': p.get('originalPrice'),
        'discount':      p.get('discount', False),
        'specs':         _parse_specs(p.get('specs', {})),
        'images':        p.get('images', []),
        'stock':         p.get('stock', 0),
        'rating':        p.get('rating', 0),
        'reviewCount':   p.get('reviewCount', 0),
        'isNew':         p.get('isNew', False),
        'isTopRated':    p.get('isTopRated', False),
        'tags':          p.get('tags', []),
        'colors':        p.get('colors', []),
        'note':          p.get('note', ''),
        'sizes':         p.get('sizes', []),
        'isKosher':      p.get('isKosher', p.get('is_kosher', True)),
        'isAccessory':   p.get('isAccessory', p.get('is_accessory', False)),
        'createdAt':     p['createdAt'].isoformat() if p.get('createdAt') else '',
        'updatedAt':     p['updatedAt'].isoformat() if p.get('updatedAt') else '',
    }