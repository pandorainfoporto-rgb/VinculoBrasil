// ============================================
// VINCULO BRASIL - SETUP WIZARD
// Configuracao inicial do sistema
// ============================================

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Building2,
  Wallet,
  CreditCard,
  MessageSquare,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Upload,
  Zap,
  Shield,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface SetupData {
  admin: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  company: {
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    logo: string;
    primaryColor: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  blockchain: {
    polygonRpcUrl: string;
    operatorPrivateKey: string;
    treasuryWallet: string;
  };
  fintechs: {
    asaasApiKey: string;
    asaasWalletId: string;
    asaasSandbox: boolean;
    transferoClientId: string;
    transferoClientSecret: string;
    transferoSandbox: boolean;
  };
  communication: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    smtpFrom: string;
    openaiApiKey: string;
  };
}

interface StepProps {
  data: SetupData;
  updateData: (section: keyof SetupData, field: string, value: unknown) => void;
  errors: Record<string, string>;
}

// ============================================
// STEP COMPONENTS
// ============================================

function Step1Admin({ data, updateData, errors }: StepProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">Criar Administrador</h2>
        <p className="text-muted-foreground mt-2">
          Configure o super usuario que tera acesso total ao sistema
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="admin-name">Nome Completo *</Label>
          <Input
            id="admin-name"
            placeholder="Seu nome"
            value={data.admin.name}
            onChange={(e) => updateData("admin", "name", e.target.value)}
            className={errors["admin.name"] ? "border-red-500" : ""}
          />
          {errors["admin.name"] && (
            <p className="text-sm text-red-500">{errors["admin.name"]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-email">Email *</Label>
          <Input
            id="admin-email"
            type="email"
            placeholder="admin@suaempresa.com"
            value={data.admin.email}
            onChange={(e) => updateData("admin", "email", e.target.value)}
            className={errors["admin.email"] ? "border-red-500" : ""}
          />
          {errors["admin.email"] && (
            <p className="text-sm text-red-500">{errors["admin.email"]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password">Senha *</Label>
          <div className="relative">
            <Input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimo 8 caracteres"
              value={data.admin.password}
              onChange={(e) => updateData("admin", "password", e.target.value)}
              className={errors["admin.password"] ? "border-red-500" : ""}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors["admin.password"] && (
            <p className="text-sm text-red-500">{errors["admin.password"]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-confirm">Confirmar Senha *</Label>
          <Input
            id="admin-confirm"
            type="password"
            placeholder="Repita a senha"
            value={data.admin.confirmPassword}
            onChange={(e) => updateData("admin", "confirmPassword", e.target.value)}
            className={errors["admin.confirmPassword"] ? "border-red-500" : ""}
          />
          {errors["admin.confirmPassword"] && (
            <p className="text-sm text-red-500">{errors["admin.confirmPassword"]}</p>
          )}
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Guarde estas credenciais em local seguro. Voce usara este email e senha para acessar o painel administrativo.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function Step2Company({ data, updateData, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <Building2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Identidade da Empresa</h2>
        <p className="text-muted-foreground mt-2">
          Configure os dados da sua empresa para contratos e documentos
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Razao Social *</Label>
            <Input
              id="company-name"
              placeholder="Nome da Empresa LTDA"
              value={data.company.name}
              onChange={(e) => updateData("company", "name", e.target.value)}
              className={errors["company.name"] ? "border-red-500" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-cnpj">CNPJ *</Label>
            <Input
              id="company-cnpj"
              placeholder="00.000.000/0001-00"
              value={data.company.cnpj}
              onChange={(e) => updateData("company", "cnpj", e.target.value)}
              className={errors["company.cnpj"] ? "border-red-500" : ""}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-email">Email *</Label>
            <Input
              id="company-email"
              type="email"
              placeholder="contato@empresa.com"
              value={data.company.email}
              onChange={(e) => updateData("company", "email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-phone">Telefone</Label>
            <Input
              id="company-phone"
              placeholder="(11) 99999-9999"
              value={data.company.phone}
              onChange={(e) => updateData("company", "phone", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-city">Cidade</Label>
            <Input
              id="company-city"
              placeholder="Sao Paulo"
              value={data.company.city}
              onChange={(e) => updateData("company", "city", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-state">Estado</Label>
            <Input
              id="company-state"
              placeholder="SP"
              value={data.company.state}
              onChange={(e) => updateData("company", "state", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-color">Cor Principal</Label>
          <div className="flex gap-3">
            <Input
              id="company-color"
              type="color"
              value={data.company.primaryColor}
              onChange={(e) => updateData("company", "primaryColor", e.target.value)}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <Input
              value={data.company.primaryColor}
              onChange={(e) => updateData("company", "primaryColor", e.target.value)}
              placeholder="#0066FF"
              className="flex-1"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Esta cor sera usada nos botoes e elementos de destaque
          </p>
        </div>
      </div>
    </div>
  );
}

function Step3Blockchain({ data, updateData, errors }: StepProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/setup/test-blockchain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rpcUrl: data.blockchain.polygonRpcUrl,
          operatorKey: data.blockchain.operatorPrivateKey,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: `Conectado! Rede: ${result.network}, Saldo: ${result.balanceMatic} MATIC`,
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || "Falha na conexao",
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: "Erro ao testar conexao. Verifique os dados.",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
          <Wallet className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold">Configuracao Blockchain</h2>
        <p className="text-muted-foreground mt-2">
          Configure a conexao com a rede Polygon para NFTs e tokens
        </p>
      </div>

      <Alert className="bg-purple-50 border-purple-200">
        <Zap className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          Recomendamos usar a <strong>Polygon Mainnet</strong> para producao.
          Use sua propria RPC (Alchemy/Infura) para melhor performance.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="rpc-url">RPC URL *</Label>
          <Input
            id="rpc-url"
            placeholder="https://polygon-rpc.com"
            value={data.blockchain.polygonRpcUrl}
            onChange={(e) => updateData("blockchain", "polygonRpcUrl", e.target.value)}
            className={errors["blockchain.polygonRpcUrl"] ? "border-red-500" : ""}
          />
          <p className="text-sm text-muted-foreground">
            Mainnet: https://polygon-rpc.com | Testnet: https://rpc-mumbai.maticvigil.com
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="operator-key">Chave Privada do Operador *</Label>
          <div className="relative">
            <Input
              id="operator-key"
              type={showKey ? "text" : "password"}
              placeholder="0x..."
              value={data.blockchain.operatorPrivateKey}
              onChange={(e) => updateData("blockchain", "operatorPrivateKey", e.target.value)}
              className={cn(
                "font-mono text-sm",
                errors["blockchain.operatorPrivateKey"] ? "border-red-500" : ""
              )}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-sm text-red-500 font-medium">
            NUNCA compartilhe esta chave! Ela controla a wallet operacional.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="treasury">Wallet Treasury *</Label>
          <Input
            id="treasury"
            placeholder="0x..."
            value={data.blockchain.treasuryWallet}
            onChange={(e) => updateData("blockchain", "treasuryWallet", e.target.value)}
            className={cn(
              "font-mono text-sm",
              errors["blockchain.treasuryWallet"] ? "border-red-500" : ""
            )}
          />
          <p className="text-sm text-muted-foreground">
            Endereco que recebera os lucros da plataforma
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={testConnection}
          disabled={testing || !data.blockchain.polygonRpcUrl || !data.blockchain.operatorPrivateKey}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testando Conexao...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Testar Conexao Blockchain
            </>
          )}
        </Button>

        {testResult && (
          <Alert className={testResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

function Step4Fintechs({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
          <CreditCard className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold">Integracao Financeira</h2>
        <p className="text-muted-foreground mt-2">
          Configure os gateways de pagamento (PIX, Boleto, Crypto)
        </p>
      </div>

      {/* Asaas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src="https://www.asaas.com/favicon.ico" alt="Asaas" className="w-5 h-5" />
            Asaas
          </CardTitle>
          <CardDescription>
            Gateway para PIX, Boleto e Cartao de Credito
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Modo Sandbox (Teste)</Label>
            <Switch
              checked={data.fintechs.asaasSandbox}
              onCheckedChange={(checked) => updateData("fintechs", "asaasSandbox", checked)}
            />
          </div>
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="$aact_..."
              value={data.fintechs.asaasApiKey}
              onChange={(e) => updateData("fintechs", "asaasApiKey", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Wallet ID</Label>
            <Input
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={data.fintechs.asaasWalletId}
              onChange={(e) => updateData("fintechs", "asaasWalletId", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Transfero */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></span>
            Transfero
          </CardTitle>
          <CardDescription>
            Gateway para stablecoins e conversao crypto/fiat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Modo Sandbox (Teste)</Label>
            <Switch
              checked={data.fintechs.transferoSandbox}
              onCheckedChange={(checked) => updateData("fintechs", "transferoSandbox", checked)}
            />
          </div>
          <div className="space-y-2">
            <Label>Client ID</Label>
            <Input
              placeholder="Seu Client ID"
              value={data.fintechs.transferoClientId}
              onChange={(e) => updateData("fintechs", "transferoClientId", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Client Secret</Label>
            <Input
              type="password"
              placeholder="Seu Client Secret"
              value={data.fintechs.transferoClientSecret}
              onChange={(e) => updateData("fintechs", "transferoClientSecret", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Voce pode pular esta etapa e configurar os gateways depois no painel de configuracoes.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function Step5Communication({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 mb-4">
          <MessageSquare className="w-8 h-8 text-cyan-600" />
        </div>
        <h2 className="text-2xl font-bold">Comunicacao</h2>
        <p className="text-muted-foreground mt-2">
          Configure email, WhatsApp e inteligencia artificial
        </p>
      </div>

      {/* SMTP */}
      <Card>
        <CardHeader>
          <CardTitle>Email (SMTP)</CardTitle>
          <CardDescription>
            Configuracao para envio de emails transacionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Host SMTP</Label>
              <Input
                placeholder="smtp.gmail.com"
                value={data.communication.smtpHost}
                onChange={(e) => updateData("communication", "smtpHost", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Porta</Label>
              <Input
                type="number"
                placeholder="587"
                value={data.communication.smtpPort || ""}
                onChange={(e) => updateData("communication", "smtpPort", parseInt(e.target.value) || 587)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input
                placeholder="seu@email.com"
                value={data.communication.smtpUser}
                onChange={(e) => updateData("communication", "smtpUser", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="Senha ou App Password"
                value={data.communication.smtpPass}
                onChange={(e) => updateData("communication", "smtpPass", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email Remetente</Label>
            <Input
              placeholder="noreply@suaempresa.com"
              value={data.communication.smtpFrom}
              onChange={(e) => updateData("communication", "smtpFrom", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* OpenAI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
              AI
            </span>
            OpenAI
          </CardTitle>
          <CardDescription>
            API Key para os agentes de IA (Vini Proprietario, Vini Inquilino, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="sk-..."
              value={data.communication.openaiApiKey}
              onChange={(e) => updateData("communication", "openaiApiKey", e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Obtenha em: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-5 h-5 bg-green-500 rounded-full"></span>
            WhatsApp
          </CardTitle>
          <CardDescription>
            Conexao via QR Code (sera configurado apos a instalacao)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200">
            <MessageSquare className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Apos finalizar o setup, acesse Configuracoes {">"} WhatsApp para escanear o QR Code e conectar.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// MAIN WIZARD COMPONENT
// ============================================

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [data, setData] = useState<SetupData>({
    admin: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    company: {
      name: "",
      cnpj: "",
      email: "",
      phone: "",
      logo: "",
      primaryColor: "#0066FF",
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    blockchain: {
      polygonRpcUrl: "https://polygon-rpc.com",
      operatorPrivateKey: "",
      treasuryWallet: "",
    },
    fintechs: {
      asaasApiKey: "",
      asaasWalletId: "",
      asaasSandbox: true,
      transferoClientId: "",
      transferoClientSecret: "",
      transferoSandbox: true,
    },
    communication: {
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPass: "",
      smtpFrom: "",
      openaiApiKey: "",
    },
  });

  const steps = [
    { id: 1, title: "Administrador", icon: User },
    { id: 2, title: "Empresa", icon: Building2 },
    { id: 3, title: "Blockchain", icon: Wallet },
    { id: 4, title: "Fintechs", icon: CreditCard },
    { id: 5, title: "Comunicacao", icon: MessageSquare },
  ];

  const updateData = (section: keyof SetupData, field: string, value: unknown) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    // Limpar erro do campo
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${section}.${field}`];
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!data.admin.name) newErrors["admin.name"] = "Nome e obrigatorio";
      if (!data.admin.email) newErrors["admin.email"] = "Email e obrigatorio";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.admin.email)) {
        newErrors["admin.email"] = "Email invalido";
      }
      if (!data.admin.password) newErrors["admin.password"] = "Senha e obrigatoria";
      if (data.admin.password.length < 8) {
        newErrors["admin.password"] = "Senha deve ter no minimo 8 caracteres";
      }
      if (data.admin.password !== data.admin.confirmPassword) {
        newErrors["admin.confirmPassword"] = "Senhas nao conferem";
      }
    }

    if (step === 2) {
      if (!data.company.name) newErrors["company.name"] = "Razao social e obrigatoria";
      if (!data.company.cnpj) newErrors["company.cnpj"] = "CNPJ e obrigatorio";
      if (!data.company.email) newErrors["company.email"] = "Email e obrigatorio";
    }

    if (step === 3) {
      if (!data.blockchain.polygonRpcUrl) {
        newErrors["blockchain.polygonRpcUrl"] = "RPC URL e obrigatoria";
      }
      if (!data.blockchain.operatorPrivateKey) {
        newErrors["blockchain.operatorPrivateKey"] = "Chave privada e obrigatoria";
      }
      if (!data.blockchain.treasuryWallet) {
        newErrors["blockchain.treasuryWallet"] = "Wallet treasury e obrigatoria";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/setup/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao finalizar configuracao");
      }

      setSubmitSuccess(true);

      // Redirecionar apos 3 segundos
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Configuracao Concluida!</h2>
            <p className="text-muted-foreground mb-6">
              Seu sistema Vinculo Brasil esta pronto para uso.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecionando para o login...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Vinculo Brasil
          </h1>
          <p className="text-muted-foreground mt-2">
            Assistente de Configuracao Inicial
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isComplete = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center",
                    isActive && "text-blue-600",
                    isComplete && "text-green-600",
                    !isActive && !isComplete && "text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors",
                      isActive && "bg-blue-100",
                      isComplete && "bg-green-100",
                      !isActive && !isComplete && "bg-gray-100"
                    )}
                  >
                    {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </div>
              );
            })}
          </div>
          <Progress value={(currentStep / 5) * 100} className="h-2" />
        </div>

        {/* Card */}
        <Card className="shadow-xl">
          <CardContent className="pt-6">
            {currentStep === 1 && <Step1Admin data={data} updateData={updateData} errors={errors} />}
            {currentStep === 2 && <Step2Company data={data} updateData={updateData} errors={errors} />}
            {currentStep === 3 && <Step3Blockchain data={data} updateData={updateData} errors={errors} />}
            {currentStep === 4 && <Step4Fintechs data={data} updateData={updateData} errors={errors} />}
            {currentStep === 5 && <Step5Communication data={data} updateData={updateData} errors={errors} />}

            {submitError && (
              <Alert className="mt-6 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{submitError}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          {/* Footer */}
          <div className="border-t px-6 py-4 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            {currentStep < 5 ? (
              <Button onClick={handleNext}>
                Proximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Finalizar Configuracao
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Passo {currentStep} de 5 - {steps[currentStep - 1].title}
        </p>
      </div>
    </div>
  );
}

export default SetupWizard;
