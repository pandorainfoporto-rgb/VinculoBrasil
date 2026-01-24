// ============================================
// ROTA /admin/about - Sobre o Sistema
// Informações Institucionais e Legais
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Info,
  Code,
  Database,
  Server,
  Shield,
  Zap,
  Globe,
  Smartphone,
  CheckCircle,
  Building2,
  FileText,
  Scale,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Award,
  Users,
  Lock,
  Coins,
} from "lucide-react";

export const Route = createFileRoute("/admin/about")({
  component: AboutPage,
});

function AboutPage() {
  const currentYear = new Date().getFullYear();

  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header com Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-4xl font-black text-white">V</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Vinculo Brasil</h1>
          <p className="text-zinc-400 mt-2">
            Plataforma de Gestao Imobiliaria com DeFi & Blockchain
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-blue-600">v2.0.0</Badge>
            <Badge variant="outline" className="border-green-600 text-green-400">
              Producao
            </Badge>
          </div>
        </div>

        {/* Informacoes da Versao */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Informacoes do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-zinc-800 rounded-lg">
                <p className="text-zinc-500 text-xs">Versao</p>
                <p className="text-white font-mono text-lg">2.0.0</p>
              </div>
              <div className="p-3 bg-zinc-800 rounded-lg">
                <p className="text-zinc-500 text-xs">Build</p>
                <p className="text-white font-mono text-lg">2026.01.24</p>
              </div>
              <div className="p-3 bg-zinc-800 rounded-lg">
                <p className="text-zinc-500 text-xs">Ambiente</p>
                <p className="text-white text-lg">Producao</p>
              </div>
              <div className="p-3 bg-zinc-800 rounded-lg">
                <p className="text-zinc-500 text-xs">Regiao</p>
                <p className="text-white text-lg">Brasil (SP)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funcionalidades */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Funcionalidades do Sistema
            </CardTitle>
            <CardDescription>
              Modulos e recursos disponiveis na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: Building2, label: "Gestao de Imoveis", status: "active", desc: "Cadastro e administracao de imoveis" },
                { icon: FileText, label: "Contratos Digitais (NFT)", status: "active", desc: "Contratos em blockchain com assinatura digital" },
                { icon: Users, label: "CRM & Leads", status: "active", desc: "Gestao de relacionamento com clientes" },
                { icon: Zap, label: "Marketing Automation (Engage)", status: "active", desc: "Automacao de campanhas e comunicacao" },
                { icon: Server, label: "Flow Builder (IA)", status: "active", desc: "Construtor de fluxos com inteligencia artificial" },
                { icon: Globe, label: "Engine de Anuncios", status: "active", desc: "Gestao de campanhas em multiplas plataformas" },
                { icon: Shield, label: "DeFi & Blockchain", status: "active", desc: "Investimentos e transacoes descentralizadas" },
                { icon: Coins, label: "VBRz Token", status: "active", desc: "Token de cashback e fidelidade" },
                { icon: Lock, label: "Garantidores", status: "active", desc: "Sistema de garantia locaticia" },
                { icon: Smartphone, label: "App Mobile (Capacitor)", status: "beta", desc: "Aplicativo nativo para iOS e Android" },
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg">
                  <feature.icon className="h-5 w-5 text-zinc-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{feature.label}</span>
                      {feature.status === "active" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-xs">
                          Beta
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stack Tecnologica */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Code className="h-5 w-5 text-green-500" />
              Stack Tecnologica
            </CardTitle>
            <CardDescription>
              Tecnologias utilizadas no desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-zinc-400 text-sm mb-2">Frontend</p>
                <div className="flex flex-wrap gap-2">
                  {["React 19", "TypeScript", "TanStack Router", "TanStack Query", "Tailwind CSS v4", "shadcn/ui", "Vite"].map((tech) => (
                    <Badge key={tech} variant="outline" className="border-blue-700 text-blue-300">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-2">Backend</p>
                <div className="flex flex-wrap gap-2">
                  {["Node.js", "Prisma", "PostgreSQL", "Redis", "N8N"].map((tech) => (
                    <Badge key={tech} variant="outline" className="border-green-700 text-green-300">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-2">Blockchain</p>
                <div className="flex flex-wrap gap-2">
                  {["Ethereum", "Polygon", "ethers.js", "Smart Contracts", "IPFS"].map((tech) => (
                    <Badge key={tech} variant="outline" className="border-purple-700 text-purple-300">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-2">Mobile</p>
                <div className="flex flex-wrap gap-2">
                  {["Capacitor", "iOS", "Android"].map((tech) => (
                    <Badge key={tech} variant="outline" className="border-amber-700 text-amber-300">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informacoes Legais */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-purple-500" />
              Informacoes Legais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="terms" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:text-white">
                  Termos de Uso
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 text-sm space-y-3">
                  <p>
                    Ao utilizar a plataforma Vinculo Brasil, voce concorda com os seguintes termos:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>A plataforma e destinada exclusivamente para gestao imobiliaria e operacoes relacionadas.</li>
                    <li>O usuario e responsavel pela veracidade das informacoes cadastradas.</li>
                    <li>As operacoes em blockchain sao irreversiveis apos confirmacao na rede.</li>
                    <li>O uso do VBRz Token esta sujeito as regras do programa de fidelidade.</li>
                    <li>A plataforma pode suspender contas que violem os termos de uso.</li>
                  </ul>
                  <p className="text-xs text-zinc-500 mt-4">
                    Ultima atualizacao: Janeiro de 2026
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:text-white">
                  Politica de Privacidade
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 text-sm space-y-3">
                  <p>
                    A Fatto Tecnologia valoriza sua privacidade. Coletamos apenas dados necessarios para:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Identificacao e autenticacao de usuarios</li>
                    <li>Processamento de transacoes imobiliarias</li>
                    <li>Operacoes em blockchain e smart contracts</li>
                    <li>Comunicacao sobre servicos e atualizacoes</li>
                    <li>Melhoria continua da plataforma</li>
                  </ul>
                  <p>
                    Seus dados sao armazenados com criptografia e nao sao compartilhados com terceiros
                    sem seu consentimento, exceto quando exigido por lei.
                  </p>
                  <p className="text-xs text-zinc-500 mt-4">
                    Em conformidade com a LGPD (Lei Geral de Protecao de Dados)
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="compliance" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:text-white">
                  Compliance e Regulamentacao
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 text-sm space-y-3">
                  <p>
                    A plataforma Vinculo Brasil opera em conformidade com:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Lei do Inquilinato (Lei n 8.245/91)</li>
                    <li>Codigo Civil Brasileiro</li>
                    <li>LGPD - Lei Geral de Protecao de Dados</li>
                    <li>Marco Civil da Internet</li>
                    <li>Regulamentacoes do BACEN para operacoes financeiras</li>
                    <li>Normas CRECI para operacoes imobiliarias</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="blockchain" className="border-zinc-800">
                <AccordionTrigger className="text-zinc-300 hover:text-white">
                  Avisos sobre Blockchain e DeFi
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 text-sm space-y-3">
                  <p>
                    <strong className="text-amber-400">Importante:</strong> Operacoes em blockchain envolvem riscos:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Transacoes confirmadas sao irreversiveis</li>
                    <li>O valor de tokens pode variar</li>
                    <li>Taxas de gas (rede) sao cobradas pela blockchain</li>
                    <li>O usuario e responsavel pela custodia de suas chaves privadas</li>
                    <li>Investimentos DeFi podem resultar em perdas</li>
                  </ul>
                  <p className="text-amber-400/70 text-xs mt-2">
                    Operacoes DeFi nao sao garantidas pelo FGC ou qualquer orgao governamental.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Desenvolvedora - Fatto Tecnologia */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Desenvolvido por
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-white">F</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">FATTO Tecnologia LTDA</h3>
                <p className="text-zinc-400">Solucoes em Tecnologia e Inovacao</p>
                <Badge className="mt-1 bg-amber-600">Parceiro Oficial</Badge>
              </div>
            </div>

            <Separator className="bg-zinc-700" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-300">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm">Sao Paulo, SP - Brasil</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm">suporte@fattotecnologia.com.br</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Phone className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm">+55 (11) 99999-0000</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 justify-start"
                  onClick={() => window.open("https://fattotecnologia.com.br", "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Website Institucional
                </Button>
                <Button
                  variant="outline"
                  className="border-green-700 text-green-400 hover:bg-green-900/20 justify-start"
                  onClick={() => window.open("https://wa.me/5511999990000?text=Suporte%20Vinculo%20Brasil", "_blank")}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Suporte via WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2 pt-4">
          <Separator className="bg-zinc-800" />
          <p className="text-zinc-500 text-sm">
            © {currentYear} Vinculo Brasil. Todos os direitos reservados.
          </p>
          <p className="text-zinc-600 text-xs">
            Um produto da FATTO Tecnologia LTDA | CNPJ: 00.000.000/0001-00
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
