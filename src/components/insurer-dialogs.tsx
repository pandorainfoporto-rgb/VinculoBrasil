/**
 * Dialogos de Seguradoras
 * Componentes para criar, editar e gerenciar seguradoras parceiras
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Insurer {
  id: string;
  name: string;
  cnpj: string;
  contactEmail: string;
  contactPhone: string;
  policyTypes: string[];
  commissionRate: number;
  activeContracts: number;
  totalPremium: number;
  portalAccess: boolean;
  status: 'active' | 'inactive' | 'pending';
}

interface InsurerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insurer?: Insurer | null;
  onSave: (insurer: Insurer | Omit<Insurer, 'id' | 'activeContracts' | 'totalPremium'>) => void;
}

const POLICY_TYPES = [
  { value: 'fianca', label: 'Seguro Fiança Locatícia' },
  { value: 'incendio', label: 'Seguro Incêndio' },
  { value: 'residencial', label: 'Seguro Residencial' },
  { value: 'vida', label: 'Seguro de Vida' },
  { value: 'garantia', label: 'Garantia Estendida' },
  { value: 'roubo', label: 'Seguro Roubo' },
  { value: 'danos', label: 'Responsabilidade Civil' },
];

export function InsurerDialog({ open, onOpenChange, insurer, onSave }: InsurerDialogProps) {
  const isEdit = !!insurer;

  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [policyTypes, setPolicyTypes] = useState<string[]>([]);
  const [commissionRate, setCommissionRate] = useState('');
  const [portalAccess, setPortalAccess] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive' | 'pending'>('pending');

  useEffect(() => {
    if (insurer) {
      setName(insurer.name);
      setCnpj(insurer.cnpj);
      setContactEmail(insurer.contactEmail);
      setContactPhone(insurer.contactPhone);
      setPolicyTypes(insurer.policyTypes);
      setCommissionRate(String(insurer.commissionRate));
      setPortalAccess(insurer.portalAccess);
      setStatus(insurer.status);
    } else {
      setName('');
      setCnpj('');
      setContactEmail('');
      setContactPhone('');
      setPolicyTypes([]);
      setCommissionRate('');
      setPortalAccess(false);
      setStatus('pending');
    }
  }, [insurer, open]);

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

  const togglePolicyType = (type: string) => {
    setPolicyTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSave = () => {
    if (!name || !cnpj || !contactEmail || policyTypes.length === 0 || !commissionRate) {
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

    const insurerData = {
      ...(isEdit ? { id: insurer.id, activeContracts: insurer.activeContracts, totalPremium: insurer.totalPremium } : {}),
      name,
      cnpj,
      contactEmail,
      contactPhone,
      policyTypes,
      commissionRate: Number.parseFloat(commissionRate),
      portalAccess,
      status,
    };

    onSave(insurerData as any);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Seguradora' : 'Nova Seguradora'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as informações da seguradora parceira' : 'Cadastre uma nova seguradora parceira'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="grid gap-4 py-4">
            {/* Nome */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Seguradora *</Label>
              <Input
                id="name"
                placeholder="Ex: Porto Seguro"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
                <Label htmlFor="email">Email de Contato *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@seguradora.com.br"
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

            {/* Tipos de Apólice */}
            <div className="grid gap-3">
              <Label>Tipos de Apólice Oferecidos *</Label>
              <div className="grid grid-cols-2 gap-3">
                {POLICY_TYPES.map(policy => {
                  const isSelected = policyTypes.includes(policy.value);
                  return (
                    <div
                      key={policy.value}
                      className="flex items-center space-x-2 rounded-md border p-3"
                    >
                      <Checkbox
                        id={policy.value}
                        checked={isSelected}
                        onCheckedChange={() => togglePolicyType(policy.value)}
                      />
                      <label
                        htmlFor={policy.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {policy.label}
                      </label>
                    </div>
                  );
                })}
              </div>
              {policyTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {policyTypes.map(type => {
                    const policy = POLICY_TYPES.find(p => p.value === type);
                    return (
                      <Badge key={type} variant="secondary">
                        {policy?.label}
                      </Badge>
                    );
                  })}
                </div>
              )}
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
                placeholder="Ex: 15.00"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Percentual de comissão sobre o prêmio da apólice
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
                      <span>Parceria ativa</span>
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
                      <span>Parceria suspensa</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Acesso ao Portal */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="portal">Acesso ao Portal da Seguradora</Label>
                <p className="text-xs text-muted-foreground">
                  Permite que a seguradora acesse o portal para gerenciar apólices
                </p>
              </div>
              <Switch
                id="portal"
                checked={portalAccess}
                onCheckedChange={setPortalAccess}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? 'Salvar Alterações' : 'Adicionar Seguradora'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
