# VÍNCULO BRASIL - DOCUMENTAÇÃO TÉCNICA EM ÁRVORE
## Versão 2.0.0 | Build 2025.01.23

```
================================================================================
                        ÁRVORE COMPLETA DO SISTEMA
================================================================================
```

---

# ESTRUTURA DE DIRETÓRIOS

```
/home/user/vite-template/
│
├── src/
│   ├── routes/                          # ROTAS (TanStack Router)
│   │   ├── admin/                       # Área Administrativa
│   │   ├── agency/                      # Área da Imobiliária
│   │   ├── tenant/                      # Área do Inquilino
│   │   ├── investor/                    # Área do Investidor
│   │   ├── landlord/                    # Área do Proprietário
│   │   ├── garantidor/                  # Área do Garantidor
│   │   ├── auth/                        # Autenticação
│   │   ├── assets/                      # Assets/Ativos
│   │   └── imob/                        # Sites de Imobiliárias
│   │
│   ├── components/                      # COMPONENTES
│   │   ├── admin/                       # Componentes Admin
│   │   ├── agency/                      # Componentes Imobiliária
│   │   ├── crm/                         # CRM e Kanban
│   │   ├── dashboards/                  # Dashboards
│   │   ├── defi/                        # DeFi/Blockchain
│   │   ├── engage/                      # Marketing Automation
│   │   ├── engine/                      # Engine de Anúncios
│   │   ├── financeiro/                  # Formulários Financeiros
│   │   ├── inspection/                  # Vistoria
│   │   ├── layouts/                     # Layouts
│   │   ├── marketplace/                 # Marketplace
│   │   ├── omnichannel/                 # Omnichannel
│   │   ├── owner/                       # Proprietário
│   │   ├── setup/                       # Setup Wizard
│   │   ├── sites/                       # Sites Públicos
│   │   ├── legal/                       # Legal/Termos
│   │   ├── landing/                     # Landing Pages
│   │   └── ui/                          # UI Components (shadcn)
│   │
│   ├── hooks/                           # React Hooks
│   ├── lib/                             # Utilitários
│   ├── store/                           # Estado Global
│   └── types/                           # TypeScript Types
│
├── server/                              # BACKEND
│   ├── src/
│   │   ├── routes/                      # API Routes
│   │   ├── controllers/                 # Controllers
│   │   ├── services/                    # Services
│   │   ├── middleware/                  # Middlewares
│   │   └── lib/                         # Libs (Prisma, Redis, etc)
│   └── prisma/                          # Database Schema
│
├── contracts/                           # SMART CONTRACTS
│   └── src/                             # Solidity Contracts
│
└── public/                              # ARQUIVOS PÚBLICOS
    └── docs/                            # Documentação
```

---

# ÁRVORE DE ROTAS COMPLETA

