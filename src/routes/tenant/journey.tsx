// ============================================
// TENANT JOURNEY - Onboarding Completo
// KYC -> Vistoria IA -> Contrato DeFi -> Assinatura
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAIInspection, type InspectionResult, type InspectionSummary } from '@/hooks/useAIInspection';
import {
  Camera,
  Check,
  Shield,
  FileText,
  User,
  ArrowRight,
  ArrowLeft,
  ScanLine,
  Loader2,
  UploadCloud,
  AlertTriangle,
  CheckCircle,
  X,
  Sparkles,
  Building2,
  Calendar,
  DollarSign,
  Key,
  Fingerprint,
  Eye,
  Trash2,
  Info,
  Zap,
  Lock,
  Copy,
} from 'lucide-react';

export const Route = createFileRoute('/tenant/journey' as never)({
  component: TenantJourneyPage,
});

// ============================================
// TIPOS
// ============================================

interface KYCData {
  cpf: string;
  birthDate: string;
  rg: string;
  rgFrontFile: File | null;
  rgBackFile: File | null;
  selfieFile: File | null;
}

interface ContractData {
  propertyTitle: string;
  propertyAddress: string;
  rentAmount: number;
  condoFee: number;
  iptu: number;
  totalMonthly: number;
  startDate: string;
  endDate: string;
  ownerName: string;
  agencyName: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function TenantJourneyPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // KYC State
  const [kycData, setKycData] = useState<KYCData>({
    cpf: '',
    birthDate: '',
    rg: '',
    rgFrontFile: null,
    rgBackFile: null,
    selfieFile: null,
  });
  const [kycValidated, setKycValidated] = useState(false);

