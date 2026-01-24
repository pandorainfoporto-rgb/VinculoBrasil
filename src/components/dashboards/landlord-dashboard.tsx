/**
 * Dashboard do Locador - Vinculo.io
 *
 * Estilo "Home Broker" imobiliario: organizado, analitico e seguro.
 * Foco em gestao de investimento e fluxo de caixa.
 * Integracao Web3 para conexao de carteira e NFTs.
 *
 * Funcionalidades:
 * - Cadastro completo de imoveis (endereco, taxas, pet-friendly, fotos)
 * - Cadastro de conta bancaria e PIX
 * - Solicitacao de saque
 * - Vistoria de imoveis
 * - Upload de fotos
 */

import { useState, useCallback } from 'react';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import { AdBanner } from '@/components/engine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  PlusCircle,
  TrendingUp,
  Home,
  ArrowUpRight,
  ShieldCheck,
  DollarSign,
  Wallet,
  Activity,
  FileText,
  Download,
  Eye,
  Building2,
  MapPin,
  ExternalLink,
  Loader2,
  LogOut,
  Search,
  Camera,
  Upload,
  X,
  CreditCard,
  Banknote,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Image,
  Trash2,
  Plus,
  BedDouble,
  Bath,
  Car,
  Ruler,
  Dog,
  Cat,
  CircleDollarSign,
  Receipt,
  QrCode,
  User,
  Mail,
  Phone,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Sofa,
  UtensilsCrossed,
  Trees,
} from 'lucide-react';
// WalletConnector removido - nao utiliza mais carteira
import { useWalletConnection } from '@/hooks/use-wallet-connection';
import { useCreateRental } from '@/hooks/use-create-rental';
import {
  ESTADOS_BRASIL,
  CIDADES_PRINCIPAIS,
  TIPOS_IMOVEL,
  COMODIDADES,
  OPCOES_PET,
  BANCOS_BRASIL,
  TIPOS_CONTA,
  TIPOS_CHAVE_PIX,
  buscarCep,
  getCidadesPorEstado,
  formatarCep,
  type CepInfo,
} from '@/data/brasil-geografico';
import {
  downloadTaxReportPDF,
  type TaxReportData,
} from '@/lib/pdf-generator';
import { PhotoUploadWizard, type CapturedPhoto } from '@/components/photo-upload-wizard';

// Props do componente
interface LandlordDashboardProps {
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
}

interface PropertyAsset {
  id: number;
  name: string;
  tenant: string;
  status: 'Alugado' | 'Vago';
  value: string;
  health: 'Em dia' | 'Atrasado' | '-';
  nftId?: string;
  address: string;
  contractEnd?: Date;
  photos?: string[];
  hasInspection?: boolean;
  comodos?: ComodosImovel;
}

interface PortfolioData {
  totalValue: string;
  monthlyRevenue: string;
  occupancyRate: string;
  activeNFTs: number;
  properties: PropertyAsset[];
}

interface EnderecoCompleto {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// Estrutura detalhada de cômodos do imóvel
interface ComodoDetalhe {
  id: string;
  tipo: string;
  nome: string;
  quantidade: number;
}

interface ComodosImovel {
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
  outros: ComodoDetalhe[];
}

interface DadosImovel {
  tipo: string;
  endereco: EnderecoCompleto;
  aluguelMensal: number;
  condominio: number;
  iptu: number;
  taxaAdministracao: number;
  seguroIncendio: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  areaUtil: number;
  petPolicy: string;
  petsPermitidos: string[];
  comodidades: string[];
  descricao: string;
  fotos: File[];
  fotosPreview: string[];
  comodos: ComodosImovel;
}

interface ContaBancaria {
  banco: string;
  agencia: string;
  conta: string;
  digito: string;
  tipoConta: string;
  titularNome: string;
  titularCpfCnpj: string;
}

interface ChavePix {
  tipo: string;
  chave: string;
  apelido: string;
}

interface SolicitacaoSaque {
  valor: number;
  conta: string;
  observacao: string;
}

// Registro de foto de vistoria por cômodo
interface FotoVistoriaComodo {
  comodoId: string;
  comodoNome: string;
  descricao: string;
  estado: 'otimo' | 'bom' | 'regular' | 'ruim';
}

interface Vistoria {
  id: number;
  imovelId: number;
  imovelNome: string;
  data: Date;
  tipo: 'entrada' | 'saida' | 'periodica';
  status: 'agendada' | 'realizada' | 'pendente';
  observacoes: string;
  fotos: string[];
  fotosComodos?: FotoVistoriaComodo[]; // Fotos por cômodo
  comodosPendentes?: number; // Quantidade de cômodos que faltam fotografar
  comodosTotal?: number; // Total de cômodos a fotografar
}

export function LandlordDashboard({ onLogout, userName, userEmail }: LandlordDashboardProps = {}) {
  const { isConnected } = useWalletConnection();
  const { createRental, isPending: isCreating, statusMessage: createStatus } = useCreateRental();

  // Estados do modal
  const [isNewPropertyOpen, setIsNewPropertyOpen] = useState(false);
  const [isBankAccountOpen, setIsBankAccountOpen] = useState(false);
  const [isPixOpen, setIsPixOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyAsset | null>(null);
  const [isAddPhotosOpen, setIsAddPhotosOpen] = useState(false);
  const [propertyPhotosToAdd, setPropertyPhotosToAdd] = useState<{ files: File[]; previews: string[] }>({ files: [], previews: [] });
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // Novos estados para modais
  const [isPhotoWizardOpen, setIsPhotoWizardOpen] = useState(false);
  const [isOwnerProfileOpen, setIsOwnerProfileOpen] = useState(false);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [isInspectionPhotosOpen, setIsInspectionPhotosOpen] = useState(false);
  const [selectedVistoria, setSelectedVistoria] = useState<Vistoria | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Dados mock do proprietario
  const [ownerProfile] = useState({
    name: userName || 'Carlos Eduardo Mendes',
    email: userEmail || 'carlos.mendes@email.com',
    phone: '(11) 98765-4321',
    cpf: '***.***.789-00',
    rating: 4.8,
    totalProperties: 3,
    activeContracts: 2,
    memberSince: new Date('2024-03-15'),
    verifiedEmail: true,
    verifiedPhone: true,
    verifiedDocuments: true,
  });

  // Estados de loading
  const [isBuscandoCep, setIsBuscandoCep] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isSavingPix, setIsSavingPix] = useState(false);
  const [isRequestingWithdraw, setIsRequestingWithdraw] = useState(false);

  // Aba ativa
  const [activeTab, setActiveTab] = useState('ativos');

  // Valores iniciais de cômodos
  const comodosIniciais: ComodosImovel = {
    salas: 1,
    quartos: 1,
    suites: 0,
    banheiros: 1,
    lavabos: 0,
    cozinhas: 1,
    areasServico: 0,
    varandas: 0,
    escritorios: 0,
    despensas: 0,
    garagens: 0,
    jardins: 0,
    piscinas: 0,
    churrasqueiras: 0,
    outros: [],
  };

  // Dados do novo imovel
  const [novoImovel, setNovoImovel] = useState<DadosImovel>({
    tipo: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
    aluguelMensal: 0,
    condominio: 0,
    iptu: 0,
    taxaAdministracao: 5,
    seguroIncendio: 0,
    quartos: 1,
    banheiros: 1,
    vagas: 0,
    areaUtil: 0,
    petPolicy: 'not_allowed',
    petsPermitidos: [],
    comodidades: [],
    descricao: '',
    fotos: [],
    fotosPreview: [],
    comodos: comodosIniciais,
  });

  // Dados bancarios
  const [contaBancaria, setContaBancaria] = useState<ContaBancaria>({
    banco: '',
    agencia: '',
    conta: '',
    digito: '',
    tipoConta: 'checking',
    titularNome: userName || '',
    titularCpfCnpj: '',
  });

  const [contasSalvas, setContasSalvas] = useState<ContaBancaria[]>([]);

  // Dados PIX
  const [chavePix, setChavePix] = useState<ChavePix>({
    tipo: 'cpf',
    chave: '',
    apelido: '',
  });

  const [chavesSalvas, setChavesSalvas] = useState<ChavePix[]>([]);

  // Dados de saque
  const [saque, setSaque] = useState<SolicitacaoSaque>({
    valor: 0,
    conta: '',
    observacao: '',
  });

  const [historicoSaques, setHistoricoSaques] = useState<{
    id: number;
    valor: number;
    data: Date;
    status: 'pendente' | 'processando' | 'concluido';
    conta: string;
  }[]>([
    { id: 1, valor: 10540, data: new Date('2026-01-05'), status: 'concluido', conta: 'Itau **1234' },
    { id: 2, valor: 10540, data: new Date('2025-12-05'), status: 'concluido', conta: 'Itau **1234' },
  ]);

  // Vistorias - Vazio para producao
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);

