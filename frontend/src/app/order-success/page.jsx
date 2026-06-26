'use client'
import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, ShoppingBag, Home } from 'lucide-react'
import useCartStore from '@/stores/cartStore'

function SuccessInner() {
  const clearCart = useCartStore(s => s.clearCart)

  // Vide le panier au retour du paiement (Grow/PayPal redirigent ici après succès)
  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-6">
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', delay:0.1 }}>
        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-2"><CheckCircle2 className="w-14 h-14 text-green-500" /></div>
      </motion.div>
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
        <h1 className="font-rubik font-black text-slate-900 mb-3" style={{ fontSize:38 }}>ההזמנה התקבלה! 🎉</h1>
        <p className="text-slate-500 text-[16px] max-w-md leading-7">תודה על הרכישה! פרטי ההזמנה נשלחו לאימייל שלך. נחזור אליך בהקדם עם פרטי משלוח.</p>
      </motion.div>
      <div className="flex gap-3 mt-4">
        <Link href="/"><button className="btn btn-primary px-8 py-3 gap-2"><Home className="w-4 h-4" />דף הבית</button></Link>
        <Link href="/products"><button className="btn btn-secondary px-8 py-3 gap-2"><ShoppingBag className="w-4 h-4" />המשך קנייה</button></Link>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return <Suspense><SuccessInner /></Suspense>
}