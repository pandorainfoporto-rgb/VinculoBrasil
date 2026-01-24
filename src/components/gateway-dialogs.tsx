/**
 * Dialogos de Gateways de Pagamento
 * Componentes para criar, editar e configurar gateways
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, AlertCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PaymentGateway {
  id: string;
  provider: 'asaas' | 'stripe' | 'mercadopago' | 'pagarme';
  name: string;
  apiKey: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
  status: 'connected' | 'disconnected' | 'error';
  supportedMethods: string[];
  transactionsToday: number;
}

interface GatewayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gateway?: PaymentGateway | null;
  onSave: (gateway: PaymentGateway | Omit<PaymentGateway, 'id' | 'status' | 'transactionsToday'>) => void;
  onTest?: (gatewayId: string) => Promise<boolean>;
  onDelete?: (gatewayId: string) => void;
}

const GATEWAY_PROVIDERS = [
  {
    value: 'asaas',
    label: 'Asaas',
    description: 'Gateway brasileiro com PIX, Boleto e Cartão',
    methods: ['pix', 'boleto', 'credito', 'debito']
  },
  {
    value: 'stripe',
    label: 'Stripe',
    description: 'Gateway internacional líder de mercado',
    methods: ['credito', 'debito', 'pix', 'link']
  },
  {
    value: 'mercadopago',
    label: 'Mercado Pago',
    description: 'Gateway do Mercado Livre',
    methods: ['pix', 'boleto', 'credito', 'debito']
  },
  {
    value: 'pagarme',
    label: 'Pagar.me',
    description: 'Gateway brasileiro Stone',
    methods: ['pix', 'boleto', 'credito', 'debito']
  },
];

const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'credito', label: 'Cartão de Crédito' },
  { value: 'debito', label: 'Cartão de Débito' },
  { value: 'link', label: 'Link de Pagamento' },
];

export function GatewayDialog({ open, onOpenChange, gateway, onSave, onTest, onDelete }: GatewayDialogProps) {
  const isEdit = !!gateway;

  const [provider, setProvider] = useState<'asaas' | 'stripe' | 'mercadopago' | 'pagarme'>('asaas');
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [supportedMethods, setSupportedMethods] = useState<string[]>([]);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (gateway) {
      setProvider(gateway.provider);
      setName(gateway.name);
      setApiKey(gateway.apiKey);
      setWebhookSecret(gateway.webhookSecret);
      setEnvironment(gateway.environment);
      setSupportedMethods(gateway.supportedMethods);
    } else {
      // Limpar ao criar novo
      setProvider('asaas');
      setName('');
      setApiKey('');
      setWebhookSecret('');
      setEnvironment('sandbox');
      setSupportedMethods([]);
    }
  }, [gateway, open]);

  const handleProviderChange = (value: string) => {
    const newProvider = value as typeof provider;
    setProvider(newProvider);

    // Auto-preencher nome e métodos suportados
    const providerInfo = GATEWAY_PROVIDERS.find(p => p.value === value);
    if (providerInfo && !isEdit) {
      setName(providerInfo.label);
      setSupportedMethods(providerInfo.methods);
    }
  };

  const toggleMethod = (method: string) => {
    setSupportedMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleTestConnection = async () => {
    if (!onTest || !gateway?.id) return;

    setTesting(true);
    try {
      const success = await onTest(gateway.id);
      alert(success ? '✅ Conexão testada com sucesso!' : '❌ Falha ao testar conexão');
    } catch (error) {
      alert('❌ Erro ao testar conexão');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!name || !apiKey || supportedMethods.length === 0) {
      alert('Preencha todos os campos obrigatórios e selecione ao menos um método de pagamento');
      return;
    }

    const gatewayData = {
      ...(isEdit ? { id: gateway.id, status: gateway.status, transactionsToday: gateway.transactionsToday } : {}),
      provider,
      name,
      apiKey,
      webhookSecret,
      environment,
      supportedMethods,
    };

    onSave(gatewayData as any);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (gateway?.id && onDelete) {
      onDelete(gateway.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  const selectedProvider = GATEWAY_PROVIDERS.find(p => p.value === provider);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Gateway de Pagamento' : 'Novo Gateway de Pagamento'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as configurações do gateway' : 'Configure um novo gateway de pagamento'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto pr-2">
          {/* Provedor */}
          <div className="grid gap-2">
            <Label htmlFor="provider">Provedor *</Label>
            <Select value={provider} onValueChange={handleProviderChange} disabled={isEdit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GATEWAY_PROVIDERS.map(p => (
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
              <p className="text-xs text-muted-foreground">O provedor não pode ser alterado após criação</p>
            )}
          </div>

          {/* Nome */}
          <div className="grid gap-2">
            <Label htmlFor="name">Nome de Identificação *</Label>
            <Input
              id="name"
              placeholder="Ex: Asaas Produção"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Ambiente */}
          <div className="grid gap-2">
            <Label htmlFor="environment">Ambiente</Label>
            <Select value={environment} onValueChange={(v) => setEnvironment(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Sandbox</Badge>
                    <span>Testes</span>
                  </div>
                </SelectItem>
                <SelectItem value="production">
                  <div className="flex items-center gap-2">
                    <Badge>Production</Badge>
                    <span>Produção (transações reais)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key / Token *</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                placeholder="Insira a chave de API do provedor"
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

          {/* Webhook Secret */}
          <div className="grid gap-2">
            <Label htmlFor="webhook">Webhook Secret (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="webhook"
                type={showWebhook ? 'text' : 'password'}
                placeholder="Secret para validar webhooks"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowWebhook(!showWebhook)}
              >
                {showWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Métodos de Pagamento */}
          <div className="grid gap-3">
            <Label>Métodos de Pagamento Suportados *</Label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map(method => {
                const isAvailable = selectedProvider?.methods.includes(method.value);
                const isSelected = supportedMethods.includes(method.value);

                return (
                  <div
                    key={method.value}
                    className={`flex items-center space-x-2 rounded-md border p-3 ${
                      !isAvailable ? 'opacity-50 bg-muted' : ''
                    }`}
                  >
                    <Checkbox
                      id={method.value}
                      checked={isSelected}
                      disabled={!isAvailable}
                      onCheckedChange={() => toggleMethod(method.value)}
                    />
                    <label
                      htmlFor={method.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {method.label}
                    </label>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Selecione os métodos que deseja ativar para este gateway
            </p>
          </div>

          {/* Alerta de Produção */}
          {environment === 'production' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Este gateway processará transações reais. Certifique-se de que as credenciais estão corretas.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          {isEdit && onDelete && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Gateway
            </Button>
          )}
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
            {isEdit ? 'Salvar Alterações' : 'Adicionar Gateway'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Gateway de Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o gateway <strong>{name}</strong>?
              Esta ação não pode ser desfeita e todas as configurações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir Gateway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
