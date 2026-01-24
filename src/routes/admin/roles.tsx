// ============================================
// ADMIN ROLES - Gestão de Papéis e Permissões
// Configuração de roles do sistema
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Lock,
  Shield,
  Users,
  UserPlus,
  UserCheck,
  ShieldCheck,
  Building2,
  Crown,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

export const Route = createFileRoute('/admin/roles' as never)({
  component: RolesPage,
});

// Roles padrão do sistema
const systemRoles = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Acesso total ao sistema. Pode gerenciar tudo.',
    color: 'bg-red-500',
    icon: Crown,
    usersCount: 2,
    isSystem: true,
    permissions: ['all'],
  },
  {
    id: 'agency_admin',
    name: 'Admin de Imobiliária',
    description: 'Gerencia uma imobiliária específica e seus usuários.',
    color: 'bg-amber-500',
    icon: Building2,
    usersCount: 15,
    isSystem: true,
    permissions: ['contracts', 'properties', 'users:agency', 'reports:agency'],
  },
  {
    id: 'landlord',
    name: 'Proprietário',
    description: 'Proprietário de imóveis. Visualiza seus contratos e recebimentos.',
    color: 'bg-green-500',
    icon: UserCheck,
    usersCount: 234,
    isSystem: true,
    permissions: ['properties:own', 'contracts:own', 'financial:own'],
  },
  {
    id: 'tenant',
    name: 'Inquilino',
    description: 'Inquilino de imóvel. Acessa seu contrato e pagamentos.',
    color: 'bg-blue-500',
    icon: UserPlus,
    usersCount: 456,
    isSystem: true,
    permissions: ['contracts:own', 'payments:own'],
  },
  {
    id: 'guarantor',
    name: 'Garantidor',
    description: 'Garantidor de contratos. Visualiza contratos que garante.',
    color: 'bg-purple-500',
    icon: ShieldCheck,
    usersCount: 89,
    isSystem: true,
    permissions: ['contracts:guaranteed'],
  },
];

function RolesPage() {
  const [roles, setRoles] = useState(systemRoles);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  const handleCreateRole = () => {
    if (newRole.name.trim()) {
      setRoles([
        ...roles,
        {
          id: `custom_${Date.now()}`,
          name: newRole.name,
          description: newRole.description,
          color: 'bg-slate-500',
          icon: Users,
          usersCount: 0,
          isSystem: false,
          permissions: [],
        },
      ]);
      setNewRole({ name: '', description: '' });
      setShowCreateDialog(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-950 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Roles & Permissões</h1>
              <p className="text-sm text-slate-400">Configuração de papéis do sistema</p>
            </div>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Role
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Novo Role</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Crie um papel personalizado com permissões específicas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nome do Role</Label>
                  <Input
                    placeholder="Ex: Corretor"
                    className="bg-slate-800 border-slate-700 text-white"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Descrição</Label>
                  <Textarea
                    placeholder="Descreva as responsabilidades deste papel..."
                    className="bg-slate-800 border-slate-700 text-white"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateRole} className="bg-violet-600 hover:bg-violet-700">
                  Criar Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${role.color} rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">{role.name}</CardTitle>
                        {role.isSystem && (
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 mt-1">
                            Sistema
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!role.isSystem && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-400">{role.description}</p>

                  <Separator className="bg-slate-800" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{role.usersCount} usuários</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Copy className="h-3 w-3 mr-1" />
                        Duplicar
                      </Button>
                    </div>
                  </div>

                  {/* Permissões Preview */}
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((perm) => (
                      <Badge key={perm} variant="secondary" className="text-xs bg-slate-800 text-slate-300">
                        {perm}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300">
                        +{role.permissions.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="mt-6 bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-violet-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-300">
                  <strong>Sobre Roles do Sistema:</strong> Os roles marcados como "Sistema" são padrão da plataforma
                  e não podem ser excluídos. Você pode criar roles personalizados para necessidades específicas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
