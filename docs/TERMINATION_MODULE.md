# Termination Module - Rescisão Antecipada

**Data de Implementação**: 23 de Janeiro de 2025
**Status**: Produção

---

## Resumo

O módulo de Rescisão Antecipada implementa o cálculo e execução de multas rescisórias conforme a Lei do Inquilinato (Lei 8.245/91, Art. 4º). O sistema protege automaticamente os investidores que compraram recebíveis via cessão de crédito P2P.

---

## Arquitetura

### Backend

```
server/src/services/termination.service.ts    # Lógica de cálculo e execução
server/src/controllers/termination.controller.ts  # Endpoints da API
server/src/routes/contracts.ts                # Rotas adicionadas
```

### Frontend

```
src/components/admin/TerminationModal.tsx     # Modal de rescisão
```

---

## Fluxo de Proteção ao Investidor (3 Escudos)

### 1. Multa Rescisória (Lei 8.245/91 - Art. 4º)

- **Base**: 3 meses de aluguel (padrão de mercado)
- **Cálculo Proporcional**: `(MultaBase / DuraçãoTotal) * MesesRestantes`
- **Quem PAGA**: Inquilino (ou Seguradora se inadimplente)
- **Quem RECEBE**: Investidor (que comprou os recebíveis)

### 2. Déficit (Coobrigação do Proprietário)

- Se `Multa < ValorDevidoAoInvestidor`
- A diferença é cobrada do Proprietário
- Gera boleto Asaas com split direto para o investidor

### 3. Seguro Fiança

- Cobre a multa se o inquilino não pagar
- NÃO cobre o período de vacância (apenas inadimplência)

---

## API Endpoints

### Simular Rescisão

```http
POST /api/contracts/:id/simulate-termination
```

**Request Body:**
```json
{
  "exitDate": "2025-06-15",
  "baseFineMonths": 3
}
```

**Response:**
```json
{
  "success": true,
  "simulation": {
    "contractId": "uuid",
    "totalDurationMonths": 24,
    "elapsedMonths": 12,
    "remainingMonths": 12,
    "monthlyRent": 2500.00,
    "baseFineValue": 7500.00,
    "proportionalFine": 3750.00,
    "investorTotalOwed": 25500.00,
    "investorPayout": 3750.00,
    "hasShortfall": true,
    "ownerDebt": 21750.00,
    "summary": ["..."]
  }
}
```

### Executar Rescisão

```http
POST /api/contracts/:id/terminate
```

**Request Body:**
```json
{
  "exitDate": "2025-06-15",
  "baseFineMonths": 3,
  "confirmTermination": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contrato rescindido com sucesso",
  "termination": {
    "contractId": "uuid",
    "exitDate": "2025-06-15T00:00:00.000Z",
    "fineAmount": 3750.00,
    "investorPayout": 3750.00,
    "ownerDebt": 21750.00,
    "hasShortfall": true
  },
  "bills": {
    "tenantBillId": "pay_abc123",
    "ownerBillId": "pay_def456"
  }
}
```

---

## Fórmula de Cálculo

### Multa Proporcional

```
BaseFine = MonthlyRent × BaseFineMonths (geralmente 3)
ProportionalFine = (BaseFine / TotalDurationMonths) × RemainingMonths
```

### Exemplo Prático

- Contrato de 24 meses
- Aluguel: R$ 2.500,00
- Saída após 12 meses (restam 12)
- Multa base: 3 meses = R$ 7.500,00
- Multa proporcional: (7.500 / 24) × 12 = **R$ 3.750,00**

### Cálculo do Déficit

```
InvestorOwed = RemainingMonths × (MonthlyRent × OwnerShare)
OwnerDebt = InvestorOwed - ProportionalFine (se positivo)
```

---

## Uso no Frontend

### Importar o Modal

```tsx
import { TerminationModal } from '@/components/admin/TerminationModal';
```

### Exemplo de Uso

```tsx
const [selectedContract, setSelectedContract] = useState(null);
const [modalOpen, setModalOpen] = useState(false);

<TerminationModal
  contract={selectedContract}
  open={modalOpen}
  onOpenChange={setModalOpen}
  onTerminationComplete={() => refetch()}
/>
```

---

## Cobranças Asaas Geradas

### 1. Multa ao Inquilino

- **Tipo**: PIX
- **Vencimento**: 7 dias
- **Split**: Direto para o investidor (se houver)
- **Referência**: `TERM:{contractId}`

### 2. Coobrigação ao Proprietário

- **Tipo**: PIX
- **Vencimento**: 15 dias
- **Split**: Direto para o investidor
- **Referência**: `COOB:{contractId}`

---

## Permissões Necessárias

- `contracts.update` - Para simular e executar rescisão

---

## Estados do Contrato

Após rescisão:

- **Contrato**: Status alterado para `TERMINATED`
- **Propriedade**: Status alterado para `AVAILABLE`
- **Split Rules P2P**: Desativadas (`isActive: false`)

---

## Dados Salvos no Financial Snapshot

```json
{
  "terminatedAt": "2025-06-15T00:00:00.000Z",
  "terminationExitDate": "2025-06-15T00:00:00.000Z",
  "terminationFine": 3750.00,
  "terminationInvestorPayout": 3750.00,
  "terminationOwnerDebt": 21750.00
}
```

---

## Tratamento de Erros

| Erro | Causa | Solução |
|------|-------|---------|
| "Contrato não encontrado" | ID inválido | Verificar ID |
| "Data de saída inválida" | Fora do período do contrato | Ajustar data |
| "ASAAS_API_KEY não configurado" | Chave não definida | Configurar em `/admin/integrations` |

---

## Segurança

- Confirmação explícita (`confirmTermination: true`) para executar
- Permissão `contracts.update` obrigatória
- Logs detalhados de todas operações
- Cobranças registradas no banco antes de retornar

---

## Compliance Legal

- **Lei 8.245/91 (Lei do Inquilinato)**: Art. 4º - Multa proporcional
- **Código Civil**: Art. 286-298 - Cessão de Crédito
- **Coobrigação**: Responsabilidade subsidiária do cedente (proprietário)

---

## Próximos Passos (Roadmap)

- [ ] Notificação por email ao inquilino e proprietário
- [ ] Integração com seguro fiança para acionamento automático
- [ ] Dashboard de rescisões para admin
- [ ] Relatório de vacância por imobiliária
