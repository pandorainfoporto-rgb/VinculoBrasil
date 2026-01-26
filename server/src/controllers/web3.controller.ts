import { Request, Response } from 'express';
import { web3Service } from '../services/web3.service';

export const web3Controller = {
    mintLease: async (req: Request, res: Response) => {
        try {
            const leaseId = typeof req.params.leaseId === 'string' ? req.params.leaseId : '';
            if (!leaseId) {
                return res.status(400).json({ error: 'Invalid lease ID' });
            }
            const { ownerWallet } = req.body;

            const result = await web3Service.mintLeaseToken(leaseId, ownerWallet);
            return res.json(result);
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                error: error.message || 'Failed to mint lease token'
            });
        }
    },

    getStatus: async (req: Request, res: Response) => {
        try {
            const leaseId = typeof req.params.leaseId === 'string' ? req.params.leaseId : '';
            if (!leaseId) {
                return res.status(400).json({ error: 'Invalid lease ID' });
            }
            const status = await web3Service.getLeaseBlockchainStatus(leaseId);
            return res.json(status);
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                error: error.message || 'Failed to get blockchain status'
            });
        }
    },

    getExplorerUrl: async (req: Request, res: Response) => {
        try {
            const hash = typeof req.params.hash === 'string' ? req.params.hash : '';
            if (!hash) {
                return res.status(400).json({ error: 'Invalid hash' });
            }
            const result = web3Service.getExplorerUrl(hash);
            return res.json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to get explorer URL' });
        }
    }
};
