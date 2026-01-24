// ============================================
// TENANT PORTAL - Chamados de Manutenção
// Permite abrir tickets de suporte/manutenção
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { TenantLayout } from '@/components/layouts/TenantLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { NoTicketsEmpty } from '@/components/ui/empty-state';
import { useTickets, useCreateTicket, type Ticket } from '@/hooks/use-api';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Calendar,
  ChevronRight,
  Droplets,
  Zap,
  Lock,
  Paintbrush,
  HelpCircle,
} from 'lucide-react';

export const Route = createFileRoute('/tenant/support')({
  component: TenantSupportPage,
});

const categoryOptions = [
  { value: 'MAINTENANCE', label: 'Manutenção Geral', icon: Wrench, description: 'Reparos e consertos' },
  { value: 'PLUMBING', label: 'Hidráulica', icon: Droplets, description: 'Vazamentos, torneiras, encanamento' },
  { value: 'ELECTRICAL', label: 'Elétrica', icon: Zap, description: 'Tomadas, disjuntores, iluminação' },
  { value: 'SECURITY', label: 'Segurança', icon: Lock, description: 'Fechaduras, portões, interfone' },
  { value: 'PAINTING', label: 'Pintura', icon: Paintbrush, description: 'Paredes, tetos, fachada' },
  { value: 'OTHER', label: 'Outros', icon: HelpCircle, description: 'Outras solicitações' },
];

const priorityOptions = [
  { value: 'LOW', label: 'Baixa', color: 'bg-blue-100 text-blue-700' },
  { value: 'MEDIUM', label: 'Média', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'HIGH', label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  { value: 'URGENT', label: 'Urgente', color: 'bg-red-100 text-red-700' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  OPEN: { label: 'Aberto', color: 'bg-blue-100 text-blue-700', icon: Clock },
  IN_PROGRESS: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-700', icon: Wrench },
  RESOLVED: { label: 'Resolvido', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CLOSED: { label: 'Fechado', color: 'bg-zinc-100 text-zinc-700', icon: CheckCircle },
};

function TenantSupportPage() {
  const { data: ticketsData, isLoading } = useTickets();
  const createTicketMutation = useCreateTicket();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MAINTENANCE' as Ticket['category'],
    priority: 'MEDIUM' as Ticket['priority'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createTicketMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
      });

      toast.success('Chamado aberto com sucesso!');
      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'MAINTENANCE',
        priority: 'MEDIUM',
      });
    } catch {
      toast.error('Erro ao abrir chamado. Tente novamente.');
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const tickets = ticketsData?.data || [];

  return (
    <TenantLayout>
      <div className="space-y-6 md:ml-64 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="h-7 w-7 text-red-500" />
              Manutenção & Suporte
            </h1>
            <p className="text-slate-500 mt-1">
              Abra chamados para solicitar reparos ou tirar dúvidas
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-500 hover:bg-red-600">
                <Plus className="h-4 w-4 mr-2" />
                Novo Chamado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Abrir Chamado</DialogTitle>
                <DialogDescription>
                  Descreva o problema ou solicitação. Nossa equipe responderá em breve.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Categoria */}
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryOptions.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formData.category === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.value as Ticket['category'] })}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                            isSelected
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-red-500' : 'text-slate-400'}`} />
                          <div>
                            <p className="text-sm font-medium">{cat.label}</p>
                            <p className="text-xs text-slate-500">{cat.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Chamado *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Torneira da cozinha vazando"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Detalhada *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o problema com o máximo de detalhes possível..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Prioridade */}
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as Ticket['priority'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={priority.color}>{priority.label}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Use &quot;Urgente&quot; apenas para emergências (vazamentos graves, problemas elétricos perigosos)
                  </p>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-red-500 hover:bg-red-600"
                    disabled={createTicketMutation.isPending}
                  >
                    {createTicketMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </span>
                    ) : (
                      'Abrir Chamado'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {tickets.filter((t) => t.status === 'OPEN').length}
                  </p>
                  <p className="text-xs text-slate-500">Abertos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Wrench className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {tickets.filter((t) => t.status === 'IN_PROGRESS').length}
                  </p>
                  <p className="text-xs text-slate-500">Em Andamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
                  </p>
                  <p className="text-xs text-slate-500">Resolvidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{tickets.length}</p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Chamados */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Meus Chamados</CardTitle>
            <CardDescription>
              Acompanhe o status das suas solicitações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={3} />
            ) : tickets.length === 0 ? (
              <NoTicketsEmpty onAction={() => setIsDialogOpen(true)} />
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const status = statusConfig[ticket.status] || statusConfig.OPEN;
                  const StatusIcon = status.icon;
                  const category = categoryOptions.find((c) => c.value === ticket.category);
                  const CategoryIcon = category?.icon || Wrench;

                  return (
                    <div
                      key={ticket.id}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <CategoryIcon className="h-6 w-6 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 truncate">{ticket.title}</p>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 truncate mt-1">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(ticket.createdAt)}
                          </span>
                          <span>#{ticket.id.slice(-6)}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dica de Emergência */}
        <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Emergência?</h3>
                <p className="text-red-100 mt-1">
                  Em caso de vazamentos graves, problemas elétricos perigosos ou situações de risco,
                  ligue imediatamente para a emergência da imobiliária.
                </p>
                <Button
                  className="mt-4 bg-white text-red-600 hover:bg-red-50"
                  onClick={() => window.open('tel:+5511999999999')}
                >
                  Ligar para Emergência
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TenantLayout>
  );
}
