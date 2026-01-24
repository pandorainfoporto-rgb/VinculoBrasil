// =============================================================================
// AI Inspection - Servico de Vistoria com Inteligencia Artificial
// =============================================================================
// Comparacao automatica de fotos para detectar danos no imovel usando
// GPT-4o Vision para analise de imagens.
// =============================================================================

import {
  type AIInspection,
  type AIInspectionRoom,
  type AIInspectionPhoto,
  type PhotoAnalysisResult,
  type DetectedDamage,
  type InspectionComparison,
  type DamageType,
  type AIInspectionType,
  type AIAnalysisStatus,
  DAMAGE_TYPE_LABELS,
} from '../marketplace-types';

// -----------------------------------------------------------------------------
// Constantes e Configuracao
// -----------------------------------------------------------------------------

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const ANALYSIS_MODEL = 'gpt-4o';
const CONFIDENCE_THRESHOLD = 70; // Minimo de confianca para considerar dano

// Guias de captura de foto por tipo de comodo
const ROOM_PHOTO_GUIDES: Record<string, string[]> = {
  sala: ['parede_norte', 'parede_sul', 'parede_leste', 'parede_oeste', 'piso', 'teto', 'janelas'],
  quarto: ['parede_cabeceira', 'parede_janela', 'armario', 'piso', 'teto'],
  cozinha: ['bancada', 'armarios', 'piso', 'parede_fogao', 'parede_pia'],
  banheiro: ['box', 'pia', 'vaso', 'piso', 'azulejos', 'teto'],
  area_servico: ['tanque', 'piso', 'paredes'],
  varanda: ['piso', 'paredes', 'teto', 'guarda_corpo'],
};

// Custo estimado por tipo de dano (em R$)
const DAMAGE_REPAIR_COSTS: Record<DamageType, { min: number; max: number }> = {
  furo_parede: { min: 50, max: 150 },
  mancha: { min: 100, max: 400 },
  rachadura: { min: 200, max: 800 },
  quebra: { min: 150, max: 1000 },
  pintura_descascada: { min: 200, max: 600 },
  mofo_umidade: { min: 300, max: 1200 },
  risco_piso: { min: 100, max: 500 },
  vidro_quebrado: { min: 200, max: 800 },
  ferrugem: { min: 100, max: 400 },
  desgaste_natural: { min: 0, max: 0 },
  outro: { min: 100, max: 500 },
};

// -----------------------------------------------------------------------------
// Tipos Internos
// -----------------------------------------------------------------------------

interface CreateInspectionDTO {
  propertyId: string;
  contractId: string;
  inspectionType: AIInspectionType;
  performedById: string;
  performedByRole: 'tenant' | 'landlord' | 'platform';
}

interface AddRoomDTO {
  inspectionId: string;
  roomName: string;
  roomType: string;
}

interface AnalyzePhotoResult {
  success: boolean;
  result?: PhotoAnalysisResult;
  message: string;
}

interface CompareImagesResult {
  hasDamage: boolean;
  damageDescription: string;
  confidence: number;
  damages: DetectedDamage[];
}

// -----------------------------------------------------------------------------
// Prompts para GPT-4 Vision
// -----------------------------------------------------------------------------

const DAMAGE_DETECTION_PROMPT = `Voce e um inspetor de imoveis profissional. Analise esta imagem de um ambiente residencial e identifique quaisquer danos visiveis.

Para cada dano encontrado, forneca:
1. Tipo de dano (escolha entre: furo_parede, mancha, rachadura, quebra, pintura_descascada, mofo_umidade, risco_piso, vidro_quebrado, ferrugem, desgaste_natural, outro)
2. Descricao detalhada do dano
3. Severidade (leve, moderado, grave)
4. Nivel de confianca (0-100)
5. Localizacao aproximada na imagem (x, y, largura, altura em porcentagem)

Responda APENAS em JSON no formato:
{
  "hasDamage": boolean,
  "damages": [
    {
      "type": "tipo_do_dano",
      "description": "descricao detalhada",
      "severity": "leve|moderado|grave",
      "confidence": 0-100,
      "boundingBox": { "x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100 }
    }
  ],
  "overallCondition": "excelente|bom|regular|ruim",
  "notes": "observacoes adicionais"
}

Se nao houver danos visiveis, retorne hasDamage: false e damages como array vazio.`;

