# Migration DNS vers Cloudflare — Tataphone (gratuit)

Tu gardes ton domaine chez ton registrar israélien. Tu changes juste les
nameservers pour que Cloudflare gère le DNS. Aucun email à risque (pas de
boîte mail sur le domaine ; les emails de commande passent par SMTP Google,
indépendant du DNS).

═══════════════════════════════════════════════════════════════════════
ÉTAPE 1 — Ajouter le domaine à Cloudflare
═══════════════════════════════════════════════════════════════════════
1. dash.cloudflare.com → "Add a site" → tape : tataphone.co.il
2. Choisis le plan **Free**
3. Cloudflare scanne ton DNS actuel et liste les enregistrements trouvés
4. VÉRIFIE la liste. Tu devrais voir (si déjà configurés) :
   - A    @     → IP (ton serveur, si déjà en ligne)
   - A    www   → IP
   Si rien n'est encore en ligne, c'est normal (tu ajouteras après).

═══════════════════════════════════════════════════════════════════════
ÉTAPE 2 — Récupérer les nameservers Cloudflare
═══════════════════════════════════════════════════════════════════════
Cloudflare te donne 2 nameservers, ex :
   alice.ns.cloudflare.com
   bob.ns.cloudflare.com

═══════════════════════════════════════════════════════════════════════
ÉTAPE 3 — Changer les nameservers chez ton registrar israélien
═══════════════════════════════════════════════════════════════════════
1. Connecte-toi au panneau de ton registrar (.co.il)
2. Cherche "Nameservers" / "DNS" / "שרתי שמות"
3. Remplace les nameservers actuels par les 2 de Cloudflare
4. Sauvegarde

⚠️ Note : les domaines .co.il passent par ISOC-IL. Le changement de NS peut
   prendre de quelques heures à 24-48h pour se propager. Sois patient.

═══════════════════════════════════════════════════════════════════════
ÉTAPE 4 — Attendre l'activation
═══════════════════════════════════════════════════════════════════════
Cloudflare t'enverra un email "tataphone.co.il is now active on Cloudflare".
Tant que ce n'est pas actif, ne configure pas R2 custom domain (étape 5).

═══════════════════════════════════════════════════════════════════════
ÉTAPE 5 — Une fois actif : débloquer R2 + Transformations
═══════════════════════════════════════════════════════════════════════
A. Domaine custom sur le bucket R2 :
   R2 → ton bucket → Settings → Custom Domains → "Connect Domain"
   → entre : images.tataphone.co.il
   (Cloudflare crée automatiquement l'enregistrement DNS + le SSL)
   → ce sera ta nouvelle R2_PUBLIC_URL = https://images.tataphone.co.il

B. Image Transformations (resize/WebP auto, gratuit 5000/mois) :
   Domaine tataphone.co.il → Images (ou "Transformations")
   → active "Resize images from this zone" / "from any origin"

═══════════════════════════════════════════════════════════════════════
RÉCAP — ce qui devient possible (gratuit)
═══════════════════════════════════════════════════════════════════════
✓ images.tataphone.co.il (URL propre, plus de r2.dev rate-limité)
✓ Transformations : resize + WebP/AVIF à la volée (gratuit ≤ 5000/mois)
✓ CDN + cache + HTTPS + protection DDoS sur tout le site
✓ Tu pourras retirer Pillow (Cloudflare gère le resize)

ORDRE GLOBAL conseillé :
  1. Migrer le DNS vers Cloudflare (ce guide)
  2. Déployer le site sur Hetzner (DEPLOY_GUIDE.md)
  3. Pointer A @ / www vers l'IP Hetzner (dans Cloudflare DNS, nuage orange)
  4. Brancher R2 custom domain + Transformations
  5. Passer NEXT_PUBLIC_API_URL à https://tataphone.co.il/api et rebuild
