"""
app/services/email_service.py — Tataphone (thème terracotta)
Configure via .env:
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=tataphone@gmail.com
  SMTP_PASS=xxxx xxxx xxxx xxxx
  ADMIN_EMAIL=tataphone@gmail.com
  APP_URL=http://localhost:3000        ← IMPORTANT : 3000 (Next), pas 5173 !
"""

import os, smtplib
from fpdf import FPDF
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

# ⚠️ Pour que les liens des emails (mes commandes, etc.) fonctionnent,
# APP_URL doit pointer vers le front Next (3000), pas l'ancien Vite (5173).
APP_URL     = os.getenv("APP_URL",     "http://localhost:3000")
SMTP_HOST   = os.getenv("SMTP_HOST",   "")
SMTP_PORT   = int(os.getenv("SMTP_PORT", 587))
SMTP_USER   = os.getenv("SMTP_USER",   "")
SMTP_PASS   = os.getenv("SMTP_PASS",   "")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")
LOGO_URL = os.getenv("LOGO_URL", f"{APP_URL}/logo.png")

FROM_NAME   = "Tataphone"

# ── Palette terracotta (couleurs du site) ────────────────────────────────────
C_PRIMARY      = "#CC785C"   # terracotta
C_PRIMARY_DARK = "#BD5D3A"
C_PRIMARY_DEEP = "#9D4B2E"
C_PRIMARY_PALE = "#FAF3EF"
C_BG           = "#FBF7F4"
C_INK          = "#3A2A22"   # brun foncé pour le texte

# ── Send core ─────────────────────────────────────────────────────────────────

def _send_smtp(to, subject, html, pdf_bytes=None, pdf_filename=None):
    msg = MIMEMultipart("mixed")
    msg["Subject"] = subject
    msg["From"]    = f"{FROM_NAME} <{SMTP_USER}>"
    msg["To"]      = to
    msg.attach(MIMEText(html, "html"))
    if pdf_bytes:
        part = MIMEApplication(pdf_bytes, _subtype="pdf")
        part.add_header("Content-Disposition", "attachment",
                        filename=pdf_filename or "invoice.pdf")
        msg.attach(part)
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
        s.ehlo(); s.starttls(); s.login(SMTP_USER, SMTP_PASS)
        s.send_message(msg)

def _send_resend(to, subject, html):
    import resend
    resend.api_key = os.getenv("RESEND_API_KEY")
    resend.Emails.send({"from": f"{FROM_NAME} <noreply@tataphone.co.il>",
                        "to": [to], "subject": subject, "html": html})

def send_email(to: str, subject: str, html: str, pdf_bytes=None, pdf_filename=None):
    if not to: return
    if os.getenv("RESEND_API_KEY"):
        try: _send_resend(to, subject, html); print(f"[Resend] -> {to}"); return
        except Exception as e: print(f"[Resend] ERR {e}")
    if SMTP_HOST and SMTP_USER and SMTP_PASS:
        try: _send_smtp(to, subject, html, pdf_bytes, pdf_filename); print(f"[SMTP] -> {to}"); return
        except Exception as e: import traceback; traceback.print_exc(); print(f"[SMTP] ERR {e}")
    print(f"[DEV] No email config — skipping: {subject} -> {to}")

# ── Layout helpers (terracotta) ───────────────────────────────────────────────

