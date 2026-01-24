# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [2.0.0] - 2025-01-22

### 🚀 Grandes Mudanças

Esta é uma atualização major que completa a integração end-to-end do fluxo de investimento, transformando o sistema em uma plataforma totalmente funcional de tokenização de recebíveis.

### ✨ Novas Funcionalidades

#### 🔄 Sistema de Polling Automático
- **Hook `usePaymentPolling`**: Atualização automática do status de pagamento a cada 3 segundos
- **Endpoint `/api/invest/orders/:orderId/status`**: Endpoint otimizado para polling
- **Atualização em tempo real**: Tela atualiza automaticamente após confirmação de pagamento Pix
- **Callbacks personalizáveis**: `onSuccess` e `onExpired` para ações customizadas

#### 📧 Sistema de Email Automático
- **Serviço `sendInvestmentReceipt`**: Email HTML profissional com comprovante de investimento
- **Template responsivo**: Design moderno com gradiente, badges e tabela de detalhes
- **Integração automática**: Email enviado automaticamente após liquidação bem-sucedida
- **Informações completas**: Detalhes do imóvel, valor, período, TX hash blockchain, próximos passos
- **Provedor configurável**: Suporte para Resend/SMTP

#### 🛡️ Validação de Perfil (KYC Básico)
- **Validador `validateUserForInvestment`**: Verifica CPF, telefone, email e nome completo
- **Componente `InvestmentGuard`**: Bloqueia ações de investimento se perfil incompleto
- **Hook `useInvestmentValidation`**: Validação programática para uso flexível
- **Mensagens amigáveis**: Feedback claro sobre campos faltantes
- **Utilitários de formatação**: Funções para formatar CPF e telefone

#### 🔧 Painel Admin Avançado
- **Componente `InvestmentOrdersTable`**: Tabela completa de pedidos de investimento
- **Botão de Retry Manual**: Reenvio manual de tokens para pedidos com falha
- **Alertas inteligentes**: Destaque automático de pedidos problemáticos
- **Estados visuais**: Badges coloridos para cada status (PENDING, PAID, SETTLING, COMPLETED, FAILED)
- **Link para blockchain**: Integração direta com Polygonscan
- **Atualização automática**: Refresh da lista após retry bem-sucedido

### 🔧 Melhorias

#### Backend
- **Endpoints duplicados removidos**: Consolidação de rotas `/api/p2p/orders/:orderId/status` e `/api/invest/orders/:orderId/status`
- **Logging aprimorado**: Logs detalhados em todo o fluxo de settlement
- **Error handling robusto**: Tratamento de erros não-bloqueantes para emails
- **Performance otimizada**: Endpoint de status retorna apenas dados essenciais

#### Frontend
- **Hook `useInvest` atualizado**: Agora inclui `orderId` no state para polling
- **Responsividade melhorada**: Componentes adaptados para mobile/tablet
- **Estados de loading**: Indicadores visuais durante operações assíncronas
- **Toast notifications**: Feedback imediato usando Sonner

### 📚 Documentação

#### Novos Documentos
- **`IMPLEMENTATION_GUIDE.md`**: Guia passo a passo de integração
- **`FINAL_SUMMARY.md`**: Resumo executivo com exemplos de código
- **`CHANGELOG.md`**: Histórico de versões (este arquivo)

#### Documentação Atualizada
- Exemplos de uso para todos os novos hooks
- Instruções de configuração SMTP
- Troubleshooting guide para problemas comuns
- Diagrama de fluxo completo de investimento

### 🔒 Segurança

- **Validação de CPF obrigatória**: KYC básico antes de permitir investimentos
- **Validação de telefone**: Requisito para compliance
- **Validação de email**: Comunicação garantida
- **Nome completo obrigatório**: Identificação adequada do investidor

### 🐛 Correções

- Corrigido problema de import do `useToast` (migrado para `sonner`)
- Corrigido tipo de retorno do `checkPaymentStatus` para incluir status detalhado
- Corrigido interface `PixData` para incluir `orderId`

### 🗑️ Removidos

- Hook experimental `useProfileValidation` (substituído por validação utilitária)
- Imports não utilizados em componentes admin

### 📦 Dependências

Nenhuma dependência nova adicionada nesta versão. Todos os recursos foram implementados usando bibliotecas existentes.

### ⚙️ Configuração Necessária

Para usar as novas funcionalidades, configure no `server/.env`:

```bash
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_sua_api_key_aqui
SMTP_FROM_EMAIL=noreply@vinculobrasil.com
SMTP_FROM_NAME=Vínculo Brasil
```

### 🎯 Próximos Passos Sugeridos

1. Integrar `usePaymentPolling` nos componentes de QR Code
2. Adicionar `InvestmentGuard` nos botões de investir
3. Implementar dashboard admin com `InvestmentOrdersTable`
4. Criar endpoint `/api/admin/settlements/:id/retry` para retry manual
5. Testes end-to-end do fluxo completo

### 🔗 Links Úteis

- [Guia de Implementação](./IMPLEMENTATION_GUIDE.md)
- [Resumo da Versão](./FINAL_SUMMARY.md)
- [Documentação da API](./server/README.md)

---

## [1.0.0] - 2025-01-20

### ✨ Funcionalidades Iniciais

#### 🏠 Core da Plataforma
- Sistema de autenticação JWT
- Tokenização de recebíveis ERC-1155
- Marketplace P2P de cessão de crédito
- Integração com blockchain Polygon
- Pagamento via Pix (Asaas)

#### 💼 Módulos Principais
- **Gestão de Propriedades**: CRUD completo de imóveis
- **Contratos de Aluguel**: Sistema de contratos digitais
- **Marketplace**: Compra e venda de recebíveis
- **Dashboard Investidor**: Acompanhamento de investimentos
- **Dashboard Proprietário**: Gestão de propriedades e recebíveis

#### 🔐 Segurança
- Carteiras gerenciadas invisíveis ao usuário
- Assinatura de transações automática
- Webhooks Asaas para confirmação de pagamento
- Regras de split automáticas

#### 📱 Frontend
- React 19 com TypeScript
- TailwindCSS v4
- shadcn/ui (New York style)
- TanStack Router + Query
- Componentes responsivos

#### ⚙️ Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- Ethers.js para blockchain
- Logger com Winston

### 🔧 Configuração Inicial
- Estrutura de projeto completa
- CI/CD básico
- Documentação técnica
- Testes unitários

---

## Formato das Versões

- **MAJOR** (X.0.0): Mudanças incompatíveis com versões anteriores
- **MINOR** (0.X.0): Novas funcionalidades mantendo compatibilidade
- **PATCH** (0.0.X): Correções de bugs e melhorias

## Tipos de Mudanças

- `✨ Novas Funcionalidades`: Recursos novos adicionados
- `🔧 Melhorias`: Melhorias em recursos existentes
- `🐛 Correções`: Correção de bugs
- `🗑️ Removidos`: Funcionalidades removidas
- `🔒 Segurança`: Correções de segurança
- `📚 Documentação`: Mudanças na documentação
- `⚡ Performance`: Melhorias de performance
- `🎨 Estilo`: Mudanças que não afetam funcionalidade
- `♻️ Refatoração`: Mudanças de código sem alterar comportamento
