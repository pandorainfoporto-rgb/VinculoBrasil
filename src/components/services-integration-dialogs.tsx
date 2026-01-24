/**
 * Dialogos de Serviços e Integrações
 * Componentes para gerenciar serviços da plataforma e integrações externas
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Camera, ShieldCheck, PenTool, Fingerprint, QrCode, Bot } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ==================== TIPOS ====================

interface PlatformService {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'payment' | 'document' | 'automation' | 'verification';
  icon: string;
  isActive: boolean;
  config?: Record<string, any>;
}

interface ExternalIntegration {
  id: string;
  name: string;
  description: string;
  provider: string;
  apiKey?: string;
  webhookUrl?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  config?: Record<string, any>;
}

// ==================== SERVIÇOS ====================

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: PlatformService | null;
  onSave: (service: PlatformService | Omit<PlatformService, 'id'>) => void;
}

const SERVICE_ICONS = [
  { value: 'camera', label: 'Câmera', component: Camera },
  { value: 'shield', label: 'Escudo', component: ShieldCheck },
  { value: 'pen', label: 'Caneta', component: PenTool },
  { value: 'fingerprint', label: 'Digital', component: Fingerprint },
  { value: 'qrcode', label: 'QR Code', component: QrCode },
  { value: 'bot', label: 'Robô', component: Bot },
];

const SERVICE_CATEGORIES = [
  { value: 'security', label: 'Segurança' },
  { value: 'payment', label: 'Pagamento' },
  { value: 'document', label: 'Documentos' },
  { value: 'automation', label: 'Automação' },
  { value: 'verification', label: 'Verificação' },
];

export function ServiceDialog({ open, onOpenChange, service, onSave }: ServiceDialogProps) {
  const isEdit = !!service;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PlatformService['category']>('automation');
  const [icon, setIcon] = useState('bot');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description);
      setCategory(service.category);
      setIcon(service.icon);
      setIsActive(service.isActive);
    } else {
      setName('');
      setDescription('');
      setCategory('automation');
      setIcon('bot');
      setIsActive(true);
    }
  }, [service, open]);

  const handleSave = () => {
    if (!name || !description) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const serviceData = {
      ...(isEdit ? { id: service.id } : {}),
      name,
      description,
      category,
      icon,
      isActive,
      config: service?.config || {},
    };

    onSave(serviceData as any);
    onOpenChange(false);
  };

  const IconComponent = SERVICE_ICONS.find(i => i.value === icon)?.component || Bot;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as configurações do serviço' : 'Adicione um novo serviço à plataforma'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Nome */}
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Serviço *</Label>
            <Input
              id="name"
              placeholder="Ex: Vistoria Digital"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva o que este serviço faz..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Categoria */}
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ícone */}
          <div className="grid gap-2">
            <Label htmlFor="icon">Ícone</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_ICONS.map(i => {
                  const Icon = i.component;
                  return (
                    <SelectItem key={i.value} value={i.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{i.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">{name || 'Nome do Serviço'}</h4>
                <p className="text-sm text-muted-foreground">{description || 'Descrição do serviço'}</p>
              </div>
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="active">Serviço Ativo</Label>
              <p className="text-xs text-muted-foreground">
                Define se o serviço está disponível na plataforma
              </p>
            </div>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? 'Salvar Alterações' : 'Adicionar Serviço'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== INTEGRAÇÕES ====================

interface IntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration?: ExternalIntegration | null;
  onSave: (integration: ExternalIntegration | Omit<ExternalIntegration, 'id' | 'status' | 'lastSync'>) => void;
  onTest?: (integrationId: string) => Promise<boolean>;
}

const INTEGRATION_PROVIDERS = [
  { value: 'asaas', label: 'Asaas', description: 'Gateway de pagamentos' },
  { value: 'zapsign', label: 'ZapSign', description: 'Assinatura digital' },
  { value: 'polygon', label: 'Polygon', description: 'Blockchain' },
  { value: 'ipfs', label: 'IPFS', description: 'Armazenamento descentralizado' },
  { value: 'whatsapp', label: 'WhatsApp Business', description: 'Mensageria' },
  { value: 'openai', label: 'OpenAI', description: 'IA e Chatbots' },
  { value: 'custom', label: 'Personalizado', description: 'API customizada' },
];

export function IntegrationDialog({ open, onOpenChange, integration, onSave, onTest }: IntegrationDialogProps) {
  const isEdit = !!integration;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState('custom');
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (integration) {
      setName(integration.name);
      setDescription(integration.description);
      setProvider(integration.provider);
      setApiKey(integration.apiKey || '');
      setWebhookUrl(integration.webhookUrl || '');
    } else {
      setName('');
      setDescription('');
      setProvider('custom');
      setApiKey('');
      setWebhookUrl('');
    }
  }, [integration, open]);

  const handleProviderChange = (value: string) => {
    setProvider(value);
    const providerInfo = INTEGRATION_PROVIDERS.find(p => p.value === value);
    if (providerInfo && !isEdit) {
      setName(providerInfo.label);
      setDescription(providerInfo.description);
    }
  };

  const handleTestConnection = async () => {
    if (!onTest || !integration?.id) return;

    setTesting(true);
    try {
      const success = await onTest(integration.id);
      alert(success ? '✅ Integração testada com sucesso!' : '❌ Falha ao testar integração');
    } catch (error) {
      alert('❌ Erro ao testar integração');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!name || !description) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const integrationData = {
      ...(isEdit ? { id: integration.id, status: integration.status, lastSync: integration.lastSync } : {}),
      name,
      description,
      provider,
      apiKey: apiKey || undefined,
      webhookUrl: webhookUrl || undefined,
      config: integration?.config || {},
    };

    onSave(integrationData as any);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Integração' : 'Nova Integração'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as configurações da integração' : 'Configure uma nova integração externa'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="grid gap-4 py-4">
            {/* Provedor */}
            <div className="grid gap-2">
              <Label htmlFor="provider">Provedor *</Label>
              <Select value={provider} onValueChange={handleProviderChange} disabled={isEdit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTEGRATION_PROVIDERS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <div>
                        <div className="font-semibold">{p.label}</div>
                        <div className="text-xs text-muted-foreground">{p.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEdit && (
                <p className="text-xs text-muted-foreground">O provedor não pode ser alterado</p>
              )}
            </div>

            {/* Nome */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Integração *</Label>
              <Input
                id="name"
                placeholder="Ex: Asaas Pagamentos"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Descrição */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                placeholder="Descreva a finalidade desta integração..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* API Key */}
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key / Token (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="Chave de API do provedor"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Webhook URL */}
            <div className="grid gap-2">
              <Label htmlFor="webhook">URL do Webhook (opcional)</Label>
              <Input
                id="webhook"
                type="url"
                placeholder="https://api.exemplo.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                URL para receber notificações desta integração
              </p>
            </div>

            {/* Status da Integração (apenas ao editar) */}
            {isEdit && integration && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Status da Integração</h4>
                  <Badge
                    className={
                      integration.status === 'connected'
                        ? 'bg-emerald-500'
                        : integration.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                    }
                  >
                    {integration.status === 'connected' ? 'Conectado' : integration.status === 'error' ? 'Erro' : 'Desconectado'}
                  </Badge>
                </div>
                {integration.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Última sincronização: {new Date(integration.lastSync).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            )}

            {/* Alertas */}
            {apiKey && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  As credenciais serão armazenadas de forma segura e criptografada
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          {isEdit && onTest && (
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? 'Testando...' : 'Testar Conexão'}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? 'Salvar Alterações' : 'Adicionar Integração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
