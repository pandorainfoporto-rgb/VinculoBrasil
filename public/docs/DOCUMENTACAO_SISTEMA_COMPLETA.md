# DOCUMENTAÇÃO TÉCNICA COMPLETA - VÍNCULO BRASIL
## Versão 2.0.0 | Atualizado em: 23/01/2026

---

# 1. CHECKLIST COMPLETO DE PÁGINAS, FORMULÁRIOS E RELATÓRIOS

## 1.1 ROTAS ADMINISTRATIVAS (/admin/*)

### GESTÃO OPERACIONAL (O CORAÇÃO)

| Rota | Arquivo | Componente | Status | Descrição |
|------|---------|------------|--------|-----------|
| `/admin/dashboard` | `src/routes/admin/dashboard.tsx` | OverviewDashboard | ✅ OK | Dashboard principal com KPIs |
| `/admin/properties` | `src/routes/admin/properties.tsx` | PropertiesPage | ✅ OK | Gestão de Imóveis (CRUD) |
| `/admin/contracts` | `src/routes/admin/contracts.tsx` | ContractsPage | ✅ OK | Gestão de Contratos |
| `/admin/agencies` | `src/routes/admin/agencies.tsx` | AgencyModule | ✅ OK | Gestão de Imobiliárias |

### PESSOAS

| Rota | Arquivo | Componente | Status | Descrição |
|------|---------|------------|--------|-----------|
| `/admin/users` | `src/routes/admin/users.tsx` | UsersPage | ✅ OK | Todos os Usuários |
| `/admin/users?type=tenant` | `src/routes/admin/users.tsx` | UsersPage (filtro) | ✅ OK | Lista de Inquilinos |
| `/admin/users?type=landlord` | `src/routes/admin/users.tsx` | UsersPage (filtro) | ✅ OK | Lista de Proprietários |
| `/admin/users?type=guarantor` | `src/routes/admin/users.tsx` | UsersPage (filtro) | ✅ OK | Lista de Garantidores |

### MESA DE OPERAÇÕES (CRM + ATENDIMENTO)

| Rota | Arquivo | Componente | Status | Descrição |
|------|---------|------------|--------|-----------|
| `/admin/crm-live` | `src/routes/admin/crm-live.tsx` | CRMLive | ✅ OK | CRM Kanban + Chat unificado |
| `/admin/communication` | `src/routes/admin/communication.tsx` | CommunicationHub | ✅ OK | Central de Mensagens Omnichannel |

### CÉREBRO / AUTOMAÇÃO (GROWTH)

| Rota | Arquivo | Componente | Status | Descrição |
|------|---------|------------|--------|-----------|
| `/admin/engage` | `src/routes/admin/engage.tsx` | EngageDashboard | ✅ OK | Marketing Automation |
| `/admin/flow-builder` | `src/routes/admin/flow-builder.tsx` | FlowBuilder | ✅ OK | Editor de Fluxos de IA |
| `/admin/ads` | `src/routes/admin/ads.tsx` | AdsPage | ✅ OK | Engine de Anúncios (Meta/Google) |

### DEFI / INVESTIMENTOS

| Rota | Arquivo | Componente | Status | Descrição |
|------|---------|------------|--------|-----------|
| `/admin/investments` | `src/routes/admin/investments.tsx` | InvestmentsDashboard | ✅ OK | Gestão de Investimentos |
| `/admin/marketplace` | `src/routes/admin/marketplace.tsx` | MarketplaceDashboard | ✅ OK | Marketplace Admin |
| `/p2p` | `src/routes/p2p.tsx` | P2PMarketplace | ✅ OK | Marketplace P2P (público) |

### RELATÓRIOS

| Rota | Arquivo | Componente | Status | Descrição |
|------|---------|------------|--------|-----------|
| `/admin/financeiro` | `src/routes/admin/financeiro.tsx` | FinanceiroPage | ✅ OK | Relatórios Financeiros |
| `/admin/analytics` | `src/routes/admin/analytics.tsx` | AnalyticsPage | ✅ OK | Analytics e Métricas |
| `/admin/auditoria` | `src/routes/admin/auditoria.tsx` | AuditoriaPage | ✅ OK | Auditoria Blockchain |