```
ROTAS DO SISTEMA
│
├── / ................................................ Homepage
│   └── Componente: HomepagePlaceholder
│       └── Dependências: Button, Card
│
├── /auth/ ........................................... AUTENTICAÇÃO
│   ├── /login ....................................... Login
│   │   └── Componente: LoginPage
│   │       ├── Dependências: Button, Input, Form, Card
│   │       └── API: POST /api/auth/login
│   │
│   └── /register-superhost .......................... Registro Superhost
│       └── Componente: RegisterSuperhostPage
│           ├── Dependências: Button, Input, Form, Card, Select
│           └── API: POST /api/auth/register
│
├── /admin/ .......................................... ÁREA ADMIN (Super Admin)
│   │
│   ├── /dashboard ................................... Dashboard Principal
│   │   ├── Componente: OverviewDashboard
│   │   ├── Layout: AdminLayout
│   │   └── Dependências:
│   │       ├── Card, CardContent, CardHeader
│   │       ├── Badge
│   │       ├── Tabs, TabsList, TabsTrigger, TabsContent
│   │       └── Lucide Icons
│   │
│   ├── /properties .................................. Gestão de Imóveis
│   │   ├── Componente: PropertiesPage
│   │   ├── Layout: AdminLayout
│   │   ├── Dependências:
│   │   │   ├── Card, Badge, Button, Input
│   │   │   ├── Table, TableHeader, TableBody, TableRow, TableCell
│   │   │   ├── Tabs
│   │   │   └── Lucide Icons (Home, Plus, Search, Filter, etc)
│   │   ├── API:
│   │   │   ├── GET /api/properties
│   │   │   ├── POST /api/properties
│   │   │   ├── PUT /api/properties/:id
│   │   │   └── DELETE /api/properties/:id
│   │   └── Campos do Formulário:
│   │       ├── code (string) - Código do imóvel
│   │       ├── title (string) - Título
│   │       ├── address (string) - Endereço completo
│   │       ├── city (string) - Cidade
│   │       ├── type (enum) - Tipo (Apartamento, Casa, Kitnet, etc)
│   │       ├── bedrooms (number) - Quartos
│   │       ├── bathrooms (number) - Banheiros
│   │       ├── parking (number) - Vagas
│   │       ├── area (number) - Área em m²
│   │       ├── rentValue (number) - Valor do aluguel
│   │       ├── status (enum) - Status (available, rented, maintenance)
│   │       └── ownerId (string) - ID do proprietário
│   │
│   ├── /contracts ................................... Gestão de Contratos
│   │   ├── Componente: ContractsPage
│   │   ├── Layout: AdminLayout
│   │   ├── Dependências:
│   │   │   ├── Card, Badge, Button, Input
│   │   │   ├── Table, TableHeader, TableBody, TableRow, TableCell
│   │   │   ├── Tabs
│   │   │   └── Lucide Icons (FileText, Calendar, DollarSign, etc)
│   │   ├── API:
│   │   │   ├── GET /api/contracts
│   │   │   ├── POST /api/contracts
│   │   │   ├── PUT /api/contracts/:id
│   │   │   └── DELETE /api/contracts/:id
│   │   └── Campos do Formulário:
│   │       ├── code (string) - Código do contrato
│   │       ├── propertyId (string) - ID do imóvel
│   │       ├── tenantId (string) - ID do inquilino
│   │       ├── landlordId (string) - ID do proprietário
│   │       ├── startDate (date) - Data início
│   │       ├── endDate (date) - Data fim
│   │       ├── rentValue (number) - Valor do aluguel
│   │       ├── status (enum) - Status (active, expiring, terminated)
│   │       └── paymentStatus (enum) - Status pgto (paid, pending, overdue)
│   │
│   ├── /agencies .................................... Gestão de Imobiliárias
│   │   ├── Componente: AgencyModule
│   │   ├── Layout: AdminLayout
│   │   ├── Sub-componentes:
│   │   │   ├── AgencyList
│   │   │   ├── AgencyForm
│   │   │   └── AgencySiteConfigModal
│   │   ├── Dependências:
│   │   │   ├── Card, Badge, Button, Input, Dialog
│   │   │   ├── Table
│   │   │   └── Lucide Icons
│   │   ├── API:
│   │   │   ├── GET /api/agencies
│   │   │   ├── POST /api/agencies
│   │   │   ├── PUT /api/agencies/:id
│   │   │   ├── PATCH /api/agencies/:id/config
│   │   │   └── DELETE /api/agencies/:id
│   │   └── Campos do Formulário:
│   │       ├── name (string) - Nome da imobiliária
│   │       ├── slug (string) - Slug URL
│   │       ├── cnpj (string) - CNPJ
│   │       ├── adminName (string) - Nome do admin
│   │       ├── adminEmail (string) - Email do admin
│   │       ├── adminPassword (string) - Senha do admin
│   │       ├── domain (string) - Domínio customizado
│   │       ├── primaryColor (string) - Cor primária
│   │       └── logo (file) - Logo
│   │
│   ├── /users ....................................... Gestão de Usuários
│   │   ├── Componente: UsersPage
│   │   ├── Layout: AdminLayout
│   │   ├── Query Params:
│   │   │   ├── ?type=tenant - Filtrar inquilinos
│   │   │   ├── ?type=landlord - Filtrar proprietários
│   │   │   └── ?type=guarantor - Filtrar garantidores
│   │   ├── Dependências:
│   │   │   ├── Card, Badge, Button, Input
│   │   │   ├── Table, Avatar
│   │   │   ├── Tabs
│   │   │   └── Lucide Icons
│   │   ├── API:
│   │   │   ├── GET /api/users
│   │   │   ├── GET /api/users?type=tenant
│   │   │   ├── GET /api/users?type=landlord
│   │   │   ├── GET /api/users?type=guarantor
│   │   │   ├── POST /api/users
│   │   │   ├── PUT /api/users/:id
│   │   │   └── DELETE /api/users/:id
│   │   └── Campos do Formulário:
│   │       ├── name (string) - Nome completo
│   │       ├── email (string) - Email
│   │       ├── phone (string) - Telefone
│   │       ├── cpf (string) - CPF
│   │       ├── type (enum) - Tipo (tenant, landlord, guarantor, admin)
│   │       └── status (enum) - Status (active, pending, inactive)
│   │
│   ├── /crm-live .................................... CRM Live (Kanban + Chat)
│   │   ├── Componente: CRMLive
│   │   ├── Layout: AdminLayout
│   │   ├── Sub-componentes:
│   │   │   ├── CompactColumn
│   │   │   ├── MiniDealCard
│   │   │   └── ChatPanel
│   │   ├── Dependências:
│   │   │   ├── @hello-pangea/dnd (DragDropContext, Droppable, Draggable)
│   │   │   ├── ResizablePanel, ResizableHandle
│   │   │   ├── ScrollArea
│   │   │   ├── Card, Badge, Button, Avatar
│   │   │   ├── Textarea
│   │   │   └── Lucide Icons
│   │   ├── Store: useCRMStore (Zustand)
│   │   ├── API:
│   │   │   ├── GET /api/pipelines
│   │   │   ├── GET /api/deals
│   │   │   ├── PUT /api/deals/:id/stage
│   │   │   └── GET /api/tickets/:id
│   │   └── Tipos:
│   │       ├── Lead (interface)
│   │       │   ├── id, name, email, phone
│   │       │   ├── source, status, score
│   │       │   ├── lastConversationId (integração Hub)
│   │       │   ├── activeEngageCampaignId (integração Engage)
│   │       │   └── engageStatus
│   │       └── Deal (interface)
│   │           ├── id, title, valorTotal, priority
│   │           ├── stageId, pipelineId, leadId
│   │           └── activityCount
│   │
│   ├── /communication ............................... Central de Mensagens
│   │   ├── Componente: CommunicationHub
│   │   ├── Layout: AdminLayout
│   │   ├── Dependências:
│   │   │   ├── Tabs, Card, Badge, Button
│   │   │   ├── ScrollArea, Avatar
│   │   │   └── Lucide Icons
│   │   ├── Hooks: useTickets, useTicket, useSendMessage
│   │   └── API:
│   │       ├── GET /api/tickets
│   │       ├── GET /api/tickets/:id
│   │       ├── POST /api/tickets/:id/messages
│   │       └── PUT /api/tickets/:id/status
│   │
│   ├── /engage ...................................... Marketing Automation
│   │   ├── Componente: EngageDashboard
│   │   ├── Layout: AdminLayout
│   │   ├── Sub-componentes:
│   │   │   ├── CampaignWizard
│   │   │   ├── AudienceBuilder
│   │   │   └── TemplateEditor
│   │   ├── Dependências:
│   │   │   ├── Card, Badge, Button, Tabs
│   │   │   ├── Form (react-hook-form)
│   │   │   └── Lucide Icons
│   │   ├── API:
│   │   │   ├── GET /api/campaigns
│   │   │   ├── POST /api/campaigns
│   │   │   ├── PUT /api/campaigns/:id
│   │   │   └── POST /api/campaigns/:id/send
│   │   └── Tipos:
│   │       ├── Campaign
│   │       │   ├── id, name, type, status
│   │       │   ├── templateId, audienceId
│   │       │   └── scheduledAt, sentAt
│   │       └── TriggerType (enum)
│   │           ├── manual, birthday, due_date_reminder
│   │           ├── onboarding_day_1/3/7
│   │           ├── contract_signed, payment_received/overdue
│   │           └── crm_lead_created, crm_stage_changed, etc
│   │
│   ├── /flow-builder ................................ Flow Builder (IA)
│   │   ├── Componente: FlowBuilder
│   │   ├── Layout: AdminLayout
│   │   ├── Sub-componentes:
│   │   │   ├── FlowBuilderSidebar
│   │   │   ├── PropertiesPanel
│   │   │   └── BaseNode
│   │   ├── Dependências:
│   │   │   ├── ReactFlow
│   │   │   ├── Card, Button
│   │   │   └── Lucide Icons
│   │   └── API:
│   │       ├── GET /api/flows
│   │       ├── POST /api/flows
│   │       └── PUT /api/flows/:id
│   │
│   ├── /ads ......................................... Engine de Anúncios
│   │   ├── Componente: AdsPage
│   │   ├── Layout: AdminLayout
│   │   ├── Dependências:
│   │   │   ├── Card, Badge, Button, Tabs
│   │   │   └── Lucide Icons (Megaphone, Facebook, Instagram)
│   │   └── API:
│   │       ├── GET /api/ad-campaigns
│   │       ├── POST /api/ad-campaigns
│   │       └── PUT /api/ad-campaigns/:id
│   │
│   ├── /investments ................................. Gestão de Investimentos
│   │   ├── Componente: InvestmentsDashboard
│   │   ├── Layout: AdminLayout
│   │   ├── Sub-componentes:
│   │   │   └── InvestmentOrdersTable
│   │   ├── Dependências:
│   │   │   ├── Card, Badge, Button, Table
│   │   │   └── Lucide Icons
│   │   └── API:
│   │       ├── GET /api/investments
│   │       ├── GET /api/investment-orders
│   │       └── PUT /api/investment-orders/:id/status
│   │
│   ├── /marketplace ................................. Marketplace Admin
│   │   ├── Componente: MarketplaceDashboard
│   │   ├── Layout: AdminLayout
│   │   └── API: GET /api/marketplace
│   │
│   ├── /financeiro .................................. Relatórios Financeiros
│   │   ├── Componente: FinanceiroPage
│   │   ├── Layout: AdminLayout
│   │   ├── Sub-componentes:
│   │   │   ├── DREReport
│   │   │   ├── ContasReceberForm
│   │   │   ├── ContasPagarForm
│   │   │   ├── AlugueisReceberForm
│   │   │   ├── ColaboradoresForm
│   │   │   ├── FornecedoresForm
│   │   │   ├── TiposReceitaForm
│   │   │   └── TiposDespesaForm
│   │   ├── Dependências:
│   │   │   ├── Card, Tabs, Table
│   │   │   ├── Form (react-hook-form)
│   │   │   └── Chart (recharts)
│   │   └── API:
│   │       ├── GET /api/finance/dre
│   │       ├── GET /api/finance/receivables
│   │       ├── GET /api/finance/payables
│   │       └── POST /api/finance/transactions
│   │
│   ├── /analytics ................................... Analytics
│   │   ├── Componente: AnalyticsPage
│   │   ├── Layout: AdminLayout
│   │   ├── Dependências:
│   │   │   ├── Card, Badge, Tabs
│   │   │   └── Lucide Icons
│   │   └── API: GET /api/analytics
│   │
│   ├── /auditoria ................................... Auditoria Blockchain
│   │   ├── Componente: AuditoriaPage
│   │   ├── Layout: AdminLayout
│   │   ├── Sub-componentes:
│   │   │   └── BlockchainTransactionFeed
│   │   └── API: GET /api/blockchain/transactions
│   │
│   ├── /omnichannel ................................. Config Omnichannel
│   │   ├── Componente: OmnichannelConfig
│   │   ├── Layout: AdminLayout
│   │   ├── Sub-componentes:
│   │   │   ├── DepartmentAdmin
│   │   │   └── AgentInbox
│   │   ├── Dependências:
│   │   │   ├── Card, Tabs, Form, Switch
│   │   │   └── Lucide Icons
│   │   └── Campos de Configuração:
│   │       ├── whatsappToken (string)
│   │       ├── whatsappPhoneId (string)
│   │       ├── emailServer (string)
│   │       ├── emailPort (number)
│   │       ├── emailUser (string)
│   │       └── webhookUrl (string)
│   │
│   ├── /integrations ................................ Integrações
│   │   ├── Componente: IntegrationsPage
│   │   ├── Layout: AdminLayout
│   │   └── Campos:
│   │       ├── asaasApiKey (string) - Asaas
│   │       ├── evoApiKey (string) - Evolution API
│   │       ├── metaAccessToken (string) - Meta/Facebook
│   │       ├── googleAdsId (string) - Google Ads
│   │       └── infuraProjectId (string) - Blockchain
│   │
│   ├── /smtp ........................................ Config SMTP
│   │   ├── Componente: SmtpConfigList
│   │   ├── Layout: AdminLayout
│   │   └── Campos:
│   │       ├── host (string)
│   │       ├── port (number)
│   │       ├── user (string)
│   │       ├── password (string)
│   │       ├── fromEmail (string)
│   │       └── fromName (string)
│   │
│   ├── /settings .................................... Configurações Gerais
│   │   ├── Componente: SettingsPage
│   │   ├── Layout: AdminLayout
│   │   └── Campos:
│   │       ├── systemName (string)
│   │       ├── defaultCurrency (string)
│   │       ├── timezone (string)
│   │       └── maintenanceMode (boolean)
│   │
│   ├── /about ....................................... Sobre o Sistema
│   │   ├── Componente: AboutPage
│   │   └── Layout: AdminLayout
│   │
│   └── /github ...................................... Integração GitHub
│       ├── Componente: GithubPage
│       └── Layout: AdminLayout
│
├── /agency/ ......................................... ÁREA IMOBILIÁRIA
│   │
│   ├── /dashboard ................................... Dashboard Imobiliária
│   │   ├── Componente: AgencyDashboard
│   │   ├── Layout: AgencyLayout
│   │   └── API: GET /api/agency/dashboard
│   │
│   ├── /properties .................................. Imóveis da Imobiliária
│   │   ├── /index ................................... Lista de Imóveis
│   │   │   └── Componente: AgencyPropertiesPage
│   │   └── /new ..................................... Novo Imóvel
│   │       └── Componente: NewPropertyPage
│   │
│   ├── /contracts ................................... Contratos
│   │   └── Componente: AgencyContractsPage
│   │
│   ├── /owners ...................................... Proprietários
│   │   └── Componente: OwnersPage
│   │
│   ├── /ads ......................................... Anúncios
│   │   ├── Componente: AgencyAdsPage
│   │   └── Sub: AgencyAdsWidget
│   │
│   ├── /financial ................................... Financeiro
│   │   └── Componente: AgencyFinancialPage
│   │
│   ├── /split-calculator ............................ Calculadora Split
│   │   └── Componente: SplitCalculatorPage
│   │
│   ├── /settings .................................... Configurações
│   │   └── Componente: AgencySettingsPage
│   │
│   ├── /setup ....................................... Setup Wizard
│   │   └── Componente: SetupWizard
│   │
│   ├── /welcome ..................................... Boas-vindas
│   │   └── Componente: WelcomePage
│   │
│   ├── /site ........................................ Gerenciador do Site
│   │   └── Componente: SiteManagerPage
│   │
│   └── /support ..................................... Suporte
│       └── Componente: SupportPage
│
├── /tenant/ ......................................... ÁREA DO INQUILINO
│   │
│   ├── /dashboard ................................... Dashboard
│   │   ├── Componente: TenantDashboard
│   │   └── Layout: TenantLayout
│   │
│   ├── /journey ..................................... Jornada de Locação
│   │   └── Componente: JourneyPage
│   │
│   ├── /contract .................................... Meu Contrato
│   │   └── Componente: ContractPage
│   │
│   ├── /payments .................................... Meus Pagamentos
│   │   └── Componente: PaymentsPage
│   │
│   └── /profile ..................................... Meu Perfil
│       └── Componente: ProfilePage
│
├── /investor/ ....................................... ÁREA DO INVESTIDOR
│   │
│   └── /marketplace ................................. Marketplace
│       ├── Componente: InvestorMarketplacePage
│       └── Sub: CVMInvestorDashboard
│
├── /landlord/ ....................................... ÁREA DO PROPRIETÁRIO
│   │
│   └── /my-contracts ................................ Meus Contratos
│       ├── Componente: MyContractsPage
│       └── Sub: AnticipationModal
│
├── /garantidor/ ..................................... ÁREA DO GARANTIDOR
│   │
│   ├── /area ........................................ Área Principal
│   │   └── Componente: GarantidorAreaPage
│   │
│   └── /termo ....................................... Termo de Garantia
│       └── Componente: TermoPage
│
├── /imob/$slug ...................................... SITE DA IMOBILIÁRIA
│   ├── Componente: AgencyPublicSite
│   ├── Params: $slug (dinâmico)
│   └── Sub: PropertyDetailsPage
│
├── /p2p ............................................. MARKETPLACE P2P
│   ├── Componente: P2PMarketplace
│   └── API: GET /api/p2p/listings
│
├── /marketplace ..................................... MARKETPLACE SEGUROS
│   ├── Componente: MarketplacePage
│   └── API: GET /api/marketplace/insurance
│
├── /simulador ....................................... SIMULADOR
│   ├── Componente: SimuladorPage
│   └── Campos:
│       ├── rentValue (number)
│       ├── duration (number)
│       └── guaranteeType (enum)
│
├── /verificar ....................................... VERIFICAR CONTRATO
│   ├── Componente: VerificarPage
│   └── API: GET /api/contracts/verify/:hash
│
├── /setup ........................................... SETUP INICIAL
│   └── Componente: SetupPage
│
├── /clube-vbrz ...................................... CLUBE VBRZ
│   ├── Componente: ClubeVBRZPage
│   └── Sub: CashbackAdminDashboard
│
├── /inquilinos ...................................... LANDING INQUILINOS
│   └── Componente: InquilinosPage
│
├── /garantidores .................................... LANDING GARANTIDORES
│   └── Componente: GarantidoresPage
│
├── /investidor ...................................... LANDING INVESTIDORES
│   └── Componente: InvestidorPage
│
└── /assets/ ......................................... GESTÃO DE ASSETS
    ├── /new ......................................... Novo Asset
    ├── /pending ..................................... Pendentes
    └── /success ..................................... Sucesso
```

