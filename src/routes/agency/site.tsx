// ============================================
// AGENCY OS - Meu Site (Whitelabel)
// Preview e gerenciamento do site publico
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { AgencyLayout } from '@/components/layouts/AgencyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Globe,
  ExternalLink,
  Eye,
  Palette,
  Image,
  Type,
  Link2,
  Copy,
  CheckCircle,
  Settings,
  Smartphone,
  Monitor,
  RefreshCw,
  Share2,
  QrCode,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/agency/site' as never)({
  component: AgencySitePage,
});

// Mock de dados da agencia
const MOCK_AGENCY = {
  name: 'Fatto Imoveis',
  slug: 'fatto-imoveis',
  primaryColor: '#10B981',
  logoUrl: null,
  heroUrl: null,
  phone: '11999887766',
  email: 'contato@fattoimoveis.com.br',
  address: 'Av. Paulista, 1000 - Sao Paulo, SP',
  published: true,
  propertiesCount: 24,
  viewsLastMonth: 1580,
};

function AgencySitePage() {
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const siteUrl = `https://vinculobrasil.com.br/imob/${MOCK_AGENCY.slug}`;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenSite = () => {
    window.open(`/imob/${MOCK_AGENCY.slug}`, '_blank');
  };

  return (
    <AgencyLayout agencyName="Minha Imobiliaria" userName="Usuario" userEmail="usuario@email.com">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-400" />
              Meu Site
            </h1>
            <p className="text-zinc-400 mt-1">
              Gerencie sua vitrine digital whitelabel
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
              onClick={handleOpenSite}
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizar Site
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>

        {/* Status e URL */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">{MOCK_AGENCY.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {MOCK_AGENCY.published ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Publicado
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                        Rascunho
                      </Badge>
                    )}
                    <span className="text-sm text-zinc-500">
                      {MOCK_AGENCY.propertiesCount} imoveis • {MOCK_AGENCY.viewsLastMonth} views/mes
                    </span>
                  </div>
                </div>
              </div>

              {/* URL do Site */}
              <div className="w-full md:w-auto">
                <Label className="text-xs text-zinc-500 mb-1 block">URL do seu site</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                    <Link2 className="h-4 w-4 text-zinc-500 mr-2" />
                    <span className="text-sm text-zinc-300 truncate">{siteUrl}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
                    onClick={handleCopyUrl}
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
                    onClick={handleOpenSite}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Configuracoes Rapidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Palette className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">Cores e Marca</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Personalize cores, logo e identidade visual
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-zinc-700"
                      style={{ backgroundColor: MOCK_AGENCY.primaryColor }}
                    />
                    <span className="text-xs text-zinc-500">{MOCK_AGENCY.primaryColor}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Image className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">Imagens</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Logo, banner hero e imagens do site
                  </p>
                  <Button size="sm" variant="link" className="text-blue-400 p-0 mt-2">
                    Fazer upload →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <Type className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">Textos</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Slogan, sobre nos e informacoes
                  </p>
                  <Button size="sm" variant="link" className="text-emerald-400 p-0 mt-2">
                    Editar textos →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview do Site */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100">Preview do Site</CardTitle>
                <CardDescription className="text-zinc-500">
                  Visualize como seu site aparece para os visitantes
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                  className={previewMode === 'desktop' ? 'bg-zinc-700' : 'text-zinc-500'}
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                  className={previewMode === 'mobile' ? 'bg-zinc-700' : 'text-zinc-500'}
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-zinc-500">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`mx-auto bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden ${
              previewMode === 'mobile' ? 'max-w-sm' : 'w-full'
            }`}>
              {/* Simulacao do site */}
              <div className="h-64 bg-gradient-to-br from-emerald-900/50 to-teal-900/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-emerald-500 mx-auto mb-4 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100">{MOCK_AGENCY.name}</h3>
                  <p className="text-sm text-zinc-400 mt-2">Encontre o imovel dos seus sonhos</p>
                  <Button size="sm" className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                    Ver Imoveis
                  </Button>
                </div>
              </div>
              <div className="p-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-600 text-center">
                  Preview simplificado • Clique em "Visualizar Site" para ver completo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compartilhar */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Share2 className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-zinc-100">Compartilhe seu Site</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Divulgue sua vitrine digital nas redes sociais e WhatsApp
                </p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-400">
                    <Share2 className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-400">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-400">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AgencyLayout>
  );
}
