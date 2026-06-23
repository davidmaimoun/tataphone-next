# ════════════════════════════════════════════════════════════════════════════
#  CLOUDFLARE R2 — stockage des photos produit (compatible S3 via boto3)
#  Domaine NON déplacé vers Cloudflare → pas de transformations.
#  On garde donc Pillow pour redimensionner avant l'upload.
#
#  pip install boto3 pillow
#
#  .env backend (NE PAS committer) :
#    R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxx
#    R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxx
#    R2_SECRET_ACCESS_KEY=xxxxxxxxxxxx
#    R2_BUCKET=tataphone-images
#    R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev   ← URL publique du bucket (sans / final)
# ════════════════════════════════════════════════════════════════════════════

import os
import io
import uuid
import boto3
from botocore.config import Config
from PIL import Image

R2_ACCOUNT_ID        = os.getenv('R2_ACCOUNT_ID', '')
R2_ACCESS_KEY_ID     = os.getenv('R2_ACCESS_KEY_ID', '')
R2_SECRET_ACCESS_KEY = os.getenv('R2_SECRET_ACCESS_KEY', '')
R2_BUCKET            = os.getenv('R2_BUCKET', '')
R2_PUBLIC_URL        = os.getenv('R2_PUBLIC_URL', '').rstrip('/')

_ALLOWED = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
_MAX_DIM = 1200   # redimensionnement max (Pillow), comme avant


def _client():
    if not (R2_ACCOUNT_ID and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY and R2_BUCKET):
        raise RuntimeError("R2 non configuré — vérifie R2_* dans le .env")
    return boto3.client(
        's3',
        endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name='auto',
    )


def upload_to_r2(file_storage) -> str:
    """
    Redimensionne (Pillow) puis envoie vers R2. Retourne l'URL publique.
    file_storage = werkzeug FileStorage (request.files[...]).
    """
    filename = file_storage.filename or 'image'
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'jpg'
    if ext not in _ALLOWED:
        raise ValueError(f"Type de fichier non autorisé : {ext}")

    # GIF : on n'altère pas (animation) — upload tel quel
    if ext == 'gif':
        data = file_storage.read()
        content_type = 'image/gif'
        out_ext = 'gif'
    else:
        # Redimensionne + ré-encode (optimise le poids)
        img = Image.open(file_storage.stream)
        if img.mode in ('RGBA', 'P') and ext in ('jpg', 'jpeg'):
            img = img.convert('RGB')
        img.thumbnail((_MAX_DIM, _MAX_DIM))
        buf = io.BytesIO()
        fmt = 'JPEG' if ext in ('jpg', 'jpeg') else ext.upper()
        save_kwargs = {'optimize': True}
        if fmt == 'JPEG':
            save_kwargs['quality'] = 85
        img.save(buf, format=fmt, **save_kwargs)
        data = buf.getvalue()
        content_type = f'image/{"jpeg" if ext in ("jpg","jpeg") else ext}'
        out_ext = 'jpg' if ext in ('jpg', 'jpeg') else ext

    key = f"products/{uuid.uuid4().hex}.{out_ext}"
    _client().put_object(
        Bucket=R2_BUCKET,
        Key=key,
        Body=data,
        ContentType=content_type,
        CacheControl='public, max-age=31536000, immutable',
    )

    if not R2_PUBLIC_URL:
        raise RuntimeError("R2_PUBLIC_URL manquant — active l'accès public du bucket")
    return f"{R2_PUBLIC_URL}/{key}"


def delete_from_r2(image_url: str):
    """Supprime un objet R2 à partir de son URL publique (optionnel)."""
    if not R2_PUBLIC_URL or not image_url.startswith(R2_PUBLIC_URL):
        return
    key = image_url[len(R2_PUBLIC_URL):].lstrip('/')
    try:
        _client().delete_object(Bucket=R2_BUCKET, Key=key)
    except Exception as e:
        print(f"[R2] delete failed: {e}")