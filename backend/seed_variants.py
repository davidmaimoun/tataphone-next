"""
seed_variants.py — Ajoute des produits À VARIANTES pour tester le système.
Usage :  python seed_variants.py
(N'efface rien — upsert par SKU, relançable)

⚠️ Ces produits sont VISIBLES sur le site. Préfère tester en LOCAL.
   Sur le serveur de prod, supprime-les après test (admin ou delete par SKU).
"""
from datetime import datetime, timedelta
from app.db import get_db, init_db

PHONE_IMG = [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
]

def details(desc):
    return [
        {'title': 'תיאור',  'body': desc},
        {'title': 'אחריות', 'body': 'אחריות יצרן ל-12 חודשים.'},
        {'title': 'משלוח',  'body': 'משלוח חינם מעל ₪500. אספקה 2-4 ימי עסקים.'},
        {'title': 'החזרות', 'body': 'ניתן להחזיר תוך 14 יום מקבלת המוצר.'},
    ]

NOW = datetime.utcnow()

def derive(doc):
    variants = doc.get('variants', [])
    if variants:
        prices = [v['price'] for v in variants if v.get('price')]
        doc['price'] = min(prices)
        cheapest = min(variants, key=lambda v: v.get('price', 0))
        doc['originalPrice'] = cheapest.get('originalPrice')
        doc['discount'] = any(v.get('originalPrice') for v in variants)
        doc['stock'] = sum(int(v.get('stock', 0)) for v in variants)
        doc['hasVariants'] = True
        doc['priceMin'] = min(prices)
        doc['priceMax'] = max(prices)
    else:
        doc['hasVariants'] = False
        doc['priceMin'] = doc.get('price', 0)
        doc['priceMax'] = doc.get('price', 0)
    return doc

