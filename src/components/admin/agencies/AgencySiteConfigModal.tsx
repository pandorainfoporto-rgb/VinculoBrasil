// ============================================
// WIZARD DE CONFIGURACAO DO SITE WHITELABEL
// 4 Abas: Identidade, Conteudo, Sobre Nos, Contato
// EXPANDIDO: Cores, Banner, Sobre Nos, Redes Sociais
// ============================================

import { useState, useEffect, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Palette,
  FileText,
  Phone,
  Rocket,
  CheckCircle,
  Image,
  Building2,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Mail,
  MapPin,
  Info,
  Link2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================
interface Agency {
  id: string;
  name: string;
  slug: string;
  siteUrl?: string;
  siteConfig?: SiteFormData;
}

interface SiteFormData {
  // Identidade Visual
  siteTitle: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;

  // Conteudo Home
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  ctaButtonText: string;

  // Sobre Nos
  aboutTitle: string;
  aboutDescription: string;
  aboutImageUrl: string;
  foundedYear: string;
  teamSize: string;
  propertiesSold: string;

  // Contato & Redes Sociais
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  googleMapsUrl: string;

  // Redes Sociais
  instagram: string;
  facebook: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  tiktok: string;
}

interface Props {
  agency: Agency | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// ============================================
// CONFIGURACAO
// ============================================
const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

const DEFAULT_FORM_DATA: SiteFormData = {
  siteTitle: '',
  primaryColor: '#0f172a',
  secondaryColor: '#3b82f6',
  accentColor: '#10b981',
  logoUrl: '',
  faviconUrl: '',
  heroTitle: 'Seu novo lar esta aqui',
  heroSubtitle: 'Encontre os melhores imoveis da regiao com quem entende do assunto.',
  heroImageUrl: '',
  ctaButtonText: 'Ver Imoveis',
  aboutTitle: 'Sobre Nos',
  aboutDescription: '',
  aboutImageUrl: '',
  foundedYear: '',
  teamSize: '',
  propertiesSold: '',
  whatsapp: '',
  phone: '',
  email: '',
  address: '',
  googleMapsUrl: '',
  instagram: '',
  facebook: '',
  linkedin: '',
  twitter: '',
  youtube: '',
  tiktok: '',
};

// ============================================
// COMPONENTES AUXILIARES
// ============================================

const ColorPicker = memo(function ColorPicker({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          className="w-12 h-10 p-1 cursor-pointer rounded-lg"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono"
        />
      </div>
      {description && <p className="text-xs text-zinc-500">{description}</p>}
    </div>
  );
});

const SocialInput = memo(function SocialInput({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
});

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export function AgencySiteConfigModal({ agency, open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');
  const [formData, setFormData] = useState<SiteFormData>(DEFAULT_FORM_DATA);

  // Carrega dados existentes quando abre
  useEffect(() => {
    if (agency) {
      const existingConfig: Partial<SiteFormData> = agency.siteConfig || {};
      setFormData({
        ...DEFAULT_FORM_DATA,
        ...existingConfig,
        siteTitle: existingConfig.siteTitle || agency.name || '',
      });
      setActiveTab('identity');
    }
  }, [agency]);

  const updateField = <K extends keyof SiteFormData>(field: K, value: SiteFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!agency) return;
    setLoading(true);

    try {
      console.log('[SITE CONFIG] Salvando configuracoes para:', agency.name);

      const token = localStorage.getItem('token');
      const siteUrl = `https://${agency.slug}.vinculobrasil.com.br`;

      const response = await fetch(`${API_URL}/api/agencies/${agency.id}/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          siteUrl,
          config: formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || 'Falha ao salvar');
      }

      console.log('[SITE CONFIG] Configuracoes salvas com sucesso');
      toast.success('Site configurado e publicado com sucesso!');
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('[SITE CONFIG ERROR]', error);
      const message = error instanceof Error ? error.message : 'Erro ao salvar configuracoes.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!agency) return null;

  const isNewSite = !agency.siteUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            {isNewSite ? (
              <Rocket className="h-5 w-5 text-orange-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {isNewSite ? 'Publicar Site Whitelabel' : 'Configurar Site'}: {agency.name}
          </DialogTitle>
          <p className="text-sm text-zinc-400 mt-1">
            {isNewSite
              ? `O site sera publicado em: ${agency.slug}.vinculobrasil.com.br`
              : `Editando configuracoes de: ${agency.siteUrl}`}
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-800">
            <TabsTrigger value="identity" className="flex items-center gap-2 text-xs">
              <Palette className="h-4 w-4" />
              Identidade
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 text-xs">
              <Image className="h-4 w-4" />
              Hero/Banner
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2 text-xs">
              <Building2 className="h-4 w-4" />
              Sobre Nos
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2 text-xs">
              <Phone className="h-4 w-4" />
              Contato
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: IDENTIDADE VISUAL */}
          <TabsContent value="identity" className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteTitle" className="text-white">Titulo do Site (SEO)</Label>
                <Input
                  id="siteTitle"
                  value={formData.siteTitle}
                  onChange={(e) => updateField('siteTitle', e.target.value)}
                  placeholder="Nome da Imobiliaria"
                  className="bg-zinc-800 border-zinc-700"
                />
                <p className="text-xs text-zinc-500">
                  Aparece na aba do navegador e nos resultados do Google.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-white">URL do Logo</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => updateField('logoUrl', e.target.value)}
                  placeholder="https://..."
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Esquema de Cores
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ColorPicker
                label="Cor Primaria"
                value={formData.primaryColor}
                onChange={(v) => updateField('primaryColor', v)}
                description="Header, botoes principais"
              />
              <ColorPicker
                label="Cor Secundaria"
                value={formData.secondaryColor}
                onChange={(v) => updateField('secondaryColor', v)}
                description="Links, destaques"
              />
              <ColorPicker
                label="Cor de Destaque"
                value={formData.accentColor}
                onChange={(v) => updateField('accentColor', v)}
                description="Badges, indicadores"
              />
            </div>

            {/* Preview de cores */}
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-800/50">
              <p className="text-sm font-medium mb-3 text-white">Preview</p>
              <div className="flex gap-4 items-center flex-wrap">
                <div
                  className="h-10 px-6 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  Primaria
                </div>
                <div
                  className="h-10 px-6 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: formData.secondaryColor }}
                >
                  Secundaria
                </div>
                <div
                  className="h-10 px-6 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: formData.accentColor }}
                >
                  Destaque
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ABA 2: CONTEUDO HERO/BANNER */}
          <TabsContent value="content" className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle" className="text-white">Titulo Principal (Hero)</Label>
              <Input
                id="heroTitle"
                value={formData.heroTitle}
                onChange={(e) => updateField('heroTitle', e.target.value)}
                placeholder="Seu novo lar esta aqui"
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroSubtitle" className="text-white">Subtitulo</Label>
              <Textarea
                id="heroSubtitle"
                value={formData.heroSubtitle}
                onChange={(e) => updateField('heroSubtitle', e.target.value)}
                placeholder="Encontre os melhores imoveis da regiao..."
                rows={3}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="heroImageUrl" className="text-white flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  URL da Imagem do Banner
                </Label>
                <Input
                  id="heroImageUrl"
                  value={formData.heroImageUrl}
                  onChange={(e) => updateField('heroImageUrl', e.target.value)}
                  placeholder="https://..."
                  className="bg-zinc-800 border-zinc-700"
                />
                <p className="text-xs text-zinc-500">
                  Recomendado: 1920x600px, formato JPG/WebP
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaButtonText" className="text-white">Texto do Botao CTA</Label>
                <Input
                  id="ctaButtonText"
                  value={formData.ctaButtonText}
                  onChange={(e) => updateField('ctaButtonText', e.target.value)}
                  placeholder="Ver Imoveis"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>

            {/* Preview do Hero */}
            <div className="border border-zinc-800 rounded-lg overflow-hidden">
              <div
                className="p-8 text-center relative"
                style={{
                  backgroundColor: formData.primaryColor,
                  backgroundImage: formData.heroImageUrl ? `url(${formData.heroImageUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {formData.heroImageUrl && (
                  <div className="absolute inset-0 bg-black/50" />
                )}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {formData.heroTitle || 'Titulo do Hero'}
                  </h3>
                  <p className="text-white/80 mb-4">{formData.heroSubtitle || 'Subtitulo do hero'}</p>
                  <button
                    className="px-6 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: formData.secondaryColor }}
                  >
                    {formData.ctaButtonText || 'Ver Imoveis'}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ABA 3: SOBRE NOS */}
          <TabsContent value="about" className="space-y-6 py-4">
            <Alert className="bg-blue-900/20 border-blue-700">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300 text-sm">
                Esta secao aparece na pagina "Sobre" do site e tambem pode ser exibida na home.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="aboutTitle" className="text-white">Titulo da Secao</Label>
                <Input
                  id="aboutTitle"
                  value={formData.aboutTitle}
                  onChange={(e) => updateField('aboutTitle', e.target.value)}
                  placeholder="Sobre Nos"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutImageUrl" className="text-white">Imagem "Sobre Nos"</Label>
                <Input
                  id="aboutImageUrl"
                  value={formData.aboutImageUrl}
                  onChange={(e) => updateField('aboutImageUrl', e.target.value)}
                  placeholder="https://..."
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutDescription" className="text-white">Texto "Sobre Nos"</Label>
              <Textarea
                id="aboutDescription"
                value={formData.aboutDescription}
                onChange={(e) => updateField('aboutDescription', e.target.value)}
                placeholder="Conte a historia da imobiliaria, missao, valores..."
                rows={6}
                className="bg-zinc-800 border-zinc-700"
              />
              <p className="text-xs text-zinc-500">Suporta ate 1000 caracteres</p>
            </div>

            <Separator className="bg-zinc-800" />

            <h3 className="text-sm font-medium text-white">Numeros e Estatisticas</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Ano de Fundacao</Label>
                <Input
                  type="number"
                  value={formData.foundedYear}
                  onChange={(e) => updateField('foundedYear', e.target.value)}
                  placeholder="2010"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Tamanho da Equipe</Label>
                <Input
                  value={formData.teamSize}
                  onChange={(e) => updateField('teamSize', e.target.value)}
                  placeholder="25+ profissionais"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Imoveis Vendidos</Label>
                <Input
                  value={formData.propertiesSold}
                  onChange={(e) => updateField('propertiesSold', e.target.value)}
                  placeholder="500+ imoveis"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>
          </TabsContent>

          {/* ABA 4: CONTATO & REDES SOCIAIS */}
          <TabsContent value="contact" className="space-y-6 py-4">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Informacoes de Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-500" />
                  WhatsApp
                </Label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                  placeholder="5511999999999"
                  className="bg-zinc-800 border-zinc-700"
                />
                <p className="text-xs text-zinc-500">Codigo do pais + DDD + numero</p>
              </div>

              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone Fixo
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="(11) 3333-3333"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-mail
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="contato@imobiliaria.com"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereco
                </Label>
                <Input
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Rua das Flores, 123 - Centro"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Link do Google Maps
              </Label>
              <Input
                value={formData.googleMapsUrl}
                onChange={(e) => updateField('googleMapsUrl', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <Separator className="bg-zinc-800" />

            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Redes Sociais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SocialInput
                icon={Instagram}
                label="Instagram"
                value={formData.instagram}
                onChange={(v) => updateField('instagram', v)}
                placeholder="https://instagram.com/..."
              />
              <SocialInput
                icon={Facebook}
                label="Facebook"
                value={formData.facebook}
                onChange={(v) => updateField('facebook', v)}
                placeholder="https://facebook.com/..."
              />
              <SocialInput
                icon={Linkedin}
                label="LinkedIn"
                value={formData.linkedin}
                onChange={(v) => updateField('linkedin', v)}
                placeholder="https://linkedin.com/..."
              />
              <SocialInput
                icon={Twitter}
                label="Twitter/X"
                value={formData.twitter}
                onChange={(v) => updateField('twitter', v)}
                placeholder="https://twitter.com/..."
              />
              <SocialInput
                icon={Youtube}
                label="YouTube"
                value={formData.youtube}
                onChange={(v) => updateField('youtube', v)}
                placeholder="https://youtube.com/..."
              />
              <SocialInput
                icon={Globe}
                label="TikTok"
                value={formData.tiktok}
                onChange={(v) => updateField('tiktok', v)}
                placeholder="https://tiktok.com/..."
              />
            </div>

            <Alert className="bg-green-900/20 border-green-700">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300 text-sm">
                Um botao flutuante de WhatsApp sera exibido em todas as paginas do site.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* FOOTER COM ACOES */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-800">
          <p className="text-sm text-zinc-400">
            {isNewSite
              ? 'Apos salvar, o site sera publicado automaticamente.'
              : 'As alteracoes serao aplicadas imediatamente.'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-700 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className={cn(
                isNewSite ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Salvando...' : isNewSite ? 'Publicar Site' : 'Salvar Alteracoes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AgencySiteConfigModal;
