// ============================================
// ROTA /admin/docs - Documentação do Sistema
// USA AdminLayout (Super Admin)
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  FileText,
  Code,
  Database,
  Zap,
  Shield,
  Globe,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/admin/docs")({
  component: DocsPage,
});

const docCategories = [
  {
    title: "Primeiros Passos",
    icon: BookOpen,
    color: "text-blue-400",
    docs: [
      { title: "Introdução ao Vínculo", path: "/docs/intro" },
      { title: "Configuração Inicial", path: "/docs/setup" },
      { title: "Guia de Usuário", path: "/docs/user-guide" },
    ],
  },
  {
    title: "Gestão Imobiliária",
    icon: FileText,
    color: "text-green-400",
    docs: [
      { title: "Cadastro de Imóveis", path: "/docs/properties" },
      { title: "Contratos e Aluguéis", path: "/docs/contracts" },
      { title: "Vistorias", path: "/docs/inspections" },
    ],
  },
  {
    title: "CRM & Marketing",
    icon: Zap,
    color: "text-yellow-400",
    docs: [
      { title: "CRM Live", path: "/docs/crm" },
      { title: "Engage (Automação)", path: "/docs/engage" },
      { title: "Flow Builder", path: "/docs/flows" },
    ],
  },
  {
    title: "DeFi & Blockchain",
    icon: Shield,
    color: "text-purple-400",
    docs: [
      { title: "Tokenização de Contratos", path: "/docs/tokenization" },
      { title: "Marketplace P2P", path: "/docs/p2p" },
      { title: "Auditoria Blockchain", path: "/docs/audit" },
    ],
  },
  {
    title: "Integrações",
    icon: Globe,
    color: "text-cyan-400",
    docs: [
      { title: "API REST", path: "/docs/api" },
      { title: "Webhooks", path: "/docs/webhooks" },
      { title: "Omnichannel", path: "/docs/omnichannel" },
    ],
  },
  {
    title: "Desenvolvimento",
    icon: Code,
    color: "text-orange-400",
    docs: [
      { title: "Arquitetura do Sistema", path: "/docs/architecture" },
      { title: "Stack Tecnológica", path: "/docs/stack" },
      { title: "Contribuindo", path: "/docs/contributing" },
    ],
  },
];

function DocsPage() {
  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Documentação</h1>
          <p className="text-zinc-400 mt-2">
            Guias, tutoriais e referências técnicas do Vínculo Brasil
          </p>
        </div>

        {/* Search */}
        <Card className="bg-zinc-900 border-zinc-800 max-w-2xl mx-auto">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                placeholder="Buscar na documentação..."
                className="pl-12 py-6 text-lg bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="outline" className="border-zinc-700 text-zinc-300 px-4 py-2 cursor-pointer hover:bg-zinc-800">
            Guia Rápido
          </Badge>
          <Badge variant="outline" className="border-zinc-700 text-zinc-300 px-4 py-2 cursor-pointer hover:bg-zinc-800">
            API Reference
          </Badge>
          <Badge variant="outline" className="border-zinc-700 text-zinc-300 px-4 py-2 cursor-pointer hover:bg-zinc-800">
            FAQ
          </Badge>
          <Badge variant="outline" className="border-zinc-700 text-zinc-300 px-4 py-2 cursor-pointer hover:bg-zinc-800">
            Changelog
          </Badge>
        </div>

        {/* Documentation Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docCategories.map((category) => {
            const Icon = category.icon;

            return (
              <Card key={category.title} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${category.color}`} />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.docs.map((doc) => (
                      <a
                        key={doc.path}
                        href={doc.path}
                        className="flex items-center justify-between p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors group"
                      >
                        <span className="text-sm">{doc.title}</span>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* External Resources */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recursos Externos</CardTitle>
            <CardDescription className="text-zinc-500">
              Links úteis para desenvolvedores e parceiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="border-zinc-700 text-zinc-300 justify-between h-auto py-4">
                <span>GitHub Repository</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-zinc-700 text-zinc-300 justify-between h-auto py-4">
                <span>API Playground</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-zinc-700 text-zinc-300 justify-between h-auto py-4">
                <span>Status Page</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