---

# ÁRVORE DE COMPONENTES POR MÓDULO

```
COMPONENTES DO SISTEMA
│
├── 📁 LAYOUTS
│   ├── AdminLayout.tsx
│   │   ├── Dependências: VinculoBrasilLogo, Button, Avatar, Separator
│   │   ├── Hooks: useState, useLocation
│   │   ├── Icons: 20+ icons do lucide-react
│   │   └── Seções do Menu:
│   │       ├── Gestão Operacional (Dashboard, Imóveis, Contratos, Imobiliárias)
│   │       ├── Pessoas (Inquilinos, Proprietários, Garantidores, Usuários)
│   │       ├── Mesa de Operações (CRM Live, Comunicação)
│   │       ├── Cérebro/Automação (Engage, Flow Builder, Ads)
│   │       ├── DeFi/Investimentos (Investimentos, P2P)
│   │       ├── Relatórios (Financeiro, Analytics, Auditoria)
│   │       └── Configurações (Omnichannel, Integrações, SMTP, Settings)
│   │
│   ├── AgencyLayout.tsx
│   │   └── Dependências: Similar ao AdminLayout
│   │
│   └── TenantLayout.tsx
│       └── Dependências: Similar ao AdminLayout
│
├── 📁 CRM
│   ├── crm-live.tsx
│   │   ├── Imports:
│   │   │   ├── @hello-pangea/dnd (DragDropContext, Droppable, Draggable)
│   │   │   ├── ResizablePanel, ResizableHandle (ui/resizable)
│   │   │   ├── Card, Badge, Button, Avatar, Textarea
│   │   │   └── ScrollArea, Alert, Tooltip
│   │   ├── Hooks: useCRMStore, useTicket, useSendMessage
│   │   ├── Sub-componentes internos:
│   │   │   ├── MiniDealCard
│   │   │   ├── CompactColumn
│   │   │   └── ChatPanel
│   │   └── Tipos importados: Deal, Lead, KanbanColumn, Ticket, Message
│   │
│   ├── crm-dashboard.tsx
│   │   └── Dependências: Card, Tabs, Badge
│   │
│   └── kanban/
│       ├── kanban-board.tsx
│       │   └── Dependências: @hello-pangea/dnd, Card, Badge
│       └── deal-detail-modal.tsx
│           └── Dependências: Dialog, Form, Input, Select
│
├── 📁 ENGAGE (Marketing)
│   ├── engage-dashboard.tsx
│   │   ├── Dependências: Card, Tabs, Badge, Button
│   │   └── Sub-componentes: CampaignList, AnalyticsCards
│   │
│   ├── campaign-wizard.tsx
│   │   ├── Dependências: Dialog, Form, Input, Select, Textarea
│   │   └── Steps:
│   │       ├── 1. Configuração básica
│   │       ├── 2. Seleção de audiência
│   │       ├── 3. Template de mensagem
│   │       └── 4. Agendamento
│   │
│   ├── audience-builder.tsx
│   │   └── Dependências: Card, Checkbox, Select, Badge
│   │
│   ├── template-editor.tsx
│   │   └── Dependências: Textarea, Button, Preview
│   │
│   └── smtp-config.tsx
│       └── Dependências: Form, Input, Button, Card
│
├── 📁 ENGINE (Anúncios)
│   ├── ad-campaign-manager.tsx
│   │   └── Dependências: Card, Tabs, Badge, Table
│   └── index.tsx
│       └── Exports
│
├── 📁 OMNICHANNEL
│   ├── omnichannel-config.tsx
│   │   └── Dependências: Card, Tabs, Form, Switch
│   │
│   ├── flow-editor.tsx
│   │   └── Dependências: ReactFlow
│   │
│   ├── flow-builder/
│   │   ├── flow-builder.tsx
│   │   │   └── Dependências: ReactFlow, Zustand
│   │   ├── sidebar.tsx
│   │   ├── properties-panel.tsx
│   │   └── nodes/
│   │       ├── base-node.tsx
│   │       └── index.tsx
│   │
│   ├── agent-inbox.tsx
│   │   └── Dependências: Card, ScrollArea, Avatar
│   │
│   └── department-admin.tsx
│       └── Dependências: Card, Table, Form
│
├── 📁 FINANCEIRO
│   ├── dre-report.tsx
│   │   └── Dependências: Card, Table, Chart
│   │
│   ├── contas-receber-form.tsx
│   │   ├── Dependências: Form, Input, Select, DatePicker, Button
│   │   └── Campos:
│   │       ├── description (string)
│   │       ├── value (number)
│   │       ├── dueDate (date)
│   │       ├── category (select)
│   │       └── status (select)
│   │
│   ├── contas-pagar-form.tsx
│   │   ├── Dependências: Form, Input, Select, DatePicker, Button
│   │   └── Campos: Similar a contas-receber
│   │
│   ├── alugueis-receber-form.tsx
│   │   ├── Dependências: Form, Input, Select, Button
│   │   └── Campos:
│   │       ├── contractId (select)
│   │       ├── month (select)
│   │       ├── year (select)
│   │       ├── value (number)
│   │       └── status (select)
│   │
│   ├── colaboradores-form.tsx
│   │   └── Campos: name, email, role, salary, startDate
│   │
│   ├── fornecedores-form.tsx
│   │   └── Campos: name, cnpj, email, phone, category
│   │
│   ├── tipos-receita-form.tsx
│   │   └── Campos: name, code, description
│   │
│   ├── tipos-despesa-form.tsx
│   │   └── Campos: name, code, description
│   │
│   └── calculadora-aluguel.tsx
│       └── Campos: baseValue, adjustmentIndex, adjustmentDate
│
├── 📁 DEFI / BLOCKCHAIN
│   ├── rent-anticipation.tsx
│   │   ├── Dependências: Card, Form, Button, Dialog
│   │   └── Campos:
│   │       ├── contractId (select)
│   │       ├── months (number)
│   │       ├── discountRate (number)
│   │       └── walletAddress (string)
│   │
│   ├── nft-loans.tsx
│   │   └── Dependências: Card, Table, Button
│   │
│   └── contract-minting.tsx (raiz)
│       └── Dependências: ethers.js, Button, Progress
│
├── 📁 ADMIN/AGENCIES
│   ├── AgencyModule.tsx
│   │   ├── Sub-componentes:
│   │   │   ├── KPICards (Total, Online, Pendentes)
│   │   │   ├── CreateAgencyModal
│   │   │   └── AgencyTable
│   │   └── Estados: agencies[], isLoading, selectedAgency
│   │
│   ├── AgencyList.tsx
│   │   └── Dependências: Table, Badge, Button
│   │
│   ├── AgencyForm.tsx
│   │   └── Campos detalhados acima
│   │
│   └── AgencySiteConfigModal.tsx
│       └── Campos:
│           ├── domain (string)
│           ├── primaryColor (colorpicker)
│           ├── secondaryColor (colorpicker)
│           ├── logo (upload)
│           ├── favicon (upload)
│           └── customCss (textarea)
│
├── 📁 ADMIN/CASHBACK
│   ├── cashback-admin-dashboard.tsx
│   ├── cashback-analytics.tsx
│   ├── cashback-rules-panel.tsx
│   └── cashback-transactions-table.tsx
│
├── 📁 DASHBOARDS
│   ├── admin-dashboard.tsx
│   ├── tenant-dashboard.tsx
│   ├── landlord-dashboard.tsx
│   ├── guarantor-dashboard.tsx
│   ├── insurer-dashboard.tsx
│   ├── vbrz-dashboard.tsx
│   └── dashboards-consultivas.tsx
│
├── 📁 INSPECTION
│   ├── inspection-camera.tsx
│   │   └── Dependências: Camera API, Canvas
│   └── mint-nft-button.tsx
│       └── Dependências: ethers.js, Button, Spinner
│
├── 📁 MARKETPLACE
│   └── marketplace-dashboard.tsx
│       └── Dependências: Card, Grid, Filter
│
├── 📁 SITES
│   ├── AgencyPublicSite.tsx
│   │   └── Dependências: Card, Grid, Search
│   └── PropertyDetailsPage.tsx
│       └── Dependências: Carousel, Card, Badge
│
├── 📁 OWNER
│   └── AnticipationModal.tsx
│       ├── Dependências: Dialog, Form, Button
│       └── Campos:
│           ├── monthsToAnticipate (slider)
│           ├── discountRate (display)
│           └── netValue (display calculated)
│
├── 📁 SETUP
│   └── setup-wizard.tsx
│       └── Steps:
│           ├── 1. Informações básicas
│           ├── 2. Configuração financeira
│           ├── 3. Integrações
│           └── 4. Confirmação
│
├── 📁 LEGAL
│   └── TermoModal.tsx
│       └── Dependências: Dialog, Checkbox, Button
│
└── 📁 UI (shadcn/ui) - 40+ componentes
    ├── accordion.tsx
    ├── alert.tsx
    ├── alert-dialog.tsx
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── calendar.tsx
    ├── card.tsx
    ├── carousel.tsx
    ├── chart.tsx
    ├── checkbox.tsx
    ├── collapsible.tsx
    ├── command.tsx
    ├── context-menu.tsx
    ├── dialog.tsx
    ├── drawer.tsx
    ├── dropdown-menu.tsx
    ├── form.tsx
    ├── hover-card.tsx
    ├── input.tsx
    ├── input-otp.tsx
    ├── label.tsx
    ├── menubar.tsx
    ├── navigation-menu.tsx
    ├── pagination.tsx
    ├── popover.tsx
    ├── progress.tsx
    ├── radio-group.tsx
    ├── resizable.tsx
    ├── scroll-area.tsx
    ├── select.tsx
    ├── separator.tsx
    ├── sheet.tsx
    ├── sidebar.tsx
    ├── skeleton.tsx
    ├── slider.tsx
    ├── switch.tsx
    ├── table.tsx
    ├── tabs.tsx
    ├── textarea.tsx
    ├── toast.tsx
    ├── toggle.tsx
    ├── tooltip.tsx
    └── ...
```

