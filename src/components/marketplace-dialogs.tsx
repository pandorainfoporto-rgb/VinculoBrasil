/**
 * Dialogos de Marketplace (Fornecedores)
 * Componentes para gerenciar fornecedores de serviços
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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceProvider {
  id: string;
  name: string;
  category: 'reforma' | 'vistoria' | 'limpeza' | 'mudanca' | 'manutencao';
  cnpj: string;
  contactEmail: string;
  contactPhone: string;
  commissionRate: number;
  rating: number;
  completedJobs: number;
  status: 'active' | 'inactive' | 'pending';
}

interface MarketplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: ServiceProvider | null;
  onSave: (provider: ServiceProvider | Omit<ServiceProvider, 'id' | 'rating' | 'completedJobs'>) => void;
}

const CATEGORIES = [
  { value: 'reforma', label: 'Reforma', icon: '🏗️' },
  { value: 'vistoria', label: 'Vistoria', icon: '📋' },
  { value: 'limpeza', label: 'Limpeza', icon: '🧹' },
  { value: 'mudanca', label: 'Mudança', icon: '📦' },
  { value: 'manutencao', label: 'Manutenção', icon: '🔧' },
];

export function MarketplaceDialog({ open, onOpenChange, provider, onSave }: MarketplaceDialogProps) {
  const isEdit = !!provider;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceProvider['category']>('manutencao');
  const [cnpj, setCnpj] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [status, setStatus] = useState<ServiceProvider['status']>('pending');

  useEffect(() => {
    if (provider) {
      setName(provider.name);
      setCategory(provider.category);
      setCnpj(provider.cnpj);
      setContactEmail(provider.contactEmail);
      setContactPhone(provider.contactPhone);
      setCommissionRate(String(provider.commissionRate));
      setStatus(provider.status);
    } else {
      setName('');
      setCategory('manutencao');
      setCnpj('');
      setContactEmail('');
      setContactPhone('');
      setCommissionRate('');
      setStatus('pending');
    }
  }, [provider, open]);

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return cnpj;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return contactPhone;
  };

  const handleSave = () => {
    if (!name || !cnpj || !contactEmail || !commissionRate) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    // Validação básica de CNPJ (14 dígitos)
    const cnpjNumbers = cnpj.replace(/\D/g, '');
    if (cnpjNumbers.length !== 14) {
      alert('CNPJ inválido. Deve conter 14 dígitos.');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      alert('Email inválido');
      return;
    }

    const providerData = {
      ...(isEdit ? { id: provider.id, rating: provider.rating, completedJobs: provider.completedJobs } : {}),
      name,
      category,
      cnpj,
      contactEmail,
      contactPhone,
      commissionRate: Number.parseFloat(commissionRate),
      status,
    };

    onSave(providerData as any);
    onOpenChange(false);
  };

  const selectedCategory = CATEGORIES.find(c => c.value === category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as informações do fornecedor' : 'Cadastre um novo fornecedor no marketplace'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="grid gap-4 py-4">
            {/* Nome */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Fornecedor *</Label>
              <Input
                id="name"
                placeholder="Ex: Reformas Express Ltda"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Categoria */}
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria de Serviço *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CNPJ */}
            <div className="grid gap-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                maxLength={18}
              />
            </div>

            {/* Contatos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@empresa.com.br"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(formatPhone(e.target.value))}
                  maxLength={15}
                />
              </div>
            </div>

            {/* Taxa de Comissão */}
            <div className="grid gap-2">
              <Label htmlFor="commission">Taxa de Comissão (%) *</Label>
              <Input
                id="commission"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Ex: 10.00"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Percentual que o fornecedor paga à plataforma por cada job completado
              </p>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500">Ativo</Badge>
                      <span>Recebendo jobs</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Pendente</Badge>
                      <span>Aguardando aprovação</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Inativo</Badge>
                      <span>Não recebe jobs</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview de estatísticas (apenas ao editar) */}
            {isEdit && provider && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="text-sm font-semibold mb-3">Estatísticas do Fornecedor</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Avaliação</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-4 w-4',
                            i < Math.floor(provider.rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-muted-foreground'
                          )}
                        />
                      ))}
                      <span className="text-sm ml-1">{provider.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Jobs Completados</p>
                    <p className="text-xl font-bold mt-1">{provider.completedJobs}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? 'Salvar Alterações' : 'Adicionar Fornecedor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
