// =============================================================================
// Deal Detail Modal - Modal de Detalhes do Negócio
// =============================================================================

import * as React from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Calendar,
  Clock,
  Tag,
  MessageSquare,
  FileText,
  Edit2,
  Trash2,
  X,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  Activity,
  ChevronRight,
  MapPin,
  Percent,
  History,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { useCRMStore } from '../store';
import {
  type Deal,
  type Activity as ActivityType,
  type DealPriority,
  type ActivityType as ActivityTypeEnum,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  ACTIVITY_TYPE_LABELS,
  DEAL_STATUS_LABELS,
} from '../types';

// -----------------------------------------------------------------------------
// Componente de Atividade
// -----------------------------------------------------------------------------

interface ActivityItemProps {
  activity: ActivityType;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = (type: ActivityTypeEnum) => {
    switch (type) {
      case 'chamada':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'visita':
        return <MapPin className="h-4 w-4" />;
      case 'reuniao':
        return <Calendar className="h-4 w-4" />;
      case 'documento':
        return <FileText className="h-4 w-4" />;
      case 'contrato':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'nota':
        return <Edit2 className="h-4 w-4" />;
      case 'sistema':
        return <Activity className="h-4 w-4" />;
      case 'automacao':
        return <ChevronRight className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{activity.title}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(activity.createdAt), "dd/MM 'às' HH:mm", {
              locale: ptBR,
            })}
          </span>
        </div>
        {activity.description && (
          <p className="text-sm text-muted-foreground">{activity.description}</p>
        )}
        {activity.isAutomatic && (
          <Badge variant="outline" className="text-[10px]">
            Automático
          </Badge>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Componente Principal
// -----------------------------------------------------------------------------

export function DealDetailModal() {
  const {
    selectedDeal,
    isDealModalOpen,
    closeDealModal,
    leads,
    pipelines,
    activities,
    updateDeal,
    deleteDeal,
    createActivity,
    moveDeal,
  } = useCRMStore();

  const [newNote, setNewNote] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState<Partial<Deal>>({});
  const [isActivityDialogOpen, setIsActivityDialogOpen] = React.useState(false);
  const [activityType, setActivityType] = React.useState<'chamada' | 'email' | 'visita'>('chamada');
  const [activityData, setActivityData] = React.useState({
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
  });

  // Reset ao abrir modal
  React.useEffect(() => {
    if (selectedDeal) {
      setEditForm(selectedDeal);
      setNewNote('');
      setIsEditing(false);
    }
  }, [selectedDeal]);

  if (!selectedDeal) return null;

  const lead = leads.find((l) => l.id === selectedDeal.leadId);
  const pipeline = pipelines.find((p) => p.id === selectedDeal.pipelineId);
  const currentStage = pipeline?.stages.find((s) => s.id === selectedDeal.stageId);
  const dealActivities = activities.filter((a) => a.dealId === selectedDeal.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSave = () => {
    if (editForm) {
      updateDeal(selectedDeal.id, editForm);
      setIsEditing(false);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      createActivity({
        dealId: selectedDeal.id,
        type: 'nota',
        title: 'Nota adicionada',
        description: newNote,
      });
      setNewNote('');
    }
  };

  const openActivityDialog = (type: 'chamada' | 'email' | 'visita') => {
    setActivityType(type);
    setActivityData({
      title: '',
      description: '',
      scheduledDate: '',
      scheduledTime: '',
    });
    setIsActivityDialogOpen(true);
  };

  const handleCreateActivity = () => {
    const titleMap = {
      chamada: 'Ligação registrada',
      email: 'E-mail enviado',
      visita: 'Visita agendada',
    };

    createActivity({
      dealId: selectedDeal.id,
      type: activityType,
      title: activityData.title || titleMap[activityType],
      description: activityData.description,
      scheduledAt: activityData.scheduledDate && activityData.scheduledTime
        ? new Date(`${activityData.scheduledDate}T${activityData.scheduledTime}`)
        : undefined,
    });

    setIsActivityDialogOpen(false);
    setActivityData({ title: '', description: '', scheduledDate: '', scheduledTime: '' });
  };

  const handleDelete = () => {
    deleteDeal(selectedDeal.id);
    closeDealModal();
  };

  const handleMoveToPrevious = () => {
    if (!pipeline || !currentStage) return;
    const prevStage = pipeline.stages.find((s) => s.order === currentStage.order - 1);
    if (prevStage) {
      moveDeal({ dealId: selectedDeal.id, targetStageId: prevStage.id });
    }
  };

  const handleMoveToNext = () => {
    if (!pipeline || !currentStage) return;
    const nextStage = pipeline.stages.find((s) => s.order === currentStage.order + 1);
    if (nextStage) {
      moveDeal({ dealId: selectedDeal.id, targetStageId: nextStage.id });
    }
  };

  return (
    <Dialog open={isDealModalOpen} onOpenChange={closeDealModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {isEditing ? (
                <Input
                  value={editForm.title || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="text-xl font-semibold"
                />
              ) : (
                <DialogTitle className="text-xl">{selectedDeal.title}</DialogTitle>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: currentStage?.color, color: 'white' }}
                >
                  {currentStage?.name}
                </Badge>
                <Badge
                  variant="secondary"
                  className={PRIORITY_COLORS[selectedDeal.priority]}
                >
                  {PRIORITY_LABELS[selectedDeal.priority]}
                </Badge>
                <span>•</span>
                <span>{DEAL_STATUS_LABELS[selectedDeal.status]}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    Salvar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir negócio?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O negócio será
                          permanentemente removido.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveToPrevious}
              disabled={currentStage?.order === 0}
            >
              ← Anterior
            </Button>
            <div className="flex-1 flex items-center gap-1">
              {pipeline?.stages
                .filter((s) => s.order <= 6)
                .map((stage) => (
                  <div
                    key={stage.id}
                    className={cn(
                      'flex-1 h-2 rounded-full transition-colors',
                      stage.order <= (currentStage?.order || 0)
                        ? 'bg-primary'
                        : 'bg-muted'
                    )}
                  />
                ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveToNext}
              disabled={currentStage?.order === 6}
            >
              Próximo →
            </Button>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {/* Content */}
        <Tabs defaultValue="detalhes" className="flex-1">
          <TabsList className="px-6">
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="atividades">
              Atividades ({dealActivities.length})
            </TabsTrigger>
            <TabsTrigger value="contato">Contato</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            {/* Tab: Detalhes */}
            <TabsContent value="detalhes" className="p-6 pt-4 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Valores */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valores
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Aluguel
                      </Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.valorAluguel || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              valorAluguel: Number(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <p className="font-medium">
                          {formatCurrency(selectedDeal.valorAluguel)}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Condomínio
                      </Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.valorCondominio || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              valorCondominio: Number(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <p className="font-medium">
                          {formatCurrency(selectedDeal.valorCondominio || 0)}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">IPTU</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.valorIPTU || ''}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              valorIPTU: Number(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <p className="font-medium">
                          {formatCurrency(selectedDeal.valorIPTU || 0)}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Total/Mês
                      </Label>
                      <p className="font-semibold text-green-600 text-lg">
                        {formatCurrency(selectedDeal.valorTotal)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Imóvel */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Imóvel de Interesse
                  </h3>

                  <div className="space-y-3">
                    {selectedDeal.imovelTipo && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Tipo
                        </Label>
                        <p className="font-medium">{selectedDeal.imovelTipo}</p>
                      </div>
                    )}
                    {selectedDeal.imovelEndereco && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Endereço
                        </Label>
                        <p className="font-medium">{selectedDeal.imovelEndereco}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Probabilidade e Datas */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t">
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Probabilidade
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${selectedDeal.probability}%` }}
                      />
                    </div>
                    <span className="font-medium">{selectedDeal.probability}%</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Previsão de Fechamento
                  </Label>
                  <p className="font-medium mt-1">
                    {selectedDeal.expectedCloseDate
                      ? format(
                          new Date(selectedDeal.expectedCloseDate),
                          "dd 'de' MMMM",
                          { locale: ptBR }
                        )
                      : 'Não definido'}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <History className="h-3 w-3" />
                    Última Atualização
                  </Label>
                  <p className="font-medium mt-1">
                    {format(new Date(selectedDeal.updatedAt), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="pt-4 border-t">
                <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <Tag className="h-3 w-3" />
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedDeal.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Atividades */}
            <TabsContent value="atividades" className="p-6 pt-4 space-y-4">
              {/* Adicionar Nota */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Adicionar uma nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button
                  variant="default"
                  size="icon"
                  className="shrink-0"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Ações Rápidas */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openActivityDialog('chamada')}>
                  <Phone className="h-4 w-4 mr-2" />
                  Registrar Ligação
                </Button>
                <Button variant="outline" size="sm" onClick={() => openActivityDialog('email')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar E-mail
                </Button>
                <Button variant="outline" size="sm" onClick={() => openActivityDialog('visita')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Visita
                </Button>
              </div>

              <Separator />

              {/* Lista de Atividades */}
              <div className="space-y-0">
                {dealActivities.length > 0 ? (
                  dealActivities
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma atividade registrada</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab: Contato */}
            <TabsContent value="contato" className="p-6 pt-4 space-y-4">
              {lead ? (
                <div className="space-y-6">
                  {/* Info do Lead */}
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{lead.nome}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {lead.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {lead.telefone}
                        </span>
                      </div>
                      {lead.cpf && (
                        <p className="text-sm text-muted-foreground mt-1">
                          CPF: {lead.cpf}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          lead.temperature === 'quente'
                            ? 'default'
                            : lead.temperature === 'morno'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {lead.temperature === 'quente' && '🔥 '}
                        {lead.temperature.charAt(0).toUpperCase() +
                          lead.temperature.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Score: {lead.score}/100
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Dados Adicionais */}
                  <div className="grid grid-cols-2 gap-4">
                    {lead.cidade && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Localização
                        </Label>
                        <p className="font-medium">
                          {lead.cidade}
                          {lead.estado && `, ${lead.estado}`}
                        </p>
                      </div>
                    )}
                    {lead.source && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Origem
                        </Label>
                        <p className="font-medium capitalize">
                          {lead.source.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                    {lead.interesseImovel && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Interesse
                        </Label>
                        <p className="font-medium">{lead.interesseImovel}</p>
                      </div>
                    )}
                    {lead.valorMaximo && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Orçamento Máximo
                        </Label>
                        <p className="font-medium">
                          {formatCurrency(lead.valorMaximo)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      E-mail
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Lead não encontrado</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <div className="text-sm text-muted-foreground">
            Criado em{' '}
            {format(new Date(selectedDeal.createdAt), "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </div>
          <div className="flex gap-2">
            {selectedDeal.status !== 'ganho' && selectedDeal.status !== 'perdido' && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const lostStage = pipeline?.stages.find((s) =>
                      s.name.toLowerCase().includes('perdido')
                    );
                    if (lostStage) {
                      moveDeal({ dealId: selectedDeal.id, targetStageId: lostStage.id });
                      closeDealModal();
                    }
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Marcar como Perdido
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const wonStage = pipeline?.stages.find((s) =>
                      s.name.toLowerCase().includes('ganho')
                    );
                    if (wonStage) {
                      moveDeal({ dealId: selectedDeal.id, targetStageId: wonStage.id });
                      closeDealModal();
                    }
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como Ganho
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Dialog de Atividade */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activityType === 'chamada' && <><Phone className="h-5 w-5" /> Registrar Ligação</>}
              {activityType === 'email' && <><Mail className="h-5 w-5" /> Enviar E-mail</>}
              {activityType === 'visita' && <><Calendar className="h-5 w-5" /> Agendar Visita</>}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título (opcional)</Label>
              <Input
                placeholder={
                  activityType === 'chamada' ? 'Ligação realizada' :
                  activityType === 'email' ? 'E-mail enviado' :
                  'Visita agendada'
                }
                value={activityData.title}
                onChange={(e) => setActivityData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder={
                  activityType === 'chamada' ? 'Descreva o resultado da ligação...' :
                  activityType === 'email' ? 'Assunto e conteúdo do e-mail...' :
                  'Detalhes da visita...'
                }
                value={activityData.description}
                onChange={(e) => setActivityData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {activityType === 'visita' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={activityData.scheduledDate}
                    onChange={(e) => setActivityData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={activityData.scheduledTime}
                    onChange={(e) => setActivityData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsActivityDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateActivity}>
              {activityType === 'chamada' && 'Registrar'}
              {activityType === 'email' && 'Registrar'}
              {activityType === 'visita' && 'Agendar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