PRODUCTS = [
    # ── Produit TEST à 5₪ pour tester un vrai paiement Grow à moindre risque ──
    derive({
        'name': 'Zol Zol iPhone (בדיקה)', 'brand': 'Test', 'sku': 'ZOL-ZOL-TEST',
        'category': 'בדיקה', 'description': 'מוצר בדיקה לתשלום — אל תמחק עד אחרי בדיקת הסליקה.',
        'details': details('מוצר בדיקה בלבד. מחיר סמלי לבדיקת תשלום Grow.'),
        'images': PHONE_IMG, 'rating': 5, 'reviewCount': 1,
        'isKosher': True, 'isNew': True, 'isTopRated': False,
        'note': 'מוצר בדיקה — מחיר 5 ₪ לבדיקת סליקה אמיתית.',
        'specs': {}, 'tags': ['test'],
        'options': [], 'variants': [],
        'price': 5, 'originalPrice': None,
        'colors': [], 'sizes': [], 'stock': 999, 'supplierPrice': 0,
        'createdAt': NOW, 'updatedAt': NOW,
    }),
    derive({
        'name': 'iPhone 15 Pro כשר', 'brand': 'Apple', 'sku': 'APL-15P-K',
        'category': 'סמארטפונים', 'description': 'iPhone 15 Pro בגרסה כשרה — בחר צבע ונפח אחסון.',
        'details': details('iPhone 15 Pro בגרסה כשרה, מאושר ע"י ועדת הרבנים.'),
        'images': PHONE_IMG, 'rating': 4.8, 'reviewCount': 142,
        'isKosher': True, 'isNew': True, 'isTopRated': True,
        'note': 'מכשיר מאושר ומותאם — ללא גישה לאינטרנט פתוח.',
        'specs': {'מסך': '6.1"', 'מעבד': 'A17 Pro', 'מצלמה': '48MP'},
        'tags': ['5g', 'flagship'],
        'options': [
            {'name': 'צבע',   'values': ['טיטניום', 'שחור', 'כסף']},
            {'name': 'אחסון', 'values': ['128GB', '256GB', '512GB']},
        ],
        'variants': [
            {'sku': 'APL15P-TIT-128', 'attributes': {'צבע': 'טיטניום', 'אחסון': '128GB'}, 'price': 4990, 'originalPrice': 5490, 'stock': 5,  'supplierPrice': 3900},
            {'sku': 'APL15P-TIT-256', 'attributes': {'צבע': 'טיטניום', 'אחסון': '256GB'}, 'price': 5490, 'originalPrice': None, 'stock': 3,  'supplierPrice': 4300},
            {'sku': 'APL15P-TIT-512', 'attributes': {'צבע': 'טיטניום', 'אחסון': '512GB'}, 'price': 6290, 'originalPrice': None, 'stock': 2,  'supplierPrice': 5000},
            {'sku': 'APL15P-BLK-128', 'attributes': {'צבע': 'שחור',    'אחסון': '128GB'}, 'price': 4990, 'originalPrice': 5490, 'stock': 4,  'supplierPrice': 3900},
            {'sku': 'APL15P-BLK-256', 'attributes': {'צבע': 'שחור',    'אחסון': '256GB'}, 'price': 5490, 'originalPrice': None, 'stock': 0,  'supplierPrice': 4300},
            {'sku': 'APL15P-BLK-512', 'attributes': {'צבע': 'שחור',    'אחסון': '512GB'}, 'price': 6290, 'originalPrice': None, 'stock': 1,  'supplierPrice': 5000},
            {'sku': 'APL15P-SLV-128', 'attributes': {'צבע': 'כסף',     'אחסון': '128GB'}, 'price': 4990, 'originalPrice': None, 'stock': 6,  'supplierPrice': 3900},
            {'sku': 'APL15P-SLV-256', 'attributes': {'צבע': 'כסף',     'אחסון': '256GB'}, 'price': 5490, 'originalPrice': None, 'stock': 2,  'supplierPrice': 4300},
            {'sku': 'APL15P-SLV-512', 'attributes': {'צבע': 'כסף',     'אחסון': '512GB'}, 'price': 6290, 'originalPrice': None, 'stock': 0,  'supplierPrice': 5000},
        ],
        'colors': [], 'sizes': [], 'supplierPrice': None,
        'createdAt': NOW - timedelta(days=1), 'updatedAt': NOW,
    }),
    derive({
        'name': 'אוזניות Galaxy Buds', 'brand': 'Samsung', 'sku': 'SAM-BUDS',
        'category': 'אוזניות', 'description': 'אוזניות אלחוטיות — בחר צבע.',
        'details': details('אוזניות אלחוטיות עם ביטול רעשים.'),
        'images': ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
        'rating': 4.5, 'reviewCount': 88, 'isKosher': True, 'isNew': False,
        'specs': {'ANC': 'כן', 'סוללה': '6 שעות'}, 'tags': ['audio'],
        'options': [{'name': 'צבע', 'values': ['לבן', 'שחור', 'סגול']}],
        'variants': [
            {'sku': 'BUDS-WHT', 'attributes': {'צבע': 'לבן'},  'price': 450, 'originalPrice': None, 'stock': 10, 'supplierPrice': 300},
            {'sku': 'BUDS-BLK', 'attributes': {'צבע': 'שחור'}, 'price': 450, 'originalPrice': None, 'stock': 8,  'supplierPrice': 300},
            {'sku': 'BUDS-PUR', 'attributes': {'צבע': 'סגול'}, 'price': 480, 'originalPrice': 520,  'stock': 3,  'supplierPrice': 320},
        ],
        'colors': [], 'sizes': [], 'supplierPrice': None,
        'createdAt': NOW - timedelta(days=2), 'updatedAt': NOW,
    }),
]


def run():
    init_db()
    db = get_db()
    col = db['products']
    for p in PRODUCTS:
        col.update_one({'sku': p['sku']}, {'$set': p}, upsert=True)
    print(f"[SEED] {len(PRODUCTS)} produits ajoutés/mis à jour ✓")
    for p in PRODUCTS:
        nv = len(p.get('variants', []))
        print(f"  - {p['name']} : {nv} variantes, prix {p['priceMin']}–{p['priceMax']}")


# Pour SUPPRIMER les produits test après coup :  python seed_variants.py --clean
def clean():
    init_db()
    db = get_db()
    skus = [p['sku'] for p in PRODUCTS]
    res = db['products'].delete_many({'sku': {'$in': skus}})
    print(f"[CLEAN] {res.deleted_count} produits test supprimés ✓")


if __name__ == '__main__':
    import sys
    if '--clean' in sys.argv:
        clean()
    else:
        run()