# INVENTÁRIO COMPLETO - FORMULÁRIOS E MODAIS
## VinculoBrasil Frontend

**Gerado em:** 24/01/2026
**Total de Formulários:** 11
**Total de Modais/Dialogs:** 14
**Componentes Órfãos:** 1 (TerminationModal)

---

## RESUMO EXECUTIVO

| Categoria | Quantidade | Com Rota | Sem Rota | Órfão |
|-----------|------------|----------|----------|-------|
| Formulários | 11 | 10 | 1 | 0 |
| Modais | 5 | 0 | 5 | 1 |
| Dialogs | 9 | 0 | 9 | 0 |
| **TOTAL** | **25** | **10** | **15** | **1** |

---

## 1. FORMULÁRIOS COM ACESSO DIRETO (URL)

### 1.1 TenantKYCForm - Verificação de Inquilino
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/tenant-kyc-form.tsx` |
| **Rota** | `/verificar` |
| **Componente Pai** | `src/routes/verificar.tsx` |
| **Propósito** | Formulário multi-step para verificação KYC com cálculo de trust score por IA |

**Campos do Formulário:**
- Step 1: Nome, CPF, Data Nascimento, Email, Telefone
- Step 2: Renda, Ocupação, Tipo de Emprego
- Step 3: Upload de Documentos (identidade, comprovante renda, endereço, selfie)
- Step 4: Resultado do Trust Score

**Dependências:**
- Risk automation scoring API

---

### 1.2 Módulo Financeiro - 8 Formulários
**Rota Base:** `/admin/financeiro`

Todos os formulários abaixo são acessados através de um seletor de módulos no sidebar.

#### AlugueisReceberForm
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/financeiro/alugueis-receber-form.tsx` |
| **ModuloId** | `alugueis-receber` |
| **Propósito** | Gestão de aluguéis a receber e faturamento |

#### ContasReceberForm
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/financeiro/contas-receber-form.tsx` |
| **ModuloId** | `contas-receber` |
| **Propósito** | Rastreamento de comissões, taxas de setup e recebíveis |

#### ContasPagarForm
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/financeiro/contas-pagar-form.tsx` |
| **ModuloId** | `contas-pagar` |
| **Propósito** | Gestão de contas, pagamentos e fornecedores |

**Dialogs Internos:**
- `ContaPagarFormDialog` - Criar/editar contas
- `PagamentoDialog` - Registrar pagamento
- Dialog de fornecedores
- Dialog de tipos de despesa

#### FornecedoresForm
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/financeiro/fornecedores-form.tsx` |
| **ModuloId** | `fornecedores` |
| **Propósito** | Cadastro e gestão de fornecedores |

#### ColaboradoresForm
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/financeiro/colaboradores-form.tsx` |
| **ModuloId** | `colaboradores` |
| **Propósito** | Gestão de colaboradores e folha de pagamento |

#### TiposDespesaForm
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/financeiro/tipos-despesa-form.tsx` |
| **ModuloId** | `tipos-despesa` |
| **Propósito** | Definição de categorias de despesa contábil |

#### TiposReceitaForm
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/financeiro/tipos-receita-form.tsx` |
| **ModuloId** | `tipos-receita` |
| **Propósito** | Definição de categorias de receita |

#### CalculadoraAluguel
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/financeiro/calculadora-aluguel.tsx` |
| **ModuloId** | `calculadora` |
| **Propósito** | Simulação e cálculo de cenários de aluguel |

#### DreReport
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/financeiro/dre-report.tsx` |
| **ModuloId** | `dre` |
| **Propósito** | Geração de DRE (Demonstrativo de Resultado do Exercício) |

---

## 2. FORMULÁRIOS SEM ROTA DIRETA (Componentes)

