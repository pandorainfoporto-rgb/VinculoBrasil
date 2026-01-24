// =============================================================================
// Campaign Wizard - Criação de Campanhas em 3 Passos
// =============================================================================

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Mail,
  MessageCircle,
  Smartphone,
  Calendar,
  Clock,
  Users,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Send,
  Zap,
  Repeat,
  Info,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  type CampaignFormData,
  type ChannelType,
  type CampaignType,
  type TriggerType,
  type MarketingCampaign,
  CHANNEL_TYPE_LABELS,
  CAMPAIGN_TYPE_LABELS,
  TRIGGER_TYPE_LABELS,
  TEMPLATE_VARIABLES,
  VARIABLE_CATEGORIES,
} from './types';

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface CampaignWizardProps {
  open: boolean;
  onClose: () => void;
  editCampaign?: MarketingCampaign;
}

// -----------------------------------------------------------------------------
// Step Indicator Component
// -----------------------------------------------------------------------------

interface StepIndicatorProps {
  currentStep: number;
  steps: { title: string; description: string }[];
}

function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                index < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : index === currentStep
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
            </div>
            <div className="ml-3 hidden sm:block">
              <p
                className={cn(
                  'text-sm font-medium',
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-4',
                index < currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Channel Card Component
// -----------------------------------------------------------------------------

interface ChannelCardProps {
  channel: ChannelType;
  selected: boolean;
  onSelect: () => void;
}

function ChannelCard({ channel, selected, onSelect }: ChannelCardProps) {
  const icons: Record<ChannelType, React.ReactNode> = {
    email: <Mail className="h-8 w-8" />,
    whatsapp: <MessageCircle className="h-8 w-8" />,
    sms: <Smartphone className="h-8 w-8" />,
  };

  const descriptions: Record<ChannelType, string> = {
    email: 'Campanhas com templates HTML ricos, tracking de abertura e cliques',
    whatsapp: 'Mensagens diretas via WhatsApp Business com alta taxa de leitura',
    sms: 'SMS direto para o celular, ideal para urgências',
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        selected && 'ring-2 ring-primary border-primary'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'p-3 rounded-lg',
              selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {icons[channel]}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{CHANNEL_TYPE_LABELS[channel]}</h3>
            <p className="text-sm text-muted-foreground mt-1">{descriptions[channel]}</p>
          </div>
          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
              selected ? 'border-primary bg-primary' : 'border-muted-foreground'
            )}
          >
            {selected && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Campaign Type Card Component
// -----------------------------------------------------------------------------

interface CampaignTypeCardProps {
  type: CampaignType;
  selected: boolean;
  onSelect: () => void;
}

function CampaignTypeCard({ type, selected, onSelect }: CampaignTypeCardProps) {
  const icons: Record<CampaignType, React.ReactNode> = {
    one_time: <Send className="h-6 w-6" />,
    automated: <Zap className="h-6 w-6" />,
    sequence: <Repeat className="h-6 w-6" />,
  };

  const descriptions: Record<CampaignType, string> = {
    one_time: 'Disparo único para um público específico',
    automated: 'Disparo automático baseado em eventos',
    sequence: 'Sequência de mensagens ao longo do tempo',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 cursor-pointer transition-all',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-muted hover:border-muted-foreground/50'
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'p-2 rounded-lg',
            selected ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}
        >
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="font-medium">{CAMPAIGN_TYPE_LABELS[type]}</p>
          <p className="text-xs text-muted-foreground">{descriptions[type]}</p>
        </div>
        {selected && <Check className="h-5 w-5 text-primary" />}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Wizard Component
// -----------------------------------------------------------------------------

export function CampaignWizard({ open, onClose, editCampaign }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [previewContent, setPreviewContent] = React.useState('');
  const { templates, segments, smtpConfigs, addCampaign, updateCampaign } = useEngageStore();

  const steps = [
    { title: 'Configuração', description: 'Nome e canal' },
    { title: 'Público', description: 'Selecionar audiência' },
    { title: 'Conteúdo', description: 'Template e agendamento' },
  ];

  const defaultValues: CampaignFormData = {
    name: editCampaign?.name || '',
    description: editCampaign?.description || '',
    type: editCampaign?.type || 'one_time',
    channel: editCampaign?.channel || 'email',
    templateId: editCampaign?.templateId || '',
    segmentId: editCampaign?.segmentId || '',
    triggerType: editCampaign?.triggerType || 'manual',
    scheduledAt: editCampaign?.scheduledAt,
    triggerDaysBefore: editCampaign?.triggerDaysBefore,
    triggerTime: editCampaign?.triggerTime || '08:00',
    smtpConfigId: editCampaign?.smtpConfigId || smtpConfigs.find(s => s.isDefault)?.id,
    batchSize: editCampaign?.batchSize || 50,
    batchDelayMs: editCampaign?.batchDelayMs || 1000,
    maxRetries: editCampaign?.maxRetries || 3,
  };

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CampaignFormData>({
    defaultValues,
  });

  const watchChannel = watch('channel');
  const watchType = watch('type');
  const watchTemplateId = watch('templateId');
  const watchSegmentId = watch('segmentId');

  // Filtra templates pelo canal selecionado
  const filteredTemplates = templates.filter(t => t.channel === watchChannel && t.isActive);
  const selectedTemplate = templates.find(t => t.id === watchTemplateId);
  const selectedSegment = segments.find(s => s.id === watchSegmentId);

  // Atualiza preview quando template muda
  React.useEffect(() => {
    if (selectedTemplate) {
      setPreviewContent(selectedTemplate.textContent);
    }
  }, [selectedTemplate]);

  // Reset template quando canal muda
  React.useEffect(() => {
    setValue('templateId', '');
  }, [watchChannel, setValue]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: CampaignFormData) => {
    const now = new Date();

    if (editCampaign) {
      updateCampaign(editCampaign.id, {
        ...data,
        template: selectedTemplate,
        segment: selectedSegment,
      });
    } else {
      const newCampaign: MarketingCampaign = {
        id: `cmp-${Date.now()}`,
        ...data,
        status: data.scheduledAt ? 'scheduled' : 'draft',
        template: selectedTemplate,
        segment: selectedSegment,
        totalRecipients: selectedSegment?.estimatedCount || 0,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        failedCount: 0,
        bouncedCount: 0,
        createdBy: 'admin',
        createdAt: now,
        updatedAt: now,
      };
      addCampaign(newCampaign);
    }

    onClose();
    setCurrentStep(0);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return watch('name').trim() !== '' && watch('channel') && watch('type');
      case 1:
        return watch('segmentId') !== '';
      case 2:
        return watch('templateId') !== '';
      default:
        return true;
    }
  };

  // ---------------------------------------------------------------------------
  // Step 1: Configuração
  // ---------------------------------------------------------------------------

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Nome da Campanha */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Campanha *</Label>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Nome é obrigatório' }}
          render={({ field }) => (
            <Input
              {...field}
              id="name"
              placeholder="Ex: Cobrança Mensal - Janeiro 2024"
            />
          )}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="description"
              placeholder="Descreva brevemente o objetivo desta campanha..."
              rows={2}
            />
          )}
        />
      </div>

      <Separator />

      {/* Canal de Envio */}
      <div className="space-y-3">
        <Label>Canal de Envio *</Label>
        <div className="grid gap-3">
          {(['email', 'whatsapp', 'sms'] as ChannelType[]).map((channel) => (
            <ChannelCard
              key={channel}
              channel={channel}
              selected={watchChannel === channel}
              onSelect={() => setValue('channel', channel)}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Tipo de Campanha */}
      <div className="space-y-3">
        <Label>Tipo de Campanha *</Label>
        <div className="grid gap-2">
          {(['one_time', 'automated', 'sequence'] as CampaignType[]).map((type) => (
            <CampaignTypeCard
              key={type}
              type={type}
              selected={watchType === type}
              onSelect={() => setValue('type', type)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Step 2: Público
  // ---------------------------------------------------------------------------

  const renderStep2 = () => (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Selecione seu público-alvo</AlertTitle>
        <AlertDescription>
          Escolha um segmento pré-configurado ou crie um novo para definir quem receberá esta campanha.
        </AlertDescription>
      </Alert>

      {/* Seleção de Segmento */}
      <div className="space-y-3">
        <Label>Segmento de Audiência *</Label>
        <Controller
          name="segmentId"
          control={control}
          rules={{ required: 'Selecione um segmento' }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um segmento..." />
              </SelectTrigger>
              <SelectContent>
                {segments.filter(s => s.isActive).map((segment) => (
                  <SelectItem key={segment.id} value={segment.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{segment.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        ~{segment.estimatedCount} contatos
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.segmentId && (
          <p className="text-sm text-destructive">{errors.segmentId.message}</p>
        )}
      </div>

      {/* Preview do Segmento Selecionado */}
      {selectedSegment && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              {selectedSegment.name}
            </CardTitle>
            {selectedSegment.description && (
              <CardDescription>{selectedSegment.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Contatos estimados</span>
              <span className="text-2xl font-bold">{selectedSegment.estimatedCount}</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Regras de Segmentação:</p>
              <div className="space-y-1">
                {selectedSegment.rules.map((rule, idx) => (
                  <div key={rule.id} className="flex items-center gap-2 text-sm">
                    {idx > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {rule.logicalOperator || 'AND'}
                      </Badge>
                    )}
                    <code className="bg-muted px-2 py-0.5 rounded text-xs">
                      {rule.field} {rule.operator} {String(rule.value)}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trigger para campanhas automáticas */}
      {watchType === 'automated' && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label>Gatilho de Disparo</Label>
            <Controller
              name="triggerType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange as (value: string) => void} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRIGGER_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {watch('triggerType') === 'due_date_reminder' && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label>Dias antes do vencimento</Label>
                  <Controller
                    name="triggerDaysBefore"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={30}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário de envio</Label>
                  <Controller
                    name="triggerTime"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="time" />
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Step 3: Conteúdo
  // ---------------------------------------------------------------------------

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Seleção de Template */}
      <div className="space-y-3">
        <Label>Template de Mensagem *</Label>
        <Controller
          name="templateId"
          control={control}
          rules={{ required: 'Selecione um template' }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template..." />
              </SelectTrigger>
              <SelectContent>
                {filteredTemplates.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhum template disponível para {CHANNEL_TYPE_LABELS[watchChannel]}
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{template.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.templateId && (
          <p className="text-sm text-destructive">{errors.templateId.message}</p>
        )}
      </div>

      {/* Preview do Template */}
      {selectedTemplate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Preview do Template</CardTitle>
            {selectedTemplate.subject && (
              <CardDescription>
                <strong>Assunto:</strong> {selectedTemplate.subject}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {watchChannel === 'email' && selectedTemplate.htmlContent ? (
              <div
                className="border rounded-lg p-4 bg-white max-h-[300px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }}
              />
            ) : (
              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
                {selectedTemplate.textContent}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-1">
              {selectedTemplate.variables.map((v) => (
                <Badge key={v} variant="outline" className="text-xs">
                  {`{{${v}}}`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Agendamento */}
      <div className="space-y-3">
        <Label>Agendamento</Label>
        {watchType === 'one_time' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Data</Label>
              <Controller
                name="scheduledAt"
                control={control}
                render={({ field }) => (
                  <Input
                    type="date"
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      field.onChange(date);
                    }}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Horário</Label>
              <Controller
                name="triggerTime"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="time" />
                )}
              />
            </div>
          </div>
        )}

        <Alert variant="default" className="bg-muted/50">
          <Clock className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {watchType === 'one_time' && !watch('scheduledAt')
              ? 'Deixe em branco para salvar como rascunho'
              : watchType === 'automated'
                ? 'Campanhas automáticas serão disparadas conforme o gatilho configurado'
                : 'Configure a sequência de mensagens após criar a campanha'
            }
          </AlertDescription>
        </Alert>
      </div>

      {/* Configurações de SMTP (apenas para email) */}
      {watchChannel === 'email' && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label>Servidor SMTP</Label>
            <Controller
              name="smtpConfigId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Usar servidor padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    {smtpConfigs.filter(s => s.isActive).map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        <div className="flex items-center gap-2">
                          <span>{config.name}</span>
                          {config.isDefault && (
                            <Badge variant="secondary" className="text-xs">Padrão</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </>
      )}

      {/* Configurações Avançadas */}
      <Separator />
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
          <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
          Configurações Avançadas
        </summary>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="flex items-center gap-1 cursor-help">
                    Tamanho do Lote
                    <Info className="h-3 w-3" />
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  Quantidade de mensagens enviadas por vez
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Controller
              name="batchSize"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={1}
                  max={500}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="flex items-center gap-1 cursor-help">
                    Delay (ms)
                    <Info className="h-3 w-3" />
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  Intervalo entre os lotes
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Controller
              name="batchDelayMs"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={100}
                  max={10000}
                  step={100}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="flex items-center gap-1 cursor-help">
                    Max Retries
                    <Info className="h-3 w-3" />
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  Tentativas em caso de falha
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Controller
              name="maxRetries"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={0}
                  max={10}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
          </div>
        </div>
      </details>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editCampaign ? 'Editar Campanha' : 'Nova Campanha'}
          </DialogTitle>
          <DialogDescription>
            Configure sua campanha de marketing em 3 passos simples
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <StepIndicator currentStep={currentStep} steps={steps} />

          <ScrollArea className="h-[calc(90vh-280px)] pr-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              {currentStep === 0 && renderStep1()}
              {currentStep === 1 && renderStep2()}
              {currentStep === 2 && renderStep3()}
            </form>
          </ScrollArea>
        </div>

        <DialogFooter className="flex justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={!canProceed()}
              >
                <Check className="h-4 w-4 mr-2" />
                {editCampaign ? 'Salvar Alterações' : 'Criar Campanha'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CampaignWizard;
