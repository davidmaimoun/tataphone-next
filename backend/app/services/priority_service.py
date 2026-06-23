# ════════════════════════════════════════════════════════════════════════════
#  PRIORITY OData — lecture des produits (forme LOGPART). Lecture seule.
#  → backend/app/services/priority_service.py
#
#  Confirmé par la doc officielle : LOGPART contient déjà le PRIX (LASTPRICE),
#  donc pas besoin de sous-forme. Champs : PARTNAME (SKU), PARTDES (nom),
#  BARCODE, LASTPRICE (prix), TYPE ('P'=produit), STATDES (statut).
#
#  .env backend :
#    # --- DÉMO publique (test immédiat, sans module API du client) ---
#    PRIORITY_SERVICE_ROOT=https://t.eu.priority-connect.online/odata/Priority/tabbtd38.ini/usdemo
#    PRIORITY_USER=apidemo
#    PRIORITY_PASS=123
#    # --- PROD (compte client, une fois module API + PAT obtenus) ---
#    # PRIORITY_SERVICE_ROOT=https://<client>.priority-connect.online/odata/Priority/tabula.ini/<env>
#    # PRIORITY_USER=<le_PAT>
#    # PRIORITY_PASS=PAT
# ════════════════════════════════════════════════════════════════════════════

import os
import requests

PRODUCTS_FORM = 'LOGPART'   # forme des articles dans Priority


def _cfg():
    root = os.getenv('PRIORITY_SERVICE_ROOT', '').rstrip('/')
    user = os.getenv('PRIORITY_USER', '')
    pwd  = os.getenv('PRIORITY_PASS', '')
    return root, user, pwd


def check_connection() -> dict:
    """Teste la connexion en demandant 1 seule ligne de LOGPART."""
    root, user, pwd = _cfg()
    if not root or not user:
        return {'connected': False, 'error': 'Priority non configuré (.env)'}
    try:
        r = requests.get(f'{root}/{PRODUCTS_FORM}?$top=1',
                         auth=(user, pwd), timeout=20,
                         headers={'Accept': 'application/json'})
        if r.status_code == 200:
            return {'connected': True}
        return {'connected': False, 'error': f'HTTP {r.status_code}', 'detail': r.text[:300]}
    except Exception as e:
        return {'connected': False, 'error': str(e)}


def fetch_products(limit: int = 50, only_products: bool = True) -> list:
    """
    Récupère les articles LOGPART (nom, SKU, prix, code-barres).
    only_products=True → filtre TYPE eq 'P' (vrais produits, pas services/divers).
    """
    root, user, pwd = _cfg()
    if not root or not user:
        raise RuntimeError('Priority non configuré')

    # $select limite les champs transférés ; $top limite le nombre
    select = 'PARTNAME,PARTDES,BARCODE,LASTPRICE,TYPE,STATDES'
    url = f'{root}/{PRODUCTS_FORM}?$top={int(limit)}&$select={select}'
    if only_products:
        url += "&$filter=TYPE eq 'P'"

    r = requests.get(url, auth=(user, pwd), timeout=30,
                     headers={'Accept': 'application/json'})
    r.raise_for_status()
    rows = r.json().get('value', [])

    products = []
    for row in rows:
        products.append({
            'name':    row.get('PARTDES') or row.get('PARTNAME') or '—',
            'sku':     row.get('PARTNAME') or '',
            'barcode': row.get('BARCODE') or '',
            'price':   row.get('LASTPRICE'),        # prix direct ✓
            'status':  row.get('STATDES') or '',
            'type':    row.get('TYPE') or '',
            'stock':   None,                        # stock = forme liée (étape ultérieure)
            'raw':     row,
        })
    return products


def fetch_changed_since(iso_datetime: str, limit: int = 200) -> list:
    """
    Récupère uniquement les articles modifiés depuis une date (sync incrémentale).
    iso_datetime ex : '2026-01-01T00:00:00+02:00'
    Utilise $since (option Priority). Idéal pour ne pas tout retélécharger.
    """
    root, user, pwd = _cfg()
    url = f"{root}/{PRODUCTS_FORM}?$since={iso_datetime}&$top={int(limit)}"
    r = requests.get(url, auth=(user, pwd), timeout=60,
                     headers={'Accept': 'application/json'})
    r.raise_for_status()
    return r.json().get('value', [])