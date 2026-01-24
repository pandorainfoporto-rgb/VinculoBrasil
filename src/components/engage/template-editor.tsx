// =============================================================================
// Template Editor - Editor de Templates com Variáveis Dinâmicas
// =============================================================================

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  FileText,
  Mail,
  MessageCircle,
  Smartphone,
  Eye,
  Code,
  Variable,
  User,
  Home,
  CreditCard,
  Building2,
  Settings2,
  Copy,
  Check,
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Save,
  Trash2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useEngageStore } from './store';
import {
  type MessageTemplate,
  type TemplateFormData,
  type ChannelType,
  CHANNEL_TYPE_LABELS,
  TEMPLATE_VARIABLES,
  VARIABLE_CATEGORIES,
} from './types';

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TemplateEditorProps {
  open: boolean;
  onClose: () => void;
  editTemplate?: MessageTemplate;
}

// -----------------------------------------------------------------------------
// Variable Inserter Component
// -----------------------------------------------------------------------------

interface VariableInserterProps {
  onInsert: (variable: string) => void;
}

function VariableInserter({ onInsert }: VariableInserterProps) {
  const [copiedVar, setCopiedVar] = React.useState<string | null>(null);

  const categoryIcons: Record<string, React.ReactNode> = {
    lead: <User className="h-4 w-4" />,
    tenant: <User className="h-4 w-4" />,
    landlord: <User className="h-4 w-4" />,
    contract: <Home className="h-4 w-4" />,
    billing: <CreditCard className="h-4 w-4" />,
    company: <Building2 className="h-4 w-4" />,
    system: <Settings2 className="h-4 w-4" />,
  };

  const handleInsert = (variable: string) => {
    onInsert(variable);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const groupedVariables = TEMPLATE_VARIABLES.reduce(
    (acc, variable) => {
      if (!acc[variable.category]) {
        acc[variable.category] = [];
      }
      acc[variable.category].push(variable);
      return acc;
    },
    {} as Record<string, typeof TEMPLATE_VARIABLES>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Variable className="h-4 w-4 mr-2" />
          Inserir Variável
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">Variáveis Disponíveis</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Clique para inserir no editor
          </p>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {Object.entries(groupedVariables).map(([category, variables]) => (
              <div key={category} className="mb-3">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                  {categoryIcons[category]}
                  {VARIABLE_CATEGORIES[category as keyof typeof VARIABLE_CATEGORIES]}
                </div>
                <div className="space-y-1">
                  {variables.map((variable) => (
                    <button
                      key={variable.key}
                      type="button"
                      onClick={() => handleInsert(variable.key)}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <code className="text-xs bg-muted-foreground/10 px-1.5 py-0.5 rounded">
                          {variable.key}
                        </code>
                        <span className="text-muted-foreground text-xs">
                          {variable.label}
                        </span>
                      </span>
                      {copiedVar === variable.key ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// -----------------------------------------------------------------------------
// Simple Rich Text Toolbar (for Email HTML)
// -----------------------------------------------------------------------------

interface RichTextToolbarProps {
  onFormat: (format: string, value?: string) => void;
}

function RichTextToolbar({ onFormat }: RichTextToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
      <TooltipProvider>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onFormat('bold')}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Negrito</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onFormat('italic')}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Itálico</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onFormat('h1')}
              >
                <Heading1 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Título 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onFormat('h2')}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Título 2</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onFormat('ul')}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Lista</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onFormat('ol')}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Lista Numerada</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onFormat('alignLeft')}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Alinhar Esquerda</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onFormat('alignCenter')}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Centralizar</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onFormat('alignRight')}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Alinhar Direita</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onFormat('link')}
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Inserir Link</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onFormat('image')}
              >
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Inserir Imagem</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Template Editor Component
// -----------------------------------------------------------------------------

