// ============================================
// FINANCE ROUTES - Módulo Financeiro V2
// ============================================
import { Router } from 'express';
import { 
// Payables
createPayable, listPayables, payBill, updatePayable, deletePayable, 
// Receivables
createReceivable, listReceivables, receivePayment, updateReceivable, deleteReceivable, 
// Bank Accounts
createBankAccount, listBankAccounts, updateBankAccount, deleteBankAccount, 
// Dashboard
getFinancialSummary, } from '../controllers/finance.controller.js';
const router = Router();
// ============================================
// ACCOUNTS PAYABLE (Contas a Pagar)
// ============================================
// Create payable
router.post('/payables', createPayable);
// List payables
router.get('/payables', listPayables);
// Pay bill
router.put('/payables/:id/pay', payBill);
// Update payable
router.put('/payables/:id', updatePayable);
// Delete payable
router.delete('/payables/:id', deletePayable);
// ============================================
// ACCOUNTS RECEIVABLE (Contas a Receber)
// ============================================
// Create receivable
router.post('/receivables', createReceivable);
// List receivables
router.get('/receivables', listReceivables);
// Receive payment
router.put('/receivables/:id/receive', receivePayment);
// Update receivable
router.put('/receivables/:id', updateReceivable);
// Delete receivable
router.delete('/receivables/:id', deleteReceivable);
// ============================================
// BANK ACCOUNTS (Contas Bancárias)
// ============================================
// Create bank account
router.post('/bank-accounts', createBankAccount);
// List bank accounts
router.get('/bank-accounts', listBankAccounts);
// Update bank account
router.put('/bank-accounts/:id', updateBankAccount);
// Delete bank account
router.delete('/bank-accounts/:id', deleteBankAccount);
// ============================================
// DASHBOARD & SUMMARY
// ============================================
// Get financial summary
router.get('/summary', getFinancialSummary);
export default router;
//# sourceMappingURL=finance.js.map