const COMPARISON_PROMPT = `Voce e um inspetor de imoveis profissional. Compare estas duas imagens do mesmo ambiente:
- Imagem 1: Estado ANTES (entrada no imovel)
- Imagem 2: Estado DEPOIS (saida do imovel)

Identifique APENAS os danos NOVOS que apareceram na segunda imagem e que NAO existiam na primeira.
Ignore desgaste natural e pequenas diferencas de iluminacao/angulo.

Para cada dano NOVO encontrado, forneca:
1. Tipo de dano
2. Descricao do que mudou
3. Severidade
4. Confianca de que e um dano novo (0-100)

Responda APENAS em JSON no formato:
{
  "hasDamage": boolean,
  "newDamages": [
    {
      "type": "tipo_do_dano",
      "description": "o que mudou entre as imagens",
      "severity": "leve|moderado|grave",
      "confidence": 0-100
    }
  ],
  "summary": "resumo das diferencas encontradas"
}`;

// -----------------------------------------------------------------------------
// Classe Principal do Servico
// -----------------------------------------------------------------------------

export class InspectionAnalysisService {
  private inspections: Map<string, AIInspection> = new Map();
  private comparisons: Map<string, InspectionComparison> = new Map();

  /**
   * Cria uma nova vistoria
   */
  createInspection(dto: CreateInspectionDTO): AIInspection {
    const inspection: AIInspection = {
      id: `insp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      propertyId: dto.propertyId,
      contractId: dto.contractId,
      inspectionType: dto.inspectionType,
      performedById: dto.performedById,
      performedByRole: dto.performedByRole,
      rooms: [],
      totalPhotos: 0,
      overallCondition: 'bom',
      totalDamagesFound: 0,
      estimatedRepairCost: 0,
      status: 'pendente',
      newDamagesFound: 0,
      createdAt: new Date(),
    };

    this.inspections.set(inspection.id, inspection);
    return inspection;
  }

  /**
   * Adiciona um comodo a vistoria
   */
  addRoom(dto: AddRoomDTO): AIInspectionRoom {
    const inspection = this.inspections.get(dto.inspectionId);
    if (!inspection) {
      throw new Error('Vistoria nao encontrada');
    }

    const room: AIInspectionRoom = {
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      inspectionId: dto.inspectionId,
      roomName: dto.roomName,
      roomType: dto.roomType,
      photos: [],
      condition: 'bom',
      damagesDetected: [],
    };

    inspection.rooms.push(room);
    this.inspections.set(dto.inspectionId, inspection);

    return room;
  }

  /**
   * Retorna guia de fotos para o tipo de comodo
   */
  getPhotoGuide(roomType: string): string[] {
    return ROOM_PHOTO_GUIDES[roomType] || ['geral_1', 'geral_2', 'geral_3', 'geral_4'];
  }

  /**
   * Adiciona foto ao comodo e inicia analise
   */
  async addPhotoAndAnalyze(
    inspectionId: string,
    roomId: string,
    photoUrl: string,
    suggestedAngle: string
  ): Promise<AnalyzePhotoResult> {
    const inspection = this.inspections.get(inspectionId);
    if (!inspection) {
      return { success: false, message: 'Vistoria nao encontrada' };
    }

    const room = inspection.rooms.find((r) => r.id === roomId);
    if (!room) {
      return { success: false, message: 'Comodo nao encontrado' };
    }

    // Cria registro da foto
    const photo: AIInspectionPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      roomId,
      url: photoUrl,
      suggestedAngle,
      angleCompliance: 100, // Em producao, IA verificaria se seguiu o guia
      analysisStatus: 'processando',
      takenAt: new Date(),
    };

    room.photos.push(photo);
    inspection.totalPhotos += 1;

    // Inicia analise assincrona
    this.analyzePhoto(inspectionId, roomId, photo.id)
      .then((result) => {
        if (result) {
          photo.analysisResult = result;
          photo.analysisStatus = 'concluida';
          photo.analyzedAt = new Date();

          // Atualiza danos do comodo
          if (result.hasDamage) {
            room.damagesDetected.push(...result.damages);
            this.updateInspectionStats(inspectionId);
          }
        }
      })
      .catch((err) => {
        console.error('Erro na analise:', err);
        photo.analysisStatus = 'erro';
      });

    this.inspections.set(inspectionId, inspection);

    return {
      success: true,
      message: 'Foto adicionada. Analise em andamento...',
    };
  }

  /**
   * Analisa uma foto individual usando GPT-4 Vision
   */
  private async analyzePhoto(
    inspectionId: string,
    roomId: string,
    photoId: string
  ): Promise<PhotoAnalysisResult | null> {
    const inspection = this.inspections.get(inspectionId);
    if (!inspection) return null;

    const room = inspection.rooms.find((r) => r.id === roomId);
    if (!room) return null;

    const photo = room.photos.find((p) => p.id === photoId);
    if (!photo) return null;

    try {
      // Simula chamada para OpenAI GPT-4 Vision
      const response = await this.callGPT4Vision(photo.url, DAMAGE_DETECTION_PROMPT);

      // Parse da resposta
      const parsed = this.parseAIResponse(response);

      return {
        hasDamage: parsed.hasDamage,
        damages: parsed.damages.map((d: DetectedDamage) => ({
          ...d,
          id: `dmg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          estimatedRepairCost: this.estimateRepairCost(d.type, d.severity),
        })),
        confidence: parsed.damages.length > 0
          ? parsed.damages.reduce((sum: number, d: DetectedDamage) => sum + d.confidence, 0) / parsed.damages.length
          : 100,
        rawAIResponse: response,
      };
    } catch (error) {
      console.error('Erro ao analisar foto:', error);
      return null;
    }
  }

  /**
   * Compara duas imagens (entrada vs saida)
   */
  async compareImages(
    imgUrlBefore: string,
    imgUrlAfter: string
  ): Promise<CompareImagesResult> {
    try {
      // Simula chamada para OpenAI com duas imagens
      const response = await this.callGPT4VisionComparison(
        imgUrlBefore,
        imgUrlAfter,
        COMPARISON_PROMPT
      );

      const parsed = this.parseComparisonResponse(response);

      return {
        hasDamage: parsed.hasDamage,
        damageDescription: parsed.summary,
        confidence: parsed.newDamages.length > 0
          ? parsed.newDamages.reduce((sum: number, d: DetectedDamage) => sum + d.confidence, 0) / parsed.newDamages.length
          : 100,
        damages: parsed.newDamages.map((d: DetectedDamage) => ({
          ...d,
          id: `dmg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          estimatedRepairCost: this.estimateRepairCost(d.type, d.severity),
          existedInPreviousInspection: false,
        })),
      };
    } catch (error) {
      console.error('Erro ao comparar imagens:', error);
      return {
        hasDamage: false,
        damageDescription: 'Erro ao processar comparacao',
        confidence: 0,
        damages: [],
      };
    }
  }

  /**
   * Simula chamada para GPT-4 Vision (em producao usaria API real)
   */
  private async callGPT4Vision(imageUrl: string, prompt: string): Promise<string> {
    // Simula latencia
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Em producao:
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${OPENAI_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: ANALYSIS_MODEL,
    //     messages: [
    //       {
    //         role: 'user',
    //         content: [
    //           { type: 'text', text: prompt },
    //           { type: 'image_url', image_url: { url: imageUrl } }
    //         ]
    //       }
    //     ],
    //     max_tokens: 1000,
    //   }),
    // });

    // Retorna resposta simulada
    const hasRandomDamage = Math.random() > 0.6;

    if (hasRandomDamage) {
      const damageTypes: DamageType[] = ['furo_parede', 'mancha', 'rachadura', 'pintura_descascada'];
      const randomType = damageTypes[Math.floor(Math.random() * damageTypes.length)];
      const severities = ['leve', 'moderado', 'grave'] as const;
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];

      return JSON.stringify({
        hasDamage: true,
        damages: [
          {
            type: randomType,
            description: `${DAMAGE_TYPE_LABELS[randomType]} detectado na area analisada`,
            severity: randomSeverity,
            confidence: 75 + Math.floor(Math.random() * 20),
            boundingBox: {
              x: 20 + Math.floor(Math.random() * 40),
              y: 20 + Math.floor(Math.random() * 40),
              width: 10 + Math.floor(Math.random() * 20),
              height: 10 + Math.floor(Math.random() * 20),
            },
          },
        ],
        overallCondition: randomSeverity === 'grave' ? 'ruim' : randomSeverity === 'moderado' ? 'regular' : 'bom',
        notes: 'Analise realizada com sucesso.',
      });
    }

    return JSON.stringify({
      hasDamage: false,
      damages: [],
      overallCondition: 'bom',
      notes: 'Nenhum dano significativo detectado.',
    });
  }

  /**
   * Simula chamada para GPT-4 Vision com comparacao de imagens
   */
  private async callGPT4VisionComparison(
    imgBefore: string,
    imgAfter: string,
    prompt: string
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simula deteccao de danos novos
    const hasNewDamage = Math.random() > 0.5;

    if (hasNewDamage) {
      return JSON.stringify({
        hasDamage: true,
        newDamages: [
          {
            type: 'furo_parede',
            description: 'Furo novo identificado na parede, possivelmente de instalacao de suporte',
            severity: 'leve',
            confidence: 85,
          },
        ],
        summary: 'Detectado 1 novo dano que nao existia na vistoria de entrada.',
      });
    }

    return JSON.stringify({
      hasDamage: false,
      newDamages: [],
      summary: 'Nenhum dano novo detectado. O imovel esta em condicoes similares a entrada.',
    });
  }

  /**
   * Parse da resposta da IA
   */
  private parseAIResponse(response: string): {
    hasDamage: boolean;
    damages: DetectedDamage[];
    overallCondition: string;
  } {
    try {
      const parsed = JSON.parse(response);
      return {
        hasDamage: parsed.hasDamage || false,
        damages: parsed.damages || [],
        overallCondition: parsed.overallCondition || 'bom',
      };
    } catch {
      return { hasDamage: false, damages: [], overallCondition: 'bom' };
    }
  }

  /**
   * Parse da resposta de comparacao
   */
  private parseComparisonResponse(response: string): {
    hasDamage: boolean;
    newDamages: DetectedDamage[];
    summary: string;
  } {
    try {
      const parsed = JSON.parse(response);
      return {
        hasDamage: parsed.hasDamage || false,
        newDamages: parsed.newDamages || [],
        summary: parsed.summary || '',
      };
    } catch {
      return { hasDamage: false, newDamages: [], summary: '' };
    }
  }

  /**
   * Estima custo de reparo baseado no tipo e severidade
   */
  private estimateRepairCost(type: DamageType, severity: 'leve' | 'moderado' | 'grave'): number {
    const costs = DAMAGE_REPAIR_COSTS[type] || DAMAGE_REPAIR_COSTS.outro;

    const multiplier = {
      leve: 0.5,
      moderado: 0.75,
      grave: 1.0,
    };

    const baseCost = (costs.min + costs.max) / 2;
    return Math.round(baseCost * multiplier[severity]);
  }

  /**
   * Atualiza estatisticas da vistoria
   */
  private updateInspectionStats(inspectionId: string): void {
    const inspection = this.inspections.get(inspectionId);
    if (!inspection) return;

    let totalDamages = 0;
    let totalCost = 0;
    let worstCondition: 'excelente' | 'bom' | 'regular' | 'ruim' = 'excelente';

    const conditionRank = { excelente: 0, bom: 1, regular: 2, ruim: 3 };

    for (const room of inspection.rooms) {
      totalDamages += room.damagesDetected.length;
      totalCost += room.damagesDetected.reduce(
        (sum, d) => sum + d.estimatedRepairCost,
        0
      );

      if (conditionRank[room.condition] > conditionRank[worstCondition]) {
        worstCondition = room.condition;
      }
    }

    inspection.totalDamagesFound = totalDamages;
    inspection.estimatedRepairCost = totalCost;
    inspection.overallCondition = worstCondition;

    this.inspections.set(inspectionId, inspection);
  }

  /**
   * Finaliza vistoria e gera relatorio
   */
  async finalizeInspection(inspectionId: string): Promise<AIInspection | null> {
    const inspection = this.inspections.get(inspectionId);
    if (!inspection) return null;

    // Aguarda todas as analises pendentes
    let hasProcessing = true;
    let attempts = 0;
    const maxAttempts = 30;

    while (hasProcessing && attempts < maxAttempts) {
      hasProcessing = false;
      for (const room of inspection.rooms) {
        for (const photo of room.photos) {
          if (photo.analysisStatus === 'processando') {
            hasProcessing = true;
            break;
          }
        }
        if (hasProcessing) break;
      }

      if (hasProcessing) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }
    }

    // Atualiza estatisticas finais
    this.updateInspectionStats(inspectionId);

    inspection.status = 'concluida';
    inspection.analysisCompletedAt = new Date();
    inspection.completedAt = new Date();

    this.inspections.set(inspectionId, inspection);

    return inspection;
  }

  /**
   * Compara vistoria de saida com vistoria de entrada
   */
  async createInspectionComparison(
    entryInspectionId: string,
    exitInspectionId: string,
    contractId: string
  ): Promise<InspectionComparison | null> {
    const entryInspection = this.inspections.get(entryInspectionId);
    const exitInspection = this.inspections.get(exitInspectionId);

    if (!entryInspection || !exitInspection) {
      return null;
    }

    // Compara fotos de cada comodo
    const newDamages: DetectedDamage[] = [];
    const repairedDamages: DetectedDamage[] = [];
    const unchangedDamages: DetectedDamage[] = [];

    for (const exitRoom of exitInspection.rooms) {
      const entryRoom = entryInspection.rooms.find(
        (r) => r.roomType === exitRoom.roomType
      );

      if (!entryRoom) {
        // Comodo novo, todos os danos sao novos
        newDamages.push(...exitRoom.damagesDetected);
        continue;
      }

      // Compara danos
      for (const exitDamage of exitRoom.damagesDetected) {
        const existingDamage = entryRoom.damagesDetected.find(
          (d) => d.type === exitDamage.type && d.severity === exitDamage.severity
        );

        if (existingDamage) {
          unchangedDamages.push({ ...exitDamage, previousDamageId: existingDamage.id });
        } else {
          newDamages.push({ ...exitDamage, existedInPreviousInspection: false });
        }
      }

      // Verifica danos reparados
      for (const entryDamage of entryRoom.damagesDetected) {
        const stillExists = exitRoom.damagesDetected.find(
          (d) => d.type === entryDamage.type
        );

        if (!stillExists) {
          repairedDamages.push(entryDamage);
        }
      }
    }

    // Calcula custos
    const totalNewDamageCost = newDamages.reduce(
      (sum, d) => sum + d.estimatedRepairCost,
      0
    );

    const comparison: InspectionComparison = {
      id: `comp_${Date.now()}`,
      entryInspectionId,
      exitInspectionId,
      contractId,
      newDamages,
      repairedDamages,
      unchangedDamages,
      totalNewDamageCost,
      deductFromDeposit: totalNewDamageCost > 0,
      depositDeductionAmount: totalNewDamageCost,
      approvedByLandlord: false,
      approvedByTenant: false,
      createdAt: new Date(),
    };

    // Atualiza vistoria de saida
    exitInspection.comparedWithInspectionId = entryInspectionId;
    exitInspection.newDamagesFound = newDamages.length;
    this.inspections.set(exitInspectionId, exitInspection);

    this.comparisons.set(comparison.id, comparison);

    return comparison;
  }

  // -------------------------------------------------------------------------
  // Metodos de Consulta
  // -------------------------------------------------------------------------

  /**
   * Retorna vistoria por ID
   */
  getInspectionById(inspectionId: string): AIInspection | undefined {
    return this.inspections.get(inspectionId);
  }

  /**
   * Retorna vistorias de um imovel
   */
  getInspectionsByProperty(propertyId: string): AIInspection[] {
    return Array.from(this.inspections.values()).filter(
      (i) => i.propertyId === propertyId
    );
  }

  /**
   * Retorna vistorias de um contrato
   */
  getInspectionsByContract(contractId: string): AIInspection[] {
    return Array.from(this.inspections.values()).filter(
      (i) => i.contractId === contractId
    );
  }

  /**
   * Retorna comparacao por ID
   */
  getComparisonById(comparisonId: string): InspectionComparison | undefined {
    return this.comparisons.get(comparisonId);
  }

  /**
   * Retorna comparacao de um contrato
   */
  getComparisonByContract(contractId: string): InspectionComparison | undefined {
    return Array.from(this.comparisons.values()).find(
      (c) => c.contractId === contractId
    );
  }
}

// Instancia singleton
export const inspectionAnalysisService = new InspectionAnalysisService();