def _wrap(content: str) -> str:
    return f"""<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:{C_BG};">
<div style="font-family:'Heebo',Arial,sans-serif;max-width:560px;margin:0 auto;padding:28px 16px;background:{C_BG};">
 
  <!-- Header : fond blanc + bordure terracotta, logo image + fallback texte -->
  <div style="background:#ffffff;border:1px solid #EADFD8;border-top:4px solid {C_PRIMARY};border-radius:16px;padding:22px 24px;margin-bottom:20px;text-align:center;">
    <a href="{APP_URL}" style="text-decoration:none;">
      <!-- Logo image (URL absolue) -->
      <img src="{LOGO_URL}" alt="טאטעפון" height="40"
           style="height:40px;width:auto;display:inline-block;border:0;outline:none;text-decoration:none;" />
    </a>
    <!-- Fallback texte (visible si l'image ne charge pas) : terracotta sur blanc -->
    <div style="margin-top:8px;">
      <span style="font-size:13px;color:{C_PRIMARY_DEEP};font-weight:700;">הטכנולוגיה הכשרה שלך 📱</span>
    </div>
  </div>
 
  <!-- Contenu -->
  <div style="background:#ffffff;border-radius:16px;padding:28px 28px;border:1px solid #EADFD8;box-shadow:0 4px 24px rgba(157,75,46,0.08);direction:rtl;text-align:right;">
    {content}
  </div>
 
  <!-- Footer -->
  <div style="text-align:center;margin-top:20px;padding:0 16px;">
    <p style="font-size:12px;color:#A1887A;margin:0;line-height:1.8;">
      © 2026 Tataphone Ltd &nbsp;·&nbsp;
      <a href="mailto:info@tataphone.co.il" style="color:{C_PRIMARY};text-decoration:none;">info@tataphone.co.il</a>
      &nbsp;·&nbsp; 03-555-0123
    </p>
  </div>
</div>
</body>
</html>"""
 
def _btn(url, label, color=C_PRIMARY):
    return f'<div style="text-align:right;margin:18px 0;"><a href="{url}" style="display:inline-block;background:{color};color:#fff;padding:13px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">{label} &larr;</a></div>'

# ── Templates ─────────────────────────────────────────────────────────────────

def send_welcome(to: str, name: str):
    html = _wrap(f"""
      <h2 style="font-size:20px;font-weight:900;color:{C_INK};margin:0 0 8px;">ברוך הבא, {name}! 🎉</h2>
      <p style="font-size:14px;color:#7A6A60;line-height:1.7;margin:0 0 16px;">תודה שנרשמת לטאטעפון — המקום המוביל לטכנולוגיה כשרה בישראל.</p>
      <div style="background:{C_PRIMARY_PALE};border-radius:10px;padding:14px 18px;margin:14px 0;">
        <p style="font-size:13px;font-weight:700;color:{C_PRIMARY_DEEP};margin:0 0 6px;">מה תוכל לעשות עכשיו:</p>
        <ul style="font-size:13px;color:#5A4A40;margin:0;padding-right:18px;line-height:2.1;">
          <li>גלה מאות מוצרים כשרים</li><li>עקוב אחר ההזמנות שלך</li><li>קבל הנחות בלעדיות</li>
        </ul>
      </div>
      {_btn(f"{APP_URL}/products", "גלה מוצרים עכשיו")}""")
    send_email(to, "ברוך הבא לטאטעפון! 🎉", html)


