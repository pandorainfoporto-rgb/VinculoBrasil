/**
 * Vinculo.io - useCreateRental Hook
 *
 * Hook for creating/minting a new rental contract NFT on the blockchain.
 * This mints the ERC-721 token representing the rental agreement.
 */

import { useState, useCallback } from 'react';
import type { TransactionStatus, TransactionResult, CreateRentalParams } from '@/lib/web3/types';

interface UseCreateRentalReturn {
  // Transaction state
  status: TransactionStatus;
  transactionHash: string | null;
  tokenId: string | null;
  metadataUri: string | null;
  error: string | null;

  // Actions
  createRental: (params: CreateRentalParams) => Promise<TransactionResult | null>;
  reset: () => void;

  // UI helpers
  isPending: boolean;
  isSuccess: boolean;
  statusMessage: string;
  estimatedGas: string;
}

// Generate realistic-looking hashes
function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function generateTokenId(): string {
  return BigInt(Math.floor(Math.random() * 1e18)).toString();
}

function generateIpfsUri(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let cid = 'QmVinculo';
  for (let i = 0; i < 32; i++) {
    cid += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ipfs://${cid}`;
}

export function useCreateRental(): UseCreateRentalReturn {
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [metadataUri, setMetadataUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const estimatedGas = '0.0089 MATIC'; // Higher gas for contract creation

  const createRental = useCallback(
    async (params: CreateRentalParams): Promise<TransactionResult | null> => {
      // Validate required addresses
      if (!params.tenantAddress || !params.insurerAddress) {
        const errMsg = 'Enderecos de inquilino e seguradora sao obrigatorios';
        setError(errMsg);
        return null;
      }

      try {
        // Step 1: Waiting for wallet signature
        setStatus('pending_signature');
        setError(null);

        // Simulate IPFS upload for metadata (1-2 seconds)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 1000)
        );
        const ipfsUri = generateIpfsUri();
        setMetadataUri(ipfsUri);

        // Simulate user reviewing transaction in wallet
        await new Promise((resolve) =>
          setTimeout(resolve, 1500 + Math.random() * 2000)
        );

        // Simulate possible rejection
        if (Math.random() < 0.05) {
          throw new Error('Transacao rejeitada pelo usuario');
        }

        // Step 2: Transaction sent, waiting for confirmation
        setStatus('pending_confirmation');
        const txHash = generateTxHash();
        setTransactionHash(txHash);

        // Simulate blockchain confirmation (longer for contract creation)
        await new Promise((resolve) =>
          setTimeout(resolve, 3000 + Math.random() * 4000)
        );

        // Simulate possible transaction failure
        if (Math.random() < 0.03) {
          throw new Error('Mintagem falhou: Verifique o saldo de gas');
        }

        // Success - NFT minted!
        const newTokenId = generateTokenId();
        setTokenId(newTokenId);
        setStatus('success');

        const result: TransactionResult = {
          success: true,
          transactionHash: txHash,
          blockNumber: Math.floor(Math.random() * 1000000) + 50000000,
          gasUsed: '0.00743 MATIC',
        };

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        setStatus('error');
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setTransactionHash(null);
    setTokenId(null);
    setMetadataUri(null);
    setError(null);
  }, []);

  // Status message for UI
  const statusMessage = (() => {
    switch (status) {
      case 'idle':
        return 'Pronto para criar contrato';
      case 'pending_signature':
        return 'Enviando metadados para IPFS e aguardando assinatura...';
      case 'pending_confirmation':
        return 'Mintando NFT do contrato na blockchain...';
      case 'success':
        return `Contrato NFT criado! Token ID: ${tokenId?.slice(0, 8)}...`;
      case 'error':
        return error || 'Erro ao criar contrato';
      default:
        return '';
    }
  })();

  return {
    status,
    transactionHash,
    tokenId,
    metadataUri,
    error,
    createRental,
    reset,
    isPending: status === 'pending_signature' || status === 'pending_confirmation',
    isSuccess: status === 'success',
    statusMessage,
    estimatedGas,
  };
}