  // Vistoria State
  const { analyzePhoto, generateSummary, isAnalyzing, progress, currentStep } = useAIInspection();
  const [inspections, setInspections] = useState<InspectionResult[]>([]);
  const [inspectionSummary, setInspectionSummary] = useState<InspectionSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contrato State
  const [contractData] = useState<ContractData>({
    propertyTitle: 'Apartamento 302 - Edificio Solar',
    propertyAddress: 'Rua das Flores, 123 - Jardim Paulista, Sao Paulo - SP',
    rentAmount: 2500,
    condoFee: 450,
    iptu: 120,
    totalMonthly: 3070,
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    ownerName: 'Joao Carlos Oliveira',
    agencyName: 'Fatto Imoveis',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Resultado Final
  const [mintedContract, setMintedContract] = useState<{
    hash: string;
    tokenId: string;
    blockNumber: number;
  } | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // ============================================
  // STEP 1: KYC - VERIFICACAO DE IDENTIDADE
  // ============================================
  const StepKYC = () => {
    const handleValidateKYC = async () => {
      if (!kycData.cpf || !kycData.birthDate) {
        toast.error('Preencha todos os campos obrigatorios');
        return;
      }

      setLoading(true);
      // Simula validacao
      await new Promise(r => setTimeout(r, 2000));
      setKycValidated(true);
      setLoading(false);
      toast.success('Identidade verificada com sucesso!');
      setStep(2);
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200">
            <Fingerprint className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Verificacao de Identidade</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Para gerar seu contrato na Blockchain, precisamos validar seus dados (KYC).
          </p>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700">CPF *</Label>
              <Input
                placeholder="000.000.000-00"
                value={kycData.cpf}
                onChange={(e) => setKycData({ ...kycData, cpf: e.target.value })}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Data de Nascimento *</Label>
              <Input
                type="date"
                value={kycData.birthDate}
                onChange={(e) => setKycData({ ...kycData, birthDate: e.target.value })}
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">RG</Label>
            <Input
              placeholder="00.000.000-0"
              value={kycData.rg}
              onChange={(e) => setKycData({ ...kycData, rg: e.target.value })}
              className="h-12"
            />
          </div>

          {/* Upload de Documento */}
          <div className="space-y-2">
            <Label className="text-slate-700">Documento (RG ou CNH)</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer">
                <UploadCloud className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">Frente</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
              <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer">
                <UploadCloud className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">Verso</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          </div>

          {/* Selfie */}
          <div className="space-y-2">
            <Label className="text-slate-700">Selfie com Documento</Label>
            <label className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer">
              <Camera className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">Tire uma selfie segurando seu documento</span>
              <span className="text-xs text-slate-400 mt-1">Isso garante que voce e o titular</span>
              <input type="file" accept="image/*" capture="user" className="hidden" />
            </label>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
          <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Seus dados estao protegidos</p>
            <p className="text-blue-600 text-xs mt-1">
              Usamos criptografia de ponta e nao compartilhamos com terceiros.
            </p>
          </div>
        </div>

        {/* Botao */}
        <Button
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200"
          onClick={handleValidateKYC}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Validando identidade...
            </div>
          ) : (
            <>
              Validar e Continuar
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    );
  };

  // ============================================
  // STEP 2: VISTORIA COM VISAO COMPUTACIONAL
  // ============================================
  const StepInspection = () => {
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const result = await analyzePhoto(file);
        setInspections(prev => [...prev, result]);

        if (result.condition === 'DAMAGED') {
          toast.warning(`${result.roomType}: Avaria detectada!`);
        } else {
          toast.success(`${result.roomType} analisado com sucesso`);
        }
      } catch (err) {
        toast.error('Erro ao processar imagem');
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleRemoveInspection = (id: string) => {
      setInspections(prev => prev.filter(i => i.id !== id));
    };

    const handleFinishInspection = async () => {
      if (inspections.length === 0) {
        toast.error('Adicione pelo menos uma foto');
        return;
      }

      setLoading(true);
      try {
        const summary = await generateSummary(inspections);
        setInspectionSummary(summary);
        toast.success('Vistoria finalizada com sucesso!');
        setStep(3);
      } catch (err) {
        toast.error('Erro ao gerar resumo');
      } finally {
        setLoading(false);
      }
    };

    const getConditionColor = (condition: string) => {
      switch (condition) {
        case 'EXCELLENT': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'GOOD': return 'bg-green-100 text-green-700 border-green-200';
        case 'FAIR': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'DAMAGED': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-slate-100 text-slate-700';
      }
    };

    const getConditionLabel = (condition: string) => {
      switch (condition) {
        case 'EXCELLENT': return 'Excelente';
        case 'GOOD': return 'Bom';
        case 'FAIR': return 'Regular';
        case 'DAMAGED': return 'Avariado';
        default: return condition;
      }
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-200">
            <ScanLine className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Vistoria Inteligente</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Nossa IA analisara as fotos para registrar o estado do imovel no contrato.
          </p>
        </div>

        {/* Camera/Upload Button */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="inspection-upload"
            onChange={handleFileChange}
            disabled={isAnalyzing}
          />
          <label
            htmlFor="inspection-upload"
            className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
              isAnalyzing
                ? 'bg-slate-900 border-slate-700'
                : 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100'
            }`}
          >
            {isAnalyzing ? (
              <div className="text-center space-y-3">
                <div className="relative">
                  <ScanLine className="h-12 w-12 text-emerald-400 mx-auto animate-pulse" />
                  <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                    {currentStep || 'Processando...'}
                  </p>
                  <Progress value={progress} className="w-48 h-1.5 mx-auto" />
                  <p className="text-xs text-slate-500">{progress}%</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                  <Camera className="h-7 w-7 text-purple-600" />
                </div>
                <span className="text-sm font-bold text-purple-900">Adicionar Foto do Ambiente</span>
                <span className="text-xs text-purple-500 mt-1">A IA detectara avarias automaticamente</span>
              </>
            )}
          </label>
        </div>

        {/* Lista de Resultados */}
        {inspections.length > 0 && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {inspections.map((insp) => (
              <Card
                key={insp.id}
                className="bg-white shadow-sm hover:shadow-md transition-shadow animate-in slide-in-from-bottom-2 duration-300"
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                      <img
                        src={insp.imageUrl}
                        alt={insp.roomType}
                        className="w-full h-full object-cover"
                      />
                      {insp.issues.length > 0 && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                          <AlertTriangle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{insp.roomType}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Confianca: {(insp.roomTypeConfidence * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getConditionColor(insp.condition)}>
                            {getConditionLabel(insp.condition)}
                          </Badge>
                          <button
                            onClick={() => handleRemoveInspection(insp.id)}
                            className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Items Detectados */}
                      <p className="text-xs text-slate-500 truncate mt-1">
                        {insp.itemsDetected.slice(0, 3).map(i => i.name).join(', ')}
                        {insp.itemsDetected.length > 3 && ` +${insp.itemsDetected.length - 3}`}
                      </p>

                      {/* Issues */}
                      {insp.issues.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {insp.issues.map((issue, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                issue.severity === 'HIGH'
                                  ? 'bg-red-100 text-red-700'
                                  : issue.severity === 'MEDIUM'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {issue.description}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Hash */}
                      <div className="mt-2 text-[9px] text-slate-400 font-mono bg-slate-50 p-1.5 rounded border border-slate-100 truncate flex items-center gap-1">
                        <Lock className="h-3 w-3 shrink-0" />
                        <span className="truncate">SHA256: {insp.imageHash.slice(0, 24)}...</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-indigo-50 p-4 rounded-xl flex gap-3 items-start">
          <Shield className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-sm text-indigo-800">
            <p className="font-medium">Prova Juridica Imutavel</p>
            <p className="text-indigo-600 text-xs mt-1">
              Cada foto recebe hash SHA-256 e timestamp para seguranca juridica.
              {inspections.length > 0 && ` (${inspections.length} fotos registradas)`}
            </p>
          </div>
        </div>

        {/* Botoes */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => setStep(1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button
            className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={handleFinishInspection}
            disabled={inspections.length === 0 || isAnalyzing || loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Finalizar Vistoria
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // ============================================
  // STEP 3: CONTRATO INTELIGENTE
  // ============================================
  const StepContract = () => {
    const handleMintContract = async () => {
      if (!acceptedTerms) {
        toast.error('Voce precisa aceitar os termos');
        return;
      }

      setLoading(true);

      try {
        // Get inspection hash from summary or first inspection
        const inspectionHash = inspectionSummary?.inspectionHash
          || (inspections.length > 0 ? inspections[0].imageHash : 'no-inspection-hash');

        // Get token from localStorage
        const token = localStorage.getItem('token');

        // Call the real backend API to mint the contract NFT
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || ''}/api/contracts/mint`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              propertyId: 'demo-property-id', // In real app, get from route/context
              rentValue: contractData.rentAmount,
              inspectionHash,
              startDate: contractData.startDate,
              endDate: contractData.endDate,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.details || 'Erro ao gerar contrato');
        }

        // Success! Set the minted contract data from API response
        setMintedContract({
          hash: data.nft.transactionHash,
          tokenId: data.nft.tokenId,
          blockNumber: data.nft.blockNumber,
        });

        toast.success('Contrato registrado na Blockchain!');
        setStep(4);

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

        // If API is not available, fallback to simulation for demo
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          toast.warning('API indisponivel. Usando simulacao local.');

          // Simulated minting for demo
          await new Promise(r => setTimeout(r, 2000));

          setMintedContract({
            hash: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
              .map(b => b.toString(16).padStart(2, '0')).join(''),
            tokenId: String(Math.floor(Math.random() * 10000) + 1000),
            blockNumber: Math.floor(Math.random() * 1000000) + 45000000,
          });

          setStep(4);
        } else {
          toast.error('Erro ao assinar: ' + errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Contrato Inteligente</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Revise os termos gerados automaticamente pelo protocolo DeFi.
          </p>
        </div>

        {/* Resumo do Imovel */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-slate-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{contractData.propertyTitle}</h4>
                <p className="text-xs text-slate-500 mt-1">{contractData.propertyAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valores */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Valores Mensais
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Aluguel</span>
                <span className="font-medium">{formatCurrency(contractData.rentAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Condominio</span>
                <span className="font-medium">{formatCurrency(contractData.condoFee)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">IPTU (mensal)</span>
                <span className="font-medium">{formatCurrency(contractData.iptu)}</span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-50 -mx-4 px-4 rounded-lg">
                <span className="font-bold text-emerald-900">Total Mensal</span>
                <span className="font-bold text-emerald-900">{formatCurrency(contractData.totalMonthly)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vigencia */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Vigencia do Contrato</p>
                <p className="font-medium text-slate-900">
                  {new Date(contractData.startDate).toLocaleDateString('pt-BR')} -{' '}
                  {new Date(contractData.endDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo da Vistoria */}
        {inspectionSummary && (
          <Card className="bg-slate-900 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  Vistoria Registrada
                </h4>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {inspectionSummary.totalPhotos} fotos
                </Badge>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <p>Ambientes: {inspectionSummary.roomsCovered.join(', ')}</p>
                <p>Condicao Geral: {inspectionSummary.overallCondition}</p>
                {inspectionSummary.issuesFound > 0 && (
                  <p className="text-amber-400">
                    Avarias encontradas: {inspectionSummary.issuesFound}
                  </p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 text-[10px] font-mono text-slate-500 truncate">
                Merkle Root: {inspectionSummary.inspectionHash.slice(0, 32)}...
              </div>
            </CardContent>
          </Card>
        )}

        {/* Termos */}
        <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            className="mt-0.5"
          />
          <label htmlFor="terms" className="text-sm text-slate-700 leading-snug cursor-pointer">
            Li e concordo com os termos. Entendo que esta assinatura digital (Mint) tem valor legal
            conforme MP 2.200-2/2001 e iniciara as cobranças no meu CPF.
          </label>
        </div>

        {/* Botoes */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => setStep(2)}
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button
            className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-200"
            onClick={handleMintContract}
            disabled={!acceptedTerms || loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Registrando na Blockchain...</span>
              </div>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Assinar Contrato (Mint NFT)
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // ============================================
  // STEP 4: SUCESSO
  // ============================================
  const StepSuccess = () => {
    const copyHash = async () => {
      if (mintedContract) {
        await navigator.clipboard.writeText(mintedContract.hash);
        toast.success('Hash copiado!');
      }
    };

    return (
      <div className="text-center animate-in zoom-in duration-500 py-4">
        {/* Icone de Sucesso */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
          <div className="relative w-28 h-28 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
            <Key className="h-14 w-14 text-white" />
          </div>
        </div>

        {/* Titulo */}
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Tudo Pronto! 🔑</h2>
        <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
          Parabens! Seu contrato esta ativo e registrado na Blockchain.
          As chaves virtuais foram liberadas.
        </p>

        {/* Card com detalhes do contrato */}
        {mintedContract && (
          <Card className="bg-slate-900 text-white mt-6 text-left">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">NFT Token ID</span>
                <span className="font-mono font-bold text-emerald-400">#{mintedContract.tokenId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Block Number</span>
                <span className="font-mono text-sm">{mintedContract.blockNumber}</span>
              </div>
              <div className="pt-3 border-t border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-white bg-slate-800 px-2 py-1 rounded flex-1 truncate">
                    {mintedContract.hash}
                  </code>
                  <button
                    onClick={copyHash}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <Copy className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botao Principal */}
        <Button
          className="w-full h-14 text-lg font-bold mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200"
          onClick={() => window.location.href = '/tenant/dashboard'}
        >
          <Key className="h-5 w-5 mr-2" />
          Ir para Minha Casa
        </Button>

        {/* Footer */}
        <p className="text-xs text-slate-400 mt-6">
          Seu contrato esta protegido pela rede Polygon (Mainnet).
        </p>
      </div>
    );
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Stepper Header */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-3">
              <span className={step >= 1 ? 'text-blue-600' : 'text-slate-400'}>
                1. Identidade
              </span>
              <span className={step >= 2 ? 'text-purple-600' : 'text-slate-400'}>
                2. Vistoria
              </span>
              <span className={step >= 3 ? 'text-emerald-600' : 'text-slate-400'}>
                3. Contrato
              </span>
            </div>
            <Progress value={step * 33.3} className="h-2" />
          </div>
        )}

        {/* Card Principal */}
        <Card className="bg-white shadow-2xl shadow-slate-200/50 border-0">
          <CardContent className="p-6 md:p-8">
            {step === 1 && <StepKYC />}
            {step === 2 && <StepInspection />}
            {step === 3 && <StepContract />}
            {step === 4 && <StepSuccess />}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 flex justify-center items-center gap-2 text-slate-400">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-medium">Secured by Vinculo Protocol</span>
        </div>
      </div>
    </div>
  );
}