### CONFIGURAÇÕES

| Rota | Arquivo | Componente | Status | Descrição |
|------|---------|------------|--------|-----------|
| `/admin/omnichannel` | `src/routes/admin/omnichannel.tsx` | OmnichannelConfig | ✅ OK | Config. Canais (WhatsApp, etc) |
| `/admin/integrations` | `src/routes/admin/integrations.tsx` | IntegrationsPage | ✅ OK | Integrações (APIs externas) |
| `/admin/smtp` | `src/routes/admin/smtp.tsx` | SmtpConfigList | ✅ OK | Configuração SMTP |
| `/admin/settings` | `src/routes/admin/settings.tsx` | SettingsPage | ✅ OK | Configurações Gerais |
| `/admin/about` | `src/routes/admin/about.tsx` | AboutPage | ✅ OK | Sobre o Sistema |
| `/admin/github` | `src/routes/admin/github.tsx` | GithubPage | ✅ OK | Integração GitHub |

---

## 1.2 ROTAS DA IMOBILIÁRIA (/agency/*)

| Rota | Arquivo | Status | Descrição |
|------|---------|--------|-----------|
| `/agency/dashboard` | `src/routes/agency/dashboard/index.tsx` | ✅ OK | Dashboard da Imobiliária |
| `/agency/properties` | `src/routes/agency/properties/index.tsx` | ✅ OK | Lista de Imóveis |
| `/agency/properties/new` | `src/routes/agency/properties/new.tsx` | ✅ OK | Cadastro de Imóvel |
| `/agency/contracts` | `src/routes/agency/contracts.tsx` | ✅ OK | Contratos da Imobiliária |
| `/agency/owners` | `src/routes/agency/owners.tsx` | ✅ OK | Proprietários vinculados |
| `/agency/ads` | `src/routes/agency/ads.tsx` | ✅ OK | Anúncios da Imobiliária |
| `/agency/financial` | `src/routes/agency/financial.tsx` | ✅ OK | Financeiro da Imobiliária |
| `/agency/split-calculator` | `src/routes/agency/split-calculator.tsx` | ✅ OK | Calculadora de Split |
| `/agency/settings` | `src/routes/agency/settings.tsx` | ✅ OK | Configurações |
| `/agency/setup` | `src/routes/agency/setup.tsx` | ✅ OK | Setup Wizard |
| `/agency/welcome` | `src/routes/agency/welcome.tsx` | ✅ OK | Tela de Boas-vindas |
| `/agency/site` | `src/routes/agency/site.tsx` | ✅ OK | Gerenciador do Site |
| `/agency/support` | `src/routes/agency/support.tsx` | ✅ OK | Suporte |

---

## 1.3 ROTAS DO INQUILINO (/tenant/*)

| Rota | Arquivo | Status | Descrição |
|------|---------|--------|-----------|
| `/tenant/dashboard` | `src/routes/tenant/dashboard.tsx` | ✅ OK | Dashboard do Inquilino |
| `/tenant/journey` | `src/routes/tenant/journey.tsx` | ✅ OK | Jornada de Locação |
| `/tenant/contract` | `src/routes/tenant/contract.tsx` | ✅ OK | Meu Contrato |
| `/tenant/payments` | `src/routes/tenant/payments.tsx` | ✅ OK | Meus Pagamentos |
| `/tenant/profile` | `src/routes/tenant/profile.tsx` | ✅ OK | Meu Perfil |

---

## 1.4 ROTAS DO INVESTIDOR (/investor/*)

| Rota | Arquivo | Status | Descrição |
|------|---------|--------|-----------|
| `/investor/marketplace` | `src/routes/investor/marketplace.tsx` | ✅ OK | Marketplace de Investimentos |
| `/investidor` | `src/routes/investidor.tsx` | ✅ OK | Landing do Investidor |

---

## 1.5 ROTAS DO PROPRIETÁRIO (/landlord/*, /locador/*)

| Rota | Arquivo | Status | Descrição |
|------|---------|--------|-----------|
| `/landlord/my-contracts` | `src/routes/landlord/my-contracts.tsx` | ✅ OK | Meus Contratos |
| `/locador/area` | `src/routes/locador/area.tsx` | ✅ OK | Área do Locador |

