'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, Flame, Heart } from 'lucide-react'
import useCartStore from '@/stores/cartStore'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const count = useCartStore(s => s.count)

  const links = [
    { to: '/products', label: 'כל המוצרים' },
    { to: '/products?category=מצלמות', label: 'מצלמות' },
    { to: '/products?category=אוזניות', label: 'אוזניות' },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image src="/logo.png" alt="טאטעפון" width={120} height={32}
                   className="h-7 sm:h-8 w-auto object-contain" priority />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link key={l.label} href={l.to}
                    className="text-[15px] font-semibold text-slate-600 hover:text-primary-600 transition-colors">
                {l.label}
              </Link>
            ))}
            <Link href="/products?isKosher=true"
                  className="text-[15px] font-bold px-3 py-1 rounded-lg"
                  style={{ background: '#D1FAE5', color: '#064E3B' }}>
              ✡ מכשירים כשרים
            </Link>
            <Link href="/products?sale=true"
                  className="flex items-center gap-1.5 text-[15px] font-bold text-red-500">
              <Flame className="w-4 h-4 fill-red-500" /> מבצעים
            </Link>
          </div>

          {/* Right: cart + burger */}
          <div className="flex items-center gap-2">
            <Link href="/wishlist" className="p-2">
              <Heart className="w-6 h-6 text-slate-700" />
            </Link>
            <Link href="/cart" className="relative p-2">
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-3 py-3 space-y-1">
          {links.map(l => (
            <Link key={l.label} href={l.to} onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-[14px] font-semibold text-slate-700 hover:bg-slate-50">
              {l.label}
            </Link>
          ))}
          <Link href="/products?isKosher=true" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-[14px] font-bold" style={{ background: '#D1FAE5', color: '#064E3B' }}>
            ✡ מכשירים כשרים
          </Link>
          <Link href="/products?sale=true" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-start gap-2 px-3 py-2.5 rounded-xl text-[14px] font-black text-white"
                style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)' }}>
            <Flame className="w-4 h-4 fill-white" />מבצעים
          </Link>
        </div>
      )}
    </nav>
  )
}
