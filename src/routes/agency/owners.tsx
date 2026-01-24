// ============================================
// CRM DE PROPRIETÁRIOS - AGENCY OS
// Gestão de proprietários vinculados à agência
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { AgencyLayout } from '@/components/layouts/AgencyLayout';
import {
  Users,
  Plus,
  Search,
  Wallet,
  Home,
  Phone,
  Mail,
  Edit2,
  Loader2,
  Building2,
  CheckCircle,
  AlertCircle,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const Route = createFileRoute('/agency/owners')({
  component: AgencyOwnersPage,
});

// ============================================
// TIPOS
// ============================================
interface Owner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  pixKey?: string;
  pixKeyType?: string;
  bankCode?: string;
  bankAgency?: string;
  bankAccount?: string;
  bankAccountType?: string;
  status: string;
  createdAt: string;
  _count?: {
    properties: number;
  };
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  pixKey: string;
  pixKeyType: string;
  bankCode: string;
  bankAgency: string;
  bankAccount: string;
  bankAccountType: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  cpf: '',
  pixKey: '',
  pixKeyType: '',
  bankCode: '',
  bankAgency: '',
  bankAccount: '',
  bankAccountType: '',
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function AgencyOwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

  // ============================================
  // FETCH PROPRIETÁRIOS
  // ============================================
  const fetchOwners = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/agency/owners`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Erro ao carregar proprietários');
      }

      const data = await res.json();
      setOwners(data.owners || []);
    } catch (err) {
      console.error('Erro ao buscar proprietários:', err);
      toast.error('Erro ao carregar lista de proprietários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // ============================================
  // CRIAR PROPRIETÁRIO
  // ============================================
  const handleCreate = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Nome e Email são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/agency/owners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          pixKeyType: formData.pixKeyType || undefined,
          bankAccountType: formData.bankAccountType || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao cadastrar proprietário');
      }

      const result = await res.json();
      toast.success(`Proprietário cadastrado! Senha temporária: ${result.temporaryPassword}`);
      setIsCreateModalOpen(false);
      setFormData(initialFormData);
      fetchOwners();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // ATUALIZAR PROPRIETÁRIO
  // ============================================
  const handleUpdate = async () => {
    if (!selectedOwner) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/agency/owners/${selectedOwner.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          cpf: formData.cpf,
          pixKey: formData.pixKey,
          pixKeyType: formData.pixKeyType || undefined,
          bankCode: formData.bankCode,
          bankAgency: formData.bankAgency,
          bankAccount: formData.bankAccount,
          bankAccountType: formData.bankAccountType || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao atualizar proprietário');
      }

      toast.success('Proprietário atualizado com sucesso!');
      setIsEditModalOpen(false);
      setSelectedOwner(null);
      setFormData(initialFormData);
      fetchOwners();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // ABRIR MODAL DE EDIÇÃO
  // ============================================
  const openEditModal = (owner: Owner) => {
    setSelectedOwner(owner);
    setFormData({
      name: owner.name,
      email: owner.email,
      phone: owner.phone || '',
      cpf: owner.cpf || '',
      pixKey: owner.pixKey || '',
      pixKeyType: owner.pixKeyType || '',
      bankCode: owner.bankCode || '',
      bankAgency: owner.bankAgency || '',
      bankAccount: owner.bankAccount || '',
      bankAccountType: owner.bankAccountType || '',
    });
    setIsEditModalOpen(true);
  };

  // ============================================
  // FILTRAR PROPRIETÁRIOS
  // ============================================
  const filteredOwners = owners.filter(
    (owner) =>
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================
  // KPIs
  // ============================================
  const totalOwners = owners.length;
  const ownersWithPix = owners.filter((o) => o.pixKey).length;
  const totalProperties = owners.reduce((acc, o) => acc + (o._count?.properties || 0), 0);

  // ============================================
  // FORMULÁRIO (Reutilizado para criar e editar)
  // ============================================
  const OwnerForm = ({ onSubmit, submitText }: { onSubmit: () => void; submitText: string }) => (
    <div className="space-y-4 py-4">
      {/* Dados Pessoais */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Users className="h-4 w-4" /> Dados Pessoais
        </h4>

        <div className="space-y-2">
          <Label>Nome Completo *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: João da Silva"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              disabled={!!selectedOwner} // Email não pode ser alterado
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone / WhatsApp</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>CPF</Label>
          <Input
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            placeholder="000.000.000-00"
          />
        </div>
      </div>

      {/* Dados Bancários / PIX */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-4">
        <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
          <Wallet className="h-4 w-4" /> Dados para Repasse (Split)
        </h4>
        <p className="text-xs text-green-600">
          Configure o PIX ou conta bancária para receber os repasses automáticos do aluguel.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-green-800">Chave PIX</Label>
            <Input
              value={formData.pixKey}
              onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              placeholder="CPF, Email ou Chave Aleatória"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-green-800">Tipo da Chave</Label>
            <Select
              value={formData.pixKeyType}
              onValueChange={(value) => setFormData({ ...formData, pixKeyType: value })}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CPF">CPF</SelectItem>
                <SelectItem value="CNPJ">CNPJ</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="PHONE">Telefone</SelectItem>
                <SelectItem value="RANDOM">Chave Aleatória</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t border-green-200 pt-4 mt-4">
          <p className="text-xs text-green-600 mb-3">
            Ou configure uma conta bancária tradicional:
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-green-800 text-xs">Código do Banco</Label>
              <Input
                value={formData.bankCode}
                onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                placeholder="001"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-green-800 text-xs">Agência</Label>
              <Input
                value={formData.bankAgency}
                onChange={(e) => setFormData({ ...formData, bankAgency: e.target.value })}
                placeholder="0001"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-green-800 text-xs">Conta</Label>
              <Input
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                placeholder="12345-6"
                className="bg-white"
              />
            </div>
          </div>
          <div className="mt-3">
            <Label className="text-green-800 text-xs">Tipo de Conta</Label>
            <Select
              value={formData.bankAccountType}
              onValueChange={(value) => setFormData({ ...formData, bankAccountType: value })}
            >
              <SelectTrigger className="bg-white mt-1">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CORRENTE">Conta Corrente</SelectItem>
                <SelectItem value="POUPANCA">Poupança</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button onClick={onSubmit} className="w-full mt-4" disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Salvando...
          </>
        ) : (
          submitText
        )}
      </Button>
    </div>
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <AgencyLayout agencyName="Minha Imobiliaria" userName="Usuario" userEmail="usuario@email.com">
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-blue-600" />
            Proprietários
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie sua carteira de proprietários e configure os dados para repasse automático.
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="h-4 w-4" /> Novo Proprietário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Proprietário</DialogTitle>
              <DialogDescription>
                Preencha os dados do proprietário. Ele receberá um email com a senha temporária.
              </DialogDescription>
            </DialogHeader>
            <OwnerForm onSubmit={handleCreate} submitText="Cadastrar Proprietário" />
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total de Proprietários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{totalOwners}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Split Configurado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{ownersWithPix}</span>
              <span className="text-sm text-gray-400">/ {totalOwners}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Imóveis Vinculados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{totalProperties}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Proprietário
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Contato
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">
                Imóveis
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Split Configurado?
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOwners.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  {searchTerm
                    ? 'Nenhum proprietário encontrado com esse termo.'
                    : 'Nenhum proprietário cadastrado ainda.'}
                </td>
              </tr>
            ) : (
              filteredOwners.map((owner) => (
                <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{owner.name}</div>
                    {owner.cpf && (
                      <div className="text-xs text-gray-400">CPF: {owner.cpf}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="h-3 w-3" /> {owner.email}
                    </div>
                    {owner.phone && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Phone className="h-3 w-3" /> {owner.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="secondary" className="gap-1">
                      <Home className="h-3 w-3" />
                      {owner._count?.properties || 0}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {owner.pixKey || owner.bankAccount ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        {owner.pixKey ? 'PIX Configurado' : 'Conta Bancária'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-orange-500 font-medium">
                        <AlertCircle className="h-4 w-4" />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(owner)}
                      className="gap-1"
                    >
                      <Edit2 className="h-4 w-4" /> Editar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Proprietário</DialogTitle>
            <DialogDescription>
              Atualize os dados do proprietário. O email não pode ser alterado.
            </DialogDescription>
          </DialogHeader>
          <OwnerForm onSubmit={handleUpdate} submitText="Salvar Alterações" />
        </DialogContent>
      </Dialog>
    </div>
    </AgencyLayout>
  );
}