---

## 1.6 ROTAS DO GARANTIDOR (/garantidor/*)

| Rota | Arquivo | Status | Descrição |
|------|---------|--------|-----------|
| `/garantidor/area` | `src/routes/garantidor/area.tsx` | ✅ OK | Área do Garantidor |
| `/garantidor/termo` | `src/routes/garantidor/termo.tsx` | ✅ OK | Termo de Garantia |
| `/garantidores` | `src/routes/garantidores.tsx` | ✅ OK | Landing de Garantidores |

---

## 1.7 ROTAS PÚBLICAS

| Rota | Arquivo | Status | Descrição |
|------|---------|--------|-----------|
| `/` | `src/routes/index.tsx` | ✅ OK | Homepage |
| `/auth/login` | `src/routes/auth/login.tsx` | ✅ OK | Login |
| `/auth/register-superhost` | `src/routes/auth/register-superhost.tsx` | ✅ OK | Registro Superhost |
| `/marketplace` | `src/routes/marketplace.tsx` | ✅ OK | Marketplace Público |
| `/p2p` | `src/routes/p2p.tsx` | ✅ OK | P2P DeFi |
| `/simulador` | `src/routes/simulador.tsx` | ✅ OK | Simulador de Aluguel |
| `/verificar` | `src/routes/verificar.tsx` | ✅ OK | Verificação de Contrato |
| `/setup` | `src/routes/setup.tsx` | ✅ OK | Setup Inicial |
| `/clube-vbrz` | `src/routes/clube-vbrz.tsx` | ✅ OK | Clube VBRZ (Cashback) |
| `/inquilinos` | `src/routes/inquilinos.tsx` | ✅ OK | Landing Inquilinos |
| `/imob/$slug` | `src/routes/imob/$slug.tsx` | ✅ OK | Site da Imobiliária (dinâmico) |

---

## 1.8 ROTAS DE ASSETS

| Rota | Arquivo | Status | Descrição |
|------|---------|--------|-----------|
| `/assets/new` | `src/routes/assets/new.tsx` | ✅ OK | Novo Asset |
| `/assets/pending` | `src/routes/assets/pending.tsx` | ✅ OK | Assets Pendentes |
| `/assets/success` | `src/routes/assets/success.tsx` | ✅ OK | Sucesso de Asset |
| `/dashboard/assets` | `src/routes/dashboard/assets/index.tsx` | ✅ OK | Dashboard de Assets |

---

# 2. CHECKLIST DE COMPONENTES PRINCIPAIS

## 2.1 DASHBOARDS

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| OverviewDashboard | `src/components/admin/OverviewDashboard.tsx` | Dashboard Admin Principal |
| InvestmentsDashboard | `src/components/admin/investments-dashboard.tsx` | Dashboard de Investimentos |
| AdminAuditDashboard | `src/components/admin-audit-dashboard.tsx` | Auditoria Blockchain |
| TenantDashboard | `src/components/dashboards/tenant-dashboard.tsx` | Dashboard Inquilino |
| LandlordDashboard | `src/components/dashboards/landlord-dashboard.tsx` | Dashboard Proprietário |
| GuarantorDashboard | `src/components/dashboards/guarantor-dashboard.tsx` | Dashboard Garantidor |
| InsurerDashboard | `src/components/dashboards/insurer-dashboard.tsx` | Dashboard Seguradora |
| AdminDashboard | `src/components/dashboards/admin-dashboard.tsx` | Dashboard Admin Geral |
| VBRZDashboard | `src/components/dashboards/vbrz-dashboard.tsx` | Dashboard Token VBRZ |
| DashboardsConsultivas | `src/components/dashboards/dashboards-consultivas.tsx` | Dashboards Consultivas |
| CVMInvestorDashboard | `src/components/cvm-investor-dashboard.tsx` | Dashboard CVM |
| MarketplaceDashboard | `src/components/marketplace/marketplace-dashboard.tsx` | Dashboard Marketplace |

---