def send_order_confirmation(to: str, name: str, order: dict):
    oid      = str(order.get('_id',''))[-8:].upper()
    subtotal = float(order.get('subtotal', order.get('total', 0)))
    vat      = float(order.get('vat', 0))
    total    = float(order.get('total', subtotal))
    customer = order.get('customer', {})
    VAT_R = 0.18

    item_rows = "".join([
        "<tr>"
        f"<td style='padding:9px 10px;font-size:13px;color:{C_INK};border-bottom:1px solid #F1E8E2;text-align:right;'>{i.get('name','מוצר')}</td>"
        f"<td style='padding:9px 10px;font-size:13px;color:#7A6A60;border-bottom:1px solid #F1E8E2;text-align:center;'>&times;{i.get('qty',1)}</td>"
        f"<td style='padding:9px 10px;font-size:13px;color:#7A6A60;border-bottom:1px solid #F1E8E2;text-align:left;'>&#8362;{i.get('price',0)/(1+VAT_R):,.2f}</td>"
        f"<td style='padding:9px 10px;font-size:13px;font-weight:700;color:{C_PRIMARY};border-bottom:1px solid #F1E8E2;text-align:left;'>&#8362;{i.get('price',0)/(1+VAT_R)*i.get('qty',1):,.2f}</td>"
        "</tr>"
        for i in order.get('items', [])
    ])
    notes_row = f"<tr><td style='padding:3px 0;font-weight:700;color:#5A4A40;'>הערות</td><td colspan='3'>{customer.get('notes','')}</td></tr>" if customer.get('notes') else ""
    user_id   = order.get('userId')
    order_btn = _btn(f"{APP_URL}/my-orders", "צפה בהזמנות שלי") if user_id else ""

    html = _wrap(f"""
      <h2 style="font-size:22px;font-weight:900;color:{C_INK};margin:0 0 4px;">ההזמנה התקבלה! ✅</h2>
      <p style="font-size:14px;color:#7A6A60;margin:0 0 20px;">שלום {name}, תודה על הרכישה בטאטעפון!</p>

      <div style="background:{C_PRIMARY_PALE};border-radius:10px;padding:12px 16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;color:#7A6A60;font-weight:700;">מספר הזמנה</span>
        <span style="font-size:14px;font-weight:900;color:{C_PRIMARY};font-family:monospace;">#{oid}</span>
      </div>

      <div style="background:{C_PRIMARY_PALE};border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="font-size:11px;font-weight:800;color:{C_PRIMARY_DEEP};text-transform:uppercase;letter-spacing:0.05em;margin:0 0 10px;">פרטי לקוח ומשלוח</p>
        <table style="font-size:13px;color:#5A4A40;width:100%;">
          <tr><td style="padding:3px 0;font-weight:700;width:110px;">שם מלא</td><td colspan="3">{customer.get('firstName','')} {customer.get('lastName','')}</td></tr>
          <tr><td style="padding:3px 0;font-weight:700;">אימייל</td><td colspan="3">{customer.get('email','')}</td></tr>
          <tr><td style="padding:3px 0;font-weight:700;">טלפון</td><td colspan="3">{customer.get('phone','')}</td></tr>
          <tr><td style="padding:3px 0;font-weight:700;">כתובת</td><td colspan="3">{customer.get('address','')}, {customer.get('city','')}</td></tr>
          {notes_row}
        </table>
      </div>

      <p style="font-size:11px;font-weight:800;color:{C_PRIMARY_DEEP};text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">פירוט הזמנה</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:4px;">
        <thead>
          <tr style="background:{C_PRIMARY_DEEP};">
            <th style="text-align:right;font-size:11px;color:#fff;font-weight:700;padding:8px 10px;">מוצר</th>
            <th style="text-align:center;font-size:11px;color:#fff;font-weight:700;padding:8px 10px;">כמות</th>
            <th style="text-align:left;font-size:11px;color:#fff;font-weight:700;padding:8px 10px;">מחיר יח׳ (ללא מע"מ)</th>
            <th style="text-align:left;font-size:11px;color:#fff;font-weight:700;padding:8px 10px;">סה"כ (ללא מע"מ)</th>
          </tr>
        </thead>
        <tbody>{item_rows}</tbody>
      </table>

      <div style="background:{C_PRIMARY_PALE};border-radius:10px;padding:16px 20px;margin:12px 0 20px;border:2px solid {C_PRIMARY};">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px dashed {C_PRIMARY_DARK}40;">
          <span style="font-size:13px;color:#7A6A60;">סה"כ ללא מע"מ</span>
          <span style="font-size:14px;font-weight:600;color:#5A4A40;">&#8362;{subtotal:,.2f}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:12px;border-bottom:2px solid {C_PRIMARY_DARK}40;">
          <span style="font-size:13px;color:#7A6A60;">מע"מ 18%</span>
          <span style="font-size:14px;font-weight:600;color:#5A4A40;">&#8362;{vat:,.2f}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:15px;font-weight:800;color:{C_PRIMARY_DEEP};">סה"כ כולל מע"מ</span>
          <span style="font-size:28px;font-weight:900;color:{C_PRIMARY};">&#8362;{total:,.0f}</span>
        </div>
      </div>

      <div style="background:#F0FDF4;border-radius:10px;padding:14px 16px;margin-bottom:20px;border:1px solid #BBF7D0;">
        <p style="font-size:13px;font-weight:700;color:#065F46;margin:0 0 6px;">מה קורה עכשיו?</p>
        <p style="font-size:13px;color:#5A4A40;margin:0;line-height:1.8;">
          ✅ הזמנתך התקבלה ומעובדת<br>📦 תקבל עדכון כשהחבילה יוצאת<br>⏱ זמן אספקה משוער: 2-4 ימי עסקים
        </p>
      </div>
      {order_btn}
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #F1E8E2;font-size:12px;color:#A1887A;text-align:center;line-height:2;">
        <strong style="color:#7A6A60;">Tataphone Ltd</strong><br>
        info@tataphone.co.il &nbsp;|&nbsp; 03-555-0123<br>
        א׳–ה׳ 09:00–18:00
      </div>
    """)

    pdf_bytes = None
    try:
        pdf_bytes = _generate_invoice_pdf(order)
        print(f"[PDF] generated {len(pdf_bytes)} bytes for #{oid}")
    except Exception as e:
        import traceback; traceback.print_exc()
        print(f"[PDF] FAILED: {e}")

    send_email(to, f"הזמנה #{oid} התקבלה — טאטעפון", html,
               pdf_bytes=pdf_bytes, pdf_filename=f"tataphone_invoice_{oid}.pdf")


