// ============================================
// AGENCY OS - Suporte
// Central de ajuda e contato
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { AgencyLayout } from '@/components/layouts/AgencyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  Search,
  ChevronRight,
  Headphones,
  Clock,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/agency/support' as never)({
  component: AgencySupportPage,
});

// FAQs
const FAQS = [
  {
    question: 'Como funciona o split automatico?',
    answer: 'Quando o inquilino paga o boleto, o sistema divide automaticamente: 85% para a base imobiliaria (voce e o proprietario) e 15% para o ecossistema Vinculo (garantia + plataforma).',
  },
  {
    question: 'Como configuro o PIX do proprietario?',
    answer: 'Acesse Proprietarios > Selecione o proprietario > Editar > Dados para Repasse. Configure a chave PIX ou conta bancaria para receber os repasses automaticos.',
  },
  {
    question: 'Quanto tempo leva para o repasse cair?',
    answer: 'Os repasses sao processados em D+1 (um dia util apos a confirmacao do pagamento). O valor e creditado automaticamente via PIX.',
  },
  {
    question: 'Como faco para destacar um imovel?',
    answer: 'Acesse Anuncios Ads no menu lateral e escolha um dos planos de destaque. O imovel aparecera com prioridade nas buscas e no portal Vinculo.',
  },
];

// Recursos
const RESOURCES = [
  {
    icon: BookOpen,
    title: 'Central de Ajuda',
    description: 'Artigos e tutoriais completos',
    link: '#',
  },
  {
    icon: Video,
    title: 'Video Tutoriais',
    description: 'Aprenda com videos passo a passo',
    link: '#',
  },
  {
    icon: FileText,
    title: 'Documentacao API',
    description: 'Para desenvolvedores e integracoes',
    link: '#',
  },
];

function AgencySupportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const filteredFaqs = FAQS.filter(
    faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitTicket = () => {
    if (!ticketSubject || !ticketMessage) return;
    // TODO: Enviar ticket para API
    alert('Ticket enviado com sucesso! Responderemos em ate 24 horas.');
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <AgencyLayout agencyName="Minha Imobiliaria" userName="Usuario" userEmail="usuario@email.com">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-blue-400" />
            Central de Suporte
          </h1>
          <p className="text-zinc-400 mt-1">
            Encontre ajuda, tutoriais e entre em contato com nossa equipe
          </p>
        </div>

        {/* Busca */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                placeholder="Buscar por duvidas, tutoriais..."
                className="pl-12 py-6 text-lg bg-zinc-800 border-zinc-700 text-zinc-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status do Suporte */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/20">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-400 font-medium">Sistema Operacional</p>
                <p className="text-xs text-zinc-500">Todos os servicos funcionando</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-300 font-medium">Tempo de Resposta</p>
                <p className="text-xs text-zinc-500">Media: 4 horas</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-300 font-medium">Suporte Premium</p>
                <p className="text-xs text-zinc-500">Atendimento prioritario</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAQs */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">Perguntas Frequentes</h2>

            {filteredFaqs.map((faq, index) => (
              <Card
                key={index}
                className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-zinc-100">{faq.question}</h3>
                    <ChevronRight className={`h-5 w-5 text-zinc-500 transition-transform ${
                      expandedFaq === index ? 'rotate-90' : ''
                    }`} />
                  </div>
                  {expandedFaq === index && (
                    <p className="text-sm text-zinc-400 mt-3 pt-3 border-t border-zinc-800">
                      {faq.answer}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredFaqs.length === 0 && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">Nenhuma pergunta encontrada</p>
                  <p className="text-sm text-zinc-600 mt-1">
                    Tente buscar por outros termos ou abra um ticket
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Contato e Recursos */}
          <div className="space-y-6">
            {/* Canais de Contato */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 text-base">Fale Conosco</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-zinc-700 text-zinc-300 hover:text-zinc-100"
                >
                  <MessageCircle className="h-4 w-4 mr-3 text-emerald-400" />
                  WhatsApp
                  <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    Online
                  </Badge>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-zinc-700 text-zinc-300 hover:text-zinc-100"
                >
                  <Mail className="h-4 w-4 mr-3 text-blue-400" />
                  suporte@vinculobrasil.com.br
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-zinc-700 text-zinc-300 hover:text-zinc-100"
                >
                  <Phone className="h-4 w-4 mr-3 text-purple-400" />
                  (11) 3000-0000
                </Button>
              </CardContent>
            </Card>

            {/* Recursos */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 text-base">Recursos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {RESOURCES.map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <a
                      key={index}
                      href={resource.link}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <Icon className="h-5 w-5 text-zinc-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-300">{resource.title}</p>
                        <p className="text-xs text-zinc-600">{resource.description}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-zinc-600" />
                    </a>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Abrir Ticket */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Headphones className="h-5 w-5 text-blue-400" />
              Abrir Ticket de Suporte
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Nao encontrou sua resposta? Envie sua duvida para nossa equipe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Assunto</Label>
              <Input
                placeholder="Descreva brevemente o problema"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Mensagem</Label>
              <Textarea
                placeholder="Descreva o problema em detalhes. Quanto mais informacao, mais rapido podemos ajudar."
                className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[120px]"
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
              />
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmitTicket}
              disabled={!ticketSubject || !ticketMessage}
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar Ticket
            </Button>
          </CardContent>
        </Card>
      </div>
    </AgencyLayout>
  );
}
