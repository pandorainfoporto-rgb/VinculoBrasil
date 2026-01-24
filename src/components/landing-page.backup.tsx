import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Building2, Home, Users, Shield, Key, ArrowRight, Check, MapPin,
  Bed, Bath, Square, PawPrint, ChevronRight, Smartphone, Monitor,
  Lock, Zap, FileCheck, UserCircle, Award, Phone, Mail, Menu, X,
  MailCheck, AlertCircle, Eye, EyeOff, HelpCircle, ChevronDown,
  Handshake, TrendingUp, Wallet, BarChart3, Network, Download, Share2,
  Search, ZoomIn, ZoomOut, Navigation, List, Map, Car, Heart,
  Train, ShoppingCart, Plus, GraduationCap, Trees, Store, Dumbbell
} from 'lucide-react';
import { useMobilePlatform } from '@/hooks/use-mobile-platform';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Property } from '@/lib/types';

// Dados de cidades brasileiras com coordenadas
interface CityData {
  name: string;
  state: string;
  lat: number;
  lng: number;
}

const BRAZILIAN_CITIES: CityData[] = [
  { name: 'São Paulo', state: 'SP', lat: -23.5505, lng: -46.6333 },
  { name: 'Rio de Janeiro', state: 'RJ', lat: -22.9068, lng: -43.1729 },
  { name: 'Belo Horizonte', state: 'MG', lat: -19.9167, lng: -43.9345 },
  { name: 'Curitiba', state: 'PR', lat: -25.4284, lng: -49.2733 },
  { name: 'Porto Alegre', state: 'RS', lat: -30.0346, lng: -51.2177 },
  { name: 'Salvador', state: 'BA', lat: -12.9714, lng: -38.5014 },
  { name: 'Brasília', state: 'DF', lat: -15.8267, lng: -47.9218 },
  { name: 'Fortaleza', state: 'CE', lat: -3.7172, lng: -38.5433 },
  { name: 'Recife', state: 'PE', lat: -8.0476, lng: -34.8770 },
  { name: 'Cuiabá', state: 'MT', lat: -15.6014, lng: -56.0979 },
];

const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
];

// Interface estendida para imoveis do mapa com coordenadas
interface MapProperty extends Property {
  lat: number;
  lng: number;
  neighborhood: string;
  parkingSpaces: number;
  photos: string[];
}