def send_contact_notify(name: str, email: str, message: str):
    html = _wrap(f"""
      <h2 style="font-size:18px;font-weight:900;color:{C_INK};margin:0 0 14px;">📬 פנייה חדשה מהאתר</h2>
      <table style="font-size:13px;color:#5A4A40;margin-bottom:14px;">
        <tr><td style="padding:4px 0;font-weight:700;width:70px;">שם</td><td>{name}</td></tr>
        <tr><td style="padding:4px 0;font-weight:700;">אימייל</td><td><a href="mailto:{email}" style="color:{C_PRIMARY};">{email}</a></td></tr>
      </table>
      <div style="background:{C_PRIMARY_PALE};border-radius:10px;padding:14px;font-size:14px;color:{C_INK};line-height:1.7;white-space:pre-wrap;">{message}</div>
      {_btn(f"mailto:{email}", "השב לפנייה", "#059669")}""")
    send_email(ADMIN_EMAIL, f"[Tataphone] פנייה מ-{name}", html)


def send_password_reset(to: str, name: str, token: str):
    url = f"{APP_URL}/reset-password?token={token}"
    html = _wrap(f"""
      <h2 style="font-size:20px;font-weight:900;color:{C_INK};margin:0 0 8px;">איפוס סיסמה</h2>
      <p style="font-size:14px;color:#7A6A60;line-height:1.7;margin:0 0 4px;">שלום {name}, קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
      <p style="font-size:13px;color:#7A6A60;margin:0 0 6px;">הלינק תקף למשך <strong>שעה</strong>.</p>
      {_btn(url, "אפס סיסמה")}
      <p style="font-size:11px;color:#A1887A;margin-top:16px;">אם לא ביקשת זאת — התעלם מאימייל זה.</p>""")
    send_email(to, "איפוס סיסמה — טאטעפון", html)


