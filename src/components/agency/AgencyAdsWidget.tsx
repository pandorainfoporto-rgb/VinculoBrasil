// ============================================
// AGENCY OS - Native Ads Widget
// ============================================
// Exibe ofertas de parceiros e upsell de forma elegante

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Rocket,
  ShieldCheck,
  Zap,
  TrendingUp,
  Crown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// ============================================
// TIPOS
// ============================================

interface Ad {
  id: number
  title: string
  description: string
  icon: React.ElementType
  gradient: string
  action: string
  cta: string
  badge?: string
}

// ============================================
// DADOS DOS ADS
// ============================================

const ADS_DATA: Ad[] = [
  {
    id: 1,
    title: 'Impulsione Imoveis',
    description: 'Aumente visitas em 5x! Destaque no topo das buscas.',
    icon: Rocket,
    gradient: 'from-purple-500 via-purple-600 to-indigo-700',
    action: '/agency/ads',
    cta: 'Impulsionar',
    badge: 'Novo',
  },
  {
    id: 2,
    title: 'CredPago Garantia',
    description: 'Parceria exclusiva: ganhe comissao em cada contrato.',
    icon: ShieldCheck,
    gradient: 'from-emerald-500 via-emerald-600 to-teal-700',
    action: '/agency/partners/credpago',
    cta: 'Ativar',
  },
  {
    id: 3,
    title: 'Seguro Fianca',
    description: 'Aprovacao em 1 minuto. Sem burocracia.',
    icon: Crown,
    gradient: 'from-amber-500 via-orange-500 to-red-600',
    action: '/agency/insurance',
    cta: 'Conhecer',
  },
  {
    id: 4,
    title: 'Vistoria Express',
    description: 'Desconto de 30% em vistorias terceirizadas hoje!',
    icon: Zap,
    gradient: 'from-cyan-500 via-blue-500 to-blue-700',
    action: '/agency/services/inspection',
    cta: 'Aproveitar',
    badge: 'Oferta',
  },
  {
    id: 5,
    title: 'Plano Premium',
    description: 'Desbloqueie recursos avancados para sua agencia.',
    icon: TrendingUp,
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    action: '/agency/upgrade',
    cta: 'Upgrade',
  },
]

// ============================================
// COMPONENTE PRINCIPAL - DESKTOP
// ============================================

interface AgencyAdsWidgetProps {
  collapsed?: boolean
  variant?: 'sidebar' | 'mobile' | 'inline'
  className?: string
}

export function AgencyAdsWidget({
  collapsed = false,
  variant = 'sidebar',
  className,
}: AgencyAdsWidgetProps) {
  const [currentAd, setCurrentAd] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Rotacao automatica a cada 8 segundos
  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ADS_DATA.length)
    }, 8000)

    return () => clearInterval(timer)
  }, [isPaused])

  const ad = ADS_DATA[currentAd]
  const IconComponent = ad.icon

  // Navegacao manual
  const goToAd = (index: number) => {
    setCurrentAd(index)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 15000) // Pausa por 15s apos click manual
  }

  const nextAd = () => goToAd((currentAd + 1) % ADS_DATA.length)
  const prevAd = () => goToAd((currentAd - 1 + ADS_DATA.length) % ADS_DATA.length)

  // Versao colapsada (apenas icone)
  if (collapsed && variant === 'sidebar') {
    return (
      <div className={cn('px-2 py-3', className)}>
        <a
          href={ad.action}
          className={cn(
            'flex items-center justify-center w-full h-10 rounded-lg',
            'bg-gradient-to-br transition-all duration-300 hover:scale-105',
            ad.gradient
          )}
          title={ad.title}
        >
          <IconComponent className="h-5 w-5 text-white" />
        </a>
      </div>
    )
  }

  // Versao mobile inline (horizontal compacto)
  if (variant === 'mobile') {
    return (
      <div
        className={cn(
          'mx-4 my-3 rounded-xl overflow-hidden',
          'bg-gradient-to-r shadow-lg',
          ad.gradient,
          className
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <a href={ad.action} className="block p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg shrink-0">
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white truncate">{ad.title}</h4>
                {ad.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/30 rounded text-white">
                    {ad.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80 truncate">{ad.description}</p>
            </div>
            <Button
              size="sm"
              className="shrink-0 h-7 px-3 text-xs font-semibold bg-white/90 text-zinc-900 hover:bg-white"
            >
              {ad.cta}
            </Button>
          </div>
        </a>

        {/* Indicadores */}
        <div className="flex justify-center gap-1 pb-2">
          {ADS_DATA.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault()
                goToAd(idx)
              }}
              className={cn(
                'h-1 rounded-full transition-all',
                idx === currentAd ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
              )}
            />
          ))}
        </div>
      </div>
    )
  }

  // Versao sidebar (vertical compacto)
  return (
    <div
      className={cn('p-3', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl',
          'bg-gradient-to-br shadow-lg',
          'transition-all duration-500',
          ad.gradient
        )}
      >
        {/* Efeito de brilho */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-16 w-16 rounded-full bg-black/20 blur-2xl" />

        {/* Conteudo */}
        <a href={ad.action} className="relative z-10 block p-4">
          {/* Header com icone e badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <IconComponent className="h-4 w-4 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Patrocinado
              </span>
            </div>
            {ad.badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-white/30 rounded-full text-white animate-pulse">
                {ad.badge}
              </span>
            )}
          </div>

          {/* Titulo e descricao */}
          <h4 className="text-sm font-bold text-white leading-tight mb-1">{ad.title}</h4>
          <p className="text-xs text-white/80 line-clamp-2 mb-3">{ad.description}</p>

          {/* CTA Button */}
          <Button
            size="sm"
            className="w-full h-8 text-xs font-semibold bg-white/90 text-zinc-900 hover:bg-white transition-colors"
          >
            {ad.cta}
          </Button>
        </a>

        {/* Navegacao e indicadores */}
        <div className="relative z-10 flex items-center justify-between px-4 pb-3">
          {/* Setas de navegacao */}
          <button
            onClick={(e) => {
              e.preventDefault()
              prevAd()
            }}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="h-3 w-3 text-white" />
          </button>

          {/* Indicadores de slide */}
          <div className="flex items-center gap-1">
            {ADS_DATA.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault()
                  goToAd(idx)
                }}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  idx === currentAd ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                )}
              />
            ))}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault()
              nextAd()
            }}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="h-3 w-3 text-white" />
          </button>
        </div>
      </div>

      {/* Contador discreto */}
      <p className="text-center text-[10px] text-zinc-600 mt-2">
        {currentAd + 1} / {ADS_DATA.length}
      </p>
    </div>
  )
}

export default AgencyAdsWidget