---

# ÁRVORE DE APIs (Backend)

```
API ROUTES (server/src/routes/)
│
├── /api/auth
│   ├── POST /login
│   ├── POST /register
│   ├── POST /logout
│   └── GET /me
│
├── /api/agencies
│   ├── GET / ........................... Lista imobiliárias
│   ├── POST / .......................... Cria imobiliária
│   ├── GET /:id ........................ Detalhe
│   ├── PUT /:id ........................ Atualiza
│   ├── PATCH /:id/config ............... Config do site
│   └── DELETE /:id ..................... Remove
│
├── /api/properties
│   ├── GET / ........................... Lista imóveis
│   ├── POST / .......................... Cria imóvel
│   ├── GET /:id ........................ Detalhe
│   ├── PUT /:id ........................ Atualiza
│   └── DELETE /:id ..................... Remove
│
├── /api/contracts
│   ├── GET / ........................... Lista contratos
│   ├── POST / .......................... Cria contrato
│   ├── GET /:id ........................ Detalhe
│   ├── PUT /:id ........................ Atualiza
│   ├── POST /:id/terminate ............. Encerra contrato
│   └── GET /verify/:hash ............... Verifica blockchain
│
├── /api/users
│   ├── GET / ........................... Lista usuários
│   ├── GET /?type=tenant ............... Filtra inquilinos
│   ├── GET /?type=landlord ............. Filtra proprietários
│   ├── GET /?type=guarantor ............ Filtra garantidores
│   ├── POST / .......................... Cria usuário
│   ├── GET /:id ........................ Detalhe
│   ├── PUT /:id ........................ Atualiza
│   └── DELETE /:id ..................... Remove
│
├── /api/deals
│   ├── GET / ........................... Lista deals
│   ├── POST / .......................... Cria deal
│   ├── PUT /:id ........................ Atualiza
│   └── PUT /:id/stage .................. Move no Kanban
│
├── /api/leads
│   ├── GET / ........................... Lista leads
│   ├── POST / .......................... Cria lead
│   ├── PUT /:id ........................ Atualiza
│   └── POST /ingest .................... Ingesta lead externo
│
├── /api/tickets
│   ├── GET / ........................... Lista tickets
│   ├── GET /:id ........................ Detalhe com mensagens
│   ├── POST / .......................... Cria ticket
│   ├── POST /:id/messages .............. Envia mensagem
│   └── PUT /:id/status ................. Atualiza status
│
├── /api/campaigns
│   ├── GET / ........................... Lista campanhas
│   ├── POST / .......................... Cria campanha
│   ├── PUT /:id ........................ Atualiza
│   ├── POST /:id/send .................. Dispara campanha
│   └── GET /:id/stats .................. Estatísticas
│
├── /api/finance
│   ├── GET /dre ........................ Relatório DRE
│   ├── GET /receivables ................ Contas a receber
│   ├── GET /payables ................... Contas a pagar
│   ├── POST /transactions .............. Nova transação
│   └── GET /dashboard .................. Dashboard financeiro
│
├── /api/payments
│   ├── GET / ........................... Lista pagamentos
│   ├── POST / .......................... Registra pagamento
│   └── POST /webhook ................... Webhook Asaas
│
├── /api/invest
│   ├── GET /opportunities .............. Oportunidades
│   ├── POST /order ..................... Nova ordem
│   └── GET /portfolio .................. Portfólio
│
├── /api/p2p
│   ├── GET /listings ................... Lista ofertas
│   ├── POST /offer ..................... Cria oferta
│   └── POST /match ..................... Match compra/venda
│
├── /api/marketplace
│   ├── GET / ........................... Lista produtos
│   └── GET /insurance .................. Seguros
│
├── /api/blockchain
│   ├── GET /transactions ............... Lista transações
│   ├── POST /mint ...................... Minta NFT
│   └── GET /verify/:hash ............... Verifica hash
│
├── /api/integrations
│   ├── GET / ........................... Lista integrações
│   ├── PUT /:provider .................. Atualiza config
│   └── POST /test ...................... Testa conexão
│
├── /api/webhooks
│   ├── POST /asaas ..................... Webhook Asaas
│   ├── POST /whatsapp .................. Webhook WhatsApp
│   └── POST /meta ...................... Webhook Meta
│
└── /api/setup
    ├── POST /initial ................... Setup inicial
    └── GET /status ..................... Status do sistema
```