def _generate_invoice_pdf(order: dict) -> bytes:
    """Facture PDF — thème terracotta, prix TTC, détail mע"מ."""
    oid      = str(order.get('_id',''))[-8:].upper()
    date     = str(order.get('createdAt',''))[:10]
    subtotal = float(order.get('subtotal', order.get('total', 0)))
    vat      = float(order.get('vat', 0))
    total    = float(order.get('total', subtotal))
    cust     = order.get('customer', {})
    name  = f"{cust.get('firstName','')} {cust.get('lastName','')}".strip()
    addr  = f"{cust.get('address','')}, {cust.get('city','')}".strip(', ')
    notes_html = f"<p style='font-size:12px;color:#5A4A40;margin:2px 0;'>הערות: {cust.get('notes','')}</p>" if cust.get('notes') else ""
    VAT_R = 0.18

    item_rows = "".join([
        f"<tr>"
        f"<td style='padding:9px 12px;font-size:13px;color:{C_INK};border-bottom:1px solid #F1E8E2;text-align:right;'>{i.get('name','')}</td>"
        f"<td style='padding:9px 12px;font-size:13px;color:#7A6A60;border-bottom:1px solid #F1E8E2;text-align:center;'>&times;{i.get('qty',1)}</td>"
        f"<td style='padding:9px 12px;font-size:13px;color:#7A6A60;border-bottom:1px solid #F1E8E2;text-align:left;'>&#8362;{round(i.get('price',0)/(1+VAT_R)):,.0f}</td>"
        f"<td style='padding:9px 12px;font-size:13px;color:#5A4A40;border-bottom:1px solid #F1E8E2;text-align:left;'>&#8362;{round(i.get('price',0)/(1+VAT_R))*i.get('qty',1):,.0f}</td>"
        f"</tr>"
        for i in order.get('items', [])
    ])
    user_id   = order.get('userId')
    order_btn = _btn(f"{APP_URL}/my-orders", "צפה בהזמנות שלי") if user_id else ""

    html = f"""<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ font-family:'Heebo',Arial,sans-serif; background:{C_BG}; padding:20px; direction:rtl; }}
  .container {{ max-width:680px; margin:0 auto; }}
  .header {{ background:linear-gradient(135deg,{C_PRIMARY_DEEP},{C_PRIMARY}); border-radius:14px; padding:22px 28px; margin-bottom:18px; text-align:right; }}
  .header .logo {{ font-size:26px; font-weight:900; color:#fff; }}
  .header .logo span {{ color:{C_PRIMARY_PALE}; }}
  .header .subtitle {{ font-size:12px; color:{C_PRIMARY_PALE}; margin-top:3px; }}
  .card {{ background:#fff; border-radius:14px; padding:24px; border:1px solid #EADFD8; margin-bottom:16px; }}
  .invoice-ref {{ display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; padding-bottom:14px; border-bottom:1px solid #F1E8E2; }}
  .invoice-num {{ font-size:18px; font-weight:900; color:{C_INK}; }}
  .invoice-date {{ font-size:13px; color:#7A6A60; }}
  .section-title {{ font-size:11px; font-weight:800; color:{C_PRIMARY_DEEP}; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:10px; }}
  .customer-block {{ background:{C_PRIMARY_PALE}; border-radius:10px; padding:14px 16px; margin-bottom:18px; }}
  .customer-block p {{ font-size:13px; color:#5A4A40; line-height:1.8; }}
  table {{ width:100%; border-collapse:collapse; margin-bottom:4px; }}
  thead tr {{ background:{C_PRIMARY_DEEP}; }}
  thead th {{ color:#fff; font-size:11px; font-weight:700; padding:9px 12px; }}
  thead th:first-child {{ text-align:right; }}
  thead th:not(:first-child) {{ text-align:left; }}
  .totals-box {{ background:{C_PRIMARY_PALE}; border-radius:10px; padding:16px 20px; border:2px solid {C_PRIMARY}; margin:14px 0 18px; }}
  .totals-row {{ display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }}
  .next-steps {{ background:#F0FDF4; border-radius:10px; padding:14px 16px; border:1px solid #BBF7D0; margin-bottom:16px; }}
  .next-steps h3 {{ font-size:13px; font-weight:700; color:#065F46; margin-bottom:6px; }}
  .next-steps p {{ font-size:13px; color:#5A4A40; line-height:1.9; }}
  .footer {{ text-align:center; font-size:11px; color:#A1887A; padding:0 16px; line-height:1.9; }}
</style></head>
<body><div class="container">
  <div class="header"><div class="logo">טאטע<span>פון</span></div><div class="subtitle">הטכנולוגיה הכשרה שלך 📱</div></div>
  <div class="card">
    <div class="invoice-ref"><div class="invoice-num">חשבונית #{oid}</div><div class="invoice-date">תאריך: {date}</div></div>
    <div class="section-title">פרטי לקוח ומשלוח</div>
    <div class="customer-block"><p><strong>{name}</strong></p><p>{cust.get('email','')}</p><p>{cust.get('phone','')}</p><p>{addr}</p>{notes_html}</div>
    <div class="section-title">פירוט הזמנה</div>
    <table><thead><tr>
      <th style="text-align:right;">מוצר</th><th>כמות</th><th>מחיר יחידה (ללא מע"מ)</th><th>סה"כ</th>
    </tr></thead><tbody>{item_rows}</tbody></table>
    <div class="totals-box">
      <div class="totals-row" style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px dashed {C_PRIMARY_DARK}55;">
        <span style="font-size:13px;color:#7A6A60;">סה"כ ללא מע"מ</span><span style="font-size:14px;font-weight:600;color:#5A4A40;">&#8362;{subtotal:,.0f}</span>
      </div>
      <div class="totals-row" style="margin-bottom:12px;padding-bottom:12px;border-bottom:2px solid {C_PRIMARY_DARK}55;">
        <span style="font-size:13px;color:#7A6A60;">מע"מ 18%</span><span style="font-size:14px;font-weight:600;color:#5A4A40;">&#8362;{vat:,.0f}</span>
      </div>
      <div class="totals-row">
        <span style="font-size:15px;font-weight:800;color:{C_PRIMARY_DEEP};">סה"כ כולל מע"מ</span><span style="font-size:26px;font-weight:900;color:{C_PRIMARY};">&#8362;{total:,.0f}</span>
      </div>
    </div>
    <div class="next-steps"><h3>מה קורה עכשיו? ✅</h3><p>✅ הזמנתך התקבלה ומעובדת<br>📦 תקבל עדכון כשהחבילה יוצאת<br>⏱ זמן אספקה משוער: 2–4 ימי עסקים</p></div>
    {order_btn}
  </div>
  <div class="footer"><strong style="color:#7A6A60;">Tataphone Ltd</strong><br>info@tataphone.co.il &nbsp;|&nbsp; 03-555-0123<br>א׳–ה׳ 09:00–18:00</div>
</div></body></html>"""

    try:
        from weasyprint import HTML as WH
        return WH(string=html).write_pdf()
    except Exception as e:
        print(f"[PDF] WeasyPrint failed: {e}, fallback fpdf")
        return _generate_invoice_pdf_fpdf(order)


