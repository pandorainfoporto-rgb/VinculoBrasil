// ============================================
// ROTA /auth/login - Tela de Login
// Layout Split Screen + Role-Based Redirect
// ============================================

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VinculoBrasilLogo } from "@/components/vinculo-brasil-logo";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Building2,
  Shield,
  Users,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

// ============================================
// Role-Based Redirect Logic
// ============================================
type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "AGENCY_ADMIN"
  | "AGENCY_USER"
  | "TENANT"
  | "LANDLORD"
  | "GUARANTOR"
  | "INVESTOR"
  | "admin"
  | "Administrador";

function getRedirectPath(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
    case "admin":
    case "Administrador":
      return "/admin/dashboard";
    case "AGENCY_ADMIN":
    case "AGENCY_USER":
      return "/agency/dashboard";
    case "TENANT":
      return "/tenant/dashboard";
    case "LANDLORD":
      return "/landlord/dashboard";
    case "GUARANTOR":
      return "/garantidores/area-cliente";
    case "INVESTOR":
      return "/investor/dashboard";
    default:
      return "/";
  }
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Credenciais inválidas");
      }

      // Salvar token (JWT persistence)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Toast de sucesso
      toast.success(`Bem-vindo, ${data.user.name || 'usuário'}!`, {
        description: "Redirecionando para seu painel...",
      });

      // Role-Based Redirect (using window.location for dynamic paths)
      const redirectPath = getRedirectPath(data.user.role as UserRole);
      window.location.href = redirectPath;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(errorMessage);
      toast.error("Falha no login", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* ============================================ */}
      {/* LEFT SIDE - Hero Image/Branding */}
      {/* ============================================ */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-12">
            <VinculoBrasilLogo size="xl" lightMode />
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Gerencie suas locações com inteligência
          </h1>
          <p className="text-lg text-blue-100 mb-8">
            Plataforma completa para imobiliárias, proprietários e inquilinos.
            Automatize processos e aumente sua produtividade.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Gestão de Imóveis</p>
                <p className="text-sm text-blue-200">Controle total do seu portfólio</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">CRM Integrado</p>
                <p className="text-sm text-blue-200">Funil de vendas e leads</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Garantia Locatícia</p>
                <p className="text-sm text-blue-200">Proteção para todos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Relatórios Avançados</p>
                <p className="text-sm text-blue-200">Insights em tempo real</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
      </div>

      {/* ============================================ */}
      {/* RIGHT SIDE - Login Form */}
      {/* ============================================ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <VinculoBrasilLogo size="lg" />
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Acesse sua conta
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Entre com suas credenciais para continuar
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Senha
                </Label>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Não tem uma conta?{" "}
              <a
                href="/auth/register-superhost"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
              >
                Fale conosco
              </a>
            </p>

            <Button
              variant="ghost"
              onClick={() => navigate({ to: "/" })}
              className="text-gray-500 dark:text-gray-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o início
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