---

# ÁRVORE DE BANCO DE DADOS

```
DATABASE SCHEMA (Prisma)
│
├── User
│   ├── id (String, UUID)
│   ├── email (String, unique)
│   ├── name (String)
│   ├── phone (String?)
│   ├── cpf (String?)
│   ├── role (UserRole enum)
│   ├── status (UserStatus enum)
│   ├── agencyId (String?, FK -> Agency)
│   ├── createdAt (DateTime)
│   └── updatedAt (DateTime)
│
├── Agency
│   ├── id (String, UUID)
│   ├── name (String)
│   ├── slug (String, unique)
│   ├── cnpj (String?)
│   ├── domain (String?)
│   ├── logo (String?)
│   ├── primaryColor (String?)
│   ├── status (AgencyStatus enum)
│   ├── createdAt (DateTime)
│   └── updatedAt (DateTime)
│
├── Property
│   ├── id (String, UUID)
│   ├── code (String, unique)
│   ├── title (String)
│   ├── address (String)
│   ├── city (String)
│   ├── type (PropertyType enum)
│   ├── bedrooms (Int)
│   ├── bathrooms (Int)
│   ├── parking (Int)
│   ├── area (Float)
│   ├── rentValue (Decimal)
│   ├── status (PropertyStatus enum)
│   ├── ownerId (String, FK -> User)
│   ├── agencyId (String, FK -> Agency)
│   ├── createdAt (DateTime)
│   └── updatedAt (DateTime)
│
├── Contract
│   ├── id (String, UUID)
│   ├── code (String, unique)
│   ├── propertyId (String, FK -> Property)
│   ├── tenantId (String, FK -> User)
│   ├── landlordId (String, FK -> User)
│   ├── guarantorId (String?, FK -> User)
│   ├── startDate (DateTime)
│   ├── endDate (DateTime)
│   ├── rentValue (Decimal)
│   ├── status (ContractStatus enum)
│   ├── blockchainHash (String?)
│   ├── nftTokenId (String?)
│   ├── createdAt (DateTime)
│   └── updatedAt (DateTime)
│
├── Lead
│   ├── id (String, UUID)
│   ├── name (String)
│   ├── email (String)
│   ├── phone (String?)
│   ├── source (LeadSource enum)
│   ├── status (LeadStatus enum)
│   ├── score (Int)
│   ├── lastConversationId (String?)
│   ├── activeEngageCampaignId (String?)
│   ├── engageStatus (EngageStatus enum?)
│   ├── agencyId (String, FK -> Agency)
│   ├── createdAt (DateTime)
│   └── updatedAt (DateTime)
│
├── Deal
│   ├── id (String, UUID)
│   ├── title (String)
│   ├── valorTotal (Decimal)
│   ├── priority (Priority enum)
│   ├── stageId (String, FK -> Stage)
│   ├── pipelineId (String, FK -> Pipeline)
│   ├── leadId (String, FK -> Lead)
│   ├── propertyId (String?, FK -> Property)
│   ├── createdAt (DateTime)
│   └── updatedAt (DateTime)
│
├── Pipeline
│   ├── id (String, UUID)
│   ├── name (String)
│   ├── agencyId (String, FK -> Agency)
│   └── stages (Stage[])
│
├── Stage
│   ├── id (String, UUID)
│   ├── name (String)
│   ├── color (String)
│   ├── order (Int)
│   └── pipelineId (String, FK -> Pipeline)
│
├── Ticket
│   ├── id (String, UUID)
│   ├── contactName (String)
│   ├── contactEmail (String?)
│   ├── contactPhone (String?)
│   ├── channel (Channel enum)
│   ├── status (TicketStatus enum)
│   ├── priority (Priority enum)
│   ├── agentId (String?, FK -> User)
│   ├── crmLeadId (String?)
│   ├── crmStage (String?)
│   ├── createdAt (DateTime)
│   └── messages (Message[])
│
├── Message
│   ├── id (String, UUID)
│   ├── content (String)
│   ├── senderType (SenderType enum)
│   ├── ticketId (String, FK -> Ticket)
│   └── createdAt (DateTime)
│
├── Campaign
│   ├── id (String, UUID)
│   ├── name (String)
│   ├── type (CampaignType enum)
│   ├── status (CampaignStatus enum)
│   ├── triggerType (TriggerType enum)
│   ├── templateId (String?)
│   ├── audienceId (String?)
│   ├── scheduledAt (DateTime?)
│   ├── sentAt (DateTime?)
│   └── agencyId (String, FK -> Agency)
│
├── Payment
│   ├── id (String, UUID)
│   ├── contractId (String, FK -> Contract)
│   ├── value (Decimal)
│   ├── dueDate (DateTime)
│   ├── paidAt (DateTime?)
│   ├── status (PaymentStatus enum)
│   ├── asaasId (String?)
│   └── pixCode (String?)
│
├── Investment
│   ├── id (String, UUID)
│   ├── contractId (String, FK -> Contract)
│   ├── investorId (String, FK -> User)
│   ├── value (Decimal)
│   ├── expectedReturn (Decimal)
│   ├── status (InvestmentStatus enum)
│   ├── tokenId (String?)
│   └── createdAt (DateTime)
│
├── Transaction (Blockchain)
│   ├── id (String, UUID)
│   ├── hash (String, unique)
│   ├── type (TransactionType enum)
│   ├── contractId (String?, FK -> Contract)
│   ├── fromAddress (String)
│   ├── toAddress (String)
│   ├── value (String)
│   ├── status (TxStatus enum)
│   └── createdAt (DateTime)
│
└── SystemConfig
    ├── id (String, UUID)
    ├── key (String, unique)
    ├── value (Json)
    └── updatedAt (DateTime)
```