def _generate_invoice_pdf_fpdf(order: dict) -> bytes:
    """Fallback PDF — terracotta, prix TTC."""
    import os as _os
    from fpdf import FPDF
    _dir   = _os.path.dirname(_os.path.dirname(__file__))
    F_REG  = _os.path.join(_dir, 'fonts', 'DejaVuSans.ttf')
    F_BOLD = _os.path.join(_dir, 'fonts', 'DejaVuSans-Bold.ttf')
    pdf = FPDF(); pdf.add_page(); pdf.set_auto_page_break(auto=True, margin=15)
    if _os.path.exists(F_REG):
        pdf.add_font('DV','',F_REG); pdf.add_font('DV','B',F_BOLD); F='DV'
    else: F='Helvetica'
    oid=str(order.get('_id',''))[-8:].upper(); date=str(order.get('createdAt',''))[:10]
    subtotal=float(order.get('subtotal',order.get('total',0))); vat=float(order.get('vat',0))
    total=float(order.get('total',subtotal)); cust=order.get('customer',{})
    name=f"{cust.get('firstName','')} {cust.get('lastName','')}".strip()
    pdf.set_fill_color(157,75,46); pdf.rect(0,0,210,36,'F')   # terracotta deep
    pdf.set_font(F,'B',22); pdf.set_text_color(255,255,255); pdf.set_y(7)
    pdf.cell(0,12,'TATAPHONE',align='C',ln=True)
    pdf.set_font(F,'',9); pdf.set_text_color(250,243,239)
    pdf.cell(0,6,'info@tataphone.co.il  |  03-555-0123',align='C',ln=True); pdf.ln(8)
    pdf.set_text_color(58,42,34); pdf.set_font(F,'B',15)
    pdf.cell(95,9,f'Invoice #{oid}',ln=False)
    pdf.set_font(F,'',10); pdf.set_text_color(122,106,96)
    pdf.cell(0,9,f'Date: {date}',align='R',ln=True)
    pdf.set_draw_color(234,223,216); pdf.line(10,pdf.get_y(),200,pdf.get_y()); pdf.ln(5)
    pdf.set_fill_color(250,243,239); pdf.rect(10,pdf.get_y(),190,34,'F')
    pdf.set_font(F,'B',9); pdf.set_text_color(157,75,46); pdf.cell(0,7,'BILL TO',ln=True)
    pdf.set_font(F,'',10); pdf.set_text_color(58,42,34)
    for line in [name,cust.get('email',''),cust.get('phone',''),f"{cust.get('address','')}, {cust.get('city','')}".strip(', ')]:
        if line and line.strip(): pdf.cell(0,6,line,ln=True)
    pdf.ln(6)
    pdf.set_fill_color(157,75,46); pdf.set_text_color(255,255,255); pdf.set_font(F,'B',10)
    for txt,w,al in [('Description',90,'L'),('Qty',20,'C'),('Unit (HT)',40,'R'),('Total HT',40,'R')]:
        pdf.cell(w,9,txt,fill=True,align=al)
    pdf.ln()
    VAT_R = 0.18
    pdf.set_text_color(58,42,34); pdf.set_font(F,'',10); fill=False
    for item in order.get('items',[]):
        pdf.set_fill_color(250,243,239) if fill else pdf.set_fill_color(255,255,255)
        unit_ht = round(item.get('price',0)/(1+VAT_R)); lt = unit_ht*item.get('qty',1)
        pdf.cell(90,8,str(item.get('name',''))[:44],fill=fill,align='L')
        pdf.cell(20,8,str(item.get('qty',1)),fill=fill,align='C')
        pdf.cell(40,8,f"ILS {unit_ht:,.2f}",fill=fill,align='R')
        pdf.cell(40,8,f"ILS {lt:,.2f}",fill=fill,align='R',ln=True); fill=not fill
    pdf.ln(3)
    pdf.set_font(F,'',10); pdf.set_text_color(122,106,96)
    pdf.cell(150,8,'Subtotal (HT):',align='R'); pdf.cell(40,8,f'ILS {subtotal:,.2f}',align='R',ln=True)
    pdf.cell(150,8,'VAT 18%:',align='R'); pdf.cell(40,8,f'ILS {vat:,.2f}',align='R',ln=True); pdf.ln(1)
    pdf.set_draw_color(204,120,92); pdf.line(10,pdf.get_y(),200,pdf.get_y()); pdf.ln(2)
    pdf.set_fill_color(157,75,46); pdf.set_text_color(255,255,255); pdf.set_font(F,'B',11)
    pdf.cell(150,12,'TOTAL (incl. VAT):',fill=True,align='R'); pdf.set_font(F,'B',14)
    pdf.cell(40,12,f'ILS {total:,.0f}',fill=True,align='R',ln=True)
    pdf.ln(6); pdf.set_font(F,'',8); pdf.set_text_color(122,106,96)
    pdf.cell(0,5,'Thank you for shopping at Tataphone - The Kosher Tech Store',align='C',ln=True)
    return bytes(pdf.output())