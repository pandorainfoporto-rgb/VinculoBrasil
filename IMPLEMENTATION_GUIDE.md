# 🚀 Guia de Implementação Final - 3 Engrenagens

Este guia mostra como integrar as 3 engrenagens finais que faltam para o motor girar 100%.

## ✅ 1. O "Plim" na Tela (Polling de Status)

### Backend: Endpoint Criado ✅
- Rota: `GET /api/invest/orders/:orderId/status`
- Controller: `/server/src/controllers/invest.controller.ts:697`
- Retorna apenas `{status, txHash, settledAt}` - leve para polling

### Frontend: Hook Criado ✅
- Hook: `/src/hooks/usePaymentPolling.ts`
- Faz polling automático a cada 3 segundos
- Detecta quando pagamento é confirmado

### Como Usar no Seu Componente

```typescript
import { usePaymentPolling } from '@/hooks/usePaymentPolling';
import { useInvest } from '@/hooks/useInvest';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from '@tanstack/react-router';

function AssetDetails() {
  const { createOrder, pixData } = useInvest();
  const { toast } = useToast();
  const navigate = useNavigate();

  // ⚡ POLLING AUTOMÁTICO
  const { isPaid, txHash } = usePaymentPolling({
    orderId: pixData?.orderId || null,
    enabled: !!pixData, // Só roda se tiver Pix gerado
    onSuccess: (hash) => {
      toast({
        title: "🎉 Pagamento Confirmado!",
        description: "O ativo é seu. Tokens transferidos!",
      });

      // Redirecionar para dashboard
      navigate({ to: '/investor/dashboard' });
    },
    onExpired: () => {
      toast({
        variant: "destructive",
        title: "⏰ Pix Expirado",
        description: "Gere um novo código para continuar",
      });
    },
  });

  return (
    <div>
      {pixData ? (
        <div>
          <img src={pixData.qrCode} alt="QR Code Pix" />
          <p>{pixData.copyPaste}</p>

          {/* Status em tempo real */}
          {isPaid ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Pago!</AlertTitle>
              <AlertDescription>
                Transação: {txHash}
              </AlertDescription>
            </Alert>
          ) : (
            <p>Aguardando pagamento... (verificando automaticamente)</p>
          )}
        </div>
      ) : (
        <Button onClick={() => createOrder(listingId)}>
          Investir Agora
        </Button>
      )}
    </div>
  );
}
```

---

## ✅ 2. O Carteiro (SMTP Email)

### Backend: Função Criada ✅
- Service: `/server/src/services/notification.service.ts:360`
- Função: `sendInvestmentReceipt()`
- Email HTML profissional com detalhes do investimento

### Integração: Automática no Settlement ✅
- Local: `/server/src/services/settlement.service.ts:556-580`
- Envia email automaticamente após liquidação bem-sucedida
- Non-blocking (não falha a transação se email falhar)

### ⚙️ Configuração SMTP (VOCÊ PRECISA FAZER)

Adicione no arquivo `.env` do servidor:

```bash
# SMTP Configuration (Resend, Hostinger, etc)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_sua_chave_aqui

# Email do remetente
SMTP_FROM_EMAIL=noreply@vinculobrasil.com
SMTP_FROM_NAME=Vínculo Brasil
```

### Testando o Email

```bash
# No servidor, testar manualmente:
curl -X POST http://localhost:3000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "seu-email@gmail.com",
    "subject": "Teste SMTP",
    "text": "Se você recebeu isso, o SMTP está funcionando!"
  }'
```

---

## ✅ 3. A Trava de Segurança (Validação de CPF)

### Validador Criado ✅
- Utility: `/src/lib/validation.ts`
- Função: `validateUserForInvestment(user)`
- Verifica: CPF, Telefone, Email, Nome Completo

### Componente Guard Criado ✅
- Component: `/src/components/InvestmentGuard.tsx`
- Bloqueia ação se perfil incompleto
- Mostra mensagem amigável

### Como Usar no Marketplace