---

# RESUMO QUANTITATIVO

```
================================================================================
                           RESUMO DO SISTEMA
================================================================================

ROTAS:
├── Admin (/admin/*) ................ 21 rotas
├── Imobiliária (/agency/*) ......... 13 rotas
├── Inquilino (/tenant/*) ........... 5 rotas
├── Investidor (/investor/*) ........ 2 rotas
├── Proprietário (/landlord/*) ...... 2 rotas
├── Garantidor (/garantidor/*) ...... 3 rotas
├── Públicas ........................ 12 rotas
└── Assets (/assets/*) .............. 4 rotas
                                     ─────────
TOTAL DE ROTAS ...................... 62 rotas

COMPONENTES:
├── Layouts ......................... 3
├── Dashboards ...................... 12
├── CRM ............................. 4
├── Engage/Marketing ................ 5
├── Engine/Anúncios ................. 2
├── Omnichannel ..................... 8
├── Financeiro ...................... 9
├── DeFi/Blockchain ................. 6
├── Admin/Agencies .................. 4
├── Cashback ........................ 4
├── Inspection ...................... 2
├── Sites ........................... 2
├── Marketplace ..................... 1
├── Setup ........................... 1
├── Legal ........................... 1
└── UI (shadcn) ..................... 40+
                                     ─────────
TOTAL DE COMPONENTES ................ 100+

APIs (Backend):
├── Auth ............................ 4 endpoints
├── Agencies ........................ 6 endpoints
├── Properties ...................... 5 endpoints
├── Contracts ....................... 6 endpoints
├── Users ........................... 8 endpoints
├── Deals/Leads ..................... 8 endpoints
├── Tickets ......................... 5 endpoints
├── Campaigns ....................... 5 endpoints
├── Finance ......................... 5 endpoints
├── Payments ........................ 3 endpoints
├── Invest .......................... 3 endpoints
├── P2P ............................. 3 endpoints
├── Marketplace ..................... 2 endpoints
├── Blockchain ...................... 3 endpoints
├── Integrations .................... 3 endpoints
├── Webhooks ........................ 3 endpoints
└── Setup ........................... 2 endpoints
                                     ─────────
TOTAL DE ENDPOINTS .................. 75+

TABELAS DO BANCO:
├── User
├── Agency
├── Property
├── Contract
├── Lead
├── Deal
├── Pipeline
├── Stage
├── Ticket
├── Message
├── Campaign
├── Payment
├── Investment
├── Transaction
└── SystemConfig
                                     ─────────
TOTAL DE TABELAS .................... 15 tabelas

================================================================================
```

---

*Documento gerado em 23/01/2026*
*Vínculo Brasil v2.0.0*
