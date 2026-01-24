// ============================================
// ROTA /admin/settings - Configuracoes do Sistema
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Save,
  CheckCircle2,
  Link2,
  Wallet,
  Building2,
  CreditCard,
  Palette,
  Globe,
} from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("blockchain");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Blockchain Settings
  const [blockchainSettings, setBlockchainSettings] = useState({
    network: "polygon",
    rpcUrl: "",
    contractAddress: "",
    walletAddress: "",
    privateKeyEncrypted: "",
    gasLimit: "300000",
    enableNFT: true,
    enableSmartContracts: true,
  });

  // Fintech Settings
  const [fintechSettings, setFintechSettings] = useState({
    // Asaas
    asaasApiKey: "",
    asaasEnvironment: "sandbox",
    asaasWebhookUrl: "",
    enableAsaas: false,
    // Transfero
    transferoApiKey: "",
    transferoEnvironment: "sandbox",
    transferoWebhookUrl: "",
    enableTransfero: false,
    // General
    defaultPaymentMethod: "pix",
  });

  // Empresa (Whitelabel) Settings
  const [empresaSettings, setEmpresaSettings] = useState({
    companyName: "",
    tradeName: "",
    cnpj: "",
    email: "",
    phone: "",
    website: "",
    // Branding
    primaryColor: "#3b82f6",
    secondaryColor: "#10b981",
    logoUrl: "",
    faviconUrl: "",
    // Address
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleSave = async (section: string) => {
    setIsSaving(true);
    setSaveSuccess(null);

    try {
      const endpoint = `/api/admin/settings/${section}`;
      const data =
        section === "blockchain"
          ? blockchainSettings
          : section === "fintechs"
            ? fintechSettings
            : empresaSettings;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar configuracoes");
      }

      setSaveSuccess(section);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout userName="Administrador">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Configuracoes do Sistema</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie as configuracoes de blockchain, integracoes financeiras e
              dados da empresa.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="blockchain" className="gap-2">
              <Link2 className="w-4 h-4" />
              Blockchain
            </TabsTrigger>
            <TabsTrigger value="fintechs" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Fintechs
            </TabsTrigger>
            <TabsTrigger value="empresa" className="gap-2">
              <Building2 className="w-4 h-4" />
              Empresa
            </TabsTrigger>
          </TabsList>

          {/* Blockchain Tab */}
          <TabsContent value="blockchain">
            <div className="space-y-6">
              {/* Network Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Configuracao de Rede
                  </CardTitle>
                  <CardDescription>
                    Configure a rede blockchain para contratos e NFTs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Rede Blockchain</Label>
                      <Select
                        value={blockchainSettings.network}
                        onValueChange={(v) =>
                          setBlockchainSettings((s) => ({ ...s, network: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="polygon">
                            Polygon (Matic)
                          </SelectItem>
                          <SelectItem value="ethereum">
                            Ethereum Mainnet
                          </SelectItem>
                          <SelectItem value="bsc">
                            Binance Smart Chain
                          </SelectItem>
                          <SelectItem value="avalanche">Avalanche</SelectItem>
                          <SelectItem value="arbitrum">Arbitrum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gas Limit</Label>
                      <Input
                        value={blockchainSettings.gasLimit}
                        onChange={(e) =>
                          setBlockchainSettings((s) => ({
                            ...s,
                            gasLimit: e.target.value,
                          }))
                        }
                        placeholder="300000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>RPC URL</Label>
                    <Input
                      value={blockchainSettings.rpcUrl}
                      onChange={(e) =>
                        setBlockchainSettings((s) => ({
                          ...s,
                          rpcUrl: e.target.value,
                        }))
                      }
                      placeholder="https://polygon-rpc.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Endereco do Contrato</Label>
                    <Input
                      value={blockchainSettings.contractAddress}
                      onChange={(e) =>
                        setBlockchainSettings((s) => ({
                          ...s,
                          contractAddress: e.target.value,
                        }))
                      }
                      placeholder="0x..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Wallet Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Carteira da Plataforma
                  </CardTitle>
                  <CardDescription>
                    Configure a carteira para transacoes automaticas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Endereco da Carteira</Label>
                    <Input
                      value={blockchainSettings.walletAddress}
                      onChange={(e) =>
                        setBlockchainSettings((s) => ({
                          ...s,
                          walletAddress: e.target.value,
                        }))
                      }
                      placeholder="0x..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Chave Privada (Criptografada)</Label>
                    <Input
                      type="password"
                      value={blockchainSettings.privateKeyEncrypted}
                      onChange={(e) =>
                        setBlockchainSettings((s) => ({
                          ...s,
                          privateKeyEncrypted: e.target.value,
                        }))
                      }
                      placeholder="Chave privada sera criptografada"
                    />
                  </div>

                  <div className="flex items-center gap-8 pt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={blockchainSettings.enableNFT}
                        onCheckedChange={(v) =>
                          setBlockchainSettings((s) => ({ ...s, enableNFT: v }))
                        }
                      />
                      <Label>Habilitar NFTs</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={blockchainSettings.enableSmartContracts}
                        onCheckedChange={(v) =>
                          setBlockchainSettings((s) => ({
                            ...s,
                            enableSmartContracts: v,
                          }))
                        }
                      />
                      <Label>Habilitar Smart Contracts</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {saveSuccess === "blockchain" && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Configuracoes de blockchain salvas com sucesso!
                  </AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full"
                onClick={() => handleSave("blockchain")}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configuracoes de Blockchain
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Fintechs Tab */}
          <TabsContent value="fintechs">
            <div className="space-y-6">
              {/* Asaas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Asaas</CardTitle>
                      <CardDescription>
                        Integracao para pagamentos, boletos e PIX
                      </CardDescription>
                    </div>
                    <Switch
                      checked={fintechSettings.enableAsaas}
                      onCheckedChange={(v) =>
                        setFintechSettings((s) => ({ ...s, enableAsaas: v }))
                      }
                    />
                  </div>
                </CardHeader>
                {fintechSettings.enableAsaas && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ambiente</Label>
                        <Select
                          value={fintechSettings.asaasEnvironment}
                          onValueChange={(v) =>
                            setFintechSettings((s) => ({
                              ...s,
                              asaasEnvironment: v,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">
                              Sandbox (Testes)
                            </SelectItem>
                            <SelectItem value="production">
                              Producao
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          value={fintechSettings.asaasApiKey}
                          onChange={(e) =>
                            setFintechSettings((s) => ({
                              ...s,
                              asaasApiKey: e.target.value,
                            }))
                          }
                          placeholder="$aact_..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input
                        value={fintechSettings.asaasWebhookUrl}
                        onChange={(e) =>
                          setFintechSettings((s) => ({
                            ...s,
                            asaasWebhookUrl: e.target.value,
                          }))
                        }
                        placeholder="https://seudominio.com/api/webhooks/asaas"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Transfero */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Transfero</CardTitle>
                      <CardDescription>
                        Integracao para criptomoedas e stablecoins
                      </CardDescription>
                    </div>
                    <Switch
                      checked={fintechSettings.enableTransfero}
                      onCheckedChange={(v) =>
                        setFintechSettings((s) => ({
                          ...s,
                          enableTransfero: v,
                        }))
                      }
                    />
                  </div>
                </CardHeader>
                {fintechSettings.enableTransfero && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ambiente</Label>
                        <Select
                          value={fintechSettings.transferoEnvironment}
                          onValueChange={(v) =>
                            setFintechSettings((s) => ({
                              ...s,
                              transferoEnvironment: v,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">
                              Sandbox (Testes)
                            </SelectItem>
                            <SelectItem value="production">
                              Producao
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          value={fintechSettings.transferoApiKey}
                          onChange={(e) =>
                            setFintechSettings((s) => ({
                              ...s,
                              transferoApiKey: e.target.value,
                            }))
                          }
                          placeholder="tk_..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input
                        value={fintechSettings.transferoWebhookUrl}
                        onChange={(e) =>
                          setFintechSettings((s) => ({
                            ...s,
                            transferoWebhookUrl: e.target.value,
                          }))
                        }
                        placeholder="https://seudominio.com/api/webhooks/transfero"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Default Payment */}
              <Card>
                <CardHeader>
                  <CardTitle>Metodo de Pagamento Padrao</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={fintechSettings.defaultPaymentMethod}
                    onValueChange={(v) =>
                      setFintechSettings((s) => ({
                        ...s,
                        defaultPaymentMethod: v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto Bancario</SelectItem>
                      <SelectItem value="credit_card">
                        Cartao de Credito
                      </SelectItem>
                      <SelectItem value="crypto">Criptomoeda</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {saveSuccess === "fintechs" && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Configuracoes de fintechs salvas com sucesso!
                  </AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full"
                onClick={() => handleSave("fintechs")}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configuracoes de Fintechs
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Empresa Tab */}
          <TabsContent value="empresa">
            <div className="space-y-6">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Dados da Empresa
                  </CardTitle>
                  <CardDescription>
                    Informacoes legais e de contato da empresa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Razao Social</Label>
                      <Input
                        value={empresaSettings.companyName}
                        onChange={(e) =>
                          setEmpresaSettings((s) => ({
                            ...s,
                            companyName: e.target.value,
                          }))
                        }
                        placeholder="Empresa LTDA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome Fantasia</Label>
                      <Input
                        value={empresaSettings.tradeName}
                        onChange={(e) =>
                          setEmpresaSettings((s) => ({
                            ...s,
                            tradeName: e.target.value,
                          }))
                        }
                        placeholder="Nome da Marca"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>CNPJ</Label>
                      <Input
                        value={empresaSettings.cnpj}
                        onChange={(e) =>
                          setEmpresaSettings((s) => ({
                            ...s,
                            cnpj: e.target.value,
                          }))
                        }
                        placeholder="00.000.000/0001-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={empresaSettings.email}
                        onChange={(e) =>
                          setEmpresaSettings((s) => ({
                            ...s,
                            email: e.target.value,
                          }))
                        }
                        placeholder="contato@empresa.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={empresaSettings.phone}
                        onChange={(e) =>
                          setEmpresaSettings((s) => ({
                            ...s,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={empresaSettings.website}
                      onChange={(e) =>
                        setEmpresaSettings((s) => ({
                          ...s,
                          website: e.target.value,
                        }))
                      }
                      placeholder="https://www.empresa.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Endereco</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Endereco Completo</Label>
                    <Input
                      value={empresaSettings.address}
                      onChange={(e) =>
                        setEmpresaSettings((s) => ({
                          ...s,
                          address: e.target.value,
                        }))
                      }
                      placeholder="Rua, numero, complemento"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input
                        value={empresaSettings.city}
                        onChange={(e) =>
                          setEmpresaSettings((s) => ({
                            ...s,
                            city: e.target.value,
                          }))
                        }
                        placeholder="Sao Paulo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input
                        value={empresaSettings.state}
                        onChange={(e) =>
                          setEmpresaSettings((s) => ({
                            ...s,
                            state: e.target.value,
                          }))
                        }
                        placeholder="SP"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input
                        value={empresaSettings.zipCode}
                        onChange={(e) =>
                          setEmpresaSettings((s) => ({
                            ...s,
                            zipCode: e.target.value,
                          }))
                        }
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Branding */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Identidade Visual (Whitelabel)
                  </CardTitle>
                  <CardDescription>
                    Personalize as cores e logos da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cor Primaria</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={empresaSettings.primaryColor}
                          onChange={(e) =>
                            setEmpresaSettings((s) => ({
                              ...s,
                              primaryColor: e.target.value,
                            }))
                          }
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={empresaSettings.primaryColor}
                          onChange={(e) =>
                            setEmpresaSettings((s) => ({
                              ...s,
                              primaryColor: e.target.value,
                            }))
                          }
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cor Secundaria</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={empresaSettings.secondaryColor}
                          onChange={(e) =>
                            setEmpresaSettings((s) => ({
                              ...s,
                              secondaryColor: e.target.value,
                            }))
                          }
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={empresaSettings.secondaryColor}
                          onChange={(e) =>
                            setEmpresaSettings((s) => ({
                              ...s,
                              secondaryColor: e.target.value,
                            }))
                          }
                          placeholder="#10b981"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>URL do Logo</Label>
                      <Input
                        value={empresaSettings.logoUrl}
                        onChange={(e) =>
                          setEmpresaSettings((s) => ({
                            ...s,
                            logoUrl: e.target.value,
                          }))
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL do Favicon</Label>
                      <Input
                        value={empresaSettings.faviconUrl}
                        onChange={(e) =>
                          setEmpresaSettings((s) => ({
                            ...s,
                            faviconUrl: e.target.value,
                          }))
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {saveSuccess === "empresa" && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Configuracoes da empresa salvas com sucesso!
                  </AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full"
                onClick={() => handleSave("empresa")}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configuracoes da Empresa
                  </>
                )}
              </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
