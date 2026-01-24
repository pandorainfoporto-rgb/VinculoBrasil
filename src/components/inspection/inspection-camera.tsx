// =============================================================================
// Inspection Camera - Interface de Vistoria com IA
// =============================================================================
// Componente PWA que orienta o usuario a tirar fotos nos angulos corretos
// com guia visual na tela para documentar o estado do imovel.
// =============================================================================

import { useState, useRef, useCallback } from 'react';
import {
  Camera,
  Upload,
  Check,
  X,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Maximize2,
  Info,
  Home,
  Eye,
  Sparkles,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  type AIInspection,
  type AIInspectionRoom,
  type AIInspectionPhoto,
  type DetectedDamage,
  type DamageType,
  DAMAGE_TYPE_LABELS,
} from '@/lib/marketplace-types';

import { inspectionAnalysisService } from '@/lib/services/inspection-analysis-service';

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------

interface InspectionCameraProps {
  propertyId: string;
  contractId: string;
  inspectionType: 'entrada' | 'saida' | 'periodica';
  userId: string;
  userRole: 'tenant' | 'landlord' | 'platform';
  onComplete?: (inspection: AIInspection) => void;
  onCancel?: () => void;
}

interface RoomConfig {
  id: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  requiredAngles: string[];
  capturedPhotos: CapturedPhoto[];
  isComplete: boolean;
}

interface CapturedPhoto {
  id: string;
  url: string;
  angle: string;
  analysisStatus: 'pending' | 'analyzing' | 'complete' | 'error';
  damages: DetectedDamage[];
}

interface AngleGuide {
  id: string;
  name: string;
  description: string;
  overlayIcon: React.ReactNode;
  tips: string[];
}

// -----------------------------------------------------------------------------
// Constantes
// -----------------------------------------------------------------------------

const ROOM_TEMPLATES: Omit<RoomConfig, 'id' | 'capturedPhotos' | 'isComplete'>[] = [
  {
    name: 'Sala',
    type: 'sala',
    icon: <Home className="h-5 w-5" />,
    requiredAngles: ['parede_principal', 'parede_janela', 'piso', 'teto'],
  },
  {
    name: 'Quarto Principal',
    type: 'quarto',
    icon: <Home className="h-5 w-5" />,
    requiredAngles: ['parede_cabeceira', 'armario', 'piso', 'janela'],
  },
  {
    name: 'Cozinha',
    type: 'cozinha',
    icon: <Home className="h-5 w-5" />,
    requiredAngles: ['bancada', 'armarios', 'piso', 'fogao_pia'],
  },
  {
    name: 'Banheiro',
    type: 'banheiro',
    icon: <Home className="h-5 w-5" />,
    requiredAngles: ['box', 'pia_espelho', 'vaso', 'piso'],
  },
  {
    name: 'Area de Servico',
    type: 'area_servico',
    icon: <Home className="h-5 w-5" />,
    requiredAngles: ['tanque', 'piso', 'paredes'],
  },
];

