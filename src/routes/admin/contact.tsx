// ============================================
// ROTA /admin/contact - Contato Fatto Tecnologia
// Para Super Admin - canal direto com suporte técnico
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Clock,
  Building2,
  ExternalLink,
  Headphones,
  Zap,
  Code,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/admin/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Fatto Tecnologia</h1>
          <p className="text-zinc-400 mt-2">
            Suporte técnico e desenvolvimento do sistema Vínculo Brasil
          </p>
          <Badge className="mt-3 bg-green-600">Suporte Prioritário</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Canais de Suporte */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-blue-400" />
                  Canais de Suporte
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  Entre em contato conosco
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">E-mail Técnico</p>
                    <p className="text-zinc-400">suporte@fattotecnologia.com.br</p>
                    <p className="text-zinc-500 text-sm">Resposta em até 4h úteis</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Phone className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Telefone / WhatsApp</p>
                    <p className="text-zinc-400">(31) 99999-8888</p>
                    <p className="text-zinc-500 text-sm">Horário comercial</p>
                  </div>
                </div>
                <Separator className="bg-zinc-800" />
                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <a
                    href="https://wa.me/5531999998888?text=Olá! Preciso de suporte técnico do sistema Vínculo Brasil."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Abrir WhatsApp
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Horário de Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Segunda a Sexta</span>
                  <span className="text-white">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Urgências 24h</span>
                  <span className="text-amber-400">Via WhatsApp</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Fatto */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-400" />
                  Sobre a Fatto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-zinc-400 text-sm">
                  A Fatto Tecnologia é responsável pelo desenvolvimento, manutenção
                  e evolução contínua da plataforma Vínculo Brasil.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Code className="h-4 w-4 text-blue-400" />
                    <span className="text-zinc-300 text-sm">Desenvolvimento de Software</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-zinc-300 text-sm">Integrações e APIs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-zinc-300 text-sm">Segurança e Blockchain</span>
                  </div>
                </div>
                <Separator className="bg-zinc-800" />
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Sede</p>
                    <p className="text-zinc-500 text-sm">Belo Horizonte, MG</p>
                    <p className="text-zinc-500 text-sm">CNPJ: 00.000.000/0001-00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-amber-600 to-orange-600 border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Building2 className="h-10 w-10 text-white/80" />
                  <div>
                    <p className="text-white font-bold">Fatto Tecnologia LTDA</p>
                    <p className="text-white/70 text-sm">
                      Soluções tecnológicas para o mercado imobiliário
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
