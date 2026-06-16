import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import ContactForm from '@/components/contact/ContactForm'
import FaqAccordion from '@/components/contact/FaqAccordion'

export const metadata = {
  title: 'צור קשר',
  description: 'צרו איתנו קשר — צוות מומחים זמין לכל שאלה. טלפון, אימייל, ושאלות נפוצות על משלוח, החזרות וכשרות.',
  alternates: { canonical: '/contact' },
}

const INFO = [
  { icon: Phone, label: 'טלפון', val: '0549784224' },
  { icon: Mail, label: 'אימייל', val: 'tataphone@outlook.com' },
  { icon: MapPin, label: 'כתובת', val: 'ירושלים' },
  { icon: Clock, label: 'שעות פעילות', val: 'א׳–ה׳ 9:00–18:00' },
]

const FAQS = [
  { q:'כמה זמן לוקח המשלוח?', a:'1-5 ימי עסקים. משלוח אקספרס תוך ~24 שעות זמין לחלק מהמוצרים.' },
  { q:'האם ניתן להחזיר מוצר?', a:'כן, תוך 14 יום — בתנאי שהאריזה לא נפתחה. ביטול עסקה כרוך בדמי ביטול של 5% או 100₪.' },
  { q:'האם המוצרים כשרים לכתחילה?', a:'כן! כל המוצרים באתר מאושרים ומותאמים לציבור הדתי ונושאים תעודת כשרות.' },
  { q:'אילו אמצעי תשלום מקובלים?', a:'כרטיסי אשראי, PayPal, Bit ו-Google Pay דרך מערכת הסליקה המאובטחת.' },
  { q:'האם ניתן לאסוף מהחנות?', a:'כן, ניתן לאסוף ממשרדינו. אנא צרו קשר לתיאום מראש.' },
  { q:'מה קורה אם המוצר אזל?', a:'במקרה שמוצר שהוזמן אזל, ניצור קשר ונציע חלופה או נחזיר את התשלום במלואו.' },
]

export default function ContactPage() {
  // JSON-LD FAQPage — rich snippet Google (questions/réponses dans les résultats)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="text-center mb-12">
        <h1 className="font-black text-slate-900 tracking-tight mb-3" style={{ fontSize: 40 }}>💬 צור קשר</h1>
        <p className="text-slate-500 text-lg">אנחנו כאן לכל שאלה — נחזור אליך תוך 24 שעות</p>
      </div>

      {/* FAQ — contenu rendu SERVEUR (SEO), comportement accordéon en îlot client */}
      <FaqAccordion faqs={FAQS} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form — îlot client */}
        <ContactForm />

        {/* Info — rendu serveur (texte indexable) */}
        <div className="lg:col-span-2 lg:order-2 space-y-4">
          {INFO.map(({ icon: Icon, label, val }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-primary-500" /></div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
                <p className="font-bold text-[15px] text-slate-800">{val}</p>
              </div>
            </div>
          ))}
          <div className="flex justify-center pt-2">
            <img src="/logo.png" alt="טאטעפון" className="h-12 w-auto object-contain opacity-90" />
          </div>
        </div>
      </div>
    </div>
  )
}