## 2.2 CRM

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| CRMLive | `src/components/crm/crm-live.tsx` | Super Tela CRM (Kanban + Chat) |
| CRMDashboard | `src/components/crm/crm-dashboard.tsx` | Dashboard CRM |
| KanbanBoard | `src/components/crm/kanban/kanban-board.tsx` | Kanban de Deals |
| DealDetailModal | `src/components/crm/kanban/deal-detail-modal.tsx` | Modal de Detalhe do Deal |

---

## 2.3 MARKETING / ENGAGE

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| EngageDashboard | `src/components/engage/engage-dashboard.tsx` | Dashboard Marketing |
| CampaignWizard | `src/components/engage/campaign-wizard.tsx` | Wizard de Campanhas |
| AudienceBuilder | `src/components/engage/audience-builder.tsx` | Construtor de Públicos |
| TemplateEditor | `src/components/engage/template-editor.tsx` | Editor de Templates |
| SmtpConfigList | `src/components/engage/smtp-config.tsx` | Configuração SMTP |

---

## 2.4 ANÚNCIOS (ENGINE)

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| AdCampaignManager | `src/components/engine/ad-campaign-manager.tsx` | Gestor de Campanhas |
| EngineIndex | `src/components/engine/index.tsx` | Exportações do Engine |

---

## 2.5 OMNICHANNEL

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| CommunicationHub | `src/components/communication-hub.tsx` | Hub Central de Comunicação |
| OmnichannelConfig | `src/components/omnichannel/omnichannel-config.tsx` | Config. Omnichannel |
| FlowBuilder | `src/components/omnichannel/flow-builder/flow-builder.tsx` | Editor de Fluxos |
| FlowEditor | `src/components/omnichannel/flow-editor.tsx` | Editor Visual |
| AgentInbox | `src/components/omnichannel/agent-inbox.tsx` | Inbox do Agente |
| DepartmentAdmin | `src/components/omnichannel/department-admin.tsx` | Admin de Departamentos |

---

## 2.6 FINANCEIRO

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| DREReport | `src/components/financeiro/dre-report.tsx` | Relatório DRE |
| ContasReceberForm | `src/components/financeiro/contas-receber-form.tsx` | Form Contas a Receber |
| ContasPagarForm | `src/components/financeiro/contas-pagar-form.tsx` | Form Contas a Pagar |
| AlugueisReceberForm | `src/components/financeiro/alugueis-receber-form.tsx` | Form Aluguéis |
| ColaboradoresForm | `src/components/financeiro/colaboradores-form.tsx` | Form Colaboradores |
| FornecedoresForm | `src/components/financeiro/fornecedores-form.tsx` | Form Fornecedores |
| TiposReceitaForm | `src/components/financeiro/tipos-receita-form.tsx` | Form Tipos de Receita |
| TiposDespesaForm | `src/components/financeiro/tipos-despesa-form.tsx` | Form Tipos de Despesa |
| CalculadoraAluguel | `src/components/financeiro/calculadora-aluguel.tsx` | Calculadora de Aluguel |

---

## 2.7 DEFI / BLOCKCHAIN

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| RentAnticipation | `src/components/defi/rent-anticipation.tsx` | Antecipação de Aluguéis |
| NFTLoans | `src/components/defi/nft-loans.tsx` | Empréstimos NFT |
| ContractMinting | `src/components/contract-minting.tsx` | Mintagem de Contratos |
| BlockchainTransactionFeed | `src/components/blockchain-transaction-feed.tsx` | Feed de Transações |
| CryptoWalletConfig | `src/components/crypto-wallet-config.tsx` | Config. Carteira Crypto |
| InvestmentGuard | `src/components/InvestmentGuard.tsx` | Guard de Investimentos |
| AnticipationModal | `src/components/owner/AnticipationModal.tsx` | Modal de Antecipação |

---

