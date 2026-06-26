'use client'
import { useState, useEffect } from 'react'
import settingsService from '@/services/settingsService'

export default function PromoBanner() {
  const [banner, setBanner] = useState(null)

  useEffect(() => {
    settingsService.get()
      .then(s => { if (s?.promoBanner?.enabled && s.promoBanner.text) setBanner(s.promoBanner.text) })
      .catch(() => {})
  }, [])

  if (!banner) return null

  // On répète le texte pour un défilement continu sans "trou"
  const repeated = Array(6).fill(banner)

  return (
    <div className="promo-banner-wrap">
      <div className="promo-banner-track">
        {repeated.map((t, i) => (
          <span key={i} className="promo-banner-item">
            <span className="promo-banner-spark">✦</span>
            {t}
          </span>
        ))}
        {/* duplication pour boucle infinie fluide */}
        {repeated.map((t, i) => (
          <span key={`dup-${i}`} className="promo-banner-item">
            <span className="promo-banner-spark">✦</span>
            {t}
          </span>
        ))}
      </div>

      <style jsx>{`
        .promo-banner-wrap {
          width: 100%;
          overflow: hidden;
          background: linear-gradient(90deg, #FF6B6B, #FFA94D, #FFD43B, #FFA94D, #FF6B6B);
          background-size: 200% 100%;
          animation: promo-bg 8s linear infinite;
          padding: 8px 0;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .promo-banner-track {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          /* En RTL, le contenu défile naturellement ; l'animation le déplace vers la gauche */
          animation: promo-scroll 24s linear infinite;
        }
        .promo-banner-item {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 28px;
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          text-shadow: 0 1px 3px rgba(0,0,0,0.25);
          letter-spacing: 0.3px;
        }
        .promo-banner-spark {
          font-size: 12px;
          opacity: 0.9;
        }
        @keyframes promo-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes promo-bg {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        /* Pause au survol pour lisibilité */
        .promo-banner-wrap:hover .promo-banner-track {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}