const ANGLE_GUIDES: Record<string, AngleGuide> = {
  parede_principal: {
    id: 'parede_principal',
    name: 'Parede Principal',
    description: 'Fotografe a parede principal do comodo de frente',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Inclua toda a parede no enquadramento', 'Mantenha a camera nivelada'],
  },
  parede_janela: {
    id: 'parede_janela',
    name: 'Parede da Janela',
    description: 'Fotografe a parede onde fica a janela',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Capture a janela inteira', 'Evite contraluz'],
  },
  parede_cabeceira: {
    id: 'parede_cabeceira',
    name: 'Parede da Cabeceira',
    description: 'Fotografe a parede atras da cama',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Inclua toda a extensao da parede'],
  },
  piso: {
    id: 'piso',
    name: 'Piso',
    description: 'Fotografe o piso do comodo',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Capture a maior area possivel', 'Procure por riscos ou manchas'],
  },
  teto: {
    id: 'teto',
    name: 'Teto',
    description: 'Fotografe o teto do comodo',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Verifique manchas de umidade', 'Observe o estado da pintura'],
  },
  armario: {
    id: 'armario',
    name: 'Armario',
    description: 'Fotografe o armario aberto',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Abra as portas para fotografar', 'Capture o interior tambem'],
  },
  janela: {
    id: 'janela',
    name: 'Janela',
    description: 'Fotografe a janela de perto',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Verifique vidros e esquadrias', 'Teste se abre e fecha'],
  },
  bancada: {
    id: 'bancada',
    name: 'Bancada',
    description: 'Fotografe a bancada da cozinha',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Inclua pia e torneira', 'Verifique azulejos'],
  },
  armarios: {
    id: 'armarios',
    name: 'Armarios da Cozinha',
    description: 'Fotografe os armarios superiores e inferiores',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Abra algumas portas', 'Verifique dobradicas'],
  },
  fogao_pia: {
    id: 'fogao_pia',
    name: 'Area do Fogao/Pia',
    description: 'Fotografe a regiao do fogao e pia',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Verifique estado do fogao', 'Confira torneira e sifao'],
  },
  box: {
    id: 'box',
    name: 'Box do Banheiro',
    description: 'Fotografe o box/area do chuveiro',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Verifique rejuntes', 'Observe se ha mofo'],
  },
  pia_espelho: {
    id: 'pia_espelho',
    name: 'Pia e Espelho',
    description: 'Fotografe a area da pia e espelho',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Verifique torneira', 'Observe estado do espelho'],
  },
  vaso: {
    id: 'vaso',
    name: 'Vaso Sanitario',
    description: 'Fotografe o vaso sanitario',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Verifique assento e tampa', 'Teste descarga'],
  },
  tanque: {
    id: 'tanque',
    name: 'Tanque',
    description: 'Fotografe o tanque de lavar',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Verifique torneira', 'Observe rachaduras'],
  },
  paredes: {
    id: 'paredes',
    name: 'Paredes Gerais',
    description: 'Fotografe as paredes do ambiente',
    overlayIcon: <Maximize2 className="h-12 w-12" />,
    tips: ['Capture todas as paredes', 'Observe pintura e manchas'],
  },
};

const SEVERITY_COLORS = {
  leve: 'bg-yellow-100 text-yellow-800',
  moderado: 'bg-orange-100 text-orange-800',
  grave: 'bg-red-100 text-red-800',
};

// -----------------------------------------------------------------------------
// Componente Principal
// -----------------------------------------------------------------------------