### 2.1 AgencyForm - Cadastro de Imobiliária
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/admin/agencies/AgencyForm.tsx` |
| **Rota Pai** | `/admin/agencies` (dentro do AgencyModule) |
| **Importado Por** | `AgencyModule.tsx` |
| **API Endpoint** | `POST /api/agencies` |

**Campos do Formulário:**
- Dados da Imobiliária: Nome, Slug, CNPJ, Telefone, Cores
- Upload de Arquivos: Logo, Imagem de Capa
- Conta Admin: Nome, Email, Senha

---

## 3. MODAIS (Dialog-based Components)

### 3.1 AgencySiteConfigModal - Configuração Whitelabel
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/admin/agencies/AgencySiteConfigModal.tsx` |
| **Trigger** | Dentro do `AgencyModule.tsx` |
| **Rota Pai** | `/admin/agencies` |
| **API Endpoint** | `PATCH /api/agencies/{id}/config` |

**Abas:**
- Identidade (Logo, cores, título do site)
- Hero/Banner (Imagem principal, botão CTA)
- Sobre Nós (Info da empresa, tamanho da equipe, ano de fundação)
- Contato (Info de contato, redes sociais)

---

### 3.2 DealDetailModal - Detalhes do Deal CRM
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/crm/kanban/deal-detail-modal.tsx` |
| **Trigger** | Kanban board do CRM |
| **Data Store** | `useCRMStore()` (Zustand) |

**Funcionalidades:**
- Campos editáveis (título, valores, info do imóvel)
- Rastreamento de atividades (ligações, emails, notas)
- Dialog de criação de atividade (embutido)
- Progressão do deal através dos estágios do pipeline
- Funcionalidade de deletar/marcar como ganho/perdido

---

### 3.3 AnticipationModal - Antecipação de Aluguel
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/owner/AnticipationModal.tsx` |
| **Rotas de Uso** | `/agency/contracts`, `/landlord/my-contracts` |

**Funcionalidades:**
- Fluxo de 2 passos: Simulação → Confirmação
- Mostra desconto do investidor (15%), taxa da plataforma (5%)
- Calcula valor líquido a receber

**Configuração:**
```
MONTHS_TO_SELL: 12
DISCOUNT_RATE: 15%
PLATFORM_FEE: 5%
```

---

### 3.4 TermoModal - Termos de Uso Legal
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/legal/TermoModal.tsx` |
| **Rota de Uso** | `/investor/marketplace` |

**Funcionalidades:**
- Documento legal scrollável
- Botão de aceite só habilitado após scroll até o final
- Exibição de informações do ativo (título, preço)
- Conteúdo: Termos de cessão de crédito, info blockchain, framework legal

---

### 3.5 TerminationModal - Cálculo de Rescisão ⚠️ ÓRFÃO
| Atributo | Valor |
|----------|-------|
| **Arquivo** | `src/components/admin/TerminationModal.tsx` |
| **Status** | **NÃO IMPORTADO EM LUGAR NENHUM** |
| **Uso Esperado** | Gestão de contratos no Admin |

**Funcionalidades:**
- Calcula multas proporcionais baseado na Lei do Inquilinato
- Simula pagamentos de investidor/proprietário
- Rastreia déficits e débitos

**⚠️ PROBLEMA:** Este modal existe mas foi "desconectado" - não está sendo usado em nenhum lugar!

---

## 4. DIALOGS (Admin Dashboard)

Todos importados em: `src/components/dashboards/admin-dashboard.tsx`

| Dialog | Arquivo | Propósito |
|--------|---------|-----------|
| **UserDialog** | `src/components/user-dialogs.tsx` | CRUD de usuários administrativos |
| **BankAccountDialog** | `src/components/bank-account-dialogs.tsx` | Gestão de contas bancárias |
| **GatewayDialog** | `src/components/gateway-dialogs.tsx` | Configuração de gateway de pagamento |
| **InsurerDialog** | `src/components/insurer-dialogs.tsx` | Gestão de seguradoras |
| **MarketplaceDialog** | `src/components/marketplace-dialogs.tsx` | Configuração do marketplace |
| **ServiceDialog** | `src/components/services-integration-dialogs.tsx` | Configuração de serviços |
| **IntegrationDialog** | `src/components/services-integration-dialogs.tsx` | Integrações de terceiros |
| **NewGroupDialog** | `src/components/group-permission-dialogs.tsx` | Criar grupos de permissão |
| **EditGroupDialog** | `src/components/group-permission-dialogs.tsx` | Editar grupos de permissão |

**Departamentos em UserDialog:**
- Administrativo
- Financeiro
- Comercial
- Suporte
- Jurídico
- TI
- Operações

---

## 5. MAPA DE ROTAS E FORMULÁRIOS

```
ROTAS COM FORMULÁRIOS
├── /verificar
│   └── TenantKYCForm
│
├── /admin/financeiro
│   ├── alugueis-receber → AlugueisReceberForm
│   ├── contas-receber → ContasReceberForm
│   ├── contas-pagar → ContasPagarForm
│   ├── fornecedores → FornecedoresForm
│   ├── colaboradores → ColaboradoresForm
│   ├── tipos-despesa → TiposDespesaForm
│   ├── tipos-receita → TiposReceitaForm
│   ├── calculadora → CalculadoraAluguel
│   └── dre → DreReport
│
├── /admin/agencies
│   ├── AgencyForm (criar imobiliária)
│   └── AgencySiteConfigModal (configurar site)
│
├── /admin/dashboard
│   ├── UserDialog
│   ├── BankAccountDialog
│   ├── GatewayDialog
│   ├── InsurerDialog
│   ├── MarketplaceDialog
│   ├── ServiceDialog
│   ├── IntegrationDialog
│   └── GroupPermissionDialogs
│
├── /agency/contracts
│   └── AnticipationModal
│
├── /landlord/my-contracts
│   └── AnticipationModal
│
├── /investor/marketplace
│   └── TermoModal
│
└── [CRM Dashboard]
    └── DealDetailModal

