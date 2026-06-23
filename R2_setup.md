# Cloudflare R2 — mise en place (domaine non déplacé)

## 1. Bucket (déjà créé chez toi ✓)
R2 → ton bucket. Note son nom → variable R2_BUCKET.

## 2. Activer l'accès public du bucket
R2 → ton bucket → Settings → **Public Development URL** → "Enable".
Tu obtiens une URL : `https://pub-xxxxxxxxxxxx.r2.dev`
→ c'est ta variable R2_PUBLIC_URL.

(C'est l'option propre disponible sans mettre le domaine sur Cloudflare.)

## 3. Créer un token API R2 (S3)
R2 → "Manage R2 API Tokens" → Create API Token →
permissions **Object Read & Write** sur ton bucket.
Tu obtiens :
- Access Key ID      → R2_ACCESS_KEY_ID
- Secret Access Key  → R2_SECRET_ACCESS_KEY
Et ton Account ID (en haut de la page R2) → R2_ACCOUNT_ID

## 4. .env backend
```
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxx
R2_BUCKET=tataphone-images
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

## 5. Dépendances Python
```bash
pip install boto3 pillow
```

## 6. Placer les fichiers
- r2_storage.py → backend/app/services/r2_storage.py
- applique PRODUCTS_routes_patch.py dans backend/app/routes/products.py
- next.config.js (frontend) : déjà mis à jour pour autoriser **.r2.dev

## 7. Tester
Admin → ajoute un produit avec photo → l'image part sur R2,
l'URL https://pub-xxxx.r2.dev/products/xxxx.jpg apparaît et s'affiche.

## Plus tard (si un jour le domaine passe sur Cloudflare)
Tu pourras : brancher images.tataphone.co.il sur le bucket + activer
Image Transformations (resize à la volée) → et retirer Pillow.
Le code n'aura qu'une variable à changer (R2_PUBLIC_URL).