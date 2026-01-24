# Documentacao Tecnica - Vinculo.io
## ERP Administrativo - Sistema Completo de Gestao Imobiliaria com Blockchain

---

**Versao:** 2.0.0
**Data:** Janeiro 2026
**Classificacao:** Documento Tecnico Interno

---

# SUMARIO

1. [Visao Geral do Sistema](#1-visao-geral-do-sistema)
2. [Arquitetura Tecnica](#2-arquitetura-tecnica)
3. [Modulos do Sistema](#3-modulos-do-sistema)
4. [Modelo de Negocio - Split 85/5/5/5](#4-modelo-de-negocio---split-855/55)
5. [Integracoes Blockchain](#5-integracoes-blockchain)
6. [Token VBRz](#6-token-vbrz)
7. [Programa de Cashback](#7-programa-de-cashback)
8. [Modulo Financeiro](#8-modulo-financeiro)
9. [CRM e Engage](#9-crm-e-engage)
10. [Omnichannel e IA](#10-omnichannel-e-ia)
11. [Seguranca e Compliance](#11-seguranca-e-compliance)
12. [APIs e Webhooks](#12-apis-e-webhooks)
13. [Estrutura de Dados](#13-estrutura-de-dados)
14. [Guia de Deploy](#14-guia-de-deploy)

---

# 1. VISAO GERAL DO SISTEMA

## 1.1 O que e o Vinculo.io?

O Vinculo.io e um ecossistema completo de locacao imobiliaria baseado em blockchain. Diferente de uma imobiliaria tradicional, o sistema utiliza:

- **Smart Contracts** para automatizar pagamentos e splits
- **NFTs** para representar contratos de locacao imutaveis
- **Vistorias Digitais** com hash criptografico na blockchain
- **Token VBRz** para cashback e recompensas
- **IA Omnichannel** para atendimento automatizado

## 1.2 Papeis no Ecossistema

| Papel | Descricao | % do Aluguel |
|-------|-----------|--------------|
| **Locador** | Proprietario do imovel | Recebe 85% |
| **Seguradora** | Protege o contrato | Recebe 5% |
| **Plataforma** | Vinculo.io | Recebe 5% |
| **Garantidor** | Fornece colateral digital | Recebe 5% |
| **Locatario** | Inquilino | Paga 100% |

## 1.3 Stack Tecnologico

```
Frontend:
- React 19 + TypeScript
- Tailwind CSS v4
- TanStack Router + Query
- shadcn/ui (New York style)
- Lucide React Icons

Blockchain:
- Polygon / Base Network
- Smart Contracts (Solidity)
- IPFS para armazenamento
- Ethers.js / Viem

Backend Services:
- Node.js + Express
- PostgreSQL
- Redis Cache
- WebSocket (Socket.io)

Integracoes:
- Asaas / Stripe (Pagamentos)
- Transfero (Crypto)
- WhatsApp Business API
- Seguradoras Parceiras
```

---

# 2. ARQUITETURA TECNICA

## 2.1 Estrutura de Diretorios

```
src/
├── components/
│   ├── admin/              # Componentes administrativos
│   │   └── cashback/       # Modulo de cashback
│   ├── crm/                # CRM e Kanban
│   ├── dashboards/         # Dashboards por perfil
│   │   ├── admin-dashboard.tsx
│   │   ├── tenant-dashboard.tsx
│   │   ├── landlord-dashboard.tsx
│   │   ├── guarantor-dashboard.tsx
│   │   ├── insurer-dashboard.tsx
│   │   ├── dashboards-consultivas.tsx
│   │   └── vbrz-dashboard.tsx
│   ├── defi/               # Componentes DeFi
│   ├── engage/             # Automacao de marketing
│   ├── financeiro/         # Modulo financeiro
│   ├── inspection/         # Camera de vistoria
│   ├── marketplace/        # Marketplace de servicos
│   ├── omnichannel/        # Atendimento omnichannel
│   ├── ui/                 # shadcn/ui components
│   └── wallet/             # Carteiras crypto
├── hooks/                  # Custom React hooks
├── lib/                    # Utilitarios
├── routes/                 # Rotas TanStack Router
└── assets/                 # Arquivos estaticos
```

## 2.2 Dashboards por Perfil

O sistema possui dashboards especificos para cada tipo de usuario:

| Dashboard | Arquivo | Descricao |
|-----------|---------|-----------|
| Admin | `admin-dashboard.tsx` | ERP completo com todos os modulos |
| Locatario | `tenant-dashboard.tsx` | Area do inquilino |
| Proprietario | `landlord-dashboard.tsx` | Area do locador |
| Garantidor | `guarantor-dashboard.tsx` | Area do investidor |
| Seguradora | `insurer-dashboard.tsx` | Portal da seguradora |
| Consultivas | `dashboards-consultivas.tsx` | BI e Analytics |
| VBRz | `vbrz-dashboard.tsx` | Dashboard do token |

## 2.3 Padrao de Componentes

```typescript
// Exemplo de estrutura de componente
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComponentProps {
  title: string;
  data: DataType[];
  onAction: (id: string) => void;
}

export function ComponentName({ title, data, onAction }: ComponentProps) {
  const [state, setState] = useState<StateType>(initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Conteudo */}
      </CardContent>
    </Card>
  );
}
```

---

# 3. MODULOS DO SISTEMA

## 3.1 Menu Principal

O ERP administrativo possui 4 categorias principais de modulos:

### Menu Principal
1. **Dashboard** - Visao geral com KPIs
2. **Dashboards Consultivas** - BI e analytics
3. **VBRz Token** - Dashboard do token
4. **Financeiro** - Modulo financeiro integrado
5. **Contratos** - Gestao de contratos NFT
6. **Imoveis** - Cadastro de propriedades
7. **Locatarios** - Gestao de inquilinos
8. **Proprietarios** - Gestao de locadores
9. **Garantidores** - Gestao de investidores
10. **CRM** - Pipeline de vendas
11. **Engage** - Automacao de marketing

### Relatorios & BI
1. **DRE Contabil** - Demonstrativo de resultados
2. **Fluxo de Caixa** - Entradas e saidas
3. **DIMOB / Fiscal** - Relatorios fiscais
4. **Inadimplencia** - Acompanhamento de atrasos
5. **Auditoria Blockchain** - Transacoes on-chain
6. **Modulo Financeiro** - Relatorios financeiros

### Configuracoes
1. **Usuarios** - Gestao de acessos
2. **Permissoes** - Grupos e roles
3. **Contas Bancarias** - Contas para repasse
4. **Gateways** - Asaas, Stripe, etc
5. **Seguradoras** - Parceiros de seguro
6. **Marketplace** - Fornecedores de servicos
7. **Servicos** - Servicos da plataforma
8. **Integracoes** - APIs externas
9. **Carteiras Crypto** - Wallets blockchain
10. **WhatsApp API** - Configuracao WhatsApp
11. **Omnichannel** - Central de atendimento
12. **Liquidez** - Pools de liquidez

### Operacional & IA
1. **Central de Comunicacao** - Chat unificado
2. **Disputas** - Mediacao de conflitos
3. **Vistorias** - Agendamento e execucao
4. **KYC Pendentes** - Validacao de identidade
5. **Processos** - Automacoes

---

# 4. MODELO DE NEGOCIO - SPLIT 85/5/5/5

## 4.1 Fluxo de Pagamento

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCATARIO PAGA R$ 3.500                      │
│                   (Boleto, PIX ou Cartao)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SMART CONTRACT                              │
│               (Divisao Automatica e Instantanea)                │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   LOCADOR 85%    │ │  SEGURADORA 5%   │ │  GARANTIDOR 5%   │
│   R$ 2.975,00    │ │    R$ 175,00     │ │    R$ 175,00     │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  PLATAFORMA 5%   │
                    │    R$ 175,00     │
                    │  (Nossa Receita) │
                    └──────────────────┘
```

## 4.2 Fontes de Receita da Plataforma

| Fonte | Percentual | Descricao |
|-------|------------|-----------|
| Taxa de Servico | 5% do aluguel | Receita principal |
| Comissao Seguradoras | 4-6% sobre premio | Conforme contrato |
| Marketplace | 7-12% sobre servicos | Vistorias, reformas |
| Antecipacao de Alugueis | 1-3% | Servico DeFi |
| Staking VBRz | Variavel | Taxas de transacao |

## 4.3 Repasse ao Proprietario

```
Valor Bruto do Aluguel:     R$ 3.500,00
(-) Taxa Plataforma 5%:     R$   175,00
(-) Seguradora 5%:          R$   175,00
(-) Garantidor 5%:          R$   175,00
─────────────────────────────────────────
Valor Liquido (85%):        R$ 2.975,00
```

---

# 5. INTEGRACOES BLOCKCHAIN

## 5.1 Contrato NFT de Locacao

Cada contrato de locacao e representado por um NFT que contem:

```solidity
struct RentalContract {
    uint256 tokenId;
    address tenant;          // Carteira do locatario
    address landlord;        // Carteira do proprietario
    address guarantor;       // Carteira do garantidor
    address insurer;         // Carteira da seguradora
    uint256 rentAmount;      // Valor do aluguel em wei
    uint256 startDate;       // Timestamp inicio
    uint256 endDate;         // Timestamp fim
    bytes32 propertyHash;    // Hash do imovel
    bytes32 entryInspection; // Hash vistoria entrada
    bytes32 exitInspection;  // Hash vistoria saida
    ContractStatus status;   // Status do contrato
}
```

## 5.2 Vistoria Digital Imutavel

```
1. Vistoriador captura fotos/videos
2. App gera hash SHA-256 de cada arquivo
3. Arquivos enviados ao IPFS
4. Hash do bundle registrado na blockchain
5. NFT atualizado com metadados
```

## 5.3 Multi-Sig para Disputas

Resolucao de disputas requer assinaturas de:
- 1/3: Administrador Vinculo.io
- 2/3: Seguradora Parceira
- 3/3: Parte interessada (Locador/Locatario)

---

# 6. TOKEN VBRz

## 6.1 Especificacoes

| Propriedade | Valor |
|-------------|-------|
| Nome | Vinculo Brasil Token |
| Simbolo | VBRz |
| Rede | Polygon |
| Padrao | ERC-20 |
| Supply Total | 100.000.000 VBRz |
| Decimals | 18 |

## 6.2 Distribuicao do Supply

| Categoria | Percentual | Quantidade |
|-----------|------------|------------|
| Circulante | 35% | 35.000.000 |
| Em Staking | 18% | 18.000.000 |
| Treasury | 25% | 25.000.000 |
| Equipe (vesting) | 15% | 15.000.000 |
| Parceiros | 5% | 5.000.000 |
| Queimados | 2% | 2.000.000 |

## 6.3 Utilidades do Token

1. **Cashback** - Recompensa em VBRz para usuarios
2. **Staking** - Rendimento passivo
3. **Governanca** - Votacao em propostas
4. **Descontos** - Reducao de taxas
5. **Colateral** - Garantia adicional

## 6.4 Dashboard VBRz

O sistema possui uma dashboard dedicada ao token com:

- **Visao Geral**: Preco, market cap, volume
- **Tokenomics**: Distribuicao detalhada do supply
- **Cashback**: Metricas do programa
- **Liquidez**: Pools e reservas

---

# 7. PROGRAMA DE CASHBACK

## 7.1 Categorias de Cashback

| Categoria | Taxa | Descricao |
|-----------|------|-----------|
| Pagamento de Aluguel | 3% | Cashback mensal |
| Indicacao de Inquilino | 50 VBRz | Por indicacao convertida |
| Indicacao de Proprietario | 100 VBRz | Por indicacao convertida |
| Marketplace | 5% | Sobre servicos contratados |
| Antecipacao de Aluguel | 2% | Sobre valor antecipado |
| Fidelidade Mensal | 1% | Bonus por constancia |

## 7.2 Niveis de Beneficio

| Nivel | Requisito | Multiplicador |
|-------|-----------|---------------|
| Bronze | 0-1000 VBRz | 1.0x |
| Prata | 1001-5000 VBRz | 1.25x |
| Ouro | 5001-20000 VBRz | 1.5x |
| Platina | 20001-50000 VBRz | 1.75x |
| Diamante | 50001+ VBRz | 2.0x |

## 7.3 Regras de Distribuicao

```typescript
interface CashbackRule {
  id: string;
  name: string;
  category: CashbackCategory;
  percentage: number;
  fixedAmount?: number;
  maxAmount?: number;
  minTransaction?: number;
  userTypes: UserType[];
  isActive: boolean;
}
```

---

# 8. MODULO FINANCEIRO

## 8.1 Abas do Modulo

O modulo financeiro possui 8 abas:

| Aba | Funcionalidade |
|-----|----------------|
| Alugueis | Gestao de recebimentos |
| A Receber | Contas a receber |
| A Pagar | Contas a pagar |
| Fornecedores | Cadastro de fornecedores |
| Colaboradores | Folha de pagamento |
| Categorias | Tipos de despesa/receita |
| Cashback | Administracao do programa |
| DRE | Demonstrativo de resultados |

## 8.2 Estrutura DRE

```
DEMONSTRATIVO DE RESULTADOS - Vinculo.io

(+) RECEITA BRUTA DE ALUGUEIS
    Total de alugueis processados

(-) REPASSES
    - 85% Locadores
    - 5% Seguradoras
    - 5% Garantidores

(=) RECEITA LIQUIDA DA PLATAFORMA
    5% dos alugueis processados

(+) OUTRAS RECEITAS
    - Comissao Seguradoras (XX%)
    - Marketplace
    - Antecipacao

(-) DESPESAS OPERACIONAIS
    - Infraestrutura
    - Pessoal
    - Marketing
    - Gateways

(=) LUCRO OPERACIONAL

(-) IMPOSTOS
    - Simples Nacional / Lucro Presumido

(=) LUCRO LIQUIDO
```

## 8.3 Fluxo de Caixa

Categorias de movimentacao:
- **Entradas**: Alugueis, Comissoes, Marketplace
- **Saidas**: Repasses, Fornecedores, Taxas, Pessoal

---

# 9. CRM E ENGAGE

## 9.1 CRM - Pipeline de Vendas

O CRM utiliza metodologia Kanban com estagios:

```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│   LEADS    │→ │ QUALIFICADO│→ │  PROPOSTA  │→ │  FECHADO   │
│            │  │            │  │            │  │            │
│ Novos      │  │ Interesse  │  │ Negociando │  │ Contrato   │
│ contatos   │  │ confirmado │  │ valores    │  │ assinado   │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
```

## 9.2 Engage - Automacao de Marketing

Funcionalidades:
- **Campanhas de Email**: Templates personalizados
- **Segmentacao de Audiencia**: Filtros avancados
- **Automacoes**: Trigger-based workflows
- **Analytics**: Metricas de engajamento
- **SMTP Config**: Integracao com provedores

---

# 10. OMNICHANNEL E IA

## 10.1 Canais Suportados

| Canal | Status | Integracao |
|-------|--------|------------|
| WhatsApp | Ativo | Business API |
| Instagram | Ativo | Graph API |
| WebChat | Ativo | Socket.io |
| Email | Ativo | SMTP |
| SMS | Planejado | - |

## 10.2 Agentes de IA (Vini)

| Agente | Departamento | Tom |
|--------|--------------|-----|
| Vini Financeiro | Pagamentos | Profissional |
| Vini Suporte | Atendimento | Amigavel |
| Vini Disputas | Mediacao | Formal |
| Vini Comercial | Vendas | Entusiasmado |

## 10.3 Regras de Handoff

Transferencia automatica para humano quando:
- Cliente solicita explicitamente
- Valor da disputa > R$ 5.000
- Mencao a processo judicial
- 3 mensagens sem resolucao
- Problemas tecnicos

## 10.4 Base de Conhecimento

A IA utiliza documentos estruturados:
- Manual do Protocolo
- FAQ Rapido
- Scripts de Atendimento
- Processos Operacionais

---

# 11. SEGURANCA E COMPLIANCE

## 11.1 Autenticacao

- JWT com refresh tokens
- 2FA opcional (TOTP)
- Sessoes com timeout
- Login por carteira (Web3)

## 11.2 Permissoes (RBAC)

| Grupo | Descricao | Acesso |
|-------|-----------|--------|
| Super Admin | Acesso total | * |
| Financeiro | Modulo financeiro | reports.*, config.gateways |
| Suporte | Atendimento | tasks.*, disputes.* |
| Comercial | Vendas | contracts.*, properties.* |
| Seguradora | Portal | insurer_portal.* |

## 11.3 Compliance

- **LGPD**: Dados pessoais protegidos
- **KYC**: Validacao de identidade
- **AML**: Prevencao a lavagem
- **DIMOB**: Declaracao a Receita Federal

## 11.4 Auditoria

Todas as acoes sao registradas:
- Usuario
- Timestamp
- Acao
- Dados anteriores
- Dados novos
- IP de origem

---

# 12. APIS E WEBHOOKS

## 12.1 Gateways de Pagamento

### Asaas
```typescript
interface AsaasConfig {
  apiKey: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
  supportedMethods: ('pix' | 'boleto' | 'credit_card')[];
}
```

### Stripe
```typescript
interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  environment: 'test' | 'live';
}
```

## 12.2 Webhooks Recebidos

| Evento | Acao |
|--------|------|
| payment.confirmed | Executa split automatico |
| payment.failed | Notifica partes |
| subscription.renewed | Atualiza status |
| dispute.opened | Cria ticket |

## 12.3 Blockchain Events

```typescript
// Eventos monitorados
ContractCreated(tokenId, tenant, landlord)
RentPaid(contractId, amount, timestamp)
DisputeOpened(contractId, reason)
DisputeResolved(contractId, outcome)
InspectionRegistered(contractId, hash)
```

---

# 13. ESTRUTURA DE DADOS

## 13.1 Entidades Principais

### Contrato
```typescript
interface Contract {
  id: string;
  nftTokenId: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  guarantorId?: string;
  insurerId: string;
  rentAmount: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'pending' | 'expired' | 'terminated';
  paymentStatus: 'current' | 'late' | 'defaulted';
  blockchainHash: string;
}
```

### Imovel
```typescript
interface Property {
  id: string;
  nftTokenId?: string;
  address: string;
  propertyType: 'apartment' | 'house' | 'commercial' | 'land';
  bedrooms: number;
  bathrooms: number;
  area: number;
  rentAmount: number;
  ownerId: string;
  status: 'available' | 'rented' | 'maintenance';
  tokenizedValue?: number;
}
```

### Usuario (Locatario)
```typescript
interface Tenant {
  id: string;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  creditScore: number;
  trustScore: number;
  kycStatus: 'pending' | 'approved' | 'rejected';
  walletAddress?: string;
}
```

### Garantidor
```typescript
interface Guarantor {
  id: string;
  fullName: string;
  collateralPropertyId: string;
  collateralValue: number;
  tokenizedValue: number;
  ltv: number;
  monthlyCommission: number;
  fidelityLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  yieldStackingEnabled: boolean;
}
```

---

# 14. GUIA DE DEPLOY

## 14.1 Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 15+
- Redis 7+

## 14.2 Variaveis de Ambiente

```env
# App
VITE_APP_URL=https://app.vinculo.io
VITE_API_URL=https://api.vinculo.io

# Database
DATABASE_URL=postgresql://...

# Blockchain
VITE_POLYGON_RPC=https://polygon-rpc.com
VITE_CONTRACT_ADDRESS=0x...

# Payments
ASAAS_API_KEY=...
STRIPE_SECRET_KEY=...

# WhatsApp
WHATSAPP_TOKEN=...
WHATSAPP_VERIFY_TOKEN=...
```

## 14.3 Comandos

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Validacao
npm run check:safe

# Testes
npm run test
```

## 14.4 Estrutura de Deploy

```
┌─────────────────────────────────────────────────────────┐
│                     CLOUDFLARE                          │
│                   (CDN + WAF + DNS)                     │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  VERCEL/NETLIFY  │ │   API SERVER     │ │   BLOCKCHAIN     │
│  (Frontend SPA)  │ │  (Node + Express)│ │  (Polygon/Base)  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   POSTGRESQL     │ │      REDIS       │ │      IPFS        │
│   (Database)     │ │     (Cache)      │ │   (Arquivos)     │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

# CHANGELOG

## v2.0.0 (Janeiro 2026)
- Dashboard VBRz Token completa
- Aba Cashback no modulo Financeiro
- Reorganizacao do menu principal
- Dashboards Consultivas
- Integracao Omnichannel

## v1.5.0 (Dezembro 2025)
- Modulo Financeiro integrado (8 abas)
- CRM com Kanban
- Engage (Automacao de Marketing)

## v1.0.0 (Outubro 2025)
- Lancamento inicial
- Dashboard Admin
- Contratos NFT
- Split automatico 85/5/5/5

---

# CONTATO

**Equipe Tecnica Vinculo.io**
- Email: dev@vinculo.io
- Documentacao: docs.vinculo.io
- GitHub: github.com/vinculo-io

---

*Documento gerado automaticamente pelo sistema Vinculo.io*
*Versao: 2.0.0 | Data: Janeiro 2026*
