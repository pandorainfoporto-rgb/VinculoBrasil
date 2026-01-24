// ============================================
// ROTA /admin/profile - Meu Perfil
// Edição de dados básicos do usuário
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/profile' as never)({
  component: ProfilePage,
});

function ProfilePage() {
  // Estado do formulário
  const [name, setName] = useState('Administrador');
  const [email, setEmail] = useState('admin@vinculobrasil.com.br');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de visibilidade
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Estados de loading e mensagem
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Handler para salvar perfil
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      // Simula salvamento
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setProfileSaved(true);
      toast.success('Perfil atualizado com sucesso!');
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      toast.error('Erro ao salvar perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handler para alterar senha
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('A nova senha deve ter no mínimo 8 caracteres');
      return;
    }

    setSavingPassword(true);
    try {
      // Simula salvamento
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Senha alterada com sucesso!');
    } catch {
      toast.error('Erro ao alterar senha');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="h-6 w-6 text-blue-500" />
            Meu Perfil
          </h1>
          <p className="text-zinc-400 mt-1">
            Gerencie suas informações pessoais e credenciais de acesso
          </p>
        </div>

        {/* Alerta de Sucesso */}
        {profileSaved && (
          <Alert className="bg-green-900/30 border-green-600">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              Suas alterações foram salvas com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {/* Card: Informações Básicas */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Atualize seu nome e email de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white text-xl">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium">{name}</p>
                <p className="text-zinc-500 text-sm">Super Admin</p>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Nome */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Nome Completo</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Seu nome"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-zinc-400 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="seu@email.com"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {savingProfile ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Card: Alterar Senha */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Alterar Senha
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Atualize sua senha de acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Senha Atual */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Senha Atual</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white pr-10"
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Nova Senha</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white pr-10"
                  placeholder="Digite a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-zinc-500">Mínimo de 8 caracteres</p>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Confirme a nova senha"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  As senhas não coincidem
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleChangePassword}
              disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              {savingPassword ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Alterando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Alterar Senha
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default ProfilePage;
