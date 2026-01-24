// ============================================
// ROTA /admin/help - Central de Ajuda
// USA AdminLayout (Super Admin)
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HelpCircle,
  Search,
  MessageSquare,
  Book,
  Video,
  Mail,
  Phone,
  ChevronRight,
  ExternalLink,
  Headphones,
} from "lucide-react";

export const Route = createFileRoute("/admin/help")({
  component: HelpPage,
});

const faqItems = [
  {
    question: "Como cadastrar um novo imóvel?",
    answer: "Acesse o menu Principal > Imóveis > Novo Imóvel e preencha o formulário.",
  },
  {
    question: "Como gerar um contrato digital?",
    answer: "Vá em Contratos > Novo Contrato, selecione o imóvel e as partes envolvidas.",
  },
  {
    question: "Como configurar integrações de e-mail?",
    answer: "Acesse Configuração > SMTP / E-mail e insira as credenciais do seu servidor.",
  },
  {
    question: "Como funciona o Marketplace P2P?",
    answer: "O P2P permite que investidores adquiram frações de contratos tokenizados.",
  },
  {
    question: "Como acessar os relatórios financeiros?",
    answer: "Clique na aba Relatórios e selecione DRE Geral ou Investimentos.",
  },
];

function HelpPage() {
  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Central de Ajuda</h1>
          <p className="text-zinc-400 mt-2">
            Como podemos ajudar você hoje?
          </p>
        </div>

        {/* Search */}
        <Card className="bg-zinc-900 border-zinc-800 max-w-2xl mx-auto">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                placeholder="Descreva seu problema ou dúvida..."
                className="pl-12 py-6 text-lg bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-600 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-4">
                <Book className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold">Documentação</h3>
              <p className="text-zinc-500 text-sm mt-1">Guias e tutoriais</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 hover:border-purple-600 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl mb-4">
                <Video className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold">Vídeo Tutoriais</h3>
              <p className="text-zinc-500 text-sm mt-1">Aprenda visualmente</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 hover:border-green-600 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-xl mb-4">
                <MessageSquare className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-white font-semibold">Chat ao Vivo</h3>
              <p className="text-zinc-500 text-sm mt-1">Fale com suporte</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Perguntas Frequentes</CardTitle>
            <CardDescription className="text-zinc-500">
              Respostas rápidas para as dúvidas mais comuns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <details
                  key={index}
                  className="group bg-zinc-800/50 rounded-lg"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer text-white hover:bg-zinc-800 rounded-lg transition-colors">
                    <span>{item.question}</span>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 text-zinc-400 text-sm">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Headphones className="h-5 w-5 text-green-500" />
              Contato com Suporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-4 bg-zinc-800 rounded-lg">
                <Mail className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="text-white font-medium">E-mail</p>
                  <p className="text-zinc-500 text-sm">suporte@vinculobrasil.com.br</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-zinc-800 rounded-lg">
                <Phone className="h-6 w-6 text-green-400" />
                <div>
                  <p className="text-white font-medium">Telefone</p>
                  <p className="text-zinc-500 text-sm">0800 123 4567</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-zinc-800 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="text-white font-medium">WhatsApp</p>
                  <p className="text-zinc-500 text-sm">(31) 99999-9999</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