```typescript
import { InvestmentGuard, useInvestmentValidation } from '@/components/InvestmentGuard';
import { validateUserForInvestment } from '@/lib/validation';

function MarketplaceCard({ listing }) {
  const user = { /* dados do usuário logado */ };
  const navigate = useNavigate();

  // Opção 1: Validação antes de abrir modal
  const handleInvestClick = () => {
    const validation = validateUserForInvestment(user);

    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Perfil Incompleto",
        description: validation.errorMessage,
      });
      navigate({ to: '/profile/edit' });
      return;
    }

    // Se passar, abre modal
    setShowTermoModal(true);
  };

  // Opção 2: Usar componente Guard
  return (
    <InvestmentGuard
      user={user}
      onProfileIncomplete={() => navigate({ to: '/profile/edit' })}
    >
      <Button onClick={handleInvestClick}>
        Investir Agora
      </Button>
    </InvestmentGuard>
  );
}

// Opção 3: Hook programático
function AnotherComponent() {
  const user = getCurrentUser();
  const { canInvest, errorMessage } = useInvestmentValidation(user);

  if (!canInvest) {
    return <Alert>{errorMessage}</Alert>;
  }

  return <Button>Investir</Button>;
}
```

---

## 🔥 BÔNUS: Botão de Retry Manual (Admin)

### Para criar no painel Admin

```typescript
// /src/routes/admin/investments/index.tsx

import { Button } from '@/components/ui/button';

function AdminInvestmentsTable({ orders }) {
  const handleRetry = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/settlements/${orderId}/retry`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast({ title: "✅ Reenvio iniciado" });
      }
    } catch (error) {
      toast({ title: "❌ Falha no reenvio", variant: "destructive" });
    }
  };

  return (
    <Table>
      <TableBody>
        {orders.map(order => (
          <TableRow key={order.id}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{order.status}</TableCell>

            {/* 🚨 Botão de Retry para casos PAID sem TX */}
            {order.status === 'PAID' && !order.txHash && (
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRetry(order.id)}
                >
                  ⚠️ Reenviar Token
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Backend para Retry (criar se necessário)

```typescript
// /server/src/controllers/admin.controller.ts

export const retrySettlement = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  // Buscar pedido
  const order = await prisma.investmentOrder.findUnique({
    where: { id: orderId },
  });

  if (!order || order.status !== 'PAID') {
    return res.status(400).json({ error: 'Pedido não está em estado PAID' });
  }

  // Chamar settlementOrder novamente
  await settleInvestmentOrder(order.asaasPaymentId!);

  res.json({ success: true, message: 'Retry iniciado' });
};
```

---

## 📋 Checklist de Lançamento

### Backend
- [x] Endpoint de status criado (`/api/invest/orders/:id/status`)
- [x] Email service configurado (função `sendInvestmentReceipt`)
- [x] Email integrado no settlement flow
- [ ] **Variáveis SMTP configuradas no .env** ⚠️ VOCÊ PRECISA FAZER
- [ ] Testar email com curl/Postman

### Frontend
- [x] Hook de polling criado (`usePaymentPolling`)
- [x] Hook de investimento atualizado (`useInvest`)
- [x] Validação de CPF criada (`validation.ts`)
- [x] Componente Guard criado (`InvestmentGuard`)
- [ ] **Integrar polling no componente de QR Code** ⚠️ VOCÊ PRECISA FAZER
- [ ] **Integrar validação nos botões de investir** ⚠️ VOCÊ PRECISA FAZER

### Testes
- [ ] Fazer compra teste de R$ 1,00
- [ ] Verificar se QR Code atualiza sozinho após pagamento
- [ ] Verificar se email chega após confirmação
- [ ] Testar bloqueio de usuário sem CPF

---

## 🎯 Próximos Passos

1. **Configurar SMTP** (5 minutos)
   - Adicionar credenciais no `.env`
   - Testar com curl

2. **Integrar Polling** (10 minutos)
   - Adicionar `usePaymentPolling` no componente de QR Code
   - Mostrar status em tempo real

3. **Adicionar Validação** (10 minutos)
   - Usar `InvestmentGuard` nos botões de investir
   - Ou validar programaticamente antes de abrir modal

4. **Teste Real** (15 minutos)
   - Fazer compra de R$ 1,00
   - Ver se tudo funciona end-to-end

---

## 🆘 Troubleshooting

### Email não está chegando?
- Verifique as credenciais SMTP no `.env`
- Teste manualmente com `curl` ou Postman
- Veja logs do servidor: `tail -f server/logs/combined.log`

### Polling não atualiza?
- Abra DevTools > Network > veja se está fazendo requests a cada 3s
- Verifique se `pixData.orderId` está definido
- Veja console do navegador

### Validação não bloqueia?
- Verifique se objeto `user` tem CPF/telefone
- Console.log o resultado de `validateUserForInvestment(user)`

---

## 📞 Suporte

Se tiver dúvidas, me chame! Estou aqui para garantir que tudo funcione 100%.

**Vamos virar a chave e inaugurar! 🔥🏎️💨**
