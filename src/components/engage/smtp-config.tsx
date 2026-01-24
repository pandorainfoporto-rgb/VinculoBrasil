// =============================================================================
// SMTP Configuration - Gestão de Servidores de E-mail
// =============================================================================

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Server,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Eye,
  EyeOff,
  Send,
  Shield,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  Star,
  StarOff,
  Power,
  PowerOff,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useEngageStore } from './store';
import { type SmtpConfig, type SmtpConfigFormData } from './types';

// -----------------------------------------------------------------------------
// Presets SMTP populares
// -----------------------------------------------------------------------------

const SMTP_PRESETS = [
  { name: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: false },
  { name: 'Outlook', host: 'smtp-mail.outlook.com', port: 587, secure: false },
  { name: 'Amazon SES', host: 'email-smtp.us-east-1.amazonaws.com', port: 587, secure: false },
  { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, secure: false },
  { name: 'Mailgun', host: 'smtp.mailgun.org', port: 587, secure: false },
  { name: 'Mailtrap', host: 'smtp.mailtrap.io', port: 2525, secure: false },
];

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface SmtpConfigEditorProps {
  open: boolean;
  onClose: () => void;
  editConfig?: SmtpConfig;
}

// -----------------------------------------------------------------------------
// SMTP Config Editor Dialog
// -----------------------------------------------------------------------------