export function TemplateEditor({ open, onClose, editTemplate }: TemplateEditorProps) {
  const [activeTab, setActiveTab] = React.useState<'edit' | 'preview' | 'code'>('edit');
  const [previewMode, setPreviewMode] = React.useState<'desktop' | 'mobile'>('desktop');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const htmlTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const { addTemplate, updateTemplate } = useEngageStore();

  const defaultValues: TemplateFormData = {
    name: editTemplate?.name || '',
    channel: editTemplate?.channel || 'email',
    subject: editTemplate?.subject || '',
    htmlContent: editTemplate?.htmlContent || '',
    textContent: editTemplate?.textContent || '',
    previewText: editTemplate?.previewText || '',
    category: editTemplate?.category || 'geral',
    tags: editTemplate?.tags || [],
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm<TemplateFormData>({
    defaultValues,
  });

  const watchChannel = watch('channel');
  const watchHtmlContent = watch('htmlContent');
  const watchTextContent = watch('textContent');

  // Extrai variáveis usadas no template
  const extractVariables = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = content.matchAll(regex);
    const variables = new Set<string>();
    for (const match of matches) {
      variables.add(match[1].trim());
    }
    return Array.from(variables);
  };

  // Insere variável na posição do cursor
  const handleInsertVariable = (variable: string) => {
    const textarea =
      watchChannel === 'email' && activeTab === 'code'
        ? htmlTextareaRef.current
        : textareaRef.current;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue =
        watchChannel === 'email' && activeTab === 'code'
          ? getValues('htmlContent')
          : getValues('textContent');
      const newValue =
        (currentValue || '').substring(0, start) +
        variable +
        (currentValue || '').substring(end);

      if (watchChannel === 'email' && activeTab === 'code') {
        setValue('htmlContent', newValue, { shouldDirty: true });
      } else {
        setValue('textContent', newValue, { shouldDirty: true });
      }

      // Reposiciona cursor após a variável inserida
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  // Renderiza preview com variáveis de exemplo
  const renderPreview = (content: string): string => {
    const sampleData: Record<string, string> = {
      'lead.name': 'João Silva',
      'lead.email': 'joao@email.com',
      'lead.phone': '(11) 99999-9999',
      'lead.company': 'Empresa ABC',
      'tenant.name': 'Maria Oliveira',
      'tenant.email': 'maria@email.com',
      'tenant.cpf': '123.456.789-00',
      'landlord.name': 'Carlos Souza',
      'contract.value': 'R$ 2.500,00',
      'contract.due_date': '10/02/2024',
      'contract.address': 'Rua das Flores, 123 - Apto 45',
      'boleto.url': 'https://banco.com/boleto/123456',
      'boleto.barcode': '23793.38128 60000.000003 00000.000400 1 91200000025000',
      'boleto.value': 'R$ 2.500,00',
      'pix.code': '00020126580014br.gov.bcb.pix0136a629532e-7693-4846-835d',
      'company.name': 'Vínculo Imobiliária',
      'company.phone': '(11) 3456-7890',
      'current_date': '15/01/2024',
      'current_month': 'Janeiro',
    };

    let preview = content;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return preview;
  };

  const onSubmit = (data: TemplateFormData) => {
    const now = new Date();
    const variables = extractVariables(
      data.channel === 'email' ? (data.htmlContent || '') + data.textContent : data.textContent
    );

    if (editTemplate) {
      updateTemplate(editTemplate.id, {
        ...data,
        variables,
      });
    } else {
      const newTemplate: MessageTemplate = {
        id: `tpl-${Date.now()}`,
        ...data,
        variables,
        isActive: true,
        createdBy: 'admin',
        createdAt: now,
        updatedAt: now,
      };
      addTemplate(newTemplate);
    }

    onClose();
  };

  const channelIcons: Record<ChannelType, React.ReactNode> = {
    email: <Mail className="h-4 w-4" />,
    whatsapp: <MessageCircle className="h-4 w-4" />,
    sms: <Smartphone className="h-4 w-4" />,
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {editTemplate ? 'Editar Template' : 'Novo Template'}
          </DialogTitle>
          <DialogDescription>
            Crie templates com variáveis dinâmicas para suas campanhas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden px-6">
            <div className="grid grid-cols-3 gap-6 h-full">
              {/* Coluna Esquerda - Configurações */}
              <div className="space-y-4 overflow-auto py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template *</Label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Nome é obrigatório' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="name"
                        placeholder="Ex: Lembrete de Vencimento"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Controller
                    name="channel"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange as (value: string) => void} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(['email', 'whatsapp', 'sms'] as ChannelType[]).map((ch) => (
                            <SelectItem key={ch} value={ch}>
                              <div className="flex items-center gap-2">
                                {channelIcons[ch]}
                                {CHANNEL_TYPE_LABELS[ch]}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {watchChannel === 'email' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Assunto do E-mail *</Label>
                      <Controller
                        name="subject"
                        control={control}
                        rules={{
                          required: watchChannel === 'email' ? 'Assunto é obrigatório' : false,
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="subject"
                            placeholder="Ex: Seu aluguel vence em 3 dias"
                          />
                        )}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previewText">Texto de Preview</Label>
                      <Controller
                        name="previewText"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="previewText"
                            placeholder="Texto exibido na caixa de entrada"
                          />
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        Aparece junto ao assunto na lista de e-mails
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cobranca">Cobrança</SelectItem>
                          <SelectItem value="relacionamento">Relacionamento</SelectItem>
                          <SelectItem value="onboarding">Onboarding</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="promocional">Promocional</SelectItem>
                          <SelectItem value="geral">Geral</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <Separator />

                {/* Variáveis Usadas */}
                <div className="space-y-2">
                  <Label>Variáveis no Template</Label>
                  <div className="flex flex-wrap gap-1">
                    {extractVariables(
                      watchChannel === 'email'
                        ? (watchHtmlContent || '') + (watchTextContent || '')
                        : watchTextContent || ''
                    ).map((v) => (
                      <Badge key={v} variant="secondary" className="text-xs">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                    {extractVariables(
                      watchChannel === 'email'
                        ? (watchHtmlContent || '') + (watchTextContent || '')
                        : watchTextContent || ''
                    ).length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        Nenhuma variável detectada
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Coluna Direita - Editor */}
              <div className="col-span-2 flex flex-col border rounded-lg overflow-hidden">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as 'edit' | 'preview' | 'code')}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex items-center justify-between border-b px-2">
                    <TabsList className="h-12 bg-transparent">
                      <TabsTrigger value="edit" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Editar
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                      </TabsTrigger>
                      {watchChannel === 'email' && (
                        <TabsTrigger value="code" className="gap-2">
                          <Code className="h-4 w-4" />
                          HTML
                        </TabsTrigger>
                      )}
                    </TabsList>

                    <VariableInserter onInsert={handleInsertVariable} />
                  </div>

                  <TabsContent value="edit" className="flex-1 m-0 flex flex-col">
                    {watchChannel === 'email' && (
                      <RichTextToolbar onFormat={() => {}} />
                    )}
                    <div className="flex-1 p-4">
                      <Controller
                        name="textContent"
                        control={control}
                        rules={{ required: 'Conteúdo é obrigatório' }}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            ref={(e) => {
                              field.ref(e);
                              (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = e;
                            }}
                            className="h-full min-h-[300px] resize-none font-mono text-sm"
                            placeholder={
                              watchChannel === 'whatsapp'
                                ? 'Olá, {{lead.name}}! 👋\n\nSua mensagem aqui...\n\n*Texto em negrito* usando asteriscos\n_Texto em itálico_ usando underlines'
                                : 'Digite o conteúdo da mensagem...'
                            }
                          />
                        )}
                      />
                      {errors.textContent && (
                        <p className="text-sm text-destructive mt-2">
                          {errors.textContent.message}
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="flex-1 m-0 overflow-auto">
                    <div className="p-4">
                      {watchChannel === 'email' && watchHtmlContent ? (
                        <div
                          className={cn(
                            'mx-auto bg-white border rounded-lg shadow-sm',
                            previewMode === 'desktop' ? 'max-w-[600px]' : 'max-w-[375px]'
                          )}
                        >
                          <div className="p-4 border-b bg-muted/30">
                            <p className="text-sm text-muted-foreground">
                              <strong>Assunto:</strong>{' '}
                              {renderPreview(watch('subject') || '')}
                            </p>
                          </div>
                          <div
                            className="p-4"
                            dangerouslySetInnerHTML={{
                              __html: renderPreview(watchHtmlContent),
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'mx-auto p-4 rounded-lg',
                            watchChannel === 'whatsapp'
                              ? 'bg-[#e5ddd5] max-w-[375px]'
                              : 'bg-muted max-w-[375px]'
                          )}
                        >
                          {watchChannel === 'whatsapp' && (
                            <div className="bg-[#dcf8c6] p-3 rounded-lg shadow-sm relative">
                              <div className="absolute -right-1 top-0 w-0 h-0 border-l-8 border-l-[#dcf8c6] border-t-8 border-t-transparent" />
                              <p className="text-sm whitespace-pre-wrap">
                                {renderPreview(watchTextContent || '')}
                              </p>
                              <p className="text-[10px] text-gray-500 text-right mt-1">
                                08:00 ✓✓
                              </p>
                            </div>
                          )}
                          {watchChannel === 'sms' && (
                            <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-bl-none shadow-sm">
                              <p className="text-sm whitespace-pre-wrap">
                                {renderPreview(watchTextContent || '')}
                              </p>
                            </div>
                          )}
                          {watchChannel === 'email' && !watchHtmlContent && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <p className="text-sm whitespace-pre-wrap">
                                {renderPreview(watchTextContent || '')}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {watchChannel === 'email' && (
                    <TabsContent value="code" className="flex-1 m-0 flex flex-col">
                      <div className="flex-1 p-4">
                        <Controller
                          name="htmlContent"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              ref={(e) => {
                                field.ref(e);
                                (htmlTextareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = e;
                              }}
                              className="h-full min-h-[300px] resize-none font-mono text-sm"
                              placeholder="<div>\n  <h1>Olá, {{lead.name}}!</h1>\n  <p>Seu conteúdo aqui...</p>\n</div>"
                            />
                          )}
                        />
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t">
            <div className="flex items-center justify-between w-full">
              {editTemplate && (
                <Button type="button" variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!isDirty}>
                  <Save className="h-4 w-4 mr-2" />
                  {editTemplate ? 'Salvar Alterações' : 'Criar Template'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TemplateEditor;
