"""
seed.py — Catalogue de démo Tataphone (~20 produits) avec `details` (tabs) + photos Unsplash.
Usage :  python seed.py            (ajoute sans vider)
         python seed.py --wipe     (vide la collection products avant)

⚠️ Photos Unsplash = visuels GÉNÉRIQUES par catégorie (démo/test).
   En prod, remplace par tes vraies photos produit via l'admin.
"""
import sys
from datetime import datetime, timedelta
from app.db import get_db, init_db

# ── Photos Unsplash stables par catégorie (URLs directes images.unsplash.com) ──
PHOTOS = {
    'סמארטפונים': [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
    ],
    'שעונים': [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    ],
    'אוזניות': [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    ],
    'מצלמות': [
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    ],
    'אביזרים': [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80',
    ],
    'טאבלטים': [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80',
    ],
}
def photos_for(category):
    return PHOTOS.get(category, ['https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80'])


def details(desc, warranty='אחריות יצרן ל-12 חודשים. כולל תיקון או החלפה לפי שיקול היצרן.'):
    return [
        {'title': 'תיאור',  'body': desc},
        {'title': 'אחריות', 'body': warranty},
        {'title': 'משלוח',  'body': 'משלוח חינם בהזמנה מעל ₪500. זמן אספקה: 2-4 ימי עסקים. משלוח אקספרס זמין לחלק מהאזורים.'},
        {'title': 'החזרות', 'body': 'ניתן להחזיר תוך 14 יום מקבלת המוצר, בתנאי שהאריזה לא נפתחה. דמי ביטול: 5% או ₪100, הנמוך מביניהם.'},
    ]

NOW = datetime.utcnow()

