# Déploiement Tataphone sur Hetzner

Architecture : 1 VPS héberge tout — Next.js (3000) + Flask (5000) + MongoDB, derrière Nginx.

---

## 0. Créer le serveur
- Hetzner Cloud → CX22 (~4€/mois) suffit pour démarrer
- Image : **Ubuntu 24.04**
- Ajoute ta clé SSH
- Note l'IP publique (ex: 49.12.x.x)

```bash
ssh root@TON_IP
```

---

## 1. Installer les outils de base
```bash
apt update && apt upgrade -y
apt install -y nginx git curl ufw

# Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Python + venv
apt install -y python3 python3-venv python3-pip

# PM2 (gestionnaire de process)
npm install -g pm2

# MongoDB 7
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update && apt install -y mongodb-org
systemctl enable --now mongod
```

---

## 2. Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## 3. Déposer le code
```bash
mkdir -p /var/www/tataphone && cd /var/www/tataphone
# soit git clone, soit scp depuis ton Mac :
#   scp -r ~/Desktop/programs/tataphone-next/* root@TON_IP:/var/www/tataphone/
```
Tu dois avoir : `/var/www/tataphone/frontend` et `/var/www/tataphone/backend`.

---

## 4. Backend (Flask)
```bash
cd /var/www/tataphone/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
deactivate
```

Crée le `.env` backend (adapte) :
```bash
nano .env
```
```
CORS_ORIGINS=https://tataphone.co.il,https://www.tataphone.co.il
APP_URL=https://tataphone.co.il
GOOGLE_REDIRECT_URI=https://tataphone.co.il/api/auth/google/callback
MONGO_URI=mongodb://localhost:27017
# ... SMTP, PayPal, PayPlus, JWT_SECRET, etc.
```

Lance via PM2 (gunicorn, 3 workers) :
```bash
cd /var/www/tataphone/backend
pm2 start "venv/bin/gunicorn -w 3 -b 127.0.0.1:5000 'app:create_app()'" --name tataphone-api
```
> Si ton entrée n'est pas `app:create_app()`, adapte (ex: `wsgi:app`).

---

## 5. Frontend (Next.js)
```bash
cd /var/www/tataphone/frontend
nano .env.local
```
```
NEXT_PUBLIC_API_URL=https://tataphone.co.il/api
```
Build + lancement prod :
```bash
npm install
npm run build
pm2 start "npm run start" --name tataphone-web
```
> `npm run start` sert le build optimisé sur le port 3000 (rapide, contrairement à `npm run dev`).

Sauvegarde PM2 pour redémarrage auto au reboot :
```bash
pm2 save
pm2 startup    # exécute la ligne qu'il affiche
```

---

## 6. Nginx
```bash
# copie nginx_tataphone.conf fourni :
cp nginx_tataphone.conf /etc/nginx/sites-available/tataphone
ln -s /etc/nginx/sites-available/tataphone /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 7. DNS (chez Hetzner ou ton registrar)
Pointe le domaine vers l'IP du serveur :
```
A     @      TON_IP
A     www    TON_IP
```
Attends la propagation (quelques minutes à quelques heures).

---

## 8. HTTPS (SSL gratuit Let's Encrypt)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d tataphone.co.il -d www.tataphone.co.il
```
Certbot modifie Nginx automatiquement (redirige 80→443) et renouvelle tout seul.

---

## 9. Vérifier
```bash
pm2 status          # tataphone-web + tataphone-api = online
curl -I https://tataphone.co.il
```

---

## Mises à jour futures
Place `update_tataphone.sh` dans `/var/www/tataphone/` puis :
```bash
cd /var/www/tataphone
./update_tataphone.sh
```
Ça rebuild le front, réinstalle les deps, et redémarre les deux services.

---

## Logs utiles
```bash
pm2 logs tataphone-web     # logs Next
pm2 logs tataphone-api     # logs Flask
tail -f /var/log/nginx/error.log
```

## Important après déploiement
- Google OAuth : ajoute `https://tataphone.co.il/api/auth/google/callback` dans Google Cloud Console → Authorized redirect URIs
- Active le sitemap dynamique (les 2000 produits) si pas déjà fait