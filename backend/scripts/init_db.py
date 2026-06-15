"""
python -m scripts.init_db
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dotenv import load_dotenv
load_dotenv()

from app.db import init_db
from app.models import user    as UserModel
from app.models import product as ProductModel
from app.models import order   as OrderModel

# ── Demo products ─────────────────────────────────────────────────────────────
# Categories in Hebrew. No 'accessories' category.
# is_accessory=True  → appears in "ברגע האחרון" section
# is_kosher=True/False → shows ✡ badge on product card

DEMO_PRODUCTS = [
  # ── סמארטפונים ───────────────────────────────────────────────────────────────
  {
    'name': 'iPhone 15 Pro Max 256GB', 'brand': 'Apple',
    'category': 'סמארטפונים', 'sku': 'APL-15PM-256',
    'price': 4990, 'originalPrice': None, 'stock': 12,
    'rating': 4.9, 'reviewCount': 187, 'isNew': True, 'isTopRated': True,
    'isKosher': True, 'isAccessory': False,
    'description': 'סמארטפון פרימיום עם מצלמה מקצועית, מעבד A17 Pro ועיצוב טיטניום. מאושר לשימוש כשר.',
    'specs': {'מסך': '6.7 אינץ OLED', 'מעבד': 'A17 Pro', 'סוללה': '4422 mAh', 'אחסון': '256GB'},
    'images': ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop'],
  },
  {
    'name': 'Samsung Galaxy S24 Ultra', 'brand': 'Samsung',
    'category': 'סמארטפונים', 'sku': 'SAM-S24U',
    'price': 3990, 'originalPrice': 4490, 'stock': 8,
    'rating': 4.8, 'reviewCount': 134, 'isNew': True, 'isTopRated': True,
    'isKosher': True, 'isAccessory': False,
    'description': 'Galaxy S24 Ultra עם עט S-Pen, מצלמה 200MP ומסך Dynamic AMOLED.',
    'specs': {'מסך': '6.8 אינץ', 'מעבד': 'Snapdragon 8 Gen 3', 'מצלמה': '200MP'},
    'images': ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop'],
  },
  {
    'name': 'iPhone 14 128GB', 'brand': 'Apple',
    'category': 'סמארטפונים', 'sku': 'APL-14-128',
    'price': 2990, 'originalPrice': 3490, 'stock': 20,
    'rating': 4.7, 'reviewCount': 312, 'isNew': False, 'isTopRated': True,
    'isKosher': True, 'isAccessory': False,
    'description': 'iPhone 14 עם מצלמה כפולה, Crash Detection ו-Emergency SOS.',
    'specs': {'מסך': '6.1 אינץ Super Retina XDR', 'מעבד': 'A15 Bionic'},
    'images': ['https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600&h=600&fit=crop'],
  },
  {
    'name': 'Samsung Galaxy A55 5G', 'brand': 'Samsung',
    'category': 'סמארטפונים', 'sku': 'SAM-A55-5G',
    'price': 1490, 'originalPrice': 1790, 'stock': 35,
    'rating': 4.5, 'reviewCount': 89, 'isNew': True, 'isTopRated': False,
    'isKosher': True, 'isAccessory': False,
    'description': 'גלקסי A55 עם עיצוב פרימיום, מסך AMOLED ומצלמה 50MP.',
    'specs': {'מסך': '6.6 אינץ AMOLED', 'מצלמה': '50MP'},
    'images': ['https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&h=600&fit=crop'],
  },
  {
    'name': 'Motorola Edge 40 Pro', 'brand': 'Motorola',
    'category': 'סמארטפונים', 'sku': 'MOT-EDGE40P',
    'price': 1890, 'originalPrice': None, 'stock': 15,
    'rating': 4.4, 'reviewCount': 56, 'isNew': False, 'isTopRated': False,
    'isKosher': False, 'isAccessory': False,
    'description': 'מכשיר מהיר עם Snapdragon 8 Gen 2, 125W טעינה מהירה ומסך 165Hz.',
    'specs': {'מסך': '6.67 אינץ 165Hz', 'טעינה': '125W'},
    'images': ['https://images.unsplash.com/photo-1570891836654-d4990f7c78a7?w=600&h=600&fit=crop'],
  },
  # ── מצלמות ───────────────────────────────────────────────────────────────────
  {
    'name': 'Canon EOS R50 ערכה מלאה', 'brand': 'Canon',
    'category': 'מצלמות', 'sku': 'CAN-R50-KIT',
    'price': 2290, 'originalPrice': 2790, 'stock': 6,
    'rating': 4.8, 'reviewCount': 43, 'isNew': False, 'isTopRated': True,
    'isKosher': True, 'isAccessory': False,
    'description': 'מצלמה mirrorless קומפקטית מושלמת למתחילים ומתקדמים.',
    'specs': {'חיישן': 'APS-C 24.2MP', 'וידאו': '4K 30fps'},
    'images': ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop'],
  },
  {
    'name': 'Sony Alpha A6700 Mirrorless', 'brand': 'Sony',
    'category': 'מצלמות', 'sku': 'SNY-A6700',
    'price': 4490, 'originalPrice': None, 'stock': 4,
    'rating': 4.9, 'reviewCount': 28, 'isNew': True, 'isTopRated': True,
    'isKosher': False, 'isAccessory': False,
    'description': 'מצלמה mirrorless מתקדמת עם AI autofocus וחיישן 26MP APS-C.',
    'specs': {'חיישן': 'APS-C 26MP', 'וידאו': '4K 120fps'},
    'images': ['https://images.unsplash.com/photo-1606986628253-5c14c5e3a20a?w=600&h=600&fit=crop'],
  },
  {
    'name': 'GoPro HERO12 Black', 'brand': 'GoPro',
    'category': 'מצלמות', 'sku': 'GPR-H12B',
    'price': 1490, 'originalPrice': 1790, 'stock': 18,
    'rating': 4.7, 'reviewCount': 96, 'isNew': False, 'isTopRated': False,
    'isKosher': False, 'isAccessory': False,
    'description': 'מצלמת אקשן עמידה למים, 5.3K60 וHyperSmooth 6.0.',
    'specs': {'וידאו': '5.3K 60fps', 'עמידות': 'עד 10 מטר'},
    'images': ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=600&fit=crop'],
  },
  # ── אוזניות ──────────────────────────────────────────────────────────────────
  {
    'name': 'Sony WH-1000XM5', 'brand': 'Sony',
    'category': 'אוזניות', 'sku': 'SNY-XM5',
    'price': 1190, 'originalPrice': 1490, 'stock': 25,
    'rating': 5.0, 'reviewCount': 287, 'isNew': False, 'isTopRated': True,
    'isKosher': True, 'isAccessory': False,
    'description': 'אוזניות אלחוטיות פרימיום עם ביטול רעשים ה-1 בעולם.',
    'specs': {'סוללה': '30 שעות', 'חיבור': 'Bluetooth 5.2'},
    'images': ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop'],
  },
  {
    'name': 'Apple AirPods Pro 2', 'brand': 'Apple',
    'category': 'אוזניות', 'sku': 'APL-APPRO2',
    'price': 990, 'originalPrice': None, 'stock': 40,
    'rating': 4.9, 'reviewCount': 445, 'isNew': False, 'isTopRated': True,
    'isKosher': True, 'isAccessory': False,
    'description': 'אוזניות in-ear עם ANC מתקדם, Adaptive Audio ו-USB-C.',
    'specs': {'סוללה': '30 שעות עם קייס', 'עמידות': 'IP54'},
    'images': ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop'],
  },
  {
    'name': 'Bose QuietComfort 45', 'brand': 'Bose',
    'category': 'אוזניות', 'sku': 'BSE-QC45',
    'price': 1090, 'originalPrice': 1390, 'stock': 14,
    'rating': 4.7, 'reviewCount': 178, 'isNew': False, 'isTopRated': False,
    'isKosher': False, 'isAccessory': False,
    'description': 'אוזניות Bose הקלאסיות עם ANC ונוחות ללא פשרות.',
    'specs': {'סוללה': '24 שעות', 'חיבור': 'Bluetooth 5.1'},
    'images': ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&fit=crop'],
  },
  {
    'name': 'JBL Tune 770NC', 'brand': 'JBL',
    'category': 'אוזניות', 'sku': 'JBL-T770NC',
    'price': 390, 'originalPrice': 490, 'stock': 30,
    'rating': 4.4, 'reviewCount': 92, 'isNew': True, 'isTopRated': False,
    'isKosher': True, 'isAccessory': False,
    'description': 'אוזניות JBL במחיר נגיש עם ביטול רעשים.',
    'specs': {'סוללה': '44 שעות', 'טעינה': 'USB-C'},
    'images': ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop'],
  },
  # ── שעונים ───────────────────────────────────────────────────────────────────
  {
    'name': 'Apple Watch Series 9', 'brand': 'Apple',
    'category': 'שעונים', 'sku': 'APL-WS9',
    'price': 1590, 'originalPrice': None, 'stock': 22,
    'rating': 4.8, 'reviewCount': 203, 'isNew': True, 'isTopRated': True,
    'isKosher': True, 'isAccessory': False,
    'description': 'שעון חכם עם Double Tap, מסך Retina ובריאות מתקדמת.',
    'specs': {'מסך': 'Always-On Retina', 'עמידות': 'WR50'},
    'images': ['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=600&fit=crop'],
  },
  {
    'name': 'Samsung Galaxy Watch 6 Classic', 'brand': 'Samsung',
    'category': 'שעונים', 'sku': 'SAM-GW6C',
    'price': 1190, 'originalPrice': 1390, 'stock': 16,
    'rating': 4.6, 'reviewCount': 87, 'isNew': False, 'isTopRated': False,
    'isKosher': True, 'isAccessory': False,
    'description': 'שעון חכם פרמיום עם לוח מסתובב קלאסי.',
    'specs': {'מסך': 'Super AMOLED 1.47"', 'עמידות': '5ATM+IP68'},
    'images': ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop'],
  },
  # ── לא כשר (לבדיקת הפילטר) ─────────────────────────────────────────────────
  {
    'name': 'OnePlus 12 — לא כשר', 'brand': 'OnePlus',
    'category': 'סמארטפונים', 'sku': 'OP-12-256',
    'price': 2490, 'originalPrice': None, 'stock': 10,
    'rating': 4.5, 'reviewCount': 44, 'isNew': True, 'isTopRated': False,
    'isKosher': False, 'isAccessory': False,
    'description': 'OnePlus 12 עם Snapdragon 8 Gen 3, 100W טעינה ומסך 120Hz.',
    'specs': {'מסך': '6.82 אינץ 120Hz', 'טעינה': '100W', 'סוללה': '5400 mAh'},
    'images': ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=600&fit=crop'],
  },
  {
    'name': 'Xiaomi 14 Pro — לא כשר', 'brand': 'Xiaomi',
    'category': 'סמארטפונים', 'sku': 'XIA-14PRO',
    'price': 2990, 'originalPrice': 3490, 'stock': 7,
    'rating': 4.6, 'reviewCount': 61, 'isNew': True, 'isTopRated': False,
    'isKosher': False, 'isAccessory': False,
    'description': 'Xiaomi 14 Pro עם מצלמת Leica, Snapdragon 8 Gen 3.',
    'specs': {'מסך': '6.73 אינץ AMOLED', 'מצלמה': 'Leica 50MP', 'סוללה': '4880 mAh'},
    'images': ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop'],
  },
  # ── אביזרים (is_accessory=True) ──────────────────────────────────────────────
  {
    'name': 'Anker GaN 65W מטען מהיר', 'brand': 'Anker',
    'category': 'מטענים', 'sku': 'ANK-GAN65',
    'price': 189, 'originalPrice': 249, 'stock': 80,
    'rating': 4.9, 'reviewCount': 512, 'isNew': False, 'isTopRated': True,
    'isKosher': True, 'isAccessory': True,
    'description': 'מטען GaN קומפקטי 65W עם 3 יציאות.',
    'specs': {'הספק': '65W', 'יציאות': '2×USB-C + USB-A'},
    'images': ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop'],
  },
  {
    'name': 'Belkin MagSafe Wireless Charger', 'brand': 'Belkin',
    'category': 'מטענים', 'sku': 'BLK-MGSF',
    'price': 149, 'originalPrice': None, 'stock': 45,
    'rating': 4.6, 'reviewCount': 134, 'isNew': True, 'isTopRated': False,
    'isKosher': True, 'isAccessory': True,
    'description': 'מטען אלחוטי MagSafe תואם iPhone 15/14/13 עד 15W.',
    'specs': {'הספק': '15W', 'חיבור': 'USB-C'},
    'images': ['https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&h=600&fit=crop'],
  },
  {
    'name': 'Spigen Ultra Hybrid Case iPhone 15', 'brand': 'Spigen',
    'category': 'כיסויים', 'sku': 'SPG-UH-IP15',
    'price': 79, 'originalPrice': 99, 'stock': 120,
    'rating': 4.7, 'reviewCount': 289, 'isNew': False, 'isTopRated': False,
    'isKosher': True, 'isAccessory': True,
    'description': 'כיסוי שקוף פרמיום לאייפון 15 עם הגנה מקצועית.',
    'specs': {'תאימות': 'iPhone 15 Pro Max', 'MagSafe': 'תואם'},
    'images': ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=600&fit=crop'],
  },
  {
    'name': 'מגן מסך זכוכית iPhone 15', 'brand': 'Spigen',
    'category': 'מגני מסך', 'sku': 'SPG-SCRN-IP15',
    'price': 29, 'originalPrice': 49, 'stock': 200,
    'rating': 4.6, 'reviewCount': 187, 'isNew': False, 'isTopRated': False,
    'isKosher': True, 'isAccessory': True,
    'description': 'מגן מסך זכוכית מחוסמת 9H לאייפון 15.',
    'specs': {'קשיות': '9H', 'תאימות': 'iPhone 15 / 15 Pro'},
    'images': ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=600&fit=crop'],
  },
  {
    'name': 'כבל USB-C לברק 1 מטר', 'brand': 'Anker',
    'category': 'כבלים', 'sku': 'ANK-USBC-L1',
    'price': 39, 'originalPrice': None, 'stock': 300,
    'rating': 4.8, 'reviewCount': 412, 'isNew': False, 'isTopRated': False,
    'isKosher': True, 'isAccessory': True,
    'description': 'כבל USB-C ל-Lightning מהיר ועמיד לאייפון.',
    'specs': {'אורך': '1 מטר', 'תמיכה': 'טעינה מהירה'},
    'images': ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop'],
  },
  {
    'name': 'כיסוי סיליקון Samsung S24', 'brand': 'Samsung',
    'category': 'כיסויים', 'sku': 'SAM-SIL-S24',
    'price': 59, 'originalPrice': 89, 'stock': 150,
    'rating': 4.5, 'reviewCount': 93, 'isNew': True, 'isTopRated': False,
    'isKosher': True, 'isAccessory': True,
    'description': 'כיסוי סיליקון רשמי ל-Galaxy S24.',
    'specs': {'חומר': 'סיליקון', 'תאימות': 'Galaxy S24'},
    'images': ['https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&h=600&fit=crop'],
  },
  {
    'name': 'אוזניות תיל USB-C', 'brand': 'JBL',
    'category': 'אוזניות', 'sku': 'JBL-WIRE-C',
    'price': 79, 'originalPrice': 99, 'stock': 80,
    'rating': 4.3, 'reviewCount': 67, 'isNew': False, 'isTopRated': False,
    'isKosher': True, 'isAccessory': True,
    'description': 'אוזניות תיל עם USB-C ומיקרופון מובנה.',
    'specs': {'חיבור': 'USB-C'},
    'images': ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop'],
  },
  {
    'name': 'סוללה ניידת 10000mAh', 'brand': 'Anker',
    'category': 'סוללות', 'sku': 'ANK-PB10K',
    'price': 119, 'originalPrice': 149, 'stock': 60,
    'rating': 4.7, 'reviewCount': 234, 'isNew': False, 'isTopRated': True,
    'isKosher': True, 'isAccessory': True,
    'description': 'Power bank קומפקטי 10000mAh עם 2 יציאות.',
    'specs': {'קיבולת': '10000mAh', 'הספק': '20W'},
    'images': ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop'],
  },
  {
    'name': 'Anker PowerCore 26800', 'brand': 'Anker',
    'category': 'סוללות', 'sku': 'ANK-PB26K',
    'price': 189, 'originalPrice': 249, 'stock': 40,
    'rating': 4.9, 'reviewCount': 321, 'isNew': False, 'isTopRated': True,
    'isKosher': True, 'isAccessory': True,
    'description': 'Power bank ענק 26800mAh — טעינה מלאה לשלושה מכשירים.',
    'specs': {'קיבולת': '26800mAh', 'הספק': '30W'},
    'images': ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop'],
  },
]


def run():
  db = init_db()
  print('[init] Creating indexes...')
  ProductModel.create_indexes()
  OrderModel.create_indexes()

  # ── Admins ────────────────────────────────────────────────────────────────────
  for a in [
    {'name':'Sacha', 'email':'sebagsacha@gmail.com',    'password':'Admin123!'},
    {'name':'David', 'email':'davidmaimoun55@gmail.com', 'password':'Admin123!'},
  ]:
    existing = UserModel.find_by_email(a['email'])
    if not existing:
      UserModel.create_user({**a, 'role':'admin', 'verified':True})
      print(f"[init] Admin créé → {a['email']}")
    else:
      db['users'].update_one({'_id':existing['_id']}, {'$set':{'role':'admin','verified':True}})
      print(f"[init] Admin existant → {a['email']}")

  # ── Products ──────────────────────────────────────────────────────────────────
  existing = db['products'].count_documents({})
  if existing == 0:
    for p in DEMO_PRODUCTS:
      ProductModel.create_product(p)
    print(f'[init] ✓ {len(DEMO_PRODUCTS)} produits seedés.')
  else:
    print(f'[init] {existing} produits déjà présents — skip.')

  # ── Meta collections ──────────────────────────────────────────────────────────
  import datetime
  now = datetime.datetime.utcnow()
  seeds = {
    'meta_categories': [
      'סמארטפונים','מצלמות','אוזניות','שעונים',
      'טאבלטים','מטענים','סוללות','כיסויים','כבלים','מגני מסך'
    ],
    'meta_brands': [
      'Apple','Samsung','Sony','Bose','JBL','Anker',
      'Belkin','Spigen','Canon','GoPro','Motorola'
    ],
    'meta_colors': [
      'שחור','לבן','כסף','אפור','זהב','ורוד',
      'אדום','כחול','ירוק','סגול','כתום','טיטניום','שמפניה'
    ],
    'meta_sizes': ['XS','S','M','L','XL','XXL','64GB','128GB','256GB','512GB'],
  }
  for col, names in seeds.items():
    for name in names:
      db[col].update_one(
        {'name': name},
        {'$setOnInsert': {'name': name, 'createdAt': now}},
        upsert=True
      )
  print('[init] ✓ Meta collections seedées.')
  print('[init] ✅ Terminé!')


def reset_and_reseed():
  """Drop all products and re-seed from scratch."""
  db = init_db()
  deleted = db['products'].delete_many({})
  print(f'[reset] {deleted.deleted_count} produits supprimés.')
  for p in DEMO_PRODUCTS:
    ProductModel.create_product(p)
  print(f'[reset] ✓ {len(DEMO_PRODUCTS)} produits re-seedés.')
  # Clean and re-seed meta
  for col in ['meta_categories','meta_brands','meta_colors','meta_sizes']:
    db[col].delete_many({})
  import datetime
  now = datetime.datetime.utcnow()
  seeds = {
    'meta_categories': ['סמארטפונים','מצלמות','אוזניות','שעונים','טאבלטים','מטענים','סוללות','כיסויים','כבלים','מגני מסך'],
    'meta_brands':     ['Apple','Samsung','Sony','Bose','JBL','Anker','Belkin','Spigen','Canon','GoPro','Motorola'],
    'meta_colors':     ['שחור','לבן','כסף','אפור','זהב','ורוד','אדום','כחול','ירוק','סגול','כתום','טיטניום','שמפניה'],
    'meta_sizes':      ['XS','S','M','L','XL','XXL','64GB','128GB','256GB','512GB'],
    'meta_tags':       [
      'apple','samsung','sony','android','ios','iphone',
      'smartphone','5g','camera','photo','headphones','audio',
      'anc','wireless','accessory','charger','cable','case',
      'screen-protector','powerbank','battery','universal',
      'magsafe','usbc','lightning','mirrorless','smartwatch',
    ],
  }
  for col, names in seeds.items():
    for name in names:
      db[col].insert_one({'name': name, 'createdAt': now})
  print('[reset] ✓ Meta collections re-seedées.')
  print('[reset] ✅ Terminé!')

if __name__ == '__main__':
  import sys
  if '--reset' in sys.argv:
    reset_and_reseed()
  else:
    run()