PRODUCTS = [
    {'name':'iPhone 15 Pro כשר','brand':'Apple','category':'סמארטפונים','price':4990,'originalPrice':5490,'supplierPrice':3900,
     'sku':'APL-15P-K','stock':12,'rating':4.8,'reviewCount':142,'isKosher':True,'isNew':True,'isTopRated':True,
     'tags':['5g','flagship'],'colors':['שחור','טיטניום','כסף'],'sizes':['128GB','256GB','512GB'],
     'specs':{'מסך':'6.1"','מעבד':'A17 Pro','סוללה':'3274mAh','מצלמה':'48MP'},
     'note':'מכשיר מאושר ומותאם — ללא גישה לאינטרנט פתוח.',
     'details':details('iPhone 15 Pro בגרסה כשרה, מאושר ע"י ועדת הרבנים. כל הפיצ׳רים המתקדמים ללא תוכן לא ראוי.')},
    {'name':'Samsung Galaxy S24 כשר','brand':'Samsung','category':'סמארטפונים','price':3790,'originalPrice':4200,'supplierPrice':2950,
     'sku':'SAM-S24-K','stock':18,'rating':4.6,'reviewCount':98,'isKosher':True,'isNew':True,
     'tags':['5g','android'],'colors':['שחור','סגול','כסף'],'sizes':['128GB','256GB'],
     'specs':{'מסך':'6.2"','מעבד':'Snapdragon 8 Gen 3','סוללה':'4000mAh'},
     'details':details('Galaxy S24 בגרסה כשרה עם מסך Dynamic AMOLED מרהיב.')},
    {'name':'Xiaomi Redmi Note 13 כשר','brand':'Xiaomi','category':'סמארטפונים','price':990,'originalPrice':1190,'supplierPrice':720,
     'sku':'XIA-RN13-K','stock':30,'rating':4.4,'reviewCount':210,'isKosher':True,
     'tags':['budget'],'colors':['שחור','כחול'],'sizes':['128GB','256GB'],
     'specs':{'מסך':'6.67"','סוללה':'5000mAh'},
     'details':details('מכשיר משתלם בגרסה כשרה — סוללה ענקית וביצועים מצוינים למחיר.')},
    {'name':'Nokia 2660 Flip כשר','brand':'Nokia','category':'סמארטפונים','price':320,'supplierPrice':210,
     'sku':'NOK-2660-K','stock':45,'rating':4.7,'reviewCount':320,'isKosher':True,'isTopRated':True,
     'tags':['kosher-phone','basic'],'colors':['שחור','אדום'],
     'specs':{'סוג':'מקשים','סוללה':'1450mAh'},
     'details':details('טלפון כשר קלאסי עם מקשים — שיחות ו-SMS בלבד. אידיאלי לשמירה על קדושת העיניים.')},
    {'name':'Apple Watch Series 9 כשר','brand':'Apple','category':'שעונים','price':1890,'originalPrice':2100,'supplierPrice':1500,
     'sku':'APL-W9-K','stock':9,'rating':4.5,'reviewCount':67,'isKosher':True,'isNew':True,
     'tags':['wearable'],'colors':['שחור','כסף','זהב'],'sizes':['41mm','45mm'],
     'specs':{'מסך':'Retina','עמידות':'מים 50m'},
     'details':details('שעון חכם בגרסה כשרה — בריאות, כושר והתראות, ללא תוכן לא ראוי.')},
    {'name':'Garmin Venu 3','brand':'Garmin','category':'שעונים','price':1650,'supplierPrice':1250,
     'sku':'GRM-V3','stock':14,'rating':4.6,'reviewCount':54,'isKosher':True,
     'tags':['sport','wearable'],'colors':['שחור','אפור'],
     'specs':{'סוללה':'14 ימים','GPS':'כן'},
     'details':details('שעון ספורט מתקדם עם מעקב בריאות מקיף וסוללה ל-14 יום.')},
    {'name':'AirPods Pro 2','brand':'Apple','category':'אוזניות','price':890,'originalPrice':990,'supplierPrice':650,
     'sku':'APL-APP2','stock':40,'rating':4.7,'reviewCount':189,'isKosher':True,'isTopRated':True,
     'tags':['audio','wireless'],'colors':['לבן'],
     'specs':{'ANC':'כן','סוללה':'6 שעות'},
     'details':details('אוזניות אלחוטיות עם ביטול רעשים אקטיבי ואיכות שמע יוצאת דופן.')},
    {'name':'Sony WH-1000XM5','brand':'Sony','category':'אוזניות','price':1290,'originalPrice':1490,'supplierPrice':980,
     'sku':'SNY-XM5','stock':16,'rating':4.8,'reviewCount':276,'isKosher':True,
     'tags':['audio','over-ear'],'colors':['שחור','כסף'],
     'specs':{'ANC':'כן','סוללה':'30 שעות'},
     'details':details('אוזניות Over-Ear מובילות בעולם לביטול רעשים. נוחות יוצאת דופן.')},
    {'name':'JBL Tune 510BT','brand':'JBL','category':'אוזניות','price':180,'supplierPrice':110,
     'sku':'JBL-510','stock':60,'rating':4.3,'reviewCount':410,'isKosher':True,
     'tags':['audio','budget'],'colors':['שחור','כחול','ורוד'],
     'specs':{'סוללה':'40 שעות'},
     'details':details('אוזניות אלחוטיות משתלמות עם סאונד JBL Pure Bass וסוללה ל-40 שעות.')},
    {'name':'Canon EOS R50','brand':'Canon','category':'מצלמות','price':3200,'originalPrice':3600,'supplierPrice':2600,
     'sku':'CAN-R50','stock':7,'rating':4.6,'reviewCount':43,'isKosher':True,'isNew':True,
     'tags':['camera','mirrorless'],'colors':['שחור'],
     'specs':{'חיישן':'24.2MP','וידאו':'4K'},
     'details':details('מצלמה ללא מראה לצילום מקצועי — מושלמת לאירועים ויצירת תוכן.')},
    {'name':'GoPro Hero 12','brand':'GoPro','category':'מצלמות','price':1790,'supplierPrice':1400,
     'sku':'GP-H12','stock':11,'rating':4.5,'reviewCount':88,'isKosher':True,
     'tags':['camera','action'],'colors':['שחור'],
     'specs':{'וידאו':'5.3K','עמידות':'מים 10m'},
     'details':details('מצלמת אקשן עמידה למים לתיעוד הרפתקאות באיכות 5.3K.')},
    {'name':'מטען מהיר USB-C 30W','brand':'Anker','category':'אביזרים','price':89,'supplierPrice':45,
     'sku':'ANK-30W','stock':120,'rating':4.6,'reviewCount':520,'isKosher':True,'isAccessory':True,
     'tags':['charger','usb-c'],'colors':['לבן','שחור'],
     'specs':{'הספק':'30W'},
     'details':details('מטען קומפקטי וחזק לטעינה מהירה של כל המכשירים.')},
    {'name':'כבל USB-C ל-USB-C 2m','brand':'Anker','category':'אביזרים','price':45,'supplierPrice':22,
     'sku':'ANK-CBL2','stock':200,'rating':4.5,'reviewCount':340,'isKosher':True,'isAccessory':True,
     'tags':['cable','usb-c'],'colors':['שחור','לבן'],
     'details':details('כבל טעינה והעברת נתונים עמיד באורך 2 מטר.')},
    {'name':'מגן מסך זכוכית iPhone','brand':'Belkin','category':'אביזרים','price':59,'supplierPrice':25,
     'sku':'BLK-SP15','stock':150,'rating':4.4,'reviewCount':280,'isKosher':True,'isAccessory':True,
     'tags':['protection'],
     'details':details('מגן מסך זכוכית מחוסמת 9H להגנה מקסימלית מפני שריטות ושברים.')},
    {'name':'פאוורבנק 20000mAh','brand':'Anker','category':'אביזרים','price':159,'originalPrice':199,'supplierPrice':95,
     'sku':'ANK-PB20','stock':80,'rating':4.7,'reviewCount':610,'isKosher':True,'isAccessory':True,
     'tags':['powerbank'],'colors':['שחור','כחול'],
     'specs':{'קיבולת':'20000mAh','יציאות':'2x USB'},
     'details':details('סוללת גיבוי בקיבולת גבוהה לטעינת הטלפון מספר פעמים בדרכים.')},
    {'name':'כיסוי סיליקון iPhone 15','brand':'Apple','category':'אביזרים','price':129,'supplierPrice':70,
     'sku':'APL-CASE15','stock':95,'rating':4.5,'reviewCount':175,'isKosher':True,'isAccessory':True,
     'tags':['case'],'colors':['שחור','ורוד','כחול','ירוק'],
     'details':details('כיסוי סיליקון מקורי עם מגע רך והגנה מושלמת.')},
    {'name':'מחזיק לרכב מגנטי','brand':'iOttie','category':'אביזרים','price':79,'supplierPrice':38,
     'sku':'IOT-CAR','stock':70,'rating':4.3,'reviewCount':145,'isKosher':True,'isAccessory':True,
     'tags':['car'],
     'details':details('מחזיק טלפון מגנטי לרכב — חזק, יציב והתקנה קלה.')},
    {'name':'iPad 10.9 כשר','brand':'Apple','category':'טאבלטים','price':2290,'originalPrice':2590,'supplierPrice':1850,
     'sku':'APL-IPAD109-K','stock':10,'rating':4.6,'reviewCount':72,'isKosher':True,'isNew':True,
     'tags':['tablet'],'colors':['כסף','כחול','ורוד'],'sizes':['64GB','256GB'],
     'specs':{'מסך':'10.9"','מעבד':'A14'},
     'details':details('טאבלט בגרסה כשרה — מושלם ללימוד ועבודה, ללא תוכן לא ראוי.')},
    {'name':'Samsung Galaxy Tab A9','brand':'Samsung','category':'טאבלטים','price':890,'supplierPrice':650,
     'sku':'SAM-TABA9','stock':22,'rating':4.3,'reviewCount':58,'isKosher':True,
     'tags':['tablet','budget'],'colors':['אפור','כסף'],'sizes':['64GB','128GB'],
     'specs':{'מסך':'8.7"'},
     'details':details('טאבלט קומפקטי ומשתלם לגלישה, קריאה וצפייה בתוכן כשר.')},
    {'name':'Lenovo Tab M11','brand':'Lenovo','category':'טאבלטים','price':1150,'supplierPrice':820,
     'sku':'LEN-M11','stock':15,'rating':4.4,'reviewCount':40,'isKosher':True,
     'tags':['tablet'],'colors':['אפור'],'sizes':['128GB'],
     'specs':{'מסך':'11"','סוללה':'7040mAh'},
     'details':details('טאבלט 11 אינץ׳ עם מסך גדול וסוללה חזקה לכל המשפחה.')},
]


