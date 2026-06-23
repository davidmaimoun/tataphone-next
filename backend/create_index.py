"""
create_indexes.py — Index MongoDB pour Tataphone.
Lance UNE FOIS :  python create_indexes.py   (idempotent — relançable sans risque)
"""
from pymongo import MongoClient, ASCENDING, DESCENDING, TEXT
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/tataphone'))
db = client.get_default_database()   # utilise le nom de base dans MONGO_URI (/tataphone)

# Collections
products_collection = db.products
orders_collection   = db.orders
users_collection    = db.users
guests_collection   = db.guests
meta_categories     = db.meta_categories
meta_brands         = db.meta_brands
meta_colors         = db.meta_colors
meta_sizes          = db.meta_sizes

# ── Products ──────────────────────────────────────────────────
products_collection.create_index([('createdAt', DESCENDING)])         # nouveautés / admin list
products_collection.create_index('category')                          # filtre catalogue
products_collection.create_index('brand')                             # filtre catalogue
products_collection.create_index('isKosher')
products_collection.create_index('isAccessory')
products_collection.create_index([('reviewCount', DESCENDING)])       # best sellers
products_collection.create_index([('rating', DESCENDING)])            # top rated
products_collection.create_index('price')                             # tri / filtre prix
products_collection.create_index('sku', sparse=True)                  # recherche SKU + import
products_collection.create_index([('tags', ASCENDING)])               # filtre par tag
# Recherche texte (hébreu → default_language 'none' = pas de stemming)
products_collection.create_index(
    [('name', TEXT), ('description', TEXT), ('brand', TEXT)],
    default_language='none'
)

# ── Orders ────────────────────────────────────────────────────
orders_collection.create_index([('createdAt', DESCENDING)])
orders_collection.create_index('status')                              # pending-count, filtres
orders_collection.create_index('userId')                              # "mes commandes"
orders_collection.create_index('isTest')                              # accounting
orders_collection.create_index([('status', ASCENDING), ('createdAt', DESCENDING)])  # compta

# ── Users ─────────────────────────────────────────────────────
users_collection.create_index('email', unique=True)
users_collection.create_index([('createdAt', DESCENDING)])

# ── Guests ────────────────────────────────────────────────────
guests_collection.create_index('email', unique=True)
guests_collection.create_index('lastSeen')

# ── Meta (catégories / marques / couleurs / tailles) ──────────
meta_categories.create_index('name', unique=True)
meta_brands.create_index('name', unique=True)
meta_colors.create_index('name', unique=True)
meta_sizes.create_index('name', unique=True)

print('[INDEX] créés ✓')
for c in [products_collection, orders_collection, users_collection, guests_collection]:
    print(f'  {c.name}: {list(c.index_information().keys())}')