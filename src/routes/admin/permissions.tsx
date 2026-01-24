// ============================================
// ADMIN PERMISSIONS - Gestão de Acessos
// Controle de permissões por usuário
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Key,
  Search,
  Shield,
  User,
  UserCog,
  Check,
  X,
  Eye,
  Edit,
  Trash,
  Plus,
  Save,
} from 'lucide-react';

export const Route = createFileRoute('/admin/permissions' as never)({
  component: PermissionsPage,
});

// Dados de exemplo
const mockUsers = [
  { id: '1', name: 'João Silva', email: 'joao@vinculobrasil.com.br', role: 'SUPER_ADMIN', status: 'active' },
  { id: '2', name: 'Maria Santos', email: 'maria@imob.com', role: 'AGENCY_ADMIN', status: 'active' },
  { id: '3', name: 'Carlos Lima', email: 'carlos@imob.com', role: 'AGENCY_ADMIN', status: 'pending' },
];

const modules = [
  { id: 'dashboard', name: 'Dashboard', description: 'Acesso ao painel principal' },
  { id: 'contracts', name: 'Contratos', description: 'Gestão de contratos' },
  { id: 'properties', name: 'Imóveis', description: 'Gestão de imóveis' },
  { id: 'users', name: 'Usuários', description: 'Gestão de usuários' },
  { id: 'financial', name: 'Financeiro', description: 'Módulo financeiro' },
  { id: 'reports', name: 'Relatórios', description: 'Acesso a relatórios' },
  { id: 'settings', name: 'Configurações', description: 'Configurações do sistema' },
  { id: 'vbrz', name: 'VBRz Token', description: 'Gestão do token' },
];

function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, { read: boolean; write: boolean; delete: boolean }>>({
    dashboard: { read: true, write: false, delete: false },
    contracts: { read: true, write: true, delete: false },
    properties: { read: true, write: true, delete: false },
    users: { read: true, write: false, delete: false },
    financial: { read: false, write: false, delete: false },
    reports: { read: true, write: false, delete: false },
    settings: { read: false, write: false, delete: false },
    vbrz: { read: false, write: false, delete: false },
  });

  const togglePermission = (moduleId: string, type: 'read' | 'write' | 'delete') => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [type]: !prev[moduleId]?.[type],
      },
    }));
  };

  const filteredUsers = mockUsers.filter(
    user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-950 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Gestão de Acessos</h1>
              <p className="text-sm text-slate-400">Controle granular de permissões por usuário</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Usuários */}
          <Card className="bg-slate-900 border-slate-800 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Usuários Admin
              </CardTitle>
              <CardDescription className="text-slate-400">
                Selecione um usuário para editar permissões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar usuário..."
                  className="pl-9 bg-slate-800 border-slate-700 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedUser === user.id
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                      <Badge
                        className={
                          user.role === 'SUPER_ADMIN'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }
                      >
                        {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>

              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Admin
              </Button>
            </CardContent>
          </Card>

          {/* Matriz de Permissões */}
          <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Matriz de Permissões
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {selectedUser
                      ? `Editando: ${mockUsers.find(u => u.id === selectedUser)?.name}`
                      : 'Selecione um usuário para editar'}
                  </CardDescription>
                </div>
                {selectedUser && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400">Módulo</TableHead>
                      <TableHead className="text-slate-400 text-center">
                        <Eye className="h-4 w-4 mx-auto" />
                        <span className="text-xs">Ler</span>
                      </TableHead>
                      <TableHead className="text-slate-400 text-center">
                        <Edit className="h-4 w-4 mx-auto" />
                        <span className="text-xs">Editar</span>
                      </TableHead>
                      <TableHead className="text-slate-400 text-center">
                        <Trash className="h-4 w-4 mx-auto" />
                        <span className="text-xs">Excluir</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map((module) => (
                      <TableRow key={module.id} className="border-slate-800">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{module.name}</p>
                            <p className="text-xs text-slate-500">{module.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permissions[module.id]?.read || false}
                            onCheckedChange={() => togglePermission(module.id, 'read')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permissions[module.id]?.write || false}
                            onCheckedChange={() => togglePermission(module.id, 'write')}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permissions[module.id]?.delete || false}
                            onCheckedChange={() => togglePermission(module.id, 'delete')}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-16">
                  <UserCog className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-400">Selecione um usuário na lista à esquerda</p>
                  <p className="text-slate-500 text-sm">para visualizar e editar suas permissões</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
