// ============================================
// TENANT PORTAL - Perfil do Inquilino
// Dados pessoais e configuracoes
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { TenantLayout } from '@/components/layouts/TenantLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Lock,
  Camera,
  Edit2,
  CheckCircle,
  AlertCircle,
  Smartphone,
  FileText,
  LogOut,
} from 'lucide-react';

export const Route = createFileRoute('/tenant/profile' as never)({
  component: TenantProfilePage,
});

// Mock de dados do usuario
const MOCK_USER = {
  id: 'user-123',
  name: 'Maria Silva Santos',
  email: 'maria@email.com',
  phone: '11999887766',
  cpf: '123.456.789-00',
  rg: '12.345.678-9',
  birthDate: '1990-05-15',
  address: {
    street: 'Rua das Flores, 123',
    number: '302',
    complement: 'Apto 302',
    neighborhood: 'Jardim Paulista',
    city: 'Sao Paulo',
    state: 'SP',
    zipCode: '01310-100',
  },
  verified: true,
  verifiedAt: '2024-01-10',
  createdAt: '2024-01-05',
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    paymentReminders: true,
  },
};

function TenantProfilePage() {
  const [user, setUser] = useState(MOCK_USER);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR');

  const handleSave = async () => {
    setSaving(true);
    // Simula salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setEditing(false);
    toast.success('Perfil atualizado com sucesso!');
  };

  const togglePreference = (key: keyof typeof user.preferences) => {
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        [key]: !user.preferences[key],
      },
    });
  };

  return (
    <TenantLayout>
      <div className="space-y-6 md:ml-64">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
          <p className="text-slate-500 mt-1">Gerencie suas informacoes pessoais</p>
        </div>

        {/* Avatar e Info Principal */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 text-2xl font-bold">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <p className="text-slate-500">{user.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  {user.verified ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pendente
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-slate-200">
                    Desde {formatDate(user.createdAt)}
                  </Badge>
                </div>
              </div>

              {/* Botao Editar */}
              <Button
                variant={editing ? 'default' : 'outline'}
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
              >
                {saving ? (
                  'Salvando...'
                ) : editing ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dados Pessoais */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-indigo-600" />
              Dados Pessoais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-600">Nome Completo</Label>
                <Input
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  disabled={!editing}
                  className="bg-slate-50 disabled:opacity-100"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600">Email</Label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-slate-100 opacity-60"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600">Telefone</Label>
                <Input
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  disabled={!editing}
                  className="bg-slate-50 disabled:opacity-100"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600">CPF</Label>
                <Input
                  value={user.cpf}
                  disabled
                  className="bg-slate-100 opacity-60"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600">RG</Label>
                <Input
                  value={user.rg}
                  disabled
                  className="bg-slate-100 opacity-60"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600">Data de Nascimento</Label>
                <Input
                  value={formatDate(user.birthDate)}
                  disabled
                  className="bg-slate-100 opacity-60"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereco */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Endereco Atual
            </h3>

            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="font-medium text-slate-900">
                {user.address.street}, {user.address.number}
              </p>
              {user.address.complement && (
                <p className="text-slate-600">{user.address.complement}</p>
              )}
              <p className="text-slate-500 text-sm mt-1">
                {user.address.neighborhood} - {user.address.city}/{user.address.state}
              </p>
              <p className="text-slate-400 text-sm">CEP: {user.address.zipCode}</p>
            </div>
          </CardContent>
        </Card>

        {/* Notificacoes */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-amber-600" />
              Notificacoes
            </h3>

            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Notificacoes por Email', desc: 'Receba atualizacoes por email', icon: Mail },
                { key: 'smsNotifications', label: 'Notificacoes por SMS', desc: 'Receba alertas por SMS', icon: Smartphone },
                { key: 'pushNotifications', label: 'Notificacoes Push', desc: 'Notificacoes no navegador', icon: Bell },
                { key: 'paymentReminders', label: 'Lembretes de Pagamento', desc: 'Aviso antes do vencimento', icon: CreditCard },
              ].map((item) => {
                const Icon = item.icon;
                const isEnabled = user.preferences[item.key as keyof typeof user.preferences];

                return (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => togglePreference(item.key as keyof typeof user.preferences)}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Seguranca */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-purple-600" />
              Seguranca
            </h3>

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="h-4 w-4 mr-3" />
                Alterar Senha
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Smartphone className="h-4 w-4 mr-3" />
                Autenticacao em Duas Etapas
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-3" />
                Historico de Acessos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sair */}
        <Button
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </TenantLayout>
  );
}