function SmtpConfigEditor({ open, onClose, editConfig }: SmtpConfigEditorProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<'success' | 'failed' | null>(null);

  const { addSmtpConfig, updateSmtpConfig } = useEngageStore();

  const defaultValues: SmtpConfigFormData = {
    name: editConfig?.name || '',
    host: editConfig?.host || '',
    port: editConfig?.port || 587,
    user: editConfig?.user || '',
    password: editConfig?.password || '',
    secure: editConfig?.secure || false,
    fromEmail: editConfig?.fromEmail || '',
    fromName: editConfig?.fromName || '',
    isDefault: editConfig?.isDefault || false,
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<SmtpConfigFormData>({
    defaultValues,
  });

  const applyPreset = (preset: (typeof SMTP_PRESETS)[0]) => {
    setValue('host', preset.host, { shouldDirty: true });
    setValue('port', preset.port, { shouldDirty: true });
    setValue('secure', preset.secure, { shouldDirty: true });
    if (!watch('name')) {
      setValue('name', `Servidor ${preset.name}`, { shouldDirty: true });
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Simula teste de conexão
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simula resultado (90% sucesso)
    const success = Math.random() > 0.1;
    setTestResult(success ? 'success' : 'failed');
    setIsTesting(false);
  };

  const onSubmit = (data: SmtpConfigFormData) => {
    const now = new Date();

    if (editConfig) {
      updateSmtpConfig(editConfig.id, {
        ...data,
        lastTestedAt: testResult ? now : editConfig.lastTestedAt,
        lastTestResult: testResult || editConfig.lastTestResult,
      });
    } else {
      const newConfig: SmtpConfig = {
        id: `smtp-${Date.now()}`,
        ...data,
        isActive: true,
        lastTestedAt: testResult ? now : undefined,
        lastTestResult: testResult || undefined,
        createdAt: now,
        updatedAt: now,
      };
      addSmtpConfig(newConfig);
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {editConfig ? 'Editar Servidor SMTP' : 'Novo Servidor SMTP'}
          </DialogTitle>
          <DialogDescription>
            Configure as credenciais do servidor de e-mail para envio de campanhas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Presets */}
          <div className="space-y-2">
            <Label>Configuração Rápida</Label>
            <div className="flex flex-wrap gap-2">
              {SMTP_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Servidor *</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Nome é obrigatório' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="name"
                    placeholder="Ex: Servidor Principal"
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex items-end gap-4">
              <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDefault"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="isDefault" className="cursor-pointer">
                      Servidor Padrão
                    </Label>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Configurações do Servidor */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="host">Host SMTP *</Label>
              <Controller
                name="host"
                control={control}
                rules={{ required: 'Host é obrigatório' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="host"
                    placeholder="smtp.exemplo.com"
                  />
                )}
              />
              {errors.host && (
                <p className="text-sm text-destructive">{errors.host.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Porta *</Label>
              <Controller
                name="port"
                control={control}
                rules={{ required: 'Porta é obrigatória' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="port"
                    type="number"
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                )}
              />
            </div>
          </div>

          {/* Credenciais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user">Usuário *</Label>
              <Controller
                name="user"
                control={control}
                rules={{ required: 'Usuário é obrigatório' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="user"
                    placeholder="usuario@exemplo.com"
                  />
                )}
              />
              {errors.user && (
                <p className="text-sm text-destructive">{errors.user.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Controller
                  name="password"
                  control={control}
                  rules={{ required: 'Senha é obrigatória' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* SSL/TLS */}
          <Controller
            name="secure"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Switch
                  id="secure"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="secure" className="cursor-pointer flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Usar SSL/TLS (Conexão Segura)
                </Label>
              </div>
            )}
          />

          <Separator />

          {/* Remetente */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromEmail">E-mail Remetente *</Label>
              <Controller
                name="fromEmail"
                control={control}
                rules={{
                  required: 'E-mail remetente é obrigatório',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'E-mail inválido',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="fromEmail"
                    type="email"
                    placeholder="noreply@exemplo.com"
                  />
                )}
              />
              {errors.fromEmail && (
                <p className="text-sm text-destructive">{errors.fromEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromName">Nome do Remetente *</Label>
              <Controller
                name="fromName"
                control={control}
                rules={{ required: 'Nome do remetente é obrigatório' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="fromName"
                    placeholder="Vínculo Imobiliária"
                  />
                )}
              />
              {errors.fromName && (
                <p className="text-sm text-destructive">{errors.fromName.message}</p>
              )}
            </div>
          </div>

          {/* Resultado do Teste */}
          {testResult && (
            <Alert variant={testResult === 'success' ? 'default' : 'destructive'}>
              {testResult === 'success' ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>
                {testResult === 'success' ? 'Conexão bem-sucedida!' : 'Falha na conexão'}
              </AlertTitle>
              <AlertDescription>
                {testResult === 'success'
                  ? 'O servidor SMTP está configurado corretamente e pronto para uso.'
                  : 'Verifique as credenciais e configurações do servidor.'}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={isTesting}
            >
              {isTesting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isTesting ? 'Testando...' : 'Testar Conexão'}
            </Button>

            <div className="flex-1" />

            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isDirty && !editConfig}>
              <Check className="h-4 w-4 mr-2" />
              {editConfig ? 'Salvar' : 'Criar Servidor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// -----------------------------------------------------------------------------
// SMTP Config List Component
// -----------------------------------------------------------------------------

export function SmtpConfigList() {
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingConfig, setEditingConfig] = React.useState<SmtpConfig | undefined>();

  const { smtpConfigs, updateSmtpConfig, deleteSmtpConfig, setDefaultSmtpConfig } =
    useEngageStore();

  const handleEdit = (config: SmtpConfig) => {
    setEditingConfig(config);
    setEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingConfig(undefined);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingConfig(undefined);
  };

  const handleToggleActive = (config: SmtpConfig) => {
    updateSmtpConfig(config.id, { isActive: !config.isActive });
  };

  const handleSetDefault = (config: SmtpConfig) => {
    setDefaultSmtpConfig(config.id);
  };

  const handleDelete = (config: SmtpConfig) => {
    if (confirm(`Deseja realmente excluir o servidor "${config.name}"?`)) {
      deleteSmtpConfig(config.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Servidores SMTP</h3>
          <p className="text-sm text-muted-foreground">
            Configure os servidores de e-mail para envio de campanhas
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Servidor
        </Button>
      </div>

      {smtpConfigs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Server className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-1">Nenhum servidor configurado</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Configure um servidor SMTP para enviar campanhas por e-mail
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Configurar Servidor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {smtpConfigs.map((config) => (
            <Card key={config.id} className={cn(!config.isActive && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        config.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Server className="h-6 w-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{config.name}</h4>
                        {config.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Padrão
                          </Badge>
                        )}
                        {!config.isActive && (
                          <Badge variant="outline" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {config.host}:{config.port} • {config.fromEmail}
                      </p>

                      <div className="flex items-center gap-4 mt-2">
                        {config.secure ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            SSL/TLS
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Sem SSL
                          </span>
                        )}

                        {config.lastTestedAt && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={cn(
                                    'text-xs flex items-center gap-1',
                                    config.lastTestResult === 'success'
                                      ? 'text-green-600'
                                      : 'text-destructive'
                                  )}
                                >
                                  {config.lastTestResult === 'success' ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <X className="h-3 w-3" />
                                  )}
                                  Último teste: {format(new Date(config.lastTestedAt), "dd/MM HH:mm", { locale: ptBR })}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {config.lastTestResult === 'success'
                                  ? 'Conexão testada com sucesso'
                                  : 'Falha no último teste'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(config)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {!config.isDefault && (
                        <DropdownMenuItem onClick={() => handleSetDefault(config)}>
                          <Star className="h-4 w-4 mr-2" />
                          Definir como Padrão
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleToggleActive(config)}>
                        {config.isActive ? (
                          <>
                            <PowerOff className="h-4 w-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(config)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SmtpConfigEditor
        open={editorOpen}
        onClose={handleCloseEditor}
        editConfig={editingConfig}
      />
    </div>
  );
}

export default SmtpConfigList;