// Imoveis de exemplo para showcase (sem valores reais)
// Em producao, esses dados virao da API
const SHOWCASE_PROPERTIES: Property[] = [
  {
    id: 'showcase-1',
    address: 'Centro Historico',
    propertyType: 'apartment',
    city: 'Cuiaba',
    state: 'MT',
    country: 'Brazil',
    zipCode: '78000-000',
    ownerId: 'owner-1',
    status: 'available',
    description: 'Apartamento moderno no centro',
    rentAmount: 0, // Valor oculto - visivel apos cadastro
    condoFees: 0,
    iptuTax: 0,
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    petFriendly: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'showcase-2',
    address: 'Jardim das Americas',
    propertyType: 'apartment',
    city: 'Cuiaba',
    state: 'MT',
    country: 'Brazil',
    zipCode: '78060-000',
    ownerId: 'owner-2',
    status: 'available',
    description: 'Studio mobiliado proximo a universidade',
    rentAmount: 0,
    condoFees: 0,
    iptuTax: 0,
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    petFriendly: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'showcase-3',
    address: 'Bosque da Saude',
    propertyType: 'house',
    city: 'Cuiaba',
    state: 'MT',
    country: 'Brazil',
    zipCode: '78050-000',
    ownerId: 'owner-3',
    status: 'available',
    description: 'Casa com quintal em bairro residencial',
    rentAmount: 0,
    condoFees: 0,
    iptuTax: 0,
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    petFriendly: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Imoveis com coordenadas para o mapa interativo
const MAP_PROPERTIES: MapProperty[] = [
  // São Paulo
  {
    id: 'map-sp-1',
    address: 'Av. Paulista, 1578',
    neighborhood: 'Bela Vista',
    propertyType: 'apartment',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brazil',
    zipCode: '01310-200',
    ownerId: 'owner-1',
    status: 'available',
    description: 'Apartamento moderno na Paulista com vista panoramica',
    rentAmount: 4500,
    condoFees: 800,
    iptuTax: 350,
    bedrooms: 2,
    bathrooms: 2,
    area: 75,
    petFriendly: true,
    parkingSpaces: 1,
    lat: -23.5629,
    lng: -46.6544,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'map-sp-2',
    address: 'Rua Oscar Freire, 725',
    neighborhood: 'Jardins',
    propertyType: 'apartment',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brazil',
    zipCode: '01426-001',
    ownerId: 'owner-2',
    status: 'available',
    description: 'Studio de luxo nos Jardins, proximo a Oscar Freire',
    rentAmount: 3800,
    condoFees: 650,
    iptuTax: 280,
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    petFriendly: false,
    parkingSpaces: 1,
    lat: -23.5617,
    lng: -46.6688,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'map-sp-3',
    address: 'Alameda Santos, 1893',
    neighborhood: 'Cerqueira César',
    propertyType: 'apartment',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brazil',
    zipCode: '01419-002',
    ownerId: 'owner-3',
    status: 'available',
    description: 'Cobertura duplex na Alameda Santos',
    rentAmount: 8500,
    condoFees: 1200,
    iptuTax: 650,
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    petFriendly: true,
    parkingSpaces: 2,
    lat: -23.5569,
    lng: -46.6628,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Rio de Janeiro
  {
    id: 'map-rj-1',
    address: 'Rua Visconde de Piraja, 550',
    neighborhood: 'Ipanema',
    propertyType: 'apartment',
    city: 'Rio de Janeiro',
    state: 'RJ',
    country: 'Brazil',
    zipCode: '22410-002',
    ownerId: 'owner-4',
    status: 'available',
    description: 'Apartamento a 2 quadras da praia de Ipanema',
    rentAmount: 6500,
    condoFees: 950,
    iptuTax: 420,
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    petFriendly: true,
    parkingSpaces: 1,
    lat: -22.9838,
    lng: -43.2096,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'map-rj-2',
    address: 'Av. Atlantica, 2066',
    neighborhood: 'Copacabana',
    propertyType: 'apartment',
    city: 'Rio de Janeiro',
    state: 'RJ',
    country: 'Brazil',
    zipCode: '22021-001',
    ownerId: 'owner-5',
    status: 'available',
    description: 'Frente mar em Copacabana, vista deslumbrante',
    rentAmount: 9500,
    condoFees: 1400,
    iptuTax: 580,
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    petFriendly: false,
    parkingSpaces: 2,
    lat: -22.9711,
    lng: -43.1822,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'map-rj-3',
    address: 'Rua do Catete, 311',
    neighborhood: 'Catete',
    propertyType: 'apartment',
    city: 'Rio de Janeiro',
    state: 'RJ',
    country: 'Brazil',
    zipCode: '22220-001',
    ownerId: 'owner-6',
    status: 'available',
    description: 'Apartamento charmoso proximo ao Metro',
    rentAmount: 2800,
    condoFees: 450,
    iptuTax: 220,
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    petFriendly: true,
    parkingSpaces: 0,
    lat: -22.9258,
    lng: -43.1766,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Belo Horizonte
  {
    id: 'map-bh-1',
    address: 'Av. Afonso Pena, 1500',
    neighborhood: 'Centro',
    propertyType: 'apartment',
    city: 'Belo Horizonte',
    state: 'MG',
    country: 'Brazil',
    zipCode: '30130-003',
    ownerId: 'owner-7',
    status: 'available',
    description: 'Apartamento no coracao de BH',
    rentAmount: 2500,
    condoFees: 400,
    iptuTax: 180,
    bedrooms: 2,
    bathrooms: 1,
    area: 70,
    petFriendly: false,
    parkingSpaces: 1,
    lat: -19.9245,
    lng: -43.9352,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'map-bh-2',
    address: 'Rua Pernambuco, 1000',
    neighborhood: 'Savassi',
    propertyType: 'apartment',
    city: 'Belo Horizonte',
    state: 'MG',
    country: 'Brazil',
    zipCode: '30130-151',
    ownerId: 'owner-8',
    status: 'available',
    description: 'Loft moderno na Savassi',
    rentAmount: 3200,
    condoFees: 550,
    iptuTax: 250,
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    petFriendly: true,
    parkingSpaces: 1,
    lat: -19.9367,
    lng: -43.9378,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Curitiba
  {
    id: 'map-cwb-1',
    address: 'Rua XV de Novembro, 700',
    neighborhood: 'Centro',
    propertyType: 'apartment',
    city: 'Curitiba',
    state: 'PR',
    country: 'Brazil',
    zipCode: '80020-310',
    ownerId: 'owner-9',
    status: 'available',
    description: 'Apartamento no calcadao da XV',
    rentAmount: 2200,
    condoFees: 350,
    iptuTax: 160,
    bedrooms: 2,
    bathrooms: 1,
    area: 60,
    petFriendly: false,
    parkingSpaces: 0,
    lat: -25.4296,
    lng: -49.2712,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'map-cwb-2',
    address: 'Av. Batel, 1500',
    neighborhood: 'Batel',
    propertyType: 'apartment',
    city: 'Curitiba',
    state: 'PR',
    country: 'Brazil',
    zipCode: '80420-090',
    ownerId: 'owner-10',
    status: 'available',
    description: 'Apartamento de alto padrao no Batel',
    rentAmount: 4200,
    condoFees: 750,
    iptuTax: 320,
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    petFriendly: true,
    parkingSpaces: 2,
    lat: -25.4423,
    lng: -49.2889,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Porto Alegre
  {
    id: 'map-poa-1',
    address: 'Rua dos Andradas, 1234',
    neighborhood: 'Centro Historico',
    propertyType: 'apartment',
    city: 'Porto Alegre',
    state: 'RS',
    country: 'Brazil',
    zipCode: '90020-008',
    ownerId: 'owner-11',
    status: 'available',
    description: 'Apartamento historico no centro',
    rentAmount: 1800,
    condoFees: 280,
    iptuTax: 140,
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    petFriendly: false,
    parkingSpaces: 0,
    lat: -30.0322,
    lng: -51.2303,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'map-poa-2',
    address: 'Av. Moinhos de Vento, 500',
    neighborhood: 'Moinhos de Vento',
    propertyType: 'apartment',
    city: 'Porto Alegre',
    state: 'RS',
    country: 'Brazil',
    zipCode: '90510-000',
    ownerId: 'owner-12',
    status: 'available',
    description: 'Apartamento de luxo no Moinhos',
    rentAmount: 5500,
    condoFees: 900,
    iptuTax: 400,
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    petFriendly: true,
    parkingSpaces: 2,
    lat: -30.0264,
    lng: -51.2008,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Salvador
  {
    id: 'map-ssa-1',
    address: 'Rua Chile, 100',
    neighborhood: 'Pelourinho',
    propertyType: 'apartment',
    city: 'Salvador',
    state: 'BA',
    country: 'Brazil',
    zipCode: '40020-000',
    ownerId: 'owner-13',
    status: 'available',
    description: 'Apartamento no centro historico',
    rentAmount: 1500,
    condoFees: 200,
    iptuTax: 100,
    bedrooms: 1,
    bathrooms: 1,
    area: 40,
    petFriendly: false,
    parkingSpaces: 0,
    lat: -12.9711,
    lng: -38.5108,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'map-ssa-2',
    address: 'Av. Oceanica, 2500',
    neighborhood: 'Barra',
    propertyType: 'apartment',
    city: 'Salvador',
    state: 'BA',
    country: 'Brazil',
    zipCode: '40140-130',
    ownerId: 'owner-14',
    status: 'available',
    description: 'Vista mar na Barra, proximo ao Farol',
    rentAmount: 4800,
    condoFees: 700,
    iptuTax: 350,
    bedrooms: 3,
    bathrooms: 2,
    area: 100,
    petFriendly: true,
    parkingSpaces: 1,
    lat: -13.0089,
    lng: -38.5311,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Brasília
  {
    id: 'map-bsb-1',
    address: 'SQS 308 Bloco A',
    neighborhood: 'Asa Sul',
    propertyType: 'apartment',
    city: 'Brasília',
    state: 'DF',
    country: 'Brazil',
    zipCode: '70356-010',
    ownerId: 'owner-15',
    status: 'available',
    description: 'Apartamento na superquadra mais arborizada',
    rentAmount: 3500,
    condoFees: 500,
    iptuTax: 280,
    bedrooms: 3,
    bathrooms: 2,
    area: 90,
    petFriendly: true,
    parkingSpaces: 1,
    lat: -15.8055,
    lng: -47.9000,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'map-bsb-2',
    address: 'CLN 408 Bloco B',
    neighborhood: 'Asa Norte',
    propertyType: 'apartment',
    city: 'Brasília',
    state: 'DF',
    country: 'Brazil',
    zipCode: '70856-520',
    ownerId: 'owner-16',
    status: 'available',
    description: 'Kitnet na Asa Norte, ideal para estudantes',
    rentAmount: 1800,
    condoFees: 300,
    iptuTax: 120,
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    petFriendly: false,
    parkingSpaces: 0,
    lat: -15.7589,
    lng: -47.8833,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Fortaleza
  {
    id: 'map-for-1',
    address: 'Av. Beira Mar, 3000',
    neighborhood: 'Meireles',
    propertyType: 'apartment',
    city: 'Fortaleza',
    state: 'CE',
    country: 'Brazil',
    zipCode: '60165-121',
    ownerId: 'owner-17',
    status: 'available',
    description: 'Vista mar no Meireles, proximo a feirinha',
    rentAmount: 3800,
    condoFees: 600,
    iptuTax: 280,
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    petFriendly: true,
    parkingSpaces: 1,
    lat: -3.7262,
    lng: -38.4889,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Recife
  {
    id: 'map-rec-1',
    address: 'Av. Boa Viagem, 4500',
    neighborhood: 'Boa Viagem',
    propertyType: 'apartment',
    city: 'Recife',
    state: 'PE',
    country: 'Brazil',
    zipCode: '51030-000',
    ownerId: 'owner-18',
    status: 'available',
    description: 'Apartamento frente mar em Boa Viagem',
    rentAmount: 4200,
    condoFees: 650,
    iptuTax: 300,
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    petFriendly: true,
    parkingSpaces: 2,
    lat: -8.1167,
    lng: -34.8972,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Cuiabá
  {
    id: 'map-cba-1',
    address: 'Av. do CPA, 1000',
    neighborhood: 'Centro Político Administrativo',
    propertyType: 'apartment',
    city: 'Cuiabá',
    state: 'MT',
    country: 'Brazil',
    zipCode: '78050-970',
    ownerId: 'owner-19',
    status: 'available',
    description: 'Apartamento moderno no CPA',
    rentAmount: 2500,
    condoFees: 400,
    iptuTax: 180,
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    petFriendly: true,
    parkingSpaces: 1,
    lat: -15.5989,
    lng: -56.0949,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'map-cba-2',
    address: 'Av. Miguel Sutil, 8000',
    neighborhood: 'Jardim das Americas',
    propertyType: 'house',
    city: 'Cuiabá',
    state: 'MT',
    country: 'Brazil',
    zipCode: '78060-000',
    ownerId: 'owner-20',
    status: 'available',
    description: 'Casa com piscina em bairro residencial',
    rentAmount: 3500,
    condoFees: 0,
    iptuTax: 250,
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    petFriendly: true,
    parkingSpaces: 2,
    lat: -15.5878,
    lng: -56.0811,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Tipos para cadastro
type UserType = 'landlord' | 'tenant' | 'guarantor' | 'realestate' | 'insurer';

// Estados de autenticacao
type AuthStep = 'idle' | 'registration' | 'email_verification' | 'login';

interface RegistrationForm {
  userType: UserType;
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
}

interface LoginForm {
  email: string;
  password: string;
}

// Simulacao de usuarios registrados (em producao, viria de uma API/banco)
export interface RegisteredUser {
  email: string;
  fullName: string;
  userType: UserType;
  isVerified: boolean;
  password?: string;
}

// Usuarios do sistema para teste - em producao, virao da API de autenticacao
// IMPORTANTE: Senhas temporarias para ambiente de desenvolvimento
const SEED_USERS: RegisteredUser[] = [
  // Admin
  {
    email: 'renato@vinculobrasil.com.br',
    fullName: 'Renato Admin',
    userType: 'landlord',
    isVerified: true,
    password: 'VinculoAdmin2024!',
  },
  // Inquilino (Tenant)
  {
    email: 'inquilino.teste@vinculobrasil.com.br',
    fullName: 'Inquilino Teste',
    userType: 'tenant',
    isVerified: true,
    password: 'InquilinoTeste2024!',
  },
  // Proprietario (Landlord)
  {
    email: 'proprietario.teste@vinculobrasil.com.br',
    fullName: 'Proprietario Teste',
    userType: 'landlord',
    isVerified: true,
    password: 'ProprietarioTeste2024!',
  },
  // Garantidor (Guarantor)
  {
    email: 'garantidor.teste@vinculobrasil.com.br',
    fullName: 'Garantidor Teste',
    userType: 'guarantor',
    isVerified: true,
    password: 'GarantidorTeste2024!',
  },
  // Seguradora (Insurer)
  {
    email: 'seguradora.teste@vinculobrasil.com.br',
    fullName: 'Seguradora Teste',
    userType: 'insurer',
    isVerified: true,
    password: 'SeguradoraTeste2024!',
  },
  // Imobiliaria (Real Estate)
  {
    email: 'imobiliaria.teste@vinculobrasil.com.br',
    fullName: 'Imobiliaria Teste',
    userType: 'realestate',
    isVerified: true,
    password: 'ImobiliariaTeste2024!',
  },
];

interface LandingPageProps {
  onEnterApp: (user: RegisteredUser) => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('idle');
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [pendingUser, setPendingUser] = useState<RegisteredUser | null>(null);
  const [showIosInstallGuide, setShowIosInstallGuide] = useState(false);

  // Detectar plataforma mobile para mostrar botao de download
  const { isMobile, isIos, isAndroid, canInstallPwa, promptInstall, isPwa } = useMobilePlatform();

  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    userType: 'tenant',
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
  });

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const [loginError, setLoginError] = useState('');

  // Imovel de interesse salvo (do localStorage)
  const savedPropertyInterest = useMemo(() => {
    try {
      const saved = localStorage.getItem('selectedPropertyInterest');
      if (saved) {
        return JSON.parse(saved) as MapProperty & { savedAt: string };
      }
    } catch {
      // Ignora erros de parse
    }
    return null;
  }, [authStep]); // Re-verifica quando muda o passo de autenticacao

  // Simulacao de banco de usuarios (em producao, seria API)
  // Inicializa com usuarios pre-cadastrados (admins)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([...SEED_USERS]);

  const handleOpenRegistration = (userType: UserType) => {
    setSelectedUserType(userType);
    setRegistrationForm(prev => ({ ...prev, userType }));
    setAuthStep('registration');
  };

  const handleOpenLogin = () => {
    setLoginError('');
    setAuthStep('login');
  };

  const handleRegistrationSubmit = () => {
    // Validar campos obrigatorios
    if (!registrationForm.fullName || !registrationForm.email || !registrationForm.phone || !registrationForm.cpf || !registrationForm.password) {
      return;
    }

    // Criar usuario pendente de verificacao
    const newUser: RegisteredUser = {
      email: registrationForm.email,
      fullName: registrationForm.fullName,
      userType: registrationForm.userType,
      isVerified: false,
    };

    // Adicionar a lista de usuarios (nao verificado ainda)
    setRegisteredUsers(prev => [...prev, newUser]);
    setPendingUser(newUser);

    // Em producao, enviaria email de verificacao aqui
    console.log('Email de verificacao enviado para:', registrationForm.email);

    // Ir para tela de verificacao de email
    setAuthStep('email_verification');
  };

  const handleVerifyEmail = () => {
    // Simular verificacao - em producao, validaria com API
    // Codigo de verificacao simulado: "123456"
    if (verificationCode === '123456') {
      if (pendingUser) {
        // Marcar usuario como verificado
        const verifiedUser = { ...pendingUser, isVerified: true };
        setRegisteredUsers(prev =>
          prev.map(u => u.email === pendingUser.email ? verifiedUser : u)
        );

        // Limpar estados e entrar no app
        setAuthStep('idle');
        setVerificationCode('');
        setVerificationError('');
        setPendingUser(null);
        onEnterApp(verifiedUser);
      }
    } else {
      setVerificationError('Codigo de verificacao invalido. Tente novamente.');
    }
  };

  const handleLogin = () => {
    // Buscar usuario registrado (case insensitive)
    const user = registeredUsers.find(u => u.email.toLowerCase() === loginForm.email.toLowerCase());

    if (!user) {
      setLoginError('Usuario nao encontrado. Faca seu cadastro primeiro.');
      return;
    }

    if (!user.isVerified) {
      setLoginError('Email ainda nao verificado. Verifique sua caixa de entrada.');
      setPendingUser(user);
      setAuthStep('email_verification');
      return;
    }

    // Validar senha para usuarios com senha definida (admins)
    if (user.password && user.password !== loginForm.password) {
      setLoginError('Senha incorreta. Tente novamente.');
      return;
    }

    setLoginError('');
    setAuthStep('idle');
    onEnterApp(user);
  };

  const handleCloseAuth = () => {
    setAuthStep('idle');
    setVerificationCode('');
    setVerificationError('');
    setLoginError('');
  };

  const handleResendCode = () => {
    // Em producao, reenviaria email
    console.log('Codigo reenviado para:', pendingUser?.email || registrationForm.email);
    setVerificationError('');
  };

  // Handler para instalar o app
  const handleInstallApp = async () => {
    if (isIos) {
      // iOS nao suporta beforeinstallprompt, mostrar guia
      setShowIosInstallGuide(true);
    } else if (canInstallPwa && promptInstall) {
      // Android/Desktop - usar o prompt nativo
      await promptInstall();
    }
  };

  // Imoveis para showcase (todos disponiveis)
  const showcaseProperties = SHOWCASE_PROPERTIES;

  // Estado do mapa interativo
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [mapZoomLevel, setMapZoomLevel] = useState<number>(10);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [selectedMapProperty, setSelectedMapProperty] = useState<MapProperty | null>(null);
  const [showMapView, setShowMapView] = useState(true);
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set());

  // Cidades filtradas pelo estado selecionado
  const citiesForState = useMemo(() => {
    if (!selectedState) return BRAZILIAN_CITIES;
    return BRAZILIAN_CITIES.filter(city => city.state === selectedState);
  }, [selectedState]);

  // Imoveis filtrados pela cidade/estado selecionados
  const filteredMapProperties = useMemo(() => {
    let properties = MAP_PROPERTIES;
    if (selectedState) {
      properties = properties.filter(p => p.state === selectedState);
    }
    if (selectedCity) {
      properties = properties.filter(p => p.city === selectedCity);
    }
    return properties;
  }, [selectedState, selectedCity]);

  // Centro do mapa baseado na cidade selecionada
  const mapCenter = useMemo(() => {
    if (selectedCity) {
      const city = BRAZILIAN_CITIES.find(c => c.name === selectedCity);
      if (city) return { lat: city.lat, lng: city.lng };
    }
    if (selectedState) {
      const cityInState = BRAZILIAN_CITIES.find(c => c.state === selectedState);
      if (cityInState) return { lat: cityInState.lat, lng: cityInState.lng };
    }
    // Centro do Brasil por padrao
    return { lat: -15.7801, lng: -47.9292 };
  }, [selectedCity, selectedState]);

  // Toggle favorito
  const toggleFavorite = (propertyId: string) => {
    setFavoriteProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  // Handler para zoom do mapa
  const handleZoomIn = () => setMapZoomLevel(prev => Math.min(prev + 1, 18));
  const handleZoomOut = () => setMapZoomLevel(prev => Math.max(prev - 1, 5));

  // Handler para salvar imovel de interesse e abrir cadastro
  const handlePropertyInterest = (property: MapProperty) => {
    // Salva o imovel selecionado no localStorage para exibir apos login
    localStorage.setItem('selectedPropertyInterest', JSON.stringify({
      id: property.id,
      address: property.address,
      neighborhood: property.neighborhood,
      city: property.city,
      state: property.state,
      rentAmount: property.rentAmount,
      condoFees: property.condoFees,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      parkingSpaces: property.parkingSpaces,
      petFriendly: property.petFriendly,
      savedAt: new Date().toISOString()
    }));
    // Abre o cadastro de inquilino
    handleOpenRegistration('tenant');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar - Mobile First */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <VinculoBrasilLogo size="lg" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#imoveis" className="text-gray-600 hover:text-blue-600 transition-colors">Imoveis</a>
              <a href="#como-funciona" className="text-gray-600 hover:text-blue-600 transition-colors">Como Funciona</a>
              <a href="#para-voce" className="text-gray-600 hover:text-blue-600 transition-colors">Para Voce</a>
              <a href="#imobiliarias" className="text-gray-600 hover:text-blue-600 transition-colors">Imobiliarias</a>
              <Link to="/inquilinos" className="text-gray-600 hover:text-blue-600 transition-colors">Inquilinos</Link>
              <Link to="/garantidores" className="text-gray-600 hover:text-blue-600 transition-colors">Garantidores</Link>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQ</a>
              <Separator orientation="vertical" className="h-6" />
              {/* Botao Baixar App - mostra quando pode instalar ou no iOS */}
              {!isPwa && (canInstallPwa || isIos) && (
                <Button
                  variant="outline"
                  onClick={handleInstallApp}
                  className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar App
                </Button>
              )}
              <Button variant="outline" onClick={handleOpenLogin}>Entrar</Button>
              <Button onClick={() => handleOpenRegistration('tenant')}>
                Cadastre-se
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-4">
                <a href="#imoveis" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Imoveis</a>
                <a href="#como-funciona" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Como Funciona</a>
                <a href="#para-voce" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Para Voce</a>
                <a href="#imobiliarias" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Imobiliarias</a>
                <Link to="/inquilinos" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Inquilinos</Link>
                <Link to="/garantidores" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Garantidores</Link>
                <a href="#faq" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Perguntas Frequentes</a>
                <Separator />
                {/* Botao Baixar App - Mobile */}
                {!isPwa && (canInstallPwa || isIos) && (
                  <Button
                    variant="outline"
                    className="w-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleInstallApp();
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar App
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={handleOpenLogin}>Entrar</Button>
                <Button className="w-full" onClick={() => handleOpenRegistration('tenant')}>
                  Cadastre-se
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Hero Text */}
            <div className="space-y-6 text-center md:text-left">
              <Badge variant="outline" className="px-4 py-2 text-sm border-blue-200 bg-blue-50 text-blue-700">
                <Zap className="h-4 w-4 mr-2 text-blue-500" />
                Tecnologia Blockchain + PIX
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Alugue com
                <span className="text-blue-600"> confianca</span>,
                <br />
                garantido por quem voce conhece
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-xl">
                A primeira plataforma de locacao que usa garantidores da sua confianca
                e tecnologia blockchain para proteger todos os envolvidos.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" className="text-lg px-8" onClick={() => handleOpenRegistration('tenant')}>
                  <Key className="mr-2 h-5 w-5" />
                  Quero Alugar
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => handleOpenRegistration('landlord')}>
                  <Home className="mr-2 h-5 w-5" />
                  Sou Proprietario
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-slate-100 px-3 py-1.5 rounded-full">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>100% Seguro</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-slate-100 px-3 py-1.5 rounded-full">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span>Contratos NFT</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-slate-100 px-3 py-1.5 rounded-full">
                  <FileCheck className="h-4 w-4 text-blue-600" />
                  <span>Lei 8.245/91</span>
                </div>
              </div>
            </div>

            {/* Hero Visual - Device Mockup */}
            <div className="relative">
              <div className="relative z-10">
                {/* Phone Mockup */}
                <div className="mx-auto max-w-[280px] md:max-w-[320px]">
                  <div className="bg-slate-800 rounded-[3rem] p-3 shadow-xl">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden">
                      <div className="bg-blue-600 p-6">
                        <div className="flex items-center gap-2 text-white mb-4">
                          <Building2 className="h-6 w-6" />
                          <span className="font-semibold">Vinculo Brasil</span>
                        </div>
                        <p className="text-white/90 text-sm">Seu proximo lar esta aqui</p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Home className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-900">Av. Paulista, 1000</p>
                              <p className="text-[10px] text-gray-500">2 quartos • Jardins</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Check className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-900">Contrato Ativo</p>
                              <p className="text-[10px] text-gray-500">NFT validado na blockchain</p>
                            </div>
                          </div>
                        </div>
                        <Button className="w-full" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Badge */}
                <div className="hidden md:block absolute -right-8 top-1/4 bg-white rounded-2xl shadow-md p-4 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Desktop</p>
                      <p className="text-xs text-gray-500">Gestao completa</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Badge */}
                <div className="hidden md:block absolute -left-8 bottom-1/4 bg-white rounded-2xl shadow-md p-4 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Mobile</p>
                      <p className="text-xs text-gray-500">Onde voce estiver</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Showcase Section - COM MAPA INTERATIVO */}
      <section id="imoveis" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 border-blue-200 bg-blue-50 text-blue-700">
              <Map className="h-4 w-4 mr-2" />
              Mapa Interativo
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Encontre seu proximo lar
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore imoveis em todo o Brasil. Selecione o estado e cidade para ver opcoes disponiveis.
            </p>
          </div>

          {/* Busca por Cidade/Estado */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="border-slate-200 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  {/* Selecao de Estado */}
                  <div className="flex-1 w-full">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Estado</Label>
                    <Select value={selectedState || 'none'} onValueChange={(value) => {
                      setSelectedState(value === 'none' ? '' : value);
                      setSelectedCity('');
                      setSelectedMapProperty(null);
                    }}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Todos os estados</SelectItem>
                        {BRAZILIAN_STATES.map(state => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name} ({state.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selecao de Cidade */}
                  <div className="flex-1 w-full">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Cidade</Label>
                    <Select value={selectedCity || 'none'} onValueChange={(value) => {
                      setSelectedCity(value === 'none' ? '' : value);
                      setSelectedMapProperty(null);
                    }}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Todas as cidades</SelectItem>
                        {citiesForState.map(city => (
                          <SelectItem key={`${city.name}-${city.state}`} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botao Buscar */}
                  <Button className="w-full md:w-auto px-8" size="lg">
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>

                {/* Filtros Rapidos */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                  <span className="text-sm text-gray-500">Cidades populares:</span>
                  {['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Brasília'].map(city => (
                    <Button
                      key={city}
                      variant="ghost"
                      size="sm"
                      className={`text-sm ${selectedCity === city ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}
                      onClick={() => {
                        const cityData = BRAZILIAN_CITIES.find(c => c.name === city);
                        if (cityData) {
                          setSelectedState(cityData.state);
                          setSelectedCity(city);
                          setSelectedMapProperty(null);
                        }
                      }}
                    >
                      {city}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Toggle Mapa/Lista */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
              <Button
                variant={showMapView ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowMapView(true)}
                className={showMapView ? '' : 'text-gray-600'}
              >
                <Map className="h-4 w-4 mr-2" />
                Mapa
              </Button>
              <Button
                variant={!showMapView ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowMapView(false)}
                className={!showMapView ? '' : 'text-gray-600'}
              >
                <List className="h-4 w-4 mr-2" />
                Lista
              </Button>
            </div>
          </div>

          {/* Mapa Interativo */}
          {showMapView && (
            <div className="mb-8">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                {/* Mapa Satelite */}
                <div
                  className="h-[400px] md:h-[500px] relative transition-transform duration-300"
                  style={{ transform: `scale(${1 + (mapZoomLevel - 10) * 0.1})` }}
                >
                  {/* Background do Mapa Satelite */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800">
                    {/* Textura satelite simulada */}
                    <div className="absolute inset-0">
                      {/* Areas urbanas (cinza claro) */}
                      <div className="absolute top-[5%] left-[10%] w-[35%] h-[40%] bg-gradient-to-br from-slate-500/80 to-slate-600/60 rounded-sm" />
                      <div className="absolute top-[15%] right-[5%] w-[30%] h-[35%] bg-gradient-to-br from-slate-500/70 to-slate-600/50 rounded-sm" />
                      <div className="absolute bottom-[10%] left-[20%] w-[45%] h-[30%] bg-gradient-to-br from-slate-500/60 to-slate-600/70 rounded-sm" />

                      {/* Areas verdes (parques) */}
                      <div className="absolute top-[20%] left-[25%] w-16 h-14 bg-emerald-700/70 rounded-lg shadow-inner" />
                      <div className="absolute bottom-[25%] right-[15%] w-20 h-16 bg-emerald-800/60 rounded-lg shadow-inner" />
                      <div className="absolute top-[50%] left-[50%] w-12 h-10 bg-emerald-700/50 rounded-lg shadow-inner" />
                      <div className="absolute top-[60%] left-[10%] w-24 h-18 bg-emerald-800/55 rounded-lg shadow-inner" />

                      {/* Agua (rios/lagos) */}
                      <div className="absolute top-[35%] left-[0%] w-[15%] h-2 bg-blue-800/60 transform -rotate-12" />
                      <div className="absolute bottom-[40%] right-[0%] w-[20%] h-3 bg-blue-700/50 transform rotate-6" />
                      <div className="absolute top-[70%] left-[40%] w-8 h-6 bg-blue-700/60 rounded-full" />

                      {/* Grid de ruas (mais sutil) */}
                      <div className="absolute inset-0 opacity-15">
                        {[...Array(30)].map((_, i) => (
                          <div key={`h-${i}`} className="absolute w-full h-px bg-slate-300" style={{ top: `${i * 3.33}%` }} />
                        ))}
                        {[...Array(30)].map((_, i) => (
                          <div key={`v-${i}`} className="absolute h-full w-px bg-slate-300" style={{ left: `${i * 3.33}%` }} />
                        ))}
                      </div>

                      {/* Avenidas principais (mais grossas e claras) */}
                      <div className="absolute top-[50%] left-0 w-full h-1 bg-slate-400/40" />
                      <div className="absolute top-0 left-[50%] w-1 h-full bg-slate-400/40" />
                      <div className="absolute top-[25%] left-0 w-full h-0.5 bg-slate-400/30" />
                      <div className="absolute top-0 left-[25%] w-0.5 h-full bg-slate-400/30" />
                      <div className="absolute top-0 left-[75%] w-0.5 h-full bg-slate-400/30" />
                    </div>

                    {/* Pontos de Interesse */}
                    <div className="absolute inset-0">
                      {/* Metro/Estacao */}
                      <div className="absolute top-[30%] left-[40%] group cursor-pointer z-5">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Train className="h-3 w-3 text-white" />
                        </div>
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Metro Central
                        </div>
                      </div>

                      {/* Supermercado */}
                      <div className="absolute top-[55%] left-[65%] group cursor-pointer z-5">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <ShoppingCart className="h-3 w-3 text-white" />
                        </div>
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Supermercado
                        </div>
                      </div>

                      {/* Hospital */}
                      <div className="absolute top-[25%] left-[70%] group cursor-pointer z-5">
                        <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Plus className="h-3 w-3 text-white" />
                        </div>
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Hospital
                        </div>
                      </div>

                      {/* Escola */}
                      <div className="absolute top-[65%] left-[30%] group cursor-pointer z-5">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <GraduationCap className="h-3 w-3 text-white" />
                        </div>
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Escola
                        </div>
                      </div>

                      {/* Parque */}
                      <div className="absolute top-[45%] left-[20%] group cursor-pointer z-5">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Trees className="h-3 w-3 text-white" />
                        </div>
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Parque Municipal
                        </div>
                      </div>

                      {/* Shopping */}
                      <div className="absolute top-[15%] left-[55%] group cursor-pointer z-5">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Store className="h-3 w-3 text-white" />
                        </div>
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Shopping Center
                        </div>
                      </div>

                      {/* Academia */}
                      <div className="absolute top-[75%] left-[55%] group cursor-pointer z-5">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Dumbbell className="h-3 w-3 text-white" />
                        </div>
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-700 shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Academia
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Marcadores de Imoveis */}
                  <div className="absolute inset-0">
                    {filteredMapProperties.length > 0 ? (
                      filteredMapProperties.map((property, index) => {
                        // Posicao simulada baseada no indice para distribuir no mapa
                        const positions = [
                          { top: '20%', left: '25%' },
                          { top: '35%', left: '60%' },
                          { top: '55%', left: '30%' },
                          { top: '25%', left: '75%' },
                          { top: '65%', left: '55%' },
                          { top: '45%', left: '15%' },
                          { top: '15%', left: '45%' },
                          { top: '70%', left: '80%' },
                          { top: '40%', left: '85%' },
                          { top: '80%', left: '25%' },
                        ];
                        const pos = positions[index % positions.length];
                        const isHovered = hoveredPropertyId === property.id;
                        const isSelected = selectedMapProperty?.id === property.id;

                        return (
                          <div
                            key={property.id}
                            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-10"
                            style={{ top: pos.top, left: pos.left }}
                            onMouseEnter={() => setHoveredPropertyId(property.id)}
                            onMouseLeave={() => setHoveredPropertyId(null)}
                            onClick={() => setSelectedMapProperty(property)}
                          >
                            {/* Marcador */}
                            <div className={`relative transition-all duration-200 ${isHovered || isSelected ? 'scale-125 z-20' : 'scale-100'}`}>
                              <div className={`
                                px-3 py-1.5 rounded-full shadow-lg font-semibold text-sm whitespace-nowrap
                                ${isSelected ? 'bg-blue-600 text-white' : isHovered ? 'bg-blue-500 text-white' : 'bg-white text-gray-900 border border-slate-200'}
                              `}>
                                R$ {(property.rentAmount / 1000).toFixed(1)}k
                              </div>
                              <div className={`
                                absolute left-1/2 -translate-x-1/2 top-full w-0 h-0
                                border-l-[8px] border-l-transparent
                                border-r-[8px] border-r-transparent
                                border-t-[8px] ${isSelected ? 'border-t-blue-600' : isHovered ? 'border-t-blue-500' : 'border-t-white'}
                              `} />
                              {/* Pulsacao para selecionado */}
                              {isSelected && (
                                <div className="absolute -inset-2 rounded-full bg-blue-400/30 animate-ping" />
                              )}
                            </div>

                            {/* Tooltip no hover */}
                            {isHovered && !isSelected && (
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-white rounded-xl shadow-xl border border-slate-200 z-30">
                                <p className="font-semibold text-sm text-gray-900 line-clamp-1">{property.address}</p>
                                <p className="text-xs text-gray-500">{property.neighborhood}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Bed className="h-3 w-3" /> {property.bedrooms}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Bath className="h-3 w-3" /> {property.bathrooms}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Square className="h-3 w-3" /> {property.area}m²
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl">
                          <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-gray-600 font-medium">Selecione um estado ou cidade</p>
                          <p className="text-sm text-gray-500 mt-1">para ver imoveis disponiveis</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Controles do Mapa */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white shadow-lg"
                      onClick={handleZoomIn}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white shadow-lg"
                      onClick={handleZoomOut}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white shadow-lg"
                      onClick={() => {
                        setSelectedState('');
                        setSelectedCity('');
                        setSelectedMapProperty(null);
                      }}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Info da Cidade */}
                  {(selectedCity || selectedState) && (
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {selectedCity || BRAZILIAN_STATES.find(s => s.code === selectedState)?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {filteredMapProperties.length} {filteredMapProperties.length === 1 ? 'imovel disponivel' : 'imoveis disponiveis'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Legenda */}
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-slate-200">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-white border border-slate-300" />
                        <span className="text-gray-600">Disponivel</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                        <span className="text-gray-600">Selecionado</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card do Imovel Selecionado */}
                {selectedMapProperty && (
                  <div className="absolute top-4 left-4 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-20">
                    <div className="relative">
                      <div className="h-32 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-slate-400" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={() => toggleFavorite(selectedMapProperty.id)}
                      >
                        <Heart className={`h-4 w-4 ${favoriteProperties.has(selectedMapProperty.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 left-2 bg-white/80 hover:bg-white"
                        onClick={() => setSelectedMapProperty(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedMapProperty.address}</h3>
                          <p className="text-sm text-gray-500">{selectedMapProperty.neighborhood}, {selectedMapProperty.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" /> {selectedMapProperty.bedrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4" /> {selectedMapProperty.bathrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Square className="h-4 w-4" /> {selectedMapProperty.area}m²
                        </span>
                        {selectedMapProperty.parkingSpaces > 0 && (
                          <span className="flex items-center gap-1">
                            <Car className="h-4 w-4" /> {selectedMapProperty.parkingSpaces}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            R$ {selectedMapProperty.rentAmount.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-gray-500">+ R$ {selectedMapProperty.condoFees.toLocaleString('pt-BR')} cond.</p>
                        </div>
                        <Button onClick={() => handlePropertyInterest(selectedMapProperty)}>
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grid de Imoveis (abaixo do mapa ou como lista) */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {filteredMapProperties.length > 0
                    ? `${filteredMapProperties.length} imoveis encontrados`
                    : 'Imoveis em destaque'}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedCity ? `em ${selectedCity}, ${selectedState}` :
                   selectedState ? `em ${BRAZILIAN_STATES.find(s => s.code === selectedState)?.name}` :
                   'em todo o Brasil'}
                </p>
              </div>
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                Zoom: {mapZoomLevel}x
              </Badge>
            </div>

            {/* Property Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {(filteredMapProperties.length > 0 ? filteredMapProperties : MAP_PROPERTIES.slice(0, 8)).map((property) => (
                <MapPropertyCard
                  key={property.id}
                  property={property}
                  isHovered={hoveredPropertyId === property.id}
                  isFavorite={favoriteProperties.has(property.id)}
                  onHover={(id) => setHoveredPropertyId(id)}
                  onSelect={() => {
                    setSelectedMapProperty(property);
                    if (!showMapView) setShowMapView(true);
                  }}
                  onFavorite={() => toggleFavorite(property.id)}
                  onInterest={() => handlePropertyInterest(property)}
                />
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-10">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleOpenRegistration('tenant')}
                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              >
                Cadastre-se para ver todos os imoveis
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-blue-200 bg-blue-50 text-blue-700">Como Funciona</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simples, rapido e seguro
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Em 4 passos voce fecha seu contrato com garantia total.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                icon: UserCircle,
                title: 'Cadastro',
                description: 'Crie sua conta e valide sua identidade em minutos via Serasa e biometria.',
              },
              {
                step: 2,
                icon: Home,
                title: 'Escolha',
                description: 'Encontre o imovel ideal entre nossas opcoes verificadas.',
              },
              {
                step: 3,
                icon: Users,
                title: 'Garantia',
                description: 'Indique ou encontre um garantidor. Para a caucao, use o Seguro Fianca.',
              },
              {
                step: 4,
                icon: FileCheck,
                title: 'Contrato NFT',
                description: 'Assine digitalmente e seu contrato vira um NFT na blockchain.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <Card className="h-full hover:shadow-md transition-shadow bg-white border-slate-200">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
                      {item.step}
                    </div>
                    <CardTitle className="text-lg text-gray-900">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
                {item.step < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience-Specific CTAs Section - SEM TAXAS */}
      <section id="para-voce" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-blue-200 bg-blue-50 text-blue-700">Para Voce</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Uma plataforma, todos os beneficios
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Seja voce locatario, proprietario ou garantidor, temos a solucao ideal.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card Locatario */}
            <Card className="relative overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group bg-white">
              <CardHeader className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Key className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Sou Locatario</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Quer alugar um imovel com seguranca e sem burocracia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    'Aprovacao de credito em minutos',
                    'Use garantidor de confianca',
                    'Pague via PIX, boleto ou cartao',
                    'Contrato digital 100% valido',
                    'Suporte via WhatsApp 24/7',
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleOpenRegistration('tenant')}
                >
                  Quero Alugar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Card Locador */}
            <Card className="relative overflow-hidden border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all group bg-white">
              <Badge className="absolute top-4 right-4 bg-blue-600">Popular</Badge>
              <CardHeader className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <Home className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Sou Proprietario</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Quer alugar seu imovel com garantia de recebimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    'Analise de credito com IA',
                    'Recebimento automatico garantido',
                    'Garantia de aluguel via seguro',
                    'Dashboard estilo Home Broker',
                    'Relatorios DIMOB automaticos',
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleOpenRegistration('landlord')}
                >
                  Anunciar Imovel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Card Garantidor - SEM MENCAO DE TAXA */}
            <Card className="relative overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group bg-white">
              <CardHeader className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Award className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Sou Garantidor</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Quer ajudar alguem a alugar usando seu patrimonio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    'Ganhe uma remuneracao pelo servico',
                    'Patrimonio protegido por seguro',
                    'Controle total via dashboard',
                    'Notificacoes em tempo real',
                    'Liberacao automatica ao fim',
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleOpenRegistration('guarantor')}
                >
                  Quero Garantir
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* B2B2C - Parceria com Imobiliarias */}
      <section id="imobiliarias" className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-blue-200 bg-blue-50 text-blue-700">
              <Handshake className="h-4 w-4 mr-2" />
              Parceria B2B2C
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Imobiliarias, cresçam conosco!
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Seja nossa parceira e revolucione a gestao de locacoes da sua imobiliaria.
              Tecnologia blockchain, garantias inovadoras e recebimento garantido para seus clientes.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Beneficios */}
            <div className="space-y-4">
              <Card className="border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900">Aumente sua Receita</h3>
                      <p className="text-gray-600">
                        Ganhe comissoes sobre cada contrato intermediado. Quanto mais locacoes, maior seu faturamento recorrente.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900">Zero Inadimplencia</h3>
                      <p className="text-gray-600">
                        Sistema de garantias e seguro-fianca integrado. Seus clientes proprietarios sempre recebem em dia.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900">Dashboard Exclusivo</h3>
                      <p className="text-gray-600">
                        Painel completo para gerenciar todos os imoveis, contratos e clientes da sua carteira em um so lugar.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Wallet className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900">Pagamentos Automaticos</h3>
                      <p className="text-gray-600">
                        PIX, boleto, cartao ou cripto. Split automatico com sua comissao ja separada na hora do pagamento.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Card */}
            <Card className="bg-blue-600 text-white border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Network className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white">Seja uma Imobiliaria Parceira</CardTitle>
                    <CardDescription className="text-blue-100">
                      Junte-se a rede Vinculo Brasil
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {[
                    'Integracao simples com seu sistema atual',
                    'Suporte tecnico e comercial dedicado',
                    'Treinamento gratuito para sua equipe',
                    'Material de marketing personalizado',
                    'API para integracao com seu CRM',
                    'Relatorios DIMOB automaticos',
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-blue-200 shrink-0" />
                      <span className="text-white/90">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 space-y-3">
                  <Button
                    size="lg"
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold"
                    onClick={() => handleOpenRegistration('realestate')}
                  >
                    <Handshake className="mr-2 h-5 w-5" />
                    Quero ser Parceira
                  </Button>
                  <p className="text-center text-blue-100 text-sm">
                    Cadastro gratuito • Sem taxa de adesao
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-blue-200 bg-blue-50 text-blue-700">
              <HelpCircle className="h-4 w-4 mr-2" />
              Duvidas Frequentes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tire suas duvidas sobre como funciona a locacao inteligente no Vinculo Brasil
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {/* Perguntas sobre o Sistema */}
              <AccordionItem value="item-1" className="border border-slate-200 rounded-lg px-4 bg-slate-50">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-gray-900">O que e o Vinculo Brasil e como funciona?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  O Vinculo Brasil e uma plataforma de locacao imobiliaria que conecta locatarios, proprietarios e garantidores de forma segura.
                  Usamos tecnologia blockchain para criar contratos NFT imutaveis e verificaveis, garantindo seguranca juridica para todas as partes.
                  O sistema permite pagamentos via PIX, boleto, cartao ou criptomoedas, com split automatico entre proprietario, garantidor, seguro e plataforma.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-slate-200 rounded-lg px-4 bg-slate-50">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-gray-900">O que e um contrato NFT e qual sua validade juridica?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  O contrato NFT e um contrato de locacao tradicional (conforme Lei 8.245/91) registrado na blockchain Polygon.
                  Isso garante imutabilidade, transparencia e rastreabilidade de todas as alteracoes.
                  O NFT funciona como prova digital do acordo, com validade juridica equivalente a contratos assinados digitalmente,
                  conforme a Lei 14.063/2020 sobre assinaturas eletronicas.
                </AccordionContent>
              </AccordionItem>

              {/* Perguntas sobre Garantidores */}
              <AccordionItem value="item-3" className="border border-slate-200 rounded-lg px-4 bg-slate-50">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-gray-900">Como funciona o sistema de garantidores?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Voce pode indicar alguem de confianca (familiar, amigo) como garantidor ou buscar garantidores cadastrados na plataforma.
                  O garantidor vincula um patrimonio como garantia (imovel, investimentos, saldo bancario) e em troca recebe uma remuneracao mensal de 5% do valor do aluguel.
                  Todo garantidor possui seguro que protege seu patrimonio em caso de inadimplencia prolongada.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-slate-200 rounded-lg px-4 bg-slate-50">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-gray-900">Posso usar Seguro Fianca ao inves de garantidor?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Sim! Para quem prefere nao envolver terceiros, oferecemos a opcao de Seguro Fianca como caucao.
                  O seguro e contratado diretamente na plataforma e cobre ate 30 meses de aluguel em caso de inadimplencia.
                  O valor e calculado com base no perfil de credito do locatario e no valor do aluguel, geralmente entre 1 a 3 alugueis por ano.
                </AccordionContent>
              </AccordionItem>

              {/* Perguntas sobre Pagamentos */}
              <AccordionItem value="item-5" className="border border-slate-200 rounded-lg px-4 bg-slate-50">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-gray-900">Quais formas de pagamento sao aceitas?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Aceitamos PIX (instantaneo e sem taxas), boleto bancario, cartao de credito (parcelado em ate 12x) e criptomoedas (BRZ stablecoin na rede Polygon).
                  O pagamento em crypto oferece 5% de desconto e e processado com split automatico via smart contract,
                  distribuindo 85% ao proprietario, 5% ao garantidor, 5% ao seguro e 5% a plataforma.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-slate-200 rounded-lg px-4 bg-slate-50">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-gray-900">Como funciona a analise de credito?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Nossa analise de credito e feita em minutos, integrando dados do Serasa, comprovacao de renda via Open Finance e biometria facial.
                  O sistema gera um score de 0 a 1000 que define seu limite de aluguel e as condicoes de garantia.
                  Scores acima de 700 tem aprovacao facilitada, enquanto scores menores podem exigir garantidores adicionais.
                </AccordionContent>
              </AccordionItem>

              {/* Perguntas para Proprietarios */}
              <AccordionItem value="item-7" className="border border-slate-200 rounded-lg px-4 bg-slate-50">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-gray-900">Como proprietario, como recebo meus alugueis?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  O recebimento e automatico e garantido. Assim que o locatario efetua o pagamento, o valor e creditado na sua conta em ate 1 dia util (PIX/crypto) ou 3 dias (boleto/cartao).
                  Em caso de atraso, o garantidor e acionado automaticamente e o seguro cobre o valor apos 30 dias.
                  Voce acompanha tudo em tempo real pelo dashboard estilo Home Broker.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border border-slate-200 rounded-lg px-4 bg-slate-50">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-gray-900">Quanto custa usar a plataforma?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Para locatarios, o cadastro e busca de imoveis sao gratuitos. A taxa da plataforma e de 5% sobre o valor do aluguel, ja incluida no pagamento mensal.
                  Para proprietarios, o anuncio e gratuito e a taxa tambem e de 5% sobre o aluguel recebido.
                  Nao ha taxas de setup, adesao ou cancelamento. O modelo e 100% baseado em sucesso.
                </AccordionContent>
              </AccordionItem>

              {/* Seguranca e Privacidade */}
              <AccordionItem value="item-9" className="border border-slate-200 rounded-lg px-4 bg-slate-50">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-gray-900">Meus dados estao seguros na plataforma?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Sim! Seguimos rigorosamente a LGPD (Lei Geral de Protecao de Dados). Seus dados pessoais sao criptografados e armazenados com seguranca.
                  Usamos autenticacao em duas etapas, biometria facial e verificacao de email.
                  Os dados financeiros sao processados por parceiros certificados PCI-DSS e nunca armazenamos dados de cartao.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="border border-slate-200 rounded-lg px-4 bg-slate-50">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold text-gray-900">E se eu tiver problemas durante a locacao?</span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Oferecemos suporte via WhatsApp, chat na plataforma e telefone.
                  Para questoes juridicas, temos parceria com escritorios especializados em direito imobiliario.
                  Problemas de manutencao podem ser reportados diretamente pelo app, com acompanhamento de status em tempo real.
                  Em casos de inadimplencia ou rescisao, o sistema automatiza notificacoes conforme a Lei do Inquilinato.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* CTA para mais duvidas */}
            <div className="text-center mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-gray-800 mb-4 font-medium">Ainda tem duvidas? Fale conosco!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" className="border-blue-200 bg-white text-blue-700 hover:bg-blue-100">
                  <Phone className="mr-2 h-4 w-4" />
                  Fale Conosco
                </Button>
                <Button variant="outline" size="lg" className="border-blue-200 bg-white text-blue-700 hover:bg-blue-100">
                  <Mail className="mr-2 h-4 w-4" />
                  contato@vinculobrasil.com.br
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Pronto para uma locacao sem dor de cabeca?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Junte-se a centenas de pessoas que ja descobriram a forma mais segura de alugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" onClick={() => handleOpenRegistration('tenant')}>
                Comecar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" onClick={handleOpenLogin}>
                Ja tenho conta
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Vinculo Brasil</span>
              </div>
              <p className="text-gray-400 text-sm">
                A locacao inteligente, garantida por quem voce confia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Para Voce</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => handleOpenRegistration('tenant')} className="hover:text-white transition-colors">Quero Alugar</button></li>
                <li><button onClick={() => handleOpenRegistration('landlord')} className="hover:text-white transition-colors">Sou Proprietario</button></li>
                <li><button onClick={() => handleOpenRegistration('guarantor')} className="hover:text-white transition-colors">Quero Garantir</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Perguntas Frequentes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Em breve</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contato@vinculobrasil.com.br</span>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-700" />
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <p>2025 Vinculo Brasil - Todos os direitos reservados</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span>Lei 8.245/91</span>
              <span>LGPD Compliant</span>
              <span>Blockchain Polygon</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      <Dialog open={authStep === 'registration'} onOpenChange={(open) => !open && handleCloseAuth()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Criar Conta</DialogTitle>
            <DialogDescription>
              Preencha seus dados para comecar a usar o Vinculo Brasil
            </DialogDescription>
          </DialogHeader>

          {/* Imovel de Interesse Salvo */}
          {savedPropertyInterest && (
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-200 mb-2">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 font-medium mb-1">Imovel de seu interesse:</p>
                  <p className="font-semibold text-gray-900 text-sm line-clamp-1">{savedPropertyInterest.address}</p>
                  <p className="text-xs text-gray-500">{savedPropertyInterest.neighborhood}, {savedPropertyInterest.city}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-blue-600 font-bold text-sm">
                      R$ {savedPropertyInterest.rentAmount.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-gray-500">
                      {savedPropertyInterest.bedrooms} quartos • {savedPropertyInterest.area}m²
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-emerald-600 mt-2">
                Apos o cadastro, voce tera acesso completo a este imovel!
              </p>
            </div>
          )}

          <Tabs
            defaultValue={selectedUserType || 'tenant'}
            onValueChange={(v) => setRegistrationForm(prev => ({ ...prev, userType: v as UserType }))}
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="tenant" className="text-xs sm:text-sm">
                <Key className="h-4 w-4 mr-1 hidden sm:block" />
                Locatario
              </TabsTrigger>
              <TabsTrigger value="landlord" className="text-xs sm:text-sm">
                <Home className="h-4 w-4 mr-1 hidden sm:block" />
                Proprietario
              </TabsTrigger>
              <TabsTrigger value="guarantor" className="text-xs sm:text-sm">
                <Award className="h-4 w-4 mr-1 hidden sm:block" />
                Garantidor
              </TabsTrigger>
              <TabsTrigger value="realestate" className="text-xs sm:text-sm">
                <Building2 className="h-4 w-4 mr-1 hidden sm:block" />
                Imobiliaria
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  placeholder="Seu nome completo"
                  value={registrationForm.fullName}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={registrationForm.email}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Celular</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={registrationForm.phone}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={registrationForm.cpf}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, cpf: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Crie uma senha segura"
                    value={registrationForm.password}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <TabsContent value="tenant" className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Quero Alugar</p>
                    <p className="text-sm text-blue-700">
                      Apos o cadastro e verificacao do email, voce podera buscar imoveis,
                      ver valores e indicar seu garantidor de confianca.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="landlord" className="mt-4 p-4 bg-purple-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Home className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900">Sou Proprietario</p>
                    <p className="text-sm text-purple-700">
                      Apos o cadastro e verificacao do email, voce podera anunciar seus imoveis
                      e analisar inquilinos com IA.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="guarantor" className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Quero Garantir</p>
                    <p className="text-sm text-green-700">
                      Apos o cadastro e verificacao do email, voce podera vincular seu patrimonio
                      como garantia e ver as condicoes de remuneracao.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="realestate" className="mt-4 p-4 bg-amber-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Parceria Imobiliaria B2B2C</p>
                    <p className="text-sm text-amber-700">
                      Apos o cadastro, sua imobiliaria tera acesso ao dashboard exclusivo,
                      gestao de carteira de imoveis e comissoes automaticas sobre cada locacao.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCloseAuth}>
              Cancelar
            </Button>
            <Button onClick={handleRegistrationSubmit}>
              Criar Conta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>

          <div className="text-center text-sm text-gray-500">
            Ja tem uma conta?{' '}
            <button
              className="text-blue-600 hover:underline font-medium"
              onClick={() => setAuthStep('login')}
            >
              Faca login
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Verification Modal */}
      <Dialog open={authStep === 'email_verification'} onOpenChange={(open) => !open && handleCloseAuth()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MailCheck className="h-8 w-8 text-blue-600" />
            </div>
            <DialogTitle className="text-2xl text-center">Verifique seu email</DialogTitle>
            <DialogDescription className="text-center">
              Enviamos um codigo de verificacao para{' '}
              <span className="font-medium text-gray-900">
                {pendingUser?.email || registrationForm.email}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Codigo de Verificacao</Label>
              <Input
                id="verificationCode"
                placeholder="Digite o codigo de 6 digitos"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 text-center">
                Para teste, use o codigo: <span className="font-mono font-bold">123456</span>
              </p>
            </div>

            {verificationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            )}

            <Button className="w-full" onClick={handleVerifyEmail}>
              Verificar Email
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center">
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={handleResendCode}
              >
                Reenviar codigo
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <Dialog open={authStep === 'login'} onOpenChange={(open) => !open && handleCloseAuth()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Entrar</DialogTitle>
            <DialogDescription>
              Acesse sua conta no Vinculo Brasil
            </DialogDescription>
          </DialogHeader>

          {/* Imovel de Interesse Salvo */}
          {savedPropertyInterest && (
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-200 mb-2">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 font-medium mb-1">Imovel de seu interesse:</p>
                  <p className="font-semibold text-gray-900 text-sm line-clamp-1">{savedPropertyInterest.address}</p>
                  <p className="text-xs text-gray-500">{savedPropertyInterest.neighborhood}, {savedPropertyInterest.city}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-blue-600 font-bold text-sm">
                      R$ {savedPropertyInterest.rentAmount.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-gray-500">
                      {savedPropertyInterest.bedrooms} quartos • {savedPropertyInterest.area}m²
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                Faca login ou cadastre-se para ver detalhes completos e agendar visita.
              </p>
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="loginEmail">E-mail</Label>
              <Input
                id="loginEmail"
                type="email"
                placeholder="seu@email.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loginPassword">Senha</Label>
              <div className="relative">
                <Input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <Button className="w-full" onClick={handleLogin}>
              Entrar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center text-sm text-gray-500">
              Nao tem uma conta?{' '}
              <button
                className="text-blue-600 hover:underline font-medium"
                onClick={() => handleOpenRegistration('tenant')}
              >
                Cadastre-se
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* iOS Install Guide Modal */}
      <Dialog open={showIosInstallGuide} onOpenChange={setShowIosInstallGuide}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
            <DialogTitle className="text-2xl text-center">Instalar no iPhone/iPad</DialogTitle>
            <DialogDescription className="text-center">
              Siga os passos abaixo para adicionar o app a sua tela inicial
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Passo 1 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Toque no icone de Compartilhar</p>
                <p className="text-sm text-gray-600 mt-1">
                  Na barra inferior do Safari, toque no icone{' '}
                  <Share2 className="inline h-4 w-4 text-blue-600" />
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Adicionar a Tela de Inicio</p>
                <p className="text-sm text-gray-600 mt-1">
                  Role para baixo e toque em "Adicionar a Tela de Inicio"
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Confirme a instalacao</p>
                <p className="text-sm text-gray-600 mt-1">
                  Toque em "Adicionar" no canto superior direito
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800">
                Apos a instalacao, o Vinculo aparecera como um app na sua tela inicial!
              </p>
            </div>

            <Button className="w-full" onClick={() => setShowIosInstallGuide(false)}>
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Banner Flutuante de Download - Mobile Only */}
      {isMobile && !isPwa && (canInstallPwa || isIos) && authStep === 'idle' && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom duration-500">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 shadow-xl flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">Baixe o App Vinculo</p>
              <p className="text-sm text-blue-100 truncate">Acesso rapido na sua tela inicial</p>
            </div>
            <Button
              size="sm"
              onClick={handleInstallApp}
              className="bg-white text-blue-600 hover:bg-blue-50 shrink-0"
            >
              Instalar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Property Card Preview Component - SEM VALORES
function PropertyCardPreview({ property, onInterest }: { property: Property; onInterest: () => void }) {
  const statusColors = {
    available: 'bg-blue-600',
    rented: 'bg-slate-500',
    maintenance: 'bg-slate-400',
  };

  const statusLabels = {
    available: 'Disponivel',
    rented: 'Alugado',
    maintenance: 'Manutencao',
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer border border-slate-200 bg-white">
      {/* Image placeholder with gradient */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="h-16 w-16 text-slate-300" />
        </div>
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button size="sm" onClick={onInterest}>
            Ver Detalhes
          </Button>
        </div>
        {/* Status badge */}
        <Badge className={`absolute top-3 right-3 ${statusColors[property.status]}`}>
          {statusLabels[property.status]}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1">{property.address}</h3>
            <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
          </div>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-slate-400" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-slate-400" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4 text-slate-400" />
            <span>{property.area}m²</span>
          </div>
          {property.petFriendly && (
            <div className="flex items-center gap-1 text-blue-500">
              <PawPrint className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* CTA instead of price */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Lock className="h-4 w-4" />
              <span className="text-sm">Valores apos cadastro</span>
            </div>
            {property.status === 'available' && (
              <Button size="sm" onClick={onInterest}>
                Tenho Interesse
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Map Property Card Component - COM VALORES
interface MapPropertyCardProps {
  property: MapProperty;
  isHovered: boolean;
  isFavorite: boolean;
  onHover: (id: string | null) => void;
  onSelect: () => void;
  onFavorite: () => void;
  onInterest: () => void;
}

function MapPropertyCard({
  property,
  isHovered,
  isFavorite,
  onHover,
  onSelect,
  onFavorite,
  onInterest,
}: MapPropertyCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all cursor-pointer border bg-white ${
        isHovered ? 'shadow-lg border-blue-300 scale-[1.02]' : 'border-slate-200 hover:shadow-md'
      }`}
      onMouseEnter={() => onHover(property.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onSelect}
    >
      {/* Image placeholder */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="h-12 w-12 text-slate-300" />
        </div>
        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>
        {/* Price badge */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md">
          <p className="font-bold text-blue-600 text-sm">
            R$ {property.rentAmount.toLocaleString('pt-BR')}
          </p>
        </div>
        {/* Pet friendly badge */}
        {property.petFriendly && (
          <Badge className="absolute top-2 left-2 bg-emerald-500 text-white text-xs">
            <PawPrint className="h-3 w-3 mr-1" />
            Pet
          </Badge>
        )}
      </div>

      <CardContent className="p-3">
        {/* Location */}
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{property.address}</h3>
          <p className="text-xs text-gray-500">{property.neighborhood}, {property.city}</p>
        </div>

        {/* Features */}
        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <Bed className="h-3 w-3" /> {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3 w-3" /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Square className="h-3 w-3" /> {property.area}m²
          </span>
          {property.parkingSpaces > 0 && (
            <span className="flex items-center gap-1">
              <Car className="h-3 w-3" /> {property.parkingSpaces}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Map className="h-3 w-3 mr-1" />
            Ver no Mapa
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs h-8"
            onClick={(e) => {
              e.stopPropagation();
              onInterest();
            }}
          >
            Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
