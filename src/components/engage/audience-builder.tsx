// =============================================================================
// Audience Builder - Construtor Visual de Segmentos
// =============================================================================

import * as React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Users,
  Plus,
  Trash2,
  Filter,
  RefreshCw,
  Save,
  ChevronDown,
  User,
  Home,
  Building2,
  UserCheck,
  Layers,
  Search,
  X,
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
} from '@/components/ui/alert';

import { useEngageStore } from './store';
import {
  type AudienceSegment,
  type SegmentFormData,
  type SegmentRule,
  type SegmentOperator,
} from './types';

// -----------------------------------------------------------------------------
// Constantes
// -----------------------------------------------------------------------------

const ENTITY_TYPES = [
  { value: 'all', label: 'Todos os Contatos', icon: Layers },
  { value: 'lead', label: 'Leads', icon: User },
  { value: 'tenant', label: 'Inquilinos', icon: Home },
  { value: 'landlord', label: 'Proprietários', icon: Building2 },
  { value: 'guarantor', label: 'Garantidores', icon: UserCheck },
] as const;

const OPERATORS: { value: SegmentOperator; label: string; description: string }[] = [
  { value: 'equals', label: 'É igual a', description: 'Valor exato' },
  { value: 'not_equals', label: 'Não é igual a', description: 'Diferente de' },
  { value: 'contains', label: 'Contém', description: 'Texto parcial' },
  { value: 'not_contains', label: 'Não contém', description: 'Não inclui texto' },
  { value: 'greater_than', label: 'Maior que', description: 'Para números' },
  { value: 'less_than', label: 'Menor que', description: 'Para números' },
  { value: 'in', label: 'Está em', description: 'Lista de valores' },
  { value: 'not_in', label: 'Não está em', description: 'Fora da lista' },
  { value: 'is_empty', label: 'Está vazio', description: 'Sem valor' },
  { value: 'is_not_empty', label: 'Não está vazio', description: 'Tem valor' },
];

