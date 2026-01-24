// ============================================
// SupportWidget - Widget Flutuante de Suporte
// Suporte Tecnico Oficial - Fatto Tecnologia
// ============================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Headphones,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  ExternalLink,
  X,
  ChevronUp,
  HelpCircle,
  FileText,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Configuracao do suporte
const SUPPORT_CONFIG = {
  whatsappNumber: '5511999990000',
  whatsappMessage: 'Ola! Preciso de suporte tecnico para o Vinculo Brasil.',
  email: 'suporte@fattotecnologia.com.br',
  phone: '+55 (11) 99999-0000',
  horario: 'Seg-Sex, 9h-18h',
  company: 'FATTO Tecnologia',
};

interface SupportWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
  showLabel?: boolean;
}

export function SupportWidget({
  position = 'bottom-right',
  showLabel = false,
}: SupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const whatsappUrl = `https://wa.me/${SUPPORT_CONFIG.whatsappNumber}?text=${encodeURIComponent(SUPPORT_CONFIG.whatsappMessage)}`;

  const positionClasses = {
    'bottom-right': 'right-4 bottom-4',
    'bottom-left': 'left-4 bottom-4',
  };

  return (
    <>
      {/* Widget Flutuante */}
      <div className={cn('fixed z-50', positionClasses[position])}>
        {/* Menu Expandido */}
        {isExpanded && (
          <div className="mb-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 w-72 animate-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">F</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Suporte Tecnico</p>
                  <p className="text-xs text-zinc-400">{SUPPORT_CONFIG.company}</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Separator className="bg-zinc-800 mb-3" />

            {/* Status Online */}
            <div className="flex items-center gap-2 mb-4 p-2 bg-green-900/20 rounded-lg border border-green-800/30">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400">Online agora</span>
              <span className="text-xs text-zinc-500 ml-auto">
                <Clock className="h-3 w-3 inline mr-1" />
                {SUPPORT_CONFIG.horario}
              </span>
            </div>

            {/* Opcoes de Contato */}
            <div className="space-y-2">
              {/* WhatsApp - Principal */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors group"
              >
                <MessageCircle className="h-5 w-5 text-white" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">WhatsApp</p>
                  <p className="text-xs text-green-100">Atendimento imediato</p>
                </div>
                <ExternalLink className="h-4 w-4 text-white/70 group-hover:text-white" />
              </a>

              {/* Email */}
              <a
                href={`mailto:${SUPPORT_CONFIG.email}?subject=Suporte%20Vinculo%20Brasil`}
                className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors group"
              >
                <Mail className="h-5 w-5 text-zinc-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">E-mail</p>
                  <p className="text-xs text-zinc-400">{SUPPORT_CONFIG.email}</p>
                </div>
              </a>

              {/* Telefone */}
              <a
                href={`tel:${SUPPORT_CONFIG.phone.replace(/\D/g, '')}`}
                className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors group"
              >
                <Phone className="h-5 w-5 text-zinc-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Telefone</p>
                  <p className="text-xs text-zinc-400">{SUPPORT_CONFIG.phone}</p>
                </div>
              </a>
            </div>

            <Separator className="bg-zinc-800 my-3" />

            {/* Links Rapidos */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/admin/help"
                className="flex items-center gap-2 p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                Central de Ajuda
              </a>
              <a
                href="/admin/docs"
                className="flex items-center gap-2 p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Documentacao
              </a>
            </div>
          </div>
        )}

        {/* Botao Principal */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-full shadow-lg shadow-green-500/30 transition-all duration-200',
            showLabel ? 'px-4 py-3' : 'p-4',
            isExpanded && 'ring-2 ring-green-400/50'
          )}
        >
          {isExpanded ? (
            <ChevronUp className="h-6 w-6" />
          ) : (
            <Headphones className="h-6 w-6" />
          )}
          {showLabel && (
            <span className="text-sm font-medium">Suporte</span>
          )}
        </button>
      </div>
    </>
  );
}

// ============================================
// SupportBanner - Banner de Suporte para Header
// ============================================

export function SupportBanner() {
  const whatsappUrl = `https://wa.me/${SUPPORT_CONFIG.whatsappNumber}?text=${encodeURIComponent(SUPPORT_CONFIG.whatsappMessage)}`;

  return (
    <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-zinc-700 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Headphones className="h-4 w-4 text-green-500" />
          <span className="text-zinc-400">
            Suporte Tecnico Oficial -
          </span>
          <span className="text-white font-medium">{SUPPORT_CONFIG.company}</span>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Falar via WhatsApp</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

// ============================================
// SupportCard - Card de Suporte para Paginas
// ============================================

export function SupportCard() {
  const whatsappUrl = `https://wa.me/${SUPPORT_CONFIG.whatsappNumber}?text=${encodeURIComponent(SUPPORT_CONFIG.whatsappMessage)}`;

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Headphones className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Suporte Tecnico Oficial
            <Badge className="bg-green-600 text-xs">Online</Badge>
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            {SUPPORT_CONFIG.company} - Atendimento especializado para o Vinculo Brasil
          </p>

          <div className="flex items-center gap-4 mt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={`mailto:${SUPPORT_CONFIG.email}`}
              className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Mail className="h-4 w-4" />
              E-mail
            </a>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {SUPPORT_CONFIG.horario}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {SUPPORT_CONFIG.phone}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportWidget;