COMPONENTES ÓRFÃOS (SEM ROTA)
└── src/components/admin/TerminationModal.tsx ⚠️
```

---

## 6. PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICO: Formulário Órfão
| Componente | Arquivo | Problema |
|------------|---------|----------|
| **TerminationModal** | `src/components/admin/TerminationModal.tsx` | Não está importado em nenhum lugar |

**Ação Recomendada:** Integrar o `TerminationModal` na página de gestão de contratos do admin (`/admin/contracts` ou similar).

### 🟡 AVISO: Formulários Difíceis de Encontrar
Os 8 formulários financeiros são todos acessados através de um único seletor em `/admin/financeiro`. Isso pode causar confusão para usuários procurando formulários específicos.

---

## 7. DEPENDÊNCIAS DE API

| Formulário/Modal | Endpoint | Status |
|------------------|----------|--------|
| TenantKYCForm | Risk Automation API | CONECTADO |
| AgencyForm | `POST /api/agencies` | CONECTADO |
| AgencySiteConfigModal | `PATCH /api/agencies/{id}/config` | CONECTADO |
| DealDetailModal | useCRMStore (Zustand) | LOCAL |
| AnticipationModal | - | MOCK |
| TermoModal | - | ESTÁTICO |
| TerminationModal | - | ÓRFÃO |
| UserDialog | `/api/admin/users` | CONECTADO |
| Dialogs Financeiros | `/api/admin/*` | CONECTADO |

---

## 8. ARQUIVOS POR PASTA

```
src/components/
├── financeiro/
│   ├── alugueis-receber-form.tsx
│   ├── calculadora-aluguel.tsx
│   ├── colaboradores-form.tsx
│   ├── contas-pagar-form.tsx
│   ├── contas-receber-form.tsx
│   ├── dre-report.tsx
│   ├── fornecedores-form.tsx
│   ├── tipos-despesa-form.tsx
│   └── tipos-receita-form.tsx
│
├── admin/
│   ├── TerminationModal.tsx ⚠️ ÓRFÃO
│   └── agencies/
│       ├── AgencyForm.tsx
│       └── AgencySiteConfigModal.tsx
│
├── crm/
│   └── kanban/
│       └── deal-detail-modal.tsx
│
├── owner/
│   └── AnticipationModal.tsx
│
├── legal/
│   └── TermoModal.tsx
│
├── tenant-kyc-form.tsx
├── user-dialogs.tsx
├── bank-account-dialogs.tsx
├── gateway-dialogs.tsx
├── insurer-dialogs.tsx
├── marketplace-dialogs.tsx
├── services-integration-dialogs.tsx
└── group-permission-dialogs.tsx
```

---

*Documento gerado automaticamente por Claude Code*
