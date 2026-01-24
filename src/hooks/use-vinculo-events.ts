/**
 * Vinculo.io - useVinculoEvents Hook
 *
 * Real-time blockchain event monitoring for the Vinculo Protocol.
 * Listens for PaymentReceived, RentalCreated, CollateralLocked events
 * and triggers UI updates via callbacks and toast notifications.
 *
 * Features:
 * - PaymentReceived: Split 85/5/5/5 executed
 * - RentalCreated: New NFT minted
 * - CollateralLocked: Guarantor property locked
 * - CollateralSeized: Default execution
 * - DisputeOpened/Resolved: Conflict management
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { toast } from 'sonner';
import { web3Config, getContractAddress, getNetworkConfig } from '@/lib/web3/config';
import type { PaymentReceivedEvent, RentalCreatedEvent, CollateralLockedEvent } from '@/lib/web3/vinculo-contract-abi';

// Event types for the hook
export interface VinculoEventLog {
  eventName: string;
  tokenId: bigint;
  data: Record<string, unknown>;
  timestamp: Date;
  transactionHash: string;
  blockNumber: number;
}

// Callback types
export interface VinculoEventCallbacks {
  onPaymentReceived?: (event: PaymentReceivedEvent, log: VinculoEventLog) => void;
  onRentalCreated?: (event: RentalCreatedEvent, log: VinculoEventLog) => void;
  onCollateralLocked?: (event: CollateralLockedEvent, log: VinculoEventLog) => void;
  onCollateralSeized?: (tokenId: bigint, guarantor: string, amount: bigint, log: VinculoEventLog) => void;
  onDisputeOpened?: (tokenId: bigint, initiator: string, reason: string, log: VinculoEventLog) => void;
  onDisputeResolved?: (tokenId: bigint, inFavorOfLandlord: boolean, log: VinculoEventLog) => void;
  onAnyEvent?: (log: VinculoEventLog) => void;
}

interface UseVinculoEventsOptions extends VinculoEventCallbacks {
  contractAddress?: string;
  showToasts?: boolean;
  enabled?: boolean;
}

interface UseVinculoEventsReturn {
  events: VinculoEventLog[];
  isListening: boolean;
  lastEvent: VinculoEventLog | null;
  error: string | null;
  clearEvents: () => void;
  totalPaymentsReceived: number;
  totalVolumeProcessed: bigint;
}

// Format BRL from wei/token units
function formatBrl(amount: bigint): string {
  const value = Number(amount) / 10000; // BRZ has 4 decimals
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Shorten address for display
function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function useVinculoEvents(options: UseVinculoEventsOptions = {}): UseVinculoEventsReturn {
  const {
    contractAddress,
    showToasts = true,
    enabled = true,
    onPaymentReceived,
    onRentalCreated,
    onCollateralLocked,
    onCollateralSeized,
    onDisputeOpened,
    onDisputeResolved,
    onAnyEvent,
  } = options;

  const [events, setEvents] = useState<VinculoEventLog[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [lastEvent, setLastEvent] = useState<VinculoEventLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalPaymentsReceived, setTotalPaymentsReceived] = useState(0);
  const [totalVolumeProcessed, setTotalVolumeProcessed] = useState<bigint>(BigInt(0));

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBlockRef = useRef<number>(0);

  const address = contractAddress || getContractAddress();
  const networkConfig = getNetworkConfig();

  // Add event to state
  const addEvent = useCallback((event: VinculoEventLog) => {
    setEvents(prev => [event, ...prev].slice(0, 100)); // Keep last 100 events
    setLastEvent(event);
    onAnyEvent?.(event);
  }, [onAnyEvent]);

  // Handle PaymentReceived event
  const handlePaymentReceived = useCallback((
    tokenId: bigint,
    payer: string,
    amount: bigint,
    landlordAmount: bigint,
    insurerAmount: bigint,
    platformAmount: bigint,
    guarantorAmount: bigint,
    txHash: string,
    blockNumber: number
  ) => {
    const eventData: PaymentReceivedEvent = {
      tokenId,
      payer,
      amount,
      landlordAmount,
      insurerAmount,
      platformAmount,
      guarantorAmount,
    };

    const log: VinculoEventLog = {
      eventName: 'PaymentReceived',
      tokenId,
      data: eventData as unknown as Record<string, unknown>,
      timestamp: new Date(),
      transactionHash: txHash,
      blockNumber,
    };

    addEvent(log);
    setTotalPaymentsReceived(prev => prev + 1);
    setTotalVolumeProcessed(prev => prev + amount);

    if (showToasts) {
      toast.success('Pagamento Confirmado!', {
        description: `Contrato #${tokenId.toString().slice(0, 8)}... - ${formatBrl(amount)}`,
        duration: 5000,
      });
    }

    onPaymentReceived?.(eventData, log);
    web3Config.log('PaymentReceived:', eventData);
  }, [addEvent, showToasts, onPaymentReceived]);

  // Handle RentalCreated event
  const handleRentalCreated = useCallback((
    tokenId: bigint,
    landlord: string,
    tenant: string,
    rentAmount: bigint,
    propertyId: string,
    txHash: string,
    blockNumber: number
  ) => {
    const eventData: RentalCreatedEvent = {
      tokenId,
      landlord,
      tenant,
      rentAmount,
      propertyId,
    };

    const log: VinculoEventLog = {
      eventName: 'RentalCreated',
      tokenId,
      data: eventData as unknown as Record<string, unknown>,
      timestamp: new Date(),
      transactionHash: txHash,
      blockNumber,
    };

    addEvent(log);

    if (showToasts) {
      toast.success('Novo Contrato NFT Criado!', {
        description: `Token #${tokenId.toString().slice(0, 8)}... - ${formatBrl(rentAmount)}/mes`,
        duration: 5000,
      });
    }

    onRentalCreated?.(eventData, log);
    web3Config.log('RentalCreated:', eventData);
  }, [addEvent, showToasts, onRentalCreated]);

  // Handle CollateralLocked event
  const handleCollateralLocked = useCallback((
    tokenId: bigint,
    guarantor: string,
    collateralPropertyId: string,
    value: bigint,
    txHash: string,
    blockNumber: number
  ) => {
    const eventData: CollateralLockedEvent = {
      tokenId,
      guarantor,
      collateralPropertyId,
      value,
    };

    const log: VinculoEventLog = {
      eventName: 'CollateralLocked',
      tokenId,
      data: eventData as unknown as Record<string, unknown>,
      timestamp: new Date(),
      transactionHash: txHash,
      blockNumber,
    };

    addEvent(log);

    if (showToasts) {
      toast.info('Garantia Bloqueada', {
        description: `Garantidor ${shortAddress(guarantor)} - ${formatBrl(value)}`,
        duration: 5000,
      });
    }

    onCollateralLocked?.(eventData, log);
    web3Config.log('CollateralLocked:', eventData);
  }, [addEvent, showToasts, onCollateralLocked]);

  // Handle CollateralSeized event
  const handleCollateralSeized = useCallback((
    tokenId: bigint,
    guarantor: string,
    amountClaimed: bigint,
    txHash: string,
    blockNumber: number
  ) => {
    const log: VinculoEventLog = {
      eventName: 'CollateralSeized',
      tokenId,
      data: { guarantor, amountClaimed },
      timestamp: new Date(),
      transactionHash: txHash,
      blockNumber,
    };

    addEvent(log);

    if (showToasts) {
      toast.warning('Garantia Executada!', {
        description: `Contrato #${tokenId.toString().slice(0, 8)}... - ${formatBrl(amountClaimed)}`,
        duration: 8000,
      });
    }

    onCollateralSeized?.(tokenId, guarantor, amountClaimed, log);
    web3Config.log('CollateralSeized:', { tokenId, guarantor, amountClaimed });
  }, [addEvent, showToasts, onCollateralSeized]);

  // Handle DisputeOpened event
  const handleDisputeOpened = useCallback((
    tokenId: bigint,
    initiator: string,
    reason: string,
    txHash: string,
    blockNumber: number
  ) => {
    const log: VinculoEventLog = {
      eventName: 'DisputeOpened',
      tokenId,
      data: { initiator, reason },
      timestamp: new Date(),
      transactionHash: txHash,
      blockNumber,
    };

    addEvent(log);

    if (showToasts) {
      toast.warning('Disputa Aberta', {
        description: `Contrato #${tokenId.toString().slice(0, 8)}... - ${reason.slice(0, 50)}...`,
        duration: 8000,
      });
    }

    onDisputeOpened?.(tokenId, initiator, reason, log);
    web3Config.log('DisputeOpened:', { tokenId, initiator, reason });
  }, [addEvent, showToasts, onDisputeOpened]);

  // Handle DisputeResolved event
  const handleDisputeResolved = useCallback((
    tokenId: bigint,
    inFavorOfLandlord: boolean,
    txHash: string,
    blockNumber: number
  ) => {
    const log: VinculoEventLog = {
      eventName: 'DisputeResolved',
      tokenId,
      data: { inFavorOfLandlord },
      timestamp: new Date(),
      transactionHash: txHash,
      blockNumber,
    };

    addEvent(log);

    if (showToasts) {
      toast.info('Disputa Resolvida', {
        description: `Contrato #${tokenId.toString().slice(0, 8)}... - Favor: ${inFavorOfLandlord ? 'Locador' : 'Locatario'}`,
        duration: 5000,
      });
    }

    onDisputeResolved?.(tokenId, inFavorOfLandlord, log);
    web3Config.log('DisputeResolved:', { tokenId, inFavorOfLandlord });
  }, [addEvent, showToasts, onDisputeResolved]);

  // Simulate events in demo mode
  const simulateDemoEvents = useCallback(() => {
    // Simulate a random event every 30-60 seconds
    const eventTypes = ['PaymentReceived', 'RentalCreated', 'CollateralLocked'];
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const fakeTokenId = BigInt(Math.floor(Math.random() * 1000000));
    const fakeAmount = BigInt(Math.floor(Math.random() * 50000000)); // Up to 5000 BRL
    const fakeTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const fakeBlockNumber = lastBlockRef.current + Math.floor(Math.random() * 10);
    lastBlockRef.current = fakeBlockNumber;

    switch (randomEvent) {
      case 'PaymentReceived':
        handlePaymentReceived(
          fakeTokenId,
          '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD99',
          fakeAmount,
          (fakeAmount * BigInt(85)) / BigInt(100),
          (fakeAmount * BigInt(5)) / BigInt(100),
          (fakeAmount * BigInt(5)) / BigInt(100),
          (fakeAmount * BigInt(5)) / BigInt(100),
          fakeTxHash,
          fakeBlockNumber
        );
        break;
      case 'RentalCreated':
        handleRentalCreated(
          fakeTokenId,
          '0x1234567890AbCdEf1234567890AbCdEf12345678',
          '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
          fakeAmount,
          `PROP-${Math.floor(Math.random() * 10000)}`,
          fakeTxHash,
          fakeBlockNumber
        );
        break;
      case 'CollateralLocked':
        handleCollateralLocked(
          fakeTokenId,
          '0x9876543210FeDcBa9876543210FeDcBa98765432',
          `PROP-${Math.floor(Math.random() * 10000)}`,
          fakeAmount * BigInt(10),
          fakeTxHash,
          fakeBlockNumber
        );
        break;
    }
  }, [handlePaymentReceived, handleRentalCreated, handleCollateralLocked]);

  // Start listening for events
  useEffect(() => {
    if (!enabled) {
      setIsListening(false);
      return;
    }

    // In demo mode, simulate events
    if (web3Config.isDemoMode) {
      setIsListening(true);
      web3Config.log('Starting demo event simulation for contract:', address);

      // Simulate an initial event after 5 seconds
      const initialTimeout = setTimeout(() => {
        simulateDemoEvents();
      }, 5000);

      // Then simulate events every 30-60 seconds
      pollingIntervalRef.current = setInterval(() => {
        if (Math.random() > 0.5) { // 50% chance of event
          simulateDemoEvents();
        }
      }, 30000);

      return () => {
        clearTimeout(initialTimeout);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setIsListening(false);
      };
    }

    // Production mode - would use ethers.js or viem to listen to real events
    // For now, we log that real event listening is not implemented
    web3Config.log('Real event listening requires ethers.js/viem integration');
    web3Config.log('Contract address:', address);
    web3Config.log('Network:', networkConfig.name);

    setIsListening(false);
    setError('Real-time event listening requires Web3 provider. Enable demo mode or connect wallet.');

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [enabled, address, networkConfig.name, simulateDemoEvents]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setLastEvent(null);
    setTotalPaymentsReceived(0);
    setTotalVolumeProcessed(BigInt(0));
  }, []);

  return {
    events,
    isListening,
    lastEvent,
    error,
    clearEvents,
    totalPaymentsReceived,
    totalVolumeProcessed,
  };
}

export default useVinculoEvents;
