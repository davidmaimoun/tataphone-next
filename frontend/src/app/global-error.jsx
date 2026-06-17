'use client'
export default function GlobalError({ error, reset }) {
  const OWNER_EMAIL = 'tataphone@outlook.com'
  return (
    <html dir="rtl" lang="he">
      <body style={{ fontFamily:'system-ui,sans-serif', background:'#FBF7F4', margin:0 }}>
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'1rem' }}>
          <div style={{ width:80, height:80, borderRadius:24, background:'#FAF3EF', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24, fontSize:40 }}>⚠️</div>
          <h1 style={{ fontWeight:900, fontSize:28, color:'#3A2A22', margin:'0 0 8px' }}>משהו השתבש</h1>
          <p style={{ color:'#7A6A60', maxWidth:420, lineHeight:1.7, margin:'0 0 28px' }}>
            אירעה שגיאה. נסה לרענן. אם הבעיה נמשכת, צור קשר:
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
            <button onClick={() => reset()} style={{ background:'linear-gradient(135deg,#CC785C,#BD5D3A)', color:'#fff', border:0, padding:'12px 28px', borderRadius:12, fontWeight:700, cursor:'pointer' }}>נסה שוב</button>
            <a href="/" style={{ background:'#fff', color:'#9D4B2E', border:'1.5px solid #DDC2B5', padding:'12px 28px', borderRadius:12, fontWeight:700, textDecoration:'none' }}>דף הבית</a>
            <a href={`mailto:${OWNER_EMAIL}`} style={{ background:'transparent', color:'#7A6A60', border:0, padding:'12px 28px', fontWeight:700, textDecoration:'none' }}>{OWNER_EMAIL}</a>
          </div>
        </div>
      </body>
    </html>
  )
}
