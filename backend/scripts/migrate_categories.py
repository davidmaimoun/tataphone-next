"""
python -m scripts.migrate_categories
Migrates English category names to Hebrew in existing products.
Also adds is_kosher/is_accessory boolean fields.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dotenv import load_dotenv
load_dotenv()

from app.db import init_db

CAT_MAP = {
    'smartphones': 'סמארטפונים',
    'cameras':     'מצלמות',
    'headphones':  'אוזניות',
    'watches':     'שעונים',
    'accessories': 'אביזרים',  # legacy — will be replaced by is_accessory
    'tablets':     'טאבלטים',
    'batteries':   'סוללות',
}

def run():
    db = init_db()
    products = list(db['products'].find())
    updated = 0
    for p in products:
        upd = {}
        # Migrate category
        cat = p.get('category', '')
        if cat in CAT_MAP:
            upd['category'] = CAT_MAP[cat]

        # Migrate kosher field
        if 'isKosher' not in p:
            kosher_val = p.get('kosher', 'yes')
            upd['isKosher'] = kosher_val != 'no'

        # Migrate isAccessory
        if 'isAccessory' not in p:
            upd['isAccessory'] = bool(p.get('isAccessory', False))

        if upd:
            db['products'].update_one({'_id': p['_id']}, {'$set': upd})
            updated += 1
            print(f"  Updated: {p.get('name','?')[:40]} → {upd}")

    print(f"\n✅ {updated}/{len(products)} produits mis à jour.")

    # Clean meta_categories - remove English entries, add Hebrew
    db['meta_categories'].delete_many({'name': {'$in': list(CAT_MAP.keys())}})
    print("Cleaned English categories from meta.")

    import datetime
    now = datetime.datetime.utcnow()
    for name in ['סמארטפונים','מצלמות','אוזניות','שעונים','טאבלטים','מטענים','סוללות','כיסויים','כבלים','מגני מסך']:
        db['meta_categories'].update_one(
            {'name': name},
            {'$setOnInsert': {'name': name, 'createdAt': now}},
            upsert=True
        )
    print("✅ meta_categories updated to Hebrew.")

if __name__ == '__main__':
    run()