#!/bin/bash
# backup_db.sh — Sauvegarde complète de la base MongoDB tataphone.
# À lancer sur le serveur (user tataphone).
# Usage : ./backup_db.sh   → crée un dump horodaté dans ~/backups/

set -e

DB_NAME="tataphone"
BACKUP_DIR="$HOME/backups"
STAMP=$(date +%Y-%m-%d_%H-%M-%S)
OUT="$BACKUP_DIR/tataphone_$STAMP"

mkdir -p "$BACKUP_DIR"

echo "→ Sauvegarde de la base '$DB_NAME'..."
mongodump --db="$DB_NAME" --out="$OUT" --quiet

# Compresser en un seul .tar.gz
tar -czf "$OUT.tar.gz" -C "$BACKUP_DIR" "tataphone_$STAMP"
rm -rf "$OUT"

echo "✓ Backup créé : $OUT.tar.gz"
echo "  Taille : $(du -h "$OUT.tar.gz" | cut -f1)"

# Garder seulement les 10 derniers backups (nettoyage auto)
cd "$BACKUP_DIR"
ls -t tataphone_*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm --
echo "→ Backups conservés : $(ls tataphone_*.tar.gz 2>/dev/null | wc -l) (max 10)"
echo ""
echo "Pour RESTAURER un backup :"
echo "  tar -xzf tataphone_XXXX.tar.gz"
echo "  mongorestore --db=$DB_NAME --drop tataphone_XXXX/$DB_NAME"