def run(wipe=False):
    init_db()
    db = get_db()
    col = db['products']
    if wipe:
        deleted = col.delete_many({}).deleted_count
        print(f"[SEED] {deleted} produits supprimés")

    inserted = 0
    for i, p in enumerate(PRODUCTS):
        price = float(p.get('price', 0))
        orig  = float(p.get('originalPrice') or 0)
        imgs  = photos_for(p.get('category'))
        doc = {
            'name': p['name'], 'brand': p.get('brand',''), 'sku': p.get('sku',''),
            'category': p.get('category','smartphones'),
            'description': p.get('details',[{}])[0].get('body','') if p.get('details') else '',
            'details': p.get('details', []),
            'price': price,
            'originalPrice': orig if orig > price else None,
            'discount': orig > price,
            'images': imgs,                       # ← photos Unsplash par catégorie
            'stock': int(p.get('stock', 0)),
            'rating': float(p.get('rating', 0)),
            'reviewCount': int(p.get('reviewCount', 0)),
            'isNew': p.get('isNew', False),
            'isTopRated': p.get('isTopRated', False),
            'isKosher': p.get('isKosher', True),
            'isAccessory': p.get('isAccessory', False),
            'tags': p.get('tags', []),
            'colors': p.get('colors', []),
            'sizes': p.get('sizes', []),
            'specs': p.get('specs', {}),
            'note': p.get('note', ''),
            'supplierPrice': p.get('supplierPrice'),
            'createdAt': NOW - timedelta(days=len(PRODUCTS)-i),
            'updatedAt': NOW,
        }
        col.insert_one(doc)
        inserted += 1

    print(f"[SEED] {inserted} produits insérés ✓ (avec photos Unsplash)")
    for p in PRODUCTS:
        for colname, val in [('meta_categories', p.get('category')), ('meta_brands', p.get('brand'))]:
            if val:
                db[colname].update_one({'name': val}, {'$setOnInsert': {'name': val, 'createdAt': NOW}}, upsert=True)
    print("[SEED] meta catégories/marques synchronisées ✓")


if __name__ == '__main__':
    run(wipe='--wipe' in sys.argv)