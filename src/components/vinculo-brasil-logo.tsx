/**
 * Vinculo Brasil - Logo Component
 *
 * Logo oficial do Vinculo Brasil.
 * Design geométrico inspirado na Polygon com casa integrada.
 * Cores: Verde e Amarelo (identidade brasileira)
 */

import { cn } from '@/lib/utils';

interface VinculoBrasilLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  /** Usa cores claras para fundos escuros/coloridos */
  lightMode?: boolean;
}

const sizeClasses = {
  sm: { icon: 'h-8 w-8', text: 'text-lg', tagline: 'text-[8px]' },
  md: { icon: 'h-10 w-10', text: 'text-xl', tagline: 'text-[9px]' },
  lg: { icon: 'h-12 w-12', text: 'text-2xl', tagline: 'text-[10px]' },
  xl: { icon: 'h-16 w-16', text: 'text-3xl', tagline: 'text-xs' },
};

/**
 * VinculoIcon - Ícone geométrico estilo Polygon com casa
 * Hexágono com casa integrada - representa tecnologia + moradia
 */
function VinculoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexágono externo - estilo Polygon */}
      <polygon
        points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
        fill="url(#hexGradient)"
        stroke="url(#strokeGradient)"
        strokeWidth="3"
      />

      {/* Casa estilizada dentro do hexágono */}
      {/* Telhado da casa - triângulo */}
      <polygon
        points="50,22 75,42 25,42"
        fill="#FFFFFF"
      />

      {/* Corpo da casa - retângulo */}
      <rect
        x="30"
        y="42"
        width="40"
        height="32"
        fill="#FFFFFF"
      />

      {/* Porta */}
      <rect
        x="44"
        y="52"
        width="12"
        height="22"
        fill="url(#doorGradient)"
        rx="1"
      />

      {/* Janela esquerda */}
      <rect
        x="33"
        y="48"
        width="8"
        height="8"
        fill="url(#windowGradient)"
        rx="1"
      />

      {/* Janela direita */}
      <rect
        x="59"
        y="48"
        width="8"
        height="8"
        fill="url(#windowGradient)"
        rx="1"
      />

      {/* Chaminé */}
      <rect
        x="60"
        y="26"
        width="6"
        height="12"
        fill="#FFFFFF"
      />

      {/* Gradientes */}
      <defs>
        {/* Gradiente do hexágono - verde para amarelo */}
        <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="50%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        {/* Gradiente do stroke */}
        <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Gradiente da porta */}
        <linearGradient id="doorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        {/* Gradiente das janelas */}
        <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * VinculoBrasilLogo Component
 *
 * Exibe o logo completo do Vinculo Brasil.
 * Design: Hexágono geométrico (estilo Polygon) + Casa + Cores BR
 */
export function VinculoBrasilLogo({
  className,
  showText = true,
  size = 'md',
  variant = 'full',
  lightMode = false,
}: VinculoBrasilLogoProps) {
  const sizes = sizeClasses[size];

  // Cores para modo claro (fundos escuros/coloridos)
  const textColorVinculo = lightMode ? 'text-white' : 'text-green-600';
  const textColorBrasil = lightMode ? 'text-yellow-300' : 'text-yellow-500';
  const taglineColor = lightMode ? 'text-white/70' : 'text-gray-500';

  if (variant === 'icon') {
    return <VinculoIcon className={cn(sizes.icon, className)} />;
  }

  if (variant === 'text') {
    return (
      <div className={cn('flex flex-col', className)}>
        <span className={cn('font-black tracking-tight leading-tight', sizes.text)}>
          <span className={textColorVinculo}>Vinculo</span>
          <span className={textColorBrasil}>Brasil</span>
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <VinculoIcon className={sizes.icon} />
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-black tracking-tight leading-tight', sizes.text)}>
            <span className={textColorVinculo}>Vinculo</span>
            <span className={textColorBrasil}>Brasil</span>
          </span>
          <span className={cn('leading-tight', taglineColor, sizes.tagline)}>
            A locação inteligente
          </span>
        </div>
      )}
    </div>
  );
}

export default VinculoBrasilLogo;