export function InspectionCamera({
  propertyId,
  contractId,
  inspectionType,
  userId,
  userRole,
  onComplete,
  onCancel,
}: InspectionCameraProps) {
  // Estados
  const [inspection, setInspection] = useState<AIInspection | null>(null);
  const [rooms, setRooms] = useState<RoomConfig[]>(() =>
    ROOM_TEMPLATES.map((template, idx) => ({
      ...template,
      id: `room_${idx}`,
      capturedPhotos: [],
      isComplete: false,
    }))
  );
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [allDamages, setAllDamages] = useState<DetectedDamage[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentRoom = rooms[currentRoomIndex];
  const currentAngle = currentRoom?.requiredAngles[currentAngleIndex];
  const currentGuide = currentAngle ? ANGLE_GUIDES[currentAngle] || ANGLE_GUIDES.paredes : null;

  // Progresso
  const totalPhotos = rooms.reduce((sum, room) => sum + room.requiredAngles.length, 0);
  const capturedPhotos = rooms.reduce((sum, room) => sum + room.capturedPhotos.length, 0);
  const progressPercent = (capturedPhotos / totalPhotos) * 100;

  // Inicializa vistoria
  const initInspection = useCallback(() => {
    const newInspection = inspectionAnalysisService.createInspection({
      propertyId,
      contractId,
      inspectionType,
      performedById: userId,
      performedByRole: userRole,
    });
    setInspection(newInspection);
    return newInspection;
  }, [propertyId, contractId, inspectionType, userId, userRole]);

  // Simula captura de foto (em producao usaria camera real)
  const handleCapture = async () => {
    // Abre seletor de arquivo como fallback
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cria URL local para preview
    const imageUrl = URL.createObjectURL(file);
    setCapturedImage(imageUrl);
  };

  const confirmPhoto = async () => {
    if (!capturedImage || !currentRoom || !currentAngle) return;

    setIsAnalyzing(true);

    // Inicializa vistoria se necessario
    let currentInspection = inspection;
    if (!currentInspection) {
      currentInspection = initInspection();
    }

    try {
      // Simula upload e analise
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simula resultado da analise
      const hasDamage = Math.random() > 0.6;
      const mockDamages: DetectedDamage[] = hasDamage
        ? [
            {
              id: `dmg_${Date.now()}`,
              type: ['furo_parede', 'mancha', 'rachadura', 'pintura_descascada'][
                Math.floor(Math.random() * 4)
              ] as DamageType,
              description: 'Dano detectado pela analise de IA',
              severity: ['leve', 'moderado', 'grave'][Math.floor(Math.random() * 3)] as
                | 'leve'
                | 'moderado'
                | 'grave',
              confidence: 75 + Math.floor(Math.random() * 20),
              estimatedRepairCost: 100 + Math.floor(Math.random() * 400),
            },
          ]
        : [];

      // Adiciona foto ao comodo
      const newPhoto: CapturedPhoto = {
        id: `photo_${Date.now()}`,
        url: capturedImage,
        angle: currentAngle,
        analysisStatus: 'complete',
        damages: mockDamages,
      };

      setRooms((prev) =>
        prev.map((room, idx) => {
          if (idx === currentRoomIndex) {
            const updatedPhotos = [...room.capturedPhotos, newPhoto];
            return {
              ...room,
              capturedPhotos: updatedPhotos,
              isComplete: updatedPhotos.length >= room.requiredAngles.length,
            };
          }
          return room;
        })
      );

      // Adiciona danos encontrados
      if (mockDamages.length > 0) {
        setAllDamages((prev) => [...prev, ...mockDamages]);
      }

      // Avanca para proximo angulo/comodo
      if (currentAngleIndex < currentRoom.requiredAngles.length - 1) {
        setCurrentAngleIndex((prev) => prev + 1);
      } else if (currentRoomIndex < rooms.length - 1) {
        setCurrentRoomIndex((prev) => prev + 1);
        setCurrentAngleIndex(0);
      } else {
        // Vistoria completa
        setShowResults(true);
      }

      setCapturedImage(null);
    } catch (error) {
      console.error('Erro ao analisar foto:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const skipAngle = () => {
    if (currentAngleIndex < currentRoom.requiredAngles.length - 1) {
      setCurrentAngleIndex((prev) => prev + 1);
    } else if (currentRoomIndex < rooms.length - 1) {
      setCurrentRoomIndex((prev) => prev + 1);
      setCurrentAngleIndex(0);
    }
  };

  const handleComplete = async () => {
    if (!inspection) return;

    const finalInspection = await inspectionAnalysisService.finalizeInspection(
      inspection.id
    );

    if (finalInspection && onComplete) {
      onComplete(finalInspection);
    }
  };

  // Tela de Resultados
  if (showResults) {
    const totalCost = allDamages.reduce((sum, d) => sum + d.estimatedRepairCost, 0);

    return (
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Vistoria Concluida!</CardTitle>
            <CardDescription>
              {capturedPhotos} fotos analisadas em {rooms.length} comodos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resumo de Danos */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{allDamages.length}</p>
                <p className="text-sm text-muted-foreground">Danos Detectados</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {allDamages.filter((d) => d.severity === 'grave').length}
                </p>
                <p className="text-sm text-muted-foreground">Danos Graves</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  R$ {totalCost.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Custo Estimado</p>
              </div>
            </div>

            {/* Lista de Danos */}
            {allDamages.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">Danos Encontrados</h4>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {allDamages.map((damage) => (
                      <div
                        key={damage.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              damage.severity === 'grave'
                                ? 'text-red-500'
                                : damage.severity === 'moderado'
                                ? 'text-orange-500'
                                : 'text-yellow-500'
                            }`}
                          />
                          <div>
                            <p className="font-medium text-sm">
                              {DAMAGE_TYPE_LABELS[damage.type]}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Confianca: {damage.confidence}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={SEVERITY_COLORS[damage.severity]}>
                            {damage.severity}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            R$ {damage.estimatedRepairCost}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Nenhum dano detectado</AlertTitle>
                <AlertDescription>
                  O imovel esta em boas condicoes segundo a analise de IA.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleComplete}>
              <Check className="h-4 w-4 mr-2" />
              Finalizar Vistoria
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4">
      {/* Header com Progresso */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <span className="font-medium">
                Vistoria de {inspectionType === 'entrada' ? 'Entrada' : inspectionType === 'saida' ? 'Saida' : 'Periodica'}
              </span>
            </div>
            <Badge variant="outline">
              {capturedPhotos}/{totalPhotos} fotos
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Navegacao de Comodos */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {rooms.map((room, idx) => (
          <Button
            key={room.id}
            variant={idx === currentRoomIndex ? 'default' : 'outline'}
            size="sm"
            className={`flex-shrink-0 ${room.isComplete ? 'border-green-500' : ''}`}
            onClick={() => {
              setCurrentRoomIndex(idx);
              setCurrentAngleIndex(0);
            }}
          >
            {room.isComplete && <Check className="h-3 w-3 mr-1" />}
            {room.name}
          </Button>
        ))}
      </div>

      {/* Area Principal */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{currentRoom?.name}</CardTitle>
              <CardDescription>
                Foto {currentAngleIndex + 1} de {currentRoom?.requiredAngles.length}
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {currentGuide?.name || 'Foto Geral'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Area de Captura/Preview */}
          <div className="relative aspect-[4/3] bg-muted">
            {capturedImage ? (
              // Preview da foto capturada
              <div className="relative w-full h-full">
                <img
                  src={capturedImage}
                  alt="Foto capturada"
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                    <Loader2 className="h-12 w-12 animate-spin mb-4" />
                    <p className="font-medium">Analisando com IA...</p>
                    <p className="text-sm opacity-75">Detectando possiveis danos</p>
                  </div>
                )}
              </div>
            ) : (
              // Guia de captura
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">
                  {currentGuide?.name || 'Tire uma foto'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-4">
                  {currentGuide?.description || 'Fotografe esta area do comodo'}
                </p>

                {/* Dicas */}
                {currentGuide?.tips && (
                  <div className="space-y-1">
                    {currentGuide.tips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Info className="h-3 w-3" />
                        {tip}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Overlay de guia (grid) */}
            {!capturedImage && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Grid 3x3 */}
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/20" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-4">
          {capturedImage ? (
            // Acoes apos captura
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={retakePhoto}
                disabled={isAnalyzing}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refazer
              </Button>
              <Button
                className="flex-1"
                onClick={confirmPhoto}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Confirmar
              </Button>
            </div>
          ) : (
            // Acoes de captura
            <>
              <Button className="w-full" size="lg" onClick={handleCapture}>
                <Camera className="h-5 w-5 mr-2" />
                Tirar Foto
              </Button>
              <div className="flex gap-3 w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={skipAngle}
                >
                  Pular
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Galeria
                </Button>
              </div>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Fotos ja capturadas deste comodo */}
      {currentRoom && currentRoom.capturedPhotos.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fotos Capturadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {currentRoom.capturedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border"
                >
                  <img
                    src={photo.url}
                    alt={photo.angle}
                    className="w-full h-full object-cover"
                  />
                  {photo.damages.length > 0 && (
                    <div className="absolute top-1 right-1">
                      <Badge
                        variant="destructive"
                        className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {photo.damages.length}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center truncate">
                    {ANGLE_GUIDES[photo.angle]?.name || photo.angle}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danos detectados */}
      {allDamages.length > 0 && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            {allDamages.length} dano(s) detectado(s)
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            A IA identificou possiveis problemas. Continue a vistoria para analise
            completa.
          </AlertDescription>
        </Alert>
      )}

      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Botao Cancelar */}
      <Button variant="ghost" className="w-full" onClick={onCancel}>
        <X className="h-4 w-4 mr-2" />
        Cancelar Vistoria
      </Button>
    </div>
  );
}

export default InspectionCamera;