  const [novaVistoria, setNovaVistoria] = useState({
    imovelId: 0,
    tipo: 'periodica' as 'entrada' | 'saida' | 'periodica',
    data: '',
    observacoes: '',
  });

  // Portfolio data - Vazio para producao
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    totalValue: 'R$ 0,00',
    monthlyRevenue: 'R$ 0,00',
    occupancyRate: '0%',
    activeNFTs: 0,
    properties: [],
  });

  // Monthly revenue data - Vazio para producao
  const [monthlyData] = useState<{ month: string; revenue: number; variation: string }[]>([]);

  // Saldo disponivel para saque
  const saldoDisponivel = 10540;

  // Buscar CEP
  const handleBuscarCep = useCallback(async () => {
    const cepLimpo = novoImovel.endereco.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setIsBuscandoCep(true);
    try {
      const resultado = await buscarCep(cepLimpo);
      if (resultado) {
        setNovoImovel(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep: formatarCep(cepLimpo),
            logradouro: resultado.logradouro,
            bairro: resultado.bairro,
            cidade: resultado.cidade,
            estado: resultado.estado,
          },
        }));
      }
    } finally {
      setIsBuscandoCep(false);
    }
  }, [novoImovel.endereco.cep]);

  // Upload de fotos
  const handleFotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newPreviews.push(event.target?.result as string);
        if (newPreviews.length === files.length) {
          setNovoImovel(prev => ({
            ...prev,
            fotos: [...prev.fotos, ...files],
            fotosPreview: [...prev.fotosPreview, ...newPreviews],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Remover foto
  const handleRemoverFoto = useCallback((index: number) => {
    setNovoImovel(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
      fotosPreview: prev.fotosPreview.filter((_, i) => i !== index),
    }));
  }, []);

  // Upload de fotos para imovel existente
  const handlePropertyPhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newPreviews.push(event.target?.result as string);
        if (newPreviews.length === files.length) {
          setPropertyPhotosToAdd(prev => ({
            files: [...prev.files, ...files],
            previews: [...prev.previews, ...newPreviews],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Remover foto do upload de imovel existente
  const handleRemovePropertyPhoto = useCallback((index: number) => {
    setPropertyPhotosToAdd(prev => ({
      files: prev.files.filter((_, i) => i !== index),
      previews: prev.previews.filter((_, i) => i !== index),
    }));
  }, []);

  // Gerar CID IPFS para arquivo
  const generateIpfsCid = useCallback((fileName: string): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let cid = 'QmVinculo';
    for (let i = 0; i < 32; i++) {
      cid += chars[Math.floor(Math.random() * chars.length)];
    }
    return `ipfs://${cid}/${fileName}`;
  }, []);

  // Salvar fotos do imovel com upload IPFS
  const handleSavePropertyPhotos = useCallback(async () => {
    if (!selectedProperty || propertyPhotosToAdd.files.length === 0) return;

    setIsUploadingPhotos(true);

    try {
      // Simular upload para IPFS
      const ipfsUris: string[] = [];

      for (const file of propertyPhotosToAdd.files) {
        // Simular delay de upload IPFS
        await new Promise(resolve => setTimeout(resolve, 500));
        const ipfsUri = generateIpfsCid(file.name);
        ipfsUris.push(ipfsUri);
      }

      // Atualizar o portfolio com as novas fotos
      setPortfolio(prev => ({
        ...prev,
        properties: prev.properties.map(prop =>
          prop.id === selectedProperty.id
            ? {
                ...prop,
                photos: [...(prop.photos || []), ...propertyPhotosToAdd.previews]
              }
            : prop
        ),
      }));

      // Atualizar selectedProperty para refletir as mudancas
      setSelectedProperty(prev => prev ? {
        ...prev,
        photos: [...(prev.photos || []), ...propertyPhotosToAdd.previews]
      } : null);

      // Limpar o estado de upload
      setPropertyPhotosToAdd({ files: [], previews: [] });
      setIsAddPhotosOpen(false);

      alert(`${ipfsUris.length} foto(s) enviada(s) para IPFS e vinculada(s) ao contrato blockchain!`);
    } catch (error) {
      alert('Erro ao fazer upload das fotos para IPFS');
    } finally {
      setIsUploadingPhotos(false);
    }
  }, [selectedProperty, propertyPhotosToAdd, generateIpfsCid]);

  // Abrir modal de adicionar fotos
  const handleOpenAddPhotos = useCallback(() => {
    setPropertyPhotosToAdd({ files: [], previews: [] });
    setIsAddPhotosOpen(true);
  }, []);

  // Abrir wizard de fotos
  const handleOpenPhotoWizard = useCallback(() => {
    setIsPhotoWizardOpen(true);
  }, []);

  // Callback quando wizard completa
  const handlePhotoWizardComplete = useCallback((photos: CapturedPhoto[]) => {
    if (selectedProperty) {
      // Atualiza as fotos do imovel selecionado
      const newPhotos = photos.map(p => p.preview);
      setPortfolio(prev => ({
        ...prev,
        properties: prev.properties.map(prop =>
          prop.id === selectedProperty.id
            ? { ...prop, photos: [...(prop.photos || []), ...newPhotos] }
            : prop
        ),
      }));
      setSelectedProperty(prev => prev ? { ...prev, photos: [...(prev.photos || []), ...newPhotos] } : null);
    }
    setIsPhotoWizardOpen(false);
  }, [selectedProperty]);

  // Abrir galeria de fotos do imovel
  const handleOpenPhotoGallery = useCallback(() => {
    setCurrentPhotoIndex(0);
    setIsPhotoGalleryOpen(true);
  }, []);

  // Abrir fotos da vistoria
  const handleOpenInspectionPhotos = useCallback((vistoria: Vistoria) => {
    setSelectedVistoria(vistoria);
    setCurrentPhotoIndex(0);
    setIsInspectionPhotosOpen(true);
  }, []);

  // Navegar fotos
  const handlePrevPhoto = useCallback(() => {
    setCurrentPhotoIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNextPhoto = useCallback((maxPhotos: number) => {
    setCurrentPhotoIndex(prev => Math.min(maxPhotos - 1, prev + 1));
  }, []);

  // Abrir link do NFT no blockchain explorer
  const handleOpenBlockchainExplorer = useCallback((nftId: string) => {
    // Abre no Polygonscan (ou outro explorer configurado)
    const explorerUrl = `https://polygonscan.com/token/${nftId}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  }, []);

  // Toggle comodidade
  const toggleComodidade = useCallback((id: string) => {
    setNovoImovel(prev => ({
      ...prev,
      comodidades: prev.comodidades.includes(id)
        ? prev.comodidades.filter(c => c !== id)
        : [...prev.comodidades, id],
    }));
  }, []);

  // Cadastrar novo imovel
  const handleNewProperty = async () => {
    if (!isConnected) {
      alert('Conecte sua carteira para cadastrar um imovel');
      return;
    }

    const result = await createRental({
      tenantAddress: '0x0000000000000000000000000000000000000000',
      guarantorAddress: '0x0000000000000000000000000000000000000000',
      insurerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD99',
      rentAmountWei: BigInt(novoImovel.aluguelMensal * 10000),
      durationSeconds: 365 * 24 * 60 * 60,
      collateralPropertyId: 'PROP-' + Date.now(),
    });

    if (result?.success) {
      // Adicionar ao portfolio
      const novoProperty: PropertyAsset = {
        id: portfolio.properties.length + 1,
        name: `${TIPOS_IMOVEL.find(t => t.value === novoImovel.tipo)?.label || 'Imovel'} ${novoImovel.endereco.bairro}`,
        tenant: '-',
        status: 'Vago',
        value: `R$ ${novoImovel.aluguelMensal.toLocaleString('pt-BR')},00`,
        health: '-',
        address: `${novoImovel.endereco.logradouro}, ${novoImovel.endereco.numero} - ${novoImovel.endereco.cidade}, ${novoImovel.endereco.estado}`,
        photos: novoImovel.fotosPreview,
        hasInspection: false,
        comodos: { ...novoImovel.comodos },
      };

      setPortfolio(prev => ({
        ...prev,
        properties: [...prev.properties, novoProperty],
      }));

      setIsNewPropertyOpen(false);
      // Reset form
      setNovoImovel({
        tipo: '',
        endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' },
        aluguelMensal: 0,
        condominio: 0,
        iptu: 0,
        taxaAdministracao: 5,
        seguroIncendio: 0,
        quartos: 1,
        banheiros: 1,
        vagas: 0,
        areaUtil: 0,
        petPolicy: 'not_allowed',
        petsPermitidos: [],
        comodidades: [],
        descricao: '',
        fotos: [],
        fotosPreview: [],
        comodos: comodosIniciais,
      });
      alert('Imovel cadastrado e tokenizado com sucesso!');
    }
  };

  // Salvar conta bancaria
  const handleSalvarContaBancaria = async () => {
    setIsSavingBank(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setContasSalvas(prev => [...prev, { ...contaBancaria }]);
    setContaBancaria({
      banco: '',
      agencia: '',
      conta: '',
      digito: '',
      tipoConta: 'checking',
      titularNome: userName || '',
      titularCpfCnpj: '',
    });
    setIsSavingBank(false);
    setIsBankAccountOpen(false);
    alert('Conta bancaria cadastrada com sucesso!');
  };

  // Salvar chave PIX
  const handleSalvarPix = async () => {
    setIsSavingPix(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setChavesSalvas(prev => [...prev, { ...chavePix }]);
    setChavePix({ tipo: 'cpf', chave: '', apelido: '' });
    setIsSavingPix(false);
    setIsPixOpen(false);
    alert('Chave PIX cadastrada com sucesso!');
  };

  // Solicitar saque
  const handleSolicitarSaque = async () => {
    if (saque.valor <= 0 || saque.valor > saldoDisponivel) {
      alert('Valor invalido para saque');
      return;
    }
    if (!saque.conta) {
      alert('Selecione uma conta para receber o saque');
      return;
    }

    setIsRequestingWithdraw(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setHistoricoSaques(prev => [
      {
        id: prev.length + 1,
        valor: saque.valor,
        data: new Date(),
        status: 'pendente',
        conta: saque.conta,
      },
      ...prev,
    ]);

    setSaque({ valor: 0, conta: '', observacao: '' });
    setIsRequestingWithdraw(false);
    setIsWithdrawOpen(false);
    alert('Solicitacao de saque enviada! O valor sera creditado em ate 2 dias uteis.');
  };

  // Agendar vistoria
  // Calcula o total de cômodos de um imóvel para vistoria
  const calcularTotalComodos = (comodos?: ComodosImovel): number => {
    if (!comodos) return 1; // Pelo menos a fachada
    return 1 + Object.entries(comodos)
      .filter(([key]) => key !== 'outros')
      .reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0);
  };

  const handleAgendarVistoria = async () => {
    if (!novaVistoria.imovelId || !novaVistoria.data) {
      alert('Preencha todos os campos obrigatorios');
      return;
    }

    const imovel = portfolio.properties.find(p => p.id === novaVistoria.imovelId);
    const totalComodos = calcularTotalComodos(imovel?.comodos);

    const novaV: Vistoria = {
      id: vistorias.length + 1,
      imovelId: novaVistoria.imovelId,
      imovelNome: imovel?.name || '',
      data: new Date(novaVistoria.data),
      tipo: novaVistoria.tipo,
      status: 'agendada',
      observacoes: novaVistoria.observacoes,
      fotos: [],
      fotosComodos: [],
      comodosPendentes: totalComodos,
      comodosTotal: totalComodos,
    };

    setVistorias(prev => [...prev, novaV]);
    setNovaVistoria({ imovelId: 0, tipo: 'periodica', data: '', observacoes: '' });
    setIsInspectionOpen(false);
    alert(`Vistoria agendada com sucesso! ${totalComodos} ambientes para fotografar.`);
  };

  const occupancyPercent = parseInt(portfolio.occupancyRate);

  // Handler para exportar relatorio de IR
  const handleExportTaxReport = () => {
    const totalGross = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
    const totalNet = Math.round(totalGross * 0.85);

    const taxReportData: TaxReportData = {
      landlordName: userName || 'Proprietario',
      landlordCPF: '***.***.***-**', // CPF mascarado por seguranca
      year: new Date().getFullYear(),
      properties: portfolio.properties.map(p => ({
        address: p.address,
        monthlyRent: parseFloat(p.value.replace(/[^\d,]/g, '').replace(',', '.')),
        monthlyNet: parseFloat(p.value.replace(/[^\d,]/g, '').replace(',', '.')) * 0.85,
      })),
      monthlyData: monthlyData.map(m => ({
        month: `${m.month}/2026`,
        grossRevenue: m.revenue,
        netRevenue: Math.round(m.revenue * 0.85),
      })),
      totalGrossRevenue: totalGross,
      totalNetRevenue: totalNet,
    };

    downloadTaxReportPDF(taxReportData);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      {/* Header Locador - Estilo App */}
      <header className="bg-background p-4 lg:p-6 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <VinculoBrasilLogo size="sm" />
            <div className="border-l pl-4">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Area do Proprietario</h1>
              <p className="text-xs lg:text-sm text-slate-500">Gestao de patrimonio e recebiveis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {userName && (
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-slate-500">{userEmail}</p>
              </div>
            )}
            {onLogout && (
              <Button variant="ghost" size="sm" onClick={onLogout} title="Sair" className="text-slate-600 hover:text-slate-900">
                <LogOut size={20} />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Banner de Anuncios */}
        <AdBanner placement="header" clientType="landlord" maxAds={3} />

        {/* Navegacao por Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="ativos" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Meus Ativos</span>
              <span className="sm:hidden">Ativos</span>
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Financeiro</span>
              <span className="sm:hidden">Fin.</span>
            </TabsTrigger>
            <TabsTrigger value="contas" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Contas/PIX</span>
              <span className="sm:hidden">Contas</span>
            </TabsTrigger>
            <TabsTrigger value="vistorias" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Vistorias</span>
              <span className="sm:hidden">Vist.</span>
            </TabsTrigger>
            <TabsTrigger value="saques" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              <span className="hidden sm:inline">Saques</span>
              <span className="sm:hidden">Saq.</span>
            </TabsTrigger>
          </TabsList>

          {/* ===================== TAB: MEUS ATIVOS ===================== */}
          <TabsContent value="ativos" className="space-y-6 mt-6">
            {/* Cards de Performance - clicaveis */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card
                className="bg-background rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                onClick={() => setActiveTab('financeiro')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                      <TrendingUp size={20} />
                    </div>
                    <span className="text-sm font-semibold text-slate-500">Receita Mensal</span>
                  </div>
                  <p className="text-2xl font-black">{portfolio.monthlyRevenue}</p>
                  <span className="text-xs text-emerald-600 font-bold">+4.2% em relacao ao mes anterior</span>
                  <p className="text-xs text-indigo-600 mt-2">Ver financeiro →</p>
                </CardContent>
              </Card>

              <Card className="bg-background rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                      <Home size={20} />
                    </div>
                    <span className="text-sm font-semibold text-slate-500">Taxa de Ocupacao</span>
                  </div>
                  <p className="text-2xl font-black">{portfolio.occupancyRate}</p>
                  <Progress value={occupancyPercent} className="mt-2" />
                  <p className="text-xs text-indigo-600 mt-2">Ver imoveis vagos →</p>
                </CardContent>
              </Card>

              <Card
                className="bg-background rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                onClick={() => setActiveTab('vistorias')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                      <ShieldCheck size={20} />
                    </div>
                    <span className="text-sm font-semibold text-slate-500">Garantias Ativas</span>
                  </div>
                  <p className="text-2xl font-black">{portfolio.activeNFTs} NFTs</p>
                  <span className="text-xs text-slate-500">Contratos auditados na rede</span>
                  <p className="text-xs text-amber-600 mt-2">Ver contratos →</p>
                </CardContent>
              </Card>

              <Card
                className="bg-background rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                onClick={() => setActiveTab('saques')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                      <Wallet size={20} />
                    </div>
                    <span className="text-sm font-semibold text-slate-500">Saldo Disponivel</span>
                  </div>
                  <p className="text-2xl font-black">R$ {saldoDisponivel.toLocaleString('pt-BR')},00</p>
                  <Button size="sm" variant="link" className="p-0 text-violet-600" onClick={(e) => { e.stopPropagation(); setIsWithdrawOpen(true); }}>
                    Solicitar Saque
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Botao Novo Imovel */}
            <div className="flex justify-end">
              <Dialog open={isNewPropertyOpen} onOpenChange={setIsNewPropertyOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-indigo-600 text-foreground px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                    <PlusCircle size={18} />
                    Cadastrar Novo Imovel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-indigo-600" />
                      Cadastrar Novo Imovel
                    </DialogTitle>
                    <DialogDescription>
                      Preencha todos os dados do imovel para anuncio na plataforma
                    </DialogDescription>
                  </DialogHeader>

                  <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-6 py-4">
                        {/* Secao: Tipo de Imovel */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                            Tipo de Imovel
                          </h3>
                          <Select value={novoImovel.tipo} onValueChange={(v) => setNovoImovel(prev => ({ ...prev, tipo: v }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de imovel" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIPOS_IMOVEL.map((tipo) => (
                                <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator />

                        {/* Secao: Endereco Completo */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-indigo-600" />
                            Endereco Completo
                          </h3>

                          {/* CEP com busca */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>CEP *</Label>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="00000-000"
                                  value={novoImovel.endereco.cep}
                                  onChange={(e) => setNovoImovel(prev => ({
                                    ...prev,
                                    endereco: { ...prev.endereco, cep: e.target.value }
                                  }))}
                                  maxLength={9}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleBuscarCep}
                                  disabled={isBuscandoCep}
                                >
                                  {isBuscandoCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Estado *</Label>
                              <Select
                                value={novoImovel.endereco.estado}
                                onValueChange={(v) => setNovoImovel(prev => ({
                                  ...prev,
                                  endereco: { ...prev.endereco, estado: v, cidade: '' }
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ESTADOS_BRASIL.map((estado) => (
                                    <SelectItem key={estado.sigla} value={estado.sigla}>
                                      {estado.nome} ({estado.sigla})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Cidade *</Label>
                              <Select
                                value={novoImovel.endereco.cidade}
                                onValueChange={(v) => setNovoImovel(prev => ({
                                  ...prev,
                                  endereco: { ...prev.endereco, cidade: v }
                                }))}
                                disabled={!novoImovel.endereco.estado}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getCidadesPorEstado(novoImovel.endereco.estado).map((cidade) => (
                                    <SelectItem key={cidade.nome} value={cidade.nome}>{cidade.nome}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Logradouro (Rua, Avenida, etc.) *</Label>
                            <Input
                              placeholder="Avenida Paulista"
                              value={novoImovel.endereco.logradouro}
                              onChange={(e) => setNovoImovel(prev => ({
                                ...prev,
                                endereco: { ...prev.endereco, logradouro: e.target.value }
                              }))}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Numero *</Label>
                              <Input
                                placeholder="1000"
                                value={novoImovel.endereco.numero}
                                onChange={(e) => setNovoImovel(prev => ({
                                  ...prev,
                                  endereco: { ...prev.endereco, numero: e.target.value }
                                }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Complemento</Label>
                              <Input
                                placeholder="Apto 402, Bloco A"
                                value={novoImovel.endereco.complemento}
                                onChange={(e) => setNovoImovel(prev => ({
                                  ...prev,
                                  endereco: { ...prev.endereco, complemento: e.target.value }
                                }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Bairro *</Label>
                              <Input
                                placeholder="Bela Vista"
                                value={novoImovel.endereco.bairro}
                                onChange={(e) => setNovoImovel(prev => ({
                                  ...prev,
                                  endereco: { ...prev.endereco, bairro: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Secao: Caracteristicas Gerais */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Ruler className="h-5 w-5 text-indigo-600" />
                            Caracteristicas Gerais
                          </h3>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label className="flex items-center gap-1">
                                <Ruler className="h-4 w-4" /> Area Util (m²)
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                value={novoImovel.areaUtil}
                                onChange={(e) => setNovoImovel(prev => ({ ...prev, areaUtil: parseInt(e.target.value) || 0 }))}
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Secao: Comodos Detalhados */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Home className="h-5 w-5 text-indigo-600" />
                            Comodos do Imovel
                          </h3>
                          <p className="text-sm text-slate-500">
                            Informe a quantidade de cada tipo de comodo. Esses dados serao usados para orientar a vistoria e upload de fotos.
                          </p>

                          {/* Comodos Internos Principais */}
                          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                            <h4 className="font-medium text-sm text-slate-700">Comodos Internos</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <Sofa className="h-4 w-4" /> Salas
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.salas}
                                  onChange={(e) => setNovoImovel(prev => ({
                                    ...prev,
                                    comodos: { ...prev.comodos, salas: parseInt(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <BedDouble className="h-4 w-4" /> Quartos
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.quartos}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setNovoImovel(prev => ({
                                      ...prev,
                                      quartos: val,
                                      comodos: { ...prev.comodos, quartos: val }
                                    }));
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <Sparkles className="h-4 w-4" /> Suites
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.suites}
                                  onChange={(e) => setNovoImovel(prev => ({
                                    ...prev,
                                    comodos: { ...prev.comodos, suites: parseInt(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <Bath className="h-4 w-4" /> Banheiros
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.banheiros}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setNovoImovel(prev => ({
                                      ...prev,
                                      banheiros: val,
                                      comodos: { ...prev.comodos, banheiros: val }
                                    }));
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <Bath className="h-4 w-4" /> Lavabos
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.lavabos}
                                  onChange={(e) => setNovoImovel(prev => ({
                                    ...prev,
                                    comodos: { ...prev.comodos, lavabos: parseInt(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <UtensilsCrossed className="h-4 w-4" /> Cozinhas
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.cozinhas}
                                  onChange={(e) => setNovoImovel(prev => ({
                                    ...prev,
                                    comodos: { ...prev.comodos, cozinhas: parseInt(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <Home className="h-4 w-4" /> Areas Servico
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.areasServico}
                                  onChange={(e) => setNovoImovel(prev => ({
                                    ...prev,
                                    comodos: { ...prev.comodos, areasServico: parseInt(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" /> Escritorios
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.escritorios}
                                  onChange={(e) => setNovoImovel(prev => ({
                                    ...prev,
                                    comodos: { ...prev.comodos, escritorios: parseInt(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <Home className="h-4 w-4" /> Despensas
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.despensas}
                                  onChange={(e) => setNovoImovel(prev => ({
                                    ...prev,
                                    comodos: { ...prev.comodos, despensas: parseInt(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Areas Externas */}
                          <div className="bg-emerald-50 rounded-xl p-4 space-y-4">
                            <h4 className="font-medium text-sm text-emerald-700">Areas Externas</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <Trees className="h-4 w-4" /> Varandas
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.varandas}
                                  onChange={(e) => setNovoImovel(prev => ({
                                    ...prev,
                                    comodos: { ...prev.comodos, varandas: parseInt(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <Car className="h-4 w-4" /> Garagens/Vagas
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.garagens}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setNovoImovel(prev => ({
                                      ...prev,
                                      vagas: val,
                                      comodos: { ...prev.comodos, garagens: val }
                                    }));
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <Trees className="h-4 w-4" /> Jardins
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.jardins}
                                  onChange={(e) => setNovoImovel(prev => ({
                                    ...prev,
                                    comodos: { ...prev.comodos, jardins: parseInt(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <Activity className="h-4 w-4" /> Piscinas
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.piscinas}
                                  onChange={(e) => setNovoImovel(prev => ({
                                    ...prev,
                                    comodos: { ...prev.comodos, piscinas: parseInt(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                  <Home className="h-4 w-4" /> Churrasqueiras
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={novoImovel.comodos.churrasqueiras}
                                  onChange={(e) => setNovoImovel(prev => ({
                                    ...prev,
                                    comodos: { ...prev.comodos, churrasqueiras: parseInt(e.target.value) || 0 }
                                  }))}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Resumo de Comodos */}
                          <Card className="bg-indigo-50 border-indigo-200">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-indigo-700">Total de Comodos para Vistoria:</span>
                                <Badge className="bg-indigo-600 text-white text-lg px-4">
                                  {Object.entries(novoImovel.comodos)
                                    .filter(([key]) => key !== 'outros')
                                    .reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0) + 1} ambientes
                                </Badge>
                              </div>
                              <p className="text-xs text-indigo-500 mt-2">
                                Inclui fachada + todos os comodos cadastrados. A vistoria e upload de fotos usara essa quantidade.
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <Separator />

                        {/* Secao: Valores e Taxas */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <CircleDollarSign className="h-5 w-5 text-indigo-600" />
                            Valores e Taxas
                          </h3>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Aluguel Mensal (R$) *</Label>
                              <Input
                                type="number"
                                min={0}
                                placeholder="3500"
                                value={novoImovel.aluguelMensal || ''}
                                onChange={(e) => setNovoImovel(prev => ({ ...prev, aluguelMensal: parseFloat(e.target.value) || 0 }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Condominio (R$)</Label>
                              <Input
                                type="number"
                                min={0}
                                placeholder="800"
                                value={novoImovel.condominio || ''}
                                onChange={(e) => setNovoImovel(prev => ({ ...prev, condominio: parseFloat(e.target.value) || 0 }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>IPTU Mensal (R$)</Label>
                              <Input
                                type="number"
                                min={0}
                                placeholder="200"
                                value={novoImovel.iptu || ''}
                                onChange={(e) => setNovoImovel(prev => ({ ...prev, iptu: parseFloat(e.target.value) || 0 }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Taxa Admin. (%)</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={novoImovel.taxaAdministracao}
                                onChange={(e) => setNovoImovel(prev => ({ ...prev, taxaAdministracao: parseFloat(e.target.value) || 0 }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Seguro Incendio (R$/mes)</Label>
                              <Input
                                type="number"
                                min={0}
                                placeholder="50"
                                value={novoImovel.seguroIncendio || ''}
                                onChange={(e) => setNovoImovel(prev => ({ ...prev, seguroIncendio: parseFloat(e.target.value) || 0 }))}
                              />
                            </div>
                          </div>

                          {/* Resumo de custos */}
                          <Card className="bg-slate-50 border-slate-200">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Total Mensal para Inquilino:</span>
                                <span className="font-bold text-lg">
                                  R$ {(novoImovel.aluguelMensal + novoImovel.condominio + novoImovel.iptu + novoImovel.seguroIncendio).toLocaleString('pt-BR')},00
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm mt-2">
                                <span className="text-slate-600">Sua Receita Liquida (apos taxas):</span>
                                <span className="font-bold text-emerald-600">
                                  R$ {Math.round(novoImovel.aluguelMensal * (1 - novoImovel.taxaAdministracao / 100)).toLocaleString('pt-BR')},00
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Separator />

                        {/* Secao: Pet-Friendly */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Dog className="h-5 w-5 text-indigo-600" />
                            Politica de Pets
                          </h3>

                          <Select value={novoImovel.petPolicy} onValueChange={(v) => setNovoImovel(prev => ({ ...prev, petPolicy: v }))}>
                            <SelectTrigger className="w-full md:w-1/2">
                              <SelectValue placeholder="Selecione a politica de pets" />
                            </SelectTrigger>
                            <SelectContent>
                              {OPCOES_PET.map((opcao) => (
                                <SelectItem key={opcao.value} value={opcao.value}>{opcao.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {novoImovel.petPolicy !== 'not_allowed' && (
                            <div className="flex flex-wrap gap-4 mt-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="pet-dog"
                                  checked={novoImovel.petsPermitidos.includes('dog')}
                                  onCheckedChange={(checked) => {
                                    setNovoImovel(prev => ({
                                      ...prev,
                                      petsPermitidos: checked
                                        ? [...prev.petsPermitidos, 'dog']
                                        : prev.petsPermitidos.filter(p => p !== 'dog')
                                    }));
                                  }}
                                />
                                <Label htmlFor="pet-dog" className="flex items-center gap-1">
                                  <Dog className="h-4 w-4" /> Cachorros
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="pet-cat"
                                  checked={novoImovel.petsPermitidos.includes('cat')}
                                  onCheckedChange={(checked) => {
                                    setNovoImovel(prev => ({
                                      ...prev,
                                      petsPermitidos: checked
                                        ? [...prev.petsPermitidos, 'cat']
                                        : prev.petsPermitidos.filter(p => p !== 'cat')
                                    }));
                                  }}
                                />
                                <Label htmlFor="pet-cat" className="flex items-center gap-1">
                                  <Cat className="h-4 w-4" /> Gatos
                                </Label>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Secao: Comodidades */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Comodidades</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {COMODIDADES.map((comodidade) => (
                              <div key={comodidade.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={comodidade.id}
                                  checked={novoImovel.comodidades.includes(comodidade.id)}
                                  onCheckedChange={() => toggleComodidade(comodidade.id)}
                                />
                                <Label htmlFor={comodidade.id} className="text-sm">{comodidade.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Secao: Descricao */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Descricao do Imovel</h3>
                          <Textarea
                            placeholder="Descreva o imovel detalhadamente: diferenciais, estado de conservacao, vista, proximidade de transporte, comercio, etc."
                            className="min-h-[120px]"
                            value={novoImovel.descricao}
                            onChange={(e) => setNovoImovel(prev => ({ ...prev, descricao: e.target.value }))}
                          />
                        </div>

                        <Separator />

                        {/* Secao: Fotos */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Camera className="h-5 w-5 text-indigo-600" />
                            Fotos do Imovel
                          </h3>
                          <p className="text-sm text-slate-500">
                            Adicione fotos de qualidade para atrair mais interessados. Recomendamos pelo menos 5 fotos.
                          </p>

                          {/* Upload area */}
                          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleFotoUpload}
                              className="hidden"
                              id="foto-upload"
                            />
                            <label htmlFor="foto-upload" className="cursor-pointer">
                              <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm text-slate-600">Clique para selecionar fotos</p>
                              <p className="text-xs text-slate-400">PNG, JPG ou WEBP ate 5MB cada</p>
                            </label>
                          </div>

                          {/* Preview das fotos */}
                          {novoImovel.fotosPreview.length > 0 && (
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                              {novoImovel.fotosPreview.map((preview, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                  <img src={preview} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoverFoto(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>

                  {(
                    <>
                      {isCreating && (
                        <div className="p-4 bg-indigo-50 rounded-lg text-center">
                          <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-indigo-900">{createStatus}</p>
                        </div>
                      )}

                      <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setIsNewPropertyOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleNewProperty}
                          disabled={isCreating || !novoImovel.tipo || !novoImovel.endereco.cep || !novoImovel.aluguelMensal}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Tokenizando...
                            </>
                          ) : (
                            <>
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Cadastrar e Tokenizar
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            {/* Tabela de Imoveis */}
            <Card className="bg-background rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Status dos Imoveis</h3>
                  <p className="text-sm text-slate-500">Gestao em tempo real com status blockchain</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-slate-400 text-xs uppercase font-bold px-6 py-4">Imovel</TableHead>
                      <TableHead className="text-slate-400 text-xs uppercase font-bold px-6 py-4">Status</TableHead>
                      <TableHead className="text-slate-400 text-xs uppercase font-bold px-6 py-4">Inquilino</TableHead>
                      <TableHead className="text-slate-400 text-xs uppercase font-bold px-6 py-4">Recebivel</TableHead>
                      <TableHead className="text-slate-400 text-xs uppercase font-bold px-6 py-4">Fotos</TableHead>
                      <TableHead className="text-slate-400 text-xs uppercase font-bold px-6 py-4">Vistoria</TableHead>
                      <TableHead className="text-slate-400 text-xs uppercase font-bold px-6 py-4">Acao</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {portfolio.properties.map((prop) => (
                      <TableRow key={prop.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="px-6 py-4">
                          <div>
                            <p className="font-bold text-sm text-slate-700">{prop.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin size={12} />
                              {prop.address.slice(0, 30)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              prop.status === 'Alugado'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {prop.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-600">{prop.tenant}</TableCell>
                        <TableCell className="px-6 py-4 font-bold text-sm">{prop.value}</TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Image className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">{prop.photos?.length || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {prop.hasInspection ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              OK
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-400 hover:text-indigo-600"
                              onClick={() => {
                                setSelectedProperty(prop);
                                setIsPropertyDetailsOpen(true);
                              }}
                            >
                              <Eye size={18} />
                            </Button>
                            {prop.nftId && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-slate-400 hover:text-indigo-600"
                                    onClick={() => handleOpenBlockchainExplorer(prop.nftId!)}
                                  >
                                    <ExternalLink size={18} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Ver NFT no Blockchain Explorer
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Split de Pagamentos */}
            <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl text-foreground overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">Split Automatico de Pagamentos</h3>
                    <p className="text-indigo-200 text-sm">Distribuicao tokenizada na blockchain</p>
                  </div>
                  <Activity className="h-8 w-8 text-indigo-200" />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-background/10 rounded-2xl p-4 backdrop-blur-sm">
                    <p className="text-indigo-200 text-xs mb-1">Locador (Voce)</p>
                    <p className="text-3xl font-black">85%</p>
                    <p className="text-sm text-indigo-100 mt-1">R$ 10.540,00</p>
                  </div>
                  <div className="bg-background/10 rounded-2xl p-4 backdrop-blur-sm">
                    <p className="text-indigo-200 text-xs mb-1">Seguradora</p>
                    <p className="text-3xl font-black">5%</p>
                    <p className="text-sm text-indigo-100 mt-1">R$ 620,00</p>
                  </div>
                  <div className="bg-background/10 rounded-2xl p-4 backdrop-blur-sm">
                    <p className="text-indigo-200 text-xs mb-1">Plataforma</p>
                    <p className="text-3xl font-black">5%</p>
                    <p className="text-sm text-indigo-100 mt-1">R$ 620,00</p>
                  </div>
                  <div className="bg-background/10 rounded-2xl p-4 backdrop-blur-sm">
                    <p className="text-indigo-200 text-xs mb-1">Garantidor</p>
                    <p className="text-3xl font-black">5%</p>
                    <p className="text-sm text-indigo-100 mt-1">R$ 620,00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================== TAB: FINANCEIRO ===================== */}
          <TabsContent value="financeiro" className="space-y-6 mt-6">
            <Card className="bg-background rounded-3xl shadow-sm border border-slate-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Evolucao de Receitas</CardTitle>
                    <CardDescription>Historico de recebimentos por mes</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportTaxReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar IR (PDF)
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mes</TableHead>
                      <TableHead>Receita Bruta</TableHead>
                      <TableHead>Receita Liquida (85%)</TableHead>
                      <TableHead>Variacao</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{data.month}/2026</TableCell>
                        <TableCell>R$ {data.revenue.toLocaleString('pt-BR')}</TableCell>
                        <TableCell>R$ {Math.round(data.revenue * 0.85).toLocaleString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              data.variation.startsWith('+')
                                ? 'bg-emerald-100 text-emerald-700'
                                : data.variation.startsWith('-')
                                  ? 'bg-red-500/10 text-red-700'
                                  : 'bg-slate-100 text-slate-600'
                            }
                          >
                            {data.variation}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Info sobre DIMOB/IR */}
            <Card className="bg-blue-50 border-blue-200 rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <FileText className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900">Compliance Fiscal Automatico</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Todos os rendimentos sao automaticamente reportados para a DIMOB da Receita Federal.
                      Voce pode exportar o relatorio para declaracao de Imposto de Renda a qualquer momento.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================== TAB: CONTAS/PIX ===================== */}
          <TabsContent value="contas" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contas Bancarias */}
              <Card className="bg-background rounded-3xl shadow-sm border border-slate-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-indigo-600" />
                        Contas Bancarias
                      </CardTitle>
                      <CardDescription>Cadastre suas contas para receber saques</CardDescription>
                    </div>
                    <Dialog open={isBankAccountOpen} onOpenChange={setIsBankAccountOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          <Plus className="h-4 w-4 mr-1" />
                          Nova Conta
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Cadastrar Conta Bancaria</DialogTitle>
                          <DialogDescription>
                            Adicione uma conta para receber seus saques
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label>Banco *</Label>
                            <Select
                              value={contaBancaria.banco}
                              onValueChange={(v) => setContaBancaria(prev => ({ ...prev, banco: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o banco" />
                              </SelectTrigger>
                              <SelectContent>
                                {BANCOS_BRASIL.map((banco) => (
                                  <SelectItem key={banco.codigo} value={banco.codigo}>
                                    {banco.codigo} - {banco.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Agencia *</Label>
                              <Input
                                placeholder="0001"
                                value={contaBancaria.agencia}
                                onChange={(e) => setContaBancaria(prev => ({ ...prev, agencia: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tipo de Conta *</Label>
                              <Select
                                value={contaBancaria.tipoConta}
                                onValueChange={(v) => setContaBancaria(prev => ({ ...prev, tipoConta: v }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIPOS_CONTA.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                              <Label>Numero da Conta *</Label>
                              <Input
                                placeholder="12345678"
                                value={contaBancaria.conta}
                                onChange={(e) => setContaBancaria(prev => ({ ...prev, conta: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Digito *</Label>
                              <Input
                                placeholder="0"
                                maxLength={2}
                                value={contaBancaria.digito}
                                onChange={(e) => setContaBancaria(prev => ({ ...prev, digito: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Nome do Titular *</Label>
                            <Input
                              placeholder="Nome completo"
                              value={contaBancaria.titularNome}
                              onChange={(e) => setContaBancaria(prev => ({ ...prev, titularNome: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>CPF/CNPJ do Titular *</Label>
                            <Input
                              placeholder="000.000.000-00"
                              value={contaBancaria.titularCpfCnpj}
                              onChange={(e) => setContaBancaria(prev => ({ ...prev, titularCpfCnpj: e.target.value }))}
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsBankAccountOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleSalvarContaBancaria}
                            disabled={isSavingBank || !contaBancaria.banco || !contaBancaria.agencia || !contaBancaria.conta}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            {isSavingBank ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              'Salvar Conta'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {contasSalvas.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>Nenhuma conta cadastrada</p>
                      <p className="text-sm">Adicione uma conta para receber saques</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contasSalvas.map((conta, index) => {
                        const bancoInfo = BANCOS_BRASIL.find(b => b.codigo === conta.banco);
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                              <p className="font-medium">{bancoInfo?.nome}</p>
                              <p className="text-sm text-slate-500">
                                Ag: {conta.agencia} | Conta: **{conta.conta.slice(-4)}-{conta.digito}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chaves PIX */}
              <Card className="bg-background rounded-3xl shadow-sm border border-slate-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-indigo-600" />
                        Chaves PIX
                      </CardTitle>
                      <CardDescription>Cadastre suas chaves PIX para transferencias rapidas</CardDescription>
                    </div>
                    <Dialog open={isPixOpen} onOpenChange={setIsPixOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          <Plus className="h-4 w-4 mr-1" />
                          Nova Chave
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Cadastrar Chave PIX</DialogTitle>
                          <DialogDescription>
                            Adicione uma chave PIX para receber pagamentos
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label>Tipo de Chave *</Label>
                            <Select
                              value={chavePix.tipo}
                              onValueChange={(v) => setChavePix(prev => ({ ...prev, tipo: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIPOS_CHAVE_PIX.map((tipo) => (
                                  <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Chave *</Label>
                            <Input
                              placeholder={
                                chavePix.tipo === 'cpf' ? '000.000.000-00' :
                                chavePix.tipo === 'cnpj' ? '00.000.000/0000-00' :
                                chavePix.tipo === 'email' ? 'email@exemplo.com' :
                                chavePix.tipo === 'phone' ? '+55 11 99999-9999' :
                                'Chave aleatoria'
                              }
                              value={chavePix.chave}
                              onChange={(e) => setChavePix(prev => ({ ...prev, chave: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Apelido (opcional)</Label>
                            <Input
                              placeholder="Ex: PIX Principal"
                              value={chavePix.apelido}
                              onChange={(e) => setChavePix(prev => ({ ...prev, apelido: e.target.value }))}
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsPixOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleSalvarPix}
                            disabled={isSavingPix || !chavePix.chave}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            {isSavingPix ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              'Salvar Chave'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {chavesSalvas.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <QrCode className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>Nenhuma chave cadastrada</p>
                      <p className="text-sm">Adicione uma chave PIX</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chavesSalvas.map((chave, index) => {
                        const tipoInfo = TIPOS_CHAVE_PIX.find(t => t.value === chave.tipo);
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                              <p className="font-medium">{chave.apelido || tipoInfo?.label}</p>
                              <p className="text-sm text-slate-500">{chave.chave}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ===================== TAB: VISTORIAS ===================== */}
          <TabsContent value="vistorias" className="space-y-6 mt-6">
            <Card className="bg-background rounded-3xl shadow-sm border border-slate-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                      Vistorias de Imoveis
                    </CardTitle>
                    <CardDescription>Acompanhe e agende vistorias dos seus imoveis</CardDescription>
                  </div>
                  <Dialog open={isInspectionOpen} onOpenChange={setIsInspectionOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4 mr-1" />
                        Agendar Vistoria
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Agendar Vistoria</DialogTitle>
                        <DialogDescription>
                          Agende uma vistoria para seu imovel
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Imovel *</Label>
                          <Select
                            value={novaVistoria.imovelId.toString()}
                            onValueChange={(v) => setNovaVistoria(prev => ({ ...prev, imovelId: parseInt(v) }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o imovel" />
                            </SelectTrigger>
                            <SelectContent>
                              {portfolio.properties.map((prop) => (
                                <SelectItem key={prop.id} value={prop.id.toString()}>
                                  {prop.name} ({calcularTotalComodos(prop.comodos)} ambientes)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Info sobre cômodos do imóvel selecionado */}
                        {novaVistoria.imovelId > 0 && (() => {
                          const imovelSelecionado = portfolio.properties.find(p => p.id === novaVistoria.imovelId);
                          const totalComodos = calcularTotalComodos(imovelSelecionado?.comodos);
                          return (
                            <Card className="bg-indigo-50 border-indigo-200">
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2 text-indigo-700">
                                  <Home className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {totalComodos} ambientes para vistoriar
                                  </span>
                                </div>
                                {imovelSelecionado?.comodos && (
                                  <p className="text-xs text-indigo-500 mt-1">
                                    Fachada + {imovelSelecionado.comodos.salas > 0 ? `${imovelSelecionado.comodos.salas} sala(s), ` : ''}
                                    {imovelSelecionado.comodos.quartos > 0 ? `${imovelSelecionado.comodos.quartos} quarto(s), ` : ''}
                                    {imovelSelecionado.comodos.banheiros > 0 ? `${imovelSelecionado.comodos.banheiros} banheiro(s)` : ''}
                                    {(imovelSelecionado.comodos.cozinhas || 0) + (imovelSelecionado.comodos.varandas || 0) + (imovelSelecionado.comodos.garagens || 0) > 0 ? ', ...' : ''}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })()}

                        <div className="space-y-2">
                          <Label>Tipo de Vistoria *</Label>
                          <Select
                            value={novaVistoria.tipo}
                            onValueChange={(v) => setNovaVistoria(prev => ({ ...prev, tipo: v as 'entrada' | 'saida' | 'periodica' }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entrada">Entrada</SelectItem>
                              <SelectItem value="saida">Saida</SelectItem>
                              <SelectItem value="periodica">Periodica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Data *</Label>
                          <Input
                            type="date"
                            value={novaVistoria.data}
                            onChange={(e) => setNovaVistoria(prev => ({ ...prev, data: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Observacoes</Label>
                          <Textarea
                            placeholder="Observacoes adicionais..."
                            value={novaVistoria.observacoes}
                            onChange={(e) => setNovaVistoria(prev => ({ ...prev, observacoes: e.target.value }))}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInspectionOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleAgendarVistoria}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Agendar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {vistorias.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhuma vistoria registrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vistorias.map((vistoria) => (
                      <div key={vistoria.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            vistoria.status === 'realizada' ? 'bg-green-100 text-green-600' :
                            vistoria.status === 'agendada' ? 'bg-blue-100 text-blue-600' :
                            'bg-amber-100 text-amber-600'
                          }`}>
                            {vistoria.status === 'realizada' ? <CheckCircle2 className="h-5 w-5" /> :
                             vistoria.status === 'agendada' ? <Clock className="h-5 w-5" /> :
                             <AlertCircle className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{vistoria.imovelNome}</p>
                            <p className="text-sm text-slate-500">
                              {vistoria.tipo.charAt(0).toUpperCase() + vistoria.tipo.slice(1)} - {vistoria.data.toLocaleDateString('pt-BR')}
                            </p>
                            {vistoria.observacoes && (
                              <p className="text-sm text-slate-400 mt-1">{vistoria.observacoes}</p>
                            )}
                            {/* Progresso de comodos */}
                            {vistoria.comodosTotal && vistoria.comodosTotal > 0 && (
                              <div className="mt-2">
                                <div className="flex items-center gap-2 text-xs">
                                  <Home className="h-3 w-3 text-slate-400" />
                                  <span className="text-slate-500">
                                    {vistoria.status === 'realizada'
                                      ? `${vistoria.comodosTotal} ambientes vistoriados`
                                      : `${vistoria.comodosTotal} ambientes para vistoriar`}
                                  </span>
                                </div>
                                {vistoria.status !== 'realizada' && (
                                  <Progress
                                    value={((vistoria.comodosTotal - (vistoria.comodosPendentes || 0)) / vistoria.comodosTotal) * 100}
                                    className="h-1 mt-1"
                                  />
                                )}
                              </div>
                            )}
                            {/* Fotos da vistoria */}
                            {vistoria.fotos.length > 0 && (
                              <p className="text-xs text-indigo-600 mt-1">
                                <Image className="h-3 w-3 inline mr-1" />
                                {vistoria.fotos.length} foto(s) de {vistoria.comodosTotal || 'N/A'} ambientes
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={
                            vistoria.status === 'realizada' ? 'bg-green-100 text-green-700' :
                            vistoria.status === 'agendada' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }>
                            {vistoria.status.charAt(0).toUpperCase() + vistoria.status.slice(1)}
                          </Badge>
                          {vistoria.status === 'realizada' && vistoria.fotos.length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenInspectionPhotos(vistoria)}
                            >
                              <Image className="h-4 w-4 mr-1" />
                              Ver Fotos
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================== TAB: SAQUES ===================== */}
          <TabsContent value="saques" className="space-y-6 mt-6">
            {/* Saldo e Botao de Saque */}
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl text-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm mb-1">Saldo Disponivel para Saque</p>
                    <p className="text-4xl font-black">R$ {saldoDisponivel.toLocaleString('pt-BR')},00</p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-background text-emerald-700 hover:bg-white/90 font-bold"
                    onClick={() => setIsWithdrawOpen(true)}
                  >
                    <Banknote className="h-5 w-5 mr-2" />
                    Solicitar Saque
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Historico de Saques */}
            <Card className="bg-background rounded-3xl shadow-sm border border-slate-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-indigo-600" />
                  Historico de Saques
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historicoSaques.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Banknote className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhum saque realizado</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicoSaques.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.data.toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="font-bold">R$ {s.valor.toLocaleString('pt-BR')},00</TableCell>
                          <TableCell className="text-slate-600">{s.conta}</TableCell>
                          <TableCell>
                            <Badge className={
                              s.status === 'concluido' ? 'bg-green-100 text-green-700' :
                              s.status === 'processando' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }>
                              {s.status === 'concluido' ? 'Concluido' :
                               s.status === 'processando' ? 'Processando' : 'Pendente'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Detalhes do Imovel */}
      <Dialog open={isPropertyDetailsOpen} onOpenChange={setIsPropertyDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProperty?.name}</DialogTitle>
            <DialogDescription>{selectedProperty?.address}</DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-6 py-4">
              {/* Perfil do Proprietario */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                    {ownerProfile.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{ownerProfile.name}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span>{ownerProfile.rating} estrelas</span>
                      <span>|</span>
                      <span>{ownerProfile.totalProperties} imoveis</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsOwnerProfileOpen(true)}
                >
                  <User className="h-4 w-4 mr-1" />
                  Ver Perfil
                </Button>
              </div>

              {/* Fotos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Fotos do Imovel
                  </h4>
                  {selectedProperty.photos && selectedProperty.photos.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleOpenPhotoGallery}
                    >
                      <ZoomIn className="h-4 w-4 mr-1" />
                      Ver Todas
                    </Button>
                  )}
                </div>
                {selectedProperty.photos && selectedProperty.photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {selectedProperty.photos.slice(0, 6).map((photo, index) => (
                      <div
                        key={index}
                        className="aspect-video bg-slate-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition relative"
                        onClick={() => {
                          setCurrentPhotoIndex(index);
                          handleOpenPhotoGallery();
                        }}
                      >
                        {photo.startsWith('data:') ? (
                          <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100">
                            <Building2 className="h-8 w-8 text-indigo-300" />
                          </div>
                        )}
                        {index === 5 && selectedProperty.photos!.length > 6 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold">
                            +{selectedProperty.photos!.length - 6}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-lg">
                    <Camera className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">Nenhuma foto cadastrada</p>
                    <div className="flex gap-2 justify-center mt-3">
                      <Button variant="outline" size="sm" onClick={handleOpenAddPhotos}>
                        <Upload className="h-4 w-4 mr-1" />
                        Upload Simples
                      </Button>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleOpenPhotoWizard}>
                        <Sparkles className="h-4 w-4 mr-1" />
                        Wizard com IA
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Info do Imovel */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <Badge className={selectedProperty.status === 'Alugado' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}>
                    {selectedProperty.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Valor Mensal</p>
                  <p className="font-bold">{selectedProperty.value}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Inquilino</p>
                  <p className="font-medium">{selectedProperty.tenant}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">NFT ID</p>
                  <p className="font-mono text-sm">{selectedProperty.nftId || '-'}</p>
                </div>
              </div>

              {/* Vistoria */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Status da Vistoria
                </h4>
                {selectedProperty.hasInspection ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Vistoria realizada</span>
                    </div>
                    {vistorias.find(v => v.imovelId === selectedProperty.id && v.fotos.length > 0) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const vistoria = vistorias.find(v => v.imovelId === selectedProperty.id && v.fotos.length > 0);
                          if (vistoria) handleOpenInspectionPhotos(vistoria);
                        }}
                      >
                        <Image className="h-4 w-4 mr-1" />
                        Ver Fotos
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-5 w-5" />
                      <span>Vistoria pendente</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      setNovaVistoria(prev => ({ ...prev, imovelId: selectedProperty.id }));
                      setIsPropertyDetailsOpen(false);
                      setIsInspectionOpen(true);
                    }}>
                      Agendar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Fotos com IPFS */}
      <Dialog open={isAddPhotosOpen} onOpenChange={setIsAddPhotosOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-indigo-600" />
              Adicionar Fotos ao Imovel
            </DialogTitle>
            <DialogDescription>
              As fotos serao enviadas para IPFS e vinculadas ao contrato blockchain do imovel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Info IPFS */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Armazenamento Descentralizado</p>
                  <p className="text-blue-600 text-xs mt-1">
                    Suas fotos serao armazenadas de forma permanente e imutavel no IPFS,
                    garantindo transparencia e seguranca para o contrato de aluguel.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload area */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePropertyPhotoUpload}
                className="hidden"
                id="property-foto-upload"
              />
              <label htmlFor="property-foto-upload" className="cursor-pointer">
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Clique para selecionar fotos</p>
                <p className="text-xs text-slate-400">PNG, JPG ou WEBP ate 5MB cada</p>
              </label>
            </div>

            {/* Preview das fotos */}
            {propertyPhotosToAdd.previews.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">
                  {propertyPhotosToAdd.previews.length} foto(s) selecionada(s)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {propertyPhotosToAdd.previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={preview} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePropertyPhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status de upload */}
            {isUploadingPhotos && (
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-indigo-900">Enviando para IPFS...</p>
                <p className="text-xs text-indigo-600">Vinculando ao contrato blockchain</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPhotosOpen(false)} disabled={isUploadingPhotos}>
              Cancelar
            </Button>
            <Button
              onClick={handleSavePropertyPhotos}
              disabled={propertyPhotosToAdd.files.length === 0 || isUploadingPhotos}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isUploadingPhotos ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar para IPFS
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Solicitar Saque */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-emerald-600" />
              Solicitar Saque
            </DialogTitle>
            <DialogDescription>
              Saldo disponivel: R$ {saldoDisponivel.toLocaleString('pt-BR')},00
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Valor do Saque (R$) *</Label>
              <Input
                type="number"
                min={0}
                max={saldoDisponivel}
                placeholder="0,00"
                value={saque.valor || ''}
                onChange={(e) => setSaque(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
              />
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-indigo-600"
                onClick={() => setSaque(prev => ({ ...prev, valor: saldoDisponivel }))}
              >
                Sacar tudo
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Conta para Recebimento *</Label>
              <Select
                value={saque.conta}
                onValueChange={(v) => setSaque(prev => ({ ...prev, conta: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {contasSalvas.map((conta, index) => {
                    const bancoInfo = BANCOS_BRASIL.find(b => b.codigo === conta.banco);
                    return (
                      <SelectItem key={index} value={`${bancoInfo?.nome} **${conta.conta.slice(-4)}`}>
                        {bancoInfo?.nome} - **{conta.conta.slice(-4)}
                      </SelectItem>
                    );
                  })}
                  {chavesSalvas.map((chave, index) => (
                    <SelectItem key={`pix-${index}`} value={`PIX: ${chave.chave}`}>
                      PIX: {chave.apelido || chave.chave}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {contasSalvas.length === 0 && chavesSalvas.length === 0 && (
                <p className="text-sm text-amber-600">
                  Cadastre uma conta bancaria ou chave PIX primeiro
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Observacao (opcional)</Label>
              <Textarea
                placeholder="Observacoes adicionais..."
                value={saque.observacao}
                onChange={(e) => setSaque(prev => ({ ...prev, observacao: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSolicitarSaque}
              disabled={isRequestingWithdraw || saque.valor <= 0 || saque.valor > saldoDisponivel || !saque.conta}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isRequestingWithdraw ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Saque'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Ver Perfil do Proprietario */}
      <Dialog open={isOwnerProfileOpen} onOpenChange={setIsOwnerProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Perfil do Proprietario
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Avatar e Nome */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                {ownerProfile.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold">{ownerProfile.name}</h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-medium">{ownerProfile.rating}</span>
                <span className="text-slate-400">|</span>
                <span className="text-sm text-slate-500">
                  Membro desde {ownerProfile.memberSince.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Informacoes de Contato */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Mail className="h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{ownerProfile.email}</p>
                </div>
                {ownerProfile.verifiedEmail && (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Phone className="h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Telefone</p>
                  <p className="font-medium">{ownerProfile.phone}</p>
                </div>
                {ownerProfile.verifiedPhone && (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
            </div>

            {/* Estatisticas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 rounded-xl text-center">
                <Building2 className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-indigo-700">{ownerProfile.totalProperties}</p>
                <p className="text-xs text-indigo-500">Imoveis Cadastrados</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <FileText className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-emerald-700">{ownerProfile.activeContracts}</p>
                <p className="text-xs text-emerald-500">Contratos Ativos</p>
              </div>
            </div>

            {/* Verificacoes */}
            <div>
              <p className="text-sm font-semibold mb-2">Verificacoes</p>
              <div className="flex flex-wrap gap-2">
                {ownerProfile.verifiedEmail && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Email
                  </Badge>
                )}
                {ownerProfile.verifiedPhone && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Telefone
                  </Badge>
                )}
                {ownerProfile.verifiedDocuments && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Documentos
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOwnerProfileOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Galeria de Fotos do Imovel */}
      <Dialog open={isPhotoGalleryOpen} onOpenChange={setIsPhotoGalleryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-indigo-600" />
              Fotos - {selectedProperty?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedProperty?.photos && selectedProperty.photos.length > 0 ? (
            <div className="space-y-4">
              {/* Foto Principal */}
              <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden">
                {selectedProperty.photos[currentPhotoIndex]?.startsWith('data:') ? (
                  <img
                    src={selectedProperty.photos[currentPhotoIndex]}
                    alt={`Foto ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100">
                    <Building2 className="h-16 w-16 text-indigo-300" />
                    <p className="absolute bottom-4 text-slate-500">Foto {currentPhotoIndex + 1}</p>
                  </div>
                )}

                {/* Navegacao */}
                {selectedProperty.photos.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full"
                      onClick={handlePrevPhoto}
                      disabled={currentPhotoIndex === 0}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                      onClick={() => handleNextPhoto(selectedProperty.photos!.length)}
                      disabled={currentPhotoIndex === selectedProperty.photos!.length - 1}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                {/* Contador */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentPhotoIndex + 1} / {selectedProperty.photos.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedProperty.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      index === currentPhotoIndex ? 'border-indigo-500' : 'border-transparent'
                    }`}
                  >
                    {photo.startsWith('data:') ? (
                      <img src={photo} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100">
                        <Building2 className="h-6 w-6 text-indigo-300" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhuma foto disponivel</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPhotoGalleryOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Fotos da Vistoria */}
      <Dialog open={isInspectionPhotosOpen} onOpenChange={setIsInspectionPhotosOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-indigo-600" />
              Fotos da Vistoria - {selectedVistoria?.imovelNome}
            </DialogTitle>
            <DialogDescription>
              {selectedVistoria?.tipo.charAt(0).toUpperCase()}{selectedVistoria?.tipo.slice(1)} -{' '}
              {selectedVistoria?.data.toLocaleDateString('pt-BR')}
            </DialogDescription>
          </DialogHeader>

          {selectedVistoria?.fotos && selectedVistoria.fotos.length > 0 ? (
            <div className="space-y-4 py-4">
              {/* Foto Principal */}
              <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden">
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
                  <p className="font-medium text-emerald-700">
                    {selectedVistoria.fotos[currentPhotoIndex]}
                  </p>
                  <p className="text-sm text-emerald-500 mt-2">
                    Ambiente vistoriado e aprovado
                  </p>
                </div>

                {/* Navegacao */}
                {selectedVistoria.fotos.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full"
                      onClick={handlePrevPhoto}
                      disabled={currentPhotoIndex === 0}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                      onClick={() => handleNextPhoto(selectedVistoria.fotos.length)}
                      disabled={currentPhotoIndex === selectedVistoria.fotos.length - 1}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                {/* Contador */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentPhotoIndex + 1} / {selectedVistoria.fotos.length}
                </div>
              </div>

              {/* Lista de Ambientes */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {selectedVistoria.fotos.map((foto, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`p-3 rounded-lg text-left transition ${
                      index === currentPhotoIndex
                        ? 'bg-indigo-100 border-2 border-indigo-500'
                        : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium truncate">{foto}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Observacoes */}
              {selectedVistoria.observacoes && (
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm font-medium text-amber-700 mb-1">Observacoes:</p>
                  <p className="text-sm text-amber-600">{selectedVistoria.observacoes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhuma foto de vistoria disponivel</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInspectionPhotosOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wizard de Upload de Fotos */}
      {selectedProperty && (
        <PhotoUploadWizard
          open={isPhotoWizardOpen}
          onOpenChange={setIsPhotoWizardOpen}
          config={{
            propertyId: selectedProperty.id.toString(),
            propertyName: selectedProperty.name,
            onComplete: handlePhotoWizardComplete,
            onCancel: () => setIsPhotoWizardOpen(false),
            rooms: selectedProperty.comodos,
          }}
        />
      )}
    </div>
  );
}
