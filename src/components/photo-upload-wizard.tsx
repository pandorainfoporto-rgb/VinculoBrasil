/**
 * Wizard de Upload de Fotos para Imoveis
 *
 * Funcionalidades:
 * - Passo-a-passo guiado para desktop
 * - Captura de camera para mobile
 * - IA para deteccao de melhor cenario/qualidade
 * - Suporte a diferentes tipos de ambientes
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Camera,
  Upload,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lightbulb,
  Smartphone,
  Monitor,
  Home,
  Bath,
  Bed,
  UtensilsCrossed,
  Sofa,
  Car,
  Trees,
  Building2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Image,
  RefreshCw,
  FileText,
  Droplets,
  Waves,
  Flame,
  Leaf,
} from 'lucide-react';

// Tipos de ambientes do imovel
export interface RoomType {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  tips: string[];
  minPhotos: number;
  maxPhotos: number;
}

// Foto capturada
export interface CapturedPhoto {
  id: string;
  file: File;
  preview: string;
  roomType: string;
  aiScore?: number;
  aiSuggestions?: string[];
  isAnalyzing?: boolean;
}

// Estrutura de cômodos do imóvel (espelhada do landlord-dashboard)
export interface PropertyRooms {
  salas: number;
  quartos: number;
  suites: number;
  banheiros: number;
  lavabos: number;
  cozinhas: number;
  areasServico: number;
  varandas: number;
  escritorios: number;
  despensas: number;
  garagens: number;
  jardins: number;
  piscinas: number;
  churrasqueiras: number;
}

// Configuracao do wizard
export interface PhotoWizardConfig {
  propertyId: string;
  propertyName: string;
  onComplete: (photos: CapturedPhoto[]) => void;
  onCancel: () => void;
  rooms?: PropertyRooms; // Cômodos do imóvel para gerar passos dinâmicos
}

// Tipos de ambientes disponiveis
const ROOM_TYPES: RoomType[] = [
  {
    id: 'facade',
    name: 'Fachada',
    icon: Building2,
    description: 'Foto externa do imovel',
    tips: [
      'Fotografe de dia, com boa iluminacao',
      'Inclua a entrada principal',
      'Se possivel, mostre o numero do imovel',
    ],
    minPhotos: 1,
    maxPhotos: 3,
  },
  {
    id: 'living',
    name: 'Sala de Estar',
    icon: Sofa,
    description: 'Ambiente principal de convivencia',
    tips: [
      'Fotografe de um canto para capturar todo o ambiente',
      'Acenda todas as luzes',
      'Abra cortinas para luz natural',
    ],
    minPhotos: 1,
    maxPhotos: 4,
  },
  {
    id: 'bedroom',
    name: 'Quarto',
    icon: Bed,
    description: 'Quartos e dormitorios',
    tips: [
      'Mostre a cama e o espaco disponivel',
      'Inclua armarios se houver',
      'Fotografe da porta olhando para dentro',
    ],
    minPhotos: 1,
    maxPhotos: 4,
  },
  {
    id: 'kitchen',
    name: 'Cozinha',
    icon: UtensilsCrossed,
    description: 'Cozinha e area de refeicoes',
    tips: [
      'Mostre bancada e eletrodomesticos',
      'Fotografe de angulo que mostre todo o espaco',
      'Certifique-se que esta limpa e organizada',
    ],
    minPhotos: 1,
    maxPhotos: 3,
  },
  {
    id: 'bathroom',
    name: 'Banheiro',
    icon: Bath,
    description: 'Banheiros e lavabos',
    tips: [
      'Mostre pia, vaso e box/banheira',
      'Use flash se necessario',
      'Certifique-se que esta limpo',
    ],
    minPhotos: 1,
    maxPhotos: 3,
  },
  {
    id: 'garage',
    name: 'Garagem/Vaga',
    icon: Car,
    description: 'Area de estacionamento',
    tips: [
      'Mostre o espaco disponivel',
      'Indique se e coberta',
      'Se possivel, mostre a numeracao',
    ],
    minPhotos: 0,
    maxPhotos: 2,
  },
  {
    id: 'outdoor',
    name: 'Area Externa',
    icon: Trees,
    description: 'Varanda, quintal, churrasqueira',
    tips: [
      'Fotografe de dia para melhor iluminacao',
      'Mostre toda a area disponivel',
      'Inclua detalhes como churrasqueira, piscina',
    ],
    minPhotos: 0,
    maxPhotos: 4,
  },
  {
    id: 'other',
    name: 'Outros',
    icon: Home,
    description: 'Lavanderia, escritorio, deposito',
    tips: [
      'Fotografe areas adicionais relevantes',
      'Mostre diferenciais do imovel',
      'Inclua despensa, home office, etc',
    ],
    minPhotos: 0,
    maxPhotos: 4,
  },
];

// Definições de cômodos para geração dinâmica
const ROOM_DEFINITIONS: Record<string, { icon: React.ElementType; name: string; namePlural: string; description: string; tips: string[] }> = {
  salas: {
    icon: Sofa,
    name: 'Sala',
    namePlural: 'Salas',
    description: 'Ambiente de convivencia',
    tips: ['Fotografe de um canto para capturar todo o ambiente', 'Acenda todas as luzes', 'Abra cortinas para luz natural'],
  },
  quartos: {
    icon: Bed,
    name: 'Quarto',
    namePlural: 'Quartos',
    description: 'Dormitorio',
    tips: ['Mostre a cama e o espaco disponivel', 'Inclua armarios se houver', 'Fotografe da porta olhando para dentro'],
  },
  suites: {
    icon: Sparkles,
    name: 'Suite',
    namePlural: 'Suites',
    description: 'Quarto com banheiro privativo',
    tips: ['Fotografe o quarto e o banheiro separadamente', 'Destaque o espaco do closet se houver', 'Mostre a vista se for diferenciada'],
  },
  banheiros: {
    icon: Bath,
    name: 'Banheiro',
    namePlural: 'Banheiros',
    description: 'Banheiro completo',
    tips: ['Mostre pia, vaso e box/banheira', 'Use flash se necessario', 'Certifique-se que esta limpo'],
  },
  lavabos: {
    icon: Droplets,
    name: 'Lavabo',
    namePlural: 'Lavabos',
    description: 'Banheiro social',
    tips: ['Mostre pia e vaso', 'Destaque a decoracao', 'Fotografe de angulo que mostre todo o espaco'],
  },
  cozinhas: {
    icon: UtensilsCrossed,
    name: 'Cozinha',
    namePlural: 'Cozinhas',
    description: 'Area de preparacao de alimentos',
    tips: ['Mostre bancada e eletrodomesticos', 'Fotografe de angulo que mostre todo o espaco', 'Certifique-se que esta limpa e organizada'],
  },
  areasServico: {
    icon: Home,
    name: 'Area de Servico',
    namePlural: 'Areas de Servico',
    description: 'Lavanderia e utilidades',
    tips: ['Mostre tanque e espaco para maquinas', 'Fotografe de forma organizada', 'Inclua varais se houver'],
  },
  varandas: {
    icon: Leaf,
    name: 'Varanda',
    namePlural: 'Varandas',
    description: 'Area externa coberta',
    tips: ['Fotografe de dia para melhor iluminacao', 'Mostre a vista se for diferenciada', 'Inclua mobiliario se houver'],
  },
  escritorios: {
    icon: FileText,
    name: 'Escritorio',
    namePlural: 'Escritorios',
    description: 'Home office',
    tips: ['Mostre o espaco de trabalho', 'Destaque iluminacao natural', 'Fotografe de angulo amplo'],
  },
  despensas: {
    icon: Home,
    name: 'Despensa',
    namePlural: 'Despensas',
    description: 'Area de armazenamento',
    tips: ['Mostre as prateleiras e espaco', 'Fotografe organizado', 'Destaque a capacidade'],
  },
  garagens: {
    icon: Car,
    name: 'Garagem',
    namePlural: 'Garagens',
    description: 'Vaga de estacionamento',
    tips: ['Mostre o espaco disponivel', 'Indique se e coberta', 'Se possivel, mostre a numeracao'],
  },
  jardins: {
    icon: Trees,
    name: 'Jardim',
    namePlural: 'Jardins',
    description: 'Area verde',
    tips: ['Fotografe de dia', 'Mostre toda a extensao', 'Inclua plantas e paisagismo'],
  },
  piscinas: {
    icon: Waves,
    name: 'Piscina',
    namePlural: 'Piscinas',
    description: 'Area de lazer aquatica',
    tips: ['Fotografe de dia com agua limpa', 'Mostre area ao redor', 'Inclua deck se houver'],
  },
  churrasqueiras: {
    icon: Flame,
    name: 'Churrasqueira',
    namePlural: 'Churrasqueiras',
    description: 'Area gourmet',
    tips: ['Mostre a churrasqueira e area de apoio', 'Inclua balcao e pias', 'Fotografe de angulo que mostre todo o espaco'],
  },
};

// Gera lista de cômodos dinâmica baseada nos cômodos do imóvel
function generateDynamicRoomTypes(rooms?: PropertyRooms): RoomType[] {
  // Sempre começa com fachada
  const dynamicRooms: RoomType[] = [
    {
      id: 'facade',
      name: 'Fachada',
      icon: Building2,
      description: 'Foto externa do imovel',
      tips: ['Fotografe de dia, com boa iluminacao', 'Inclua a entrada principal', 'Se possivel, mostre o numero do imovel'],
      minPhotos: 1,
      maxPhotos: 3,
    },
  ];

  if (!rooms) {
    // Se não tem cômodos definidos, usa os tipos padrão
    return ROOM_TYPES;
  }

  // Adiciona cada tipo de cômodo baseado na quantidade
  const roomOrder: (keyof PropertyRooms)[] = [
    'salas', 'quartos', 'suites', 'banheiros', 'lavabos', 'cozinhas',
    'areasServico', 'escritorios', 'despensas', 'varandas', 'garagens',
    'jardins', 'piscinas', 'churrasqueiras'
  ];

  for (const roomKey of roomOrder) {
    const count = rooms[roomKey];
    if (count > 0) {
      const def = ROOM_DEFINITIONS[roomKey];
      if (!def) continue;

      // Se tem mais de um, cria entradas individuais
      if (count > 1) {
        for (let i = 1; i <= count; i++) {
          dynamicRooms.push({
            id: `${roomKey}_${i}`,
            name: `${def.name} ${i}`,
            icon: def.icon,
            description: `${def.description} - ${i} de ${count}`,
            tips: def.tips,
            minPhotos: 1,
            maxPhotos: 3,
          });
        }
      } else {
        dynamicRooms.push({
          id: roomKey,
          name: def.name,
          icon: def.icon,
          description: def.description,
          tips: def.tips,
          minPhotos: 1,
          maxPhotos: 3,
        });
      }
    }
  }

  return dynamicRooms;
}

// Detecta se e dispositivo mobile
const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Simula analise de IA da foto
const analyzePhotoWithAI = async (photo: CapturedPhoto): Promise<{ score: number; suggestions: string[] }> => {
  // Simula delay de processamento de IA
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Gera score aleatorio mas tendendo para bom (simulacao)
  const score = Math.floor(70 + Math.random() * 30);

  // Sugestoes baseadas no score
  const suggestions: string[] = [];

  if (score < 75) {
    suggestions.push('Tente melhorar a iluminacao');
    suggestions.push('A foto pode estar desfocada');
  } else if (score < 85) {
    suggestions.push('Boa foto! Considere um angulo mais amplo');
  } else if (score < 95) {
    suggestions.push('Excelente qualidade!');
  } else {
    suggestions.push('Foto perfeita! Otima composicao');
  }

  return { score, suggestions };
};

interface PhotoUploadWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PhotoWizardConfig;
}

export function PhotoUploadWizard({ open, onOpenChange, config }: PhotoUploadWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gera lista de cômodos dinâmica baseada nos cômodos do imóvel
  const roomTypes = useMemo(() => generateDynamicRoomTypes(config.rooms), [config.rooms]);

  const currentRoom = roomTypes[currentStep];
  const currentRoomPhotos = photos.filter(p => p.roomType === currentRoom?.id);
  const totalMinPhotos = roomTypes.reduce((sum, r) => sum + r.minPhotos, 0);
  const currentMinMet = roomTypes.slice(0, currentStep + 1).every(room => {
    const roomPhotos = photos.filter(p => p.roomType === room.id);
    return roomPhotos.length >= room.minPhotos;
  });

  const deviceIsMobile = isMobile();

  // Limpa a camera ao fechar
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Inicia a camera (para mobile)
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Erro ao acessar camera:', error);
      setCameraError('Nao foi possivel acessar a camera. Verifique as permissoes.');
    }
  }, []);

  // Para a camera
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCapturing(false);
  }, [cameraStream]);

  // Captura foto da camera
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !currentRoom) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], `${currentRoom.id}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const preview = canvas.toDataURL('image/jpeg', 0.8);

      const newPhoto: CapturedPhoto = {
        id: `photo_${Date.now()}`,
        file,
        preview,
        roomType: currentRoom.id,
        isAnalyzing: true,
      };

      setPhotos(prev => [...prev, newPhoto]);

      // Analisa com IA
      const analysis = await analyzePhotoWithAI(newPhoto);
      setPhotos(prev => prev.map(p =>
        p.id === newPhoto.id
          ? { ...p, aiScore: analysis.score, aiSuggestions: analysis.suggestions, isAnalyzing: false }
          : p
      ));
    }, 'image/jpeg', 0.8);
  }, [currentRoom]);

  // Upload de arquivo (desktop)
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!currentRoom || files.length === 0) return;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const preview = e.target?.result as string;
        const newPhoto: CapturedPhoto = {
          id: `photo_${Date.now()}_${Math.random()}`,
          file,
          preview,
          roomType: currentRoom.id,
          isAnalyzing: true,
        };

        setPhotos(prev => [...prev, newPhoto]);

        // Analisa com IA
        const analysis = await analyzePhotoWithAI(newPhoto);
        setPhotos(prev => prev.map(p =>
          p.id === newPhoto.id
            ? { ...p, aiScore: analysis.score, aiSuggestions: analysis.suggestions, isAnalyzing: false }
            : p
        ));
      };
      reader.readAsDataURL(file);
    }

    // Limpa o input
    event.target.value = '';
  }, [currentRoom]);

  // Remove foto
  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  }, []);

  // Avanca para proximo passo
  const nextStep = useCallback(() => {
    stopCamera();
    if (currentStep < roomTypes.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, stopCamera, roomTypes.length]);

  // Volta para passo anterior
  const prevStep = useCallback(() => {
    stopCamera();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, stopCamera]);

  // Conclui o wizard
  const handleComplete = useCallback(() => {
    stopCamera();
    config.onComplete(photos);
    onOpenChange(false);
  }, [photos, config, onOpenChange, stopCamera]);

  // Cancela o wizard
  const handleCancel = useCallback(() => {
    stopCamera();
    config.onCancel();
    onOpenChange(false);
  }, [config, onOpenChange, stopCamera]);

  // Renderiza score de IA
  const renderAIScore = (score: number) => {
    if (score >= 90) {
      return <Badge className="bg-emerald-500">Excelente ({score}%)</Badge>;
    } else if (score >= 75) {
      return <Badge className="bg-blue-500">Boa ({score}%)</Badge>;
    } else if (score >= 60) {
      return <Badge className="bg-amber-500">Regular ({score}%)</Badge>;
    } else {
      return <Badge className="bg-red-500">Refazer ({score}%)</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-indigo-600" />
            Upload de Fotos - {config.propertyName}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {deviceIsMobile ? (
              <>
                <Smartphone className="h-4 w-4" />
                Use a camera do seu celular para fotografar
              </>
            ) : (
              <>
                <Monitor className="h-4 w-4" />
                Selecione as fotos do seu computador
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="px-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">{currentRoom?.name}</span>
            <span className="text-muted-foreground">
              Passo {currentStep + 1} de {roomTypes.length}
            </span>
          </div>
          <Progress value={((currentStep + 1) / roomTypes.length) * 100} className="h-2" />

          {/* Room Icons */}
          <div className="flex flex-wrap gap-1 mt-3">
            {roomTypes.map((room, index) => {
              const RoomIcon = room.icon;
              const roomPhotos = photos.filter(p => p.roomType === room.id);
              const isComplete = roomPhotos.length >= room.minPhotos;
              const isCurrent = index === currentStep;

              return (
                <button
                  key={room.id}
                  onClick={() => {
                    stopCamera();
                    setCurrentStep(index);
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600'
                      : isComplete
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                  title={room.name}
                >
                  <RoomIcon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Room Info */}
          <Card className="bg-indigo-50 dark:bg-indigo-950 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
                  {currentRoom && <currentRoom.icon className="h-6 w-6 text-indigo-600" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">
                    {currentRoom?.name}
                  </h3>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    {currentRoom?.description}
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {currentRoom?.minPhotos === 0
                        ? 'Opcional'
                        : `Minimo ${currentRoom?.minPhotos} foto(s)`}
                      {' | '}
                      Maximo {currentRoom?.maxPhotos} fotos
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Alert className="bg-amber-50 border-amber-200">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Dicas para {currentRoom?.name}:</strong>
              <ul className="list-disc list-inside mt-1 text-sm">
                {currentRoom?.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Camera/Upload Area */}
          {isCapturing ? (
            /* Camera View */
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full"
                  onClick={stopCamera}
                >
                  <X className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  className="rounded-full bg-white text-black hover:bg-gray-100 w-16 h-16"
                  onClick={capturePhoto}
                >
                  <Camera className="h-8 w-8" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full"
                  onClick={capturePhoto}
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>

              {/* AI Indicator */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-purple-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA Ativa
                </Badge>
              </div>
            </div>
          ) : (
            /* Upload Area */
            <div className="space-y-4">
              {cameraError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                {deviceIsMobile && (
                  <Button
                    variant="outline"
                    className="flex-1 h-24 flex-col gap-2"
                    onClick={startCamera}
                  >
                    <Camera className="h-8 w-8 text-indigo-600" />
                    <span>Abrir Camera</span>
                  </Button>
                )}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture={deviceIsMobile ? 'environment' : undefined}
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />

                <Button
                  variant="outline"
                  className="flex-1 h-24 flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-indigo-600" />
                  <span>{deviceIsMobile ? 'Galeria' : 'Selecionar Arquivos'}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Photos Grid */}
          {currentRoomPhotos.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Image className="h-4 w-4" />
                Fotos de {currentRoom?.name} ({currentRoomPhotos.length}/{currentRoom?.maxPhotos})
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentRoomPhotos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden">
                    <div className="relative aspect-video">
                      <img
                        src={photo.preview}
                        alt="Foto do ambiente"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      {/* AI Analysis Overlay */}
                      {photo.isAnalyzing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p className="text-sm">Analisando com IA...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3">
                      {photo.aiScore !== undefined ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-purple-600" />
                              <span className="text-xs text-muted-foreground">IA Score</span>
                            </div>
                            {renderAIScore(photo.aiScore)}
                          </div>
                          {photo.aiSuggestions && photo.aiSuggestions.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {photo.aiSuggestions[0]}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Processando...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Photos Summary */}
          {photos.length > 0 && (
            <Card className="bg-slate-50 dark:bg-slate-900">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Resumo das Fotos ({roomTypes.length} ambientes)</h4>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {roomTypes.map(room => {
                    const roomPhotos = photos.filter(p => p.roomType === room.id);
                    const isComplete = roomPhotos.length >= room.minPhotos;
                    const RoomIcon = room.icon;

                    return (
                      <div
                        key={room.id}
                        className={`p-2 rounded-lg text-center ${
                          isComplete
                            ? 'bg-emerald-100 dark:bg-emerald-900'
                            : room.minPhotos === 0
                              ? 'bg-slate-100 dark:bg-slate-800'
                              : 'bg-amber-100 dark:bg-amber-900'
                        }`}
                        title={room.name}
                      >
                        <RoomIcon className="h-4 w-4 mx-auto mb-1" />
                        <span className="text-xs font-medium">{roomPhotos.length}</span>
                        {isComplete && <CheckCircle2 className="h-3 w-3 text-emerald-600 mx-auto" />}
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Total: {photos.length} fotos | Minimo necessario: {totalMinPhotos}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            {currentStep === roomTypes.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={photos.length < totalMinPhotos}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Concluir ({photos.length} fotos)
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Proximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PhotoUploadWizard;
