import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const web3Controller = {
    // Simulação de Minting (Mock) para garantir que o servidor suba sem erros de dependência
    mintLease: async (req: Request, res: Response) => {
        const { leaseId } = req.params;
        try {
            // Atualiza o status no banco simulando sucesso na blockchain
            const lease = await prisma.lease.update({
                where: { id: leaseId },
                data: {
                    onChainStatus: 'MINTED',
                    smartContractAddress: '0xMOCK_POLYGON_ADDRESS_' + Date.now(),
                    tokenId: `VBRZ-${leaseId.substring(0, 4)}`
                }
            });

            return res.json({
                success: true,
                message: "Token minted successfully (MOCK)",
                data: lease
            });
        } catch (error) {
            console.error("Mint error:", error);
            return res.status(500).json({ error: 'Erro ao tokenizar contrato' });
        }
    },

    getStatus: async (req: Request, res: Response) => {
        const { leaseId } = req.params;
        try {
            const lease = await prisma.lease.findUnique({
                where: { id: leaseId },
                select: { onChainStatus: true, smartContractAddress: true, tokenId: true }
            });

            if (!lease) return res.status(404).json({ error: 'Contrato não encontrado' });

            return res.json({
                status: lease.onChainStatus,
                explorerUrl: lease.smartContractAddress ? `https://polygonscan.com/address/${lease.smartContractAddress}` : null
            });
        } catch (error) {
            console.error("Get status error:", error);
            return res.status(500).json({ error: 'Erro ao buscar status' });
        }
    },

    getExplorerUrl: async (req: Request, res: Response) => {
        const { hash } = req.params;
        return res.json({
            url: `https://polygonscan.com/tx/${hash}`
        });
    }
};
