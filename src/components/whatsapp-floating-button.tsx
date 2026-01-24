/**
 * WhatsApp Floating Button - Botão flutuante para comunicação via WhatsApp
 *
 * Features:
 * - Abre chat direto com o WhatsApp da Vínculo Brasil
 * - Opções de departamentos para direcionamento
 * - Webchat integrado como alternativa
 * - Animação de pulsação para chamar atenção
 */

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  MessageCircle,
  X,
  Send,
  Building2,
  CreditCard,
  HelpCircle,
  Home,
  Users,
  Headphones,
  ChevronRight,
  Phone,
  Clock,
  CheckCircle,
} from 'lucide-react';

// Número do WhatsApp da Vínculo Brasil (formato internacional sem +)
const VINCULO_WHATSAPP_NUMBER = '5511999999999'; // Substituir pelo número real

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  whatsappMessage: string;
  available: boolean;
  waitTime?: string;
}

const defaultDepartments: Department[] = [
  {
    id: 'financeiro',
    name: 'Financeiro',
    description: 'Boletos, pagamentos e cobranças',
    icon: <CreditCard className="h-5 w-5" />,
    whatsappMessage: 'Olá! Preciso de ajuda com o setor *Financeiro*.',
    available: true,
    waitTime: '~2 min',
  },
  {
    id: 'suporte',
    name: 'Suporte Técnico',
    description: 'Problemas com a plataforma',
    icon: <Headphones className="h-5 w-5" />,
    whatsappMessage: 'Olá! Preciso de ajuda com *Suporte Técnico*.',
    available: true,
    waitTime: '~5 min',
  },
  {
    id: 'locacao',
    name: 'Locação',
    description: 'Dúvidas sobre contratos e imóveis',
    icon: <Home className="h-5 w-5" />,
    whatsappMessage: 'Olá! Preciso de ajuda sobre *Locação de Imóveis*.',
    available: true,
    waitTime: '~3 min',
  },
  {
    id: 'garantidores',
    name: 'Garantidores',
    description: 'Investimentos e rendimentos',
    icon: <Users className="h-5 w-5" />,
    whatsappMessage: 'Olá! Preciso de ajuda sobre *Garantidores e Investimentos*.',
    available: true,
    waitTime: '~4 min',
  },
  {
    id: 'comercial',
    name: 'Comercial',
    description: 'Parcerias e imobiliárias',
    icon: <Building2 className="h-5 w-5" />,
    whatsappMessage: 'Olá! Preciso falar com o setor *Comercial*.',
    available: true,
    waitTime: '~3 min',
  },
  {
    id: 'duvidas',
    name: 'Dúvidas Gerais',
    description: 'Outras questões',
    icon: <HelpCircle className="h-5 w-5" />,
    whatsappMessage: 'Olá! Tenho uma dúvida geral.',
    available: true,
    waitTime: '~5 min',
  },
];

interface WhatsAppFloatingButtonProps {
  /** Número do WhatsApp (formato internacional sem +) */
  phoneNumber?: string;
  /** Lista de departamentos disponíveis */
  departments?: Department[];
  /** Posição do botão na tela */
  position?: 'bottom-right' | 'bottom-left';
  /** Mostrar mensagem de boas-vindas ao carregar */
  showWelcomeMessage?: boolean;
  /** Delay para mostrar a mensagem de boas-vindas (ms) */
  welcomeMessageDelay?: number;
  /** Classe CSS adicional */
  className?: string;
  /** Callback quando o usuário clica em um departamento */
  onDepartmentClick?: (department: Department) => void;
}

export function WhatsAppFloatingButton({
  phoneNumber = VINCULO_WHATSAPP_NUMBER,
  departments = defaultDepartments,
  position = 'bottom-right',
  showWelcomeMessage = true,
  welcomeMessageDelay = 3000,
  className,
  onDepartmentClick,
}: WhatsAppFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Mostrar mensagem de boas-vindas após delay
  useEffect(() => {
    if (showWelcomeMessage) {
      const timer = setTimeout(() => {
        if (!isOpen) {
          setShowWelcome(true);
        }
      }, welcomeMessageDelay);

      return () => clearTimeout(timer);
    }
  }, [showWelcomeMessage, welcomeMessageDelay, isOpen]);

  // Esconder mensagem de boas-vindas quando abrir o popover
  useEffect(() => {
    if (isOpen) {
      setShowWelcome(false);
    }
  }, [isOpen]);

  const handleDepartmentClick = (department: Department) => {
    setSelectedDepartment(department);
    onDepartmentClick?.(department);

    // Abrir WhatsApp com mensagem pré-definida
    const encodedMessage = encodeURIComponent(department.whatsappMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    setIsOpen(false);
    setSelectedDepartment(null);
  };

  const handleDirectWhatsApp = () => {
    const defaultMessage = encodeURIComponent('Olá! Preciso de ajuda.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      {/* Mensagem de boas-vindas */}
      {showWelcome && !isOpen && (
        <div className="absolute bottom-20 right-0 w-72 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="bg-white rounded-lg shadow-lg border p-4 relative">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">Vínculo Brasil</p>
                <p className="text-sm text-gray-600 mt-1">
                  Olá! Precisa de ajuda? Estamos online para atendê-lo.
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Online agora
                </div>
              </div>
            </div>
            {/* Triângulo apontando para o botão */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b transform rotate-45" />
          </div>
        </div>
      )}

      {/* Popover de seleção de departamentos */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "h-16 w-16 rounded-full shadow-2xl transition-all duration-300",
              "bg-green-500 hover:bg-green-600 hover:scale-110",
              "animate-in zoom-in duration-300",
              isOpen && "rotate-90"
            )}
          >
            {isOpen ? (
              <X className="h-7 w-7 text-white" />
            ) : (
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-white fill-current"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {/* Indicador de online */}
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-400 border-2 border-white" />
                </span>
              </div>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-80 p-0 mr-2 mb-2"
          side="top"
          align="end"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Vínculo Brasil</h3>
                <p className="text-sm text-green-100">Central de Atendimento</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Atendimento 24h via WhatsApp</span>
            </div>
          </div>

          {/* Departamentos */}
          <div className="p-2">
            <p className="text-xs text-muted-foreground px-2 py-1">
              Selecione o departamento:
            </p>
            <div className="space-y-1">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => handleDepartmentClick(dept)}
                  disabled={!dept.available}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                    "hover:bg-green-50 text-left",
                    !dept.available && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "bg-green-100 text-green-600"
                  )}>
                    {dept.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{dept.name}</p>
                      {dept.available ? (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                          <Clock className="h-3 w-3 mr-1" />
                          {dept.waitTime}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Offline</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {dept.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-3">
            <Button
              onClick={handleDirectWhatsApp}
              variant="outline"
              className="w-full text-green-600 border-green-200 hover:bg-green-50"
            >
              <Phone className="h-4 w-4 mr-2" />
              Ligar para Central: (11) 9999-9999
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Texto "Fale Conosco" */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="absolute -left-24 bottom-5 bg-white rounded-full shadow-lg px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors animate-in slide-in-from-right-2 duration-300"
        >
          <span className="text-sm font-medium text-gray-700">Fale Conosco</span>
        </div>
      )}
    </div>
  );
}

export default WhatsAppFloatingButton;