// Campos disponíveis por tipo de entidade
const AVAILABLE_FIELDS: Record<string, { value: string; label: string; type: 'text' | 'number' | 'boolean' | 'date' | 'select'; options?: string[] }[]> = {
  all: [
    { value: 'name', label: 'Nome', type: 'text' },
    { value: 'email', label: 'E-mail', type: 'text' },
    { value: 'phone', label: 'Telefone', type: 'text' },
    { value: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE', 'PENDING'] },
    { value: 'birthday_month', label: 'Mês de Aniversário', type: 'select', options: ['current_month', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
    { value: 'created_days_ago', label: 'Criado há (dias)', type: 'number' },
  ],
  lead: [
    { value: 'name', label: 'Nome', type: 'text' },
    { value: 'email', label: 'E-mail', type: 'text' },
    { value: 'phone', label: 'Telefone', type: 'text' },
    { value: 'source', label: 'Origem', type: 'select', options: ['facebook', 'google', 'website', 'referral', 'organic', 'whatsapp'] },
    { value: 'temperature', label: 'Temperatura', type: 'select', options: ['frio', 'morno', 'quente'] },
    { value: 'score', label: 'Score', type: 'number' },
    { value: 'created_days_ago', label: 'Criado há (dias)', type: 'number' },
    { value: 'has_deal', label: 'Tem Negócio', type: 'boolean' },
  ],
  tenant: [
    { value: 'name', label: 'Nome', type: 'text' },
    { value: 'email', label: 'E-mail', type: 'text' },
    { value: 'cpf', label: 'CPF', type: 'text' },
    { value: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE', 'PENDING'] },
    { value: 'next_due_days', label: 'Próximo Vencimento (dias)', type: 'number' },
    { value: 'has_overdue', label: 'Tem Inadimplência', type: 'boolean' },
    { value: 'contract_value', label: 'Valor do Aluguel', type: 'number' },
    { value: 'birthday_month', label: 'Mês de Aniversário', type: 'select', options: ['current_month', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
  ],
  landlord: [
    { value: 'name', label: 'Nome', type: 'text' },
    { value: 'email', label: 'E-mail', type: 'text' },
    { value: 'cpf', label: 'CPF/CNPJ', type: 'text' },
    { value: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE'] },
    { value: 'properties_count', label: 'Qtd Imóveis', type: 'number' },
    { value: 'total_revenue', label: 'Receita Total', type: 'number' },
    { value: 'birthday_month', label: 'Mês de Aniversário', type: 'select', options: ['current_month', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
  ],
  guarantor: [
    { value: 'name', label: 'Nome', type: 'text' },
    { value: 'email', label: 'E-mail', type: 'text' },
    { value: 'cpf', label: 'CPF', type: 'text' },
    { value: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE'] },
    { value: 'contracts_count', label: 'Contratos Ativos', type: 'number' },
  ],
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface AudienceBuilderProps {
  open: boolean;
  onClose: () => void;
  editSegment?: AudienceSegment;
}

// -----------------------------------------------------------------------------
// Rule Builder Component
// -----------------------------------------------------------------------------

interface RuleBuilderProps {
  index: number;
  rule: SegmentRule;
  entityType: string;
  onUpdate: (updates: Partial<SegmentRule>) => void;
  onRemove: () => void;
  showLogicalOperator: boolean;
}

function RuleBuilder({
  index,
  rule,
  entityType,
  onUpdate,
  onRemove,
  showLogicalOperator,
}: RuleBuilderProps) {
  const fields = AVAILABLE_FIELDS[entityType] || AVAILABLE_FIELDS.all;
  const selectedField = fields.find((f) => f.value === rule.field);

  // Determina quais operadores mostrar baseado no tipo do campo
  const getAvailableOperators = () => {
    if (!selectedField) return OPERATORS;
    switch (selectedField.type) {
      case 'number':
        return OPERATORS.filter((o) =>
          ['equals', 'not_equals', 'greater_than', 'less_than'].includes(o.value)
        );
      case 'boolean':
        return OPERATORS.filter((o) => ['equals'].includes(o.value));
      case 'select':
        return OPERATORS.filter((o) =>
          ['equals', 'not_equals', 'in', 'not_in'].includes(o.value)
        );
      default:
        return OPERATORS;
    }
  };

  return (
    <div className="space-y-3">
      {showLogicalOperator && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <Select
            value={rule.logicalOperator || 'AND'}
            onValueChange={(v) => onUpdate({ logicalOperator: v as 'AND' | 'OR' })}
          >
            <SelectTrigger className="w-20 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">E</SelectItem>
              <SelectItem value="OR">OU</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
        <div className="flex-1 grid grid-cols-3 gap-2">
          {/* Campo */}
          <Select value={rule.field} onValueChange={(v) => onUpdate({ field: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o campo" />
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Operador */}
          <Select
            value={rule.operator}
            onValueChange={(v) => onUpdate({ operator: v as SegmentOperator })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Operador" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableOperators().map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Valor */}
          {!['is_empty', 'is_not_empty'].includes(rule.operator) && (
            <>
              {selectedField?.type === 'select' && selectedField.options ? (
                <Select
                  value={String(rule.value)}
                  onValueChange={(v) => onUpdate({ value: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Valor" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedField.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt === 'current_month' ? 'Mês Atual' : opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : selectedField?.type === 'boolean' ? (
                <Select
                  value={String(rule.value)}
                  onValueChange={(v) => onUpdate({ value: v === 'true' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Valor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={selectedField?.type === 'number' ? 'number' : 'text'}
                  value={String(rule.value || '')}
                  onChange={(e) =>
                    onUpdate({
                      value:
                        selectedField?.type === 'number'
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                  placeholder="Digite o valor"
                />
              )}
            </>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Audience Builder Component
// -----------------------------------------------------------------------------

export function AudienceBuilder({ open, onClose, editSegment }: AudienceBuilderProps) {
  const [estimatedCount, setEstimatedCount] = React.useState<number | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);

  const { addSegment, updateSegment } = useEngageStore();

  const defaultValues: SegmentFormData = {
    name: editSegment?.name || '',
    description: editSegment?.description || '',
    entityType: editSegment?.entityType || 'all',
    rules: editSegment?.rules || [
      { id: `rule-${Date.now()}`, field: '', operator: 'equals', value: '' },
    ],
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SegmentFormData>({
    defaultValues,
  });

  const { fields: ruleFields, append, remove, update } = useFieldArray({
    control,
    name: 'rules',
  });

  const watchEntityType = watch('entityType');
  const watchRules = watch('rules');

  // Simula cálculo de estimativa
  const calculateEstimate = React.useCallback(() => {
    setIsCalculating(true);

    // Simula delay de API
    setTimeout(() => {
      // Gera número aleatório baseado nas regras
      const baseCount = Math.floor(Math.random() * 200) + 10;
      const rulesMultiplier = Math.max(0.3, 1 - watchRules.length * 0.15);
      setEstimatedCount(Math.floor(baseCount * rulesMultiplier));
      setIsCalculating(false);
    }, 800);
  }, [watchRules]);

  // Recalcula quando regras mudam
  React.useEffect(() => {
    const validRules = watchRules.filter((r) => r.field && r.operator);
    if (validRules.length > 0) {
      calculateEstimate();
    } else {
      setEstimatedCount(null);
    }
  }, [watchRules, calculateEstimate]);

  const handleAddRule = () => {
    append({
      id: `rule-${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      logicalOperator: 'AND',
    });
  };

  const onSubmit = (data: SegmentFormData) => {
    const now = new Date();

    if (editSegment) {
      updateSegment(editSegment.id, {
        ...data,
        estimatedCount: estimatedCount || undefined,
        lastCalculatedAt: now,
      });
    } else {
      const newSegment: AudienceSegment = {
        id: `seg-${Date.now()}`,
        ...data,
        estimatedCount: estimatedCount || undefined,
        lastCalculatedAt: now,
        isActive: true,
        createdBy: 'admin',
        createdAt: now,
        updatedAt: now,
      };
      addSegment(newSegment);
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {editSegment ? 'Editar Segmento' : 'Novo Segmento de Audiência'}
          </DialogTitle>
          <DialogDescription>
            Crie regras para filtrar sua base de contatos e definir o público-alvo das campanhas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Segmento *</Label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Nome é obrigatório' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="name"
                        placeholder="Ex: Inquilinos com vencimento próximo"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Contato</Label>
                  <Controller
                    name="entityType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange as (value: string) => void} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ENTITY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="description"
                      placeholder="Descreva brevemente o objetivo deste segmento..."
                      rows={2}
                    />
                  )}
                />
              </div>

              <Separator />

              {/* Regras de Segmentação */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Regras de Segmentação
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Defina as condições para filtrar os contatos
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRule}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Regra
                  </Button>
                </div>

                {ruleFields.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Nenhuma regra definida. Clique em &quot;Adicionar Regra&quot; para começar a filtrar sua base.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {ruleFields.map((field, index) => (
                      <RuleBuilder
                        key={field.id}
                        index={index}
                        rule={watchRules[index]}
                        entityType={watchEntityType}
                        onUpdate={(updates) => {
                          update(index, { ...watchRules[index], ...updates });
                        }}
                        onRemove={() => remove(index)}
                        showLogicalOperator={index > 0}
                      />
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Prévia da Audiência */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Prévia da Audiência
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={calculateEstimate}
                      disabled={isCalculating}
                    >
                      <RefreshCw
                        className={cn('h-4 w-4 mr-2', isCalculating && 'animate-spin')}
                      />
                      Recalcular
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg">
                    {isCalculating ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Calculando...</span>
                      </div>
                    ) : estimatedCount !== null ? (
                      <div className="text-center">
                        <p className="text-4xl font-bold">{estimatedCount}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          contatos estimados
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          Configure as regras para ver a estimativa
                        </p>
                      </div>
                    )}
                  </div>

                  {watchRules.filter((r) => r.field).length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Resumo das Regras:</p>
                      <div className="flex flex-wrap gap-2">
                        {watchRules
                          .filter((r) => r.field)
                          .map((rule, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {idx > 0 && (
                                <span className="text-primary mr-1">
                                  {rule.logicalOperator || 'E'}
                                </span>
                              )}
                              {rule.field} {OPERATORS.find((o) => o.value === rule.operator)?.label}{' '}
                              {!['is_empty', 'is_not_empty'].includes(rule.operator) &&
                                String(rule.value)}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isDirty && !editSegment}>
              <Save className="h-4 w-4 mr-2" />
              {editSegment ? 'Salvar Alterações' : 'Criar Segmento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AudienceBuilder;