## 2.8 IMOBILIÁRIAS

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| AgencyModule | `src/components/admin/agencies/AgencyModule.tsx` | Módulo de Imobiliárias |
| AgencyList | `src/components/admin/agencies/AgencyList.tsx` | Lista de Imobiliárias |
| AgencyForm | `src/components/admin/agencies/AgencyForm.tsx` | Formulário de Imobiliária |
| AgencySiteConfigModal | `src/components/admin/agencies/AgencySiteConfigModal.tsx` | Config. do Site |
| AgencyPublicSite | `src/components/sites/AgencyPublicSite.tsx` | Site Público |
| PropertyDetailsPage | `src/components/sites/PropertyDetailsPage.tsx` | Página do Imóvel |
| AgencyAdsWidget | `src/components/agency/AgencyAdsWidget.tsx` | Widget de Anúncios |

---

## 2.9 INSPEÇÃO

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| InspectionCamera | `src/components/inspection/inspection-camera.tsx` | Câmera de Vistoria |
| MintNFTButton | `src/components/inspection/mint-nft-button.tsx` | Botão de Mintagem NFT |

---

## 2.10 CASHBACK

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| CashbackAdminDashboard | `src/components/admin/cashback/cashback-admin-dashboard.tsx` | Admin Cashback |
| CashbackAnalytics | `src/components/admin/cashback/cashback-analytics.tsx` | Analytics Cashback |
| CashbackRulesPanel | `src/components/admin/cashback/cashback-rules-panel.tsx` | Painel de Regras |
| CashbackTransactionsTable | `src/components/admin/cashback/cashback-transactions-table.tsx` | Tabela Transações |

---

## 2.11 LEGAL

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| TermoModal | `src/components/legal/TermoModal.tsx` | Modal de Termos |

---

## 2.12 SETUP

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| SetupWizard | `src/components/setup/setup-wizard.tsx` | Wizard de Setup Inicial |

---

## 2.13 LAYOUTS

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| AdminLayout | `src/components/layouts/AdminLayout.tsx` | Layout Admin (Super) |
| AgencyLayout | `src/components/layouts/AgencyLayout.tsx` | Layout Imobiliária |
| TenantLayout | `src/components/layouts/TenantLayout.tsx` | Layout Inquilino |

---

