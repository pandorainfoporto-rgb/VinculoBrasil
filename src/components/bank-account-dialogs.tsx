/**
 * Dialogos de Contas Bancarias
 * Componentes para criar, editar e visualizar contas bancarias
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, CheckCircle } from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard';

interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  agency: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  pixKey?: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  isPrimary: boolean;
  status: 'active' | 'inactive';
  balance: number;
}

interface BankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: BankAccount | null;
  onSave: (account: BankAccount | Omit<BankAccount, 'id' | 'balance'>) => void;
}

const BRAZILIAN_BANKS = [
  { code: '001', name: 'Banco do Brasil' },
  { code: '033', name: 'Santander' },
  { code: '104', name: 'Caixa Economica Federal' },
  { code: '237', name: 'Bradesco' },
  { code: '341', name: 'Itau' },
  { code: '260', name: 'Nubank' },
  { code: '077', name: 'Inter' },
  { code: '290', name: 'PagSeguro' },
  { code: '323', name: 'Mercado Pago' },
  { code: '380', name: 'PicPay' },
];

export function BankAccountDialog({ open, onOpenChange, account, onSave }: BankAccountDialogProps) {
  const isEdit = !!account;

  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [agency, setAgency] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [pixKey, setPixKey] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // Preencher formulario quando editar
  useEffect(() => {
    if (account) {
      setBankCode(account.bankCode);
      setBankName(account.bankName);
      setAgency(account.agency);
      setAccountNumber(account.accountNumber);
      setAccountType(account.accountType);
      setPixKey(account.pixKey || '');
      setIsPrimary(account.isPrimary);
    } else {
      // Limpar campos ao criar nova conta
      setBankCode('');
      setBankName('');
      setAgency('');
      setAccountNumber('');
      setAccountType('checking');
      setPixKey('');
      setIsPrimary(false);
    }
  }, [account, open]);

  const handleBankChange = (code: string) => {
    setBankCode(code);
    const bank = BRAZILIAN_BANKS.find(b => b.code === code);
    if (bank) {
      setBankName(bank.name);
    }
  };

  const handleCopyPix = async () => {
    if (pixKey) {
      const success = await copyToClipboard(pixKey);
      if (success) {
        setCopiedPix(true);
        setTimeout(() => setCopiedPix(false), 2000);
      }
    }
  };

  const handleSave = () => {
    if (!bankCode || !agency || !accountNumber) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const accountData = {
      ...(isEdit ? { id: account.id, balance: account.balance, status: account.status } : { status: 'active' as const }),
      bankName,
      bankCode,
      agency,
      accountNumber,
      accountType,
      pixKey: pixKey || undefined,
      isPrimary,
    };

    onSave(accountData as any);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as informações da conta bancária' : 'Adicione uma nova conta bancária para recebimentos'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Banco */}
          <div className="grid gap-2">
            <Label htmlFor="bank">Banco *</Label>
            <Select value={bankCode} onValueChange={handleBankChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o banco" />
              </SelectTrigger>
              <SelectContent>
                {BRAZILIAN_BANKS.map(bank => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.code} - {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agencia e Conta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="agency">Agência *</Label>
              <Input
                id="agency"
                placeholder="0001"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                maxLength={6}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account">Conta *</Label>
              <Input
                id="account"
                placeholder="12345-6"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Tipo de Conta */}
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo de Conta</Label>
            <Select value={accountType} onValueChange={(v) => setAccountType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Conta Poupança</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chave PIX */}
          <div className="grid gap-2">
            <Label htmlFor="pix">Chave PIX (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="pix"
                placeholder="email@exemplo.com, CPF, telefone ou chave aleatória"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
              />
              {pixKey && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPix}
                >
                  {copiedPix ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Conta Principal */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="primary">Conta Principal</Label>
              <p className="text-xs text-muted-foreground">
                Define esta conta como padrão para recebimentos
              </p>
            </div>
            <Switch
              id="primary"
              checked={isPrimary}
              onCheckedChange={setIsPrimary}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? 'Salvar Alterações' : 'Adicionar Conta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
