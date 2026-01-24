/**
 * Dialogos de Usuarios
 * Componentes para cadastro e edicao de usuarios administrativos
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Building2, Shield, Eye, EyeOff, UserCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ==================== TIPOS ====================

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
  createdAt: Date;
  avatar?: string;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: AdminUser | null;
  onSave: (user: AdminUser | Omit<AdminUser, 'id' | 'lastLogin' | 'createdAt'>) => void;
  roles: { id: string; name: string }[];
}

const DEPARTMENTS = [
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'suporte', label: 'Suporte' },
  { value: 'juridico', label: 'Juridico' },
  { value: 'ti', label: 'TI' },
  { value: 'operacoes', label: 'Operacoes' },
];

export function UserDialog({ open, onOpenChange, user, onSave, roles }: UserDialogProps) {
  const isEdit = !!user;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'pending'>('pending');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setRole(user.role);
      setDepartment(user.department);
      setStatus(user.status);
      setPassword('');
      setConfirmPassword('');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setRole('');
      setDepartment('');
      setStatus('pending');
      setPassword('');
      setConfirmPassword('');
    }
    setErrors({});
  }, [user, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome e obrigatorio';
    }

    if (!email.trim()) {
      newErrors.email = 'E-mail e obrigatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'E-mail invalido';
    }

    if (!role) {
      newErrors.role = 'Funcao e obrigatoria';
    }

    if (!department) {
      newErrors.department = 'Departamento e obrigatorio';
    }

    if (!isEdit && !sendInvite) {
      if (!password) {
        newErrors.password = 'Senha e obrigatoria';
      } else if (password.length < 8) {
        newErrors.password = 'Senha deve ter no minimo 8 caracteres';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Senhas nao conferem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const userData = {
      ...(isEdit ? { id: user.id, lastLogin: user.lastLogin, createdAt: user.createdAt } : {}),
      name,
      email,
      phone: phone || undefined,
      role,
      department,
      status: isEdit ? status : (sendInvite ? 'pending' as const : 'active' as const),
      avatar: user?.avatar,
    };

    onSave(userData as any);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEdit ? 'Editar Usuario' : 'Novo Usuario'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as informacoes do usuario' : 'Cadastre um novo usuario administrativo'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="grid gap-4 py-4">
            {/* Nome */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                Nome Completo *
                {errors.name && <span className="text-red-500 text-xs">({errors.name})</span>}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Ex: Joao Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
            </div>

            {/* E-mail */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                E-mail *
                {errors.email && <span className="text-red-500 text-xs">({errors.email})</span>}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="pl-10"
                  maxLength={15}
                />
              </div>
            </div>

            <Separator />

            {/* Funcao e Departamento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role" className="flex items-center gap-1">
                  Funcao *
                  {errors.role && <span className="text-red-500 text-xs">({errors.role})</span>}
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.name}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {r.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="department" className="flex items-center gap-1">
                  Departamento *
                  {errors.department && <span className="text-red-500 text-xs">({errors.department})</span>}
                </Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => (
                      <SelectItem key={d.value} value={d.value}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {d.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status (apenas ao editar) */}
            {isEdit && (
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500">Ativo</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-500">Inativo</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500">Pendente</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            {/* Convite por E-mail ou Definir Senha (apenas ao criar) */}
            {!isEdit && (
              <>
                <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/50">
                  <div className="space-y-0.5">
                    <Label htmlFor="sendInvite">Enviar convite por e-mail</Label>
                    <p className="text-xs text-muted-foreground">
                      O usuario recebera um link para definir a senha
                    </p>
                  </div>
                  <Switch
                    id="sendInvite"
                    checked={sendInvite}
                    onCheckedChange={setSendInvite}
                  />
                </div>

                {!sendInvite && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Voce precisara compartilhar a senha com o usuario de forma segura
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-2">
                      <Label htmlFor="password" className="flex items-center gap-1">
                        Senha *
                        {errors.password && <span className="text-red-500 text-xs">({errors.password})</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Minimo 8 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword" className="flex items-center gap-1">
                        Confirmar Senha *
                        {errors.confirmPassword && <span className="text-red-500 text-xs">({errors.confirmPassword})</span>}
                      </Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repita a senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Preview do Usuario */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
                  {name ? name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{name || 'Nome do Usuario'}</h4>
                  <p className="text-sm text-muted-foreground">{email || 'email@exemplo.com'}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{role || 'Funcao'}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{department || 'Departamento'}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <UserCheck className="h-4 w-4 mr-2" />
            {isEdit ? 'Salvar Alteracoes' : (sendInvite ? 'Enviar Convite' : 'Criar Usuario')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