# 3. DIAGRAMA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VÍNCULO BRASIL v2.0.0                              │
│                    Plataforma de Gestão Imobiliária + DeFi                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   SUPER ADMIN   │        │   IMOBILIÁRIA   │        │    USUÁRIOS     │
│   /admin/*      │        │   /agency/*     │        │  (Multi-role)   │
└────────┬────────┘        └────────┬────────┘        └────────┬────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              MÓDULOS CORE                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    1. GESTÃO OPERACIONAL                            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │ │
│  │  │ IMÓVEIS  │  │CONTRATOS │  │  PESSOAS │  │    IMOBILIÁRIAS      │ │ │
│  │  │/properties│  │/contracts │  │  /users  │  │     /agencies        │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    2. MESA DE OPERAÇÕES                             │ │
│  │  ┌─────────────────────────────┐  ┌────────────────────────────────┐ │ │
│  │  │        CRM LIVE             │  │    COMMUNICATION HUB           │ │ │
│  │  │   (Kanban + Chat)           │  │   (WhatsApp, Email, etc)       │ │ │
│  │  │       /crm-live             │  │      /communication            │ │ │
│  │  └─────────────────────────────┘  └────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    3. CÉREBRO / AUTOMAÇÃO                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐ │ │
│  │  │   ENGAGE     │  │ FLOW BUILDER │  │     ENGINE DE ANÚNCIOS     │ │ │
│  │  │  (Marketing) │  │  (IA Flows)  │  │    (Meta, Google Ads)      │ │ │
│  │  │   /engage    │  │ /flow-builder│  │         /ads               │ │ │
│  │  └──────────────┘  └──────────────┘  └────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    4. DEFI / INVESTIMENTOS                          │ │
│  │  ┌──────────────────────────┐  ┌────────────────────────────────┐   │ │
│  │  │      INVESTIMENTOS       │  │      MARKETPLACE P2P           │   │ │
│  │  │   (Admin Dashboard)      │  │   (Recebíveis Tokenizados)     │   │ │
│  │  │     /investments         │  │           /p2p                 │   │ │
│  │  └──────────────────────────┘  └────────────────────────────────┘   │ │
│  │  ┌──────────────────────────┐  ┌────────────────────────────────┐   │ │
│  │  │   ANTECIPAÇÃO ALUGUEL    │  │      NFT LOANS                 │   │ │
│  │  │  (RentAnticipation)      │  │   (Empréstimos NFT)            │   │ │
│  │  └──────────────────────────┘  └────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    5. RELATÓRIOS                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐ │ │
│  │  │  FINANCEIRO  │  │  ANALYTICS   │  │        AUDITORIA           │ │ │
│  │  │  (DRE, etc)  │  │  (Métricas)  │  │   (Blockchain Audit)       │ │ │
│  │  │ /financeiro  │  │  /analytics  │  │       /auditoria           │ │ │
│  │  └──────────────┘  └──────────────┘  └────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    6. CONFIGURAÇÕES                                 │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐    │ │
│  │  │OMNICHANNEL │ │INTEGRAÇÕES │ │   SMTP     │ │ CONFIG GERAIS  │    │ │
│  │  │/omnichannel│ │/integrations│ │   /smtp   │ │   /settings    │    │ │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           PORTAIS DE USUÁRIO                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐  │
│  │   INQUILINO    │  │  PROPRIETÁRIO  │  │       GARANTIDOR           │  │
│  │   /tenant/*    │  │  /landlord/*   │  │      /garantidor/*         │  │
│  │  - Dashboard   │  │  - My Contracts│  │      - Área                │  │
│  │  - Journey     │  │  - Área        │  │      - Termo               │  │
│  │  - Payments    │  │  - Antecipação │  │                            │  │
│  │  - Contract    │  │                │  │                            │  │
│  └────────────────┘  └────────────────┘  └────────────────────────────┘  │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐                                  │
│  │   INVESTIDOR   │  │   SEGURADORA   │                                  │
│  │  /investor/*   │  │  (Dashboard)   │                                  │
│  │  - Marketplace │  │                │                                  │
│  │  - CVM         │  │                │                                  │
│  └────────────────┘  └────────────────┘                                  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           PÁGINAS PÚBLICAS                               │
├──────────────────────────────────────────────────────────────────────────┤
│  /                - Homepage                                             │
│  /auth/login      - Login                                                │
│  /marketplace     - Marketplace de Seguros                              │
│  /p2p             - Marketplace P2P (DeFi)                              │
│  /simulador       - Simulador de Aluguel                                │
│  /verificar       - Verificação de Contrato                             │
│  /clube-vbrz      - Clube VBRZ (Cashback)                               │
│  /inquilinos      - Landing Inquilinos                                  │
│  /garantidores    - Landing Garantidores                                │
│  /investidor      - Landing Investidores                                │
│  /imob/$slug      - Site da Imobiliária (dinâmico)                      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

# 4. LACUNAS IDENTIFICADAS (Rotas sem Menu ou Não Expostas)

## 4.1 ROTAS EXISTENTES MAS SEM MENU NO ADMIN

| Rota | Descrição | Ação Sugerida |
|------|-----------|---------------|
| `/admin/github` | Integração GitHub | Adicionar em "Configurações" |
| `/marketplace` | Marketplace de Seguros | Adicionar em "DeFi/Investimentos" |
| `/assets/*` | Gestão de Assets | Verificar se deve estar no Admin |

## 4.2 COMPONENTES EXISTENTES MAS SEM ROTA

| Componente | Descrição | Ação Sugerida |
|------------|-----------|---------------|
| CashbackAdminDashboard | Dashboard de Cashback | Criar rota `/admin/cashback` |
| CVMInvestorDashboard | Dashboard CVM | Criar rota `/admin/cvm` |
| InspectionCamera | Câmera de Vistoria | Incluir em `/agency/inspection` |
| ContractMinting | Mintagem NFT | Incluir em `/admin/nft` ou `/admin/blockchain` |
| BlockchainTransactionFeed | Feed Blockchain | Incluir em Auditoria ou criar `/admin/blockchain` |
| RentAnticipation | Antecipação | Já existe em componente |
| NFTLoans | Empréstimos NFT | Criar rota específica |

## 4.3 FORMULÁRIOS EXISTENTES MAS SEM ROTA DIRETA

| Componente | Descrição | Localização Atual |
|------------|-----------|-------------------|
| AlugueisReceberForm | Form Aluguéis | Usado em Financeiro |
| ContasReceberForm | Form Contas a Receber | Usado em Financeiro |
| ContasPagarForm | Form Contas a Pagar | Usado em Financeiro |
| ColaboradoresForm | Form Colaboradores | Usado em Settings |
| FornecedoresForm | Form Fornecedores | Usado em Settings |
| TiposReceitaForm | Form Tipos Receita | Usado em Settings |
| TiposDespesaForm | Form Tipos Despesa | Usado em Settings |

---

# 5. RESUMO DE FORMULÁRIOS

## 5.1 FORMULÁRIOS CRUD

| Formulário | Localização | Campos Principais |
|------------|-------------|-------------------|
| AgencyForm | `/agencies` | Nome, CNPJ, Slug, Admin Email/Senha |
| PropertyForm | `/properties` | Endereço, Tipo, Quartos, Área, Valor |
| ContractForm | `/contracts` | Imóvel, Inquilino, Datas, Valor |
| UserForm | `/users` | Nome, Email, CPF, Tipo, Telefone |
| LeadForm | CRM | Nome, Email, Origem, Estágio |
| DealForm | CRM | Título, Valor, Pipeline, Estágio |

## 5.2 FORMULÁRIOS DE CONFIGURAÇÃO

| Formulário | Localização | Descrição |
|------------|-------------|-----------|
| SmtpConfigForm | `/smtp` | Host, Porta, User, Password |
| OmnichannelConfigForm | `/omnichannel` | Canais, Tokens, Webhooks |
| IntegrationsForm | `/integrations` | APIs externas, Chaves |
| SettingsForm | `/settings` | Config. gerais do sistema |
| AgencySiteConfigModal | `/agencies` | Config. do site da imobiliária |

## 5.3 FORMULÁRIOS FINANCEIROS

| Formulário | Descrição |
|------------|-----------|
| ContasReceberForm | Cadastro de contas a receber |
| ContasPagarForm | Cadastro de contas a pagar |
| AlugueisReceberForm | Aluguéis pendentes |
| ColaboradoresForm | Gestão de colaboradores |
| FornecedoresForm | Gestão de fornecedores |

---

# 6. RESUMO DE RELATÓRIOS

| Relatório | Rota | Descrição |
|-----------|------|-----------|
| DRE | `/admin/financeiro` | Demonstração de Resultados |
| Analytics | `/admin/analytics` | Métricas gerais do sistema |
| Auditoria Blockchain | `/admin/auditoria` | Transações em blockchain |
| Dashboard Admin | `/admin/dashboard` | KPIs principais |
| Dashboard Investimentos | `/admin/investments` | Métricas de investimentos |
| Cashback Analytics | CashbackAnalytics | Métricas de cashback |

---

# 7. STACK TECNOLÓGICA

```
Frontend:
├── React 19
├── TypeScript
├── TanStack Router (file-based routing)
├── TanStack Query (server state)
├── Tailwind CSS v4
├── shadcn/ui (New York style)
├── Lucide Icons
├── @hello-pangea/dnd (drag-and-drop)
├── Vite (build tool)
└── Capacitor (mobile apps)

Backend:
├── Node.js
├── Express
├── Prisma ORM
├── PostgreSQL
├── Redis (cache/queue)
└── BullMQ (jobs)

Blockchain:
├── Ethereum / Polygon
├── Solidity Smart Contracts
├── ethers.js
├── Pinata (IPFS)
└── Hardhat
```

---

# 8. PRÓXIMOS PASSOS SUGERIDOS

1. **Criar rota `/admin/cashback`** - Expor CashbackAdminDashboard no menu
2. **Criar rota `/admin/blockchain`** - Centralizar recursos blockchain
3. **Criar rota `/admin/nft`** - Gestão de NFTs
4. **Adicionar `/marketplace` no menu** - Link para Marketplace de Seguros
5. **Revisar formulários financeiros** - Garantir acesso via menu
6. **Criar módulo de Vistoria** - `/agency/inspection` ou `/admin/inspection`

---

*Documento gerado automaticamente em 23/01/2026*
*Vínculo Brasil - Plataforma de Gestão Imobiliária com DeFi*
