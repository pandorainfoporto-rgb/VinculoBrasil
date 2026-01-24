/**
 * Dialogos de Grupos e Permissoes - Sistema RBAC
 * Componentes para criar e editar grupos de usuarios
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Shield } from 'lucide-react';

// ============= TIPOS =============

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

// ============= PERMISSÕES DISPONÍVEIS =============

const AVAILABLE_PERMISSIONS = [
  // Menu Principal
  { category: 'Dashboard', permissions: ['dashboard.*', 'dashboard.view', 'dashboard.analytics'] },

  // Contratos
  { category: 'Contratos', permissions: ['contracts.*', 'contracts.view', 'contracts.create', 'contracts.edit', 'contracts.delete', 'contracts.approve'] },

  // Imóveis
  { category: 'Imóveis', permissions: ['properties.*', 'properties.view', 'properties.create', 'properties.edit', 'properties.delete'] },

  // Usuários
  { category: 'Inquilinos', permissions: ['tenants.*', 'tenants.view', 'tenants.create', 'tenants.edit', 'tenants.delete'] },
  { category: 'Locadores', permissions: ['landlords.*', 'landlords.view', 'landlords.create', 'landlords.edit', 'landlords.delete'] },
  { category: 'Garantidores', permissions: ['guarantors.*', 'guarantors.view', 'guarantors.create', 'guarantors.edit', 'guarantors.delete'] },

  // Relatórios
  { category: 'Relatórios', permissions: ['reports.*', 'reports.dre', 'reports.cashflow', 'reports.dimob', 'reports.delinquency', 'reports.blockchain'] },

  // Configurações
  { category: 'Configurações - Usuários', permissions: ['config.users', 'config.permissions'] },
  { category: 'Configurações - Financeiro', permissions: ['config.gateways', 'config.bank_accounts'] },
  { category: 'Configurações - Parceiros', permissions: ['config.insurers', 'config.marketplace', 'config.services'] },

  // Tarefas
  { category: 'Tarefas', permissions: ['tasks.ai_support', 'tasks.disputes', 'tasks.kyc', 'tasks.inspections'] },

  // Portal Seguradora
  { category: 'Portal Seguradora', permissions: ['insurer_portal.*'] },

  // Admin Total
  { category: 'Administração Total', permissions: ['*'] },
];

// ============= COMPONENTE: NOVO GRUPO =============

interface NewGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (group: Omit<UserRole, 'id' | 'userCount'>) => void;
}

export function NewGroupDialog({ open, onOpenChange, onSave }: NewGroupDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSystem, setIsSystem] = useState(false);
  const [customPermission, setCustomPermission] = useState('');

  const handleReset = () => {
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setIsSystem(false);
    setCustomPermission('');
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Por favor, informe o nome do grupo');
      return;
    }

    if (selectedPermissions.length === 0) {
      alert('Por favor, selecione pelo menos uma permissão');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      permissions: selectedPermissions,
      isSystem,
    });

    handleReset();
    onOpenChange(false);
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      }
      // Se selecionar permissão *, remove todas as outras
      if (permission === '*') {
        return ['*'];
      }
      // Se já tiver *, remove ela ao adicionar outra
      return prev.filter(p => p !== '*').concat(permission);
    });
  };

  const addCustomPermission = () => {
    if (customPermission.trim() && !selectedPermissions.includes(customPermission.trim())) {
      setSelectedPermissions(prev => [...prev, customPermission.trim()]);
      setCustomPermission('');
    }
  };

  const removePermission = (permission: string) => {
    setSelectedPermissions(prev => prev.filter(p => p !== permission));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Novo Grupo de Permissões
          </DialogTitle>
          <DialogDescription>
            Configure um novo grupo de usuários e suas permissões de acesso
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Nome do Grupo *</Label>
                <Input
                  id="group-name"
                  placeholder="Ex: Financeiro, Suporte, Comercial..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-description">Descrição</Label>
                <Textarea
                  id="group-description"
                  placeholder="Descreva as responsabilidades deste grupo..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="is-system" className="cursor-pointer">Grupo do Sistema</Label>
                  <p className="text-xs text-muted-foreground">Grupos do sistema não podem ser excluídos</p>
                </div>
                <Switch
                  id="is-system"
                  checked={isSystem}
                  onCheckedChange={setIsSystem}
                />
              </div>
            </div>

            <Separator />

            {/* Permissões Selecionadas */}
            {selectedPermissions.length > 0 && (
              <div className="space-y-2">
                <Label>Permissões Selecionadas ({selectedPermissions.length})</Label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                  {selectedPermissions.map(permission => (
                    <Badge
                      key={permission}
                      variant="default"
                      className="gap-1 pr-1"
                    >
                      {permission}
                      <button
                        type="button"
                        onClick={() => removePermission(permission)}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Permissões Disponíveis */}
            <div className="space-y-3">
              <Label>Selecione as Permissões *</Label>
              <div className="space-y-3">
                {AVAILABLE_PERMISSIONS.map(({ category, permissions }) => (
                  <div key={category} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {permissions.map(permission => (
                        <Badge
                          key={permission}
                          variant={selectedPermissions.includes(permission) ? 'default' : 'outline'}
                          className="cursor-pointer hover:bg-primary/80"
                          onClick={() => togglePermission(permission)}
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Permissão Customizada */}
            <div className="space-y-2">
              <Label htmlFor="custom-permission">Adicionar Permissão Customizada</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-permission"
                  placeholder="Ex: custom.action ou module.*"
                  value={customPermission}
                  onChange={e => setCustomPermission(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomPermission();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomPermission}
                  disabled={!customPermission.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use * para acesso total a um módulo (ex: reports.*)
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Criar Grupo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= COMPONENTE: EDITAR GRUPO =============

interface EditGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: UserRole | null;
  onSave: (group: UserRole) => void;
}

export function EditGroupDialog({ open, onOpenChange, group, onSave }: EditGroupDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSystem, setIsSystem] = useState(false);
  const [customPermission, setCustomPermission] = useState('');

  // Atualiza os campos quando o grupo mudar
  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description);
      setSelectedPermissions(group.permissions);
      setIsSystem(group.isSystem);
    }
  }, [group]);

  const handleSave = () => {
    if (!group) return;

    if (!name.trim()) {
      alert('Por favor, informe o nome do grupo');
      return;
    }

    if (selectedPermissions.length === 0) {
      alert('Por favor, selecione pelo menos uma permissão');
      return;
    }

    onSave({
      ...group,
      name: name.trim(),
      description: description.trim(),
      permissions: selectedPermissions,
      isSystem,
    });

    onOpenChange(false);
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      }
      if (permission === '*') {
        return ['*'];
      }
      return prev.filter(p => p !== '*').concat(permission);
    });
  };

  const addCustomPermission = () => {
    if (customPermission.trim() && !selectedPermissions.includes(customPermission.trim())) {
      setSelectedPermissions(prev => [...prev, customPermission.trim()]);
      setCustomPermission('');
    }
  };

  const removePermission = (permission: string) => {
    setSelectedPermissions(prev => prev.filter(p => p !== permission));
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Editar Grupo: {group.name}
          </DialogTitle>
          <DialogDescription>
            Modifique as permissões e configurações do grupo
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-group-name">Nome do Grupo *</Label>
                <Input
                  id="edit-group-name"
                  placeholder="Ex: Financeiro, Suporte, Comercial..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-group-description">Descrição</Label>
                <Textarea
                  id="edit-group-description"
                  placeholder="Descreva as responsabilidades deste grupo..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="edit-is-system" className="cursor-pointer">Grupo do Sistema</Label>
                  <p className="text-xs text-muted-foreground">Grupos do sistema não podem ser excluídos</p>
                </div>
                <Switch
                  id="edit-is-system"
                  checked={isSystem}
                  onCheckedChange={setIsSystem}
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium">Usuários neste grupo: {group.userCount}</p>
              </div>
            </div>

            <Separator />

            {/* Permissões Selecionadas */}
            {selectedPermissions.length > 0 && (
              <div className="space-y-2">
                <Label>Permissões Selecionadas ({selectedPermissions.length})</Label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                  {selectedPermissions.map(permission => (
                    <Badge
                      key={permission}
                      variant="default"
                      className="gap-1 pr-1"
                    >
                      {permission}
                      <button
                        type="button"
                        onClick={() => removePermission(permission)}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Permissões Disponíveis */}
            <div className="space-y-3">
              <Label>Selecione as Permissões *</Label>
              <div className="space-y-3">
                {AVAILABLE_PERMISSIONS.map(({ category, permissions }) => (
                  <div key={category} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {permissions.map(permission => (
                        <Badge
                          key={permission}
                          variant={selectedPermissions.includes(permission) ? 'default' : 'outline'}
                          className="cursor-pointer hover:bg-primary/80"
                          onClick={() => togglePermission(permission)}
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Permissão Customizada */}
            <div className="space-y-2">
              <Label htmlFor="edit-custom-permission">Adicionar Permissão Customizada</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-custom-permission"
                  placeholder="Ex: custom.action ou module.*"
                  value={customPermission}
                  onChange={e => setCustomPermission(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomPermission();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomPermission}
                  disabled={!customPermission.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use * para acesso total a um módulo (ex: reports.*)
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
